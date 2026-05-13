import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock } from "lucide-react";

export const Route = createFileRoute("/payment-success")({
  component: SuccessPage,
  validateSearch: (s: Record<string, unknown>) => ({
    payment_intent: (s.payment_intent as string) || "",
    redirect_status: (s.redirect_status as string) || "",
  }),
});

function SuccessPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"checking" | "ok" | "pending">("checking");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const poll = async () => {
      for (let i = 0; i < 8; i++) {
        const { data } = await supabase
          .from("payments")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (cancelled) return;
        if (data?.[0]?.status === "paid") { setStatus("ok"); return; }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setStatus("pending");
    };
    poll();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.7 }}
            className="mx-auto h-24 w-24 rounded-full bg-lime grid place-items-center shadow-elegant"
          >
            <Check className="h-12 w-12 text-ink" strokeWidth={3} />
          </motion.div>
          <h1 className="mt-8 editorial-headline text-5xl md:text-6xl text-ink">Pagamento confirmado</h1>
          <p className="mt-4 text-ink-soft text-pretty">
            {status === "checking" && "Confirmando seu pagamento..."}
            {status === "ok" && "Tudo certo! O próximo passo é nos contar sobre seu negócio para começarmos a produção."}
            {status === "pending" && "Recebemos sua tentativa. A confirmação pode levar alguns instantes."}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-flame/10 text-flame text-sm font-semibold">
            <Clock className="h-4 w-4" /> Sua presença digital fica pronta em 24h
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/business-info" className="inline-flex items-center justify-center gap-2 h-13 px-7 py-3 rounded-full bg-ink text-paper font-semibold hover:scale-[1.03] transition-transform shadow-elegant">
              Enviar informações do negócio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/" className="inline-flex items-center justify-center h-13 px-7 py-3 rounded-full border border-border text-ink font-semibold hover:bg-muted transition">
              Mais tarde
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
