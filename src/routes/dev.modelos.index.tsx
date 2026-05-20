import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_TEMPLATES, type DevTemplate } from "@/lib/dev/templates";
import { TemplateCover } from "@/components/dev/TemplateCover";
import { TemplateStartModal } from "@/components/dev/TemplateStartModal";
import { getDevPlan } from "@/lib/dev/plans";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dev/modelos/")({
  component: DevTemplatesPage,
  head: () => ({
    meta: [
      { title: "Modelos · Flaro Dev" },
      { name: "description", content: "Escolha um modelo de site pronto para o seu segmento: clínica, restaurante, oficina, loja, prestador de serviço ou landing page." },
      { property: "og:title", content: "Modelos · Flaro Dev" },
      { property: "og:description", content: "Modelos prontos adaptados ao seu negócio, com briefing guiado e alterações via chat." },
      { property: "og:url", content: "https://setup.filro.site/dev/modelos" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev/modelos" }],
  }),
});

function DevTemplatesPage() {
  const [modalTpl, setModalTpl] = useState<DevTemplate | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-10">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Flaro Dev · Modelos
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">
            Comece a partir de um <span className="lime-mark">modelo pronto</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty">
            Cada modelo é uma estrutura profissional adaptada ao seu segmento. Escolha um, confirme o endereço do seu site e abrimos o chat para você editar tudo.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEV_TEMPLATES.map((t) => {
              const plan = getDevPlan(t.recommendedPlan);
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setModalTpl(t)}
                  className="group text-left w-full rounded-2xl border border-border bg-paper overflow-hidden flex flex-col hover:border-ink/40 hover:shadow-elegant transition-all"
                >
                  <div className="overflow-hidden bg-muted relative">
                    <TemplateCover src={t.coverImage} name={t.name} previewRoute={t.previewRoute} />
                    {t.previewRoute && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-ink/85 text-paper backdrop-blur-sm">
                        Preview ao vivo
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[11px] text-ink-soft">{t.segment}</div>
                    <div className="mt-1 text-lg font-semibold text-ink">{t.name}</div>
                    <p className="mt-2 text-sm text-ink-soft line-clamp-2">{t.description}</p>
                    {plan && (
                      <div className="mt-4 text-xs text-ink-soft">
                        Plano recomendado: <span className="font-semibold text-ink">{plan.name}</span>
                      </div>
                    )}
                    <div className="mt-4 inline-flex items-center text-sm font-semibold text-ink">
                      Usar este modelo <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-24">
          <div className="rounded-[2.5rem] border border-border bg-paper p-10 md:p-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Próximo passo</span>
              <h2 className="mt-4 editorial-headline text-3xl md:text-5xl text-ink max-w-2xl">
                Escolha um plano para criar à vontade
              </h2>
            </div>
            <Link to="/dev/precos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform self-start md:self-end">
              Ver planos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />

      <TemplateStartModal template={modalTpl} open={!!modalTpl} onClose={() => setModalTpl(null)} />
    </div>
  );
}
