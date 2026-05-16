import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Falha ao validar permissão");
  if (!data) throw new Error("Acesso restrito");
}

// ------------------- UPDATE PARTNER -------------------
const updatePartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(200).nullable().optional(),
  whatsapp: z.string().max(40).nullable().optional(),
  pix_key: z.string().max(200).nullable().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  status: z.enum(["active", "paused", "blocked"]).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updatePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updatePartnerSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { id, ...rest } = data;
    const { error } = await supabaseAdmin.from("partners").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------- APPROVE COMMISSION -------------------
const idSchema = z.object({ id: z.string().uuid() });

export const approveCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("partner_commissions")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", data.id)
      .in("status", ["pending"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------- CANCEL COMMISSION -------------------
const cancelSchema = z.object({
  id: z.string().uuid(),
  reason: z.enum(["refund", "sale_cancelled", "attribution_error", "fraud", "other"]),
  notes: z.string().max(1000).optional(),
});

export const cancelCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cancelSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("partner_commissions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: data.reason,
        notes: data.notes ?? null,
      })
      .eq("id", data.id)
      .not("status", "eq", "paid");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------- PAY COMMISSION (cria payout) -------------------
const paySchema = z.object({
  id: z.string().uuid(),
  method: z.enum(["pix", "bank_transfer", "cash", "other"]).default("pix"),
  notes: z.string().max(1000).optional(),
});

export const payCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => paySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    // Tudo atômico via RPC: trava a comissão, valida, cria o payout
    // e atualiza a comissão para paid em uma única transação.
    const { data: payoutId, error } = await supabaseAdmin.rpc("pay_partner_commission", {
      _commission_id: data.id,
      _method: data.method,
      _notes: data.notes ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true, payoutId };
  });
