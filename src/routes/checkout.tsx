import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { loadStripe, type Stripe as StripeJS } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stripePromise, setStripePromise] = useState<Promise<StripeJS | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const planSlug = useMemo(() => (typeof window !== "undefined" ? sessionStorage.getItem("filro:selectedPlan") : null), []);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/checkout" } }); return; }
    if (!planSlug) { navigate({ to: "/" }); return; }

    (async () => {
      try {
        // Get publishable key
        const cfg = await supabase.functions.invoke("get-stripe-config");
        const pk = (cfg.data as { publishableKey?: string } | null)?.publishableKey;
        if (!pk) throw new Error("Stripe não configurado");
        setStripePromise(loadStripe(pk));

        // Create payment intent
        const { data, error } = await supabase.functions.invoke("create-payment-intent", { body: { planSlug } });
        if (error) throw error;
        const d = data as { clientSecret: string; planName: string; amount: number };
        setClientSecret(d.clientSecret);
        setPlanName(d.planName);
        setAmount(d.amount);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao iniciar pagamento";
        setError(msg);
        toast.error(msg);
      }
    })();
  }, [loading, user, planSlug, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] w-full px-5 md:px-10 py-12 md:py-16 grid lg:grid-cols-5 gap-10">
        <section className="lg:col-span-3">
          <h1 className="editorial-headline text-5xl md:text-6xl text-ink">Checkout</h1>
          <p className="mt-3 text-ink-soft">Pagamento seguro processado dentro do site.</p>

          <div className="mt-8 card-elevated p-7">
            {error && <div className="text-destructive text-sm mb-4">{error}</div>}
            {!clientSecret || !stripePromise ? (
              <div className="space-y-3">
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded animate-pulse" />
                <div className="h-12 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#202735", borderRadius: "12px" } } }}>
                <PayForm />
              </Elements>
            )}
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="card-elevated p-7 sticky top-28">
            <div className="text-xs tracking-wide text-ink-soft">Resumo</div>
            <div className="mt-4 font-display font-black text-3xl text-ink">{planName || "Plano"}</div>
            <div className="mt-2 text-ink-soft text-sm">Ativação única</div>
            <div className="mt-6 border-t border-border pt-6 flex justify-between items-baseline">
              <span className="text-ink-soft">Total</span>
              <span className="font-display font-black text-3xl text-ink">{amount ? formatBRL(amount) : "—"}</span>
            </div>
            <p className="mt-6 text-xs text-ink-soft">Após o pagamento confirmado, você poderá enviar as informações do negócio.</p>
            <Link to="/" className="mt-6 block text-center text-sm text-ink-soft hover:text-ink">Voltar</Link>
          </div>
        </aside>
      </main>
    </div>
  );
}

function PayForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErrMsg(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });
    if (error) {
      setErrMsg(error.message ?? "Pagamento falhou");
      // Redirect to failed page when terminal error
      if (error.type === "card_error" || error.type === "validation_error") {
        // stay
      } else {
        window.location.href = "/payment-failed";
      }
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <PaymentElement />
      {errMsg && <div className="text-destructive text-sm">{errMsg}</div>}
      <button disabled={!stripe || submitting} className="w-full h-13 py-4 rounded-full bg-ink text-paper font-semibold tracking-wide disabled:opacity-50">
        {submitting ? "Processando..." : "Pagar agora"}
      </button>
    </form>
  );
}
