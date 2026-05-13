import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatBRL, formatDateTime } from "@/lib/format";
import { motion } from "framer-motion";

export const Route = createFileRoute("/console")({ component: ConsolePage });

type Tab = "overview" | "users" | "payments" | "plans" | "settings";

function ConsolePage() {
  const { user, role, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/console" } });
    else if (role && role !== "admin") navigate({ to: "/" });
  }, [loading, user, role, navigate]);

  if (loading || !isAdmin) {
    return <div className="min-h-screen grid place-items-center text-ink-soft">Carregando...</div>;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-paper p-6 flex flex-col">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Início</Link>
        <div className="text-xs tracking-wide text-ink-soft mt-1">Console</div>
        <nav className="mt-10 space-y-1 text-sm">
          {([
            ["overview", "Overview"],
            ["users", "Usuários"],
            ["payments", "Pagamentos"],
            ["plans", "Planos"],
            ["settings", "Configurações"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors ${tab === k ? "bg-ink text-paper" : "text-ink-soft hover:bg-muted"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 text-xs text-ink-soft">
          <div>{user?.email}</div>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="mt-2 text-ink hover:underline">Sair</button>
        </div>
      </aside>
      <main className="p-6 md:p-10">
        {tab === "overview" && <OverviewTab />}
        {tab === "users" && <UsersTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "plans" && <PlansTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      <div className="text-xs tracking-wide text-ink-soft">{label}</div>
      <div className="mt-2 font-display font-black text-3xl text-ink">{value}</div>
      {sub && <div className="text-xs text-ink-soft mt-1">{sub}</div>}
    </motion.div>
  );
}

function OverviewTab() {
  const { data } = useQuery({
    queryKey: ["console-overview"],
    queryFn: async () => {
      const [profiles, payments, plans] = await Promise.all([
        supabase.from("profiles").select("id, created_at"),
        supabase.from("payments").select("id, status, amount, plan_id, user_id, created_at, paid_at"),
        supabase.from("plans").select("id, name, slug, monthly_price"),
      ]);
      return { profiles: profiles.data ?? [], payments: payments.data ?? [], plans: plans.data ?? [] };
    },
  });
  const totalUsers = data?.profiles.length ?? 0;
  const paid = data?.payments.filter((p) => p.status === "paid") ?? [];
  const failed = data?.payments.filter((p) => p.status === "failed") ?? [];
  const pending = data?.payments.filter((p) => p.status === "pending" || p.status === "processing") ?? [];
  const revenue = paid.reduce((s, p) => s + (p.amount ?? 0), 0);
  const payingUsers = new Set(paid.map((p) => p.user_id)).size;
  const mrr = (data?.plans.length ? paid.reduce((s, p) => {
    const plan = data.plans.find((pl) => pl.id === p.plan_id);
    return s + (plan?.monthly_price ?? 0);
  }, 0) : 0);
  const conversion = totalUsers ? Math.round((payingUsers / totalUsers) * 100) : 0;
  const avgTicket = paid.length ? Math.round(revenue / paid.length) : 0;

  // most chosen plan
  const counts: Record<string, number> = {};
  paid.forEach((p) => { if (p.plan_id) counts[p.plan_id] = (counts[p.plan_id] ?? 0) + 1; });
  const topPlanId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topPlan = data?.plans.find((p) => p.id === topPlanId)?.name ?? "—";

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const newToday = data?.profiles.filter((p) => new Date(p.created_at) >= today).length ?? 0;
  const paymentsToday = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= today).length;

  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Overview</h1>
      <p className="mt-2 text-ink-soft">Visão geral da operação Filro.</p>
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Metric label="Usuários totais" value={String(totalUsers)} sub={`${newToday} hoje`} />
        <Metric label="Pagantes" value={String(payingUsers)} sub={`${conversion}% conversão`} />
        <Metric label="Receita ativação" value={formatBRL(revenue)} />
        <Metric label="Receita mensal" value={formatBRL(mrr)} sub="recorrência mensal" />
        <Metric label="Pagamentos concluídos" value={String(paid.length)} sub={`${paymentsToday} hoje`} />
        <Metric label="Pendentes" value={String(pending.length)} />
        <Metric label="Falhas" value={String(failed.length)} />
        <Metric label="Ticket médio" value={avgTicket ? formatBRL(avgTicket) : "—"} sub={`Plano top: ${topPlan}`} />
      </div>
    </div>
  );
}

function UsersTab() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["console-users"],
    queryFn: async () => {
      const profiles = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const payments = await supabase.from("payments").select("user_id, status, plan_id");
      const plans = await supabase.from("plans").select("id, name");
      return { profiles: profiles.data ?? [], payments: payments.data ?? [], plans: plans.data ?? [] };
    },
  });
  const [search, setSearch] = useState("");
  const filtered = (data?.profiles ?? []).filter((p) =>
    `${p.name} ${p.email} ${p.business_name}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Usuários</h1>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, email ou negócio..."
        className="mt-6 w-full max-w-md h-11 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink" />
      <div className="mt-6 card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Negócio</th><th className="px-4 py-3">Segmento</th>
                <th className="px-4 py-3">Plano pago</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const pay = data?.payments.find((x) => x.user_id === p.user_id && x.status === "paid");
                const planName = pay ? data?.plans.find((pl) => pl.id === pay.plan_id)?.name : "—";
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/50 cursor-pointer" onClick={() => navigate({ to: "/lead/$id", params: { id: p.user_id } })}>
                    <td className="px-4 py-3 font-medium">{p.name || "—"}</td>
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3">{p.business_name || "—"}</td>
                    <td className="px-4 py-3">{p.business_segment || "—"}</td>
                    <td className="px-4 py-3">{planName}</td>
                    <td className="px-4 py-3"><StatusBadge status={pay ? "paid" : "pending"} /></td>
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(p.created_at)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-soft">Nenhum usuário ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const { data } = useQuery({
    queryKey: ["console-payments"],
    queryFn: async () => {
      const payments = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      const profiles = await supabase.from("profiles").select("user_id, name, email");
      const plans = await supabase.from("plans").select("id, name");
      return { payments: payments.data ?? [], profiles: profiles.data ?? [], plans: plans.data ?? [] };
    },
  });
  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Pagamentos</h1>
      <div className="mt-8 card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stripe PI</th><th className="px-4 py-3">Falha</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {(data?.payments ?? []).map((p) => {
                const prof = data?.profiles.find((x) => x.user_id === p.user_id);
                const plan = data?.plans.find((pl) => pl.id === p.plan_id);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3"><div className="font-medium">{prof?.name || "—"}</div><div className="text-xs text-ink-soft">{prof?.email}</div></td>
                    <td className="px-4 py-3">{plan?.name || "—"}</td>
                    <td className="px-4 py-3 font-medium">{formatBRL(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft truncate max-w-[160px]">{p.stripe_payment_intent_id}</td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{p.failure_reason ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(p.created_at)}</td>
                  </tr>
                );
              })}
              {(!data || data.payments.length === 0) && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-soft">Nenhum pagamento ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlansTab() {
  const { data } = useQuery({
    queryKey: ["console-plans"],
    queryFn: async () => (await supabase.from("plans").select("*").order("display_order")).data ?? [],
  });
  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Planos</h1>
      <div className="mt-8 grid md:grid-cols-3 gap-5">
        {(data ?? []).map((p) => (
          <div key={p.id} className="card-elevated p-6">
            <div className="font-display font-black text-2xl">{p.name}</div>
            <div className="text-xs tracking-wide text-ink-soft mt-1">{p.slug}</div>
            <div className="mt-4 font-display font-black text-3xl text-ink">{formatBRL(p.activation_price)}</div>
            <div className="text-sm text-ink-soft">+ {formatBRL(p.monthly_price)}/mês</div>
            <p className="mt-4 text-sm text-ink-soft">{p.description}</p>
            <div className="mt-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${p.active ? "bg-lime text-ink" : "bg-muted text-ink-soft"}`}>
                {p.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Configurações</h1>
      <div className="mt-8 card-elevated p-7 max-w-xl space-y-3 text-sm text-ink-soft">
        <p><strong className="text-ink">Pagamentos:</strong> integrados via Lovable Cloud (sem chaves manuais).</p>
        <p><strong className="text-ink">Webhook:</strong> endpoint público em <code className="text-xs">/api/public/payments/webhook</code></p>
        <p><strong className="text-ink">Banco:</strong> RLS ativo. Apenas administradores acessam o Console.</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-lime text-ink",
    pending: "bg-muted text-ink-soft",
    processing: "bg-azure/20 text-ink",
    failed: "bg-flame text-paper",
    refunded: "bg-stone text-ink",
    cancelled: "bg-muted text-ink-soft line-through",
  };
  const labels: Record<string, string> = {
    paid: "Pago", pending: "Pendente", processing: "Processando",
    failed: "Falha", refunded: "Reembolsado", cancelled: "Cancelado",
  };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-muted text-ink-soft"}`}>{labels[status] ?? status}</span>;
}
