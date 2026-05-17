import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_TEMPLATES } from "@/lib/dev/templates";
import { DEV_PLANS, formatBRL } from "@/lib/dev/plans";
import { ArrowRight, Check, MessageSquare, Layers, FileText, Eye, Rocket, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dev/")({
  component: DevLanding,
  head: () => ({
    meta: [
      { title: "Flaro Dev · Crie um site profissional a partir de um modelo pronto" },
      { name: "description", content: "Escolha um modelo, envie as informações do seu negócio e acompanhe a criação do seu site com alterações orientadas por chatbot." },
      { property: "og:title", content: "Flaro Dev · Filro" },
      { property: "og:description", content: "Modelos prontos, briefing guiado, alterações via chat e publicação acompanhada pela Filro." },
      { property: "og:url", content: "https://setup.filro.site/dev" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev" }],
  }),
});

const STEPS = [
  { icon: Layers, title: "Escolha um modelo", desc: "Comece a partir de uma estrutura profissional pensada para o seu segmento." },
  { icon: FileText, title: "Envie as informações", desc: "Preencha um briefing guiado com tudo o que o seu site precisa mostrar." },
  { icon: Sparkles, title: "O sistema estrutura o site", desc: "Geramos a estrutura inicial do projeto com base no modelo e no briefing." },
  { icon: MessageSquare, title: "Solicite alterações pelo chat", desc: "Peça mudanças por um chatbot que classifica e organiza cada pedido." },
  { icon: Rocket, title: "Publique com acompanhamento", desc: "Aprove e publique com revisão e suporte do time Filro." },
];

const FAQ = [
  { q: "O site é gerado automaticamente?", a: "O sistema gera a estrutura inicial e o conteúdo a partir do modelo e do seu briefing. As alterações solicitadas pelo chat são organizadas como tarefas e aplicadas pelo time Filro." },
  { q: "Posso pedir qualquer alteração?", a: "Sim, mas o sistema separa alterações simples (texto, cor, imagem) das alterações maiores (nova página, integração). Alterações simples consomem créditos do plano. Alterações maiores geram um orçamento adicional." },
  { q: "Quem publica o site?", a: "Você solicita a publicação no painel do projeto. O time Filro revisa, aplica os últimos ajustes e publica em subdomínio Filro ou no seu domínio próprio." },
  { q: "Posso usar meu domínio?", a: "Sim, a partir do plano Dev Plus. O time orienta a configuração de DNS." },
  { q: "O que acontece se eu cancelar?", a: "Você mantém o que já foi entregue. A manutenção mensal e as alterações via chat ficam indisponíveis até reativar o plano." },
];

function DevLanding() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-16">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Flaro Dev
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-4xl">
            Crie um site profissional a partir de um <span className="lime-mark">modelo pronto</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty text-lg">
            Escolha um modelo, envie as informações do seu negócio e acompanhe a criação do seu site com alterações orientadas por chatbot.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dev/modelos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform">
              Escolher modelo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/dev/precos" className="inline-flex items-center h-14 px-8 rounded-2xl border border-border bg-paper text-ink font-semibold hover:bg-muted transition-colors">
              Ver planos
            </Link>
          </div>

          {/* mockup */}
          <div className="mt-14 rounded-[2.5rem] border border-border bg-paper p-6 md:p-10" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="grid md:grid-cols-5 gap-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center gap-2 text-xs text-ink-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-flame" /> Etapa {i + 1}
                    </div>
                    <Icon className="mt-3 h-5 w-5 text-ink" />
                    <div className="mt-3 text-sm font-semibold text-ink">{s.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Como funciona</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">5 etapas claras, do modelo à publicação</h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-5 gap-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-2xl border border-border bg-paper p-6">
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-flame" /> {String(i + 1).padStart(2, "0")}
                  </div>
                  <Icon className="mt-4 h-6 w-6 text-ink" />
                  <div className="mt-4 font-semibold text-ink">{s.title}</div>
                  <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TEMPLATE PREVIEW */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Modelos</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink">Escolha um ponto de partida</h2>
            </div>
            <Link to="/dev/modelos" className="text-sm font-semibold text-ink hover:underline">
              Ver todos os modelos →
            </Link>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEV_TEMPLATES.slice(0, 6).map((t) => (
              <Link
                key={t.slug}
                to="/dev/modelos/$slug"
                params={{ slug: t.slug }}
                className="group rounded-2xl border border-border bg-paper p-6 hover:border-ink/40 transition-colors"
              >
                <div className="text-xs text-ink-soft">{t.segment}</div>
                <div className="mt-2 text-xl font-semibold text-ink">{t.name}</div>
                <p className="mt-2 text-sm text-ink-soft line-clamp-2">{t.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.sections.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-muted text-ink-soft">{s}</span>
                  ))}
                  {t.sections.length > 4 && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-muted text-ink-soft">+{t.sections.length - 4}</span>
                  )}
                </div>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
                  Ver modelo <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PLANS */}
        <section id="planos" className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Planos Flaro Dev</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Ativação + manutenção mensal com alterações via chat</h2>
          <p className="mt-4 text-ink-soft max-w-2xl">
            A ativação cobre a criação do projeto. A mensalidade mantém o site no ar, libera as alterações do mês e dá acesso ao chatbot e ao acompanhamento da Filro.
          </p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEV_PLANS.map((p) => (
              <div
                key={p.slug}
                className={`rounded-2xl border p-6 bg-paper flex flex-col ${p.highlight ? "border-ink shadow-elegant" : "border-border"}`}
              >
                {p.highlight && (
                  <span className="self-start text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-ink text-paper mb-3">Mais escolhido</span>
                )}
                <div className="text-xl font-semibold text-ink">{p.name}</div>
                <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
                <div className="mt-5">
                  <div className="text-3xl font-bold text-ink">{formatBRL(p.activationPrice)}</div>
                  <div className="text-xs text-ink-soft">ativação · cobrada uma vez</div>
                  <div className="mt-2 text-lg font-semibold text-ink">+ {formatBRL(p.monthlyPrice)}<span className="text-sm font-normal text-ink-soft">/mês</span></div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-ink flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-flame shrink-0 mt-0.5" /> <span>{f}</span></li>
                  ))}
                </ul>
                <Link
                  to="/dev/modelos"
                  className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold hover:scale-[1.02] transition-transform"
                >
                  Começar com este plano
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* USE CASES */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Casos de uso</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Pensado para negócios reais</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {[
              { t: "Negócios locais", d: "Clínicas, oficinas, restaurantes e prestadores que precisam de presença profissional e WhatsApp." },
              { t: "Lançamentos e campanhas", d: "Landing pages para infoprodutos, ofertas e campanhas com foco em conversão." },
              { t: "Operações maiores", d: "Marcas com múltiplas ofertas, campanhas mensais e necessidade de ciclo contínuo de melhorias." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-border bg-paper p-6">
                <div className="font-semibold text-ink text-lg">{c.t}</div>
                <p className="mt-2 text-sm text-ink-soft">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECT FLOW */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Fluxo do projeto</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Acompanhamento claro do briefing à publicação</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border bg-paper p-6">
              <div className="font-semibold text-ink">Você faz</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>· Escolhe o modelo e o plano</li>
                <li>· Envia o briefing do negócio</li>
                <li>· Pede alterações no chat do projeto</li>
                <li>· Confirma as alterações antes do desconto de créditos</li>
                <li>· Aprova a publicação</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-6">
              <div className="font-semibold text-ink">A Filro faz</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>· Estrutura o projeto a partir do modelo</li>
                <li>· Recebe os pedidos classificados pelo chatbot</li>
                <li>· Aplica as alterações no projeto</li>
                <li>· Orienta a configuração de domínio</li>
                <li>· Publica e mantém o site no ar</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Perguntas frequentes</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Dúvidas comuns sobre o Flaro Dev</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-paper p-6">
                <div className="font-semibold text-ink">{f.q}</div>
                <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
          <div className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Pronto pra começar?</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">
                Escolha um modelo e comece o briefing
              </h2>
            </div>
            <Link to="/dev/modelos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform self-start md:self-end">
              Escolher modelo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
