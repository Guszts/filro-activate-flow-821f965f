import { createServerFn } from "@tanstack/react-start";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";

// One-off helper to create a 100% off promo code restricted to the Essencial plan.
export const createEssencialFreePromo = createServerFn({ method: "POST" })
  .inputValidator((data: { environment: StripeEnv; code?: string }) => data)
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const code = (data.code || "TESTE100").toUpperCase();

    // Find prices for plan_essencial
    const productId = "plan_essencial";
    const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
    const priceIds = prices.data.map((p) => p.id);

    // Create coupon (100% off, applies to specific products)
    const coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: "forever",
      name: "Teste Essencial Grátis",
      applies_to: { products: [productId] },
      metadata: { lovable_external_id: "essencial_free_test" },
    });

    // Create promotion code
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      max_redemptions: 50,
      metadata: { plan: "essencial" },
    });

    return {
      coupon_id: coupon.id,
      promotion_code: promo.code,
      promotion_code_id: promo.id,
      applies_to_prices: priceIds,
    };
  });
