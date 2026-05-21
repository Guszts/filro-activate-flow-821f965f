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
      .select("id,sender_id,body,created_at")
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
    kind: z.enum(["question", "issue", "change_request", "feature_request"]).default("question"),
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
      sender_id: userId,
      body: message,
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
      sender_id: userId,
      body: message,
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
      .select("id,name,slug,price_cents,description,is_active")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });
    if (error) throw new Error(error.message);
    return fmt(data);
  },
});

export const allTools = [
  getMyProfile,
  listMyProjects,
  getProject,
  listMyPayments,
  listMyTickets,
  getTicket,
  createTicket,
  replyTicket,
  listPlans,
];
