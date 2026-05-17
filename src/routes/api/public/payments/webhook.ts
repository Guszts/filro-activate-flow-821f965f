import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, getWebhookSecret, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailServer, getAdminEmails } from "@/lib/email/send.server";
import type Stripe from "stripe";

const PANEL_URL = "https://filro.app/painel";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(iso));
}

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

        // Idempotência: se este event.id já foi gravado, descarta.
        const { error: dupeErr } = await supabaseAdmin
          .from("webhook_events")
          .insert({ event_id: event.id, event_type: event.type, environment: env });
        if (dupeErr) {
          if ((dupeErr as { code?: string }).code === "23505") {
            console.log("[webhook] duplicate event, skipping", event.id);
            return new Response("ok", { status: 200 });
          }
          console.error("[webhook] failed to record event", dupeErr);
        }

        try {
          await handleEvent(event, env);
        } catch (err) {
          console.error("[webhook] handler error", { type: event.type, err });
          // Remove o registro para permitir retry do Stripe
          await supabaseAdmin.from("webhook_events").delete().eq("event_id", event.id);
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
      const kind = session.metadata?.kind;
      const extraChargeId = session.metadata?.extraChargeId;

      // Cobrança extra (upsell via payment link)
      if (kind === "extra_charge" && extraChargeId) {
        await supabaseAdmin
          .from("extra_charges")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          })
          .eq("id", extraChargeId);
        await logEvent("extra_charge.paid", userId ?? null, { extraChargeId, sessionId: session.id });
        break;
      }

      if (!userId || !planSlug) break;

      const plan = await getPlanBySlug(planSlug);
      if (!plan) break;

      // Re-fetch the session with discounts/promotion_code expanded so we
      // can capture coupon usage. Cheap, idempotent, and the webhook payload
      // does NOT include the promotion_code object by default.
      let expandedSession: Stripe.Checkout.Session = session;
      try {
        expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["total_details.breakdown.discounts", "discounts.promotion_code"],
        });
      } catch (e) {
        console.warn("[webhook] could not expand session for discount info", e);
      }

      const fullActivation = plan.activation_price ?? 0;
      const fullMonthly = plan.monthly_price ?? 0;
      const planTotal = fullActivation + fullMonthly;
      const amountPaid = typeof expandedSession.amount_total === "number"
        ? expandedSession.amount_total
        : planTotal;
      const amountSubtotal = typeof expandedSession.amount_subtotal === "number"
        ? expandedSession.amount_subtotal
        : planTotal;
      const discountAmount = Math.max(0, amountSubtotal - amountPaid);
      let promoCode: string | null = null;
      const sessionDiscounts = (expandedSession as any).discounts as Array<{
        promotion_code?: string | { id?: string; code?: string } | null;
      }> | undefined;
      if (sessionDiscounts?.length) {
        const promo = sessionDiscounts[0].promotion_code;
        if (typeof promo === "object" && promo?.code) promoCode = promo.code;
      }

      // Record initial payment (activation + first month). Idempotente
      // via unique stripe_checkout_session_id — se a Stripe reenviar o
      // mesmo checkout.session.completed, reaproveitamos o pagamento já
      // gravado em vez de duplicar e de re-criar admin_task.
      let paymentId: string | null = null;
      let isDuplicateSession = false;
      const sessionAmount = amountPaid > 0 ? amountPaid : planTotal;
      const { data: paymentRow, error: paymentErr } = await supabaseAdmin
        .from("payments")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          amount: sessionAmount,
          currency: (session.currency ?? "brl").toLowerCase(),
          status: "paid",
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          stripe_checkout_session_id: session.id,
          paid_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle();
      if (paymentErr && (paymentErr as { code?: string }).code === "23505") {
        isDuplicateSession = true;
        const { data: existingPayment } = await supabaseAdmin
          .from("payments")
          .select("id")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();
        paymentId = existingPayment?.id ?? null;
        console.log("[webhook] duplicate checkout session, reusing payment", session.id);
      } else if (paymentErr) {
        console.error("[webhook] payment insert failed", paymentErr);
      } else {
        paymentId = paymentRow?.id ?? null;
      }

      if (isDuplicateSession) {
        await logEvent("checkout.session.completed.duplicate", userId, { sessionId: session.id });
        break;
      }

      // Mark project payment_confirmed (or create one). This status maps to
      // the "Pagamento confirmado" column in the admin Kanban.
      const { data: existing } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      let projectId = existing?.id ?? null;
      if (existing) {
        await supabaseAdmin.from("projects").update({ plan_id: plan.id, project_status: "payment_confirmed" }).eq("id", existing.id);
      } else {
        const { data: created } = await supabaseAdmin
          .from("projects")
          .insert({ user_id: userId, plan_id: plan.id, project_status: "payment_confirmed" })
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

      // Welcome email to customer
      if (profile?.email) {
        await sendTransactionalEmailServer({
          templateName: "welcome-purchase",
          recipientEmail: profile.email,
          idempotencyKey: `welcome-${session.id}`,
          templateData: {
            name: profile.name || undefined,
            planName: plan.name,
            businessName: profile.business_name || undefined,
            panelUrl: PANEL_URL,
          },
        }).catch((e) => console.error("[email] welcome failed", e));
      }

      // Order confirmation (with order ID = payment row id)
      if (profile?.email && paymentId) {
        const activation = plan.activation_price ?? 0;
        const monthly = plan.monthly_price ?? 0;
        await sendTransactionalEmailServer({
          templateName: "order-confirmation",
          recipientEmail: profile.email,
          idempotencyKey: `order-${paymentId}`,
          templateData: {
            name: profile.name || undefined,
            orderId: paymentId.slice(0, 8),
            planName: plan.name,
            activationAmount: activation ? formatBRL(activation) : undefined,
            monthlyAmount: monthly ? formatBRL(monthly) : undefined,
            totalAmount: formatBRL(activation + monthly),
            panelUrl: PANEL_URL,
          },
        }).catch((e) => console.error("[email] order-confirmation failed", e));
      }

      // Admin notification
      const totalAmount = (plan.activation_price ?? 0) + (plan.monthly_price ?? 0);
      const admins = await getAdminEmails().catch(() => [] as string[]);
      for (const adminEmail of admins) {
        await sendTransactionalEmailServer({
          templateName: "sale-notification",
          recipientEmail: adminEmail,
          idempotencyKey: `sale-${session.id}-${adminEmail}`,
          templateData: {
            customerName: profile?.name,
            customerEmail: profile?.email,
            customerWhatsapp: profile?.whatsapp,
            businessName: profile?.business_name,
            planName: plan.name,
            amount: formatBRL(totalAmount),
            sessionId: session.id,
          },
        }).catch((e) => console.error("[email] sale-notification failed", e));
      }

      // -------- Comissão de parceiro (B2B privado) --------
      try {
        const partnerId = session.metadata?.partnerId;
        const partnerCode = session.metadata?.partnerCode;
        if (partnerId && partnerCode) {
          const { data: partner } = await supabaseAdmin
            .from("partners")
            .select("id, commission_rate, status")
            .eq("id", partnerId)
            .eq("status", "active")
            .maybeSingle();

          if (partner) {
            // Snapshot da taxa: prioriza o valor congelado na criação do checkout
            const metaRate = Number(session.metadata?.commissionRate);
            const rate = Number.isFinite(metaRate) && metaRate > 0
              ? metaRate
              : Number(partner.commission_rate ?? 50);
            const activationAmount = plan.activation_price ?? 0;
            const monthlyAmount = plan.monthly_price ?? 0;
            const baseAmount = activationAmount;
            const commissionAmount = Math.round((baseAmount * rate) / 100);

            // Upsert referral → paid
            const { data: referralRow } = await supabaseAdmin
              .from("partner_referrals")
              .upsert(
                {
                  partner_id: partner.id,
                  partner_code: partnerCode,
                  user_id: userId,
                  plan_id: plan.id,
                  client_name: profile?.name ?? null,
                  client_email: profile?.email ?? null,
                  client_whatsapp: profile?.whatsapp ?? null,
                  stripe_checkout_session_id: session.id,
                  stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
                  status: "paid",
                  converted_at: new Date().toISOString(),
                },
                { onConflict: "stripe_checkout_session_id" },
              )
              .select("id")
              .maybeSingle();

            // Insert commission (idempotente via unique stripe_checkout_session_id)
            const { error: cErr } = await supabaseAdmin.from("partner_commissions").insert({
              partner_id: partner.id,
              referral_id: referralRow?.id ?? null,
              user_id: userId,
              plan_id: plan.id,
              payment_id: paymentId,
              stripe_checkout_session_id: session.id,
              activation_amount: activationAmount,
              monthly_amount: monthlyAmount,
              base_amount: baseAmount,
              commission_rate: rate,
              commission_amount: commissionAmount,
              status: "pending",
              available_at: new Date().toISOString(),
            });
            if (cErr && (cErr as { code?: string }).code !== "23505") {
              console.error("[webhook] commission insert failed", cErr);
            } else if (!cErr) {
              await logEvent("partner.commission_created", userId, {
                partnerId: partner.id,
                partnerCode,
                sessionId: session.id,
                commissionAmount,
              });
            }
          }
        }
      } catch (e) {
        console.error("[webhook] partner commission flow failed", e);
      }

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
      const endsAtIso = tsToISO((sub as any).current_period_end) ?? null;
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
        await supabaseAdmin.from("projects").update({ project_status: "new" }).eq("user_id", userId);

        const { data: profile } = await supabaseAdmin
          .from("profiles").select("name, email").eq("user_id", userId).maybeSingle();
        const plan = await getPlanBySlug(sub.metadata?.planSlug);

        // Notify admin: close user's site + revoke access
        const { data: proj } = await supabaseAdmin
          .from("projects").select("id, plan_id, business_name").eq("user_id", userId).maybeSingle();
        await supabaseAdmin.from("admin_tasks").insert({
          user_id: userId,
          project_id: proj?.id ?? null,
          plan_id: proj?.plan_id ?? null,
          title: `Encerrar site cancelado — ${proj?.business_name ?? profile?.name ?? profile?.email ?? userId}`,
          description: `Assinatura encerrada em ${formatDate(endsAtIso) ?? "—"}. Tirar o site do ar, revogar acessos e arquivar o projeto. E-mail do cliente: ${profile?.email ?? "—"}.`,
          status: "pending",
        });

        if (profile?.email) {
          await sendTransactionalEmailServer({
            templateName: "subscription-canceled",
            recipientEmail: profile.email,
            idempotencyKey: `cancel-${sub.id}`,
            templateData: {
              name: profile.name,
              planName: plan?.name,
              endsAt: formatDate(endsAtIso),
              panelUrl: PANEL_URL,
            },
          }).catch((e) => console.error("[email] cancel failed", e));
        }
      }
      await logEvent("customer.subscription.deleted", userId ?? null, { id: sub.id });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription;
        billing_reason?: string;
      };
      // Evita duplicação: a fatura inicial (subscription_create) já foi
      // registrada em checkout.session.completed.
      if (invoice.billing_reason === "subscription_create") {
        await logEvent("invoice.payment_succeeded.skipped_initial", null, { invoiceId: invoice.id });
        break;
      }
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
      const obj = event.data.object as { id?: string; metadata?: { userId?: string }; subscription?: string };
      const userId = obj.metadata?.userId ?? null;

      // Try to find the user via subscription if not in metadata
      let resolvedUserId = userId;
      let planName: string | undefined;
      if (!resolvedUserId && obj.subscription) {
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, plan_id, plans:plans(name)")
          .eq("stripe_subscription_id", obj.subscription)
          .maybeSingle();
        resolvedUserId = (sub as any)?.user_id ?? null;
        planName = (sub as any)?.plans?.name;
      }
      if (resolvedUserId) {
        const { data: profile } = await supabaseAdmin
          .from("profiles").select("name, email").eq("user_id", resolvedUserId).maybeSingle();
        if (profile?.email) {
          await sendTransactionalEmailServer({
            templateName: "payment-failed",
            recipientEmail: profile.email,
            idempotencyKey: `pay-failed-${obj.id}`,
            templateData: { name: profile.name, planName, portalUrl: PANEL_URL },
          }).catch((e) => console.error("[email] payment-failed failed", e));
        }
      }
      await logEvent(event.type, resolvedUserId, { id: obj.id });
      break;
    }

    default:
      break;
  }
}
