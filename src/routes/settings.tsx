import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { createPortalSession, cancelSubscription } from "@/lib/payments.functions";
import { PhoneInput } from "@/components/PhoneInput";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, LogOut, Mail, Save, ArrowRight, User as UserIcon, XCircle } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [
    { title: "Configurações · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

interface ProfileRow {
  name: string; email: string; whatsapp: string; business_name: string; business_segment: string;
}

function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading, signOut, hasPaid, isAdmin } = useAuth();
  const [profile, setProfile] = useState<ProfileRow>({ name: "", email: "", whatsapp: "", business_name: "", business_segment: "" });
  const [saving, setSaving] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const openPortal = useServerFn(createPortalSession);
  const callCancel = useServerFn(cancelSubscription);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/settings" } }); return; }
    (async () => {
      const [{ data: prof }, { data: subs }] = await Promise.all([
        supabase.from("profiles").select("name,email,whatsapp,business_name,business_segment").eq("user_id", user.id).maybeSingle(),
        supabase.from("subscriptions").select("id").eq("user_id", user.id).neq("status", "canceled").limit(1),
      ]);
      if (prof) setProfile({
        name: prof.name ?? "", email: prof.email ?? user.email ?? "",
        whatsapp: prof.whatsapp ?? "", business_name: prof.business_name ?? "", business_segment: prof.business_segment ?? "",
      });
      setHasSubscription((subs ?? []).length > 0);
    })();
  }, [loading, user, navigate]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: profile.name, whatsapp: profile.whatsapp,
      business_name: profile.business_name, business_segment: profile.business_segment,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
  };

  const manageBilling = async () => {
    setOpeningPortal(true);
    try {
      const res = await openPortal({ data: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
      if (res.url) window.open(res.url, "_blank");
      else toast.error(res.error || "Não foi possível abrir o portal de cobrança");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao abrir o portal");
    } finally { setOpeningPortal(false); }
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await callCancel({ data: { reason: cancelReason.trim() || undefined, environment: getStripeEnvironment() } });
      if (res.ok) {
        toast.success("Assinatura cancelada. Você mantém acesso até o fim do ciclo atual.");
        setCancelOpen(false);
        setCancelReason("");
        setHasSubscription(false);
      } else {
        toast.error(res.error || "Não foi possível cancelar");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar");
    } finally { setCancelling(false); }
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-ink-soft">Carregando...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[900px] w-full px-5 md:px-10 py-12 md:py-16">
        <span className="text-xs tracking-wide text-ink-soft">Conta</span>
        <h1 className="mt-2 editorial-headline text-5xl md:text-6xl text-ink">Configurações</h1>
        <p className="mt-3 text-ink-soft">Gerencie seu perfil, plano e conta.</p>

        {/* ACCOUNT */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 card-elevated p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 grid place-items-center rounded-2xl bg-ink text-paper"><Mail className="h-5 w-5" /></div>
            <div>
              <div className="text-xs tracking-wide text-ink-soft uppercase">Logado como</div>
              <div className="font-display font-black text-xl text-ink">{user.email}</div>
            </div>
          </div>
        </motion.section>

        {/* PROFILE */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6 card-elevated p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 grid place-items-center rounded-2xl bg-muted text-ink"><UserIcon className="h-5 w-5" /></div>
            <h2 className="font-display font-black text-2xl text-ink">Perfil</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inp} /></Field>
            <Field label="WhatsApp"><PhoneInput value={profile.whatsapp} onChange={(v) => setProfile({ ...profile, whatsapp: v })} /></Field>
            <Field label="Nome do negócio"><input value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} className={inp} /></Field>
            <Field label="Segmento"><input value={profile.business_segment} onChange={(e) => setProfile({ ...profile, business_segment: e.target.value })} className={inp} /></Field>
          </div>
          <button onClick={save} disabled={saving} className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-ink text-paper font-semibold disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </motion.section>

        {/* PLAN */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 card-elevated p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 grid place-items-center rounded-2xl bg-muted text-ink"><CreditCard className="h-5 w-5" /></div>
            <h2 className="font-display font-black text-2xl text-ink">Plano e cobrança</h2>
          </div>
          {hasSubscription ? (
            <>
              <p className="text-sm text-ink-soft">Atualize forma de pagamento, veja faturas, troque ou cancele seu plano.</p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button onClick={manageBilling} disabled={openingPortal} className="inline-flex items-center justify-between gap-3 h-12 px-5 rounded-2xl bg-ink text-paper font-semibold hover:bg-ink/90 disabled:opacity-60">
                  <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" /> {openingPortal ? "Abrindo..." : "Gerenciar assinatura"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => setCancelOpen(true)} className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-2xl border border-border text-ink font-semibold hover:bg-muted">
                  <XCircle className="h-4 w-4" /> Cancelar assinatura
                </button>
              </div>
            </>
          ) : !hasPaid ? (
            <>
              <p className="text-sm text-ink-soft">Você ainda não tem um plano ativo. Escolha um para ativar sua presença digital.</p>
              <Link to="/" hash="ativacao" className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-2xl bg-ink text-paper font-semibold">Ver planos <ArrowRight className="h-4 w-4" /></Link>
            </>
          ) : (
            <p className="text-sm text-ink-soft">Nenhuma assinatura ativa encontrada. Entre em contato com o suporte se isso parecer errado.</p>
          )}
        </motion.section>

        {/* DANGER */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 card-elevated p-7">
          <h2 className="font-display font-black text-xl text-ink">Sessão</h2>
          <p className="mt-1 text-sm text-ink-soft">Sair da sua conta neste dispositivo.</p>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-2xl border border-border text-ink font-semibold hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </motion.section>
      </main>
      <SiteFooter />
    </div>
  );
}

const inp = "w-full h-12 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs tracking-wide text-ink-soft uppercase">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
