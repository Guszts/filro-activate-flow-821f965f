import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) return new Response("Missing config", { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("No signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Idempotency: skip if already processed
  const { data: existing } = await admin
    .from("events")
    .select("id")
    .eq("event_type", `stripe:${event.id}`)
    .maybeSingle();
  if (existing) return new Response("ok", { status: 200 });

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const userId = pi.metadata?.user_id ?? null;
      const planId = pi.metadata?.plan_id ?? null;

      await admin
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          failure_reason: null,
        })
        .eq("stripe_payment_intent_id", pi.id);

      // Create or upsert project for the user
      if (userId && planId) {
        const { data: existingProject } = await admin
          .from("projects")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (!existingProject) {
          await admin.from("projects").insert({
            user_id: userId,
            plan_id: planId,
            project_status: "waiting_info",
          });
        } else {
          await admin
            .from("projects")
            .update({ plan_id: planId, project_status: "waiting_info" })
            .eq("id", existingProject.id);
        }
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await admin
        .from("payments")
        .update({
          status: "failed",
          failure_reason: pi.last_payment_error?.message ?? "Pagamento falhou",
        })
        .eq("stripe_payment_intent_id", pi.id);
    } else if (event.type === "payment_intent.canceled") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await admin
        .from("payments")
        .update({ status: "cancelled" })
        .eq("stripe_payment_intent_id", pi.id);
    }

    await admin.from("events").insert({
      event_type: `stripe:${event.id}`,
      event_data: { type: event.type },
    });

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    return new Response("error", { status: 500 });
  }
});
