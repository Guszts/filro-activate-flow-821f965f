import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ModelGrid } from "@/components/ModelGrid";
import { VideoHero } from "@/components/VideoHero";
import { PlanCard } from "@/components/PlanCard";
import { FAQ } from "@/components/FAQ";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
const heroImg = "https://vcosjojrcnofamjqatgg.supabase.co/storage/v1/object/public/media/1778722402326-eytc71-9ru1H.jpg";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const handleSelect = (slug: string) => {
    sessionStorage.setItem("filro:selectedPlan", slug);
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    } else {
      navigate({ to: "/checkout" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-24 md:pb-32 grid lg:grid-cols-12 gap-10 items-end">
          <motion.div style={{ y: yText }} className="lg:col-span-7 relative z-10">
            <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
              <span className="h-1.5 w-6 bg-flame" /> Ativação baseada em modelos
            </span>
            <h1 className="editorial-headline mt-6 text-[14vw] sm:text-[10vw] lg:text-[8.5rem] text-ink">
              Ative sua<br />
              <span className="lime-mark">presença</span><br />
              digital.
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-ink-soft text-pretty">
              Páginas profissionais, cardápios digitais, portfólios e sites de negócios adaptados para empresas locais que precisam de uma apresentação online mais limpa, forte e organizada.
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
              className="relative aspect-[3/4] rounded-[32px] lg:rounded-[48px] overflow-hidden border border-white/10 bg-black/60 shadow-2xl hero-shadow transition-all duration-500 md:duration-1000"
            >
              <img src={heroImg} alt="Dono de padaria local com avental atrás do balcão" className="absolute inset-0 h-full w-full object-cover" width={1080} height={1440} />
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
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
              <div className="text-xs tracking-wide text-ink-soft">Pronto em</div>
              <div className="font-display font-black text-ink leading-tight mt-1">24 horas,<br />garantido.</div>
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
        <ModelGrid />
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
          {(plans ?? []).map((p, i) => (
            <PlanCard
              key={p.id}
              index={i}
              name={p.name}
              activationPrice={formatBRL(p.activation_price)}
              monthlyPrice={formatBRL(p.monthly_price)}
              features={(p.features as string[]) ?? []}
              highlight={p.slug === "plus"}
              onSelect={() => handleSelect(p.slug)}
            />
          ))}
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
          className="relative rounded-[3rem] p-10 md:p-20 overflow-hidden text-paper"
          style={{
            background:
              "radial-gradient(130% 90% at 100% 0%, oklch(0.628 0.231 30 / 0.55) 0%, transparent 50%), radial-gradient(120% 100% at 0% 100%, oklch(0.61 0.135 270 / 0.55) 0%, transparent 55%), linear-gradient(140deg, oklch(0.2 0.035 260) 0%, oklch(0.16 0.03 260) 100%)",
          }}
        >
          {/* Soft glow blobs */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full bg-flame/40 blur-3xl pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.35 }}
            className="absolute -left-40 -bottom-40 h-[460px] w-[460px] rounded-full bg-azure/40 blur-3xl pointer-events-none"
          />

          {/* Filro personality — color blocks echoing model covers */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute right-0 top-0 hidden md:flex flex-col gap-1 pointer-events-none"
          >
            <div className="h-3 w-40 bg-lime" />
            <div className="h-3 w-28 bg-flame" />
            <div className="h-3 w-16 bg-paper/80" />
          </motion.div>

          {/* Plus cross — clinic motif */}
          <motion.svg
            aria-hidden
            initial={{ opacity: 0, rotate: -20, scale: 0.6 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="absolute right-10 bottom-10 hidden md:block pointer-events-none"
            width="72" height="72" viewBox="0 0 72 72" fill="none"
          >
            <rect x="28" y="6" width="16" height="60" rx="3" fill="var(--lime)" />
            <rect x="6" y="28" width="60" height="16" rx="3" fill="var(--lime)" />
          </motion.svg>

          {/* Halftone dots — sesame motif */}
          <div aria-hidden className="absolute left-10 top-10 hidden md:grid grid-cols-4 gap-2 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-paper/40" />
            ))}
          </div>

          {/* Diagonal flame stripe — fashion motif */}
          <div
            aria-hidden
            className="absolute -left-10 top-1/2 h-2 w-44 bg-flame/70 rotate-[-35deg] hidden md:block pointer-events-none"
          />

          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(var(--paper) 1px, transparent 1px), linear-gradient(90deg, var(--paper) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-paper/70">
              <span className="h-1.5 w-6 bg-lime" /> Próximo passo
            </span>
            <h2 className="editorial-headline mt-6 text-5xl md:text-7xl">
              Pronto para ativar<br /><span className="lime-mark">sua página?</span>
            </h2>
            <p className="mt-6 text-paper/70 max-w-xl">
              Após o pagamento, você envia as informações do seu negócio e nós adaptamos o modelo escolhido.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#ativacao" className="inline-flex items-center h-14 px-8 rounded-2xl bg-lime text-ink font-semibold tracking-wide hover:scale-[1.02] transition-transform">
                Iniciar ativação <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#modelos" className="inline-flex items-center h-14 px-8 rounded-2xl border border-paper/30 text-paper font-semibold tracking-wide hover:bg-paper hover:text-ink transition-colors">
                Ver modelos
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
