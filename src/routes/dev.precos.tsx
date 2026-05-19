import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_PLANS, formatBRL, CREDIT_COSTS, FREE_SIGNUP_CREDITS } from "@/lib/dev/plans";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createDevPlanCheckout, createDevPackCheckout, listDevCreditPacks } from "@/lib/dev/billing.functions";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dev/precos")({
  component: DevPrecos,
  loader: async () => listDevCreditPacks(),
  head: () => ({
    meta: [
      { title: "Planos Flaro Dev · Créditos para gerar e editar com IA" },
      { name: "description", content: `Comece grátis com ${FREE_SIGNUP_CREDITS} créditos. Planos a partir de R$47/mês com créditos recorrentes para criar e iterar sites com IA.` },
      { property: "og:title", content: "Planos Flaro Dev · Filro" },
      { property: "og:description", content: "Modelo por créditos: 5 para gerar um site, 1 para editar com IA. Comece grátis." },
      { property: "og:url", content: "https://setup.filro.site/dev/precos" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev/precos" }],
  }),
});

const FAQ = [
  { q: "Como funcionam os créditos?", a: `Cada ação na plataforma consome créditos: gerar um site novo custa ${CREDIT_COSTS.generateSite} créditos e editar com IA custa ${CREDIT_COSTS.aiEdit} por edição. Editar manualmente é grátis.` },
  { q: "E se acabarem os créditos?", a: "Você pode assinar um plano mensal (recarga automática) ou comprar um pacote avulso quando precisar." },
  { q: "Posso testar de graça?", a: `Sim. Ao criar sua conta você ganha ${FREE_SIGNUP_CREDITS} créditos — o suficiente para gerar 2 sites e fazer algumas edições.` },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Os créditos do mês corrente permanecem até o fim do ciclo." },
];

function DevPrecos() {
  const { packs } = Route.useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const planCheckout = useServerFn(createDevPlanCheckout);
  const packCheckout = useServerFn(createDevPackCheckout);

  const [loading, setLoading] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  async function startPlanCheckout(planSlug: string) {
    if (!isAuthenticated) { navigate({ to: "/login" }); return; }
    setLoading(planSlug);
    try {
      const res = await planCheckout({
        data: { planSlug, returnOrigin: window.location.origin, environment: getStripeEnvironment() },
      });
      if (res.error || !res.clientSecret) { toast.error(res.error || "Falha ao iniciar checkout"); return; }
      setClientSecret(res.clientSecret);
    } finally { setLoading(null); }
  }

  async function startPackCheckout(packSlug: string) {
    if (!isAuthenticated) { navigate({ to: "/login" }); return; }
    setLoading(packSlug);
    try {
      const res = await packCheckout({
        data: { packSlug, returnOrigin: window.location.origin, environment: getStripeEnvironment() },
      });
      if (res.error || !res.clientSecret) { toast.error(res.error || "Falha ao iniciar checkout"); return; }
      setClientSecret(res.clientSecret);
    } finally { setLoading(null); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-10">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Flaro Dev · Planos
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-4xl">
            Pague apenas pelo que <span className="lime-mark">usa de IA</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty text-lg">
            Crie sites, edite por IA e publique em segundos. Assine para receber créditos todo mês ou compre pacotes avulsos quando precisar.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-ink-soft bg-muted/50 px-4 h-11 rounded-full">
            <Zap className="h-4 w-4 text-flame" />
            Gerar site: <strong className="text-ink">{CREDIT_COSTS.generateSite} créditos</strong> · Editar com IA: <strong className="text-ink">{CREDIT_COSTS.aiEdit} crédito</strong>
          </div>
        </section>

        {/* PLANOS ASSINATURA */}
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Plano free */}
            <div className="rounded-2xl border border-border p-6 bg-paper flex flex-col">
              <div className="text-xl font-semibold text-ink">Grátis</div>
              <p className="mt-1 text-sm text-ink-soft min-h-[40px]">Comece agora, sem cartão.</p>
              <div className="mt-5">
                <div className="text-3xl font-bold text-ink">R$0</div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Zap className="h-4 w-4 text-flame" /> {FREE_SIGNUP_CREDITS} créditos ao se cadastrar
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-ink flex-1">
                {[`${FREE_SIGNUP_CREDITS} créditos ao criar a conta`, "1 site publicado em {seu-slug}.filro.site", "Editor manual ilimitado", "Editor com IA"].map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-flame shrink-0 mt-0.5" /> <span>{f}</span></li>
                ))}
              </ul>
              <Link to="/dev/novo" className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold hover:scale-[1.02] transition-transform">
                Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {DEV_PLANS.map((p) => (
              <div key={p.slug} className={`rounded-2xl border p-6 bg-paper flex flex-col ${p.highlight ? "border-ink shadow-elegant" : "border-border"}`}>
                {p.highlight && (
                  <span className="self-start text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-ink text-paper mb-3">Mais escolhido</span>
                )}
                <div className="text-xl font-semibold text-ink">{p.name}</div>
                <p className="mt-1 text-sm text-ink-soft min-h-[40px]">{p.tagline}</p>
                <div className="mt-5">
                  <div className="text-3xl font-bold text-ink">{formatBRL(p.monthlyPrice)}<span className="text-sm font-normal text-ink-soft">/mês</span></div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Zap className="h-4 w-4 text-flame" /> {p.monthlyCredits} créditos/mês
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-ink flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-flame shrink-0 mt-0.5" /> <span>{f}</span></li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-ink-soft"><span className="font-semibold text-ink">Para:</span> {p.bestFor}</div>
                <button
                  type="button"
                  disabled={loading === p.slug}
                  onClick={() => startPlanCheckout(p.slug)}
                  className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-60"
                >
                  {loading === p.slug ? "Carregando..." : <>Assinar {p.name} <ArrowRight className="ml-2 h-4 w-4" /></>}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PACOTES AVULSOS */}
        {packs.length > 0 && (
          <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
            <span className="text-xs uppercase tracking-widest text-ink-soft">Pacotes avulsos</span>
            <h2 className="mt-3 editorial-headline text-3xl md:text-5xl text-ink max-w-3xl">Sem assinatura? Compre só os créditos que precisar.</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-5">
              {packs.map((pack: { slug: string; name: string; credits: number; price: number }) => (
                <div key={pack.slug} className="rounded-2xl border border-border p-6 bg-paper">
                  <div className="text-lg font-semibold text-ink">{pack.name}</div>
                  <div className="mt-3 text-3xl font-bold text-ink">{formatBRL(pack.price)}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Zap className="h-4 w-4 text-flame" /> {pack.credits} créditos
                  </div>
                  <button
                    type="button"
                    disabled={loading === pack.slug}
                    onClick={() => startPackCheckout(pack.slug)}
                    className="mt-5 w-full inline-flex items-center justify-center h-11 px-5 rounded-2xl border border-ink text-ink text-sm font-semibold hover:bg-ink hover:text-paper transition-colors disabled:opacity-60"
                  >
                    {loading === pack.slug ? "Carregando..." : "Comprar agora"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1100px] px-5 md:px-10 py-16">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Perguntas frequentes</span>
          <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-3xl">Como funcionam os créditos</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-paper p-6">
                <div className="font-semibold text-ink">{f.q}</div>
                <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />

      {clientSecret && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-paper rounded-2xl w-full max-w-2xl p-2 relative">
            <button
              type="button"
              onClick={() => setClientSecret(null)}
              className="absolute -top-3 -right-3 z-10 h-9 w-9 rounded-full bg-ink text-paper grid place-items-center shadow-lg"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret: async () => clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}
    </div>
  );
}
