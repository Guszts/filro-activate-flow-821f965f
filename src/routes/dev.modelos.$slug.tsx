import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getDevTemplate, DEV_TEMPLATES, type DevTemplate } from "@/lib/dev/templates";
import { getDevPlan, formatBRL } from "@/lib/dev/plans";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/dev/modelos/$slug")({
  loader: ({ params }) => {
    const template = getDevTemplate(params.slug);
    if (!template) throw notFound();
    return { template };
  },
  component: DevTemplateDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[800px] px-5 md:px-10 py-24 text-center">
        <h1 className="editorial-headline text-4xl md:text-6xl text-ink">Modelo não encontrado</h1>
        <p className="mt-4 text-ink-soft">O modelo que você tentou abrir não existe ou foi removido.</p>
        <Link to="/dev/modelos" className="mt-8 inline-flex items-center h-12 px-6 rounded-2xl bg-ink text-paper font-semibold">
          Ver todos os modelos
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[800px] px-5 md:px-10 py-24 text-center">
        <h1 className="editorial-headline text-3xl text-ink">Algo deu errado</h1>
        <p className="mt-4 text-sm text-ink-soft">{error.message}</p>
      </main>
      <SiteFooter />
    </div>
  ),
  head: ({ params }) => {
    const template = getDevTemplate(params.slug);
    const title = template ? `${template.name} · Modelo Flaro Dev` : "Modelo · Flaro Dev";
    const description = template?.description ?? "Modelo Flaro Dev.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `https://setup.filro.site/dev/modelos/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `https://setup.filro.site/dev/modelos/${params.slug}` }],
    };
  },
});

function DevTemplateDetailPage() {
  const data = Route.useLoaderData() as { template: DevTemplate };
  const t = data.template;
  const plan = getDevPlan(t.recommendedPlan);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1100px] px-5 md:px-10 pt-10 md:pt-16 pb-10">
          <Link to="/dev/modelos" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
            <ArrowLeft className="h-4 w-4" /> Todos os modelos
          </Link>
          <div className="mt-6 text-xs uppercase tracking-widest text-ink-soft">{t.segment}</div>
          <h1 className="mt-3 editorial-headline text-5xl md:text-7xl text-ink">{t.name}</h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty text-lg">{t.longDescription}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dev" hash="planos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold hover:scale-[1.02] transition-transform">
              Usar este modelo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/dev/modelos" className="inline-flex items-center h-14 px-8 rounded-2xl border border-border bg-paper text-ink font-semibold hover:bg-muted transition-colors">
              Ver outros modelos
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 md:px-10 pb-10 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-border bg-paper p-6">
            <div className="text-xs uppercase tracking-widest text-ink-soft">Seções incluídas</div>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {t.sections.map((s) => (
                <li key={s} className="flex gap-2"><Check className="h-4 w-4 text-flame mt-0.5" /> {s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-paper p-6">
            <div className="text-xs uppercase tracking-widest text-ink-soft">Indicado para</div>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {t.bestFor.map((s) => (
                <li key={s} className="flex gap-2"><Check className="h-4 w-4 text-flame mt-0.5" /> {s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-paper p-6">
            <div className="text-xs uppercase tracking-widest text-ink-soft">O que você personaliza</div>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {t.customizable.map((s) => (
                <li key={s} className="flex gap-2"><Check className="h-4 w-4 text-flame mt-0.5" /> {s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-paper p-6">
            <div className="text-xs uppercase tracking-widest text-ink-soft">Informações necessárias</div>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {t.requiredInfo.map((s) => (
                <li key={s} className="flex gap-2"><Check className="h-4 w-4 text-flame mt-0.5" /> {s}</li>
              ))}
            </ul>
          </div>
        </section>

        {plan && (
          <section className="mx-auto max-w-[1100px] px-5 md:px-10 pb-10">
            <div className="rounded-2xl border border-border bg-paper p-6 md:p-8">
              <div className="text-xs uppercase tracking-widest text-ink-soft">Plano recomendado</div>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold text-ink">{plan.name}</div>
                  <p className="text-sm text-ink-soft mt-1">{plan.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink">{formatBRL(plan.activationPrice)}<span className="text-sm font-normal text-ink-soft"> ativação</span></div>
                  <div className="text-sm text-ink-soft">+ {formatBRL(plan.monthlyPrice)}/mês</div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1100px] px-5 md:px-10 py-10">
          <div className="text-xs uppercase tracking-widest text-ink-soft">Outros modelos</div>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {DEV_TEMPLATES.filter((x) => x.slug !== t.slug).slice(0, 3).map((x) => (
              <Link
                key={x.slug}
                to="/dev/modelos/$slug"
                params={{ slug: x.slug }}
                className="rounded-2xl border border-border bg-paper p-5 hover:border-ink/40 transition-colors"
              >
                <div className="text-xs text-ink-soft">{x.segment}</div>
                <div className="mt-2 font-semibold text-ink">{x.name}</div>
                <p className="mt-2 text-sm text-ink-soft line-clamp-2">{x.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 md:px-10 py-16">
          <div className="rounded-[2.5rem] border border-border bg-paper p-10 md:p-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Próximo passo</span>
              <h2 className="mt-4 editorial-headline text-3xl md:text-5xl text-ink max-w-2xl">
                Escolha o plano e comece o briefing
              </h2>
            </div>
            <Link to="/dev" hash="planos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold hover:scale-[1.02] transition-transform self-start md:self-end">
              Ver planos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
