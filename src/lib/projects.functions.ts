import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendTransactionalEmailServer } from "@/lib/email/send.server";

const PANEL_URL = "https://setup.filro.site/painel";
const PDF_BUCKET = "project-pdfs";

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

async function assertAdmin(userId: string) {
  if (!(await isAdmin(userId))) throw new Error("Acesso restrito a administradores.");
}

async function assertOwnerOrAdmin(userId: string, projectId: string) {
  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) throw new Error("Project not found.");
  if (project.user_id === userId) return;
  if (await isAdmin(userId)) return;
  throw new Error("Acesso negado a este projeto.");
}

/**
 * Gera URL assinada de download do PDF do projeto (válida por 1h).
 * Acessível apenas pelo dono do projeto ou um admin.
 */
export const getProjectPdfDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!data.projectId) throw new Error("projectId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertOwnerOrAdmin(context.userId, data.projectId);
    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("project_pdf_path,project_pdf_url")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) throw new Error("Project not found.");
    if (project.project_pdf_path) {
      const { data: signed, error } = await supabaseAdmin.storage
        .from(PDF_BUCKET)
        .createSignedUrl(project.project_pdf_path, 60 * 60);
      if (error) throw new Error(error.message);
      return { url: signed.signedUrl };
    }
    // Legacy public URL fallback
    if (project.project_pdf_url) return { url: project.project_pdf_url };
    throw new Error("Nenhum PDF anexado a este projeto.");
  });

/**
 * Gera URL assinada de UPLOAD para o PDF (admin apenas).
 * O cliente faz PUT direto na URL retornada, depois chama confirmProjectPdfUpload.
 */
export const createProjectPdfUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!data.projectId) throw new Error("projectId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const path = `${data.projectId}/${Date.now()}-${crypto.randomUUID()}.pdf`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(PDF_BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { uploadUrl: signed.signedUrl, token: signed.token, path };
  });

/**
 * Confirma o upload do PDF: grava o caminho privado em projects.project_pdf_path
 * e limpa a URL pública legada. Apenas admin.
 */
export const confirmProjectPdfUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; path: string }) => {
    if (!data.projectId) throw new Error("projectId obrigatório");
    if (!data.path) throw new Error("path obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    // Verifica que o arquivo realmente existe no bucket privado
    const { data: head, error: headErr } = await supabaseAdmin.storage
      .from(PDF_BUCKET)
      .createSignedUrl(data.path, 60);
    if (headErr || !head) throw new Error("Upload not confirmed in bucket.");
    const { error } = await supabaseAdmin
      .from("projects")
      .update({ project_pdf_path: data.path, project_pdf_url: null })
      .eq("id", data.projectId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Remove o PDF do projeto (apaga arquivo do bucket privado). Apenas admin.
 */
export const removeProjectPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!data.projectId) throw new Error("projectId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("project_pdf_path")
      .eq("id", data.projectId)
      .maybeSingle();
    if (project?.project_pdf_path) {
      await supabaseAdmin.storage.from(PDF_BUCKET).remove([project.project_pdf_path]);
    }
    const { error } = await supabaseAdmin
      .from("projects")
      .update({ project_pdf_path: null, project_pdf_url: null })
      .eq("id", data.projectId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Notifica o cliente quando o projeto é publicado. Idempotente por project_id.
 * Generates a long-lived signed URL (7 days) for the PDF if it exists.
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
      .select("user_id,published_url,business_name,project_pdf_path,project_pdf_url,delivered_email_sent_at")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) return { ok: false };
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("name,email,business_name")
      .eq("user_id", project.user_id)
      .maybeSingle();
    if (!prof?.email) return { ok: false };

    let pdfUrl: string | undefined;
    if (project.project_pdf_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from(PDF_BUCKET)
        .createSignedUrl(project.project_pdf_path, 60 * 60 * 24 * 7);
      pdfUrl = signed?.signedUrl;
    } else if (project.project_pdf_url) {
      pdfUrl = project.project_pdf_url;
    }

    await sendTransactionalEmailServer({
      templateName: "site-published",
      recipientEmail: prof.email,
      idempotencyKey: `published-${data.projectId}`,
      templateData: {
        name: prof.name || undefined,
        businessName: project.business_name || prof.business_name || undefined,
        publishedUrl: project.published_url || undefined,
        projectPdfUrl: pdfUrl,
        panelUrl: PANEL_URL,
      },
    });
    await supabaseAdmin
      .from("projects")
      .update({ delivered_email_sent_at: new Date().toISOString() })
      .eq("id", data.projectId);
    return { ok: true };
  });

