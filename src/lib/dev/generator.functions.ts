import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SLUG_RE = /^[a-z0-9-]{3,40}$/;
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const CREDIT_COST_GENERATE = 5;
const CREDIT_COST_AI_EDIT = 1;

// ---------- helpers ----------
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = (base && base.length >= 3 ? base : "meu-site").slice(0, 30);
  let candidate = root;
  for (let i = 0; i < 50; i++) {
    const { data } = await supabaseAdmin.from("dev_projects").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
  throw new Error("Não foi possível gerar um endereço único, tente outro nome.");
}

type GeneratedContent = {
  hero: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary?: string };
  about: { title: string; body: string };
  services: { title: string; items: Array<{ name: string; description: string }> };
  highlights?: string[];
  testimonial?: { quote: string; author: string };
  cta: { title: string; body: string; buttonLabel: string };
  contact: { whatsapp?: string; address?: string; hours?: string };
  colors: { primary: string; accent: string; background: string; ink: string };
};

const FALLBACK_COLORS = { primary: "#0F172A", accent: "#F97316", background: "#FAFAF7", ink: "#0F172A" };

async function callAI(messages: Array<{ role: string; content: string }>, expectJSON = true): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI Gateway não configurado.");
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 2200,
      ...(expectJSON ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("Limite de IA atingido. Tente em instantes.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados. Avise o suporte.");
  if (!res.ok) throw new Error(`Falha na IA (${res.status})`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

function safeJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  } catch { return fallback; }
}

async function generateContent(input: {
  businessName: string;
  segment: string;
  description: string;
  whatsapp?: string;
  city?: string;
  tone?: string;
  templateName: string;
  sections: string[];
}): Promise<GeneratedContent> {
  const system = `Você é um copywriter sênior brasileiro especialista em landing pages que convertem. Sua tarefa é gerar o conteúdo de um site para um negócio real, em PT-BR, com tom profissional e direto. Responda APENAS um objeto JSON válido (sem markdown, sem comentários) seguindo EXATAMENTE este schema:
{
  "hero": { "eyebrow": "string curta (3-6 palavras)", "title": "string até 90 chars, direto", "subtitle": "string até 180 chars", "ctaPrimary": "Falar no WhatsApp ou similar", "ctaSecondary": "string opcional curta" },
  "about": { "title": "string", "body": "1 parágrafo até 400 chars" },
  "services": { "title": "string", "items": [ { "name": "string", "description": "string curta até 140 chars" } ] (4 a 6 itens) },
  "highlights": ["string curta", ...] (3 a 5 itens),
  "testimonial": { "quote": "string até 220 chars", "author": "Nome — papel" },
  "cta": { "title": "string", "body": "string até 200 chars", "buttonLabel": "string curta" },
  "contact": { "whatsapp": "echo do whatsapp recebido", "address": "string ou vazia", "hours": "string ou vazia" },
  "colors": { "primary": "#HEX", "accent": "#HEX", "background": "#HEX claro", "ink": "#HEX escuro" }
}
NUNCA invente fatos sobre o negócio que o usuário não passou. Use frases genéricas mas profissionais quando faltar detalhe.`;

  const user = `Modelo escolhido: ${input.templateName}
Seções esperadas: ${input.sections.join(", ")}
Nome do negócio: ${input.businessName}
Segmento: ${input.segment || "—"}
Cidade/região: ${input.city || "—"}
WhatsApp: ${input.whatsapp || "—"}
Tom desejado: ${input.tone || "profissional e acolhedor"}
Descrição do negócio (escrita pelo dono):
"""
${input.description}
"""

Gere o JSON agora.`;

  const raw = await callAI([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  const fallback: GeneratedContent = {
    hero: { eyebrow: input.segment || "Bem-vindo", title: input.businessName, subtitle: input.description.slice(0, 160), ctaPrimary: "Falar no WhatsApp" },
    about: { title: `Sobre ${input.businessName}`, body: input.description.slice(0, 380) },
    services: { title: "O que oferecemos", items: [{ name: "Atendimento personalizado", description: "Soluções pensadas para o seu caso." }] },
    cta: { title: "Vamos conversar?", body: "Fale com a gente agora pelo WhatsApp.", buttonLabel: "Falar agora" },
    contact: { whatsapp: input.whatsapp, address: "", hours: "" },
    colors: FALLBACK_COLORS,
  };
  return safeJSON<GeneratedContent>(raw, fallback);
}

// ---------- public: ler site pelo slug ----------
export const getPublicSiteBySlug = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string }) => {
    if (!SLUG_RE.test(data.slug)) throw new Error("Endereço inválido");
    return data;
  })
  .handler(async ({ data }) => {
    const { data: project } = await supabaseAdmin
      .from("dev_projects")
      .select("slug, business_name, business_segment, template_slug, generated_content, published_url, is_public, status")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!project || !project.is_public || project.status !== "published") {
      return { site: null, error: "Site não encontrado" };
    }
    return { site: project, error: null };
  });

// ---------- generate ----------
export const generateDevSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    templateSlug: string;
    businessName: string;
    businessSegment: string;
    description: string;
    whatsapp?: string;
    city?: string;
    tone?: string;
    preferredSlug?: string;
  }) => {
    if (!data.templateSlug || data.templateSlug.length > 80) throw new Error("Modelo inválido");
    const name = (data.businessName || "").trim();
    if (name.length < 2 || name.length > 120) throw new Error("Nome do negócio inválido");
    const desc = (data.description || "").trim();
    if (desc.length < 10 || desc.length > 2000) throw new Error("Descreva seu negócio em ao menos 10 caracteres (máx. 2000)");
    return { ...data, businessName: name, description: desc };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // 1. Verifica saldo
    const { data: credits } = await supabaseAdmin
      .from("user_credits").select("balance").eq("user_id", userId).maybeSingle();
    const balance = credits?.balance ?? 0;
    if (balance < CREDIT_COST_GENERATE) {
      return { ok: false as const, error: `Você precisa de ${CREDIT_COST_GENERATE} créditos. Saldo atual: ${balance}.`, projectId: null, slug: null, publishedUrl: null };
    }

    // 2. Busca template
    const { data: tpl } = await supabaseAdmin
      .from("dev_templates").select("id, slug, name, sections").eq("slug", data.templateSlug).eq("active", true).maybeSingle();
    if (!tpl) return { ok: false as const, error: "Modelo não encontrado", projectId: null, slug: null, publishedUrl: null };

    // 3. Gera slug único
    const base = slugify(data.preferredSlug || data.businessName);
    const slug = await uniqueSlug(base);

    // 4. Gera conteúdo via IA
    let content: GeneratedContent;
    try {
      content = await generateContent({
        businessName: data.businessName,
        segment: data.businessSegment,
        description: data.description,
        whatsapp: data.whatsapp,
        city: data.city,
        tone: data.tone,
        templateName: tpl.name,
        sections: (tpl.sections as unknown as string[]) || [],
      });
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Falha na geração com IA", projectId: null, slug: null, publishedUrl: null };
    }

    const publishedUrl = `/s/${slug}`;

    // 5. Cria projeto
    const { data: created, error: cErr } = await supabaseAdmin
      .from("dev_projects")
      .insert({
        user_id: userId,
        template_id: tpl.id,
        template_slug: tpl.slug,
        business_name: data.businessName,
        business_segment: data.businessSegment || "",
        briefing: {
          description: data.description,
          whatsapp: data.whatsapp || "",
          city: data.city || "",
          tone: data.tone || "",
        } as never,
        generated_content: content as never,
        slug,
        is_public: true,
        status: "published",
        published_url: publishedUrl,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();
    if (cErr || !created) return { ok: false as const, error: cErr?.message ?? "Falha ao salvar", projectId: null, slug: null, publishedUrl: null };

    // 6. Cria versão v1
    await supabaseAdmin.from("dev_project_versions").insert({
      project_id: created.id,
      version_number: 1,
      notes: "Versão inicial gerada por IA",
      generated_site: { content, slug, publishedUrl } as never,
      created_by: userId,
    });

    // 7. Debita créditos
    await supabaseAdmin.rpc("grant_credits", {
      _user_id: userId,
      _delta: -CREDIT_COST_GENERATE,
      _reason: "site_generation",
      _ref_id: created.id,
      _metadata: { slug } as never,
    } as never);

    await supabaseAdmin.from("events").insert({
      event_type: "dev.site.generated",
      user_id: userId,
      event_data: { projectId: created.id, slug, templateSlug: tpl.slug } as never,
    });

    return { ok: true as const, error: null, projectId: created.id, slug, publishedUrl };
  });

// ---------- edit with AI ----------
export const editDevSiteWithAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; instruction: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Projeto inválido");
    const ins = (data.instruction || "").trim();
    if (ins.length < 5 || ins.length > 1500) throw new Error("Instrução muito curta ou longa");
    return { projectId: data.projectId, instruction: ins };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: credits } = await supabaseAdmin
      .from("user_credits").select("balance").eq("user_id", userId).maybeSingle();
    if ((credits?.balance ?? 0) < CREDIT_COST_AI_EDIT) {
      return { ok: false as const, error: "Sem créditos suficientes para editar.", content: null };
    }

    const { data: project } = await supabaseAdmin
      .from("dev_projects")
      .select("id, user_id, generated_content, business_name")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) return { ok: false as const, error: "Projeto não encontrado", content: null };
    if (project.user_id !== userId) return { ok: false as const, error: "Sem permissão", content: null };

    const system = `Você edita o JSON de conteúdo de um site. Receba o JSON atual e a instrução do usuário. Devolva APENAS o JSON COMPLETO atualizado, no MESMO formato/chaves do recebido (não invente novas chaves, não remova chaves). Faça só a mudança pedida. Em PT-BR.`;
    const user = `INSTRUÇÃO: ${data.instruction}

JSON ATUAL:
${JSON.stringify(project.generated_content, null, 2)}`;

    let updated: unknown;
    try {
      const raw = await callAI([
        { role: "system", content: system },
        { role: "user", content: user },
      ]);
      updated = safeJSON<unknown>(raw, project.generated_content);
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Falha na IA", content: null };
    }

    await supabaseAdmin
      .from("dev_projects")
      .update({ generated_content: updated as never, updated_at: new Date().toISOString() })
      .eq("id", data.projectId);

    const { data: last } = await supabaseAdmin
      .from("dev_project_versions")
      .select("version_number")
      .eq("project_id", data.projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersion = (last?.version_number ?? 0) + 1;

    await supabaseAdmin.from("dev_project_versions").insert({
      project_id: data.projectId,
      version_number: nextVersion,
      notes: `Edição IA: ${data.instruction.slice(0, 120)}`,
      generated_site: { content: updated } as never,
      created_by: userId,
    });

    await supabaseAdmin.rpc("grant_credits", {
      _user_id: userId,
      _delta: -CREDIT_COST_AI_EDIT,
      _reason: "ai_edit",
      _ref_id: data.projectId,
      _metadata: { instruction: data.instruction.slice(0, 200) } as never,
    } as never);

    return { ok: true as const, error: null, content: updated as Record<string, unknown> };
  });

// ---------- update manual ----------
export const updateDevSiteManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; content: Record<string, unknown> }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Projeto inválido");
    const size = JSON.stringify(data.content ?? {}).length;
    if (size > 30000) throw new Error("Conteúdo muito grande");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: project } = await supabaseAdmin
      .from("dev_projects").select("user_id").eq("id", data.projectId).maybeSingle();
    if (!project) return { ok: false as const, error: "Projeto não encontrado" };
    if (project.user_id !== userId) return { ok: false as const, error: "Sem permissão" };
    const { error } = await supabaseAdmin
      .from("dev_projects")
      .update({ generated_content: data.content as never, updated_at: new Date().toISOString() })
      .eq("id", data.projectId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, error: null };
  });
