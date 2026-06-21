import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ModelGrid } from "@/components/ModelGrid";
import { VideoHero } from "@/components/VideoHero";
import { PlanCard } from "@/components/PlanCard";
import { FAQ } from "@/components/FAQ";

import { useAuth } from "@/lib/auth";
import { useCurrentPlan } from "@/hooks/useCurrentPlan";
import { listPublicPlans } from "@/lib/plans.functions";
import { formatBRL } from "@/lib/format";

import heroImg from "@/assets/hero-flaro.jpg?w=1088&format=webp";
import { ArrowRight } from "lucide-react";

const HOME_FAQS = [
  { q: "Em quanto tempo recebo minha página?", a: "Estimativa de até 24h após o envio completo das informações do negócio." },
  { q: "Como funciona o pagamento?", a: "Taxa única de ativação + mensalidade que cobre hospedagem, manutenção e pequenas alterações. Pagamento seguro pela Stripe." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Não há fidelidade. Cancele a mensalidade a qualquer momento direto do seu painel." },
  { q: "Preciso ter domínio próprio?", a: "Não é obrigatório. Entregamos em um subdomínio nosso, e se você tiver um domínio próprio, configuramos sem custo adicional." },
];

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: () => listPublicPlans(),
  head: () => ({
    meta: [
      { property: "og:url", content: "https://setup.filro.site/" },
    ],
    links: [
      { rel: "canonical", href: "https://setup.filro.site/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Criação e ativação de páginas profissionais",
          provider: { "@type": "Organization", name: "Filro", url: "https://setup.filro.site" },
          areaServed: { "@type": "Country", name: "Brasil" },
          description: "Páginas profissionais, cardápios digitais, portfólios e sites para negócios locais com ativação digital rápida (estimativa de até 24h após envio completo).",
          url: "https://setup.filro.site/",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const plans = Route.useLoaderData();
  const { plan: currentPlan } = useCurrentPlan();


  const handleSelect = (slug: string) => {
    sessionStorage.setItem("filro:selectedPlan", slug);
    navigate({ to: "/planos/$slug", params: { slug } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-24 md:pb-32 grid lg:grid-cols-12 gap-10 items-end">
          <motion.div style={{ y: yText }} className="lg:col-span-7 relative z-10">
            <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
              <span className="h-1.5 w-6 bg-flame" /> Ativação baseada em modelos
            </span>
            <h1 className="editorial-headline mt-6 text-[14vw] sm:text-[10vw] lg:text-[8.5rem] text-ink">
              Vire seguidor<br />
              em <span className="lime-mark">pedido</span><br />
              de orçamento.
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-ink-soft text-pretty">
              Montamos uma estrutura simples que transforma seu Instagram, Google e WhatsApp em conversas com clientes prontos para comprar. Não é só um site — é a ferramenta que fecha o ciclo de aquisição do seu negócio local.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 items-center">
              <a href="#ativacao" className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform">
                Iniciar ativação
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#modelos" className="inline-flex items-center justify-center h-14 px-8 rounded-2xl border border-ink text-ink font-semibold tracking-wide hover:bg-ink hover:text-paper transition-colors">
                Ver modelos
              </a>
            </div>
          </motion.div>

          <motion.div style={{ y: yImg }} className="lg:col-span-5 relative">
            <motion.div
              style={{ scale: scaleImg }}
              className="relative aspect-[3/4] rounded-[32px] lg:rounded-[48px] overflow-hidden border border-border bg-paper shadow-2xl hero-shadow transition-all duration-500 md:duration-1000"
            >
              <img src={heroImg} alt="Ilustração no estilo Flaro de um pequeno negócio local" className="absolute inset-0 h-full w-full object-cover" width={1088} height={1440} />
            </motion.div>

            {/* Decorative curved line */}
            <svg className="absolute -left-32 -bottom-24 w-[520px] hidden lg:block pointer-events-none" viewBox="0 0 600 300" fill="none">
              <path d="M0 200 Q 200 50, 400 180 T 800 80" stroke="var(--azure)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>

            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="absolute -left-4 top-10 z-20 bg-paper rounded-2xl px-4 py-3 text-xs font-semibold tracking-wide border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              Modelo · Padaria
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="absolute -right-4 bottom-16 z-20 bg-paper rounded-2xl px-5 py-4 max-w-[200px] border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-xs tracking-wide text-ink-soft">Estimativa</div>
              <div className="font-display font-black text-ink leading-tight mt-1">até 24h<br />após envio.</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* VIDEO HERO */}
      <VideoHero />

      {/* MODELS */}
      <section id="modelos" className="scroll-mt-24 mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs tracking-wide text-ink-soft">02 — Modelos</span>
            <h2 className="mt-3 editorial-headline text-5xl md:text-7xl text-ink max-w-2xl">Escolha uma direção visual</h2>
          </div>
          <p className="md:text-right text-ink-soft max-w-md">
            Selecione uma base e adapte com o nome do seu negócio, cores, fotos, serviços, produtos e WhatsApp.
          </p>
        </div>
        <ModelGrid featuredOnly />
        <div className="mt-12 flex justify-center">
          <Link
            to="/modelos"
            className="inline-flex items-center h-14 px-8 rounded-2xl border border-ink text-ink font-semibold tracking-wide hover:bg-ink hover:text-paper transition-colors"
          >
            Ver todos os modelos
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="scroll-mt-24 mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
        <span className="text-xs tracking-wide text-ink-soft">03 — Processo</span>
        <h2 className="mt-3 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">Como funciona a ativação</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", t: "Crie sua conta", d: "Registro rápido com email e WhatsApp.", accent: "azure" as const },
            { n: "02", t: "Escolha o modelo", d: "Selecione a direção visual do seu negócio.", accent: "lime" as const },
            { n: "03", t: "Pague com segurança", d: "Checkout integrado e seguro no site.", accent: "flame" as const },
            { n: "04", t: "Envie suas informações", d: "Adaptamos o modelo ao seu negócio.", accent: "ink" as const },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
              className="group card-personality relative rounded-3xl bg-paper border border-border p-7 overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Subtle accent corner — mirrors model-cover personality */}
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-70 transition-transform duration-500 group-hover:scale-125 ${
                  s.accent === "azure" ? "bg-azure/25" :
                  s.accent === "lime" ? "bg-lime/40" :
                  s.accent === "flame" ? "bg-flame/30" :
                  "bg-ink/10"
                }`}
              />
              <div
                className={`pointer-events-none absolute right-6 bottom-6 h-1.5 w-10 rounded-full transition-all duration-500 group-hover:w-16 ${
                  s.accent === "azure" ? "bg-azure" :
                  s.accent === "lime" ? "bg-lime" :
                  s.accent === "flame" ? "bg-flame" :
                  "bg-ink"
                }`}
              />
              <div className="relative">
                <div className={`font-display font-black text-5xl ${
                  s.accent === "azure" ? "text-azure" :
                  s.accent === "lime" ? "text-ink" :
                  s.accent === "flame" ? "text-flame" :
                  "text-ink"
                }`}>{s.n}</div>
                <h3 className="mt-6 font-display font-black text-xl tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="ativacao" className="scroll-mt-24 mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs tracking-wide text-ink-soft">04 — Planos</span>
            <h2 className="mt-3 editorial-headline text-5xl md:text-7xl text-ink">Planos de ativação</h2>
          </div>
          <p className="md:text-right text-ink-soft max-w-md">
            Pagamento único de ativação + manutenção mensal. Sem letras miúdas, sem promessas exageradas.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {(plans ?? []).map((p: any, i: number) => {
            const isCurrent = currentPlan?.slug === p.slug;
            const isLower = !!currentPlan && p.display_order < currentPlan.display_order;
            const disabled = isCurrent || isLower;
            return (
              <PlanCard
                key={p.id}
                index={i}
                name={p.name}
                activationPrice={formatBRL(p.activation_price)}
                monthlyPrice={formatBRL(p.monthly_price)}
                features={(p.features as string[]) ?? []}
                highlight={p.slug === "plus"}
                onSelect={() => handleSelect(p.slug)}
                disabled={disabled}
                disabledLabel={isCurrent ? "Plano atual" : "Já incluído no seu plano"}
              />
            );
          })}

        </div>
      </section>

      <FAQ />

      {/* FINAL CTA */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[3rem] p-10 md:p-20 overflow-hidden bg-paper text-ink border border-border"
        >
          {/* Moda-style color blocks */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: -30, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: 12 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-24 -top-24 h-[380px] w-[300px] rounded-[3rem] bg-lime pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: 30, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-16 top-16 h-[280px] w-[200px] rounded-[3rem] bg-flame pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-10 left-24 h-[180px] w-[300px] rounded-[3rem] bg-ink pointer-events-none hidden md:block"
          />
          <div
            aria-hidden
            className="absolute right-10 bottom-10 h-6 w-6 rounded-full bg-paper ring-2 ring-ink pointer-events-none"
          />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/70">
              <span className="h-1.5 w-6 bg-ink" /> Próximo passo
            </span>
            <h2 className="editorial-headline mt-6 text-5xl md:text-7xl">
              Pronto para ativar<br /><span className="lime-mark">sua página?</span>
            </h2>
            <p className="mt-6 text-ink-soft max-w-xl">
              Após o pagamento, você envia as informações do seu negócio e nós adaptamos o modelo escolhido.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#ativacao" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform">
                Iniciar ativação <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#modelos" className="inline-flex items-center h-14 px-8 rounded-2xl border border-ink/30 text-ink font-semibold tracking-wide hover:bg-ink hover:text-paper transition-colors">
                Ver modelos
              </a>
            </div>
          </div>
        </motion.div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
