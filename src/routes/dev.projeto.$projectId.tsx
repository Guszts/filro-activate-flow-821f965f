import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { getDevProject } from "@/lib/dev/dev.functions";
import { getDevPlan } from "@/lib/dev/plans";
import { getDevTemplate } from "@/lib/dev/templates";

const SearchSchema = z.object({
  checkout: z.string().optional(),
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/dev/projeto/$projectId")({
  validateSearch: SearchSchema,
  component: ProjetoPage,
  head: () => ({ meta: [
    { title: "Meu projeto · Flaro Dev" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

type DevProjectRow = {
  id: string;
  business_name: string | null;
  business_segment: string | null;
  status: string;
  template_slug: string | null;
  plan_slug: string | null;
  preview_url: string | null;
  published_url: string | null;
  briefing: Record<string, unknown> | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  briefing: { label: "Briefing em preenchimento", tone: "bg-muted text-ink-soft" },
  awaiting_payment: { label: "Aguardando pagamento", tone: "bg-orange-100 text-orange-800" },
  queued: { label: "Pagamento confirmado — na fila", tone: "bg-emerald-100 text-emerald-800" },
  in_production: { label: "Em produção", tone: "bg-blue-100 text-blue-800" },
  review: { label: "Pronto para revisão", tone: "bg-violet-100 text-violet-800" },
  published: { label: "Site publicado", tone: "bg-emerald-100 text-emerald-800" },
  paused: { label: "Pausado", tone: "bg-muted text-ink-soft" },
  cancelled: { label: "Cancelado", tone: "bg-muted text-ink-soft" },
};

function ProjetoPage() {
  const { projectId } = Route.useParams();
  const { checkout } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [project, setProject] = useState<DevProjectRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchProject = useServerFn(getDevProject);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: `/dev/projeto/${projectId}` } }); return; }
    (async () => {
      const res = await fetchProject({ data: { projectId } });
      if (res.error) setError(res.error);
      else setProject(res.project as DevProjectRow | null);
    })();
  }, [loading, user, projectId, navigate, fetchProject]);

  const plan = project?.plan_slug ? getDevPlan(project.plan_slug) : undefined;
  const template = project?.template_slug ? getDevTemplate(project.template_slug) : undefined;
  const status = project ? STATUS_LABEL[project.status] ?? { label: project.status, tone: "bg-muted text-ink-soft" } : null;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] w-full px-5 md:px-10 py-12 md:py-16">
        <nav className="text-xs text-ink-soft mb-4">
          <Link to="/dev" className="hover:text-ink">Flaro Dev</Link> <span className="mx-1">/</span> Meu projeto
        </nav>

        {checkout === "success" && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-900 text-sm">
            Pagamento recebido. Seu projeto entrou na fila de produção e nossa equipe vai começar nas próximas horas.
          </div>
        )}

        {error && <div className="text-destructive text-sm">{error}</div>}

        {!project && !error && (
          <div className="space-y-3">
            <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-40 w-full bg-muted rounded-2xl animate-pulse" />
          </div>
        )}

        {project && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="editorial-headline text-4xl md:text-5xl text-ink">{project.business_name || "Meu projeto"}</h1>
                <p className="mt-2 text-ink-soft text-sm">
                  {template?.name ?? "Modelo"} · Plano {plan?.name ?? "—"}
                </p>
              </div>
              {status && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.tone}`}>
                  {status.label}
                </span>
              )}
            </div>

            <section className="mt-10 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl border border-border bg-paper p-6 md:p-8">
                <div className="text-xs tracking-wide text-ink-soft">Preview do site</div>
                {project.preview_url ? (
                  <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
                    <iframe src={project.preview_url} title="Preview" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="mt-4 aspect-video w-full rounded-2xl border border-dashed border-border bg-muted/40 flex items-center justify-center text-sm text-ink-soft">
                    O preview aparece aqui assim que a primeira versão estiver pronta.
                  </div>
                )}
                {project.published_url && (
                  <a href={project.published_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 px-5 items-center rounded-xl bg-ink text-paper font-semibold text-sm">
                    Ver site publicado →
                  </a>
                )}
              </div>

              <aside className="rounded-3xl border border-border bg-muted/30 p-6">
                <div className="text-xs tracking-wide text-ink-soft">Próximos passos</div>
                <ol className="mt-3 space-y-3 text-sm text-ink">
                  <li>1. Equipe revisa briefing e prepara a primeira versão.</li>
                  <li>2. Preview disponível para sua revisão.</li>
                  <li>3. Solicitações de mudanças pelo chat do projeto.</li>
                  <li>4. Publicação no seu domínio ou subdomínio Filro.</li>
                </ol>
                <div className="mt-6 text-xs text-ink-soft">
                  Chat de alterações chega na próxima fase. Por enquanto, dúvidas podem ser enviadas por <Link to="/painel/suporte" className="underline">Suporte</Link>.
                </div>
              </aside>
            </section>

            <section className="mt-10 rounded-3xl border border-border bg-paper p-6 md:p-8">
              <div className="text-xs tracking-wide text-ink-soft">Briefing enviado</div>
              <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <Info label="Segmento" value={project.business_segment} />
                <Info label="WhatsApp" value={(project.briefing as Record<string,string> | null)?.whatsapp} />
                <Info label="Cidade" value={(project.briefing as Record<string,string> | null)?.city} />
                <Info label="Cores" value={(project.briefing as Record<string,string> | null)?.colors} />
                <Info label="Tom" value={(project.briefing as Record<string,string> | null)?.tone} />
                <Info label="Oferta" value={(project.briefing as Record<string,string> | null)?.offer} />
              </dl>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-1 text-ink">{value && value.trim() ? value : "—"}</dd>
    </div>
  );
}
