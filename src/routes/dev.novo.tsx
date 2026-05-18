import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { DEV_TEMPLATES, getDevTemplate } from "@/lib/dev/templates";
import { generateDevSite } from "@/lib/dev/generator.functions";
import { getMyCredits } from "@/lib/credits/credits.functions";
import { Zap, Loader2, ArrowRight } from "lucide-react";

const SearchSchema = z.object({ template: z.string().optional() });

export const Route = createFileRoute("/dev/novo")({
  validateSearch: SearchSchema,
  component: NovoProjeto,
  head: () => ({
    meta: [
      { title: "Criar site automático · Flaro Dev" },
      { name: "description", content: "Descreva seu negócio e receba um site profissional pronto em segundos." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function NovoProjeto() {
  const { template: tplFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [templateSlug, setTemplateSlug] = useState<string | undefined>(tplFromUrl);
  const [businessName, setBusinessName] = useState("");
  const [businessSegment, setBusinessSegment] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [tone, setTone] = useState("");
  const [preferredSlug, setPreferredSlug] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const generate = useServerFn(generateDevSite);
  const fetchCredits = useServerFn(getMyCredits);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/dev/novo${templateSlug ? `?template=${templateSlug}` : ""}` } });
      return;
    }
    fetchCredits().then((r) => setBalance(r.balance)).catch(() => {});
  }, [loading, user, navigate, templateSlug, fetchCredits]);

  const template = templateSlug ? getDevTemplate(templateSlug) : undefined;
  const canSubmit = !!templateSlug && businessName.trim().length >= 2 && description.trim().length >= 10;
  const enoughCredits = (balance ?? 0) >= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateSlug) { toast.error("Escolha um modelo."); return; }
    if (!enoughCredits) { toast.error("Você não tem créditos suficientes. Veja os planos."); return; }
    setSubmitting(true);
    try {
      const res = await generate({
        data: {
          templateSlug,
          businessName: businessName.trim(),
          businessSegment: businessSegment.trim(),
          description: description.trim(),
          whatsapp: whatsapp.trim(),
          city: city.trim(),
          tone: tone.trim(),
          preferredSlug: preferredSlug.trim() || undefined,
        },
      });
      if (!res.ok) throw new Error(res.error ?? "Falha ao gerar");
      toast.success("Site gerado! Abrindo seu projeto…");
      navigate({ to: "/dev/projeto/$projectId", params: { projectId: res.projectId! } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha inesperada");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] w-full px-5 md:px-10 py-10 md:py-14">
        <nav className="text-xs text-ink-soft mb-4">
          <Link to="/dev" className="hover:text-ink">Flaro Dev</Link> <span className="mx-1">/</span> Criar site
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="editorial-headline text-4xl md:text-6xl text-ink">Crie seu site em segundos</h1>
            <p className="mt-3 text-ink-soft max-w-2xl">Descreva seu negócio. Nossa IA escreve o conteúdo, monta o site e publica num endereço próprio.</p>
          </div>
          {balance !== null && (
            <div className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-border bg-paper text-sm">
              <Zap className="h-4 w-4 text-flame" />
              <span className="font-bold text-ink">{balance}</span>
              <span className="text-ink-soft">créditos · gera por 5</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="text-xs uppercase tracking-widest text-ink-soft">1. Modelo</div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {DEV_TEMPLATES.map((t) => {
                  const selected = templateSlug === t.slug;
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => setTemplateSlug(t.slug)}
                      className={`text-left rounded-2xl border p-4 transition ${selected ? "border-ink shadow-elegant" : "border-border hover:border-ink/40"}`}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-ink-soft">{t.segment}</div>
                      <div className="mt-1 font-semibold text-ink">{t.name}</div>
                      <div className="mt-1 text-xs text-ink-soft line-clamp-2">{t.description}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="text-xs uppercase tracking-widest text-ink-soft">2. Seu negócio</div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <Field label="Nome do negócio *">
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required maxLength={120} className="input" placeholder="Ex: Padaria Bom Pão" />
                </Field>
                <Field label="Segmento">
                  <input value={businessSegment} onChange={(e) => setBusinessSegment(e.target.value)} maxLength={120} className="input" placeholder="Padaria artesanal" />
                </Field>
                <Field label="WhatsApp">
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={20} className="input" placeholder="(11) 99999-9999" />
                </Field>
                <Field label="Cidade">
                  <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className="input" placeholder="São Paulo, SP" />
                </Field>
                <Field label="Tom da comunicação">
                  <input value={tone} onChange={(e) => setTone(e.target.value)} maxLength={80} className="input" placeholder="Acolhedor e familiar" />
                </Field>
                <Field label="Endereço do site (opcional)">
                  <div className="flex items-center gap-1">
                    <input value={preferredSlug} onChange={(e) => setPreferredSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} maxLength={40} className="input flex-1" placeholder="padaria-bom-pao" />
                  </div>
                  <div className="mt-1 text-[11px] text-ink-soft">/s/{preferredSlug || "(gerado)"}</div>
                </Field>
              </div>
              <Field label="Descreva o seu negócio em poucas linhas *" className="mt-3">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} maxLength={2000} rows={6} className="input" placeholder="Conte o que você faz, há quanto tempo, o que te diferencia, quem é seu cliente ideal…" />
                <div className="mt-1 text-[11px] text-ink-soft">{description.length}/2000 · mínimo 10 caracteres</div>
              </Field>
            </section>
          </div>

          <aside>
            <div className="sticky top-28 rounded-3xl border border-border bg-muted/30 p-6">
              <div className="text-xs uppercase tracking-widest text-ink-soft">Resumo</div>
              <div className="mt-2 font-display font-black text-xl text-ink">{template?.name ?? "Escolha um modelo"}</div>
              {template && <p className="mt-1 text-xs text-ink-soft">{template.segment}</p>}
              <div className="mt-5 rounded-2xl bg-paper border border-border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Custo de geração</span>
                  <span className="inline-flex items-center gap-1 font-bold text-ink"><Zap className="h-3.5 w-3.5 text-flame" /> 5 créditos</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Seu saldo</span>
                  <span className="font-bold text-ink">{balance ?? "…"}</span>
                </div>
                {!enoughCredits && balance !== null && (
                  <Link to="/dev/precos" className="mt-3 block text-center text-xs underline text-flame">Ver planos para ganhar mais créditos</Link>
                )}
              </div>
              <button
                type="submit"
                disabled={!canSubmit || submitting || !enoughCredits}
                className="mt-5 w-full inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink text-paper font-semibold disabled:opacity-50"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando…</> : <>Gerar meu site <ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-3 text-[11px] text-ink-soft text-center">Em até 30s seu site está pronto e publicado.</p>
            </div>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs tracking-wide text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
