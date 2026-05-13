import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneInput } from "@/components/PhoneInput";
import { motion } from "framer-motion";

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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Início</Link>
        <h1 className="mt-10 editorial-headline text-5xl text-ink">Criar conta</h1>
        <p className="mt-3 text-ink-soft">Vamos preparar sua ativação.</p>
        <form onSubmit={submit} className="mt-8 card-elevated p-7 grid sm:grid-cols-2 gap-4">
          <Field label="Nome" full><input required value={form.name} onChange={upd("name")} className={inp} /></Field>
          <Field label="Email"><input type="email" required value={form.email} onChange={upd("email")} className={inp} /></Field>
          <Field label="WhatsApp"><PhoneInput value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} required /></Field>
          <Field label="Nome do negócio"><input required value={form.business_name} onChange={upd("business_name")} className={inp} /></Field>
          <Field label="Segmento do negócio"><input required value={form.business_segment} onChange={upd("business_segment")} className={inp} placeholder="Ex: Padaria, Salão" /></Field>
          <Field label="Senha (mín. 8)" full><input type="password" required value={form.password} onChange={upd("password")} className={inp} /></Field>
          <button disabled={loading} className="sm:col-span-2 w-full h-13 py-4 rounded-full bg-ink text-paper font-semibold tracking-wide disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-elegant">
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Já tem conta? <Link to="/login" search={{ redirect }} className="text-ink font-semibold">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
}

const inp = "w-full h-12 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink transition-colors";

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs tracking-wide text-ink-soft uppercase">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
