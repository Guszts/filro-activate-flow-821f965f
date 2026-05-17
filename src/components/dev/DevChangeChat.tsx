import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listDevChangeRequests, submitDevChangeRequest } from "@/lib/dev/dev.functions";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

type Request = {
  id: string;
  message: string;
  ai_category: string;
  ai_summary: string;
  ai_priority: string;
  status: string;
  admin_response: string;
  created_at: string;
  resolved_at: string | null;
};

const STATUS: Record<string, { label: string; tone: string }> = {
  open: { label: "Aberto", tone: "bg-amber-100 text-amber-900" },
  in_progress: { label: "Em andamento", tone: "bg-blue-100 text-blue-900" },
  done: { label: "Concluído", tone: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Recusado", tone: "bg-muted text-ink-soft" },
};

const CATEGORY: Record<string, string> = {
  content: "Conteúdo",
  design: "Design",
  feature: "Funcionalidade",
  bug: "Erro",
  question: "Dúvida",
  other: "Outro",
};

export function DevChangeChat({ projectId }: { projectId: string }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const fetchList = useServerFn(listDevChangeRequests);
  const submit = useServerFn(submitDevChangeRequest);

  const load = async () => {
    const res = await fetchList({ data: { projectId } });
    if (res.error) toast.error(res.error);
    else setRequests((res.requests ?? []) as Request[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await submit({ data: { projectId, message: message.trim() } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setMessage("");
        toast.success("Pedido enviado para nossa equipe.");
        await load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-paper p-6 md:p-8">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-xs tracking-wide text-ink-soft">Solicitações de alteração</div>
          <h3 className="mt-1 font-semibold text-lg text-ink">Chat com nossa equipe</h3>
        </div>
      </div>
      <p className="text-sm text-ink-soft mb-5">
        Descreva o que você quer mudar no site (textos, imagens, cores, novas seções, correções).
        Nossa IA organiza o pedido e a equipe humana executa.
      </p>

      <form onSubmit={handleSend} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: trocar o telefone na seção de contato para (92) 99999-9999"
          rows={3}
          maxLength={4000}
          className="w-full rounded-2xl border border-border bg-paper px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
          disabled={sending}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-ink-soft">{message.length}/4000</span>
          <button
            type="submit"
            disabled={sending || message.trim().length < 3}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Enviando..." : "Enviar pedido"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <div className="text-xs tracking-wide text-ink-soft mb-3">Histórico</div>
        {loading ? (
          <div className="text-sm text-ink-soft">Carregando...</div>
        ) : requests.length === 0 ? (
          <div className="text-sm text-ink-soft">Nenhum pedido ainda.</div>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const st = STATUS[r.status] ?? STATUS.open;
              return (
                <li key={r.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${st.tone}`}>
                      {st.label}
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      {CATEGORY[r.ai_category] ?? r.ai_category} · {r.ai_priority}
                    </span>
                    <span className="text-[11px] text-ink-soft ml-auto">
                      {new Date(r.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap">{r.message}</p>
                  {r.admin_response && (
                    <div className="mt-3 rounded-xl bg-paper border border-border p-3 text-sm text-ink">
                      <div className="text-[11px] tracking-wide text-ink-soft mb-1">Resposta da equipe</div>
                      <p className="whitespace-pre-wrap">{r.admin_response}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
