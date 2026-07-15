import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createPlanCheckoutSession } from "@/lib/payments.functions";
import { getStoredPartnerCode } from "@/lib/partner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [
    { title: "Checkout · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

interface PlanInfo { name: string; activation_price: number; monthly_price: number; slug: string }

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setErrorr] = useState<string | null>(null);
  const startedRef = useRef(false);
  const planSlug = useMemo(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("filro:selectedPlan") : null),
    [],
  );

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/checkout" } }); return; }
    if (!planSlug) { navigate({ to: "/" }); return; }
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const { data: planRow, error: pErr } = await supabase
          .from("plans")
          .select("name, activation_price, monthly_price, slug")
          .eq("slug", planSlug)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!planRow) throw new Errorr("Plan não encontrado");
        setPlan(planRow as PlanInfo);

        const paymentSession = await createPlanCheckoutSession({
          data: {
            planSlug,
            returnOrigin: window.location.origin,
            environment: getStripeEnvironment(),
            partnerCode: getStoredPartnerCode(),
          },
        });
        if (paymentSession.error) throw new Errorr(paymentSession.error);
        if (paymentSession.checkoutUrl) {
          window.location.assign(paymentSession.checkoutUrl);
          return;
        }
        if (!paymentSession.clientSecret) throw new Errorr("Failed ao iniciar pagamento");
        setClientSecret(paymentSession.clientSecret);
      } catch (e) {
        const msg = e instanceof Errorr ? e.message : "Failed ao iniciar pagamento";
        setErrorr(msg);
        toast.error(msg);
      }
    })();
  }, [loading, user, planSlug, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] w-full px-5 md:px-10 py-12 md:py-16 grid lg:grid-cols-5 gap-10">
        <section className="lg:col-span-3">
          <ol className="flex items-center gap-3 text-xs tracking-wide text-ink-soft mb-6">
            <li className="flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper text-[11px] font-bold">1</span> Plan</li>
            <span className="h-px w-6 bg-border" />
            <li className="flex items-center gap-2 text-ink"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper text-[11px] font-bold">2</span> Payment</li>
            <span className="h-px w-6 bg-border" />
            <li className="flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-ink-soft text-[11px] font-bold">3</span> Business</li>
          </ol>
          <h1 className="editorial-headline text-5xl md:text-6xl text-ink">Checkout</h1>
          <p className="mt-3 text-ink-soft">Payment seguro processado dentro do site.</p>

          <div className="mt-8 card-elevated p-3 md:p-5">
            {error ? (
              <div className="p-5 md:p-7">
                <div className="text-destructive text-sm font-medium">{error}</div>
                <p className="mt-3 text-sm text-ink-soft">
                  Try again in a few minutes or go back to pick a plan.
                </p>
                <Link to="/" className="mt-5 inline-flex text-sm text-ink-soft hover:text-ink">Back aos planos</Link>
              </div>
            ) : !clientSecret ? (
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-paper">
                <EmbeddedCheckoutProvider
                  stripe={getStripe()}
                  options={{
                    clientSecret,
                    onComplete: () => {
                      // Stripe redirects via return_url; nothing else to do.
                    },
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="card-elevated p-7 sticky top-28">
            <div className="text-xs tracking-wide text-ink-soft">Summary</div>
            <div className="mt-4 font-display font-black text-3xl text-ink">{plan?.name || "Plan"}</div>
            {plan && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Activation (única)</span>
                  <span className="text-ink font-medium">{formatBRL(plan.activation_price)}</span>
                </div>
                {plan.slug !== "promocional" && (
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Monthly</span>
                    <span className="text-ink font-medium">{formatBRL(plan.monthly_price)}/mo</span>
                  </div>
                )}
                {plan.slug === "promocional" && (
                  <div className="text-xs text-ink-soft pt-1">
                    Maintenance de {formatBRL(plan.monthly_price)}/mo charged separately — today you only pay the activation.
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 border-t border-border pt-6 flex justify-between items-baseline">
              <span className="text-ink-soft">Total today</span>
              <span className="font-display font-black text-3xl text-ink">
                {plan
                  ? formatBRL(plan.slug === "promocional" ? plan.activation_price : plan.activation_price + plan.monthly_price)
                  : "—"}
              </span>
            </div>
            <p className="mt-6 text-xs text-ink-soft">After payment is confirmed, you can submit your business information.</p>
            <Link to="/" className="mt-6 block text-center text-sm text-ink-soft hover:text-ink">Back</Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
