import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_TEMPLATES } from "@/lib/dev/templates";
import { DEV_PLANS, formatBRL } from "@/lib/dev/plans";
import { TemplateCover } from "@/components/dev/TemplateCover";

export const Route = createFileRoute("/dev/")({
  component: DevLanding,
  head: () => ({
    meta: [
      { title: "Flaro Dev — Crie um site profissional com IA" },
      { name: "description", content: "Descreva seu negócio e receba um site profissional, editável por chat, com créditos a partir do plano grátis." },
    ],
  }),
});

const FAQ_ITEMS = [
  { q: "Como funcionam os créditos?", a: "Cada novo site consome 5 créditos. Cada edição por IA consome de 1 a 3 créditos conforme a complexidade. Você começa com 10 grátis." },
  { q: "Posso publicar em domínio próprio?", a: "Sim, em planos Pro e Scale. No plano grátis e Starter o site fica em um subdomínio filro.site." },
  { q: "Posso editar tudo depois?", a: "Sim — por chat dentro do projeto ou pelo editor manual. Todas as edições ficam versionadas." },
  { q: "Os modelos são fixos?", a: "Não. Os modelos são o ponto de partida — você customiza cores, conteúdo, seções e estilo conversando com a IA." },
];

function DevLanding() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  function start() {
    const seed = prompt.trim();
    navigate({ to: "/dev/novo", search: seed ? { prompt: seed } : {} });
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full blur-3xl opacity-50"
               style={{ background: "radial-gradient(circle, var(--lime), transparent 60%)" }} />
          <div className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full blur-3xl opacity-45"
               style={{ background: "radial-gradient(circle, var(--flame), transparent 60%)" }} />
        </div>

        <div className="mx-auto max-w-[1200px] px-5 md:px-10 pt-16 md:pt-24 pb-12 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 h-8 rounded-full border border-border bg-paper/70 backdrop-blur text-xs font-semibold text-ink-soft"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-flame animate-pulse" />
            Flaro Dev · sites gerados por IA
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="editorial-headline mt-5 text-5xl md:text-7xl leading-[0.95] text-ink"
          >
            Descreva sua ideia.<br />
            <span className="text-flame italic">Receba um site pronto.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 mx-auto max-w-2xl text-base md:text-lg text-ink-soft"
          >
            Conte o que você faz e seu site aparece em segundos — editorial, responsivo e editável por conversa.
          </motion.p>

          {/* Prompt input */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-8 mx-auto max-w-2xl"
          >
            <div className="relative rounded-3xl bg-paper border border-border shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] p-2 pl-4 flex items-end gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) start(); }}
                rows={2}
                maxLength={500}
                placeholder="Ex: clínica de estética em São Paulo, com agendamento por WhatsApp e tom acolhedor"
                className="flex-1 resize-none bg-transparent outline-none text-sm md:text-base text-ink placeholder:text-ink-soft/70 py-3"
              />
              <button
                onClick={start}
                aria-label="Começar"
                className="shrink-0 h-11 w-11 rounded-2xl bg-ink text-paper grid place-items-center transition hover:scale-105 active:scale-95"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-soft">
              {["Restaurante com cardápio", "Clínica local", "Portfólio profissional", "Loja de bairro"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-3 h-8 rounded-full border border-border bg-paper hover:bg-muted transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 text-xs text-ink-soft"
          >
            10 créditos grátis ao criar a conta · sem cartão
          </motion.div>
        </div>
      </section>

      {/* ============ TEMPLATES ============ */}
      <section className="mx-auto max-w-[1280px] w-full px-5 md:px-10 py-16 md:py-24">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-soft">Modelos</div>
            <h2 className="editorial-headline mt-2 text-3xl md:text-5xl text-ink">Comece de um modelo</h2>
            <p className="mt-2 text-ink-soft max-w-xl text-sm md:text-base">
              Estruturas profissionais por segmento. Você escolhe um e converte em seu site editando por chat.
            </p>
          </div>
          <Link to="/dev/modelos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-flame transition">
            Ver todos os modelos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {DEV_TEMPLATES.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
            >
              <Link
                to="/dev/modelos/$slug"
                params={{ slug: t.slug }}
                className="group block rounded-3xl border border-border bg-paper overflow-hidden hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.35)] transition"
              >
                <div className="relative overflow-hidden">
                  <TemplateCover src={t.coverImage} name={t.name} previewRoute={t.previewRoute} />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition" />
                </div>
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-widest text-ink-soft">{t.segment}</div>
                  <div className="mt-1 font-display font-black text-lg text-ink">{t.name}</div>
                  <p className="mt-1 text-xs text-ink-soft line-clamp-2">{t.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-flame">
                    Usar este modelo <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-16 md:py-24">
          <div className="text-xs uppercase tracking-widest text-paper/60">Como funciona</div>
          <h2 className="editorial-headline mt-2 text-3xl md:text-5xl">Da ideia ao site em três passos</h2>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Descreva", d: "Conte o que você faz, para quem e o tom desejado." },
              { n: "02", t: "Gere", d: "A IA monta um site editorial completo a partir de um modelo." },
              { n: "03", t: "Edite por chat", d: "Peça alterações dentro do projeto — texto, cores, seções." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl border border-paper/15 p-7 hover:border-lime/60 transition"
              >
                <div className="editorial-headline text-6xl text-paper/30">{s.n}</div>
                <div className="mt-4 font-display font-black text-2xl">{s.t}</div>
                <p className="mt-2 text-paper/70 text-sm">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PLANS ============ */}
      <section className="mx-auto max-w-[1200px] w-full px-5 md:px-10 py-16 md:py-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-ink-soft">Planos</div>
          <h2 className="editorial-headline mt-2 text-3xl md:text-5xl text-ink">Créditos para criar à vontade</h2>
          <p className="mt-2 text-ink-soft max-w-xl mx-auto">Cada novo site = 5 créditos. Cada edição IA = 1 a 3.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {DEV_PLANS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className={`rounded-3xl p-7 border ${p.highlight ? "bg-ink text-paper border-ink shadow-2xl scale-[1.02]" : "bg-paper border-border"}`}
            >
              {p.highlight && (
                <div className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full bg-lime text-ink text-[10px] font-bold uppercase tracking-widest">Mais escolhido</div>
              )}
              <div className={`mt-3 font-display font-black text-2xl ${p.highlight ? "text-paper" : "text-ink"}`}>{p.name}</div>
              <p className={`mt-1 text-sm ${p.highlight ? "text-paper/70" : "text-ink-soft"}`}>{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <div className={`editorial-headline text-5xl ${p.highlight ? "text-paper" : "text-ink"}`}>{formatBRL(p.monthlyPrice)}</div>
                <div className={`text-xs ${p.highlight ? "text-paper/60" : "text-ink-soft"}`}>/mês</div>
              </div>
              <div className={`mt-1 text-xs font-semibold ${p.highlight ? "text-lime" : "text-flame"}`}>{p.monthlyCredits} créditos/mês</div>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${p.highlight ? "text-paper/85" : "text-ink"}`}>
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlight ? "text-lime" : "text-flame"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/dev/precos"
                className={`mt-7 block text-center h-11 leading-[44px] rounded-xl font-semibold text-sm transition ${p.highlight ? "bg-lime text-ink hover:opacity-90" : "bg-ink text-paper hover:opacity-90"}`}
              >
                Escolher {p.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="mx-auto max-w-[900px] w-full px-5 md:px-10 py-16 md:py-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-ink-soft">Dúvidas</div>
          <h2 className="editorial-headline mt-2 text-3xl md:text-5xl text-ink">Perguntas frequentes</h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FAQRow key={i} {...item} />
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="px-5 md:px-10 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px] rounded-[2.5rem] bg-ink text-paper p-10 md:p-16 text-center relative overflow-hidden">
          <div aria-hidden className="absolute -top-20 -right-20 h-80 w-80 rounded-full blur-3xl opacity-30"
               style={{ background: "radial-gradient(circle, var(--flame), transparent 60%)" }} />
          <div aria-hidden className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full blur-3xl opacity-30"
               style={{ background: "radial-gradient(circle, var(--lime), transparent 60%)" }} />
          <h2 className="editorial-headline text-4xl md:text-6xl">Crie seu primeiro site agora</h2>
          <p className="mt-3 text-paper/70 max-w-lg mx-auto">10 créditos grátis. Sem cartão. Em minutos.</p>
          <Link
            to="/dev/novo"
            className="mt-8 inline-flex items-center gap-2 h-12 px-7 rounded-full bg-flame text-paper font-semibold hover:scale-105 transition"
          >
            <Plus className="h-4 w-4" /> Começar grátis
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FAQRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-paper overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition"
      >
        <span className="font-semibold text-ink text-sm md:text-base">{q}</span>
        <span className={`h-7 w-7 grid place-items-center rounded-full bg-muted text-ink transition ${open ? "rotate-45" : ""}`}>
          <Plus className="h-4 w-4" />
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 text-sm text-ink-soft">{a}</div>
      </motion.div>
    </div>
  );
}
