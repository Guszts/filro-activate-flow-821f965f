import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
          <div className="mx-auto h-20 w-20 rounded-full bg-lime grid place-items-center">
            <Check className="h-10 w-10 text-ink" strokeWidth={3} />
          </div>
          <h1 className="mt-8 editorial-headline text-5xl md:text-6xl text-ink">Ativação recebida</h1>
          <p className="mt-4 text-ink-soft text-pretty">
            {status === "checking" && "Confirmando seu pagamento..."}
            {status === "ok" && "Seu pagamento foi confirmado. O próximo passo é enviar as informações do negócio."}
            {status === "pending" && "Recebemos sua tentativa. A confirmação pode levar alguns instantes."}
          </p>
          <Link to="/" className="mt-10 inline-flex items-center h-13 px-7 rounded-full bg-ink text-paper font-semibold">
            Continuar
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
