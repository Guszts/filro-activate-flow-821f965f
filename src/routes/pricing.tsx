import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listPublicPlans } from "@/lib/plans.functions";
import { formatCurrency } from "@/lib/formatCurrency";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Filro" },
      { name: "description", content: "Transparent pricing for connected digital systems. Four plans, from Launch to Scale." },
      { property: "og:title", content: "Pricing — Filro" },
      { property: "og:description", content: "Four plans for US businesses: Launch, Growth, Revenue System, Scale." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { data: plans = [] } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => listPublicPlans(),
  });

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Pricing</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          One-time implementation fee plus monthly maintenance. Cancel anytime.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCustom = (plan as any).checkout_mode === "custom";
            const currency = (plan as any).currency ?? "usd";
            const badge = (plan as any).badge as string | null;
            const dueToday = (plan.activation_price ?? 0) + (plan.monthly_price ?? 0);
            const features = Array.isArray(plan.features) ? plan.features : [];
            const highlighted = plan.slug === "revenue_system";
            return (
              <div
                key={plan.id}
                className={
                  "flex flex-col rounded-3xl border p-6 " +
                  (highlighted ? "border-ink bg-ink text-paper" : "border-border/60 bg-paper")
                }
              >
                {badge && (
                  <span className={"self-start rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider " + (highlighted ? "bg-paper text-ink" : "bg-ink text-paper")}>
                    {badge}
                  </span>
                )}
                <h3 className={"mt-3 font-display font-black text-2xl tracking-tight " + (highlighted ? "text-paper" : "text-ink")}>
                  {plan.name}
                </h3>
                <p className={"mt-2 text-sm " + (highlighted ? "text-paper/80" : "text-ink-soft")}>
                  {plan.description}
                </p>
                <div className="mt-5">
                  {isCustom ? (
                    <div>
                      <div className={"font-display font-black text-3xl " + (highlighted ? "text-paper" : "text-ink")}>
                        Custom
                      </div>
                      <div className={"text-xs mt-1 " + (highlighted ? "text-paper/70" : "text-ink-soft")}>
                        Scoped to your business
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={"font-display font-black text-3xl " + (highlighted ? "text-paper" : "text-ink")}>
                        {formatCurrency(plan.activation_price, currency)}
                      </div>
                      <div className={"text-xs mt-1 " + (highlighted ? "text-paper/70" : "text-ink-soft")}>
                        one-time · then {formatCurrency(plan.monthly_price, currency)}/mo
                      </div>
                      <div className={"mt-3 text-xs " + (highlighted ? "text-paper/70" : "text-ink-soft")}>
                        Due today: <strong className={highlighted ? "text-paper" : "text-ink"}>{formatCurrency(dueToday, currency)}</strong>
                      </div>
                    </div>
                  )}
                </div>
                <ul className={"mt-5 space-y-2 text-sm " + (highlighted ? "text-paper/90" : "text-ink-soft")}>
                  {features.slice(0, 6).map((f: any, i: number) => (
                    <li key={i} className="flex gap-2"><span aria-hidden>•</span><span>{String(f)}</span></li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {isCustom ? (
                    <Link to="/get-started" className="inline-flex w-full h-11 items-center justify-center rounded-full bg-paper text-ink font-semibold text-sm">
                      {(plan as any).cta_label ?? "Talk to us"}
                    </Link>
                  ) : (
                    <Link
                      to="/checkout"
                      search={{ plan: plan.slug } as any}
                      className={"inline-flex w-full h-11 items-center justify-center rounded-full font-semibold text-sm " + (highlighted ? "bg-paper text-ink" : "bg-ink text-paper")}
                    >
                      {(plan as any).cta_label ?? "Choose plan"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
