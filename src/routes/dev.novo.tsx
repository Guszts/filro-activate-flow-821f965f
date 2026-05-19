import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { DEV_TEMPLATES, getDevTemplate } from "@/lib/dev/templates";
import { TemplateCover } from "@/components/dev/TemplateCover";
import { generateDevSite } from "@/lib/dev/generator.functions";
import { getMyCredits } from "@/lib/credits/credits.functions";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";

const SearchSchema = z.object({ template: z.string().optional(), prompt: z.string().optional() });

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

type StepId = 1 | 2 | 3 | 4;

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: 1, title: "Modelo", subtitle: "Escolha um ponto de partida" },
  { id: 2, title: "Negócio", subtitle: "Quem é você" },
  { id: 3, title: "Detalhes", subtitle: "Contato e endereço" },
  { id: 4, title: "Revisar", subtitle: "Conferir e gerar" },
];

function NovoProjeto() {
  const { template: tplFromUrl, prompt: promptFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [step, setStep] = useState<StepId>(tplFromUrl ? 2 : 1);
  const [templateSlug, setTemplateSlug] = useState<string | undefined>(tplFromUrl);
  const [businessName, setBusinessName] = useState("");
  const [businessSegment, setBusinessSegment] = useState("");
  const [description, setDescription] = useState(promptFromUrl ?? "");
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
  const enoughCredits = (balance ?? 0) >= 5;

  const stepValid = useMemo<Record<StepId, boolean>>(() => ({
    1: !!templateSlug,
    2: businessName.trim().length >= 2 && description.trim().length >= 10,
    3: true,
    4: !!templateSlug && businessName.trim().length >= 2 && description.trim().length >= 10,
  }), [templateSlug, businessName, description]);

  function goNext() {
    if (!stepValid[step]) {
      if (step === 1) toast.error("Escolha um modelo para continuar.");
      if (step === 2) toast.error("Preencha o nome do negócio e uma descrição (mín. 10 caracteres).");
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as StepId);
  }

  function goPrev() {
    if (step > 1) setStep((s) => (s - 1) as StepId);
  }

  async function handleSubmit() {
    if (!templateSlug) { toast.error("Escolha um modelo."); setStep(1); return; }
    if (!stepValid[2]) { toast.error("Preencha o nome e a descrição do negócio."); setStep(2); return; }
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
          <Link to="/dev" className="hover:text-ink">Flaro Dev</Link> <span className="mx-1">/</span>{" "}
          <Link to="/dev/modelos" className="hover:text-ink">Modelos</Link> <span className="mx-1">/</span> Criar site
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-soft">Etapa {step} de 4</div>
            <h1 className="mt-2 editorial-headline text-4xl md:text-6xl text-ink">{STEPS[step - 1].title}</h1>
            <p className="mt-3 text-ink-soft max-w-2xl">{STEPS[step - 1].subtitle}</p>
          </div>
          {balance !== null && (
            <div className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-border bg-paper text-sm">
              
              <span className="font-bold text-ink">{balance}</span>
              <span className="text-ink-soft">créditos · gera por 5</span>
            </div>
          )}
        </div>

        {/* Stepper */}
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {STEPS.map((s) => {
            const active = s.id === step;
            const done = s.id < step && stepValid[s.id];
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    // Allow jumping back, or forward only if all previous steps valid
                    if (s.id < step) setStep(s.id);
                    else if (s.id > step && STEPS.slice(0, s.id - 1).every((p) => stepValid[p.id])) setStep(s.id);
                  }}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition ${
                    active ? "border-ink bg-ink text-paper" : done ? "border-flame/40 bg-flame/5 text-ink" : "border-border bg-paper text-ink-soft hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider opacity-80">
                    {done ? <Check className="h-3.5 w-3.5" /> : <span>{s.id}</span>}
                    <span>Etapa</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold">{s.title}</div>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* Main step content */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-paper p-6 md:p-8">
            {step === 1 && (
              <section>
                <p className="text-sm text-ink-soft">Escolha o modelo que mais combina com o seu negócio. Você poderá personalizar tudo depois.</p>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {DEV_TEMPLATES.map((t) => {
                    const selected = templateSlug === t.slug;
                    return (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => setTemplateSlug(t.slug)}
                        className={`text-left rounded-2xl border overflow-hidden transition ${selected ? "border-ink shadow-elegant ring-1 ring-ink/10" : "border-border hover:border-ink/40"}`}
                      >
                        <div className="overflow-hidden">
                          <TemplateCover src={t.coverImage} name={t.name} previewRoute={t.previewRoute} />
                        </div>
                        <div className="p-4">
                          <div className="text-[10px] uppercase tracking-wider text-ink-soft">{t.segment}</div>
                          <div className="mt-1 font-semibold text-ink flex items-center gap-2">
                            {t.name}
                            {selected && <Check className="h-4 w-4 text-flame" />}
                          </div>
                          <div className="mt-1 text-xs text-ink-soft line-clamp-2">{t.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="grid gap-4">
                <Field label="Nome do negócio *">
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required maxLength={120} className="input" placeholder="Ex: Padaria Bom Pão" />
                </Field>
                <Field label="Segmento">
                  <input value={businessSegment} onChange={(e) => setBusinessSegment(e.target.value)} maxLength={120} className="input" placeholder="Padaria artesanal" />
                </Field>
                <Field label="Descreva o seu negócio em poucas linhas *">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} maxLength={2000} rows={7} className="input" placeholder="Conte o que você faz, há quanto tempo, o que te diferencia, quem é seu cliente ideal…" />
                  <div className="mt-1 text-[11px] text-ink-soft">{description.length}/2000 · mínimo 10 caracteres</div>
                </Field>
                <Field label="Tom da comunicação">
                  <input value={tone} onChange={(e) => setTone(e.target.value)} maxLength={80} className="input" placeholder="Acolhedor e familiar / direto e profissional…" />
                </Field>
              </section>
            )}

            {step === 3 && (
              <section className="grid sm:grid-cols-2 gap-4">
                <Field label="WhatsApp">
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={20} className="input" placeholder="(11) 99999-9999" />
                </Field>
                <Field label="Cidade">
                  <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className="input" placeholder="São Paulo, SP" />
                </Field>
                <Field label="Endereço do site (opcional)" className="sm:col-span-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-ink-soft">/s/</span>
                    <input
                      value={preferredSlug}
                      onChange={(e) => setPreferredSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      maxLength={40}
                      className="input flex-1"
                      placeholder="padaria-bom-pao"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-ink-soft">Deixe em branco para gerarmos um automaticamente.</div>
                </Field>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-5">
                <p className="text-sm text-ink-soft">Confira os dados antes de gastar seus créditos. Você poderá editar tudo depois pelo chat com IA.</p>
                <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                  <Row label="Modelo" value={template?.name ?? "—"} />
                  <Row label="Segmento" value={template?.segment ?? "—"} />
                  <Row label="Nome do negócio" value={businessName || "—"} />
                  <Row label="Segmento do negócio" value={businessSegment || "—"} />
                  <Row label="WhatsApp" value={whatsapp || "—"} />
                  <Row label="Cidade" value={city || "—"} />
                  <Row label="Tom" value={tone || "—"} />
                  <Row label="Endereço do site" value={preferredSlug ? `/s/${preferredSlug}` : "(gerado automaticamente)"} />
                  <Row label="Descrição" value={description || "—"} multiline />
                </div>
              </section>
            )}

            {/* Step navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={step === 1}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-paper text-ink text-sm font-medium hover:bg-muted disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!stepValid[step]}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-50"
                >
                  Avançar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !enoughCredits || !stepValid[4]}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando…</> : <>Gerar meu site</>}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar — summary */}
          <aside>
            <div className="sticky top-28 rounded-3xl border border-border bg-muted/30 p-6">
              <div className="text-xs uppercase tracking-widest text-ink-soft">Resumo</div>
              {template ? (
                <>
                  <div className="mt-3 rounded-xl overflow-hidden bg-paper border border-border">
                    <TemplateCover src={template.coverImage} name={template.name} previewRoute={template.previewRoute} />
                  </div>
                  <div className="mt-3 font-display font-black text-xl text-ink">{template.name}</div>
                  <p className="mt-1 text-xs text-ink-soft">{template.segment}</p>
                </>
              ) : (
                <div className="mt-3 text-sm text-ink-soft">Escolha um modelo para começar.</div>
              )}

              <div className="mt-5 rounded-2xl bg-paper border border-border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Custo de geração</span>
                  <span className="inline-flex items-center gap-1 font-bold text-ink">5 créditos</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Seu saldo</span>
                  <span className="font-bold text-ink">{balance ?? "…"}</span>
                </div>
                {!enoughCredits && balance !== null && (
                  <Link to="/dev/precos" className="mt-3 block text-center text-xs underline text-flame">
                    Sem créditos suficientes · ver planos
                  </Link>
                )}
              </div>

              <p className="mt-3 text-[11px] text-ink-soft text-center">
                Em até 30s seu site está pronto e publicado.
              </p>
            </div>
          </aside>
        </div>
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

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={multiline ? "" : "flex justify-between gap-4"}>
      <span className="text-xs uppercase tracking-wider text-ink-soft">{label}</span>
      <span className={`text-sm text-ink ${multiline ? "block mt-1 whitespace-pre-wrap" : "text-right max-w-[70%]"}`}>{value}</span>
    </div>
  );
}
