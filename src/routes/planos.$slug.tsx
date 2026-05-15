import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
import { SiteHeader } from "@/components/SiteHeader";

import { ArrowRight, Check } from "lucide-react";
import { TutorialVideo } from "@/components/TutorialVideo";

export const Route = createFileRoute("/planos/$slug")({
  component: PlanDetailsPage,
  head: ({ params }) => ({
    meta: [
      { title: `Plano ${params.slug} — detalhes | Filro` },
      {
        name: "description",
        content: `Veja todos os detalhes do plano ${params.slug}: o que está incluso, preços de ativação e manutenção, e tutorial em vídeo antes de avançar para o checkout.`,
      },
    ],
  }),
});

// Map of optional tutorial videos per slug. Replace embed URLs with the real
// tutorial when available — leaving as null shows a placeholder card.
const TUTORIAL_VIDEOS: Record<string, string | null> = {
  start: "/videos/filro-start.mp4",
  essencial: "/videos/filro-essencial.mp4",
  plus: "/videos/filro-plus.mp4",
  profissional: "/videos/filro-profissional.mp4",
  priority: "/videos/filro-priority.mp4",
  premium: "/videos/filro-premium.mp4",
};

const EXTRAS_BY_SLUG: Record<string, { title: string; items: string[] }[]> = {
  default: [
    {
      title: "Como funciona a entrega",
      items: [
        "Após o pagamento, você recebe um formulário guiado para enviar as informações do negócio.",
        "Adaptamos o modelo escolhido com seus textos, fotos e identidade.",
        "Estimativa de entrega: até 24h após o envio completo das informações.",
        "Você revisa o resultado e aprova antes da publicação final.",
      ],
    },
    {
      title: "Manutenção mensal inclui",
      items: [
        "Hospedagem rápida e estável.",
        "Pequenos ajustes de texto, imagens e contatos sem custo extra.",
        "Atualização de horários, cardápio e serviços.",
        "Suporte por WhatsApp em horário comercial.",
      ],
    },
    {
      title: "Sem complicação",
      items: [
        "Sem fidelidade — cancele quando quiser direto pelo painel.",
        "Pagamento seguro processado pela Stripe.",
        "Domínio próprio configurado sem custo adicional.",
        "Painel para acompanhar status, faturas e solicitar mudanças.",
      ],
    },
  ],
};

function PlanDetailsPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["plan", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleContinue = () => {
    sessionStorage.setItem("filro:selectedPlan", slug);
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    } else {
      navigate({ to: "/checkout" });
    }
  };

  const isFlaro = slug === "plus";
  const tutorialUrl = TUTORIAL_VIDEOS[slug] ?? null;
  const extras = EXTRAS_BY_SLUG[slug] ?? EXTRAS_BY_SLUG.default;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-[1200px] px-5 md:px-10 pt-10 md:pt-16 pb-6">
          <div className="text-xs text-ink-soft">
            <Link to="/" className="hover:text-ink">Início</Link>
            <span className="mx-2">/</span>
            <span>Planos</span>
            <span className="mx-2">/</span>
            <span className="text-ink">{plan?.name ?? slug}</span>
          </div>
        </section>

        {isLoading && (
          <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-20">
            <p className="text-ink-soft">Carregando detalhes do plano…</p>
          </section>
        )}

        {!isLoading && (!plan || error) && (
          <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-20">
            <h1 className="editorial-headline text-4xl md:text-6xl text-ink">Plano não encontrado</h1>
            <p className="mt-4 text-ink-soft">Esse plano não existe ou está inativo.</p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center h-12 px-6 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform"
            >
              Voltar para o início
            </Link>
          </section>
        )}

        {plan && (
          <>
            {/* HERO */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 pt-4 md:pt-8 pb-12 md:pb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={[
                  "relative rounded-[3rem] p-8 md:p-16 overflow-hidden",
                  isFlaro
                    ? "bg-paper text-ink border border-ink/10"
                    : "bg-paper text-ink border border-border",
                ].join(" ")}
                style={{ boxShadow: isFlaro ? "var(--shadow-pop)" : "var(--shadow-card)" }}
              >
                {isFlaro && (
                  <>
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
                  </>
                )}

                <div className="relative z-10 max-w-3xl">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/70">
                    <span className="h-1.5 w-6 bg-flame" /> Plano selecionado
                  </span>
                  <h1 className="editorial-headline mt-6 text-5xl md:text-7xl">
                    {plan.name}
                    {isFlaro && <span className="lime-mark"> Plus</span>}
                  </h1>
                  {plan.description && (
                    <p className="mt-6 text-ink-soft max-w-xl">{plan.description}</p>
                  )}

                  <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-xl">
                    <div className="rounded-2xl border border-border bg-paper p-5">
                      <div className="text-xs uppercase tracking-widest text-ink-soft">Ativação</div>
                      <div className="mt-2 text-4xl font-display font-black tracking-tighter text-ink">
                        {formatBRL(plan.activation_price)}
                      </div>
                      <div className="mt-1 text-xs text-ink-soft">pagamento único</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-paper p-5">
                      <div className="text-xs uppercase tracking-widest text-ink-soft">Manutenção</div>
                      <div className="mt-2 text-4xl font-display font-black tracking-tighter text-ink">
                        {formatBRL(plan.monthly_price)}
                        <span className="text-base font-semibold text-ink-soft">/mês</span>
                      </div>
                      <div className="mt-1 text-xs text-ink-soft">cancele quando quiser</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* INCLUDED FEATURES */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16 grid lg:grid-cols-5 gap-10">
              <div className="lg:col-span-2">
                <span className="text-xs tracking-wide text-ink-soft">O que está incluso</span>
                <h2 className="mt-3 editorial-headline text-4xl md:text-5xl text-ink">
                  Tudo o que vem<br />no seu plano.
                </h2>
                <p className="mt-4 text-ink-soft">
                  Lista completa do que será entregue depois do pagamento. Itens marcados com check fazem parte do plano {plan.name}.
                </p>
              </div>
              <ul className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
                {((plan.features as string[]) ?? []).map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 items-start rounded-2xl border border-border bg-paper p-4"
                  >
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-lime grid place-items-center flex-none">
                      <Check className="h-3.5 w-3.5 text-ink" />
                    </span>
                    <span className="text-sm text-ink">{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* TUTORIAL VIDEO */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16">
              <span className="text-xs tracking-wide text-ink-soft">Tutorial em vídeo</span>
              <h2 className="mt-3 editorial-headline text-4xl md:text-5xl text-ink">
                Veja como funciona<br />em 2 minutos.
              </h2>
              <TutorialVideo url={tutorialUrl} planName={plan.name} />

            </section>

            {/* EXTRA DETAIL BLOCKS */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16 grid md:grid-cols-3 gap-6">
              {extras.map((block) => (
                <div
                  key={block.title}
                  className="rounded-3xl border border-border bg-paper p-7"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <h3 className="font-display text-2xl font-black tracking-tight">{block.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-flame flex-none" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            {/* TRUST BADGES */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { t: "Entrega em 24h", d: "Após envio das informações." },
                  { t: "Pagamento seguro", d: "Processado pela Stripe." },
                  { t: "Sem fidelidade", d: "Cancele quando quiser." },
                  { t: "Suporte humano", d: "WhatsApp em horário comercial." },
                ].map((b) => (
                  <div key={b.t} className="rounded-2xl border border-border bg-paper p-5">
                    <div className="font-display font-black text-base text-ink">{b.t}</div>
                    <div className="mt-1 text-sm text-ink-soft">{b.d}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* PLAN-SPECIFIC FAQ */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16">
              <span className="text-xs tracking-wide text-ink-soft">Dúvidas sobre o plano</span>
              <h2 className="mt-3 editorial-headline text-4xl md:text-5xl text-ink">Perguntas comuns.</h2>
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                {[
                  { q: "Como avanço para o checkout?", a: `Clique em "Continuar para o checkout" abaixo. Você será direcionado ao pagamento seguro pela Stripe.` },
                  { q: "O que acontece após o pagamento?", a: "Você recebe um formulário guiado para enviar as informações do negócio (logo, fotos, contato, etc.). Em até 24h após o envio completo, sua página está no ar." },
                  { q: "Posso trocar de plano depois?", a: "Sim. É possível fazer upgrade a qualquer momento direto pelo painel. Downgrades ocorrem no próximo ciclo." },
                  { q: "Tem fidelidade?", a: "Não. Cancele a manutenção quando quiser direto pelo painel. A ativação é única e não recorrente." },
                ].map((f) => (
                  <div key={f.q} className="rounded-2xl border border-border bg-paper p-5">
                    <div className="font-display font-black text-ink">{f.q}</div>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SUMMARY + CONTINUE */}
            <section className="mx-auto max-w-[1200px] px-5 md:px-10 pb-32 md:pb-28">
              <div
                className="rounded-3xl border border-border bg-paper p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink-soft">Resumo</div>
                  <div className="mt-2 font-display text-2xl md:text-3xl font-black tracking-tight text-ink">
                    {plan.name} · {formatBRL(plan.activation_price)} de ativação
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    + {formatBRL(plan.monthly_price)}/mês de manutenção · cancele quando quiser
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/planos"
                    className="inline-flex items-center h-13 py-4 px-6 rounded-2xl border border-ink/30 text-ink font-semibold tracking-wide hover:bg-ink hover:text-paper transition-colors"
                  >
                    Ver outros planos
                  </Link>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="inline-flex items-center h-13 py-4 px-6 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform"
                  >
                    Continuar para o checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* MOBILE STICKY CTA */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-border p-4">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full inline-flex items-center justify-center h-13 px-6 rounded-2xl bg-ink text-paper font-semibold tracking-wide"
              >
                Continuar · {formatBRL(plan.activation_price)} <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

