import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendTransactionalEmailServer } from "@/lib/email/send.server";

const PANEL_URL = "https://filro.site/painel";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito a administradores.");
}

/**
 * Notifica o cliente quando o projeto é publicado. Idempotente por project_id.
 */
export const notifySitePublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!data.projectId) throw new Error("projectId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("user_id,published_url,business_name")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) return { ok: false };
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("name,email,business_name")
      .eq("user_id", project.user_id)
      .maybeSingle();
    if (!prof?.email) return { ok: false };
    await sendTransactionalEmailServer({
      templateName: "site-published",
      recipientEmail: prof.email,
      idempotencyKey: `published-${data.projectId}`,
      templateData: {
        name: prof.name || undefined,
        businessName: project.business_name || prof.business_name || undefined,
        publishedUrl: project.published_url || undefined,
        panelUrl: PANEL_URL,
      },
    });
    return { ok: true };
  });
