import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import type Stripe from "stripe";

const ALLOWED_RETURN_HOSTS = new Set([
  "setup.filro.site",
  "filro.site",
  "www.filro.site",
  "filro-activate-flow.lovable.app",
  "id-preview--dda9f651-8d6f-45c8-92a8-0cf8f17a35cf.lovable.app",
  "localhost",
  "127.0.0.1",
]);

function validateReturnOrigin(origin: string): string {
  let parsed: URL;
  try { parsed = new URL(origin); } catch { throw new Error("Origem de retorno inválida"); }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    throw new Error("Protocolo inválido");
  }
  if (!ALLOWED_RETURN_HOSTS.has(parsed.hostname)) throw new Error("Origem não permitida");
  return parsed.origin;
}

async function resolveCustomer(stripe: ReturnType<typeof createStripeClient>, userId: string, email?: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) throw new Error("userId inválido");
  const found = await stripe.customers.search({ query: `metadata['userId']:'${userId}'`, limit: 1 });
  if (found.data.length) return found.data[0].id;
  if (email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length) {
      const c = existing.data[0];
      if (c.metadata?.userId !== userId) {
        await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId } });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({ ...(email && { email }), metadata: { userId } });
  return created.id;
}

async function ensurePrice(
  stripe: ReturnType<typeof createStripeClient>,
  opts: {
    lookupKey: string;
    productId: string;
    productName: string;
    amount: number;
    currency: string;
    recurring?: Stripe.PriceCreateParams.Recurring;
  },
): Promise<Stripe.Price> {
  const existing = await stripe.prices.list({ lookup_keys: [opts.lookupKey], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0];

  // Ensure product exists
  try {
    await stripe.products.retrieve(opts.productId);
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode !== 404) throw err;
    await stripe.products.create({
      id: opts.productId,
      name: opts.productName,
      tax_code: "txcd_10103001",
      metadata: { lovable_external_id: opts.productId },
    });
  }

  return stripe.prices.create({
    currency: opts.currency,
    unit_amount: opts.amount,
    product: opts.productId,
    lookup_key: opts.lookupKey,
    transfer_lookup_key: true,
    ...(opts.recurring && { recurring: opts.recurring }),
    metadata: { lovable_external_id: opts.lookupKey },
  });
}

/** Checkout para assinatura mensal de plano dev (recarrega créditos a cada renovação). */
export const createDevPlanCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { planSlug: string; returnOrigin: string; environment: StripeEnv }) => {
    if (!/^[a-z_]+$/.test(data.planSlug)) throw new Error("planSlug inválido");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("ambiente inválido");
    return { ...data, returnOrigin: validateReturnOrigin(data.returnOrigin) };
  })
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser?.user?.email ?? undefined;

    try {
      const { data: plan, error } = await supabaseAdmin
        .from("dev_plans")
        .select("id, slug, name, monthly_price, monthly_credits, stripe_monthly_price_lookup_key, currency")
        .eq("slug", data.planSlug as never)
        .eq("active", true)
        .maybeSingle();
      if (error || !plan) throw new Error("Plano não encontrado");

      const stripe = createStripeClient(data.environment);
      const lookupKey = plan.stripe_monthly_price_lookup_key || `devplan_${plan.slug}_monthly`;
      const price = await ensurePrice(stripe, {
        lookupKey,
        productId: `devplan_${plan.slug}`,
        productName: `Filro Dev — ${plan.name}`,
        amount: plan.monthly_price,
        currency: plan.currency || "brl",
        recurring: { interval: "month" },
      });

      const customerId = await resolveCustomer(stripe, userId, email);
      const meta = {
        userId,
        kind: "dev_plan",
        planSlug: plan.slug,
        planId: plan.id,
        monthlyCredits: String(plan.monthly_credits),
      };

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: `${data.returnOrigin}/painel?dev_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        customer: customerId,
        allow_promotion_codes: true,
        metadata: meta,
        subscription_data: { metadata: meta },
      });

      if (!session.client_secret) throw new Error("Falha ao criar sessão");
      return { clientSecret: session.client_secret, error: null };
    } catch (err) {
      console.error("[dev-billing] plan checkout failed", err);
      return { clientSecret: null, error: err instanceof Error ? err.message : "Falha no checkout" };
    }
  });

/** Checkout one-time para pacote avulso de créditos. */
export const createDevPackCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { packSlug: string; returnOrigin: string; environment: StripeEnv }) => {
    if (!/^[a-z0-9_]+$/.test(data.packSlug)) throw new Error("packSlug inválido");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("ambiente inválido");
    return { ...data, returnOrigin: validateReturnOrigin(data.returnOrigin) };
  })
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser?.user?.email ?? undefined;

    try {
      const { data: pack, error } = await supabaseAdmin
        .from("dev_credit_packs")
        .select("id, slug, name, credits, price, currency, stripe_price_lookup_key")
        .eq("slug", data.packSlug)
        .eq("active", true)
        .maybeSingle();
      if (error || !pack) throw new Error("Pacote não encontrado");

      const stripe = createStripeClient(data.environment);
      const lookupKey = pack.stripe_price_lookup_key || `devpack_${pack.slug}`;
      const price = await ensurePrice(stripe, {
        lookupKey,
        productId: `devpack_${pack.slug}`,
        productName: `Filro Dev — ${pack.name}`,
        amount: pack.price,
        currency: pack.currency || "brl",
      });

      const customerId = await resolveCustomer(stripe, userId, email);
      const meta = {
        userId,
        kind: "dev_pack",
        packSlug: pack.slug,
        packId: pack.id,
        credits: String(pack.credits),
      };

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: `${data.returnOrigin}/painel?dev_pack=success&session_id={CHECKOUT_SESSION_ID}`,
        customer: customerId,
        customer_update: { address: "auto", name: "auto" },
        allow_promotion_codes: true,
        metadata: meta,
      });

      if (!session.client_secret) throw new Error("Falha ao criar sessão");
      return { clientSecret: session.client_secret, error: null };
    } catch (err) {
      console.error("[dev-billing] pack checkout failed", err);
      return { clientSecret: null, error: err instanceof Error ? err.message : "Falha no checkout" };
    }
  });

/** Lista pacotes de crédito ativos (pode ser chamado sem auth — exibido na página de preços). */
export const listDevCreditPacks = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("dev_credit_packs")
      .select("slug, name, credits, price, currency")
      .eq("active", true)
      .order("display_order", { ascending: true });
    return { packs: data ?? [] };
  });
