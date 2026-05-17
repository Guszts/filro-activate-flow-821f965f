import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { DEV_TEMPLATES, getDevTemplate } from "@/lib/dev/templates";
import { DEV_PLANS, getDevPlan, formatBRL } from "@/lib/dev/plans";
import { createDevProject, saveDevBriefing } from "@/lib/dev/dev.functions";
import { useServerFn } from "@tanstack/react-start";

const SearchSchema = z.object({
  template: z.string().optional(),
  plan: z.string().optional(),
});

export const Route = createFileRoute("/dev/novo")({
  validateSearch: SearchSchema,
  component: NovoProjeto,
  head: () => ({
    meta: [
      { title: "Criar novo site · Flaro Dev" },
      { name: "description", content: "Escolha um modelo, conte sobre o seu negócio e ative seu site Flaro Dev em poucos dias." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Step = "template" | "plan" | "briefing";

function NovoProjeto() {
  const { template: tplFromUrl, plan: planFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [step, setStep] = useState<Step>(tplFromUrl ? (planFromUrl ? "briefing" : "plan") : "template");
  const [templateSlug, setTemplateSlug] = useState<string | undefined>(tplFromUrl);
  const [planSlug, setPlanSlug] = useState<string | undefined>(planFromUrl);
  const [submitting, setSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessSegment, setBusinessSegment] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [colors, setColors] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [referenceUrls, setReferenceUrls] = useState("");
  const [extra, setExtra] = useState("");

  const template = useMemo(() => (templateSlug ? getDevTemplate(templateSlug) : undefined), [templateSlug]);
  const plan = useMemo(() => (planSlug ? getDevPlan(planSlug) : undefined), [planSlug]);

  const createProject = useServerFn(createDevProject);
  const saveBriefing = useServerFn(saveDevBriefing);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/dev/novo${templateSlug ? `?template=${templateSlug}` : ""}` } });
    }
  }, [loading, user, navigate, templateSlug]);

  useEffect(() => {
    if (template && !planSlug) setPlanSlug(template.recommendedPlan);
  }, [template, planSlug]);

  async function handleContinue() {
    if (!templateSlug || !planSlug) return;
    if (!businessName.trim()) { toast.error("Diga o nome do seu negócio."); return; }
    setSubmitting(true);
    try {
      const createRes = await createProject({ data: { templateSlug, planSlug } });
      if (createRes.error || !createRes.projectId) throw new Error(createRes.error ?? "Falha ao criar projeto");
      const projectId = createRes.projectId;

      const briefing = {
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        colors: colors.trim(),
        tone: tone.trim(),
        offer: offer.trim(),
        referenceUrls: referenceUrls
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 10),
        extra: extra.trim(),
      };

      const saveRes = await saveBriefing({
        data: {
          projectId,
          businessName: businessName.trim().slice(0, 200),
          businessSegment: businessSegment.trim().slice(0, 200),
          briefing,
        },
      });
      if (!saveRes.ok) throw new Error(saveRes.error ?? "Falha ao salvar briefing");

      navigate({ to: "/dev/checkout/$projectId", params: { projectId } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha inesperada";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] w-full px-5 md:px-10 py-12 md:py-16">
        <nav className="text-xs text-ink-soft mb-4">
          <Link to="/dev" className="hover:text-ink">Flaro Dev</Link> <span className="mx-1">/</span> Novo site
        </nav>

        <h1 className="editorial-headline text-4xl md:text-6xl text-ink">Criar novo site</h1>
        <p className="mt-3 text-ink-soft max-w-2xl">
          Em três passos: escolha um modelo, escolha um plano e nos conte o essencial do seu negócio. Depois disso, pagamento e produção começam.
        </p>

        {/* Stepper */}
        <ol className="mt-8 flex items-center gap-3 text-xs tracking-wide text-ink-soft">
          {(["template", "plan", "briefing"] as Step[]).map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${step === s || (i < (["template","plan","briefing"] as Step[]).indexOf(step)) ? "bg-ink text-paper" : "bg-muted text-ink-soft"}`}>{i + 1}</span>
              <span className={step === s ? "text-ink" : ""}>
                {s === "template" ? "Modelo" : s === "plan" ? "Plano" : "Negócio"}
              </span>
              {i < 2 && <span className="h-px w-6 bg-border mx-2" />}
            </li>
          ))}
        </ol>

        {/* Step 1 — Template */}
        {step === "template" && (
          <section className="mt-10">
            <div className="grid md:grid-cols-2 gap-5">
              {DEV_TEMPLATES.map((t) => {
                const selected = templateSlug === t.slug;
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => { setTemplateSlug(t.slug); setPlanSlug(t.recommendedPlan); }}
                    className={`text-left rounded-3xl border p-6 transition-all ${selected ? "border-ink shadow-lg" : "border-border hover:border-ink/40"}`}
                  >
                    <div className="text-xs tracking-wide text-ink-soft">{t.segment}</div>
                    <div className="mt-1 font-display font-black text-2xl text-ink">{t.name}</div>
                    <p className="mt-2 text-sm text-ink-soft">{t.description}</p>
                    <div className="mt-3 text-xs text-ink-soft">Inclui: {t.sections.slice(0, 4).join(", ")}…</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!templateSlug}
                onClick={() => setStep("plan")}
                className="inline-flex h-12 px-6 items-center rounded-2xl bg-ink text-paper font-semibold disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </section>
        )}

        {/* Step 2 — Plan */}
        {step === "plan" && (
          <section className="mt-10">
            {template && (
              <div className="mb-6 text-sm text-ink-soft">
                Modelo: <strong className="text-ink">{template.name}</strong> — recomendamos o plano <strong className="text-ink">{getDevPlan(template.recommendedPlan)?.name}</strong>.
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEV_PLANS.map((p) => {
                const selected = planSlug === p.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setPlanSlug(p.slug)}
                    className={`text-left rounded-3xl border p-5 transition-all ${selected ? "border-ink shadow-lg" : "border-border hover:border-ink/40"}`}
                  >
                    <div className="font-display font-black text-xl text-ink">{p.name}</div>
                    <p className="mt-1 text-xs text-ink-soft min-h-[36px]">{p.tagline}</p>
                    <div className="mt-3 text-sm">
                      <div className="font-semibold text-ink">{formatBRL(p.activationPrice)} <span className="text-xs font-normal text-ink-soft">ativação</span></div>
                      <div className="text-ink-soft text-xs mt-1">+ {formatBRL(p.monthlyPrice)}/mês</div>
                    </div>
                    <div className="mt-3 text-[11px] text-ink-soft">{p.monthlyChangeCredits} alterações/mês</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => setStep("template")} className="text-sm text-ink-soft hover:text-ink">← Voltar</button>
              <button
                type="button"
                disabled={!planSlug}
                onClick={() => setStep("briefing")}
                className="inline-flex h-12 px-6 items-center rounded-2xl bg-ink text-paper font-semibold disabled:opacity-50"
              >
                Continuar para briefing
              </button>
            </div>
          </section>
        )}

        {/* Step 3 — Briefing */}
        {step === "briefing" && (
          <section className="mt-10 grid lg:grid-cols-3 gap-8">
            <form
              className="lg:col-span-2 space-y-5"
              onSubmit={(e) => { e.preventDefault(); handleContinue(); }}
            >
              <Field label="Nome do negócio *">
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required maxLength={200} className="input" placeholder="Ex: Clínica Vida Plena" />
              </Field>
              <Field label="Segmento">
                <input value={businessSegment} onChange={(e) => setBusinessSegment(e.target.value)} maxLength={200} className="input" placeholder="Ex: Clínica de estética" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="WhatsApp">
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={40} className="input" placeholder="(11) 99999-9999" />
                </Field>
                <Field label="Cidade / região">
                  <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} className="input" placeholder="São Paulo, SP" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Paleta / cores preferidas">
                  <input value={colors} onChange={(e) => setColors(e.target.value)} maxLength={200} className="input" placeholder="Verde escuro e branco" />
                </Field>
                <Field label="Tom da comunicação">
                  <input value={tone} onChange={(e) => setTone(e.target.value)} maxLength={200} className="input" placeholder="Profissional e acolhedor" />
                </Field>
              </div>
              <Field label="Oferta principal ou diferencial">
                <textarea value={offer} onChange={(e) => setOffer(e.target.value)} maxLength={1500} rows={3} className="input" placeholder="Ex: Primeira avaliação grátis, atendimento no mesmo dia…" />
              </Field>
              <Field label="Sites de referência (URLs separadas por vírgula)">
                <input value={referenceUrls} onChange={(e) => setReferenceUrls(e.target.value)} maxLength={1000} className="input" placeholder="https://..., https://..." />
              </Field>
              <Field label="Outras informações importantes">
                <textarea value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={3000} rows={4} className="input" placeholder="Horários, endereço, depoimentos, fotos…" />
              </Field>

              <div className="flex items-center justify-between pt-4">
                <button type="button" onClick={() => setStep("plan")} className="text-sm text-ink-soft hover:text-ink">← Voltar</button>
                <button
                  type="submit"
                  disabled={submitting || !templateSlug || !planSlug}
                  className="inline-flex h-12 px-6 items-center rounded-2xl bg-ink text-paper font-semibold disabled:opacity-60"
                >
                  {submitting ? "Salvando…" : "Salvar e ir para pagamento"}
                </button>
              </div>
            </form>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-muted/30 p-6 sticky top-28">
                <div className="text-xs tracking-wide text-ink-soft">Resumo</div>
                <div className="mt-2 font-display font-black text-xl text-ink">{template?.name}</div>
                <div className="text-sm text-ink-soft mt-1">Plano {plan?.name}</div>
                {plan && (
                  <div className="mt-4 text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-ink-soft">Ativação</span><span className="text-ink font-medium">{formatBRL(plan.activationPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-soft">Mensalidade</span><span className="text-ink font-medium">{formatBRL(plan.monthlyPrice)}/mês</span></div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold">
                      <span className="text-ink-soft">Total hoje</span>
                      <span className="text-ink">{formatBRL(plan.activationPrice + plan.monthlyPrice)}</span>
                    </div>
                  </div>
                )}
                <p className="mt-4 text-[11px] text-ink-soft">Você pode revisar tudo antes de pagar.</p>
              </div>
            </aside>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs tracking-wide text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
