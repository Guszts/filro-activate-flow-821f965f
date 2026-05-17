import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient } from "@/lib/stripe.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito a administradores.");
}

const CODE_RE = /^[A-Z0-9_-]{3,40}$/;

export const listPromoCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertPromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string;
    code: string;
    description?: string;
    discount_percent: number;
    plan_slug?: string | null;
    max_uses?: number | null;
    expires_at?: string | null;
    active?: boolean;
    syncStripe?: boolean;
  }) => {
    const code = String(data.code || "").trim().toUpperCase();
    if (!CODE_RE.test(code)) throw new Error("Código inválido (use A-Z, 0-9, _, -, 3 a 40 chars)");
    const pct = Number(data.discount_percent);
    if (!Number.isInteger(pct) || pct < 1 || pct > 100) throw new Error("Desconto deve ser inteiro entre 1 e 100");
    return {
      ...data,
      code,
      description: (data.description || "").slice(0, 500),
      discount_percent: pct,
      plan_slug: data.plan_slug?.trim() || null,
      max_uses: data.max_uses && data.max_uses > 0 ? Math.floor(data.max_uses) : null,
      expires_at: data.expires_at || null,
      active: data.active ?? true,
      syncStripe: data.syncStripe ?? true,
    };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    let stripeCouponId: string | null = null;
    let stripePromotionId: string | null = null;

    if (data.syncStripe) {
      for (const env of ["sandbox", "live"] as const) {
        try {
          const stripe = createStripeClient(env);
          const coupon = await stripe.coupons.create({
            percent_off: data.discount_percent,
            duration: "once",
            name: `${data.code} (${data.discount_percent}% off)`,
            ...(data.max_uses && { max_redemptions: data.max_uses }),
            ...(data.expires_at && { redeem_by: Math.floor(new Date(data.expires_at).getTime() / 1000) }),
            metadata: { lovable_external_id: `promo_${data.code.toLowerCase()}_${env}` },
          });
          const promo = await stripe.promotionCodes.create({
            promotion: { type: "coupon", coupon: coupon.id },
            code: data.code,
            active: data.active,
            ...(data.max_uses && { max_redemptions: data.max_uses }),
            ...(data.expires_at && { expires_at: Math.floor(new Date(data.expires_at).getTime() / 1000) }),
            metadata: { lovable_external_id: `promo_code_${data.code.toLowerCase()}_${env}` },
          });
          if (env === "live") {
            stripeCouponId = coupon.id;
            stripePromotionId = promo.id;
          } else if (!stripeCouponId) {
            stripeCouponId = coupon.id;
            stripePromotionId = promo.id;
          }
        } catch (err) {
          console.warn(`[promo-codes] stripe sync ${env} failed`, err);
        }
      }
    }

    const row = {
      code: data.code,
      description: data.description,
      discount_percent: data.discount_percent,
      plan_slug: data.plan_slug,
      max_uses: data.max_uses,
      expires_at: data.expires_at,
      active: data.active,
      ...(stripeCouponId && { stripe_coupon_id: stripeCouponId }),
      ...(stripePromotionId && { stripe_promotion_code_id: stripePromotionId }),
      created_by: context.userId,
    };

    if (data.id) {
      const { error } = await supabaseAdmin.from("promo_codes").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("promo_codes")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });

export const togglePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; active: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("promo_codes")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("promo_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
