import { Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatBRL } from "@/lib/format";
import { Check, Minus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/comparar")({
  component: CompararPage,
  head: () => ({
    meta: [
      { title: "Comparar planos · Filro" },
      { name: "description", content: "Compare lado a lado todos os planos da Filro: páginas, catálogo, SEO, suporte, prazo e mais. Escolha o ideal para o seu negócio." },
      { property: "og:title", content: "Comparar planos · Filro" },
      { property: "og:description", content: "Tabela comparativa completa dos planos Filro." },
      { property: "og:url", content: "https://setup.filro.site/comparar" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/comparar" }],
  }),
});

// Matriz de features por slug. Mantida no front porque os planos têm
// recursos qualitativos que não cabem como string solta no banco.
type Cell = boolean | string;
type Row = { label: string; group: string; values: Record<string, Cell> };

const MATRIX: Row[] = [
  // Estrutura
  { group: "Estrutura", label: "Páginas inclusas", values: { start: "1", essencial: "1", plus: "1 + seções extras", profissional: "Até 3", priority: "Até 5", premium: "Ilimitadas" } },
  { group: "Estrutura", label: "Domínio próprio", values: { start: false, essencial: true, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Estrutura", label: "Hospedagem inclusa", values: { start: true, essencial: true, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Estrutura", label: "Mobile otimizado", values: { start: true, essencial: true, plus: true, profissional: true, priority: true, premium: true } },

  // Conteúdo
  { group: "Conteúdo", label: "Catálogo de produtos/serviços", values: { start: "Até 6", essencial: "Até 12", plus: "Até 24", profissional: "Até 40", priority: "Até 80", premium: "Ilimitado" } },
  { group: "Conteúdo", label: "Galeria de imagens", values: { start: "Básica", essencial: true, plus: true, profissional: true, priority: true, premium: "Avançada" } },
  { group: "Conteúdo", label: "Formulário de contato", values: { start: true, essencial: true, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Conteúdo", label: "Botão WhatsApp", values: { start: true, essencial: true, plus: true, profissional: true, priority: true, premium: true } },

  // Marketing
  { group: "Marketing", label: "SEO básico", values: { start: true, essencial: true, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Marketing", label: "SEO avançado", values: { start: false, essencial: false, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Marketing", label: "Google Analytics / Meta Pixel", values: { start: false, essencial: false, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Marketing", label: "Animações e micro-interações", values: { start: "Sutis", essencial: "Sutis", plus: "Refinadas", profissional: "Refinadas", priority: "Avançadas", premium: "Cinematográficas" } },

  // Operação
  { group: "Operação", label: "Prazo de entrega", values: { start: "Até 24h", essencial: "Até 24h", plus: "Até 48h", profissional: "Até 72h", priority: "Até 48h (prioridade)", premium: "Até 5 dias úteis" } },
  { group: "Operação", label: "Revisões inclusas", values: { start: "1", essencial: "2", plus: "3", profissional: "3", priority: "Ilimitadas", premium: "Ilimitadas" } },
  { group: "Operação", label: "Pequenas alterações mensais", values: { start: true, essencial: true, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Operação", label: "Suporte", values: { start: "E-mail", essencial: "E-mail + WhatsApp", plus: "WhatsApp", profissional: "WhatsApp", priority: "Prioritário", premium: "Dedicado" } },

  // Avançado
  { group: "Avançado", label: "Integrações externas", values: { start: false, essencial: false, plus: false, profissional: "1 integração", priority: "Até 3", premium: "Sob demanda" } },
  { group: "Avançado", label: "Páginas adicionais sob demanda", values: { start: false, essencial: false, plus: true, profissional: true, priority: true, premium: true } },
  { group: "Avançado", label: "Atendimento prioritário", values: { start: false, essencial: false, plus: false, profissional: false, priority: true, premium: true } },
];

const groups = Array.from(new Set(MATRIX.map((r) => r.group)));

function Cell({ value }: { value: Cell }) {
  if (value === true) return <Check className="h-4 w-4 text-ink mx-auto" aria-label="Incluso" />;
  if (value === false) return <Minus className="h-4 w-4 text-ink-soft/40 mx-auto" aria-label="Não incluso" />;
  return <span className="text-xs md:text-sm text-ink">{value}</span>;
}

function CompararPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans-compare"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans").select("*").eq("active", true).eq("hidden", false).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-10">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Comparar planos
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">
            Tudo lado a lado, <span className="lime-mark">sem letras miúdas</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft">
            Veja exatamente o que cada plano entrega. Todos incluem hospedagem, suporte e pequenas alterações mensais. Sem fidelidade.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-20 md:pb-28">
          {isLoading || !plans?.length ? (
            <div className="rounded-3xl border border-border bg-paper p-10 text-center text-ink-soft">Carregando planos…</div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-3xl border border-border bg-paper overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="sticky left-0 z-10 bg-muted/60 px-4 md:px-6 py-5 text-xs uppercase tracking-widest text-ink-soft font-semibold w-[220px]">Plano</th>
                      {plans.map((p) => (
                        <th key={p.id} className="px-3 md:px-4 py-5 text-center align-bottom">
                          <div className="flex flex-col items-center gap-1">
                            {p.slug === "plus" && (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-flame text-paper px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                            <div className="font-display font-black text-lg text-ink">{p.name}</div>
                            <div className="text-xs text-ink-soft">{formatBRL(p.activation_price)} ativação</div>
                            <div className="text-xs text-ink-soft">{formatBRL(p.monthly_price)}/mês</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => (
                      <Fragment key={`g-${g}`}>
                        <tr className="bg-muted/30">
                          <td colSpan={plans.length + 1} className="px-4 md:px-6 py-3 text-xs uppercase tracking-widest font-semibold text-ink-soft">
                            {g}
                          </td>
                        </tr>
                        {MATRIX.filter((r) => r.group === g).map((row) => (
                          <tr key={row.label} className="border-t border-border/60">
                            <td className="sticky left-0 z-10 bg-paper px-4 md:px-6 py-4 text-sm text-ink">{row.label}</td>
                            {plans.map((p) => (
                              <td key={p.id} className={`px-3 md:px-4 py-4 text-center ${p.slug === "plus" ? "bg-lime/5" : ""}`}>
                                <Cell value={row.values[p.slug] ?? false} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                    <tr className="border-t border-border bg-muted/30">
                      <td className="sticky left-0 z-10 bg-muted/30 px-4 md:px-6 py-5 text-sm font-semibold text-ink">Começar agora</td>
                      {plans.map((p) => (
                        <td key={p.id} className="px-3 md:px-4 py-5 text-center">
                          <Link to="/planos/$slug" params={{ slug: p.slug }}
                            className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-ink text-paper text-xs font-semibold tracking-wide hover:scale-[1.03] transition-transform">
                            Escolher
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          <div className="mt-10 grid gap-4 md:grid-cols-3 text-sm text-ink-soft">
            <div className="rounded-2xl border border-border bg-paper p-5">
              <div className="font-semibold text-ink">Sem fidelidade</div>
              <p className="mt-1">Cancele a manutenção quando quiser pelo painel. Sem multa.</p>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-5">
              <div className="font-semibold text-ink">Pagamento seguro</div>
              <p className="mt-1">Processado pela Stripe com criptografia padrão bancário.</p>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-5">
              <div className="font-semibold text-ink">Pequenas alterações inclusas</div>
              <p className="mt-1">Mudanças de texto, foto e contato fazem parte do plano. Mudanças grandes são orçadas à parte.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-20 md:pb-28">
          <div className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Em dúvida?</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">A gente te ajuda a escolher.</h2>
              <p className="mt-4 text-ink-soft max-w-xl">Fala com o nosso assistente ou vê primeiro como o processo funciona.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 self-start md:self-end">
              <Link to="/como-funciona" className="inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-border bg-paper text-ink text-sm font-semibold hover:bg-muted transition-colors">
                Como funciona
              </Link>
              <Link to="/planos" className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide hover:scale-[1.02] transition-transform">
                Ver planos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
