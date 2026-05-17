import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPromoCodes, upsertPromoCode, togglePromoCode, deletePromoCode } from "@/lib/promo-codes.functions";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export function CouponsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listPromoCodes);
  const upsert = useServerFn(upsertPromoCode);
  const toggle = useServerFn(togglePromoCode);
  const remove = useServerFn(deletePromoCode);

  const { data: codes, isLoading } = useQuery({
    queryKey: ["console-promo-codes"],
    queryFn: () => list(),
  });

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_percent: 10,
    plan_slug: "",
    max_uses: "",
    expires_at: "",
    syncStripe: true,
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await upsert({
        data: {
          code: form.code,
          description: form.description,
          discount_percent: Number(form.discount_percent),
          plan_slug: form.plan_slug || null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          expires_at: form.expires_at || null,
          active: true,
          syncStripe: form.syncStripe,
        },
      });
      toast.success("Cupom criado");
      setForm({ code: "", description: "", discount_percent: 10, plan_slug: "", max_uses: "", expires_at: "", syncStripe: true });
      qc.invalidateQueries({ queryKey: ["console-promo-codes"] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar cupom");
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await toggle({ data: { id, active } });
      qc.invalidateQueries({ queryKey: ["console-promo-codes"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onDelete = async (id: string, code: string) => {
    if (!confirm(`Excluir cupom ${code}?`)) return;
    try {
      await remove({ data: { id } });
      qc.invalidateQueries({ queryKey: ["console-promo-codes"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Cupons</h1>
      <p className="mt-2 text-ink-soft">Crie, ative e expire códigos promocionais. São sincronizados com o Stripe automaticamente.</p>

      <form onSubmit={submit} className="mt-8 card-elevated p-6 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="CODIGO" className="md:col-span-2 h-11 px-3 rounded-lg border border-border bg-paper font-mono" />
        <input type="number" min={1} max={100} required value={form.discount_percent}
          onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
          placeholder="% off" className="h-11 px-3 rounded-lg border border-border bg-paper" />
        <input value={form.plan_slug} onChange={(e) => setForm({ ...form, plan_slug: e.target.value })}
          placeholder="plano (vazio = todos)" className="h-11 px-3 rounded-lg border border-border bg-paper" />
        <input type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
          placeholder="usos máx." className="h-11 px-3 rounded-lg border border-border bg-paper" />
        <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          className="h-11 px-3 rounded-lg border border-border bg-paper" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição interna" className="md:col-span-4 h-11 px-3 rounded-lg border border-border bg-paper" />
        <label className="md:col-span-2 flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={form.syncStripe} onChange={(e) => setForm({ ...form, syncStripe: e.target.checked })} />
          Sincronizar no Stripe
        </label>
        <button disabled={busy} type="submit" className="md:col-span-6 h-11 rounded-lg bg-ink text-paper font-semibold hover:bg-ink/90 disabled:opacity-50">
          {busy ? "Criando..." : "Criar cupom"}
        </button>
      </form>

      <div className="mt-8 card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">% off</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Expira</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-soft">Carregando...</td></tr>}
              {!isLoading && (codes ?? []).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-soft">Nenhum cupom.</td></tr>
              )}
              {(codes ?? []).map((c: any) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}<div className="text-[11px] text-ink-soft font-sans">{c.description}</div></td>
                  <td className="px-4 py-3 font-medium">{c.discount_percent}%</td>
                  <td className="px-4 py-3">{c.plan_slug || <span className="text-ink-soft">todos</span>}</td>
                  <td className="px-4 py-3">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.expires_at ? formatDateTime(c.expires_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${c.active ? "bg-lime text-ink" : "bg-muted text-ink-soft"}`}>
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2 text-xs">
                    <button onClick={() => onToggle(c.id, !c.active)} className="underline text-ink-soft hover:text-ink">
                      {c.active ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => onDelete(c.id, c.code)} className="underline text-flame hover:text-flame/80">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
