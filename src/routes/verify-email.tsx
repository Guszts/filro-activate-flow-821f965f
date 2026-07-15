import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (s: Record<string, unknown>) => ({
    email: (s.email as string) || "",
    redirect: (s.redirect as string) || "/checkout",
  }),
  head: () => ({ meta: [
    { title: "Confirmar e-mail · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email, redirect } = useSearch({ from: "/verify-email" });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return (
      <main className="min-h-screen grid place-items-center px-5 py-10">
        <div className="text-center">
          <p className="text-ink-soft mb-4">Email not provided.</p>
          <Link to="/register" className="text-ink underline">Voltar ao cadastro</Link>
        </div>
      </main>
    );
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length !== 6) return toast.error("Type os 6 dígitos do código");
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data.session) return toast.error("Couldn't confirm. Try resending the code.");

    // Disparar boas-vindas + aviso admin (best effort)
    try {
      const userName = data.user?.user_metadata?.name as string | undefined;
      const { sendTransactionalEmail } = await import("@/lib/email/send");
      await sendTransactionalEmail({
        templateName: "welcome-signup",
        recipientEmail: email,
        idempotencyKey: `welcome-signup-${data.user?.id}`,
        templateData: { name: userName, checkoutUrl: `${window.location.origin}/checkout` },
      }).catch(() => {});
      // admin notify (requires auth — endpoint forces userId = caller)
      await fetch("/api/public/notify-admin-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({}),
      }).catch(() => {});

    } catch {}

    toast.success("E-mail confirmado");
    navigate({ to: redirect });
  };

  const resend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) return toast.error(error.message);
    toast.success("Código reenviado");
    setCooldown(45);
  };

  return (
    <main className="min-h-screen grid place-items-center px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/register" search={{ redirect }} className="text-sm text-ink-soft hover:text-ink">← Voltar</Link>
        <h1 className="mt-8 editorial-headline text-4xl sm:text-5xl text-ink">Confirm your email</h1>
        <p className="mt-3 text-ink-soft">
          We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
        </p>
        <form onSubmit={verify} className="mt-8 card-elevated p-6 sm:p-7 grid gap-4">
          <label className="text-xs tracking-wide text-ink-soft uppercase">Código de 6 dígitos</label>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full h-14 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink text-center text-2xl tracking-[0.5em] font-mono"
            placeholder="000000"
            required
          />
          <button disabled={loading || code.length !== 6} className="w-full h-13 py-4 rounded-full bg-ink text-paper font-semibold tracking-wide disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-elegant">
            {loading ? "Confirmando..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldown > 0}
            className="text-sm text-ink-soft hover:text-ink disabled:opacity-50"
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : resending ? "Reenviando..." : "Reenviar código"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
