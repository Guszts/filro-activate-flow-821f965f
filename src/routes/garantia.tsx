import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Ban, Lock, FileCheck2, Users, Eye, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/garantia")({
  component: GarantiaPage,
  head: () => ({
    meta: [
      { title: "Garantia e segurança · Filro" },
      { name: "description", content: "Pagamento seguro, sem fidelidade, dados protegidos pela LGPD e revisão antes da publicação. Como a Filro protege você." },
      { property: "og:title", content: "Garantia e segurança · Filro" },
      { property: "og:description", content: "Pagamento Stripe, sem fidelidade, LGPD, revisão antes de publicar." },
      { property: "og:url", content: "https://setup.filro.site/garantia" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/garantia" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

const pillars = [
  {
    icon: CreditCard,
    title: "Pagamento seguro",
    desc: "Processado pela Stripe com criptografia padrão bancário. Os dados do seu cartão nunca passam pelos nossos servidores.",
  },
  {
    icon: Ban,
    title: "Sem fidelidade",
    desc: "Cancele a manutenção quando quiser pelo próprio painel. Sem multa, sem ligação de cobrança, sem letras miúdas.",
  },
  {
    icon: Lock,
    title: "Dados protegidos (LGPD)",
    desc: "Suas informações ficam armazenadas em infraestrutura segura com acesso restrito. Você pode pedir exportação ou exclusão a qualquer momento.",
  },
  {
    icon: FileCheck2,
    title: "Processo documentado",
    desc: "Cada etapa fica registrada no seu painel: o que você enviou, o que entregamos, o que foi revisado e quando foi publicado.",
  },
  {
    icon: Users,
    title: "Suporte humano",
    desc: "Quem responde é gente, não bot. Atendimento por WhatsApp em horário comercial e e-mail para o resto.",
  },
  {
    icon: Eye,
    title: "Revisão antes de publicar",
    desc: "Você vê a prévia, aprova ou pede ajustes. Nada vai ao ar sem a sua aprovação final.",
  },
];

const faqs = [
  {
    q: "E se eu não gostar do resultado?",
    a: "Você tem as revisões inclusas no plano para ajustar texto, cores, imagens e layout. Não publicamos nada sem a sua aprovação. Se ainda assim não fizer sentido, conversamos sobre a melhor saída — sem brigar por dinheiro.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. A manutenção é mês a mês, sem contrato de fidelidade. O cancelamento é feito pelo seu painel e leva 1 clique.",
  },
  {
    q: "O que acontece se eu cancelar?",
    a: "Sua página fica fora do ar a partir do fim do ciclo pago. Você pode exportar os conteúdos enviados antes disso. Reativar é simples se quiser voltar.",
  },
  {
    q: "Meus dados podem vazar?",
    a: "Usamos Supabase com políticas de acesso por linha (RLS), conexões criptografadas e secrets isolados. Apenas você e nosso time de produção autorizado acessam o conteúdo do seu negócio.",
  },
  {
    q: "Vocês cobram extra por surpresa?",
    a: "Não. Mudanças pequenas (texto, foto, contato) estão inclusas. Mudanças grandes (nova página, redesign, integração) são sempre orçadas antes e só prosseguem com a sua aprovação.",
  },
];

function GarantiaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-12">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Garantia e segurança
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">
            Comprar com a Filro é <span className="lime-mark">seguro</span> de verdade.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft">
            A gente sabe que contratar pela internet dá insegurança. Por isso deixamos cada parte do processo transparente e reversível.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl border border-border bg-paper p-7"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="h-12 w-12 grid place-items-center rounded-2xl bg-ink text-paper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display font-black text-lg text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
          <span className="text-xs tracking-wide text-ink-soft">Selos práticos</span>
          <h2 className="mt-3 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">O que isso significa, na prática.</h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-paper p-7" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-flame mt-1" />
                <div>
                  <div className="font-display font-black text-lg text-ink">Você nunca paga sem ver</div>
                  <p className="mt-2 text-sm text-ink-soft">A primeira entrega passa pela sua aprovação antes de ir ao ar. Se algo não bater com o combinado, ajustamos.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-paper p-7" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-flame mt-1" />
                <div>
                  <div className="font-display font-black text-lg text-ink">Reembolso da ativação</div>
                  <p className="mt-2 text-sm text-ink-soft">Se desistir antes do início da produção (até 24h após o pagamento), devolvemos a ativação 100%. Depois disso o trabalho já começou.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="editorial-headline text-3xl md:text-4xl text-ink">Perguntas que sempre aparecem</h3>
            <div className="mt-6 divide-y divide-border/60 rounded-3xl border border-border bg-paper overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              {faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 p-6 hover:bg-muted/40 transition-colors">
                    <span className="font-display font-bold text-ink text-base md:text-lg">{f.q}</span>
                    <span className="text-ink-soft text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-sm text-ink-soft -mt-2">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-20 md:pb-28">
          <div className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Pronto para começar</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">Sem risco, sem fidelidade.</h2>
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
