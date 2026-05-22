import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Server functions used by the CLIENT (project owner) to mutate their own project.
 * Replaces the client-side `supabase.from("projects").insert/update(...)` calls
 * that used to rely on the now-removed "Users insert/update own project" RLS policies.
 *
 * Every handler verifies ownership before touching the row, and only writes a
 * tightly scoped set of columns. Operational fields (project_status, plan_id,
 * published_url, preview_url, assigned_admin_id, etc.) are never writable here.
 */

// ============================================================================
// Get or create the caller's project (one project per user)
// ============================================================================
export const getOrCreateMyProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: existing, error: selErr } = await supabaseAdmin
      .from("projects")
      .select("id, business_info, business_info_submitted, plan_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    if (existing) return existing;

    // Find the most recent paid payment to bind a plan_id to the new project.
    const { data: pay } = await supabaseAdmin
      .from("payments")
      .select("plan_id, paid_at")
      .eq("user_id", userId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!pay?.plan_id) {
      throw new Error("Nenhum pagamento confirmado encontrado para criar o projeto.");
    }

    const { data: created, error: insErr } = await supabaseAdmin
      .from("projects")
      .insert({ user_id: userId, plan_id: pay.plan_id })
      .select("id, business_info, business_info_submitted, plan_id")
      .single();
    if (insErr) throw new Error(insErr.message);
    return created;
  });

// ============================================================================
// Autosave business_info draft (does NOT change status or flags)
// ============================================================================
export const saveBusinessInfoDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      projectId: z.string().uuid(),
      businessInfo: z.record(z.unknown()),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("user_id, business_info_submitted")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado.");
    if (project.user_id !== userId) throw new Error("Acesso negado.");
    // Once submitted, drafts are frozen — admin team owns the content.
    if (project.business_info_submitted) {
      return { ok: true, frozen: true };
    }

    const { error } = await supabaseAdmin
      .from("projects")
      .update({ business_info: data.businessInfo as never })
      .eq("id", data.projectId);
    if (error) throw new Error(error.message);
    return { ok: true, frozen: false };
  });

// ============================================================================
// Final submit — locks the briefing and moves status to in_production
// ============================================================================
const submitSchema = z.object({
  projectId: z.string().uuid(),
  businessInfo: z.record(z.unknown()),
  businessName: z.string().trim().min(1).max(200),
  businessSegment: z.string().trim().max(200).optional().default(""),
  selectedModel: z.string().trim().max(200).optional().default(""),
});

export const submitBusinessInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("user_id, business_info_submitted, project_status")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado.");
    if (project.user_id !== userId) throw new Error("Acesso negado.");
    if (project.business_info_submitted) {
      return { ok: true, alreadySubmitted: true };
    }

    const { error } = await supabaseAdmin
      .from("projects")
      .update({
        business_info: data.businessInfo as never,
        business_info_submitted: true,
        business_name: data.businessName,
        business_segment: data.businessSegment,
        selected_model: data.selectedModel,
        project_status: "in_production",
      })
      .eq("id", data.projectId);
    if (error) throw new Error(error.message);

    try {
      await supabaseAdmin.from("events").insert({
        event_type: "project.briefing_submitted",
        user_id: userId,
        event_data: { projectId: data.projectId } as never,
      });
    } catch {
      /* noop */
    }

    return { ok: true, alreadySubmitted: false };
  });
