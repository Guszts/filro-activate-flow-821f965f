import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, ShieldCheck, MessageCircle, Wand2 } from "lucide-react";

export const Route = createFileRoute("/como-funciona")({
  component: ComoFuncionaPage,
  head: () => ({
    meta: [
      { title: "Como funciona · Filro" },
      { name: "description", content: "Da escolha do modelo à publicação em 24h: veja como a Filro ativa sua presença digital sem complicação." },
      { property: "og:title", content: "Como funciona · Filro" },
      { property: "og:description", content: "Modelo, pagamento, formulário guiado e publicação em até 24h." },
    ],
  }),
});

const steps = [
  { n: "01", t: "Crie sua conta", d: "Registro rápido com email e WhatsApp. Sem cartão para criar conta.", accent: "azure" as const },
  { n: "02", t: "Escolha o modelo", d: "Selecione a direção visual que combina com o seu negócio.", accent: "lime" as const },
  { n: "03", t: "Pague com segurança", d: "Checkout Stripe. Cartão, débito ou Pix. Ativação única + mensalidade.", accent: "flame" as const },
  { n: "04", t: "Envie suas informações", d: "Formulário guiado: identidade, contato, catálogo e referências.", accent: "ink" as const },
  { n: "05", t: "Adaptamos ao seu negócio", d: "Nosso time monta a página com o seu conteúdo e suas cores.", accent: "azure" as const },
  { n: "06", t: "Revisão e publicação", d: "Você aprova, publicamos no ar. Pequenos ajustes inclusos.", accent: "lime" as const },
];

const guarantees = [
  { icon: Clock, title: "Entrega em 24h", desc: "Estimativa contada a partir do envio completo do formulário." },
  { icon: ShieldCheck, title: "Pagamento seguro", desc: "Processado pela Stripe com criptografia padrão bancária." },
  { icon: Wand2, title: "Adaptação humana", desc: "Time real revisa cada detalhe. Sem template engessado." },
  { icon: MessageCircle, title: "Suporte direto", desc: "Fala com a gente pelo WhatsApp em horário comercial." },
];

function ComoFuncionaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-12">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Como funciona
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">
            Do modelo à publicação em <span className="lime-mark">24h</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft">
            Você não precisa entender de tecnologia. Escolhe o modelo, paga, envia as informações do negócio e a gente cuida do resto.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group card-personality relative rounded-3xl bg-paper border border-border p-7 overflow-hidden"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-70 transition-transform duration-500 group-hover:scale-125 ${
                  s.accent === "azure" ? "bg-azure/25" :
                  s.accent === "lime" ? "bg-lime/40" :
                  s.accent === "flame" ? "bg-flame/30" :
                  "bg-ink/10"
                }`} />
                <div className="relative">
                  <div className={`font-display font-black text-5xl ${
                    s.accent === "azure" ? "text-azure" :
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

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
          <span className="text-xs tracking-wide text-ink-soft">Garantias</span>
          <h2 className="mt-3 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">O que você pode esperar.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.title} className="rounded-3xl border border-border bg-paper p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="h-11 w-11 grid place-items-center rounded-2xl bg-ink text-paper"><Icon className="h-5 w-5" /></div>
                  <div className="mt-4 font-display font-black text-lg text-ink">{g.title}</div>
                  <p className="mt-1 text-sm text-ink-soft">{g.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-20 md:pb-28">
          <div className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Próximo passo</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">Escolha um plano e comece.</h2>
            </div>
            <Link to="/planos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform self-start md:self-end">
              Ver planos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
