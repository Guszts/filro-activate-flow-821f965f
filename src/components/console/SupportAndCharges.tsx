import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime } from "@/lib/format";
import { createExtraCharge, replySupportTicket } from "@/lib/support.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";
import { Loader2, Send, Plus, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "open", label: "Aberto" },
  { value: "in_progress", label: "Em andamento" },
  { value: "waiting_client", label: "Aguardando cliente" },
  { value: "resolved", label: "Resolvido" },
  { value: "closed", label: "Fechado" },
] as const;

export function SupportTab() {
  const qc = useQueryClient();
  const reply = useServerFn(replySupportTicket);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [sending, setSending] = useState(false);

  const { data } = useQuery({
    queryKey: ["console-tickets"],
    queryFn: async () => {
      const [tickets, profiles] = await Promise.all([
        supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name, email"),
      ]);
      return { tickets: tickets.data ?? [], profiles: profiles.data ?? [] };
    },
  });

  const messages = useQuery({
    queryKey: ["console-ticket-messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      if (!activeId) return [];
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", activeId)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel(`console-support-${Math.random()}`)
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "support_tickets" }, () => {
        qc.invalidateQueries({ queryKey: ["console-tickets"] });
      })
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "support_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["console-ticket-messages", activeId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, activeId]);

  async function send() {
    if (!activeId || !content.trim()) return;
    setSending(true);
    try {
      await reply({ data: { ticketId: activeId, content: content.trim(), newStatus: newStatus || undefined } });
      setContent("");
      setNewStatus("");
      toast.success("Resposta enviada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao responder.");
    } finally {
      setSending(false);
    }
  }

  const active = data?.tickets.find((t) => t.id === activeId);
  const profile = active ? data?.profiles.find((p) => p.user_id === active.user_id) : undefined;

  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Suporte</h1>
      <p className="text-ink-soft mt-2 text-sm">Tickets abertos pelos clientes.</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_1.5fr] gap-4">
        <div className="card-elevated p-4 max-h-[70vh] overflow-y-auto space-y-2">
          {(data?.tickets ?? []).length === 0 && <p className="text-sm text-ink-soft italic">Nenhum chamado ainda.</p>}
          {(data?.tickets ?? []).map((t) => {
            const prof = data?.profiles.find((p) => p.user_id === t.user_id);
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  activeId === t.id ? "border-ink bg-muted" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-ink truncate">{t.subject}</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-ink-soft shrink-0">
                    {t.status}
                  </span>
                </div>
                <div className="text-[11px] text-ink-soft mt-1">
                  {prof?.name || prof?.email || "—"} · {formatDateTime(t.created_at)}
                </div>
              </button>
            );
          })}
        </div>

        <div className="card-elevated p-5">
          {!active ? (
            <p className="text-sm text-ink-soft italic">Selecione um ticket à esquerda.</p>
          ) : (
            <div>
              <div className="pb-3 border-b border-border">
                <div className="font-semibold text-ink">{active.subject}</div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {profile?.name || profile?.email} · {active.kind} · {active.priority}
                </div>
              </div>
              <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                {(messages.data ?? []).map((m) => (
                  <div key={m.id} className={`p-3 rounded-xl ${m.author_role === "admin" ? "bg-lime/30 mr-8" : "bg-muted ml-8"}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">
                      {m.author_role === "admin" ? "Você (admin)" : "Cliente"} · {formatDateTime(m.created_at)}
                    </div>
                    <p className="text-sm text-ink whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Responder ao cliente..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm"
                />
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-border bg-paper text-sm"
                  >
                    <option value="">Manter status ({active.status})</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={send}
                    disabled={sending}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExtraChargesTab() {
  const qc = useQueryClient();
  const createCharge = useServerFn(createExtraCharge);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", projectId: "", title: "", description: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["console-extra-charges"],
    queryFn: async () => {
      const [charges, profiles] = await Promise.all([
        supabase.from("extra_charges").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name, email"),
      ]);
      return { charges: charges.data ?? [], profiles: profiles.data ?? [] };
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel(`console-charges-${Math.random()}`)
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "extra_charges" }, () => {
        qc.invalidateQueries({ queryKey: ["console-extra-charges"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  async function submit() {
    const cents = Math.round(parseFloat(form.amount.replace(",", ".")) * 100);
    if (!form.userId || !form.title || !cents || cents < 100) {
      toast.error("Preencha cliente, título e valor (mínimo R$ 1,00).");
      return;
    }
    setSubmitting(true);
    try {
      await createCharge({
        data: {
          userId: form.userId,
          projectId: form.projectId || null,
          title: form.title,
          description: form.description,
          amount: cents,
          environment: getStripeEnvironment(),
        },
      });
      toast.success("Cobrança criada e link de pagamento gerado.");
      setForm({ userId: "", projectId: "", title: "", description: "", amount: "" });
      setShowForm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao criar cobrança.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Cobranças extras</h1>
          <p className="text-ink-soft mt-2 text-sm">Upsell e cobranças avulsas (página extra, redesign, etc).</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova cobrança"}
        </button>
      </div>

      {showForm && (
        <div className="mt-6 card-elevated p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Cliente</label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink"
              >
                <option value="">Selecionar...</option>
                {(data?.profiles ?? []).map((p) => (
                  <option key={p.user_id} value={p.user_id}>{p.name || p.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="99,00"
                className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Título</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Página extra de portfólio"
              className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-ink-soft uppercase tracking-wide">Descrição (opcional)</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm"
            />
          </div>
          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-lime text-ink text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Gerar cobrança
          </button>
        </div>
      )}

      <div className="mt-8 card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Criada</th>
              </tr>
            </thead>
            <tbody>
              {(data?.charges ?? []).map((c) => {
                const p = data?.profiles.find((x) => x.user_id === c.user_id);
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3">{p?.name || p?.email || "—"}</td>
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3">{formatBRL(c.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                        c.status === "paid" ? "bg-lime text-ink" :
                        c.status === "sent" ? "bg-azure/20 text-ink" :
                        "bg-muted text-ink-soft"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {c.payment_link ? (
                        <a href={c.payment_link} target="_blank" rel="noreferrer" className="text-ink underline text-xs">
                          abrir
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-soft text-xs">{formatDateTime(c.created_at)}</td>
                  </tr>
                );
              })}
              {(data?.charges ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-soft">Nenhuma cobrança extra ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
