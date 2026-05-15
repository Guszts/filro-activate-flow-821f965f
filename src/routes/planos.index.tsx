import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PlanCard } from "@/components/PlanCard";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/planos/")({
  component: PlanosIndexPage,
  head: () => ({
    meta: [
      { title: "Planos · Filro" },
      { name: "description", content: "Conheça todos os planos da Filro: ativação única + manutenção mensal. Do Start ao Premium, escolha o plano ideal para o seu negócio." },
      { property: "og:title", content: "Planos · Filro" },
      { property: "og:description", content: "Do Start ao Premium — ativação única + manutenção mensal. Sem fidelidade." },
    ],
  }),
});

function PlanosIndexPage() {
  const navigate = useNavigate();
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
    navigate({ to: "/planos/$slug", params: { slug } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-10">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Planos
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">
            Escolha o <span className="lime-mark">plano ideal</span> para o seu negócio.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft">
            Ativação única + manutenção mensal. Sem fidelidade. Sem letras miúdas. Todos os planos incluem hospedagem, suporte e pequenas alterações.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-20 md:pb-28">
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
      </main>
      <SiteFooter />
    </div>
  );
}
