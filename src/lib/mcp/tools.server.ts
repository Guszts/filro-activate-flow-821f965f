import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { McpAuthContext } from "./auth.server";

function ctx(auth: unknown): McpAuthContext {
  const c = (auth as { claims?: McpAuthContext } | undefined)?.claims;
  if (!c?.userId) throw new Error("Não autenticado");
  return c;
}

function fmt(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export const getMyProfile = defineTool({
  name: "get_my_profile",
  description: "Retorna dados do perfil do cliente Filro autenticado, incluindo nome, email, WhatsApp e plano atual.",
  parameters: z.object({}),
  execute: async (_params, { auth }) => {
    const { userId } = ctx(auth);
    const [{ data: profile }, { data: subs }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("name,email,whatsapp,business_name,business_segment")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("subscriptions")
        .select("id,status,plan_id,current_period_end")
        .eq("user_id", userId)
        .neq("status", "canceled")
        .limit(1),
    ]);
    const planIds = (subs ?? []).map((s) => s.plan_id).filter(Boolean);
    let planName: string | null = null;
    if (planIds.length) {
      const { data: plan } = await supabaseAdmin
        .from("plans")
        .select("name")
        .eq("id", planIds[0]!)
        .maybeSingle();
      planName = plan?.name ?? null;
    }
    return fmt({ profile, currentPlan: planName, subscriptions: subs ?? [] });
  },
});

export const listMyProjects = defineTool({
  name: "list_my_projects",
  description: "Lista todos os projetos do cliente Filro com status, prazo previsto, URL de preview e URL publicada.",
  parameters: z.object({}),
  execute: async (_params, { auth }) => {
    const { userId } = ctx(auth);
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("id,business_name,project_status,expected_delivery_at,preview_url,published_url,published_at,selected_model,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const getProject = defineTool({
  name: "get_project",
  description: "Detalha um projeto específico do cliente, incluindo histórico de status e revisões solicitadas.",
  parameters: z.object({
    projectId: z.string().uuid().describe("ID do projeto"),
  }),
  execute: async ({ projectId }, { auth }) => {
    const { userId } = ctx(auth);
    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) throw new Error("Projeto não encontrado");
    const [{ data: history }, { data: revisions }] = await Promise.all([
      supabaseAdmin
        .from("project_status_history")
        .select("from_status,to_status,created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("project_revisions")
        .select("id,description,status,created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);
    return fmt({ project, statusHistory: history ?? [], revisions: revisions ?? [] });
  },
});

export const listMyPayments = defineTool({
  name: "list_my_payments",
  description: "Lista pagamentos do cliente (assinaturas e cobranças extras) com status e valor em centavos.",
  parameters: z.object({}),
  execute: async (_params, { auth }) => {
    const { userId } = ctx(auth);
    const [{ data: payments }, { data: extras }] = await Promise.all([
      supabaseAdmin
        .from("payments")
        .select("id,amount,currency,status,created_at,description")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("extra_charges")
        .select("id,title,description,amount,status,created_at,paid_at,payment_link_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    return fmt({ payments: payments ?? [], extraCharges: extras ?? [] });
  },
});

export const listMyTickets = defineTool({
  name: "list_my_support_tickets",
  description: "Lista chamados de suporte do cliente com assunto, status e prioridade.",
  parameters: z.object({
    status: z.enum(["open", "in_progress", "waiting_client", "resolved", "closed"]).optional(),
  }),
  execute: async ({ status }, { auth }) => {
    const { userId } = ctx(auth);
    let query = supabaseAdmin
      .from("support_tickets")
      .select("id,subject,kind,priority,status,created_at,updated_at,project_id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const getTicket = defineTool({
  name: "get_support_ticket",
  description: "Retorna um chamado de suporte do cliente com todas as mensagens trocadas.",
  parameters: z.object({
    ticketId: z.string().uuid(),
  }),
  execute: async ({ ticketId }, { auth }) => {
    const { userId } = ctx(auth);
    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ticket) throw new Error("Chamado não encontrado");
    const { data: messages } = await supabaseAdmin
      .from("support_messages")
      .select("id,author_id,author_role,content,created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    return fmt({ ticket, messages: messages ?? [] });
  },
});

export const createTicket = defineTool({
  name: "create_support_ticket",
  description: "Abre um novo chamado de suporte para o cliente. Use quando o cliente quiser reportar um problema, fazer uma pergunta ou solicitar uma alteração no site.",
  parameters: z.object({
    subject: z.string().min(3).max(200).describe("Assunto do chamado"),
    message: z.string().min(5).max(5000).describe("Mensagem inicial detalhando a solicitação"),
    kind: z.enum(["question", "bug", "change_request", "cancellation", "other"]).default("question"),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    projectId: z.string().uuid().optional().describe("ID do projeto relacionado, se aplicável"),
  }),
  execute: async ({ subject, message, kind, priority, projectId }, { auth }) => {
    const { userId } = ctx(auth);
    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject,
        initial_message: message,
        kind,
        priority,
        project_id: projectId ?? null,
      })
      .select("id,subject,status")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("support_messages").insert({
      ticket_id: data.id,
      author_id: userId,
      author_role: "client",
      content: message,
    });
    return fmt({ ok: true, ticket: data });
  },
});

export const replyTicket = defineTool({
  name: "reply_support_ticket",
  description: "Responde a um chamado de suporte existente do cliente.",
  parameters: z.object({
    ticketId: z.string().uuid(),
    message: z.string().min(1).max(5000),
  }),
  execute: async ({ ticketId, message }, { auth }) => {
    const { userId } = ctx(auth);
    const { data: ticket } = await supabaseAdmin
      .from("support_tickets")
      .select("id,user_id,status")
      .eq("id", ticketId)
      .maybeSingle();
    if (!ticket || ticket.user_id !== userId) throw new Error("Chamado não encontrado");
    if (ticket.status === "closed") throw new Error("Chamado fechado");
    const { error } = await supabaseAdmin.from("support_messages").insert({
      ticket_id: ticketId,
      author_id: userId,
      author_role: "client",
      content: message,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    return fmt({ ok: true });
  },
});

export const listPlans = defineTool({
  name: "list_plans",
  description: "Lista os planos disponíveis no Filro com nome, preço e descrição. Útil para o cliente comparar opções.",
  parameters: z.object({}),
  execute: async () => {
    const { data, error } = await supabaseAdmin
      .from("plans")
      .select("id,name,slug,activation_price,monthly_price,description,features,hidden")
      .eq("active", true)
      .eq("hidden", false)
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

function requireAdmin(auth: unknown): McpAuthContext {
  const c = ctx(auth);
  if (!c.isAdmin) throw new Error("Acesso restrito a administradores");
  return c;
}

// ============ ADMIN TOOLS ============

export const adminListUsers = defineTool({
  name: "admin_list_users",
  description: "[ADMIN] Lista todos os usuários (clientes) do Filro com nome, email, WhatsApp e negócio. Opcionalmente filtra por texto.",
  parameters: z.object({
    search: z.string().optional().describe("Filtra por nome, email ou nome do negócio"),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ search, limit }, { auth }) => {
    requireAdmin(auth);
    let q = supabaseAdmin
      .from("profiles")
      .select("user_id,name,email,whatsapp,business_name,business_segment,created_at,account_type")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (search) {
      q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const adminListProjects = defineTool({
  name: "admin_list_projects",
  description: "[ADMIN] Lista todos os projetos com status, cliente associado e prazo. Pode filtrar por status.",
  parameters: z.object({
    status: z.string().optional().describe("Filtra por project_status (ex: new, in_progress, delivered)"),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ status, limit }, { auth }) => {
    requireAdmin(auth);
    let q = supabaseAdmin
      .from("projects")
      .select("id,user_id,business_name,project_status,expected_delivery_at,preview_url,published_url,assigned_admin_id,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("project_status", status as never);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const adminGetProject = defineTool({
  name: "admin_get_project",
  description: "[ADMIN] Detalha qualquer projeto (qualquer cliente) com histórico, revisões e perfil do cliente.",
  parameters: z.object({ projectId: z.string().uuid() }),
  execute: async ({ projectId }, { auth }) => {
    requireAdmin(auth);
    const { data: project, error } = await supabaseAdmin
      .from("projects").select("*").eq("id", projectId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) throw new Error("Projeto não encontrado");
    const [{ data: profile }, { data: history }, { data: revisions }] = await Promise.all([
      supabaseAdmin.from("profiles").select("name,email,whatsapp,business_name").eq("user_id", project.user_id).maybeSingle(),
      supabaseAdmin.from("project_status_history").select("from_status,to_status,created_at,note").eq("project_id", projectId).order("created_at", { ascending: true }),
      supabaseAdmin.from("project_revisions").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);
    return fmt({ project, client: profile, statusHistory: history ?? [], revisions: revisions ?? [] });
  },
});

export const adminUpdateProjectStatus = defineTool({
  name: "admin_update_project_status",
  description: "[ADMIN] Atualiza o status de um projeto. O histórico é registrado automaticamente.",
  parameters: z.object({
    projectId: z.string().uuid(),
    status: z.string().describe("Novo project_status (new, in_progress, review, delivered, published, etc.)"),
    note: z.string().optional(),
  }),
  execute: async ({ projectId, status, note }, { auth }) => {
    requireAdmin(auth);
    const patch: { project_status: string; notes?: string } = { project_status: status };
    if (note) patch.notes = note;
    const { error } = await supabaseAdmin.from("projects").update(patch as never).eq("id", projectId);
    if (error) throw new Error(error.message);
    return fmt({ ok: true });
  },
});

export const adminListTickets = defineTool({
  name: "admin_list_support_tickets",
  description: "[ADMIN] Lista TODOS os chamados de suporte de TODOS os clientes. Pode filtrar por status.",
  parameters: z.object({
    status: z.enum(["open", "in_progress", "waiting_client", "resolved", "closed"]).optional(),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ status, limit }, { auth }) => {
    requireAdmin(auth);
    let q = supabaseAdmin
      .from("support_tickets")
      .select("id,user_id,subject,kind,priority,status,project_id,created_at,updated_at,last_admin_reply_at")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const adminReplyTicket = defineTool({
  name: "admin_reply_support_ticket",
  description: "[ADMIN] Responde a qualquer chamado de suporte como administrador. Opcionalmente atualiza o status.",
  parameters: z.object({
    ticketId: z.string().uuid(),
    message: z.string().min(1).max(5000),
    newStatus: z.enum(["open", "in_progress", "waiting_client", "resolved", "closed"]).optional(),
  }),
  execute: async ({ ticketId, message, newStatus }, { auth }) => {
    const { userId } = requireAdmin(auth);
    const { error: msgErr } = await supabaseAdmin.from("support_messages").insert({
      ticket_id: ticketId, author_id: userId, author_role: "admin", content: message,
    });
    if (msgErr) throw new Error(msgErr.message);
    const patch: Record<string, unknown> = { last_admin_reply_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (newStatus) patch.status = newStatus;
    await supabaseAdmin.from("support_tickets").update(patch).eq("id", ticketId);
    return fmt({ ok: true });
  },
});

export const adminListPayments = defineTool({
  name: "admin_list_payments",
  description: "[ADMIN] Lista pagamentos recentes de todos os clientes. Pode filtrar por status.",
  parameters: z.object({
    status: z.string().optional(),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ status, limit }, { auth }) => {
    requireAdmin(auth);
    let q = supabaseAdmin
      .from("payments")
      .select("id,user_id,plan_id,amount,amount_paid,currency,status,paid_at,promo_code,created_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (status) q = q.eq("status", status as never);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const adminMetrics = defineTool({
  name: "admin_metrics",
  description: "[ADMIN] Resumo geral: total de usuários, projetos por status, tickets abertos, receita paga (últimos 30 dias em centavos).",
  parameters: z.object({}),
  execute: async (_p, { auth }) => {
    requireAdmin(auth);
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [users, projects, tickets, payments] = await Promise.all([
      supabaseAdmin.from("profiles").select("user_id", { count: "exact", head: true }),
      supabaseAdmin.from("projects").select("project_status"),
      supabaseAdmin.from("support_tickets").select("status").in("status", ["open", "in_progress", "waiting_client"]),
      supabaseAdmin.from("payments").select("amount_paid").eq("status", "paid").gte("created_at", since),
    ]);
    const projectByStatus: Record<string, number> = {};
    (projects.data ?? []).forEach((r) => {
      const s = String(r.project_status);
      projectByStatus[s] = (projectByStatus[s] ?? 0) + 1;
    });
    const revenue30d = (payments.data ?? []).reduce((acc, p) => acc + (p.amount_paid ?? 0), 0);
    return fmt({
      totalUsers: users.count ?? 0,
      projectByStatus,
      openTickets: tickets.data?.length ?? 0,
      revenue30dCents: revenue30d,
    });
  },
});

export const allTools = [
  // Client-facing (work for any token holder, scoped to self)
  getMyProfile,
  listMyProjects,
  getProject,
  listMyPayments,
  listMyTickets,
  getTicket,
  createTicket,
  replyTicket,
  listPlans,
  // Admin-only (require admin role on the token's user)
  adminListUsers,
  adminListProjects,
  adminGetProject,
  adminUpdateProjectStatus,
  adminListTickets,
  adminReplyTicket,
  adminListPayments,
  adminMetrics,
];

