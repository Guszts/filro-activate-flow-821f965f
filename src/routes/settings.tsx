import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { createPortalSession, cancelSubscription } from "@/lib/payments.functions";
import { deleteOwnAccount } from "@/lib/account.functions";
import { PhoneInput } from "@/components/PhoneInput";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, LogOut, Mail, Save, ArrowRight, User as UserIcon, XCircle, Camera, Trash2 } from "lucide-react";
import { McpTokensSection } from "@/components/settings/McpTokensSection";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [
    { title: "Settings · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

interface ProfileRow {
  name: string; email: string; whatsapp: string; business_name: string; business_segment: string; avatar_url: string;
}

function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading, signOut, hasPaid, isAdmin } = useAuth();
  const [profile, setProfile] = useState<ProfileRow>({ name: "", email: "", whatsapp: "", business_name: "", business_segment: "", avatar_url: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const openPortal = useServerFn(createPortalSession);
  const callCancel = useServerFn(cancelSubscription);
  const callDeleteAccount = useServerFn(deleteOwnAccount);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteAccount = async () => {
    if (deleteConfirm.trim().toUpperCase() !== "EXCLUIR") {
      toast.error("Digite EXCLUIR para confirmar");
      return;
    }
    setDeleting(true);
    try {
      const res = await callDeleteAccount();
      if (res.ok) {
        toast.success("Conta excluída");
        await signOut();
        navigate({ to: "/" });
      } else {
        toast.error(res.error || "No foi possível excluir");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error ao excluir");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/settings" } }); return; }
    (async () => {
      const [{ data: prof }, { data: subs }] = await Promise.all([
        supabase.from("profiles").select("name,email,whatsapp,business_name,business_segment,avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("subscriptions").select("id").eq("user_id", user.id).neq("status", "canceled").limit(1),
      ]);
      if (prof) setProfile({
        name: prof.name ?? "", email: prof.email ?? user.email ?? "",
        whatsapp: prof.whatsapp ?? "", business_name: prof.business_name ?? "", business_segment: prof.business_segment ?? "",
        avatar_url: prof.avatar_url ?? "",
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
    toast.success("Profile atualizado");
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem");
    if (file.size > 5 * 1024 * 1024) return toast.error("Máximo 5MB");
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      if (dbErr) throw dbErr;
      setProfile((p) => ({ ...p, avatar_url: url }));
      toast.success("Foto atualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error ao enviar foto");
    } finally { setUploadingAvatar(false); }
  };

  const removeAvatar = async () => {
    if (!user) return;
    setUploadingAvatar(true);
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setUploadingAvatar(false);
    if (error) return toast.error(error.message);
    setProfile((p) => ({ ...p, avatar_url: "" }));
    toast.success("Foto removida");
  };

  const manageBilling = async () => {
    setOpeningPortal(true);
    try {
      const res = await openPortal({ data: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
      if (res.url) window.open(res.url, "_blank");
      else toast.error(res.error || "No foi possível abrir o portal de cobrança");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error ao abrir o portal");
    } finally { setOpeningPortal(false); }
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await callCancel({ data: { reason: cancelReason.trim() || undefined, environment: getStripeEnvironment() } });
      if (res.ok) {
        toast.success("Subscription cancelada. Você mantém acesso até o fim do ciclo atual.");
        setCancelOpen(false);
        setCancelReason("");
        setHasSubscription(false);
      } else {
        toast.error(res.error || "No foi possível cancelar");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error ao cancelar");
    } finally { setCancelling(false); }
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-ink-soft">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[900px] w-full px-5 md:px-10 py-12 md:py-16">
        <span className="text-xs tracking-wide text-ink-soft">Conta</span>
        <h1 className="mt-2 editorial-headline text-5xl md:text-6xl text-ink">Settings</h1>
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
            <h2 className="font-display font-black text-2xl text-ink">Profile</h2>
          </div>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted ring-1 ring-border grid place-items-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display font-black text-2xl text-ink-soft">{(profile.name || profile.email || "U")[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-paper text-sm font-semibold text-ink cursor-pointer hover:bg-muted ${uploadingAvatar ? "opacity-60 pointer-events-none" : ""}`}>
                <Camera className="h-4 w-4" /> {uploadingAvatar ? "Sending..." : profile.avatar_url ? "Trocar foto" : "Add foto"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
              </label>
              {profile.avatar_url && (
                <button type="button" onClick={removeAvatar} disabled={uploadingAvatar} className="inline-flex items-center gap-2 text-xs text-ink-soft hover:text-flame transition-colors disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
              <span className="text-xs text-ink-soft">JPG ou PNG, até 5MB</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inp} /></Field>
            <Field label="WhatsApp"><PhoneInput value={profile.whatsapp} onChange={(v) => setProfile({ ...profile, whatsapp: v })} /></Field>
            <Field label="Name do negócio"><input value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} className={inp} /></Field>
            <Field label="Segment"><input value={profile.business_segment} onChange={(e) => setProfile({ ...profile, business_segment: e.target.value })} className={inp} /></Field>
          </div>
          <button onClick={save} disabled={saving} className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-ink text-paper font-semibold disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save alterações"}
          </button>
        </motion.section>

        {/* PLAN */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 card-elevated p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 grid place-items-center rounded-2xl bg-muted text-ink"><CreditCard className="h-5 w-5" /></div>
            <h2 className="font-display font-black text-2xl text-ink">Plan e cobrança</h2>
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
                  <XCircle className="h-4 w-4" /> Cancel assinatura
                </button>
              </div>
            </>
          ) : !hasPaid ? (
            <>
              <p className="text-sm text-ink-soft">Você ainda não tem um plano ativo. Escolha um para ativar sua presença digital.</p>
              <Link to="/" hash="ativacao" className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-2xl bg-ink text-paper font-semibold">See pricing <ArrowRight className="h-4 w-4" /></Link>
            </>
          ) : (
            <p className="text-sm text-ink-soft">Nenhuma assinatura ativa encontrada. Contact us com o suporte se isso parecer errado.</p>
          )}
        </motion.section>
        {isAdmin && <McpTokensSection />}


        {/* DANGER */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 card-elevated p-7">
          <h2 className="font-display font-black text-xl text-ink">Sessão</h2>
          <p className="mt-1 text-sm text-ink-soft">Sign out da sua conta neste dispositivo.</p>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-2xl border border-border text-ink font-semibold hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </motion.section>

        {/* DELETE ACCOUNT */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 card-elevated p-7 border-flame/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 grid place-items-center rounded-2xl bg-flame text-paper"><Trash2 className="h-5 w-5" /></div>
            <h2 className="font-display font-black text-xl text-ink">Delete conta</h2>
          </div>
          <p className="mt-1 text-sm text-ink-soft">Esta ação é permanente. Seus dados, perfil e acesso serão removidos. Subscriptions ativas devem ser canceladas antes.</p>
          <button onClick={() => setDeleteOpen(true)}
            className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-2xl bg-flame text-paper font-semibold hover:bg-flame/90">
            <Trash2 className="h-4 w-4" /> Delete minha conta
          </button>
        </motion.section>
      </main>

      <AnimatePresence>
        {cancelOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm grid place-items-center p-5"
            onClick={() => !cancelling && setCancelOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md card-elevated p-7"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-2xl bg-flame text-paper"><XCircle className="h-5 w-5" /></div>
                <h3 className="font-display font-black text-2xl text-ink">Cancel assinatura?</h3>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                Você manterá acesso até o fim do ciclo já pago. Conta pra gente o que faltou — usamos para melhorar.
              </p>
              <label className="block mt-5 text-xs tracking-wide text-ink-soft uppercase">Motivo (opcional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Ex.: vou pausar o negócio, preço, encontrei outra solução..."
                className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-paper outline-none focus:border-ink transition-colors text-sm"
              />
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setCancelOpen(false)}
                  disabled={cancelling}
                  className="h-12 px-5 rounded-2xl border border-border text-ink font-semibold hover:bg-muted disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="h-12 px-5 rounded-2xl bg-flame text-paper font-semibold hover:bg-flame/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> {cancelling ? "Cancelando..." : "Confirm cancelamento"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {deleteOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm grid place-items-center p-5"
            onClick={() => !deleting && setDeleteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md card-elevated p-7"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-2xl bg-flame text-paper"><Trash2 className="h-5 w-5" /></div>
                <h3 className="font-display font-black text-2xl text-ink">Delete conta?</h3>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                Esta ação é <strong>permanente</strong> e não pode ser desfeita. Todos os seus dados serão removidos.
                {hasSubscription && <span className="block mt-2 text-flame">Você ainda tem assinatura ativa — cancele primeiro para evitar cobranças.</span>}
              </p>
              <label className="block mt-5 text-xs tracking-wide text-ink-soft uppercase">Digite <strong>EXCLUIR</strong> para confirmar</label>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="EXCLUIR"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-paper outline-none focus:border-flame transition-colors text-sm"
              />
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}
                  disabled={deleting}
                  className="h-12 px-5 rounded-2xl border border-border text-ink font-semibold hover:bg-muted disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  disabled={deleting || deleteConfirm.trim().toUpperCase() !== "EXCLUIR"}
                  className="h-12 px-5 rounded-2xl bg-flame text-paper font-semibold hover:bg-flame/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> {deleting ? "Excluindo..." : "Delete definitivamente"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
