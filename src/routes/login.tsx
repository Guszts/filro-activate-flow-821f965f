import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function safeRedirect(raw: unknown, fallback = "/") {
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: safeRedirect(s.redirect) }),
  head: () => ({ meta: [
    { title: "Entrar · Filro" },
    { name: "description", content: "Acesse sua conta Filro para gerenciar sua página, conteúdos e ativação." },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta");
    // Check role to decide where to go
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (isAdmin) return navigate({ to: "/console" });
    }
    navigate({ to: safeRedirect(redirect) });
  };

  return (
    <main className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Início</Link>
        <h1 className="mt-10 editorial-headline text-5xl text-ink">Entrar</h1>
        <p className="mt-3 text-ink-soft">Acesse sua conta para continuar a ativação.</p>
        <form onSubmit={submit} className="mt-8 card-elevated p-7 space-y-4">
          <div>
            <label className="text-xs tracking-wide text-ink-soft">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-12 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink" />
          </div>
          <div>
            <label className="text-xs tracking-wide text-ink-soft">Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full h-12 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink" />
          </div>
          <button disabled={loading} className="w-full h-13 py-4 rounded-full bg-ink text-paper font-semibold tracking-wide disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Não tem conta? <Link to="/register" search={{ redirect: safeRedirect(redirect) }} className="text-ink font-semibold underline-offset-4 hover:underline">Criar conta</Link>
        </p>
      </div>
    </main>
  );
}
