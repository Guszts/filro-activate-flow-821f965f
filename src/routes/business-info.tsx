import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { PhoneInput } from "@/components/PhoneInput";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Upload, Check, Clock } from "lucide-react";

export const Route = createFileRoute("/business-info")({ component: BusinessInfoPage });

interface Product { name: string; price: string; description: string; image_url: string }
interface DayHours { closed: boolean; open: string; close: string }
type HoursMap = Record<string, DayHours>;
interface BusinessInfo {
  name: string; description: string; segment: string; slogan: string;
  brand_color_primary: string; brand_color_secondary: string; logo_url: string;
  whatsapp: string; instagram: string; address: string;
  hours: HoursMap;
  products: Product[];
  promotions: string;
  model_choice: string; model_link: string; model_file_url: string; model_notes: string;
}

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Segunda" }, { key: "tue", label: "Terça" }, { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" }, { key: "fri", label: "Sexta" }, { key: "sat", label: "Sábado" }, { key: "sun", label: "Domingo" },
];

const defaultHours: HoursMap = DAYS.reduce((acc, d) => {
  acc[d.key] = { closed: d.key === "sun", open: "09:00", close: "18:00" };
  return acc;
}, {} as HoursMap);

const empty: BusinessInfo = {
  name: "", description: "", segment: "", slogan: "",
  brand_color_primary: "#111111", brand_color_secondary: "#f5f5f0", logo_url: "",
  whatsapp: "", instagram: "", address: "",
  hours: defaultHours,
  products: [],
  promotions: "",
  model_choice: "", model_link: "", model_file_url: "", model_notes: "",
};

// Backward-compat: hours used to be a plain string. Coerce to map.
function normalizeHours(h: unknown): HoursMap {
  if (h && typeof h === "object" && !Array.isArray(h) && "mon" in (h as object)) return { ...defaultHours, ...(h as HoursMap) };
  return defaultHours;
}

// Normalize Instagram handle: ensure it starts with @ (strip URL parts if pasted)
function normalizeInstagram(v: string): string {
  let s = v.trim();
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  s = s.replace(/^@+/, "");
  s = s.replace(/\/.*$/, "");
  return s ? `@${s}` : "";
}

function BusinessInfoPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState<BusinessInfo>(empty);
  const [project, setProject] = useState<{ id: string; business_info_submitted: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<"identidade" | "contato" | "catalogo" | "modelo">("identidade");
  const [hydrated, setHydrated] = useState(false);

  const lsKey = user ? `business-info-draft:${user.id}` : null;

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/business-info" } }); return; }
    (async () => {
      const { data: pay } = await supabase.from("payments").select("id, plan_id, status").eq("user_id", user.id).eq("status", "paid").maybeSingle();
      if (!pay) { toast.error("Você precisa concluir um pagamento primeiro."); navigate({ to: "/" }); return; }

      try {
        const raw = lsKey ? localStorage.getItem(lsKey) : null;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<BusinessInfo>;
          setInfo({ ...empty, ...parsed, hours: normalizeHours((parsed as { hours?: unknown }).hours) });
        }
      } catch { /* ignore */ }

      const { data: existing } = await supabase.from("projects").select("id, business_info, business_info_submitted").eq("user_id", user.id).maybeSingle();
      if (existing) {
        setProject({ id: existing.id, business_info_submitted: existing.business_info_submitted });
        if (existing.business_info && typeof existing.business_info === "object" && Object.keys(existing.business_info).length > 0) {
          const bi = existing.business_info as Partial<BusinessInfo>;
          setInfo({ ...empty, ...bi, hours: normalizeHours((bi as { hours?: unknown }).hours) });
        }
      } else {
        const { data: created } = await supabase.from("projects").insert({ user_id: user.id, plan_id: pay.plan_id }).select("id, business_info_submitted").single();
        if (created) setProject({ id: created.id, business_info_submitted: created.business_info_submitted });
      }
      setHydrated(true);
    })();
  }, [loading, user, navigate, lsKey]);

  useEffect(() => {
    if (!hydrated || !lsKey) return;
    try { localStorage.setItem(lsKey, JSON.stringify(info)); } catch { /* ignore */ }
    if (!project) return;
    const t = setTimeout(() => {
      supabase.from("projects").update({ business_info: info as never }).eq("id", project.id);
    }, 800);
    return () => clearTimeout(t);
  }, [info, hydrated, project, lsKey]);

  const upd = <K extends keyof BusinessInfo>(k: K, v: BusinessInfo[K]) => setInfo((p) => ({ ...p, [k]: v }));
  const updDay = (key: string, patch: Partial<DayHours>) =>
    setInfo((p) => ({ ...p, hours: { ...p.hours, [key]: { ...p.hours[key], ...patch } } }));

  const upload = async (file: File, prefix: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${user.id}/${prefix}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("business-assets").upload(path, file, { upsert: true });
    if (error) { toast.error("Falha no upload do arquivo: " + error.message); return null; }
    const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await upload(f, "logo"); if (url) upd("logo_url", url);
  };

  const handleModelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await upload(f, "model"); if (url) upd("model_file_url", url);
  };

  const handleProductImg = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await upload(f, "product"); if (!url) return;
    setInfo((p) => ({ ...p, products: p.products.map((pr, i) => i === idx ? { ...pr, image_url: url } : pr) }));
  };

  const addProduct = () => setInfo((p) => ({ ...p, products: [...p.products, { name: "", price: "", description: "", image_url: "" }] }));
  const removeProduct = (idx: number) => setInfo((p) => ({ ...p, products: p.products.filter((_, i) => i !== idx) }));
  const updProduct = (idx: number, k: keyof Product, v: string) => setInfo((p) => ({ ...p, products: p.products.map((pr, i) => i === idx ? { ...pr, [k]: v } : pr) }));

  const submit = async () => {
    if (!project || !user) return;
    if (!info.name) return toast.error("Nome do negócio é obrigatório");
    if (!info.whatsapp) return toast.error("WhatsApp é obrigatório");
    setSaving(true);
    const { error } = await supabase.from("projects").update({
      business_info: info as never,
      business_info_submitted: true,
      business_name: info.name,
      business_segment: info.segment,
      selected_model: info.model_choice,
      project_status: "in_production",
    }).eq("id", project.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Informações enviadas! Ativação iniciada. Entrega em 24h.");
    setProject({ ...project, business_info_submitted: true });
  };

  if (loading || !project) return <div className="min-h-screen grid place-items-center text-ink-soft">Carregando...</div>;

  const sections = [
    ["identidade", "Identidade da marca"],
    ["contato", "Contato e redes"],
    ["catalogo", "Catálogo"],
    ["modelo", "Modelo e promoções"],
  ] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] w-full px-5 md:px-10 py-10 md:py-16">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">← Início</Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-4">
          <h1 className="editorial-headline text-4xl md:text-6xl text-ink">Informações do negócio</h1>
          {project.business_info_submitted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime text-ink text-xs font-semibold">
              <Check className="h-3.5 w-3.5" /> Enviado
            </span>
          )}
        </motion.div>
        <p className="mt-3 text-ink-soft max-w-2xl">Quanto mais detalhes você fornecer, melhor o resultado. Tudo é editável depois.</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flame/10 text-flame text-xs font-semibold">
          <Clock className="h-3.5 w-3.5" /> Entrega em até 24h após confirmação
        </div>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-8">
          <nav className="lg:sticky lg:top-28 h-fit space-y-1">
            {sections.map(([k, label]) => (
              <button key={k} onClick={() => setSection(k)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${section === k ? "bg-ink text-paper" : "text-ink-soft hover:bg-muted"}`}>
                {label}
              </button>
            ))}
          </nav>

          <div className="space-y-6">
            {section === "identidade" && (
              <div className="card-elevated p-6 md:p-8 space-y-5">
                <Field label="Nome do negócio *"><input value={info.name} onChange={(e) => upd("name", e.target.value)} className={inputCls} /></Field>
                <Field label="Slogan"><input value={info.slogan} onChange={(e) => upd("slogan", e.target.value)} className={inputCls} placeholder="ex.: O melhor café da cidade" /></Field>
                <Field label="Segmento"><input value={info.segment} onChange={(e) => upd("segment", e.target.value)} className={inputCls} placeholder="ex.: Padaria, Salão, Restaurante" /></Field>
                <Field label="Descrição"><textarea value={info.description} onChange={(e) => upd("description", e.target.value)} rows={4} className={inputCls + " py-3 h-auto"} placeholder="Conte sobre o negócio, história, o que o diferencia" /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Cor primária"><div className="flex gap-2 items-center"><input type="color" value={info.brand_color_primary} onChange={(e) => upd("brand_color_primary", e.target.value)} className="h-12 w-16 rounded-xl cursor-pointer border border-border" /><input value={info.brand_color_primary} onChange={(e) => upd("brand_color_primary", e.target.value)} className={inputCls} /></div></Field>
                  <Field label="Cor secundária"><div className="flex gap-2 items-center"><input type="color" value={info.brand_color_secondary} onChange={(e) => upd("brand_color_secondary", e.target.value)} className="h-12 w-16 rounded-xl cursor-pointer border border-border" /><input value={info.brand_color_secondary} onChange={(e) => upd("brand_color_secondary", e.target.value)} className={inputCls} /></div></Field>
                </div>
                <Field label="Logo">
                  <div className="flex items-center gap-4">
                    {info.logo_url && <img src={info.logo_url} alt="logo" className="h-16 w-16 rounded-xl object-cover border border-border" />}
                    <label className="inline-flex items-center gap-2 h-12 px-4 rounded-xl border border-border bg-paper cursor-pointer hover:bg-muted text-sm">
                      <Upload className="h-4 w-4" /> {info.logo_url ? "Trocar logo" : "Enviar logo"}
                      <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                    </label>
                  </div>
                </Field>
              </div>
            )}

            {section === "contato" && (
              <div className="card-elevated p-6 md:p-8 space-y-5">
                <Field label="WhatsApp *"><PhoneInput value={info.whatsapp} onChange={(v) => upd("whatsapp", v)} required /></Field>
                <Field label="Instagram">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none">@</span>
                    <input
                      value={info.instagram.replace(/^@/, "")}
                      onChange={(e) => upd("instagram", normalizeInstagram(e.target.value))}
                      onBlur={(e) => upd("instagram", normalizeInstagram(e.target.value))}
                      className={inputCls + " pl-9"}
                      placeholder="seunegocio"
                    />
                  </div>
                </Field>
                <Field label="Endereço"><input value={info.address} onChange={(e) => upd("address", e.target.value)} className={inputCls} placeholder="Rua, número, bairro, cidade" /></Field>
                <Field label="Horário de funcionamento">
                  <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                    {DAYS.map((d) => {
                      const h = info.hours[d.key];
                      return (
                        <div key={d.key} className="grid grid-cols-[110px_auto_1fr] sm:grid-cols-[140px_auto_1fr_1fr] items-center gap-3 px-4 py-3 bg-paper">
                          <div className="text-sm font-medium text-ink">{d.label}</div>
                          <label className="inline-flex items-center gap-2 text-xs text-ink-soft">
                            <input type="checkbox" checked={h.closed} onChange={(e) => updDay(d.key, { closed: e.target.checked })} />
                            Fechado
                          </label>
                          <input type="time" disabled={h.closed} value={h.open} onChange={(e) => updDay(d.key, { open: e.target.value })}
                            className="h-10 px-3 rounded-lg border border-border bg-paper outline-none focus:border-ink disabled:opacity-40" />
                          <input type="time" disabled={h.closed} value={h.close} onChange={(e) => updDay(d.key, { close: e.target.value })}
                            className="h-10 px-3 rounded-lg border border-border bg-paper outline-none focus:border-ink disabled:opacity-40" />
                        </div>
                      );
                    })}
                  </div>
                </Field>
              </div>
            )}

            {section === "catalogo" && (
              <div className="space-y-4">
                {info.products.map((pr, idx) => (
                  <div key={idx} className="card-elevated p-5 md:p-6 grid md:grid-cols-[120px_1fr_auto] gap-4 items-start">
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border grid place-items-center cursor-pointer hover:border-ink overflow-hidden bg-muted">
                      {pr.image_url
                        ? <img src={pr.image_url} alt="" className="h-full w-full object-cover" />
                        : <Upload className="h-5 w-5 text-ink-soft" />}
                      <input type="file" accept="image/*" onChange={(e) => handleProductImg(idx, e)} className="hidden" />
                    </label>
                    <div className="space-y-2">
                      <input value={pr.name} onChange={(e) => updProduct(idx, "name", e.target.value)} className={inputCls} placeholder="Product name" />
                      <input value={pr.price} onChange={(e) => updProduct(idx, "price", e.target.value)} className={inputCls} placeholder="Price" />
                      <textarea value={pr.description} onChange={(e) => updProduct(idx, "description", e.target.value)} rows={2} className={inputCls + " py-3 h-auto"} placeholder="Short description" />
                    </div>
                    <button onClick={() => removeProduct(idx)} className="h-10 w-10 grid place-items-center rounded-xl text-flame hover:bg-flame/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={addProduct} className="w-full h-14 rounded-2xl border-2 border-dashed border-border text-ink-soft hover:border-ink hover:text-ink inline-flex items-center justify-center gap-2 transition-colors">
                  <Plus className="h-5 w-5" /> Add product / service
                </button>
              </div>
            )}

            {section === "modelo" && (
              <div className="card-elevated p-6 md:p-8 space-y-5">
                <Field label="Promotions & offers"><textarea value={info.promotions} onChange={(e) => upd("promotions", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Coupons, discounts, combos..." /></Field>
                <div className="border-t border-border pt-5">
                  <div className="font-semibold text-ink mb-3">Reference template</div>
                  <Field label="Describe how you want it"><textarea value={info.model_notes} onChange={(e) => upd("model_notes", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Style, reference sites, vibe..." /></Field>
                  <Field label="Inspiration link"><input value={info.model_link} onChange={(e) => upd("model_link", e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                  <Field label="File (PDF, image, brief)">
                    <div className="flex items-center gap-3">
                      {info.model_file_url && <a href={info.model_file_url} target="_blank" rel="noreferrer" className="text-sm text-ink underline">View file</a>}
                      <label className="inline-flex items-center gap-2 h-12 px-4 rounded-xl border border-border bg-paper cursor-pointer hover:bg-muted text-sm">
                        <Upload className="h-4 w-4" /> {info.model_file_url ? "Change file" : "Upload file"}
                        <input type="file" onChange={handleModelFile} className="hidden" />
                      </label>
                    </div>
                  </Field>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {sections.map(([k]) => (
                  <span key={k} className={`h-2 w-2 rounded-full ${section === k ? "bg-ink" : "bg-border"}`} />
                ))}
              </div>
              <button onClick={submit} disabled={saving} className="h-13 px-8 py-3 rounded-full bg-ink text-paper font-semibold hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50">
                {saving ? "Saving..." : project.business_info_submitted ? "Update information" : "Submit for activation"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const inputCls = "w-full h-12 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs tracking-wide text-ink-soft uppercase">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
