import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { PhoneInput } from "@/components/PhoneInput";
import {
  getOrCreateMyProject,
  saveBusinessInfoDraft,
  submitBusinessInfo,
} from "@/lib/projects-client.functions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Upload, Check, Clock } from "lucide-react";

export const Route = createFileRoute("/business-info")({
  component: BusinessInfoPage,
  head: () => ({ meta: [
    { title: "Informações do negócio · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

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
  testimonials: string;
  facebook: string;
  tiktok: string;
  premium_brand_voice: string;
  premium_target_audience: string;
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
  testimonials: "",
  facebook: "",
  tiktok: "",
  premium_brand_voice: "",
  premium_target_audience: "",
};

// Per-plan field configuration: which sections appear and how rich each one is.
type SectionKey = "identidade" | "contato" | "catalogo" | "modelo" | "premium";
const PLAN_SECTIONS: Record<string, SectionKey[]> = {
  start:        ["identidade", "contato"],
  essencial:    ["identidade", "contato", "catalogo"],
  plus:         ["identidade", "contato", "catalogo", "modelo"],
  profissional: ["identidade", "contato", "catalogo", "modelo"],
  priority:     ["identidade", "contato", "catalogo", "modelo", "premium"],
  premium:      ["identidade", "contato", "catalogo", "modelo", "premium"],
};
const SECTION_LABELS: Record<SectionKey, string> = {
  identidade: "Identidade da marca",
  contato: "Contato e redes",
  catalogo: "Catálogo",
  modelo: "Modelo e promoções",
  premium: "Conteúdo avançado",
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
  const [planSlug, setPlanSlug] = useState<string>("plus");
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<SectionKey>("identidade");
  const [hydrated, setHydrated] = useState(false);

  const lsKey = user ? `business-info-draft:${user.id}` : null;

  const getOrCreate = useServerFn(getOrCreateMyProject);
  const saveDraft = useServerFn(saveBusinessInfoDraft);
  const submitFinal = useServerFn(submitBusinessInfo);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/business-info" } }); return; }
    (async () => {
      try {
        const proj = await getOrCreate();
        const slugFromPlan = await supabase
          .from("plans").select("slug").eq("id", proj.plan_id ?? "").maybeSingle();
        const slug = slugFromPlan.data?.slug ?? "plus";
        setPlanSlug(slug);
        setProject({ id: proj.id, business_info_submitted: proj.business_info_submitted });

        // Hydrate from server first; fall back to local draft if server is empty.
        const serverBi = proj.business_info as Partial<BusinessInfo> | null;
        if (serverBi && typeof serverBi === "object" && Object.keys(serverBi).length > 0) {
          setInfo({ ...empty, ...serverBi, hours: normalizeHours((serverBi as { hours?: unknown }).hours) });
        } else {
          try {
            const raw = lsKey ? localStorage.getItem(lsKey) : null;
            if (raw) {
              const parsed = JSON.parse(raw) as Partial<BusinessInfo>;
              setInfo({ ...empty, ...parsed, hours: normalizeHours((parsed as { hours?: unknown }).hours) });
            }
          } catch { /* ignore */ }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao carregar projeto";
        toast.error(msg);
        navigate({ to: "/" });
        return;
      }
      setHydrated(true);
    })();
  }, [loading, user, navigate, lsKey, getOrCreate]);

  useEffect(() => {
    if (!hydrated || !lsKey) return;
    try { localStorage.setItem(lsKey, JSON.stringify(info)); } catch { /* ignore */ }
    if (!project || project.business_info_submitted) return;
    const t = setTimeout(() => {
      saveDraft({ data: { projectId: project.id, businessInfo: info as unknown as Record<string, unknown> } })
        .catch((e: unknown) => console.warn("[business-info] autosave failed", e));
    }, 800);
    return () => clearTimeout(t);
  }, [info, hydrated, project, lsKey, saveDraft]);

  const upd = <K extends keyof BusinessInfo>(k: K, v: BusinessInfo[K]) => setInfo((p) => ({ ...p, [k]: v }));
  const updDay = (key: string, patch: Partial<DayHours>) =>
    setInfo((p) => ({ ...p, hours: { ...p.hours, [key]: { ...p.hours[key], ...patch } } }));

  // Returns the bucket-relative path (not a public URL) — the bucket is private
  // and we render via signed URLs. Limits: 8MB, image/* or PDF only.
  const upload = async (file: File, prefix: string): Promise<string | null> => {
    if (!user) return null;
    if (file.size > 8 * 1024 * 1024) { toast.error("Arquivo muito grande (máx. 8MB)."); return null; }
    const okType = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!okType) { toast.error("Tipo de arquivo não permitido. Envie imagem ou PDF."); return null; }
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
    const path = `${user.id}/${prefix}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("business-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { toast.error("Falha no upload do arquivo: " + error.message); return null; }
    return path;
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

  // Per-section validation: each section returns true when complete.
  const sectionValid: Record<SectionKey, boolean> = {
    identidade: Boolean(info.name.trim() && info.segment.trim() && info.description.trim().length >= 20 && info.logo_url),
    contato: Boolean(info.whatsapp.trim() && info.address.trim()),
    catalogo: info.products.length > 0 && info.products.every((p) => p.name.trim() && p.price.trim()),
    modelo: Boolean(info.model_notes.trim()),
    premium: Boolean(info.premium_brand_voice.trim() && info.premium_target_audience.trim()),
  };

  const submit = async () => {
    if (!project || !user) return;
    const missing = (PLAN_SECTIONS[planSlug] ?? PLAN_SECTIONS.plus).filter((s) => !sectionValid[s]);
    if (missing.length > 0) {
      toast.error(`Complete todas as seções primeiro: ${missing.map((m) => SECTION_LABELS[m]).join(", ")}`);
      setSection(missing[0]);
      return;
    }
    setSaving(true);
    try {
      await submitFinal({
        data: {
          projectId: project.id,
          businessInfo: info as unknown as Record<string, unknown>,
          businessName: info.name,
          businessSegment: info.segment,
          selectedModel: info.model_choice,
        },
      });
      toast.success("Informações enviadas! Ativação iniciada. Entrega em 24h.");
      setProject({ ...project, business_info_submitted: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !project) return <div className="min-h-screen grid place-items-center text-ink-soft">Carregando...</div>;

  const activeSectionKeys = PLAN_SECTIONS[planSlug] ?? PLAN_SECTIONS.plus;
  const sections = activeSectionKeys.map((k) => [k, SECTION_LABELS[k]] as const);
  const currentSection = activeSectionKeys.includes(section) ? section : activeSectionKeys[0];
  const allValid = activeSectionKeys.every((s) => sectionValid[s]);

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
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink text-paper text-xs font-semibold uppercase tracking-wide">
            Plano {planSlug}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flame/10 text-flame text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" /> Entrega em até 24h após confirmação
          </span>
        </div>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-8">
          <nav className="lg:sticky lg:top-28 h-fit space-y-1">
            {sections.map(([k, label]) => {
              const ok = sectionValid[k];
              return (
                <button key={k} onClick={() => setSection(k)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between gap-2 ${currentSection === k ? "bg-ink text-paper" : "text-ink-soft hover:bg-muted"}`}>
                  <span>{label}</span>
                  {ok
                    ? <Check className={`h-3.5 w-3.5 ${currentSection === k ? "text-lime" : "text-emerald-600"}`} />
                    : <Clock className={`h-3.5 w-3.5 ${currentSection === k ? "text-paper/60" : "text-ink-soft/60"}`} />}
                </button>
              );
            })}
            <div className="mt-3 px-4 text-[10px] uppercase tracking-widest text-ink-soft">
              {activeSectionKeys.filter((s) => sectionValid[s]).length}/{activeSectionKeys.length} seções completas
            </div>
          </nav>

          <div className="space-y-6">
            {currentSection === "identidade" && (
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

            {currentSection === "contato" && (
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

            {currentSection === "catalogo" && (
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
                      <input value={pr.name} onChange={(e) => updProduct(idx, "name", e.target.value)} className={inputCls} placeholder="Nome do produto" />
                      <input value={pr.price} onChange={(e) => updProduct(idx, "price", e.target.value)} className={inputCls} placeholder="Preço" />
                      <textarea value={pr.description} onChange={(e) => updProduct(idx, "description", e.target.value)} rows={2} className={inputCls + " py-3 h-auto"} placeholder="Descrição curta" />
                    </div>
                    <button onClick={() => removeProduct(idx)} className="h-10 w-10 grid place-items-center rounded-xl text-flame hover:bg-flame/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={addProduct} className="w-full h-14 rounded-2xl border-2 border-dashed border-border text-ink-soft hover:border-ink hover:text-ink inline-flex items-center justify-center gap-2 transition-colors">
                  <Plus className="h-5 w-5" /> Adicionar produto / serviço
                </button>
              </div>
            )}

            {currentSection === "modelo" && (
              <div className="card-elevated p-6 md:p-8 space-y-5">
                <Field label="Promoções e ofertas"><textarea value={info.promotions} onChange={(e) => upd("promotions", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Cupons, descontos, combos..." /></Field>
                <div className="border-t border-border pt-5">
                  <div className="font-semibold text-ink mb-3">Modelo de referência</div>
                  <Field label="Descreva como você quer"><textarea value={info.model_notes} onChange={(e) => upd("model_notes", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Estilo, sites de referência, vibe..." /></Field>
                  <Field label="Link de inspiração"><input value={info.model_link} onChange={(e) => upd("model_link", e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                  <Field label="Arquivo (PDF, imagem, briefing)">
                    <div className="flex items-center gap-3">
                      {info.model_file_url && <a href={info.model_file_url} target="_blank" rel="noreferrer" className="text-sm text-ink underline">Ver arquivo</a>}
                      <label className="inline-flex items-center gap-2 h-12 px-4 rounded-xl border border-border bg-paper cursor-pointer hover:bg-muted text-sm">
                        <Upload className="h-4 w-4" /> {info.model_file_url ? "Trocar arquivo" : "Enviar arquivo"}
                        <input type="file" onChange={handleModelFile} className="hidden" />
                      </label>
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {currentSection === "premium" && (
              <div className="card-elevated p-6 md:p-8 space-y-5">
                <Field label="Voz da marca">
                  <textarea value={info.premium_brand_voice} onChange={(e) => upd("premium_brand_voice", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Tom de voz: amigável, profissional, sofisticado, descontraído..." />
                </Field>
                <Field label="Público-alvo">
                  <textarea value={info.premium_target_audience} onChange={(e) => upd("premium_target_audience", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Quem são seus clientes ideais? Idade, perfil, interesses, necessidades..." />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Facebook">
                    <input value={info.facebook} onChange={(e) => upd("facebook", e.target.value)} className={inputCls} placeholder="facebook.com/seunegocio" />
                  </Field>
                  <Field label="TikTok">
                    <input value={info.tiktok} onChange={(e) => upd("tiktok", e.target.value)} className={inputCls} placeholder="@seunegocio" />
                  </Field>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-between items-center gap-3 pt-4">
              <div className="flex gap-2">
                {sections.map(([k]) => (
                  <span key={k} className={`h-2 w-2 rounded-full ${currentSection === k ? "bg-ink" : sectionValid[k] ? "bg-emerald-500" : "bg-border"}`} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                {!allValid && !project.business_info_submitted && (
                  <span className="text-xs text-ink-soft">Complete todas as seções para enviar</span>
                )}
                <button
                  onClick={submit}
                  disabled={saving || (!allValid && !project.business_info_submitted)}
                  className="h-13 px-8 py-3 rounded-full bg-ink text-paper font-semibold hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? "Salvando..." : project.business_info_submitted ? "Atualizar informações" : "Enviar para ativação"}
                </button>
              </div>
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
