import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_PLANS, formatBRL, CREDIT_COSTS } from "@/lib/dev/plans";
import { ArrowRight, Check, Zap } from "lucide-react";

export const Route = createFileRoute("/dev/precos")({
  component: DevPrecos,
  head: () => ({
    meta: [
      { title: "Planos Flaro Dev · Créditos para gerar e editar com IA" },
      { name: "description", content: "Comece grátis com 10 créditos. Planos a partir de R$47/mês com créditos recorrentes para criar e iterar sites com IA." },
      { property: "og:title", content: "Planos Flaro Dev · Filro" },
      { property: "og:description", content: "Modelo por créditos: 5 para gerar um site, 1 para editar com IA. Comece grátis." },
      { property: "og:url", content: "https://setup.filro.site/dev/precos" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev/precos" }],
  }),
});

const FAQ = [
  { q: "Como funcionam os créditos?", a: `Cada ação na plataforma consome créditos: gerar um site novo custa ${CREDIT_COSTS.generateSite} créditos e editar com IA custa ${CREDIT_COSTS.aiEdit} por edição. Editar manualmente é grátis.` },
  { q: "Os créditos acumulam?", a: "Não. A cada mês seu saldo é renovado conforme o seu plano. Sobra de mês não acumula no próximo ciclo." },
  { q: "Posso testar de graça?", a: "Sim. Ao criar sua conta você ganha 10 créditos — o suficiente para gerar 2 sites e fazer algumas edições." },
  { q: "Posso trocar de plano?", a: "Pode subir ou descer a qualquer momento. A mudança vale no próximo ciclo." },
];

function DevPrecos() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-10">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Flaro Dev · Planos
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-4xl">
            Pague apenas pelo que <span className="lime-mark">usa de IA</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty text-lg">
            Crie sites, edite por IA e publique em segundos. Sem ativação, sem mensalidade obrigatória — só os créditos que você precisar.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-ink-soft bg-muted/50 px-4 h-11 rounded-full">
            <Zap className="h-4 w-4 text-flame" />
            Gerar site: <strong className="text-ink">{CREDIT_COSTS.generateSite} créditos</strong> · Editar com IA: <strong className="text-ink">{CREDIT_COSTS.aiEdit} crédito</strong>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEV_PLANS.map((p) => (
              <div key={p.slug} className={`rounded-2xl border p-6 bg-paper flex flex-col ${p.highlight ? "border-ink shadow-elegant" : "border-border"}`}>
                {p.highlight && (
                  <span className="self-start text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-ink text-paper mb-3">Mais escolhido</span>
                )}
                <div className="text-xl font-semibold text-ink">{p.name}</div>
                <p className="mt-1 text-sm text-ink-soft min-h-[40px]">{p.tagline}</p>
                <div className="mt-5">
                  {p.monthlyPrice === 0 ? (
                    <div className="text-3xl font-bold text-ink">Grátis</div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-ink">{formatBRL(p.monthlyPrice)}<span className="text-sm font-normal text-ink-soft">/mês</span></div>
                    </>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Zap className="h-4 w-4 text-flame" /> {p.monthlyCredits} créditos {p.monthlyPrice === 0 ? "ao se cadastrar" : "por mês"}
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-ink flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-flame shrink-0 mt-0.5" /> <span>{f}</span></li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-ink-soft"><span className="font-semibold text-ink">Para:</span> {p.bestFor}</div>
                <Link to="/dev/novo" className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold hover:scale-[1.02] transition-transform">
                  {p.monthlyPrice === 0 ? "Começar grátis" : `Assinar ${p.name}`} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Perguntas frequentes</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Como funcionam os créditos</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-paper p-6">
                <div className="font-semibold text-ink">{f.q}</div>
                <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
          <div className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Pronto pra começar?</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">10 créditos grátis ao se cadastrar</h2>
            </div>
            <Link to="/dev/novo" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform self-start md:self-end">
              Criar meu site <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
