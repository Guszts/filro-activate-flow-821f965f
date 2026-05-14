import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: UnsubscribePage,
  head: () => ({ meta: [
    { title: "Cancelar inscrição · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "done" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return setState("invalid");
        if (j.valid) return setState("valid");
        if (j.reason === "already_unsubscribed") return setState("already");
        setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  async function confirm() {
    if (!token) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/email/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.success) setState("done");
      else if (j.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-xl w-full px-5 md:px-10 py-16">
        <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Cancelar e-mails</h1>
        <div className="mt-8 card-elevated p-8">
          {state === "loading" && <p className="text-ink-soft">Verificando…</p>}
          {state === "invalid" && <p className="text-destructive">Link inválido ou expirado.</p>}
          {state === "error" && <p className="text-destructive">Algo deu errado. Tente novamente em alguns minutos.</p>}
          {state === "already" && <p className="text-ink-soft">Você já está descadastrado destes e-mails.</p>}
          {state === "valid" && (
            <>
              <p className="text-ink-soft">Confirme abaixo para parar de receber e-mails do Filro neste endereço.</p>
              <button
                onClick={confirm}
                disabled={submitting}
                className="mt-6 inline-flex h-12 px-6 items-center rounded-full bg-ink text-paper font-semibold disabled:opacity-50"
              >
                {submitting ? "Processando…" : "Confirmar cancelamento"}
              </button>
            </>
          )}
          {state === "done" && <p className="text-ink">Pronto. Você não receberá mais e-mails do Filro neste endereço.</p>}
        </div>
      </main>
    </div>
  );
}
