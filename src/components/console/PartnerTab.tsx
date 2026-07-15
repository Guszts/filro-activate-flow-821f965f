import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime } from "@/lib/format";
import {
  updatePartner, approveCommission, cancelCommission, payCommission,
} from "@/lib/partner.functions";

type Partner = {
  id: string; name: string; email: string | null; whatsapp: string | null;
  code: string; pix_key: string | null; commission_rate: number;
  commission_scope: string; status: string; notes: string | null;
};

type Commission = {
  id: string; partner_id: string; user_id: string | null; plan_id: string | null;
  stripe_checkout_session_id: string | null;
  activation_amount: number; monthly_amount: number; base_amount: number;
  commission_rate: number; commission_amount: number;
  status: "pending" | "approved" | "paid" | "cancelled";
  available_at: string | null; approved_at: string | null; paid_at: string | null;
  cancelled_at: string | null; cancellation_reason: string | null;
  created_at: string;
};

type Referral = {
  id: string; partner_id: string; partner_code: string | null;
  user_id: string | null; plan_id: string | null;
  client_name: string | null; client_email: string | null;
  stripe_checkout_session_id: string | null; status: string;
  created_at: string; converted_at: string | null;
};

type Payout = {
  id: string; partner_id: string; amount: number; method: string;
  pix_key: string | null; status: string; paid_at: string | null;
  notes: string | null; created_at: string;
};

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://setup.filro.site";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-muted text-ink-soft",
    approved: "bg-azure/20 text-ink",
    paid: "bg-lime text-ink",
    cancelled: "bg-stone text-ink line-through",
    started: "bg-muted text-ink-soft",
    checkout_created: "bg-azure/20 text-ink",
    refunded: "bg-stone text-ink",
    active: "bg-lime text-ink",
    paused: "bg-muted text-ink-soft",
    blocked: "bg-flame text-paper",
  };
  const labels: Record<string, string> = {
    pending: "Pending", approved: "Aprovada", paid: "Paga", cancelled: "Canceled",
    started: "Iniciada", checkout_created: "Checkout", refunded: "Reembolsada",
    active: "Active", paused: "Pausado", blocked: "Bloqueado",
  };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-muted text-ink-soft"}`}>{labels[status] ?? status}</span>;
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card-elevated p-6">
      <div className="text-xs tracking-wide text-ink-soft">{label}</div>
      <div className="mt-2 font-display font-black text-3xl text-ink">{value}</div>
      {sub && <div className="text-xs text-ink-soft mt-1">{sub}</div>}
    </div>
  );
}

export function PartnerTab() {
  const qc = useQueryClient();

  const { data, error: loadError, isLoading } = useQuery({
    queryKey: ["console-partner"],
    queryFn: async () => {
      const [partnersR, commissionsR, referralsR, payoutsR, profilesR, plansR] = await Promise.all([
        supabase.from("partners").select("*").order("created_at"),
        supabase.from("partner_commissions").select("*").order("created_at", { ascending: false }),
        supabase.from("partner_referrals").select("*").order("created_at", { ascending: false }),
        supabase.from("partner_payouts").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name, email"),
        supabase.from("plans").select("id, name"),
      ]);
      const firstError =
        partnersR.error || commissionsR.error || referralsR.error ||
        payoutsR.error || profilesR.error || plansR.error;
      if (firstError) throw new Error(firstError.message);
      return {
        partners: (partnersR.data ?? []) as Partner[],
        commissions: (commissionsR.data ?? []) as Commission[],
        referrals: (referralsR.data ?? []) as Referral[],
        payouts: (payoutsR.data ?? []) as Payout[],
        profiles: profilesR.data ?? [],
        plans: plansR.data ?? [],
      };
    },
  });

  if (loadError) {
    return (
      <div>
        <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Partner</h1>
        <div className="mt-6 card-elevated p-6 border border-flame/40 bg-flame/5 text-ink">
          <div className="font-semibold">Failed ao carregar dados de parceiros.</div>
          <div className="mt-1 text-sm text-ink-soft">{loadError instanceof Error ? loadError.message : String(loadError)}</div>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return <div className="p-6 text-ink-soft">Carregando dados de parceiros…</div>;
  }

  const partners = data?.partners ?? [];
  const commissions = data?.commissions ?? [];
  const referrals = data?.referrals ?? [];
  const payouts = data?.payouts ?? [];

  const partner = partners[0] ?? null;
  const profileBy = (uid: string | null) => data?.profiles.find((p) => p.user_id === uid);
  const planBy = (pid: string | null) => data?.plans.find((p) => p.id === pid);

  // Summary financeiro
  const sum = (arr: Commission[], k: keyof Commission) => arr.reduce((s, c) => s + (Number(c[k]) || 0), 0);
  const pending = commissions.filter((c) => c.status === "pending");
  const approved = commissions.filter((c) => c.status === "approved");
  const paid = commissions.filter((c) => c.status === "paid");
  const validForRevenue = commissions.filter((c) => c.status !== "cancelled");

  const totalGenerated = validForRevenue.reduce((s, c) => s + c.activation_amount + c.monthly_amount, 0);
  const recurringPreserved = validForRevenue.reduce((s, c) => s + c.monthly_amount, 0);
  const toPay = sum(pending, "commission_amount") + sum(approved, "commission_amount");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["console-partner"] });

  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Partner</h1>
      <p className="mt-2 text-ink-soft">Controle privado de indicações B2B, comissões sobre ativação e repasses manuais por Pix.</p>

      <div className="mt-4 card-elevated p-4 text-sm text-ink-soft border border-border">
        As comissões são calculadas apenas sobre a taxa de ativação. Monthlys pertencem 100% à operação Filro.
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Metric label="Total gerado por parceiros" value={formatBRL(totalGenerated)} sub="Activation + mensalidade" />
        <Metric label="Commission pendente" value={formatBRL(sum(pending, "commission_amount"))} sub={`${pending.length} comissão(ões)`} />
        <Metric label="Commission aprovada" value={formatBRL(sum(approved, "commission_amount"))} sub={`${approved.length} comissão(ões)`} />
        <Metric label="Commission paga" value={formatBRL(sum(paid, "commission_amount"))} sub={`${paid.length} repasse(s)`} />
        <Metric label="A pagar agora" value={formatBRL(toPay)} sub="pending + approved" />
        <Metric label="Receita recorrente preservada" value={formatBRL(recurringPreserved)} sub="Monthlys 100% Filro" />
      </div>

      {/* Partner atual */}
      {partner && <PartnerCard partner={partner} onChanged={invalidate} />}

      {/* Commissions */}
      <section className="mt-10">
        <h2 className="font-display font-black text-2xl text-ink">Commissions</h2>
        <div className="mt-4 card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Activation</th>
                  <th className="px-4 py-3">Monthly</th>
                  <th className="px-4 py-3">%</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Disponível</th>
                  <th className="px-4 py-3">Paid em</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => {
                  const partnerName = partners.find((p) => p.id === c.partner_id)?.name ?? "—";
                  const prof = profileBy(c.user_id);
                  const planName = planBy(c.plan_id)?.name ?? "—";
                  return (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDateTime(c.created_at)}</td>
                      <td className="px-4 py-3">{partnerName}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{prof?.name || "—"}</div>
                        <div className="text-xs text-ink-soft">{prof?.email}</div>
                      </td>
                      <td className="px-4 py-3">{planName}</td>
                      <td className="px-4 py-3">{formatBRL(c.activation_amount)}</td>
                      <td className="px-4 py-3 text-ink-soft">{formatBRL(c.monthly_amount)}</td>
                      <td className="px-4 py-3">{Number(c.commission_rate)}%</td>
                      <td className="px-4 py-3 font-semibold">{formatBRL(c.commission_amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-ink-soft text-xs">{c.available_at ? formatDateTime(c.available_at) : "—"}</td>
                      <td className="px-4 py-3 text-ink-soft text-xs">{c.paid_at ? formatDateTime(c.paid_at) : "—"}</td>
                      <td className="px-4 py-3">
                        <CommissionActions commission={c} partner={partners.find((p) => p.id === c.partner_id) ?? null} client={prof} planName={planName} onChanged={invalidate} />
                      </td>
                    </tr>
                  );
                })}
                {commissions.length === 0 && (
                  <tr><td colSpan={12} className="px-4 py-12 text-center text-ink-soft">Nenhuma comissão registrada ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Indicações */}
      <section className="mt-10">
        <h2 className="font-display font-black text-2xl text-ink">Indicações / Vendas</h2>
        <div className="mt-4 card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Data</th><th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Client</th><th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th><th className="px-4 py-3">Checkout Session</th>
                  <th className="px-4 py-3">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => {
                  const prof = profileBy(r.user_id);
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3 text-ink-soft">{formatDateTime(r.created_at)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.partner_code}</td>
                      <td className="px-4 py-3">{prof?.name || r.client_name || "—"}<div className="text-xs text-ink-soft">{prof?.email || r.client_email}</div></td>
                      <td className="px-4 py-3">{planBy(r.plan_id)?.name ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft truncate max-w-[180px]">{r.stripe_checkout_session_id ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-soft text-xs">{r.converted_at ? formatDateTime(r.converted_at) : "—"}</td>
                    </tr>
                  );
                })}
                {referrals.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-soft">Nenhuma indicação registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Repasses */}
      <section className="mt-10 mb-10">
        <h2 className="font-display font-black text-2xl text-ink">Histórico de repasses</h2>
        <div className="mt-4 card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Data</th><th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Valor</th><th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Payout key</th><th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Observação</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(p.paid_at || p.created_at)}</td>
                    <td className="px-4 py-3">{partners.find((x) => x.id === p.partner_id)?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold">{formatBRL(p.amount)}</td>
                    <td className="px-4 py-3">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{p.pix_key || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-ink-soft text-xs">{p.notes || "—"}</td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-soft">Nenhum repasse registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============== Partner card ==============
function PartnerCard({ partner, onChanged }: { partner: Partner; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const link = `${ORIGIN}/?ref=${partner.code}`;

  return (
    <section className="mt-10">
      <h2 className="font-display font-black text-2xl text-ink">Partner atual</h2>
      <div className="mt-4 card-elevated p-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-2 text-sm">
          <div><span className="text-ink-soft">Name:</span> <strong className="text-ink">{partner.name}</strong></div>
          <div><span className="text-ink-soft">Código:</span> <code className="text-ink">{partner.code}</code></div>
          <div><span className="text-ink-soft">WhatsApp:</span> {partner.whatsapp || "—"}</div>
          <div><span className="text-ink-soft">Email:</span> {partner.email || "—"}</div>
          <div><span className="text-ink-soft">Payout key:</span> {partner.pix_key || "—"}</div>
          <div><span className="text-ink-soft">Commission:</span> {Number(partner.commission_rate)}% sobre ativação</div>
          <div><span className="text-ink-soft">Status:</span> <StatusBadge status={partner.status} /></div>
        </div>
        <div className="space-y-3">
          <div className="text-xs tracking-wide text-ink-soft">Link privado</div>
          <div className="flex gap-2">
            <input readOnly value={link} className="flex-1 h-11 px-3 rounded-xl border border-border bg-paper text-sm" />
            <button
              onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copiado"); }}
              className="h-11 px-4 rounded-xl bg-ink text-paper text-sm font-semibold"
            >Copy</button>
          </div>
          <button onClick={() => setEditing(true)} className="h-11 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Edit parceiro</button>
        </div>
      </div>
      {editing && <EditPartnerModal partner={partner} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); onChanged(); }} />}
    </section>
  );
}

function EditPartnerModal({ partner, onClose, onSaved }: { partner: Partner; onClose: () => void; onSaved: () => void }) {
  const updateFn = useServerFn(updatePartner);
  const [form, setForm] = useState({
    name: partner.name, email: partner.email ?? "", whatsapp: partner.whatsapp ?? "",
    pix_key: partner.pix_key ?? "", commission_rate: Number(partner.commission_rate),
    status: partner.status as "active" | "paused" | "blocked", notes: partner.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateFn({ data: {
        id: partner.id,
        name: form.name,
        email: form.email || null,
        whatsapp: form.whatsapp || null,
        pix_key: form.pix_key || null,
        commission_rate: form.commission_rate,
        status: form.status,
        notes: form.notes || null,
      }});
      toast.success("Partner atualizado");
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed ao salvar"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Edit parceiro" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
        <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
        <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
        <Field label="Payout key"><input value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
        <Field label="Commission (%)"><input type="number" step="0.01" min={0} max={100} value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm">
            <option value="active">Active</option><option value="paused">Pausado</option><option value="blocked">Bloqueado</option>
          </select>
        </Field>
        <Field label="Observações"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm">Cancel</button>
        <button disabled={saving} onClick={save} className="h-10 px-4 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
      </div>
    </Modal>
  );
}

// ============== Commission actions ==============
function CommissionActions({
  commission, partner, client, planName, onChanged,
}: {
  commission: Commission; partner: Partner | null;
  client: { name?: string; email?: string } | undefined; planName: string;
  onChanged: () => void;
}) {
  const approveFn = useServerFn(approveCommission);
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const onApprove = async () => {
    try { await approveFn({ data: { id: commission.id } }); toast.success("Aprovada"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  if (commission.status === "paid" || commission.status === "cancelled") {
    return <span className="text-xs text-ink-soft">—</span>;
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {commission.status === "pending" && (
        <button onClick={onApprove} className="h-8 px-2.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted">Aprovar</button>
      )}
      <button onClick={() => setPayOpen(true)} className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-ink text-paper">Marcar paga</button>
      <button onClick={() => setCancelOpen(true)} className="h-8 px-2.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted">Cancel</button>
      {payOpen && <PayModal commission={commission} partner={partner} client={client} planName={planName} onClose={() => setPayOpen(false)} onDone={() => { setPayOpen(false); onChanged(); }} />}
      {cancelOpen && <CancelModal commission={commission} onClose={() => setCancelOpen(false)} onDone={() => { setCancelOpen(false); onChanged(); }} />}
    </div>
  );
}

function PayModal({ commission, partner, client, planName, onClose, onDone }: {
  commission: Commission; partner: Partner | null;
  client: { name?: string; email?: string } | undefined; planName: string;
  onClose: () => void; onDone: () => void;
}) {
  const payFn = useServerFn(payCommission);
  const [method, setMethod] = useState<"pix" | "bank_transfer" | "cash" | "other">("pix");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try { await payFn({ data: { id: commission.id, method, notes: notes || undefined } }); toast.success("Commission marcada como paga"); onDone(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Marcar comissão como paga" onClose={onClose}>
      <div className="space-y-2 text-sm">
        <div><span className="text-ink-soft">Partner:</span> {partner?.name ?? "—"}</div>
        <div><span className="text-ink-soft">Valor da comissão:</span> <strong>{formatBRL(commission.commission_amount)}</strong></div>
        <div><span className="text-ink-soft">Payout key:</span> {partner?.pix_key || "—"}</div>
        <div><span className="text-ink-soft">Plan:</span> {planName}</div>
        <div><span className="text-ink-soft">Client:</span> {client?.name || "—"} {client?.email ? `· ${client.email}` : ""}</div>
        <div><span className="text-ink-soft">Data da venda:</span> {formatDateTime(commission.created_at)}</div>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <Field label="Método de pagamento">
          <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm">
            <option value="pix">Pix</option><option value="bank_transfer">Transferência bancária</option>
            <option value="cash">Dinheiro</option><option value="other">Outro</option>
          </select>
        </Field>
        <Field label="Observação (opcional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
      </div>
      <p className="mt-3 text-xs text-ink-soft">Confirme apenas depois de realizar o Pix para o parceiro.</p>
      <div className="mt-4 flex gap-2 justify-end">
        <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm">Cancel</button>
        <button disabled={saving} onClick={confirm} className="h-10 px-4 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Confirm"}</button>
      </div>
    </Modal>
  );
}

function CancelModal({ commission, onClose, onDone }: { commission: Commission; onClose: () => void; onDone: () => void }) {
  const cancelFn = useServerFn(cancelCommission);
  const [reason, setReason] = useState<"refund" | "sale_cancelled" | "attribution_error" | "fraud" | "other">("sale_cancelled");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try { await cancelFn({ data: { id: commission.id, reason, notes: notes || undefined } }); toast.success("Commission cancelada"); onDone(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Cancel comissão" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <Field label="Motivo">
          <select value={reason} onChange={(e) => setReason(e.target.value as typeof reason)} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm">
            <option value="refund">Reembolso</option>
            <option value="sale_cancelled">Venda cancelada</option>
            <option value="attribution_error">Error de atribuição</option>
            <option value="fraud">Fraude</option>
            <option value="other">Outro</option>
          </select>
        </Field>
        <Field label="Observação (opcional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full h-10 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm" /></Field>
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm">Back</button>
        <button disabled={saving} onClick={confirm} className="h-10 px-4 rounded-xl bg-flame text-paper text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Cancel comissão"}</button>
      </div>
    </Modal>
  );
}

// ============== Generic UI helpers ==============
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-paper rounded-2xl border border-border p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-black text-xl text-ink">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs tracking-wide text-ink-soft mb-1">{label}</div>
      {children}
    </label>
  );
}
