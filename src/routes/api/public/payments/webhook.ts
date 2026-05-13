import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, getWebhookSecret, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type Stripe from "stripe";

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const envParam = url.searchParams.get("env");
        const env: StripeEnv = envParam === "live" ? "live" : "sandbox";

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        const stripe = createStripeClient(env);

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, signature, getWebhookSecret(env));
        } catch (err) {
          console.error("[webhook] signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          await handleEvent(event, env);
        } catch (err) {
          console.error("[webhook] handler error", { type: event.type, err });
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

function tsToISO(ts: number | null | undefined): string | null {
  return typeof ts === "number" ? new Date(ts * 1000).toISOString() : null;
}

async function getPlanBySlug(slug: string | null | undefined) {
  if (!slug) return null;
  const normalized = slug.replace(/^plan_/, "");
  const { data } = await supabaseAdmin
    .from("plans")
    .select("id, name, activation_price, monthly_price")
    .eq("slug", normalized)
    .maybeSingle();
  return data;
}

async function logEvent(eventType: string, userId: string | null, data: Record<string, unknown>) {
  await supabaseAdmin.from("events").insert({ event_type: eventType, user_id: userId, event_data: data as never });
}

async function upsertSubscription(sub: Stripe.Subscription, env: StripeEnv) {
  const userId = sub.metadata?.userId ?? null;
  const planSlug = sub.metadata?.planSlug ?? null;
  if (!userId) {
    console.warn("[webhook] subscription without userId metadata", { id: sub.id });
    return;
  }
  const plan = await getPlanBySlug(planSlug);

  const item = sub.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || (item?.price?.metadata?.lovable_external_id as string | undefined)
    || item?.price?.id
    || null;

  // Basil API: period fields can live on the item OR the subscription.
  const periodStart = (item as { current_period_start?: number } | undefined)?.current_period_start
    ?? (sub as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (item as { current_period_end?: number } | undefined)?.current_period_end
    ?? (sub as unknown as { current_period_end?: number }).current_period_end;

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: plan?.id ?? null,
      stripe_subscription_id: sub.id,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      price_id: priceId,
      status: sub.status,
      current_period_start: tsToISO(periodStart),
      current_period_end: tsToISO(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      canceled_at: tsToISO(sub.canceled_at),
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleEvent(event: Stripe.Event, env: StripeEnv) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planSlug = session.metadata?.planSlug;
      if (!userId || !planSlug) break;

      const plan = await getPlanBySlug(planSlug);
      if (!plan) break;

      // Record initial payment (activation + first month).
      await supabaseAdmin.from("payments").insert({
        user_id: userId,
        plan_id: plan.id,
        amount: (plan.activation_price ?? 0) + (plan.monthly_price ?? 0),
        currency: (session.currency ?? "brl").toLowerCase(),
        status: "paid",
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        paid_at: new Date().toISOString(),
      });

      // Mark project paid (or create one).
      const { data: existing } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      let projectId = existing?.id ?? null;
      if (existing) {
        await supabaseAdmin.from("projects").update({ plan_id: plan.id, project_status: "paid" }).eq("id", existing.id);
      } else {
        const { data: created } = await supabaseAdmin
          .from("projects")
          .insert({ user_id: userId, plan_id: plan.id, project_status: "paid" })
          .select("id")
          .maybeSingle();
        projectId = created?.id ?? null;
      }

      // Create admin task for production.
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("name, email, business_name, whatsapp")
        .eq("user_id", userId)
        .maybeSingle();

      await supabaseAdmin.from("admin_tasks").insert({
        user_id: userId,
        project_id: projectId,
        plan_id: plan.id,
        title: `Novo pedido — ${plan.name} — ${profile?.business_name || profile?.name || profile?.email || userId}`,
        description: [
          `Cliente: ${profile?.name || "—"} (${profile?.email || "—"})`,
          `WhatsApp: ${profile?.whatsapp || "—"}`,
          `Negócio: ${profile?.business_name || "—"}`,
          `Plano: ${plan.name}`,
          `Stripe session: ${session.id}`,
        ].join("\n"),
      });

      await logEvent("checkout.session.completed", userId, { planSlug, sessionId: session.id });
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscription(sub, env);
      await logEvent(event.type, sub.metadata?.userId ?? null, { id: sub.id, status: sub.status, cancel_at_period_end: sub.cancel_at_period_end });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: tsToISO(sub.canceled_at) ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id)
        .eq("environment", env);

      const userId = sub.metadata?.userId;
      if (userId) {
        await supabaseAdmin
          .from("projects")
          .update({ project_status: "new" })
          .eq("user_id", userId);
      }
      await logEvent("customer.subscription.deleted", userId ?? null, { id: sub.id });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
      const subId = typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;
      const userIdMeta = invoice.metadata?.userId ?? null;

      const { data: sub } = subId
        ? await supabaseAdmin
            .from("subscriptions")
            .select("user_id, plan_id")
            .eq("stripe_subscription_id", subId)
            .maybeSingle()
        : { data: null };

      const userId = sub?.user_id ?? userIdMeta;
      if (userId && sub?.plan_id) {
        await supabaseAdmin.from("payments").insert({
          user_id: userId,
          plan_id: sub.plan_id,
          amount: invoice.amount_paid ?? 0,
          currency: (invoice.currency ?? "brl").toLowerCase(),
          status: "paid",
          stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : null,
          paid_at: new Date().toISOString(),
        });
      }
      await logEvent("invoice.payment_succeeded", userId, { invoiceId: invoice.id, subId });
      break;
    }

    case "invoice.payment_failed":
    case "checkout.session.async_payment_failed": {
      const obj = event.data.object as { id?: string; metadata?: { userId?: string } };
      await logEvent(event.type, obj.metadata?.userId ?? null, { id: obj.id });
      break;
    }

    default:
      break;
  }
}
