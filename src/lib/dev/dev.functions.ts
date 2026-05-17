import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import type Stripe from "stripe";

// ---------- helpers ----------
const SLUG_RE = /^[a-z0-9_-]{2,60}$/;
const PLAN_SLUG_RE = /^dev_(start|plus|pro|scale)$/;

const ALLOWED_RETURN_HOSTS = new Set([
  "setup.filro.site",
  "filro.site",
  "www.filro.site",
  "filro-activate-flow.lovable.app",
  "id-preview--dda9f651-8d6f-45c8-92a8-0cf8f17a35cf.lovable.app",
  "localhost",
  "127.0.0.1",
]);

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
      const c = existing.data[0];
      if (options.userId && c.metadata?.userId !== options.userId) {
        await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId: options.userId } });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

// ---------- public reads (no auth) ----------
export const listDevTemplatesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("dev_templates")
    .select("id, slug, name, segment, tagline, description, highlights, sections, recommended_plan, display_order, preview_image_url")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) return { templates: [], error: error.message };
  return { templates: data ?? [], error: null };
});

export const listDevPlansPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("dev_plans")
    .select("id, slug, name, tagline, description, activation_price, monthly_price, features, max_pages, max_revisions_month, display_order")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) return { plans: [], error: error.message };
  return { plans: data ?? [], error: null };
});

// ---------- user reads ----------
export const listMyDevProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("dev_projects")
      .select("id, business_name, template_slug, plan_slug, status, preview_url, published_url, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) return { projects: [], error: error.message };
    return { projects: data ?? [], error: null };
  });

export const getDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: project, error } = await supabase
      .from("dev_projects")
      .select("*")
      .eq("id", data.projectId)
      .maybeSingle();
    if (error) return { project: null, error: error.message };
    return { project, error: null };
  });

// ---------- create / save ----------
export const createDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { templateSlug: string; planSlug: string }) => {
    if (!SLUG_RE.test(data.templateSlug)) throw new Error("Modelo inválido");
    if (!PLAN_SLUG_RE.test(data.planSlug)) throw new Error("Plano inválido");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [{ data: tpl }, { data: plan }] = await Promise.all([
      supabaseAdmin.from("dev_templates").select("id, slug").eq("slug", data.templateSlug).eq("active", true).maybeSingle(),
      supabaseAdmin.from("dev_plans").select("id, slug").eq("slug", data.planSlug as "dev_start" | "dev_plus" | "dev_pro" | "dev_scale").eq("active", true).maybeSingle(),
    ]);
    if (!tpl) return { projectId: null, error: "Modelo não encontrado" };
    if (!plan) return { projectId: null, error: "Plano não encontrado" };

    const { data: created, error } = await supabase
      .from("dev_projects")
      .insert({
        user_id: userId,
        template_id: tpl.id,
        template_slug: tpl.slug,
        plan_id: plan.id,
        plan_slug: data.planSlug as "dev_start" | "dev_plus" | "dev_pro" | "dev_scale",
        status: "briefing",
      })
      .select("id")
      .maybeSingle();
    if (error || !created) return { projectId: null, error: error?.message ?? "Falha ao criar projeto" };
    return { projectId: created.id, error: null };
  });

export const saveDevBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    projectId: string;
    businessName: string;
    businessSegment: string;
    briefing: Record<string, unknown>;
  }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    if (!data.businessName || data.businessName.length > 200) throw new Error("Nome do negócio inválido");
    if (data.businessSegment.length > 200) throw new Error("Segmento inválido");
    const json = JSON.stringify(data.briefing ?? {});
    if (json.length > 50_000) throw new Error("Briefing muito grande");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("dev_projects")
      .update({
        business_name: data.businessName,
        business_segment: data.businessSegment,
        briefing: data.briefing as never,
        status: "awaiting_payment",
      })
      .eq("id", data.projectId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null };
  });

// ---------- change requests (chatbot) ----------
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_AI_MODEL = "google/gemini-2.5-flash";

type AiClassification = {
  category: "content" | "design" | "feature" | "bug" | "question" | "other";
  priority: "low" | "normal" | "high";
  summary: string;
};

async function classifyChangeRequest(message: string, businessName: string): Promise<AiClassification> {
  const fallback: AiClassification = { category: "other", priority: "normal", summary: message.slice(0, 140) };
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return fallback;
  try {
    const res = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LOVABLE_AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Você classifica pedidos de alteração de sites Flaro Dev. Responda APENAS em JSON puro, sem markdown, com as chaves: category (content|design|feature|bug|question|other), priority (low|normal|high), summary (string curta em pt-BR, máximo 140 caracteres). NUNCA execute nem prometa execução do pedido. Você só classifica para a equipe humana.",
          },
          { role: "user", content: `Negócio: ${businessName}\nPedido: ${message}` },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<AiClassification>;
    const cat = ["content", "design", "feature", "bug", "question", "other"].includes(parsed.category ?? "")
      ? (parsed.category as AiClassification["category"])
      : "other";
    const prio = ["low", "normal", "high"].includes(parsed.priority ?? "")
      ? (parsed.priority as AiClassification["priority"])
      : "normal";
    const summary = typeof parsed.summary === "string" && parsed.summary.length > 0
      ? parsed.summary.slice(0, 140)
      : message.slice(0, 140);
    return { category: cat, priority: prio, summary };
  } catch (err) {
    console.warn("[dev] classify failed", err);
    return fallback;
  }
}

export const listDevChangeRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("dev_change_requests")
      .select("id, message, ai_category, ai_summary, ai_priority, status, admin_response, created_at, resolved_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { requests: [], error: error.message };
    return { requests: rows ?? [], error: null };
  });

export const submitDevChangeRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; message: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    const msg = (data.message ?? "").trim();
    if (msg.length < 3) throw new Error("Mensagem muito curta");
    if (msg.length > 4000) throw new Error("Mensagem muito longa (máx. 4000 caracteres)");
    return { projectId: data.projectId, message: msg };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: project } = await supabase
      .from("dev_projects")
      .select("id, business_name, status")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) return { ok: false, error: "Projeto não encontrado", request: null };
    if (project.status === "cancelled") return { ok: false, error: "Projeto cancelado", request: null };

    // Rate limit: máx 8 pedidos abertos por projeto
    const { count: openCount } = await supabaseAdmin
      .from("dev_change_requests")
      .select("id", { count: "exact", head: true })
      .eq("project_id", data.projectId)
      .in("status", ["open", "in_progress"]);
    if ((openCount ?? 0) >= 8) {
      return { ok: false, error: "Você já tem 8 pedidos abertos. Aguarde nossa equipe responder antes de enviar mais.", request: null };
    }

    const classification = await classifyChangeRequest(data.message, project.business_name ?? "Projeto");

    const { data: task } = await supabaseAdmin
      .from("admin_tasks")
      .insert({
        user_id: userId,
        project_id: project.id,
        title: `[Dev · ${classification.category}] ${classification.summary}`,
        description: data.message,
        status: "pending",
      })
      .select("id")
      .maybeSingle();

    const { data: inserted, error } = await supabase
      .from("dev_change_requests")
      .insert({
        project_id: project.id,
        user_id: userId,
        message: data.message,
        ai_category: classification.category,
        ai_summary: classification.summary,
        ai_priority: classification.priority,
        admin_task_id: task?.id ?? null,
        status: "open",
      })
      .select("id, message, ai_category, ai_summary, ai_priority, status, admin_response, created_at, resolved_at")
      .maybeSingle();
    if (error || !inserted) return { ok: false, error: error?.message ?? "Falha ao registrar pedido", request: null };

    await supabaseAdmin.from("events").insert({
      event_type: "dev.change_request.created",
      user_id: userId,
      event_data: { projectId: project.id, requestId: inserted.id, category: classification.category, priority: classification.priority } as never,
    });

    return { ok: true, error: null, request: inserted };
  });

// ---------- admin ----------
export const adminListDevProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { projects: [], error: "Acesso restrito" };
    const { data, error } = await supabaseAdmin
      .from("dev_projects")
      .select("id, business_name, business_segment, template_slug, plan_slug, status, preview_url, published_url, user_id, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { projects: [], error: error.message };
    return { projects: data ?? [], error: null };
  });

export const adminUpdateDevProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; status?: string; previewUrl?: string; publishedUrl?: string; notes?: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    const allowed = ["briefing", "awaiting_payment", "queued", "in_production", "review", "published", "paused", "cancelled"];
    if (data.status && !allowed.includes(data.status)) throw new Error("Status inválido");
    if (data.previewUrl && data.previewUrl.length > 500) throw new Error("Preview URL inválida");
    if (data.publishedUrl && data.publishedUrl.length > 500) throw new Error("Published URL inválida");
    if (data.notes && data.notes.length > 5000) throw new Error("Notas muito longas");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { ok: false, error: "Acesso restrito" };
    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (typeof data.previewUrl === "string") patch.preview_url = data.previewUrl || null;
    if (typeof data.publishedUrl === "string") patch.published_url = data.publishedUrl || null;
    if (typeof data.notes === "string") patch.notes = data.notes;
    if (data.status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("dev_projects").update(patch as never).eq("id", data.projectId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null };
  });

export const adminRespondDevChangeRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { requestId: string; status: string; response?: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.requestId)) throw new Error("Invalid requestId");
    if (!["open", "in_progress", "done", "rejected"].includes(data.status)) throw new Error("Status inválido");
    if (data.response && data.response.length > 4000) throw new Error("Resposta muito longa");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { ok: false, error: "Acesso restrito" };
    const patch: Record<string, unknown> = { status: data.status };
    if (typeof data.response === "string") patch.admin_response = data.response;
    if (data.status === "done" || data.status === "rejected") patch.resolved_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("dev_change_requests").update(patch as never).eq("id", data.requestId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null };
  });

// ---------- versions ----------
export const listDevProjectVersions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("dev_project_versions")
      .select("id, version_number, notes, generated_site, created_at, created_by")
      .eq("project_id", data.projectId)
      .order("version_number", { ascending: false })
      .limit(50);
    if (error) return { versions: [], error: error.message };
    return { versions: rows ?? [], error: null };
  });

export const adminPublishDevVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; previewUrl?: string; publishedUrl?: string; notes?: string; markPublished?: boolean }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    if (data.previewUrl && data.previewUrl.length > 500) throw new Error("Preview URL inválida");
    if (data.publishedUrl && data.publishedUrl.length > 500) throw new Error("Published URL inválida");
    if (data.notes && data.notes.length > 4000) throw new Error("Notas muito longas");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { ok: false, error: "Acesso restrito" };

    const { data: last } = await supabaseAdmin
      .from("dev_project_versions")
      .select("version_number")
      .eq("project_id", data.projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersion = (last?.version_number ?? 0) + 1;

    const { error: vErr } = await supabaseAdmin.from("dev_project_versions").insert({
      project_id: data.projectId,
      version_number: nextVersion,
      notes: data.notes ?? "",
      generated_site: { previewUrl: data.previewUrl ?? null, publishedUrl: data.publishedUrl ?? null } as never,
      created_by: userId,
    });
    if (vErr) return { ok: false, error: vErr.message };

    const patch: Record<string, unknown> = {};
    if (data.previewUrl) patch.preview_url = data.previewUrl;
    if (data.publishedUrl) patch.published_url = data.publishedUrl;
    if (data.markPublished) {
      patch.status = "published";
      patch.published_at = new Date().toISOString();
    } else {
      patch.status = "review";
    }
    if (Object.keys(patch).length) {
      await supabaseAdmin.from("dev_projects").update(patch as never).eq("id", data.projectId);
    }

    await supabaseAdmin.from("events").insert({
      event_type: "dev.version.published",
      user_id: userId,
      event_data: { projectId: data.projectId, version: nextVersion, markPublished: !!data.markPublished } as never,
    });

    return { ok: true, error: null, version: nextVersion };
  });

// ---------- checkout ----------
export const createDevCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projectId: string; returnOrigin: string; environment: StripeEnv }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.projectId)) throw new Error("Invalid projectId");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    let parsed: URL;
    try { parsed = new URL(data.returnOrigin); } catch { throw new Error("Invalid returnOrigin"); }
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      throw new Error("Invalid returnOrigin protocol");
    }
    if (!ALLOWED_RETURN_HOSTS.has(parsed.hostname)) throw new Error("Disallowed return origin");
    return { projectId: data.projectId, returnOrigin: parsed.origin, environment: data.environment };
  })
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    const { data: project } = await supabase
      .from("dev_projects")
      .select("id, plan_slug, plan_id, business_name, status")
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) return { clientSecret: null, error: "Projeto não encontrado" };
    if (!project.plan_slug) return { clientSecret: null, error: "Plano do projeto não definido" };

    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser?.user?.email ?? undefined;

    try {
      const stripe = createStripeClient(data.environment);
      const activationKey = `${project.plan_slug}_activation`;
      const monthlyKey = `${project.plan_slug}_monthly`;

      const [activationList, monthlyList] = await Promise.all([
        stripe.prices.list({ lookup_keys: [activationKey], active: true, limit: 1 }),
        stripe.prices.list({ lookup_keys: [monthlyKey], active: true, limit: 1 }),
      ]);
      const activationPrice = activationList.data[0];
      const monthlyPrice = monthlyList.data[0];
      if (!activationPrice || !monthlyPrice) {
        return { clientSecret: null, error: "Preços do plano Dev não encontrados na Stripe" };
      }

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      const returnUrl = `${data.returnOrigin}/dev/projeto/${project.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`;

      const metadata = {
        userId,
        kind: "dev",
        devProjectId: project.id,
        devPlanSlug: project.plan_slug,
        planSlug: project.plan_slug,
      } as Record<string, string>;

      const params: Stripe.Checkout.SessionCreateParams = {
        line_items: [
          { price: monthlyPrice.id, quantity: 1 },
          { price: activationPrice.id, quantity: 1 },
        ],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: returnUrl,
        customer: customerId,
        metadata,
        subscription_data: { metadata },
      };

      const session = await stripe.checkout.sessions.create(params);
      if (!session.client_secret) return { clientSecret: null, error: "Falha ao criar sessão" };

      await supabaseAdmin.from("dev_payments").insert({
        user_id: userId,
        project_id: project.id,
        plan_id: project.plan_id,
        amount: (activationPrice.unit_amount ?? 0) + (monthlyPrice.unit_amount ?? 0),
        currency: "brl",
        status: "pending",
        stripe_checkout_session_id: session.id,
        stripe_customer_id: customerId,
        environment: data.environment,
      });

      await supabaseAdmin.from("events").insert({
        event_type: "dev.checkout.started",
        user_id: userId,
        event_data: { projectId: project.id, planSlug: project.plan_slug, sessionId: session.id } as never,
      });

      return { clientSecret: session.client_secret, error: null };
    } catch (err) {
      console.error("[dev-checkout] failed", err);
      return { clientSecret: null, error: err instanceof Error ? err.message : "Falha no checkout" };
    }
  });
