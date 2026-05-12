import { createServerFn } from "@tanstack/react-start";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";

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
    const stripe = createStripeClient(data.environment);

    const activationKey = `plan_${data.planSlug}_activation`;
    const monthlyKey = `plan_${data.planSlug}_monthly`;

    let actPrices, monPrices;
    try {
      [actPrices, monPrices] = await Promise.all([
        stripe.prices.list({ lookup_keys: [activationKey], limit: 1 }),
        stripe.prices.list({ lookup_keys: [monthlyKey], limit: 1 }),
      ]);
    } catch (err) {
      console.error("[checkout] prices.list failed", { activationKey, monthlyKey, err });
      throw new Error(`Falha ao consultar preços: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (!actPrices?.data?.length || !monPrices?.data?.length) {
      console.error("[checkout] price lookup empty", { activationKey, monthlyKey, act: actPrices?.data?.length, mon: monPrices?.data?.length });
      throw new Error(`Plano não encontrado (lookup_keys: ${activationKey}, ${monthlyKey})`);
    }

    const customerId = (data.customerEmail || data.userId)
      ? await resolveOrCreateCustomer(stripe, {
          email: data.customerEmail,
          userId: data.userId,
        })
      : undefined;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        { price: monPrices.data[0].id, quantity: 1 },
        { price: actPrices.data[0].id, quantity: 1 },
      ],
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      ...(customerId && { customer: customerId }),
      ...(data.userId && {
        metadata: { userId: data.userId, planSlug: data.planSlug },
        subscription_data: { metadata: { userId: data.userId, planSlug: data.planSlug } },
      }),
    });

    if (!session.client_secret) throw new Error("Falha ao criar sessão");
    return { clientSecret: session.client_secret };
  });
