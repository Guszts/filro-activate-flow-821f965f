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
