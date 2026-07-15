import { createServerFn } from "@tanstack/react-start";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendTransactionalEmailServer } from "@/lib/email/send.server";

const PANEL_URL = "https://setup.filro.site/painel";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPPORT_STATUSES = new Set(["open", "in_progress", "waiting_client", "resolved", "closed"]);

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

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
 * Admin cria uma cobrança extra (upsell) e gera um Stripe Payment Link.
 * No embedded checkout — an admin sends a payment link to the client.
 */
export const createExtraCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    userId: string;
    projectId?: string | null;
    title: string;
    description?: string;
    amount: number; // cents
    environment: StripeEnv;
  }) => {
    if (!data.title || data.title.length > 200) throw new Error("Título inválido");
    if (data.description && data.description.length > 2000) throw new Error("Description too long");
    if (!Number.isInteger(data.amount) || data.amount < 100 || data.amount > 10_000_000) {
      throw new Error("Valor inválido");
    }
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Ambiente inválido");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const stripe = createStripeClient(data.environment);

    // 1. Cria produto avulso
    const product = await stripe.products.create({
      name: data.title,
      description: data.description || undefined,
      tax_code: "txcd_10103001",
      metadata: { lovable_external_id: `extra_${Date.now()}`, kind: "extra_charge", userId: data.userId },
    });

    // 2. Cria price one-time
    const price = await stripe.prices.create({
      currency: "brl",
      unit_amount: data.amount,
      product: product.id,
    });

    // 3. Cria payment link
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        userId: data.userId,
        kind: "extra_charge",
      },
    });

    // 4. Persiste cobrança em rascunho/enviada
    const { data: charge, error } = await supabaseAdmin
      .from("extra_charges")
      .insert({
        user_id: data.userId,
        project_id: data.projectId ?? null,
        title: data.title,
        description: data.description ?? "",
        amount: data.amount,
        currency: "brl",
        status: "sent",
        environment: data.environment,
        payment_link: link.url,
        created_by: context.userId,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // 5. Atualiza payment link para incluir o id da cobrança no metadata
    await stripe.paymentLinks.update(link.id, {
      metadata: {
        userId: data.userId,
        kind: "extra_charge",
        extraChargeId: charge.id,
      },
    });

    // Email cobrança ao cliente
    try {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("name,email")
        .eq("user_id", data.userId)
        .maybeSingle();
      if (prof?.email) {
        await sendTransactionalEmailServer({
          templateName: "extra-charge-issued",
          recipientEmail: prof.email,
          idempotencyKey: `extra-${charge.id}`,
          templateData: {
            name: prof.name || undefined,
            title: data.title,
            description: data.description || undefined,
            amount: formatBRL(data.amount),
            paymentLink: link.url,
          },
        });
      }
    } catch (e) { console.error("[email] extra-charge failed", e); }

    return { ok: true, charge };
  });

/**
 * Cliente cria um ticket de suporte.
 * RLS já cobre, mas usamos serverFn para anexar metadados/notificações futuras.
 */
export const createSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    subject: string;
    message: string;
    kind: "question" | "change_request" | "bug" | "cancellation" | "other";
    projectId?: string | null;
    priority?: "low" | "normal" | "high" | "urgent";
  }) => {
    if (!data.subject || data.subject.length > 200) throw new Error("Assunto inválido");
    if (!data.message || data.message.length > 5000) throw new Error("Mensagem inválida");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        user_id: userId,
        project_id: data.projectId ?? null,
        subject: data.subject,
        initial_message: data.message,
        kind: data.kind,
        priority: data.priority ?? (data.kind === "bug" ? "high" : "normal"),
        status: "open",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("support_messages").insert({
      ticket_id: ticket.id,
      author_id: userId,
      author_role: "client",
      content: data.message,
    });

    return { ok: true, ticket };
  });

/**
 * Admin responde a um ticket (ou move status).
 */
export const replySupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string; content: string; newStatus?: string }) => {
    if (!UUID_RE.test(data.ticketId)) throw new Error("Ticket inválido");
    if (!data.content || data.content.length > 5000) throw new Error("Resposta inválida");
    const newStatus = data.newStatus && SUPPORT_STATUSES.has(data.newStatus) ? data.newStatus : undefined;
    if (data.newStatus && !newStatus) throw new Error("Status inválido");
    return { ticketId: data.ticketId, content: data.content, newStatus };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error: msgErr } = await supabaseAdmin.from("support_messages").insert({
      ticket_id: data.ticketId,
      author_id: context.userId,
      author_role: "admin",
      content: data.content,
    });
    if (msgErr) throw new Error(msgErr.message);

    const update: { last_admin_reply_at: string; status?: "open" | "in_progress" | "waiting_client" | "resolved" | "closed" } = {
      last_admin_reply_at: new Date().toISOString(),
    };
    if (data.newStatus) update.status = data.newStatus as typeof update.status;
    await supabaseAdmin.from("support_tickets").update(update).eq("id", data.ticketId);

    // Notifica cliente
    try {
      const { data: ticket } = await supabaseAdmin
        .from("support_tickets")
        .select("user_id,subject")
        .eq("id", data.ticketId)
        .maybeSingle();
      if (ticket) {
        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("name,email")
          .eq("user_id", ticket.user_id)
          .maybeSingle();
        if (prof?.email) {
          await sendTransactionalEmailServer({
            templateName: "support-reply",
            recipientEmail: prof.email,
            idempotencyKey: `support-${data.ticketId}-${Date.now()}`,
            templateData: {
              name: prof.name || undefined,
              ticketSubject: ticket.subject,
              ticketUrl: `${PANEL_URL}/suporte`,
              preview: data.content.slice(0, 400),
            },
          });
        }
      }
    } catch (e) { console.error("[email] support-reply failed", e); }

    return { ok: true };
  });
