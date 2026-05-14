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
interface BusinessInfo {
  // Identidade
  name: string; description: string; segment: string; slogan: string;
  brand_color_primary: string; brand_color_secondary: string; logo_url: string;
  // Contato
  whatsapp: string; instagram: string; address: string; hours: string;
  // Catálogo
  products: Product[];
  // Promoções e modelo
  promotions: string;
  model_choice: string; model_link: string; model_file_url: string; model_notes: string;
}

const empty: BusinessInfo = {
  name: "", description: "", segment: "", slogan: "",
  brand_color_primary: "#111111", brand_color_secondary: "#f5f5f0", logo_url: "",
  whatsapp: "", instagram: "", address: "", hours: "",
  products: [],
  promotions: "",
  model_choice: "", model_link: "", model_file_url: "", model_notes: "",
};

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

      // Load local draft immediately for instant restore
      try {
        const raw = lsKey ? localStorage.getItem(lsKey) : null;
        if (raw) setInfo({ ...empty, ...(JSON.parse(raw) as Partial<BusinessInfo>) });
      } catch { /* ignore */ }

      const { data: existing } = await supabase.from("projects").select("id, business_info, business_info_submitted").eq("user_id", user.id).maybeSingle();
      if (existing) {
        setProject({ id: existing.id, business_info_submitted: existing.business_info_submitted });
        if (existing.business_info && typeof existing.business_info === "object" && Object.keys(existing.business_info).length > 0) {
          setInfo({ ...empty, ...(existing.business_info as Partial<BusinessInfo>) });
        }
      } else {
        const { data: created } = await supabase.from("projects").insert({ user_id: user.id, plan_id: pay.plan_id }).select("id, business_info_submitted").single();
        if (created) setProject({ id: created.id, business_info_submitted: created.business_info_submitted });
      }
      setHydrated(true);
    })();
  }, [loading, user, navigate, lsKey]);

  // Autosave: localStorage immediately + debounced server save
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

  const upload = async (file: File, prefix: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${user.id}/${prefix}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("business-assets").upload(path, file, { upsert: true });
    if (error) { toast.error("Falha ao enviar arquivo: " + error.message); return null; }
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
    toast.success("Informações enviadas! Sua ativação começou. Entrega em 24h.");
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
        <p className="mt-3 text-ink-soft max-w-2xl">Quanto mais detalhes você der, melhor a entrega. Tudo é editável depois.</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flame/10 text-flame text-xs font-semibold">
          <Clock className="h-3.5 w-3.5" /> Entrega em 24h após confirmação
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
                <Field label="Slogan"><input value={info.slogan} onChange={(e) => upd("slogan", e.target.value)} className={inputCls} placeholder="Ex: O melhor café da cidade" /></Field>
                <Field label="Segmento"><input value={info.segment} onChange={(e) => upd("segment", e.target.value)} className={inputCls} placeholder="Ex: Padaria, Salão, Restaurante" /></Field>
                <Field label="Descrição"><textarea value={info.description} onChange={(e) => upd("description", e.target.value)} rows={4} className={inputCls + " py-3 h-auto"} placeholder="Conte sobre seu negócio, história, diferenciais" /></Field>
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
                <Field label="Instagram"><input value={info.instagram} onChange={(e) => upd("instagram", e.target.value)} className={inputCls} placeholder="@seunegocio" /></Field>
                <Field label="Endereço"><input value={info.address} onChange={(e) => upd("address", e.target.value)} className={inputCls} placeholder="Rua, número, bairro, cidade" /></Field>
                <Field label="Horário de funcionamento"><textarea value={info.hours} onChange={(e) => upd("hours", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Seg-Sex 9h às 18h..." /></Field>
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
                      <input value={pr.name} onChange={(e) => updProduct(idx, "name", e.target.value)} className={inputCls} placeholder="Nome do produto" />
                      <input value={pr.price} onChange={(e) => updProduct(idx, "price", e.target.value)} className={inputCls} placeholder="Preço (R$)" />
                      <textarea value={pr.description} onChange={(e) => updProduct(idx, "description", e.target.value)} rows={2} className={inputCls + " py-3 h-auto"} placeholder="Descrição curta" />
                    </div>
                    <button onClick={() => removeProduct(idx)} className="h-10 w-10 grid place-items-center rounded-xl text-flame hover:bg-flame/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={addProduct} className="w-full h-14 rounded-2xl border-2 border-dashed border-border text-ink-soft hover:border-ink hover:text-ink inline-flex items-center justify-center gap-2 transition-colors">
                  <Plus className="h-5 w-5" /> Adicionar produto/serviço
                </button>
              </div>
            )}

            {section === "modelo" && (
              <div className="card-elevated p-6 md:p-8 space-y-5">
                <Field label="Promoções e ofertas"><textarea value={info.promotions} onChange={(e) => upd("promotions", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Cupons, descontos, combos..." /></Field>
                <div className="border-t border-border pt-5">
                  <div className="font-semibold text-ink mb-3">Modelo de referência</div>
                  <Field label="Como você quer (texto livre)"><textarea value={info.model_notes} onChange={(e) => upd("model_notes", e.target.value)} rows={3} className={inputCls + " py-3 h-auto"} placeholder="Descreva o estilo, sites de referência, sensação..." /></Field>
                  <Field label="Link de inspiração"><input value={info.model_link} onChange={(e) => upd("model_link", e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                  <Field label="Arquivo (PDF, imagem, brief)">
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

            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {sections.map(([k]) => (
                  <span key={k} className={`h-2 w-2 rounded-full ${section === k ? "bg-ink" : "bg-border"}`} />
                ))}
              </div>
              <button onClick={submit} disabled={saving} className="h-13 px-8 py-3 rounded-full bg-ink text-paper font-semibold hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50">
                {saving ? "Salvando..." : project.business_info_submitted ? "Atualizar informações" : "Enviar para ativação"}
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
