import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/projeto/$id")({
  component: ProjectDeliveryPage,
  head: () => ({
    meta: [
      { title: "Meu projeto · Filro" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type ProjectStatus =
  | "new"
  | "payment_confirmed"
  | "briefing_received"
  | "in_production"
  | "revision_sent"
  | "awaiting_client"
  | "published"
  | "maintenance"
  | "paused"
  | "cancelled";

const STATUS_META: Record<ProjectStatus, { label: string; tone: string; description: string }> = {
  new: { label: "Novo", tone: "bg-muted text-ink", description: "Projeto recém-criado." },
  payment_confirmed: { label: "Pagamento confirmado", tone: "bg-azure/20 text-ink", description: "Recebemos seu pagamento. Em breve iniciamos." },
  briefing_received: { label: "Briefing recebido", tone: "bg-azure/30 text-ink", description: "Estamos analisando suas informações." },
  in_production: { label: "Em produção", tone: "bg-lime text-ink", description: "Nosso time está construindo seu site." },
  revision_sent: { label: "Revisão enviada", tone: "bg-amber-100 text-ink", description: "Enviamos uma versão para sua avaliação." },
  awaiting_client: { label: "Aguardando você", tone: "bg-amber-200 text-ink", description: "Precisamos do seu retorno para seguir." },
  published: { label: "Publicado", tone: "bg-lime text-ink", description: "Seu site está no ar!" },
  maintenance: { label: "Em manutenção", tone: "bg-muted text-ink", description: "Ajustes contínuos de mensalidade." },
  paused: { label: "Pausado", tone: "bg-muted text-ink", description: "Projeto pausado temporariamente." },
  cancelled: { label: "Cancelado", tone: "bg-flame/20 text-ink", description: "Projeto cancelado." },
};

const PIPELINE: ProjectStatus[] = [
  "payment_confirmed",
  "briefing_received",
  "in_production",
  "revision_sent",
  "published",
];

function ProjectDeliveryPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: `/projeto/${id}` } });
  }, [loading, user, id, navigate]);

  const projectQuery = useQuery({
    queryKey: ["delivery-project", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const historyQuery = useQuery({
    queryKey: ["delivery-history", id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("project_status_history")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const revisionsQuery = useQuery({
    queryKey: ["delivery-revisions", id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("project_revisions")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Realtime
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`delivery-${id}`)
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "projects", filter: `id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ["delivery-project", id] });
      })
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "project_status_history", filter: `project_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ["delivery-history", id] });
      })
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "project_revisions", filter: `project_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ["delivery-revisions", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, id, qc]);

  async function submitRevision(kind: "client_request" | "approval") {
    if (!user) return;
    if (kind === "client_request" && !message.trim()) {
      toast.error("Descreva o ajuste que você precisa.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("project_revisions").insert({
      project_id: id,
      kind,
      message: kind === "approval" ? (message.trim() || "Aprovado pelo cliente.") : message.trim(),
      created_by: user.id,
      status: kind === "approval" ? "resolved" : "open",
      resolved_by: kind === "approval" ? user.id : null,
      resolved_at: kind === "approval" ? new Date().toISOString() : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessage("");
    toast.success(kind === "approval" ? "Aprovação registrada!" : "Pedido de ajuste enviado!");
    qc.invalidateQueries({ queryKey: ["delivery-revisions", id] });
  }

  if (loading || projectQuery.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-ink-soft">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const project = projectQuery.data;

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 grid place-items-center px-6">
          <div className="max-w-md text-center space-y-3">
            <h1 className="editorial-headline text-3xl text-ink">Projeto não encontrado</h1>
            <p className="text-ink-soft text-sm">Verifique o link ou volte ao seu painel.</p>
            <Link to="/painel" className="inline-block mt-2 text-sm font-semibold text-ink underline">
              Ir para o painel
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const status = (project.project_status as ProjectStatus) ?? "new";
  const meta = STATUS_META[status];
  const currentStep = PIPELINE.indexOf(status);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="px-6 md:px-12 py-12 max-w-6xl mx-auto w-full">
          <Link to="/painel" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Voltar ao painel
          </Link>

          <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs tracking-wide text-ink-soft uppercase">Projeto</div>
              <h1 className="editorial-headline text-4xl md:text-5xl text-ink mt-1">
                {project.business_name || "Seu site"}
              </h1>
              {project.business_segment && (
                <p className="text-ink-soft mt-2 text-sm">{project.business_segment}</p>
              )}
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${meta.tone}`}>
              <Sparkles className="h-4 w-4" /> {meta.label}
            </span>
          </div>

          <p className="text-ink-soft mt-3 max-w-2xl">{meta.description}</p>

          {/* Pipeline visual */}
          <div className="mt-10 card-elevated p-6">
            <div className="text-xs tracking-wide text-ink-soft uppercase mb-4">Andamento</div>
            <div className="flex items-center justify-between gap-2">
              {PIPELINE.map((step, idx) => {
                const reached = currentStep >= idx;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center text-center">
                    <div className={`h-10 w-10 rounded-full grid place-items-center text-xs font-bold ${
                      reached ? "bg-ink text-paper" : "bg-muted text-ink-soft"
                    }`}>
                      {reached ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </div>
                    <div className={`mt-2 text-[11px] font-semibold ${reached ? "text-ink" : "text-ink-soft"}`}>
                      {STATUS_META[step].label}
                    </div>
                    {idx < PIPELINE.length - 1 && (
                      <div className="hidden md:block w-full h-px bg-border mt-5 -mb-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview / published links */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="card-elevated p-6">
              <div className="text-xs tracking-wide text-ink-soft uppercase">Preview de revisão</div>
              {project.preview_url ? (
                <div className="mt-3 space-y-3">
                  <a
                    href={project.preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline break-all"
                  >
                    {project.preview_url} <ExternalLink className="h-4 w-4" />
                  </a>
                  <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                    <iframe
                      src={project.preview_url}
                      title="Preview do projeto"
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-ink-soft text-sm mt-3">
                  Assim que sua primeira versão estiver pronta, o link de preview aparece aqui.
                </p>
              )}
            </div>
            <div className="card-elevated p-6">
              <div className="text-xs tracking-wide text-ink-soft uppercase">Site publicado</div>
              {project.published_url ? (
                <div className="mt-3 space-y-2">
                  <a
                    href={project.published_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline break-all"
                  >
                    {project.published_url} <ExternalLink className="h-4 w-4" />
                  </a>
                  {project.published_at && (
                    <p className="text-xs text-ink-soft">Publicado em {formatDateTime(project.published_at)}</p>
                  )}
                </div>
              ) : (
                <p className="text-ink-soft text-sm mt-3">
                  {project.expected_delivery_at
                    ? `Entrega prevista para ${formatDateTime(project.expected_delivery_at)}.`
                    : "Seu site ainda não foi publicado."}
                </p>
              )}
            </div>
          </div>

          {/* Revision center */}
          <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-ink" />
                <h2 className="font-display font-black text-2xl text-ink">Revisões e ajustes</h2>
              </div>
              <p className="text-ink-soft text-sm mt-1">
                Aprovar uma versão ou pedir um ajuste pontual.
              </p>

              <div className="mt-5">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Ex: trocar a foto da seção 'Sobre' e ajustar o telefone do rodapé."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm resize-y"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    disabled={submitting}
                    onClick={() => submitRevision("client_request")}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Enviar pedido de ajuste
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => submitRevision("approval")}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-lime text-ink text-sm font-semibold disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprovar versão atual
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {(revisionsQuery.data ?? []).map((r: any) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border p-4 bg-paper"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                      <span className="font-semibold uppercase tracking-wide">
                        {labelForKind(r.kind)}
                      </span>
                      <span>{formatDateTime(r.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink whitespace-pre-wrap">{r.message}</p>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === "resolved" ? "bg-lime text-ink" :
                        r.status === "in_progress" ? "bg-azure/20 text-ink" :
                        "bg-muted text-ink-soft"
                      }`}>
                        {labelForStatus(r.status)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {(revisionsQuery.data ?? []).length === 0 && (
                  <p className="text-ink-soft text-sm italic">Nenhuma revisão registrada ainda.</p>
                )}
              </div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-ink" />
                <h2 className="font-display font-black text-2xl text-ink">Linha do tempo</h2>
              </div>
              <div className="mt-5 space-y-3">
                {(historyQuery.data ?? []).map((h: any) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-ink mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-ink-soft">{formatDateTime(h.created_at)}</div>
                      <div className="text-sm text-ink font-medium">
                        {h.from_status
                          ? `${STATUS_META[h.from_status as ProjectStatus]?.label ?? h.from_status} → ${STATUS_META[h.to_status as ProjectStatus]?.label ?? h.to_status}`
                          : STATUS_META[h.to_status as ProjectStatus]?.label ?? h.to_status}
                      </div>
                    </div>
                  </div>
                ))}
                {(historyQuery.data ?? []).length === 0 && (
                  <p className="text-ink-soft text-sm italic">Sem histórico ainda.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function labelForKind(k: string) {
  return {
    client_request: "Pedido do cliente",
    admin_update: "Atualização do time",
    approval: "Aprovação",
    publish_note: "Publicação",
  }[k] ?? k;
}
function labelForStatus(s: string) {
  return { open: "Aberto", in_progress: "Em andamento", resolved: "Resolvido" }[s] ?? s;
}
