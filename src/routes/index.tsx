import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ModelGrid } from "@/components/ModelGrid";
import { PlanCard } from "@/components/PlanCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
import heroImg from "@/assets/hero-owner.jpg";
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
              <a href="#ativacao" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform">
                Iniciar ativação
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#modelos" className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-ink text-ink font-semibold tracking-wide hover:bg-ink hover:text-paper transition-colors">
                Ver modelos
              </a>
            </div>
          </motion.div>

          <motion.div style={{ y: yImg }} className="lg:col-span-5 relative">
            <motion.div
              style={{ scale: scaleImg }}
              className="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-stone"
            >
              <img src={heroImg} alt="Dono de padaria local com avental atrás do balcão" className="absolute inset-0 h-full w-full object-cover" width={1080} height={1440} />
            </motion.div>

            {/* Decorative curved line */}
            <svg className="absolute -left-32 -bottom-24 w-[520px] hidden lg:block pointer-events-none" viewBox="0 0 600 300" fill="none">
              <path d="M0 200 Q 200 50, 400 180 T 800 80" stroke="var(--azure)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>

            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="absolute -left-4 top-10 bg-paper rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-widest border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              Modelo · Padaria
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="absolute -right-4 bottom-16 bg-paper rounded-2xl px-5 py-4 max-w-[200px] border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-xs uppercase tracking-widest text-ink-soft">Pronto</div>
              <div className="font-display font-black text-ink leading-tight mt-1">Em dias,<br />não meses.</div>
            </motion.div>
            <motion.a
              href="#ativacao"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: "spring" }}
              className="absolute -bottom-8 -left-6 lg:-left-12 h-28 w-28 rounded-full bg-flame text-paper grid place-items-center font-display font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
              style={{ boxShadow: "var(--shadow-pop)" }}
            >
              Começar
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* MODELS */}
      <section id="modelos" className="scroll-mt-24 mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-soft">02 — Modelos</span>
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
        <span className="text-xs uppercase tracking-widest text-ink-soft">03 — Processo</span>
        <h2 className="mt-3 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">Como funciona a ativação</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", t: "Crie sua conta", d: "Registro rápido com email e WhatsApp." },
            { n: "02", t: "Escolha o modelo", d: "Selecione a direção visual do seu negócio." },
            { n: "03", t: "Pague com segurança", d: "Checkout integrado e seguro no site." },
            { n: "04", t: "Envie suas informações", d: "Adaptamos o modelo ao seu negócio." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-3xl bg-paper border border-border p-7"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="font-display font-black text-5xl text-flame">{s.n}</div>
              <h3 className="mt-6 font-display font-black uppercase text-xl tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="ativacao" className="scroll-mt-24 mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-soft">04 — Planos</span>
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

      {/* FINAL CTA */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-[3rem] bg-ink text-paper p-10 md:p-20 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl">
            <h2 className="editorial-headline text-5xl md:text-7xl">
              Pronto para ativar<br /><span className="lime-mark">sua página?</span>
            </h2>
            <p className="mt-6 text-paper/70 max-w-xl">
              Após o pagamento, você envia as informações do seu negócio e nós adaptamos o modelo escolhido.
            </p>
            <a href="#ativacao" className="mt-10 inline-flex items-center h-14 px-8 rounded-full bg-lime text-ink font-semibold tracking-wide hover:scale-[1.02] transition-transform">
              Iniciar ativação <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
          <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-flame/30 blur-3xl pointer-events-none" />
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
