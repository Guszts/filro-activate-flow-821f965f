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
          console.error("Webhook signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          await handleEvent(event);
        } catch (err) {
          console.error("Webhook handler error", err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planSlug = session.metadata?.planSlug;
      if (!userId || !planSlug) break;

      const { data: plan } = await supabaseAdmin
        .from("plans")
        .select("id, activation_price, monthly_price")
        .eq("slug", planSlug)
        .maybeSingle();
      if (!plan) break;

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

      // Upsert project for the user with this plan
      const { data: existing } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) {
        await supabaseAdmin.from("projects").update({ plan_id: plan.id, project_status: "paid" }).eq("id", existing.id);
      } else {
        await supabaseAdmin.from("projects").insert({ user_id: userId, plan_id: plan.id, project_status: "paid" });
      }

      await supabaseAdmin.from("events").insert({
        event_type: "checkout.session.completed",
        user_id: userId,
        event_data: { planSlug, sessionId: session.id },
      });
      break;
    }
    case "invoice.payment_failed":
    case "checkout.session.async_payment_failed": {
      const obj = event.data.object as { metadata?: { userId?: string } };
      const userId = obj.metadata?.userId ?? null;
      await supabaseAdmin.from("events").insert({
        event_type: event.type,
        user_id: userId,
        event_data: { id: (obj as { id?: string }).id },
      });
      break;
    }
    default:
      break;
  }
}
