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

export const createPlanCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: {
    planSlug: string;
    customerEmail?: string;
    userId?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!/^[a-z_]+$/.test(data.planSlug)) throw new Error("Invalid planSlug");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const stripe = createStripeClient(data.environment);
      const plan = await getPlanForCheckout(data.planSlug);

      let activationPrice: Stripe.Price | null = null;
      let monthlyPrice: Stripe.Price | null = null;
      try {
        ({ activationPrice, monthlyPrice } = await resolveOrCreatePlanPrices(stripe, data.planSlug, plan));
      } catch (err) {
        console.error("[checkout] price resolution failed", { planSlug: data.planSlug, err });
        throw new Error(`Falha ao preparar preços do plano: ${err instanceof Error ? err.message : String(err)}`);
      }
      if (!activationPrice || !monthlyPrice) throw new Error("Preços do plano não encontrados");

      const customerId = (data.customerEmail || data.userId)
        ? await resolveOrCreateCustomer(stripe, {
            email: data.customerEmail,
            userId: data.userId,
          })
        : undefined;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          { price: monthlyPrice.id, quantity: 1 },
          { price: activationPrice.id, quantity: 1 },
        ],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        allow_promotion_codes: true,
        ...(customerId && { customer: customerId }),
        ...(data.userId && {
          metadata: { userId: data.userId, planSlug: data.planSlug },
          subscription_data: { metadata: { userId: data.userId, planSlug: data.planSlug } },
        }),
      });

      if (!session.client_secret) throw new Error("Falha ao criar sessão");
      return { clientSecret: session.client_secret, error: null };
    } catch (err) {
      console.error("[checkout] checkout session startup failed", { planSlug: data.planSlug, err });
      return { clientSecret: null, error: getCheckoutErrorMessage(err) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl: string; environment: StripeEnv }) => data)
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
