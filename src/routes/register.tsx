import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(8).max(30),
  business_name: z.string().trim().min(1).max(100),
  business_segment: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(72),
});

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/checkout" }),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/register" });
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", business_name: "", business_segment: "", password: "" });
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: form.name,
          whatsapp: form.whatsapp,
          business_name: form.business_name,
          business_segment: form.business_segment,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada");
    navigate({ to: redirect });
  };

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-xl">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Início</Link>
        <h1 className="mt-10 editorial-headline text-5xl text-ink">Criar conta</h1>
        <p className="mt-3 text-ink-soft">Vamos preparar sua ativação.</p>
        <form onSubmit={submit} className="mt-8 card-elevated p-7 grid sm:grid-cols-2 gap-4">
          {[
            ["name", "Nome", "text"],
            ["email", "Email", "email"],
            ["whatsapp", "WhatsApp", "tel"],
            ["business_name", "Nome do negócio", "text"],
            ["business_segment", "Segmento do negócio", "text"],
            ["password", "Senha (mín. 8)", "password"],
          ].map(([k, label, type]) => (
            <div key={k} className={k === "password" || k === "business_segment" ? "sm:col-span-2" : ""}>
              <label className="text-xs tracking-wide text-ink-soft">{label}</label>
              <input
                type={type as string}
                required
                value={form[k as keyof typeof form]}
                onChange={upd(k as keyof typeof form)}
                className="mt-2 w-full h-12 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink"
              />
            </div>
          ))}
          <button disabled={loading} className="sm:col-span-2 w-full h-13 py-4 rounded-full bg-ink text-paper font-semibold tracking-wide disabled:opacity-50">
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Já tem conta? <Link to="/login" search={{ redirect }} className="text-ink font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
