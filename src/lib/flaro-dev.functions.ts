import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `Você é o Flaro Dev, um assistente de programação que gera aplicativos web completos a partir de descrições em linguagem natural.

Quando o usuário pedir para criar, editar ou ajustar uma página/app:
- Responda SEMPRE com um objeto JSON dentro de um bloco \`\`\`json ... \`\`\` com a estrutura: { "summary": "resumo curto do que foi feito", "html": "...", "css": "...", "js": "..." }
- HTML deve ser um documento HTML5 completo válido começando com <!DOCTYPE html>. Inclua <head> com <meta charset> e <meta viewport>.
- CSS e JS são opcionais (string vazia se não usar). O HTML pode referenciar variáveis CSS/JS sem precisar incluí-las inline.
- Use design moderno, responsivo, acessível. Cores harmoniosas, tipografia clara, espaçamento generoso.
- Se o usuário só fizer uma pergunta ou pedir explicação, responda em texto normal SEM JSON.
- Sempre em português do Brasil, tom direto e profissional.
- Não use bibliotecas externas via CDN a menos que o usuário peça (Tailwind, React, etc. — quando pedirem).
- Para edições incrementais, retorne o HTML/CSS/JS COMPLETO atualizado, não apenas o diff.`;

// ===================== PROJECTS =====================

export const listFlaroDevProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("id,name,description,status,published_at,created_at,updated_at,current_version_id")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { projects: data ?? [] };
  });

export const createFlaroDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      name: z.string().min(1).max(120).optional(),
      description: z.string().max(500).optional(),
      templateId: z.string().uuid().optional(),
    }).parse(input ?? {})
  )
  .handler(async ({ data, context }) => {
    const { data: project, error } = await supabaseAdmin
      .from("flaro_dev_projects")
      .insert({
        user_id: context.userId,
        name: data.name ?? "Novo projeto",
        description: data.description ?? "",
        template_id: data.templateId ?? null,
      })
      .select("id")
      .single();
    if (error || !project) throw new Error(error?.message ?? "Falha ao criar projeto");

    // If template provided, clone its files as initial version
    if (data.templateId) {
      const { data: tpl } = await supabaseAdmin
        .from("flaro_dev_templates")
        .select("html,css,js,name")
        .eq("id", data.templateId)
        .maybeSingle();
      if (tpl) {
        const { data: ver } = await supabaseAdmin
          .from("flaro_dev_versions")
          .insert({
            project_id: project.id,
            version_number: 1,
            html: tpl.html,
            css: tpl.css,
            js: tpl.js,
            prompt_summary: `Iniciado com template "${tpl.name}"`,
            created_by: context.userId,
          })
          .select("id")
          .single();
        if (ver) {
          await supabaseAdmin
            .from("flaro_dev_projects")
            .update({ current_version_id: ver.id })
            .eq("id", project.id);
        }
      }
    }

    return { id: project.id };
  });

export const renameFlaroDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), name: z.string().min(1).max(120) }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("flaro_dev_projects")
      .update({ name: data.name })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFlaroDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("flaro_dev_projects")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getFlaroDevProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: project, error } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) throw new Error("Projeto não encontrado");

    const [{ data: messages }, { data: versions }, { data: seo }, { data: deployments }] =
      await Promise.all([
        supabaseAdmin
          .from("flaro_dev_messages")
          .select("id,role,content,created_at")
          .eq("project_id", data.id)
          .order("created_at"),
        supabaseAdmin
          .from("flaro_dev_versions")
          .select("id,version_number,prompt_summary,created_at")
          .eq("project_id", data.id)
          .order("version_number", { ascending: false }),
        supabaseAdmin.from("flaro_dev_seo").select("*").eq("project_id", data.id).maybeSingle(),
        supabaseAdmin
          .from("flaro_dev_deployments")
          .select("id,slug,status,published_at")
          .eq("project_id", data.id)
          .order("published_at", { ascending: false }),
      ]);

    let currentVersion = null;
    if (project.current_version_id) {
      const { data: cv } = await supabaseAdmin
        .from("flaro_dev_versions")
        .select("id,html,css,js,version_number")
        .eq("id", project.current_version_id)
        .maybeSingle();
      currentVersion = cv;
    }

    return {
      project,
      messages: messages ?? [],
      versions: versions ?? [],
      seo,
      deployments: deployments ?? [],
      currentVersion,
    };
  });

// ===================== CHAT =====================

function extractJsonBlock(text: string): { summary?: string; html?: string; css?: string; js?: string } | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : null;
  if (!raw) {
    // Try to find first {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const sendFlaroDevChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      projectId: z.string().uuid(),
      message: z.string().min(1).max(8000),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    // verify ownership
    const { data: project } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("id,user_id,current_version_id")
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado");

    // Save user message
    await supabaseAdmin.from("flaro_dev_messages").insert({
      project_id: data.projectId,
      role: "user",
      content: data.message,
    });

    // Load history
    const { data: history } = await supabaseAdmin
      .from("flaro_dev_messages")
      .select("role,content")
      .eq("project_id", data.projectId)
      .order("created_at")
      .limit(40);

    // Load current version to give context
    let contextPrefix = "";
    if (project.current_version_id) {
      const { data: cv } = await supabaseAdmin
        .from("flaro_dev_versions")
        .select("html,css,js")
        .eq("id", project.current_version_id)
        .maybeSingle();
      if (cv) {
        contextPrefix = `\n\nVersão atual do projeto:\n\n[HTML]\n${cv.html}\n\n[CSS]\n${cv.css}\n\n[JS]\n${cv.js}`;
      }
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurado");

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + contextPrefix },
      ...((history ?? []).map((m) => ({ role: m.role, content: m.content }))),
    ];

    const res = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.4, max_tokens: 8000 }),
    });

    if (res.status === 429) {
      return { ok: false as const, error: "Limite de uso atingido. Aguarde alguns instantes." };
    }
    if (res.status === 402) {
      return { ok: false as const, error: "Créditos esgotados. Adicione créditos no workspace." };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[Flaro Dev] AI error", res.status, body);
      return { ok: false as const, error: "Falha ao gerar resposta. Tente novamente." };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "";

    // Save assistant message
    const { data: assistantMsg } = await supabaseAdmin
      .from("flaro_dev_messages")
      .insert({
        project_id: data.projectId,
        role: "assistant",
        content: reply,
        metadata: { model: MODEL },
      })
      .select("id")
      .single();

    // Try to extract code
    const block = extractJsonBlock(reply);
    let newVersionId: string | null = null;
    if (block?.html) {
      const { data: lastVer } = await supabaseAdmin
        .from("flaro_dev_versions")
        .select("version_number")
        .eq("project_id", data.projectId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextNum = (lastVer?.version_number ?? 0) + 1;

      const { data: newVer } = await supabaseAdmin
        .from("flaro_dev_versions")
        .insert({
          project_id: data.projectId,
          version_number: nextNum,
          html: block.html ?? "",
          css: block.css ?? "",
          js: block.js ?? "",
          prompt_summary: block.summary ?? data.message.slice(0, 200),
          created_by: context.userId,
        })
        .select("id")
        .single();
      if (newVer) {
        newVersionId = newVer.id;
        await supabaseAdmin
          .from("flaro_dev_projects")
          .update({ current_version_id: newVer.id })
          .eq("id", data.projectId);
      }
    }

    return {
      ok: true as const,
      messageId: assistantMsg?.id,
      reply,
      newVersionId,
      summary: block?.summary ?? null,
    };
  });

// ===================== VERSIONS =====================

export const restoreFlaroDevVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), versionId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: project } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("id")
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado");
    const { error } = await supabaseAdmin
      .from("flaro_dev_projects")
      .update({ current_version_id: data.versionId })
      .eq("id", data.projectId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===================== TEMPLATES =====================

export const listFlaroDevTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("flaro_dev_templates")
      .select("id,name,description,category,thumbnail_url")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { templates: data ?? [] };
  });

// ===================== PUBLISH =====================

function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "site";
  const hash = Math.random().toString(36).slice(2, 8);
  return `${base}-${hash}`;
}

export const publishFlaroDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: project } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("id,name,current_version_id")
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado");
    if (!project.current_version_id) throw new Error("Sem versão para publicar. Converse com o Flaro Dev primeiro.");

    let slug = makeSlug(project.name);
    // Retry on collision
    for (let i = 0; i < 3; i++) {
      const { data: existing } = await supabaseAdmin
        .from("flaro_dev_deployments")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = makeSlug(project.name);
    }

    const { data: dep, error } = await supabaseAdmin
      .from("flaro_dev_deployments")
      .insert({
        project_id: project.id,
        version_id: project.current_version_id,
        slug,
        status: "published",
      })
      .select("id,slug,published_at")
      .single();
    if (error || !dep) throw new Error(error?.message ?? "Falha ao publicar");

    await supabaseAdmin
      .from("flaro_dev_projects")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", project.id);

    return { ok: true, slug: dep.slug, url: `https://filro.site/id/${dep.slug}` };
  });

// ===================== DOMAINS =====================

export const addFlaroDevDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      projectId: z.string().uuid(),
      domain: z.string().min(3).max(253).regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: project } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("id")
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado");

    const entriEnabled = !!process.env.ENTRI_API_KEY;
    const status = entriEnabled ? "pending" : "dns_manual";

    const { data: domain, error } = await supabaseAdmin
      .from("flaro_dev_domains")
      .insert({
        project_id: data.projectId,
        domain: data.domain.toLowerCase(),
        status,
        entri_state: entriEnabled ? {} : { fallback: "manual" },
      })
      .select("id,domain,status")
      .single();
    if (error || !domain) throw new Error(error?.message ?? "Falha ao salvar domínio");

    return {
      ok: true,
      domain,
      instructions: entriEnabled
        ? null
        : {
            type: "CNAME",
            name: data.domain,
            value: "filro.site",
            note: "Adicione este registro CNAME no seu provedor DNS. A verificação pode levar até 24h.",
          },
    };
  });

// ===================== SEO =====================

export const updateFlaroDevSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      projectId: z.string().uuid(),
      title: z.string().max(180).optional(),
      description: z.string().max(400).optional(),
      ogImageUrl: z.string().url().optional().nullable(),
      faviconUrl: z.string().url().optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: project } = await supabaseAdmin
      .from("flaro_dev_projects")
      .select("id")
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!project) throw new Error("Projeto não encontrado");

    const { error } = await supabaseAdmin
      .from("flaro_dev_seo")
      .upsert(
        {
          project_id: data.projectId,
          title: data.title ?? "",
          description: data.description ?? "",
          og_image_url: data.ogImageUrl ?? null,
          favicon_url: data.faviconUrl ?? null,
        },
        { onConflict: "project_id" }
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
