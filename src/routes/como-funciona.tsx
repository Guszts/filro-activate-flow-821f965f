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
      { name: "description", content: "O processo Filro em 7 passos: do plano à manutenção mensal. Prazos claros, revisão antes de publicar, suporte humano." },
      { property: "og:title", content: "Como funciona · Filro" },
      { property: "og:description", content: "Escolha o plano, pague, envie suas infos, a gente monta, você revisa, publicamos. Em até 24h." },
    ],
  }),
});

type Accent = "azure" | "lime" | "flame" | "ink";

const steps: Array<{ n: string; t: string; d: string; eta: string; accent: Accent }> = [
  { n: "01", t: "Escolha o plano", d: "Compare planos lado a lado e veja qual encaixa no seu negócio. Sem fidelidade, sem letras miúdas.", eta: "5 min", accent: "azure" },
  { n: "02", t: "Pague ativação + 1ª mensalidade", d: "Checkout Stripe — cartão, débito ou Pix. A ativação é única, a manutenção é mensal e cancelável a qualquer momento.", eta: "Imediato", accent: "flame" },
  { n: "03", t: "Envie suas informações", d: "Formulário guiado pede só o essencial: identidade, contato, produtos/serviços e referências visuais. Tudo num lugar só.", eta: "10 a 30 min", accent: "lime" },
  { n: "04", t: "A Filro monta", d: "Nosso time real (não template engessado) adapta o modelo ao seu negócio, com suas cores, copy e fotos.", eta: "Até 24h*", accent: "ink" },
  { n: "05", t: "Você revisa a prévia", d: "Acessa o link de prévia direto no painel. Aprova ou pede ajustes pontuais sem sair da plataforma.", eta: "Quando quiser", accent: "azure" },
  { n: "06", t: "Publicamos no ar", d: "Após sua aprovação, sobe ao ar no domínio combinado. Avisamos por e-mail e no painel.", eta: "Mesmo dia", accent: "lime" },
  { n: "07", t: "Manutenção mensal cuida do resto", d: "Pequenas alterações de texto, foto e contato fazem parte. Mudanças grandes você orça antes pelo painel.", eta: "Contínuo", accent: "flame" },
];

const guarantees = [
  { icon: Clock, title: "Prazo claro", desc: "Estimativas por etapa. Sem 'em breve' eterno." },
  { icon: ShieldCheck, title: "Pagamento Stripe", desc: "Cartão e Pix com segurança padrão bancário." },
  { icon: Wand2, title: "Adaptação humana", desc: "Time real revisa cada entrega antes de você." },
  { icon: MessageCircle, title: "Suporte por WhatsApp", desc: "Resposta em horário comercial — gente, não bot." },
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
            Do plano à publicação em <span className="lime-mark">7 passos</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft">
            Sem tecnologia complicada, sem disco rígido cheio de PDFs. Você compra, envia o conteúdo num formulário guiado, a Filro adapta o modelo ao seu negócio e a página vai ao ar em até 24h*.
          </p>
          <p className="mt-3 text-xs text-ink-soft/80">*Contado a partir do envio completo do formulário. Planos maiores podem ter prazo diferente — veja a tabela comparativa.</p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
                  <div className="flex items-center justify-between">
                    <div className={`font-display font-black text-5xl ${
                      s.accent === "azure" ? "text-azure" :
                      s.accent === "flame" ? "text-flame" :
                      "text-ink"
                    }`}>{s.n}</div>
                    <span className="text-[10px] uppercase tracking-widest text-ink-soft bg-muted px-2 py-1 rounded-full">{s.eta}</span>
                  </div>
                  <h3 className="mt-6 font-display font-black text-xl tracking-tight">{s.t}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
          <span className="text-xs tracking-wide text-ink-soft">O que você pode esperar</span>
          <h2 className="mt-3 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">Sem surpresa em nenhuma etapa.</h2>
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/comparar" className="inline-flex items-center h-11 px-5 rounded-2xl border border-border bg-paper text-ink text-sm font-semibold hover:bg-muted transition-colors">
              Ver tabela comparativa
            </Link>
            <Link to="/garantia" className="inline-flex items-center h-11 px-5 rounded-2xl border border-border bg-paper text-ink text-sm font-semibold hover:bg-muted transition-colors">
              Garantia e segurança
            </Link>
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
