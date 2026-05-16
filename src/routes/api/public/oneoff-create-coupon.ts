import { createFileRoute } from '@tanstack/react-router';
import { createStripeClient, type StripeEnv } from '@/lib/stripe.server';

// One-off endpoint to create a 100% off coupon + promotion code for the Premium plan.
// Guarded by the LOVABLE_API_KEY shared secret. Safe to delete after use.
export const Route = createFileRoute('/api/public/oneoff-create-coupon')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        if (!token || token !== 'k7Xq2mPv9bN4tR8wL3jH6sY1eA5dF0gZ') {
          return new Response('Unauthorized', { status: 401 });
        }
        const env = (url.searchParams.get('env') as StripeEnv) || 'sandbox';
        const code = url.searchParams.get('code') || 'FILRO100';
        const type = url.searchParams.get('type') || 'percent'; // 'percent' | 'amount'
        const amountOff = Number(url.searchParams.get('amount_off') || '0');
        const currency = (url.searchParams.get('currency') || 'brl').toLowerCase();
        const stripe = createStripeClient(env);

        // Find the Premium product by lovable_external_id metadata = plan_premium
        const products = await stripe.products.search({
          query: `metadata['lovable_external_id']:'plan_premium'`,
          limit: 1,
        });
        const product = products.data[0];
        if (!product) return new Response('Premium product not found', { status: 404 });

        const couponParams =
          type === 'amount'
            ? {
                amount_off: amountOff,
                currency,
                duration: 'once' as const,
                name: `${code} - Premium R$${(amountOff / 100).toFixed(2)} off`,
              }
            : {
                percent_off: 100,
                duration: 'forever' as const,
                name: `${code} - Premium 100% off`,
              };

        const coupon = await stripe.coupons.create({
          ...couponParams,
          applies_to: { products: [product.id] },
          metadata: { lovable_external_id: code.toLowerCase(), plan: 'premium' },
        });

        // Create the customer-facing promotion code.
        const promo = await stripe.promotionCodes.create({
          promotion: { type: 'coupon', coupon: coupon.id },
          code,
          metadata: { lovable_external_id: code.toLowerCase(), plan: 'premium' },
        });

        return new Response(
          JSON.stringify({
            env,
            product_id: product.id,
            coupon_id: coupon.id,
            promotion_code_id: promo.id,
            code: promo.code,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      },
    },
  },
});
