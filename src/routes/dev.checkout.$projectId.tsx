import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { useServerFn } from "@tanstack/react-start";
import { createDevCheckoutSession, getDevProject } from "@/lib/dev/dev.functions";
import { getDevPlan, formatBRL } from "@/lib/dev/plans";
import { getDevTemplate } from "@/lib/dev/templates";

export const Route = createFileRoute("/dev/checkout/$projectId")({
  component: DevCheckoutPage,
  head: () => ({ meta: [
    { title: "Pagamento · Flaro Dev" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

function DevCheckoutPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<{ plan_slug?: string | null; template_slug?: string | null; business_name?: string | null } | null>(null);
  const startedRef = useRef(false);

  const startCheckout = useServerFn(createDevCheckoutSession);
  const fetchProject = useServerFn(getDevProject);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: `/dev/checkout/${projectId}` } }); return; }
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const projRes = await fetchProject({ data: { projectId } });
        if (projRes.error || !projRes.project) throw new Error(projRes.error ?? "Projeto não encontrado");
        setProject(projRes.project as never);

        const res = await startCheckout({
          data: { projectId, returnOrigin: window.location.origin, environment: getStripeEnvironment() },
        });
        if (res.error || !res.clientSecret) throw new Error(res.error ?? "Falha ao iniciar pagamento");
        setClientSecret(res.clientSecret);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao iniciar pagamento";
        setError(msg);
        toast.error(msg);
      }
    })();
  }, [loading, user, projectId, navigate, startCheckout, fetchProject]);

  const plan = project?.plan_slug ? getDevPlan(project.plan_slug) : undefined;
  const template = project?.template_slug ? getDevTemplate(project.template_slug) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] w-full px-5 md:px-10 py-12 md:py-16 grid lg:grid-cols-5 gap-10">
        <section className="lg:col-span-3">
          <h1 className="editorial-headline text-5xl md:text-6xl text-ink">Pagamento</h1>
          <p className="mt-3 text-ink-soft">Ativação + primeira mensalidade do seu site Flaro Dev.</p>
          <div className="mt-8 card-elevated p-3 md:p-5">
            {error ? (
              <div className="p-5">
                <div className="text-destructive text-sm font-medium">{error}</div>
                <Link to="/dev/novo" className="mt-4 inline-flex text-sm text-ink-soft hover:text-ink">Voltar</Link>
              </div>
            ) : !clientSecret ? (
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-paper">
                <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="card-elevated p-7 sticky top-28">
            <div className="text-xs tracking-wide text-ink-soft">Resumo</div>
            <div className="mt-3 font-display font-black text-2xl text-ink">{plan?.name ?? "Plano Dev"}</div>
            <div className="text-sm text-ink-soft mt-1">{template?.name ?? "Modelo"}</div>
            {plan && (
              <div className="mt-5 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-ink-soft">Ativação</span><span className="text-ink font-medium">{formatBRL(plan.activationPrice)}</span></div>
                <div className="flex justify-between"><span className="text-ink-soft">Mensalidade</span><span className="text-ink font-medium">{formatBRL(plan.monthlyPrice)}/mês</span></div>
                <div className="border-t border-border mt-3 pt-3 flex justify-between text-base font-semibold">
                  <span className="text-ink-soft">Total hoje</span>
                  <span className="text-ink">{formatBRL(plan.activationPrice + plan.monthlyPrice)}</span>
                </div>
              </div>
            )}
            <p className="mt-5 text-[11px] text-ink-soft">Após confirmado, seu projeto entra na fila de produção e você acompanha tudo no painel.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
