import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_PLANS, formatBRL } from "@/lib/dev/plans";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/dev/precos")({
  component: DevPrecos,
  head: () => ({
    meta: [
      { title: "Planos Flaro Dev · Ativação + manutenção mensal" },
      {
        name: "description",
        content:
          "Compare os planos Flaro Dev: ativação única, mensalidade com alterações via chat e suporte da Filro.",
      },
      { property: "og:title", content: "Planos Flaro Dev · Filro" },
      {
        property: "og:description",
        content:
          "Ativação a partir de R$197 e mensalidade a partir de R$97. Veja o que cada plano inclui.",
      },
      { property: "og:url", content: "https://setup.filro.site/dev/precos" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev/precos" }],
  }),
});

const FAQ = [
  {
    q: "Como funciona a ativação?",
    a: "É uma cobrança única que cobre a criação do projeto a partir do modelo escolhido, com base no briefing enviado.",
  },
  {
    q: "E a mensalidade?",
    a: "Mantém o site no ar, libera os créditos de alteração do mês, dá acesso ao chatbot e ao acompanhamento da Filro.",
  },
  {
    q: "Posso trocar de plano depois?",
    a: "Sim. O upgrade é aplicado no próximo ciclo. Em caso de downgrade, os créditos do mês corrente continuam disponíveis até o fim do ciclo.",
  },
  {
    q: "O que acontece se eu cancelar?",
    a: "Você mantém o que já foi entregue. A mensalidade e as alterações via chat ficam pausadas até reativar o plano.",
  },
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
            Ativação única + <span className="lime-mark">manutenção mensal</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty text-lg">
            Escolha o plano que faz sentido para o seu site. Você paga uma ativação para criar o projeto e uma mensalidade
            para manter o site no ar, com alterações via chatbot e suporte da Filro.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEV_PLANS.map((p) => (
              <div
                key={p.slug}
                className={`rounded-2xl border p-6 bg-paper flex flex-col ${
                  p.highlight ? "border-ink shadow-elegant" : "border-border"
                }`}
              >
                {p.highlight && (
                  <span className="self-start text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-ink text-paper mb-3">
                    Mais escolhido
                  </span>
                )}
                <div className="text-xl font-semibold text-ink">{p.name}</div>
                <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
                <div className="mt-5">
                  <div className="text-3xl font-bold text-ink">{formatBRL(p.activationPrice)}</div>
                  <div className="text-xs text-ink-soft">ativação · cobrada uma vez</div>
                  <div className="mt-2 text-lg font-semibold text-ink">
                    + {formatBRL(p.monthlyPrice)}
                    <span className="text-sm font-normal text-ink-soft">/mês</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-ink-soft">
                  {p.monthlyChangeCredits} alterações via chat por mês · até {p.maxSections} seções
                </div>
                <ul className="mt-5 space-y-2 text-sm text-ink flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-flame shrink-0 mt-0.5" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-ink-soft">
                  <span className="font-semibold text-ink">Ideal para:</span> {p.bestFor}
                </div>
                <Link
                  to="/dev/modelos"
                  className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold hover:scale-[1.02] transition-transform"
                >
                  Começar com {p.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Comparativo</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">
            O que cada plano entrega
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-border">
                  <th className="p-4 font-semibold">Recurso</th>
                  {DEV_PLANS.map((p) => (
                    <th key={p.slug} className="p-4 font-semibold text-ink">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-ink">
                <tr className="border-b border-border/60">
                  <td className="p-4 text-ink-soft">Ativação</td>
                  {DEV_PLANS.map((p) => (
                    <td key={p.slug} className="p-4">{formatBRL(p.activationPrice)}</td>
                  ))}
                </tr>
                <tr className="border-b border-border/60">
                  <td className="p-4 text-ink-soft">Mensalidade</td>
                  {DEV_PLANS.map((p) => (
                    <td key={p.slug} className="p-4">{formatBRL(p.monthlyPrice)}/mês</td>
                  ))}
                </tr>
                <tr className="border-b border-border/60">
                  <td className="p-4 text-ink-soft">Alterações via chat / mês</td>
                  {DEV_PLANS.map((p) => (
                    <td key={p.slug} className="p-4">{p.monthlyChangeCredits}</td>
                  ))}
                </tr>
                <tr className="border-b border-border/60">
                  <td className="p-4 text-ink-soft">Seções incluídas</td>
                  {DEV_PLANS.map((p) => (
                    <td key={p.slug} className="p-4">até {p.maxSections}</td>
                  ))}
                </tr>
                <tr className="border-b border-border/60">
                  <td className="p-4 text-ink-soft">Domínio próprio</td>
                  <td className="p-4 text-ink-soft">—</td>
                  <td className="p-4">Sim</td>
                  <td className="p-4">Sim</td>
                  <td className="p-4">Sim</td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-soft">Fila prioritária</td>
                  <td className="p-4 text-ink-soft">—</td>
                  <td className="p-4 text-ink-soft">—</td>
                  <td className="p-4">Sim</td>
                  <td className="p-4">Sim</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Perguntas frequentes</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Dúvidas sobre cobrança</h2>
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
          <div
            className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Pronto pra começar?</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">
                Escolha um modelo e ative o seu site
              </h2>
            </div>
            <Link
              to="/dev/modelos"
              className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform self-start md:self-end"
            >
              Escolher modelo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
