import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_TEMPLATES } from "@/lib/dev/templates";
import { DEV_PLANS, formatBRL, CREDIT_COSTS } from "@/lib/dev/plans";
import {
  ArrowRight,
  Check,
  Zap,
  Wand2,
  Globe,
  MessageSquare,
  Pencil,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/dev/")({
  component: DevLanding,
  head: () => ({
    meta: [
      { title: "Flaro Dev · Crie um site profissional em segundos com IA" },
      {
        name: "description",
        content:
          "Descreva seu negócio, escolha um modelo e receba um site profissional publicado em segundos. Edite conversando com a IA. 10 créditos grátis ao se cadastrar.",
      },
      { property: "og:title", content: "Flaro Dev · Sites profissionais por IA" },
      {
        property: "og:description",
        content:
          "Gere um site profissional em segundos. Edite com IA conversando. 10 créditos grátis.",
      },
      { property: "og:url", content: "https://setup.filro.site/dev" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev" }],
  }),
});

const STEPS = [
  {
    icon: Pencil,
    title: "Descreva seu negócio",
    desc: "Conta em poucas linhas o que você faz, para quem e o que te diferencia.",
  },
  {
    icon: Wand2,
    title: "IA gera o conteúdo",
    desc: "Em segundos, escrevemos copy profissional sobre o modelo escolhido.",
  },
  {
    icon: Globe,
    title: "Site publicado na hora",
    desc: "Você recebe um endereço próprio em filro.site para compartilhar.",
  },
  {
    icon: MessageSquare,
    title: "Edite conversando",
    desc: "Peça mudanças pelo chat IA ou ajuste manualmente — manual é grátis.",
  },
];

const FAQ = [
  {
    q: "Quanto custa para começar?",
    a: `Nada. Ao criar sua conta você ganha 10 créditos. Gerar um site custa ${CREDIT_COSTS.generateSite} créditos e editar com IA custa ${CREDIT_COSTS.aiEdit}.`,
  },
  {
    q: "O site fica publicado em qual endereço?",
    a: "Cada site fica em /s/{seu-endereço} no domínio filro.site, disponível na hora. Domínio próprio chega em breve nos planos pagos.",
  },
  {
    q: "Posso editar depois?",
    a: "Sim. Use o editor com IA (custa 1 crédito por edição) ou faça ajustes manuais à vontade — manual é grátis.",
  },
  {
    q: "Preciso saber programar?",
    a: "Não. Você só descreve seu negócio. A IA cuida do conteúdo e o sistema cuida da publicação.",
  },
];

// Animation presets
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function TemplateCard({
  t,
  variant = "light",
}: {
  t: (typeof DEV_TEMPLATES)[number];
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <Link
      to="/dev/novo"
      search={{ template: t.slug }}
      className={`group relative w-[320px] md:w-[380px] shrink-0 rounded-2xl overflow-hidden border transition-all ${
        isDark
          ? "border-white/10 bg-white/[0.04] hover:border-lime/40"
          : "border-border bg-paper hover:border-ink/30"
      }`}
    >
      {/* Faux site preview */}
      <div
        className={`aspect-[16/10] relative overflow-hidden ${
          isDark ? "bg-white/[0.03]" : "bg-muted/40"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-6 flex items-center gap-1 px-3 border-b border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-flame/70" />
          <span className="w-1.5 h-1.5 rounded-full bg-lime/70" />
          <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40" />
        </div>
        <div className="absolute inset-0 pt-8 px-5 pb-5 flex flex-col gap-3">
          <div
            className={`h-3 w-1/2 rounded ${isDark ? "bg-white/10" : "bg-ink/10"}`}
          />
          <div
            className={`h-2 w-3/4 rounded ${isDark ? "bg-white/10" : "bg-ink/10"}`}
          />
          <div
            className={`mt-2 flex-1 rounded-lg ${
              isDark
                ? "bg-gradient-to-br from-white/[0.06] to-white/[0.02]"
                : "bg-gradient-to-br from-ink/[0.06] to-ink/[0.02]"
            }`}
          />
          <div className="flex gap-2">
            <div
              className={`h-2 flex-1 rounded ${isDark ? "bg-white/10" : "bg-ink/10"}`}
            />
            <div
              className={`h-2 w-12 rounded ${isDark ? "bg-lime/70" : "bg-flame/70"}`}
            />
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-paper text-ink text-xs font-semibold translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
            Usar este modelo <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      <div className="p-5">
        <div
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            isDark ? "text-lime" : "text-flame"
          }`}
        >
          {t.segment.split(",")[0]}
        </div>
        <div
          className={`mt-1.5 text-base font-semibold ${
            isDark ? "text-paper" : "text-ink"
          }`}
        >
          {t.name}
        </div>
      </div>
    </Link>
  );
}

function DevLanding() {
  const marqueeTemplates = [...DEV_TEMPLATES, ...DEV_TEMPLATES];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        {/* HERO */}
        <section className="relative mx-auto max-w-[1400px] px-5 md:px-10 pt-12 md:pt-24 pb-20 md:pb-28">
          {/* Floating brand blobs */}
          <div
            aria-hidden
            className="absolute -top-10 -right-10 w-[420px] h-[420px] rounded-full bg-lime/30 blur-[120px] float-slow pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute top-40 -left-20 w-[320px] h-[320px] rounded-full bg-flame/15 blur-[140px] float-slower pointer-events-none"
          />

          <motion.div
            {...fadeUp}
            className="relative z-10 flex flex-col items-start"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-paper/80 backdrop-blur text-[10px] uppercase tracking-widest font-semibold text-ink-soft">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-flame opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame" />
              </span>
              Flaro Dev · IA generativa
            </span>

            <h1 className="mt-6 editorial-headline text-5xl sm:text-6xl md:text-8xl text-ink max-w-5xl text-balance">
              Seu site profissional em{" "}
              <span className="lime-mark">segundos</span>, sem programar.
            </h1>

            <p className="mt-7 max-w-2xl text-ink-soft text-lg md:text-xl text-pretty leading-relaxed">
              Descreva seu negócio. Nossa IA escreve o conteúdo, monta o site sobre um
              modelo profissional, publica num endereço próprio — e você edita conversando.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/dev/novo"
                className="group inline-flex items-center h-14 pl-8 pr-6 rounded-full bg-ink text-paper font-semibold tracking-wide hover:pr-10 transition-all duration-300"
              >
                Criar meu site grátis
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dev/precos"
                className="inline-flex items-center h-14 px-8 rounded-full border border-border bg-paper text-ink font-semibold hover:bg-muted transition-colors"
              >
                Ver planos
              </Link>
            </div>

            <div className="mt-7 inline-flex items-center gap-2 text-sm text-ink-soft">
              <Zap className="h-4 w-4 text-flame" /> 10 créditos grátis ao criar sua
              conta · sem cartão
            </div>
          </motion.div>
        </section>

        {/* STEPS — dark editorial */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
              <motion.div {...fadeUp}>
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-flame">
                  Como funciona
                </span>
                <h2 className="mt-5 editorial-headline text-4xl md:text-6xl">
                  4 passos.
                  <br />
                  Sem equipe humana no meio.
                </h2>
                <p className="mt-6 text-paper/60 max-w-md leading-relaxed">
                  Do prompt à publicação em menos de um minuto. Sem briefings, sem
                  reuniões, sem orçamento parado.
                </p>
              </motion.div>

              <div className="space-y-10">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.title}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group flex gap-6 md:gap-8"
                    >
                      <div className="text-4xl md:text-5xl editorial-headline text-paper/15 group-hover:text-lime transition-colors duration-500 w-16 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 border-t border-paper/10 pt-5">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-lime" />
                          <h3 className="text-xl font-semibold">{s.title}</h3>
                        </div>
                        <p className="mt-3 text-paper/60 leading-relaxed max-w-md">
                          {s.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES — marquee gallery */}
        <section className="py-20 md:py-28 overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10 mb-12 md:mb-16 flex flex-wrap items-end justify-between gap-6">
            <motion.div {...fadeUp}>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-ink-soft">
                Modelos editáveis
              </span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">
                Escolha um ponto de partida
              </h2>
              <p className="mt-4 text-ink-soft max-w-xl">
                Cada modelo já vem com estrutura, copy e visual. Você edita pelo chat
                IA ou manualmente, quando quiser.
              </p>
            </motion.div>
            <Link
              to="/dev/modelos"
              className="text-sm font-semibold text-ink ink-underline self-end"
            >
              Ver todos os modelos →
            </Link>
          </div>

          <div className="marquee-mask">
            <div className="flex gap-5 animate-marquee-x w-max">
              {marqueeTemplates.map((t, i) => (
                <TemplateCard key={`${t.slug}-${i}`} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* AI EDITOR SHOWCASE */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
          <motion.div
            {...fadeUp}
            className="rounded-[2.5rem] overflow-hidden border border-border bg-paper"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="grid lg:grid-cols-5">
              <div className="lg:col-span-2 p-10 md:p-14 flex flex-col justify-center">
                <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-lime/30 text-ink text-[10px] uppercase tracking-widest font-bold">
                  <Sparkles className="h-3 w-3" /> Editor com IA · já incluso
                </span>
                <h2 className="mt-5 editorial-headline text-4xl md:text-5xl text-ink">
                  Edite o seu site <em className="font-display italic">conversando</em>.
                </h2>
                <p className="mt-5 text-ink-soft leading-relaxed">
                  Nada de painéis confusos. Peça pra IA mudar a cor, trocar uma imagem,
                  adicionar uma seção, reescrever um texto. Cada edição com IA custa
                  apenas {CREDIT_COSTS.aiEdit} crédito. Edições manuais são grátis.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/dev/novo"
                    className="inline-flex items-center h-12 px-6 rounded-full bg-ink text-paper text-sm font-semibold hover:scale-[1.03] transition-transform"
                  >
                    Abrir editor agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    to="/dev/modelos"
                    className="inline-flex items-center h-12 px-6 rounded-full border border-border text-ink text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Explorar modelos
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-3 bg-ink p-6 md:p-10 relative">
                <div className="rounded-2xl bg-paper/5 border border-paper/10 p-5 md:p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-flame/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-lime/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-paper/30" />
                    <span className="ml-3 text-[10px] uppercase tracking-widest text-paper/40 font-bold">
                      /dev/editor · clínica-local
                    </span>
                  </div>

                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="max-w-[85%] bg-paper/10 text-paper/85 text-sm rounded-2xl rounded-bl-md px-4 py-3"
                    >
                      Olá! Pronto pra ajustar o site da clínica. O que você quer mudar?
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="ml-auto max-w-[85%] bg-lime text-ink text-sm font-medium rounded-2xl rounded-br-md px-4 py-3"
                    >
                      Troca o botão principal pra "Agendar pelo WhatsApp" e adiciona uma
                      seção com 3 depoimentos.
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="max-w-[85%] bg-paper/10 text-paper/85 text-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-lime opacity-60 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                      </span>
                      Atualizando hero e gerando depoimentos…
                    </motion.div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 rounded-full bg-paper/5 border border-paper/10 px-4 py-3 text-paper/40 text-sm">
                    <MessageSquare className="h-4 w-4" />
                    <span>Diga o que mudar…</span>
                    <span className="ml-auto text-[10px] uppercase tracking-widest text-lime font-bold">
                      1 crédito
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PLANS */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-ink-soft">
              Planos por créditos
            </span>
            <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink">
              Pague apenas o que usar de IA
            </h2>
            <p className="mt-5 text-ink-soft text-lg">
              Cada geração de site usa {CREDIT_COSTS.generateSite} créditos. Cada
              edição com IA, {CREDIT_COSTS.aiEdit}. Edições manuais são grátis.
            </p>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEV_PLANS.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`rounded-3xl p-7 flex flex-col transition-all duration-500 ${
                  p.highlight
                    ? "bg-ink text-paper shadow-elegant lg:-translate-y-3"
                    : "bg-paper border border-border hover:border-ink/30 hover:-translate-y-1"
                }`}
              >
                {p.highlight && (
                  <span className="self-start text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-lime text-ink font-bold mb-4">
                    Mais escolhido
                  </span>
                )}
                <div
                  className={`text-lg font-semibold ${
                    p.highlight ? "text-paper" : "text-ink"
                  }`}
                >
                  {p.name}
                </div>
                <p
                  className={`mt-1.5 text-sm min-h-[40px] ${
                    p.highlight ? "text-paper/60" : "text-ink-soft"
                  }`}
                >
                  {p.tagline}
                </p>
                <div className="mt-5">
                  {p.monthlyPrice === 0 ? (
                    <div className="editorial-headline text-4xl">Grátis</div>
                  ) : (
                    <div className="editorial-headline text-4xl">
                      {formatBRL(p.monthlyPrice)}
                      <span
                        className={`text-sm font-normal ${
                          p.highlight ? "text-paper/50" : "text-ink-soft"
                        }`}
                      >
                        /mês
                      </span>
                    </div>
                  )}
                  <div
                    className={`mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold ${
                      p.highlight ? "text-lime" : "text-ink"
                    }`}
                  >
                    <Zap className="h-4 w-4" /> {p.monthlyCredits} créditos
                  </div>
                </div>
                <ul
                  className={`mt-6 space-y-2.5 text-sm flex-1 ${
                    p.highlight ? "text-paper/85" : "text-ink"
                  }`}
                >
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          p.highlight ? "text-lime" : "text-flame"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dev/novo"
                  className={`mt-7 inline-flex items-center justify-center h-12 px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
                    p.highlight
                      ? "bg-lime text-ink hover:scale-[1.03]"
                      : "bg-ink text-paper hover:scale-[1.03]"
                  }`}
                >
                  {p.monthlyPrice === 0 ? "Começar grátis" : "Escolher plano"}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
          <motion.div {...fadeUp}>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-ink-soft">
              Perguntas frequentes
            </span>
            <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">
              Dúvidas comuns
            </h2>
          </motion.div>
          <div className="mt-12 grid md:grid-cols-2 gap-4">
            {FAQ.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-paper p-6 hover:border-ink/30 transition-colors"
              >
                <div className="font-semibold text-ink">{f.q}</div>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-24 md:pb-32">
          <motion.div
            {...fadeUp}
            className="relative rounded-[3rem] overflow-hidden bg-ink text-paper p-12 md:p-20 text-center"
          >
            <div
              aria-hidden
              className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-lime/20 blur-[120px] pointer-events-none"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-flame/20 blur-[120px] pointer-events-none"
            />
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-lime">
                Pronto pra começar?
              </span>
              <h2 className="mt-5 editorial-headline text-5xl md:text-7xl max-w-3xl mx-auto">
                Crie seu site agora — <span className="lime-mark text-ink">grátis</span>
              </h2>
              <Link
                to="/dev/novo"
                className="mt-10 inline-flex items-center h-14 pl-8 pr-6 rounded-full bg-paper text-ink font-semibold tracking-wide hover:scale-105 transition-transform"
              >
                Gerar meu site em 30s <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
              <div className="mt-5 text-sm text-paper/50">
                10 créditos grátis · sem cartão · cancele quando quiser
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
