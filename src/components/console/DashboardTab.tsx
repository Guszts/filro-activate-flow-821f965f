import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime } from "@/lib/format";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";

type RangeKey = "today" | "yesterday" | "7d" | "30d" | "month" | "lastmonth" | "all" | "custom";

function rangeFor(key: RangeKey, customFrom?: string, customTo?: string): { from: Date; to: Date; label: string } {
  const now = new Date();
  const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
  switch (key) {
    case "today": return { from: startOfDay(now), to: endOfDay(now), label: "Hoje" };
    case "yesterday": {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y), label: "Ontem" };
    }
    case "7d": {
      const f = new Date(now); f.setDate(f.getDate() - 6);
      return { from: startOfDay(f), to: endOfDay(now), label: "Últimos 7 dias" };
    }
    case "30d": {
      const f = new Date(now); f.setDate(f.getDate() - 29);
      return { from: startOfDay(f), to: endOfDay(now), label: "Últimos 30 dias" };
    }
    case "month": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: f, to: endOfDay(now), label: "Este mês" };
    }
    case "lastmonth": {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: f, to: endOfDay(t), label: "Mês passado" };
    }
    case "custom": {
      const f = customFrom ? new Date(customFrom) : startOfDay(now);
      const t = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);
      return { from: f, to: t, label: "Personalizado" };
    }
    case "all":
    default: return { from: new Date(2020, 0, 1), to: endOfDay(now), label: "Todo o período" };
  }
}

export function DashboardTab() {
  const [rangeKey, setRangeKey] = useState<RangeKey>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const range = rangeFor(rangeKey, from, to);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [payments, subs, plans, profiles] = await Promise.all([
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase.from("plans").select("id, name, slug, monthly_price, activation_price"),
        supabase.from("profiles").select("user_id, name, email"),
      ]);
      return {
        payments: payments.data ?? [],
        subs: subs.data ?? [],
        plans: plans.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });

  const stats = useMemo(() => {
    if (!data) return null;
    const paid = data.payments.filter((p: any) => p.status === "paid");
    const inRange = paid.filter((p: any) => {
      const d = new Date(p.paid_at ?? p.created_at);
      return d >= range.from && d <= range.to;
    });

    const revenue = inRange.reduce((s: number, p: any) => s + (p.amount_paid ?? p.amount ?? 0), 0);
    const originalRevenue = inRange.reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    const discounts = inRange.reduce((s: number, p: any) => s + (p.discount_amount ?? 0), 0);
    const ticket = inRange.length ? Math.round(revenue / inRange.length) : 0;
    const buyers = new Set(inRange.map((p: any) => p.user_id)).size;

    const activeSubs = data.subs.filter((s: any) => s.status === "active");
    const mrr = activeSubs.reduce((s: number, sub: any) => {
      const plan = data.plans.find((p: any) => p.id === sub.plan_id);
      return s + (plan?.monthly_price ?? 0);
    }, 0);
    const arr = mrr * 12;

    const cancelled = data.subs.filter((s: any) => {
      const d = s.canceled_at ? new Date(s.canceled_at) : null;
      return d && d >= range.from && d <= range.to;
    });
    const churn = activeSubs.length ? Math.round((cancelled.length / (activeSubs.length + cancelled.length)) * 100) : 0;

    // daily revenue series
    const buckets: Record<string, number> = {};
    const dayMs = 86400000;
    for (let t = range.from.getTime(); t <= range.to.getTime(); t += dayMs) {
      const k = new Date(t).toISOString().slice(0, 10);
      buckets[k] = 0;
    }
    inRange.forEach((p: any) => {
      const k = new Date(p.paid_at ?? p.created_at).toISOString().slice(0, 10);
      if (k in buckets) buckets[k] += (p.amount_paid ?? p.amount ?? 0) / 100;
    });
    const series = Object.entries(buckets).map(([date, value]) => ({ date: date.slice(5), value }));

    // by plan
    const byPlan: Record<string, number> = {};
    inRange.forEach((p: any) => {
      const plan = data.plans.find((pl: any) => pl.id === p.plan_id);
      const n = plan?.name ?? "—";
      byPlan[n] = (byPlan[n] ?? 0) + 1;
    });
    const planSeries = Object.entries(byPlan).map(([name, count]) => ({ name, count }));

    // tables
    const sorted = [...inRange].sort((a: any, b: any) => (b.amount_paid ?? b.amount) - (a.amount_paid ?? a.amount));
    const recent = [...inRange].sort((a: any, b: any) => new Date(b.paid_at ?? b.created_at).getTime() - new Date(a.paid_at ?? a.created_at).getTime()).slice(0, 10);
    const largest = sorted.slice(0, 5);
    const smallest = sorted.slice(-5).reverse();
    const oldest = [...inRange].sort((a: any, b: any) => new Date(a.paid_at ?? a.created_at).getTime() - new Date(b.paid_at ?? b.created_at).getTime()).slice(0, 5);

    // loyal customers (most paid)
    const byUser: Record<string, { count: number; total: number }> = {};
    paid.forEach((p: any) => {
      if (!byUser[p.user_id]) byUser[p.user_id] = { count: 0, total: 0 };
      byUser[p.user_id].count++;
      byUser[p.user_id].total += p.amount_paid ?? p.amount ?? 0;
    });
    const loyal = Object.entries(byUser)
      .map(([uid, v]) => ({ uid, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      revenue, originalRevenue, discounts, ticket, buyers, mrr, arr,
      activeSubs: activeSubs.length, cancelled: cancelled.length, churn,
      series, planSeries, recent, largest, smallest, oldest, loyal,
      orderCount: inRange.length,
    };
  }, [data, range.from, range.to]);

  const nameOf = (uid: string) => data?.profiles.find((p: any) => p.user_id === uid)?.name || data?.profiles.find((p: any) => p.user_id === uid)?.email || "—";
  const planNameOf = (pid: string) => data?.plans.find((p: any) => p.id === pid)?.name || "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Dashboard</h1>
        <p className="mt-2 text-ink-soft">Receita real (com cupons), MRR/ARR, churn e maiores pedidos.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(["today", "yesterday", "7d", "30d", "month", "lastmonth", "all"] as RangeKey[]).map((k) => (
          <button key={k} onClick={() => setRangeKey(k)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold ${rangeKey === k ? "bg-ink text-paper" : "bg-muted text-ink-soft hover:text-ink"}`}>
            {rangeFor(k).label}
          </button>
        ))}
        <button onClick={() => setRangeKey("custom")}
          className={`px-3 py-2 rounded-lg text-xs font-semibold ${rangeKey === "custom" ? "bg-ink text-paper" : "bg-muted text-ink-soft hover:text-ink"}`}>
          Personalizado
        </button>
        {rangeKey === "custom" && (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 px-2 rounded-lg border border-border bg-paper text-xs" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 px-2 rounded-lg border border-border bg-paper text-xs" />
          </>
        )}
      </div>

      {isLoading || !stats ? (
        <div className="text-ink-soft">Carregando...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Receita (real)" value={formatBRL(stats.revenue)} sub={stats.discounts ? `−${formatBRL(stats.discounts)} em cupons` : undefined} />
            <Kpi label="Pedidos" value={String(stats.orderCount)} sub={`${stats.buyers} clientes únicos`} />
            <Kpi label="Ticket médio" value={stats.ticket ? formatBRL(stats.ticket) : "—"} />
            <Kpi label="MRR" value={formatBRL(stats.mrr)} sub={`ARR ${formatBRL(stats.arr)}`} />
            <Kpi label="Assinaturas ativas" value={String(stats.activeSubs)} />
            <Kpi label="Cancelamentos no período" value={String(stats.cancelled)} sub={`${stats.churn}% churn`} />
            <Kpi label="Receita bruta (sem cupom)" value={formatBRL(stats.originalRevenue)} />
            <Kpi label="Total descontos" value={formatBRL(stats.discounts)} />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="card-elevated p-5 lg:col-span-2">
              <div className="text-xs tracking-wide text-ink-soft mb-3">Receita diária ({range.label})</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.series}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatBRL(Math.round(v * 100))} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-elevated p-5">
              <div className="text-xs tracking-wide text-ink-soft mb-3">Pedidos por plano</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.planSeries}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--foreground))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <OrdersTable title="Pedidos recentes" rows={stats.recent} nameOf={nameOf} planNameOf={planNameOf} />
            <OrdersTable title="Maiores pedidos" rows={stats.largest} nameOf={nameOf} planNameOf={planNameOf} />
            <OrdersTable title="Menores pedidos" rows={stats.smallest} nameOf={nameOf} planNameOf={planNameOf} />
            <OrdersTable title="Pedidos mais antigos" rows={stats.oldest} nameOf={nameOf} planNameOf={planNameOf} />
          </div>

          <div className="card-elevated p-5">
            <div className="text-xs tracking-wide text-ink-soft mb-3">Clientes mais fiéis (todo o histórico)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-ink-soft">
                  <tr><th className="py-2">Cliente</th><th>Pedidos</th><th>Total gasto</th></tr>
                </thead>
                <tbody>
                  {stats.loyal.map((l: any) => (
                    <tr key={l.uid} className="border-t border-border">
                      <td className="py-2">{nameOf(l.uid)}</td>
                      <td>{l.count}</td>
                      <td className="font-medium">{formatBRL(l.total)}</td>
                    </tr>
                  ))}
                  {stats.loyal.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-ink-soft">Sem dados.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-5">
      <div className="text-xs tracking-wide text-ink-soft">{label}</div>
      <div className="mt-2 font-display font-black text-2xl text-ink">{value}</div>
      {sub && <div className="text-xs text-ink-soft mt-1">{sub}</div>}
    </motion.div>
  );
}

function OrdersTable({ title, rows, nameOf, planNameOf }: { title: string; rows: any[]; nameOf: (u: string) => string; planNameOf: (p: string) => string }) {
  return (
    <div className="card-elevated p-5">
      <div className="text-xs tracking-wide text-ink-soft mb-3">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink-soft">
            <tr><th className="py-2">Cliente</th><th>Plano</th><th>Valor</th><th>Quando</th></tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2 truncate max-w-[160px]">{nameOf(r.user_id)}</td>
                <td>{planNameOf(r.plan_id)}</td>
                <td className="font-medium">{formatBRL(r.amount_paid ?? r.amount)}{r.promo_code && <div className="text-[10px] text-ink-soft">{r.promo_code}</div>}</td>
                <td className="text-ink-soft text-xs">{formatDateTime(r.paid_at ?? r.created_at)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-ink-soft">Sem pedidos no período.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
