import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_TEMPLATES } from "@/lib/dev/templates";
import { DEV_PLANS, formatBRL, CREDIT_COSTS } from "@/lib/dev/plans";
import { ArrowRight, Check, Zap, Wand2, Globe, MessageSquare, Pencil } from "lucide-react";

export const Route = createFileRoute("/dev/")({
  component: DevLanding,
  head: () => ({
    meta: [
      { title: "Flaro Dev · Crie um site profissional em segundos com IA" },
      { name: "description", content: "Descreva seu negócio, escolha um modelo e receba um site profissional publicado em segundos. Ganhe 10 créditos grátis ao se cadastrar." },
      { property: "og:title", content: "Flaro Dev · Sites profissionais por IA" },
      { property: "og:description", content: "Gere um site profissional em segundos. 10 créditos grátis no cadastro." },
      { property: "og:url", content: "https://setup.filro.site/dev" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev" }],
  }),
});

const STEPS = [
  { icon: Pencil, title: "Descreva seu negócio", desc: "Conta em poucas linhas o que você faz, para quem e o que te diferencia." },
  { icon: Wand2, title: "IA gera o conteúdo", desc: "Em segundos, escrevemos copy profissional sobre o modelo escolhido." },
  { icon: Globe, title: "Site publicado na hora", desc: "Você recebe um endereço próprio em filro.site para compartilhar." },
  { icon: MessageSquare, title: "Edite quando quiser", desc: "Peça mudanças pelo editor com IA ou ajuste manualmente." },
];

const FAQ = [
  { q: "Quanto custa para começar?", a: `Nada. Ao criar sua conta você ganha 10 créditos. Gerar um site custa ${CREDIT_COSTS.generateSite} créditos e editar com IA custa ${CREDIT_COSTS.aiEdit}.` },
  { q: "O site fica publicado em qual endereço?", a: "Cada site fica em /s/{seu-endereço} no domínio filro.site, disponível na hora. Domínio próprio chega em breve nos planos pagos." },
  { q: "Posso editar depois?", a: "Sim. Use o editor com IA (custa 1 crédito por edição) ou faça ajustes manuais à vontade — manual é grátis." },
  { q: "Preciso saber programar?", a: "Não. Você só descreve seu negócio. A IA cuida do conteúdo e o sistema cuida da publicação." },
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
            Seu site profissional em <span className="lime-mark">segundos</span>, sem programar
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty text-lg">
            Descreva seu negócio. Nossa IA escreve o conteúdo, monta o site sobre um modelo profissional e publica num endereço próprio. Tudo em segundos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dev/novo" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform">
              Criar meu site grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/dev/precos" className="inline-flex items-center h-14 px-8 rounded-2xl border border-border bg-paper text-ink font-semibold hover:bg-muted transition-colors">
              Ver planos
            </Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-ink-soft">
            <Zap className="h-4 w-4 text-flame" /> 10 créditos grátis ao criar sua conta · sem cartão
          </div>
        </section>

        {/* STEPS */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Como funciona</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">4 passos. Sem equipe humana no meio.</h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
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

        {/* TEMPLATES */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Modelos</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink">Escolha um ponto de partida</h2>
            </div>
            <Link to="/dev/modelos" className="text-sm font-semibold text-ink hover:underline">Ver todos os modelos →</Link>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEV_TEMPLATES.slice(0, 6).map((t) => (
              <Link key={t.slug} to="/dev/novo" search={{ template: t.slug }} className="group rounded-2xl border border-border bg-paper p-6 hover:border-ink/40 transition-colors">
                <div className="text-xs text-ink-soft">{t.segment}</div>
                <div className="mt-2 text-xl font-semibold text-ink">{t.name}</div>
                <p className="mt-2 text-sm text-ink-soft line-clamp-2">{t.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
                  Usar este modelo <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PLANS */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Planos por créditos</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Pague apenas o que usar de IA</h2>
          <p className="mt-4 text-ink-soft max-w-2xl">
            Cada geração de site usa {CREDIT_COSTS.generateSite} créditos. Cada edição com IA, {CREDIT_COSTS.aiEdit}. Edições manuais são grátis.
          </p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEV_PLANS.map((p) => (
              <div key={p.slug} className={`rounded-2xl border p-6 bg-paper flex flex-col ${p.highlight ? "border-ink shadow-elegant" : "border-border"}`}>
                {p.highlight && (
                  <span className="self-start text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-ink text-paper mb-3">Mais escolhido</span>
                )}
                <div className="text-xl font-semibold text-ink">{p.name}</div>
                <p className="mt-1 text-sm text-ink-soft min-h-[40px]">{p.tagline}</p>
                <div className="mt-4">
                  {p.monthlyPrice === 0 ? <div className="text-3xl font-bold text-ink">Grátis</div> : (
                    <div className="text-3xl font-bold text-ink">{formatBRL(p.monthlyPrice)}<span className="text-sm font-normal text-ink-soft">/mês</span></div>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Zap className="h-4 w-4 text-flame" /> {p.monthlyCredits} créditos
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-ink flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-flame shrink-0 mt-0.5" /> <span>{f}</span></li>
                  ))}
                </ul>
                <Link to="/dev/novo" className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold hover:scale-[1.02] transition-transform">
                  {p.monthlyPrice === 0 ? "Começar grátis" : "Escolher plano"}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Perguntas frequentes</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Dúvidas comuns</h2>
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
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">Crie seu site agora — grátis</h2>
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
