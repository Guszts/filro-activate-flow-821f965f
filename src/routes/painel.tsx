import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";
import { getStripeEnvironment } from "@/lib/stripe";
import { createPortalSession } from "@/lib/payments.functions";
import { ArrowRight, CheckCircle2, Clock, CreditCard, FileText, HelpCircle, Loader2, MessageCircle, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/painel")({ component: PainelPage });

interface ProjectRow {
  id: string;
  business_name: string | null;
  business_segment: string | null;
  selected_model: string | null;
  business_info_submitted: boolean;
  project_status: string;
  plan_id: string | null;
  created_at: string;
  business_info: Record<string, unknown> | null;
}
interface PaymentRow { id: string; amount: number; currency: string; status: string; paid_at: string | null; created_at: string; plan_id: string }
interface PlanRow { id: string; name: string; activation_price: number; monthly_price: number }

const STATUS_LABEL: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "Novo", color: "bg-muted text-ink", icon: Clock },
  paid: { label: "Pago", color: "bg-lime text-ink", icon: CheckCircle2 },
  in_progress: { label: "Em produção", color: "bg-azure text-paper", icon: Loader2 },
  delivered: { label: "Entregue", color: "bg-flame text-paper", icon: CheckCircle2 },
};

function PainelPage() {
  const navigate = useNavigate();
  const { user, loading, hasPaid, isAdmin } = useAuth();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanRow>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const openPortal = useServerFn(createPortalSession);

  async function handleManageSubscription() {
    setOpeningPortal(true);
    try {
      const res = await openPortal({
        data: { returnUrl: window.location.href, environment: getStripeEnvironment() },
      });
      if (res.url) window.open(res.url, "_blank");
      else toast.error(res.error || "Não foi possível abrir o portal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao abrir portal");
    } finally {
      setOpeningPortal(false);
    }
  }


  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/painel" } }); return; }
    (async () => {
      const [projRes, payRes, planRes, subRes] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("plans").select("id,name,activation_price,monthly_price"),
        supabase.from("subscriptions").select("id").eq("user_id", user.id).neq("status", "canceled").limit(1),
      ]);
      setProject(projRes.data as ProjectRow | null);
      setPayments((payRes.data ?? []) as PaymentRow[]);
      const map: Record<string, PlanRow> = {};
      (planRes.data ?? []).forEach((p) => { map[p.id] = p as PlanRow; });
      setPlans(map);
      setHasSubscription((subRes.data ?? []).length > 0);
      setLoadingData(false);
    })();
  }, [loading, user, navigate]);

  const status = STATUS_LABEL[project?.project_status ?? "new"] ?? STATUS_LABEL.new;
  const StatusIcon = status.icon;
  const currentPlan = project?.plan_id ? plans[project.plan_id] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[1200px] w-full px-5 md:px-10 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs tracking-wide text-ink-soft">Painel</span>
            <h1 className="mt-2 editorial-headline text-5xl md:text-6xl text-ink">Olá, <span className="lime-mark">{user?.email?.split("@")[0]}</span></h1>
            <p className="mt-3 text-ink-soft">Acompanhe seu projeto, pagamentos e edite as informações do negócio.</p>
          </div>
          <a href="https://wa.me/5592993561754" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-12 px-5 rounded-2xl bg-lime text-ink font-semibold text-sm">
            <MessageCircle className="h-4 w-4" /> Suporte WhatsApp
          </a>
        </div>

        {loadingData ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="h-48 rounded-3xl bg-muted animate-pulse" />
            <div className="h-48 rounded-3xl bg-muted animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* STATUS */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="lg:col-span-2 card-elevated p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs tracking-wide text-ink-soft">Seu projeto</div>
                  <div className="mt-2 font-display font-black text-3xl text-ink">
                    {project?.business_name || currentPlan?.name || "Aguardando ativação"}
                  </div>
                  {currentPlan && <div className="mt-1 text-sm text-ink-soft">Plano {currentPlan.name}</div>}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                </span>
              </div>

              {!project?.plan_id ? (
                <div className="mt-6 p-5 rounded-2xl bg-muted">
                  <p className="text-sm text-ink">Você ainda não ativou um plano. Escolha uma opção para começarmos.</p>
                  <Link to="/" hash="ativacao" className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-ink text-paper text-sm font-semibold">
                    Ver planos <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : !project?.business_info_submitted ? (
                <div className="mt-6 p-5 rounded-2xl bg-lime/30">
                  <p className="text-sm text-ink font-medium">Próximo passo: enviar as informações do negócio.</p>
                  <p className="text-xs text-ink-soft mt-1">Após o envio, sua página fica pronta em até 24 horas.</p>
                  <Link to="/business-info" className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-ink text-paper text-sm font-semibold">
                    Enviar informações <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-6 p-5 rounded-2xl bg-azure/10 border border-azure/20">
                  <p className="text-sm text-ink font-medium">Tudo certo! Estamos preparando sua página.</p>
                  <p className="text-xs text-ink-soft mt-1">Você receberá um aviso pelo WhatsApp assim que estiver pronto.</p>
                  <Link to="/business-info" className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-2xl border border-ink text-ink text-sm font-semibold">
                    <Pencil className="h-4 w-4" /> Editar informações
                  </Link>
                </div>
              )}
            </motion.div>

            {/* QUICK ACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
              className="card-elevated p-7"
            >
              <div className="text-xs tracking-wide text-ink-soft">Atalhos</div>
              <div className="mt-4 space-y-2">
                {hasSubscription && (
                  <button
                    onClick={handleManageSubscription}
                    disabled={openingPortal}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-3 text-sm font-medium"><CreditCard className="h-4 w-4" /> {openingPortal ? "Abrindo..." : "Gerenciar assinatura"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <Link to="/business-info" className="flex items-center justify-between p-4 rounded-2xl bg-muted hover:bg-stone transition-colors">
                  <span className="inline-flex items-center gap-3 text-sm font-medium text-ink"><Pencil className="h-4 w-4" /> Meu negócio</span>
                  <ArrowRight className="h-4 w-4 text-ink-soft" />
                </Link>
                <Link to="/docs" className="flex items-center justify-between p-4 rounded-2xl bg-muted hover:bg-stone transition-colors">
                  <span className="inline-flex items-center gap-3 text-sm font-medium text-ink"><FileText className="h-4 w-4" /> Documentação</span>
                  <ArrowRight className="h-4 w-4 text-ink-soft" />
                </Link>
                <Link to="/" hash="faq" className="flex items-center justify-between p-4 rounded-2xl bg-muted hover:bg-stone transition-colors">
                  <span className="inline-flex items-center gap-3 text-sm font-medium text-ink"><HelpCircle className="h-4 w-4" /> Dúvidas frequentes</span>
                  <ArrowRight className="h-4 w-4 text-ink-soft" />
                </Link>
              </div>
            </motion.div>

            {/* PAYMENTS */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              className="lg:col-span-3 card-elevated p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs tracking-wide text-ink-soft">Histórico</div>
                  <h2 className="mt-1 font-display font-black text-2xl text-ink">Pagamentos</h2>
                </div>
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhum pagamento registrado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs tracking-wide text-ink-soft border-b border-border">
                      <tr>
                        <th className="text-left py-3 font-medium">Data</th>
                        <th className="text-left py-3 font-medium">Plano</th>
                        <th className="text-left py-3 font-medium">Status</th>
                        <th className="text-right py-3 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => {
                        const plan = plans[p.plan_id];
                        const paid = p.status === "paid";
                        return (
                          <tr key={p.id} className="border-b border-border/50">
                            <td className="py-3 text-ink-soft">{new Date(p.paid_at ?? p.created_at).toLocaleDateString("pt-BR")}</td>
                            <td className="py-3 text-ink font-medium">{plan?.name ?? "—"}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${paid ? "bg-lime text-ink" : "bg-muted text-ink-soft"}`}>
                                {paid ? "Pago" : p.status}
                              </span>
                            </td>
                            <td className="py-3 text-right text-ink font-semibold">{formatBRL(p.amount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
