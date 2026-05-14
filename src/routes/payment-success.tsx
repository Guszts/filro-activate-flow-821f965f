import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock, Receipt } from "lucide-react";
import { formatBRL, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/payment-success")({
  component: SuccessPage,
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: (s.session_id as string) || "",
    payment_intent: (s.payment_intent as string) || "",
    redirect_status: (s.redirect_status as string) || "",
  }),
  head: () => ({ meta: [
    { title: "Pagamento confirmado · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

interface ReceiptData {
  payment: {
    amount: number;
    currency: string;
    status: string;
    paid_at: string | null;
    created_at: string;
    stripe_payment_intent_id: string | null;
  } | null;
  plan: { name: string; activation_price: number; monthly_price: number; slug: string } | null;
  subscription: {
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
}

function SuccessPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ReceiptData | null>(null);
  const [status, setStatus] = useState<"checking" | "ok" | "pending">("checking");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      for (let i = 0; i < 12; i++) {
        const [payRes, subRes] = await Promise.all([
          supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (cancelled) return;
        const payment = payRes.data;
        let plan = null;
        if (payment?.plan_id) {
          const { data: planRow } = await supabase.from("plans").select("name, activation_price, monthly_price, slug").eq("id", payment.plan_id).maybeSingle();
          plan = planRow;
        }
        setData({ payment: payment as any, plan, subscription: subRes.data as any });
        if (payment?.status === "paid") { setStatus("ok"); return; }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setStatus("pending");
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const payment = data?.payment;
  const plan = data?.plan;
  const sub = data?.subscription;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[900px] w-full px-5 md:px-10 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.7 }}
            className="mx-auto h-20 w-20 rounded-full bg-lime grid place-items-center shadow-elegant"
          >
            <Check className="h-10 w-10 text-ink" strokeWidth={3} />
          </motion.div>
          <h1 className="mt-6 editorial-headline text-5xl md:text-6xl text-ink">Pagamento confirmado</h1>
          <p className="mt-3 text-ink-soft">
            {status === "checking" && "Confirmando seu pagamento via webhook…"}
            {status === "ok" && "Tudo certo. Seu recibo está abaixo."}
            {status === "pending" && "Recebemos sua tentativa. Aguardando confirmação do provedor."}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-flame/10 text-flame text-sm font-semibold">
            <Clock className="h-4 w-4" /> Sua presença digital fica pronta em 24h
          </div>
        </motion.div>

        {/* RECEIPT */}
        <div className="mt-10 card-elevated p-7 md:p-10">
          <div className="flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <Receipt className="h-3.5 w-3.5" /> Recibo
          </div>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4">
            <div className="font-display font-black text-3xl md:text-4xl text-ink">{plan?.name || "Plano"}</div>
            <StatusPill status={payment?.status ?? "pending"} />
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-6 text-sm">
            <Field label="Pago em" value={payment?.paid_at ? formatDateTime(payment.paid_at) : "—"} />
            <Field label="Valor cobrado" value={payment ? formatBRL(payment.amount) : "—"} />
            <Field label="ID do pagamento" value={payment?.stripe_payment_intent_id || "—"} mono />
            <Field label="Moeda" value={(payment?.currency || "brl").toUpperCase()} />
          </div>

          {plan && (
            <div className="mt-8 border-t border-border pt-6 grid sm:grid-cols-2 gap-3 text-sm">
              <Field label="Ativação (única)" value={formatBRL(plan.activation_price)} />
              <Field label="Mensalidade" value={`${formatBRL(plan.monthly_price)}/mês`} />
            </div>
          )}

          <div className="mt-8 border-t border-border pt-6">
            <div className="text-xs tracking-wide text-ink-soft mb-3">Assinatura</div>
            {sub ? (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label="Status" value={sub.status} />
                <Field label="Renovação automática" value={sub.cancel_at_period_end ? "Cancelada no fim do ciclo" : "Ativa"} />
                <Field label="Ciclo atual" value={sub.current_period_start ? formatDateTime(sub.current_period_start) : "—"} />
                <Field label="Próximo ciclo em" value={sub.current_period_end ? formatDateTime(sub.current_period_end) : "—"} />
              </div>
            ) : (
              <p className="text-sm text-ink-soft">Aguardando ativação da assinatura via webhook.</p>
            )}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link to="/business-info" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-ink text-paper font-semibold hover:scale-[1.02] transition-transform shadow-elegant">
              Enviar informações do negócio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/painel" className="inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-border text-ink font-semibold hover:bg-muted transition">
              Ir para o painel
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs tracking-wide text-ink-soft">{label}</div>
      <div className={`mt-1 text-ink ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-lime text-ink",
    pending: "bg-muted text-ink-soft",
    processing: "bg-azure/20 text-ink",
    failed: "bg-flame text-paper",
  };
  const label: Record<string, string> = { paid: "Pago", pending: "Pendente", processing: "Processando", failed: "Falha" };
  return <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-muted text-ink-soft"}`}>{label[status] ?? status}</span>;
}
