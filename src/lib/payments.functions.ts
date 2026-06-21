import { createServerFn } from "@tanstack/react-start";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type Stripe from "stripe";

interface PlanPriceInfo {
  name: string;
  activation_price: number;
  monthly_price: number;
  description: string | null;
}

function normalizePlanSlug(planSlug: string) {
  return planSlug.replace(/^plan_/, "");
}

function assertStripeList<T>(response: unknown, lookupKey: string): { data: T[] } {
  const maybe = response as { data?: unknown; message?: unknown; type?: unknown } | null;
  if (!maybe || !Array.isArray(maybe.data)) {
    console.error("[checkout] unexpected Stripe list response", { lookupKey, response: maybe });
    const details = typeof maybe?.message === "string" ? maybe.message : "resposta inválida do provedor";
    throw new Error(`Falha na integração de pagamentos (${lookupKey}): ${details}`);
  }
  return maybe as { data: T[] };
}

function getCheckoutErrorMessage(err: unknown) {
  const raw = err instanceof Error ? err.message : String(err);
  if (/Credential not found|STRIPE_.*not configured|LOVABLE_API_KEY is not configured/i.test(raw)) {
    return "Pagamentos temporariamente indisponíveis. A conexão de pagamentos precisa ser reativada antes de concluir o checkout.";
  }
  return raw || "Falha ao iniciar pagamento";
}

async function getPlanForCheckout(planSlug: string): Promise<PlanPriceInfo> {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("name, activation_price, monthly_price, description")
    .eq("slug", normalizePlanSlug(planSlug))
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("[checkout] plan lookup failed", { planSlug, error });
    throw new Error("Falha ao consultar plano");
  }
  if (!data) throw new Error("Plano não encontrado");
  return data as PlanPriceInfo;
}

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

function getPriceLookupKeys(planSlug: string) {
  const normalizedSlug = normalizePlanSlug(planSlug);
  return {
    activationKey: `plan_${normalizedSlug}_activation`,
    monthlyKey: `plan_${normalizedSlug}_monthly`,
  };
}

async function listPriceByLookupKey(
  stripe: ReturnType<typeof createStripeClient>,
  lookupKey: string,
) {
  const response = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  return assertStripeList<Stripe.Price>(response, lookupKey).data[0] ?? null;
}

async function resolveOrCreateProduct(
  stripe: ReturnType<typeof createStripeClient>,
  planSlug: string,
  plan: PlanPriceInfo,
) {
  const normalizedSlug = normalizePlanSlug(planSlug);
  const productId = `plan_${normalizedSlug}`;

  try {
    const existing = await stripe.products.retrieve(productId);
    if ("id" in existing && existing.id && !("deleted" in existing && existing.deleted)) return existing.id;
    console.error("[checkout] unexpected product response", { productId, response: existing });
    throw new Error("resposta inválida do provedor");
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404) {
      // Product will be created below.
    } else {
      console.error("[checkout] product lookup failed", { productId, err });
      throw new Error(`Falha ao consultar produto: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const created = await stripe.products.create({
    id: productId,
    name: plan.name,
    description: plan.description || `Plano ${plan.name}`,
    tax_code: "txcd_10103001",
    metadata: { lovable_external_id: productId, planSlug: normalizedSlug },
  });

  if (!created.id) throw new Error("Falha ao criar produto do plano");
  return created.id;
}

async function createPlanPrice(
  stripe: ReturnType<typeof createStripeClient>,
  productId: string,
  lookupKey: string,
  amount: number,
  recurring?: Stripe.PriceCreateParams.Recurring,
) {
  const created = await stripe.prices.create({
    currency: "brl",
    unit_amount: amount,
    product: productId,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    ...(recurring && { recurring }),
    metadata: { lovable_external_id: lookupKey },
  });

  if (!created.id) throw new Error(`Falha ao criar preço (${lookupKey})`);
  return created;
}

async function resolveOrCreatePlanPrices(
  stripe: ReturnType<typeof createStripeClient>,
  planSlug: string,
  plan: PlanPriceInfo,
) {
  const { activationKey, monthlyKey } = getPriceLookupKeys(planSlug);
  let [activationPrice, monthlyPrice] = await Promise.all([
    listPriceByLookupKey(stripe, activationKey),
    listPriceByLookupKey(stripe, monthlyKey),
  ]);

  if (!activationPrice || !monthlyPrice) {
    console.warn("[checkout] missing plan price; creating fallback prices", {
      planSlug,
      activationKey,
      monthlyKey,
      hasActivation: Boolean(activationPrice),
      hasMonthly: Boolean(monthlyPrice),
    });
    const productId = await resolveOrCreateProduct(stripe, planSlug, plan);
    if (!activationPrice) activationPrice = await createPlanPrice(stripe, productId, activationKey, plan.activation_price);
    if (!monthlyPrice) monthlyPrice = await createPlanPrice(stripe, productId, monthlyKey, plan.monthly_price, { interval: "month" });
  }

  if (!activationPrice || !monthlyPrice) throw new Error("Preços do plano não encontrados");

  return { activationPrice, monthlyPrice };
}

const ALLOWED_RETURN_HOSTS = new Set([
  "setup.filro.site",
  "filro.site",
  "www.filro.site",
  "filro-activate-flow.lovable.app",
  "id-preview--dda9f651-8d6f-45c8-92a8-0cf8f17a35cf.lovable.app",
  "localhost",
  "127.0.0.1",
]);

function isAllowedReturnHost(hostname: string): boolean {
  if (ALLOWED_RETURN_HOSTS.has(hostname)) return true;
  // Lovable preview/published subdomains rotate — allow any *.lovable.app and *.lovableproject.com.
  if (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com")) return true;
  if (hostname === "filro.site" || hostname.endsWith(".filro.site")) return true;
  return false;
}

const PARTNER_CODE_RE = /^[a-z0-9_-]{3,40}$/;

const PROMOCIONAL_PROMO_CODES: Array<{
  code: string;
  percentOff: number;
  couponName: string;
  couponMetaId: string;
  promoMetaId: string;
}> = [
  {
    code: "FILRO10",
    percentOff: 10,
    couponName: "Filro 10% off",
    couponMetaId: "filro10_once",
    promoMetaId: "promo_filro10",
  },
];

async function ensurePromocionalPromoCode(
  stripe: ReturnType<typeof createStripeClient>,
  productId: string,
) {
  try {
    const couponList = await stripe.coupons.list({ limit: 100 });

    for (const cfg of PROMOCIONAL_PROMO_CODES) {
      const existing = await stripe.promotionCodes.list({ code: cfg.code, active: true, limit: 1 });
      if (existing.data.length) continue;

      let couponId: string | null = null;
      const found = couponList.data.find(
        (c) => c.percent_off === cfg.percentOff && c.duration === "once" && c.metadata?.lovable_external_id === cfg.couponMetaId,
      );
      if (found) {
        couponId = found.id;
      } else {
        const coupon = await stripe.coupons.create({
          percent_off: cfg.percentOff,
          duration: "once",
          name: cfg.couponName,
          applies_to: { products: [productId] },
          metadata: { lovable_external_id: cfg.couponMetaId },
        });
        couponId = coupon.id;
      }

      await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: couponId },
        code: cfg.code,
        active: true,
        metadata: { lovable_external_id: cfg.promoMetaId },
      });
    }
  } catch (err) {
    console.error("[checkout] failed to ensure promo code", err);
  }
}

async function resolveActivePartner(rawCode: string | null | undefined) {
  if (!rawCode) return null;
  const code = String(rawCode).trim().toLowerCase();
  if (!PARTNER_CODE_RE.test(code)) return null;
  const { data } = await supabaseAdmin
    .from("partners")
    .select("id, code, commission_rate, commission_scope, status")
    .eq("code", code)
    .eq("status", "active")
    .maybeSingle();
  return data ?? null;
}

export const createPlanCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    planSlug: string;
    returnOrigin: string;
    environment: StripeEnv;
    partnerCode?: string | null;
  }) => {
    if (!/^[a-z_]+$/.test(data.planSlug)) throw new Error("Invalid planSlug");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    let parsed: URL;
    try { parsed = new URL(data.returnOrigin); } catch { throw new Error("Invalid returnOrigin"); }
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      throw new Error("Invalid returnOrigin protocol");
    }
    if (!isAllowedReturnHost(parsed.hostname)) throw new Error("Disallowed return origin");
    let partnerCode: string | null = null;
    if (typeof data.partnerCode === "string" && data.partnerCode.trim()) {
      const c = data.partnerCode.trim().toLowerCase();
      if (PARTNER_CODE_RE.test(c)) partnerCode = c;
    }
    return { planSlug: data.planSlug, returnOrigin: parsed.origin, environment: data.environment, partnerCode };
  })
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    // Email é fonte de verdade no servidor — derivado da sessão autenticada.
    const { data: authUser } = await supabase.auth.getUser();
    const customerEmail = authUser?.user?.email ?? undefined;
    const returnUrl = `${data.returnOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    try {
      const stripe = createStripeClient(data.environment);
      const plan = await getPlanForCheckout(data.planSlug);
      const isOneTime = normalizePlanSlug(data.planSlug) === "promocional";

      let activationPrice: Stripe.Price | null = null;
      let monthlyPrice: Stripe.Price | null = null;
      try {
        if (isOneTime) {
          // Promocional: cobra somente a ativação (one-time), sem assinatura.
          const { activationKey } = getPriceLookupKeys(data.planSlug);
          activationPrice = await listPriceByLookupKey(stripe, activationKey);
          if (!activationPrice) {
            const productId = await resolveOrCreateProduct(stripe, data.planSlug, plan);
            activationPrice = await createPlanPrice(stripe, productId, activationKey, plan.activation_price);
          }
          // Garante que o código promocional FILRO10 (10% off) existe na conta Stripe.
          const productIdForPromo =
            typeof activationPrice.product === "string" ? activationPrice.product : activationPrice.product?.id;
          if (productIdForPromo) {
            await ensurePromocionalPromoCode(stripe, productIdForPromo);
          }
        } else {
          ({ activationPrice, monthlyPrice } = await resolveOrCreatePlanPrices(stripe, data.planSlug, plan));
        }
      } catch (err) {
        console.error("[checkout] price resolution failed", { planSlug: data.planSlug, err });
        throw new Error(`Falha ao preparar preços do plano: ${err instanceof Error ? err.message : String(err)}`);
      }
      if (!activationPrice) throw new Error("Preços do plano não encontrados");
      if (!isOneTime && !monthlyPrice) throw new Error("Preços do plano não encontrados");

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: customerEmail,
        userId,
      });

      const partner = await resolveActivePartner(data.partnerCode);
      const partnerMeta: Record<string, string> = partner
        ? {
            partnerId: partner.id,
            partnerCode: partner.code,
            commissionRate: String(partner.commission_rate),
            commissionScope: partner.commission_scope,
          }
        : {};

      const sessionParams: Stripe.Checkout.SessionCreateParams = isOneTime
        ? {
            line_items: [{ price: activationPrice.id, quantity: 1 }],
            mode: "payment",
            ui_mode: "embedded_page",
            return_url: returnUrl,
            allow_promotion_codes: true,
            customer: customerId,
            customer_update: { address: "auto", name: "auto" },
            metadata: { userId, planSlug: data.planSlug, ...partnerMeta },
          }
        : {
            line_items: [
              { price: monthlyPrice!.id, quantity: 1 },
              { price: activationPrice.id, quantity: 1 },
            ],
            mode: "subscription",
            ui_mode: "embedded_page",
            return_url: returnUrl,
            allow_promotion_codes: true,
            customer: customerId,
            metadata: { userId, planSlug: data.planSlug, ...partnerMeta },
            subscription_data: { metadata: { userId, planSlug: data.planSlug, ...partnerMeta } },
          };

      const session = await stripe.checkout.sessions.create(sessionParams);

      if (!session.client_secret) throw new Error("Falha ao criar sessão");

      // Pre-cria/atualiza o referral em status checkout_created para rastrear cliques convertidos.
      if (partner) {
        await supabaseAdmin
          .from("partner_referrals")
          .upsert(
            {
              partner_id: partner.id,
              partner_code: partner.code,
              user_id: userId,
              stripe_checkout_session_id: session.id,
              status: "checkout_created",
            },
            { onConflict: "stripe_checkout_session_id" },
          );
        try {
          await supabaseAdmin.from("events").insert({
            event_type: "partner.checkout_created",
            user_id: userId,
            event_data: { partnerId: partner.id, partnerCode: partner.code, sessionId: session.id } as never,
          });
        } catch { /* noop */ }
      }

      try {
        await supabaseAdmin.from("events").insert({
          event_type: "checkout.started",
          user_id: userId,
          event_data: {
            planSlug: normalizePlanSlug(data.planSlug),
            sessionId: session.id,
            environment: data.environment,
            email: customerEmail ?? null,
            partnerCode: partner?.code ?? null,
          } as never,
        });
      } catch (e) {
        console.error("[checkout] event log failed", e);
      }

      return { clientSecret: session.client_secret, error: null };
    } catch (err) {
      console.error("[checkout] checkout session startup failed", { planSlug: data.planSlug, err });
      return { clientSecret: null, error: getCheckoutErrorMessage(err) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl: string; environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    let parsed: URL;
    try { parsed = new URL(data.returnUrl); } catch { throw new Error("Invalid returnUrl"); }
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      throw new Error("Invalid returnUrl protocol");
    }
    if (!isAllowedReturnHost(parsed.hostname)) throw new Error("Disallowed returnUrl");
    return { returnUrl: parsed.href, environment: data.environment };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return { url: null, error: "Nenhuma assinatura encontrada para gerenciar." };
    }

    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: data.returnUrl,
      });
      return { url: portal.url, error: null };
    } catch (err) {
      console.error("[portal] failed", err);
      return { url: null, error: err instanceof Error ? err.message : "Falha ao abrir portal" };
    }
  });

export const cancelSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reason?: string; immediate?: boolean; environment: StripeEnv }) => {
    if (data.reason && data.reason.length > 1000) throw new Error("Motivo muito longo");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_subscription_id, status, current_period_end")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .neq("status", "canceled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return { ok: false, error: "Nenhuma assinatura ativa encontrada." };
    }

    try {
      const stripe = createStripeClient(data.environment);
      let updatedAt: string | null = null;
      if (data.immediate) {
        const canceled = await stripe.subscriptions.cancel(sub.stripe_subscription_id);
        updatedAt = canceled?.canceled_at ? new Date(canceled.canceled_at * 1000).toISOString() : new Date().toISOString();
      } else {
        await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
      }

      // Audit event so admin console pode filtrar motivos.
      await supabaseAdmin.from("events").insert({
        event_type: "subscription.cancel_requested",
        user_id: userId,
        event_data: {
          subscriptionId: sub.stripe_subscription_id,
          environment: data.environment,
          immediate: !!data.immediate,
          reason: data.reason ?? null,
          current_period_end: sub.current_period_end,
          canceled_at: updatedAt,
        } as never,
      });

      return { ok: true, error: null };
    } catch (err) {
      console.error("[cancel] failed", err);
      return { ok: false, error: err instanceof Error ? err.message : "Falha ao cancelar assinatura" };
    }
  });

