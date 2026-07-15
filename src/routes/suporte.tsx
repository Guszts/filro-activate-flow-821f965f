import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime } from "@/lib/format";
import { createSupportTicket } from "@/lib/support.functions";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2, MessageSquare, Plus, Send } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/suporte")({
  component: SupportPage,
  head: () => ({
    meta: [
      { title: "Support · Filro" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const KIND_LABELS = {
  question: "Dúvida",
  change_request: "Pedido de ajuste",
  bug: "Error / problema",
  cancellation: "Cancellation",
  other: "Outro",
} as const;

const STATUS_LABELS: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  waiting_client: "Waiting on you",
  resolved: "Resolvido",
  closed: "Fechado",
};

const STATUS_TONE: Record<string, string> = {
  open: "bg-azure/20 text-ink",
  in_progress: "bg-amber-100 text-ink",
  waiting_client: "bg-amber-200 text-ink",
  resolved: "bg-lime text-ink",
  closed: "bg-muted text-ink-soft",
};

function SupportPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createTicket = useServerFn(createSupportTicket);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    kind: "question" as keyof typeof KIND_LABELS,
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/suporte" } });
  }, [loading, user, navigate]);

  const ticketsQuery = useQuery({
    queryKey: ["my-tickets"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const chargesQuery = useQuery({
    queryKey: ["my-extra-charges"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("extra_charges")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["ticket-messages", activeTicketId],
    enabled: !!activeTicketId,
    queryFn: async () => {
      if (!activeTicketId) return [];
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", activeTicketId)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`suporte-${user.id}`)
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "support_tickets" }, () => {
        qc.invalidateQueries({ queryKey: ["my-tickets"] });
      })
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "support_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["ticket-messages", activeTicketId] });
      })
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "extra_charges" }, () => {
        qc.invalidateQueries({ queryKey: ["my-extra-charges"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, activeTicketId, qc]);

  async function submitTicket() {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please provide a subject and description.");
      return;
    }
    setSubmitting(true);
    try {
      await createTicket({ data: { ...form } });
      toast.success("Chamado aberto! Nossa equipe responde within 1 business day.");
      setForm({ subject: "", message: "", kind: "question" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed ao abrir chamado.");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply() {
    if (!activeTicketId || !reply.trim() || !user) return;
    const { error } = await supabase.from("support_messages").insert({
      ticket_id: activeTicketId,
      author_id: user.id,
      author_role: "client",
      content: reply.trim(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setReply("");
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-ink-soft">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const tickets = ticketsQuery.data ?? [];
  const charges = chargesQuery.data ?? [];
  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="px-6 md:px-12 py-12 max-w-6xl mx-auto w-full">
          <Link to="/painel" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back ao painel
          </Link>

          <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs tracking-wide text-ink-soft uppercase">Atendimento</div>
              <h1 className="editorial-headline text-4xl md:text-5xl text-ink mt-1">Support</h1>
              <p className="text-ink-soft mt-2 text-sm">
                Abra um chamado, acompanhe respostas e veja suas cobranças extras.
              </p>
            </div>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> New chamado
            </button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 card-elevated p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Tipo</label>
                  <select
                    value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value as typeof form.kind })}
                    className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink"
                  >
                    {Object.entries(KIND_LABELS).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Ex: Trocar foto do banner principal"
                    className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Description</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe what you need in detail."
                  className="mt-1 w-full px-3 py-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm resize-y"
                />
              </div>
              <button
                onClick={submitTicket}
                disabled={submitting}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-lime text-ink text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send chamado
              </button>
            </motion.div>
          )}

          {/* Charges extras */}
          {charges.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display font-black text-2xl text-ink">Charges extras</h2>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {charges.map((c) => (
                  <div key={c.id} className="card-elevated p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-ink">{c.title}</div>
                        {c.description && <p className="text-xs text-ink-soft mt-1">{c.description}</p>}
                      </div>
                      <span className={`shrink-0 inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                        c.status === "paid" ? "bg-lime text-ink" :
                        c.status === "sent" ? "bg-azure/20 text-ink" :
                        c.status === "cancelled" || c.status === "refunded" ? "bg-flame/20 text-ink" :
                        "bg-muted text-ink-soft"
                      }`}>
                        {c.status === "paid" ? "Paid" :
                         c.status === "sent" ? "Awaiting payment" :
                         c.status === "cancelled" ? "Canceled" :
                         c.status === "refunded" ? "Reembolsado" : "Rascunho"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="font-display font-black text-xl text-ink">{formatBRL(c.amount)}</div>
                      {c.status === "sent" && c.payment_link && (
                        <a
                          href={c.payment_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-ink text-paper text-sm font-semibold"
                        >
                          Pagar agora <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets */}
          <div className="mt-10 grid lg:grid-cols-[1fr_1.4fr] gap-6">
            <div className="card-elevated p-5">
              <h2 className="font-display font-black text-2xl text-ink mb-4">Meus chamados</h2>
              <div className="space-y-2">
                {tickets.length === 0 && (
                  <p className="text-sm text-ink-soft italic">You haven't opened any tickets yet.</p>
                )}
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      activeTicketId === t.id ? "border-ink bg-muted" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm text-ink truncate">{t.subject}</div>
                      <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_TONE[t.status] ?? "bg-muted text-ink-soft"}`}>
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-soft mt-1">
                      {KIND_LABELS[t.kind as keyof typeof KIND_LABELS] ?? t.kind} · {formatDateTime(t.created_at)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-ink" />
                <h2 className="font-display font-black text-2xl text-ink">Conversa</h2>
              </div>
              {!activeTicket ? (
                <p className="text-sm text-ink-soft italic">Select a ticket to see messages.</p>
              ) : (
                <div>
                  <div className="pb-3 border-b border-border">
                    <div className="font-semibold text-ink">{activeTicket.subject}</div>
                    <div className="text-xs text-ink-soft mt-0.5">
                      {KIND_LABELS[activeTicket.kind as keyof typeof KIND_LABELS]} · {STATUS_LABELS[activeTicket.status]}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {(messagesQuery.data ?? []).map((m) => (
                      <div key={m.id} className={`p-3 rounded-xl ${m.author_role === "admin" ? "bg-lime/30 ml-0 mr-8" : "bg-muted ml-8 mr-0"}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">
                          {m.author_role === "admin" ? "Filro Team" : "You"} · {formatDateTime(m.created_at)}
                        </div>
                        <p className="text-sm text-ink whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ))}
                  </div>
                  {activeTicket.status !== "closed" && (
                    <div className="mt-4 flex gap-2">
                      <input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") sendReply(); }}
                        placeholder="Escreva uma resposta..."
                        className="flex-1 h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm"
                      />
                      <button onClick={sendReply} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-ink text-paper text-sm font-semibold">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
