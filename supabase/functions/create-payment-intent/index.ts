import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY ausente");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Sem autorização");
    const token = authHeader.replace("Bearer ", "");

    // Auth client (validates user)
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
    );
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Usuário não autenticado");
    const user = userData.user;

    const body = await req.json();
    const planSlug: string = body.planSlug;
    if (!planSlug) throw new Error("planSlug obrigatório");

    // Service-role client for trusted reads/writes
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: plan, error: planErr } = await admin
      .from("plans")
      .select("*")
      .eq("slug", planSlug)
      .eq("active", true)
      .maybeSingle();
    if (planErr || !plan) throw new Error("Plano não encontrado");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = existing.data[0]?.id;
    if (!customerId) {
      const created = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = created.id;
    }

    const intent = await stripe.paymentIntents.create({
      amount: plan.activation_price,
      currency: "brl",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
        plan_name: plan.name,
        email: user.email,
      },
    });

    // Insert payment row (or update existing pending one for same intent)
    await admin.from("payments").insert({
      user_id: user.id,
      plan_id: plan.id,
      stripe_customer_id: customerId,
      stripe_payment_intent_id: intent.id,
      amount: plan.activation_price,
      currency: "brl",
      status: "pending",
    });

    await admin.from("events").insert({
      user_id: user.id,
      event_type: "payment_intent_created",
      event_data: { plan_slug: plan.slug, intent_id: intent.id },
    });

    return new Response(
      JSON.stringify({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: plan.activation_price,
        planName: plan.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[create-payment-intent]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
