import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Plus, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DEV_TEMPLATES, type DevTemplate } from "@/lib/dev/templates";
import { DEV_PLANS, formatBRL } from "@/lib/dev/plans";
import { TemplateCover } from "@/components/dev/TemplateCover";
import { TemplateStartModal } from "@/components/dev/TemplateStartModal";
import { useAuth } from "@/lib/auth";
import { listMyDevProjects } from "@/lib/dev/dev.functions";

export const Route = createFileRoute("/dev/")({
  component: DevLanding,
  head: () => ({
    meta: [
      { title: "Flaro Dev — Crie um site profissional com IA" },
      { name: "description", content: "Descreva seu negócio e receba um site profissional, editável por chat. Comece grátis." },
    ],
  }),
});

const FAQ_ITEMS = [
  { q: "Como funcionam os créditos?", a: "Cada novo site consome 5 créditos. Cada edição por IA consome de 1 a 3 créditos conforme a complexidade. Você começa com 10 grátis." },
  { q: "Posso publicar em domínio próprio?", a: "Sim, nos planos Pro e Scale. No plano Starter o site fica em um subdomínio filro.site." },
  { q: "Posso editar tudo depois?", a: "Sim — por chat dentro do projeto ou pelo editor manual. Todas as edições ficam versionadas." },
  { q: "Os modelos são fixos?", a: "Não. Os modelos são o ponto de partida — você customiza tudo conversando com a IA." },
];

function DevLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [modalTpl, setModalTpl] = useState<DevTemplate | null>(null);

  const fetchProjects = useServerFn(listMyDevProjects);
  const projectsQuery = useQuery({
    queryKey: ["dev", "my-projects"],
    queryFn: () => fetchProjects(),
    enabled: !!user,
  });

  function start() {
    const seed = prompt.trim();
    navigate({ to: "/dev/novo", search: seed ? { prompt: seed } : {} });
  }

  const projects = projectsQuery.data?.projects ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />

      {/* ============ HERO — Plus-style card ============ */}
      <section className="mx-auto max-w-[1200px] w-full px-5 md:px-10 pt-8 md:pt-14 pb-10 md:pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[3rem] p-8 md:p-16 overflow-hidden bg-paper text-ink border border-ink/10"
          style={{ boxShadow: "var(--shadow-pop)" }}
        >
          {/* Floating shapes */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0, rotate: 12 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-24 -top-24 h-[380px] w-[300px] rounded-[3rem] bg-lime pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-16 top-16 h-[280px] w-[200px] rounded-[3rem] bg-flame pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-10 left-24 h-[180px] w-[300px] rounded-[3rem] bg-ink pointer-events-none hidden md:block"
          />
          <div aria-hidden className="absolute right-10 bottom-10 h-6 w-6 rounded-full bg-paper ring-2 ring-ink pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/70">
              <span className="h-1.5 w-6 bg-flame" /> Flaro Dev
            </span>
            <h1 className="editorial-headline mt-6 text-5xl md:text-7xl leading-[0.95]">
              Descreva sua ideia.<br />
              <span className="lime-mark">Receba um site pronto.</span>
            </h1>
            <p className="mt-6 text-ink-soft max-w-xl">
              Conte o que você faz e a IA monta um site editorial completo em segundos — editável por conversa, hospedado no Flaro.
            </p>

            {/* Prompt input */}
            <div className="mt-8 max-w-2xl">
              <div className="relative rounded-3xl bg-paper border border-ink/15 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] p-2 pl-4 flex items-end gap-2">
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
              <div className="mt-4 flex flex-wrap gap-2">
                {["Restaurante com cardápio", "Clínica local", "Portfólio profissional", "Loja de bairro"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    className="px-3 h-8 rounded-full bg-ink/5 hover:bg-ink/10 text-ink text-xs font-medium transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-5 text-xs text-ink-soft">
                10 créditos grátis ao criar a conta · sem cartão
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ USER PROJECTS ============ */}
      {user && projects.length > 0 && (
        <section className="mx-auto max-w-[1200px] w-full px-5 md:px-10 pb-12 md:pb-16">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-soft">Seus projetos</div>
              <h2 className="editorial-headline mt-2 text-3xl md:text-4xl text-ink">Continuar de onde parou</h2>
            </div>
            <Link to="/dev/novo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-flame transition">
              <Plus className="h-4 w-4" /> Novo projeto
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((p: { id: string; business_name: string | null; template_slug: string | null; status: string | null; updated_at: string | null; published_url: string | null }, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Link
                  to="/dev/projeto/$projectId"
                  params={{ projectId: p.id }}
                  className="group block rounded-3xl border border-border bg-paper p-5 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-ink-soft">{p.template_slug ?? "projeto"}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "published" ? "bg-lime text-ink" :
                      p.status === "draft" ? "bg-muted text-ink-soft" :
                      "bg-azure/20 text-ink"
                    }`}>
                      {p.status === "published" ? "Publicado" : p.status === "draft" ? "Rascunho" : (p.status ?? "—")}
                    </span>
                  </div>
                  <div className="mt-3 font-display font-black text-lg text-ink truncate">
                    {p.business_name ?? "Sem nome"}
                  </div>
                  <div className="mt-1 text-xs text-ink-soft">
                    {p.updated_at ? `Atualizado ${new Date(p.updated_at).toLocaleDateString("pt-BR")}` : "—"}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-flame font-semibold group-hover:gap-1.5 transition-all">
                      Abrir <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    {p.published_url && (
                      <a
                        href={p.published_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                      >
                        Visitar <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ============ TEMPLATES ============ */}
      <section className="mx-auto max-w-[1280px] w-full px-5 md:px-10 py-12 md:py-20">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-soft">Modelos</div>
            <h2 className="editorial-headline mt-2 text-3xl md:text-5xl text-ink">Comece de um modelo</h2>
            <p className="mt-2 text-ink-soft max-w-xl text-sm md:text-base">
              Estruturas profissionais por segmento. Escolha um e converte em seu site editando por chat.
            </p>
          </div>
          <Link to="/dev/modelos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-flame transition">
            Ver todos <ArrowRight className="h-4 w-4" />
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

      {/* ============ PLANS — Plus-style ============ */}
      <section className="mx-auto max-w-[1200px] w-full px-5 md:px-10 py-12 md:py-20">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-ink-soft">Planos</div>
          <h2 className="editorial-headline mt-2 text-3xl md:text-5xl text-ink">Créditos para criar à vontade</h2>
          <p className="mt-3 text-ink-soft max-w-xl mx-auto">Cada novo site = 5 créditos. Cada edição IA = 1 a 3.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {DEV_PLANS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-[2.5rem] p-8 overflow-hidden ${
                p.highlight
                  ? "bg-paper border border-ink/10"
                  : "bg-paper border border-border"
              }`}
              style={{ boxShadow: p.highlight ? "var(--shadow-pop)" : "var(--shadow-card)" }}
            >
              {p.highlight && (
                <>
                  <div aria-hidden className="absolute -left-12 -top-12 h-40 w-32 rounded-[2rem] bg-lime rotate-12 pointer-events-none" />
                  <div aria-hidden className="absolute -right-8 top-8 h-24 w-20 rounded-[1.5rem] bg-flame -rotate-6 pointer-events-none" />
                </>
              )}
              <div className="relative z-10">
                {p.highlight && (
                  <div className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full bg-ink text-paper text-[10px] font-bold uppercase tracking-widest">
                    Mais escolhido
                  </div>
                )}
                <div className="mt-3 font-display font-black text-3xl text-ink">{p.name}</div>
                <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <div className="editorial-headline text-5xl text-ink">{formatBRL(p.monthlyPrice)}</div>
                  <div className="text-xs text-ink-soft">/mês</div>
                </div>
                <div className="mt-1 text-xs font-semibold text-flame">{p.monthlyCredits} créditos/mês</div>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-lime grid place-items-center flex-none">
                        <Check className="h-3 w-3 text-ink" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/dev/precos"
                  className={`mt-8 block text-center h-12 leading-[48px] rounded-2xl font-semibold text-sm transition hover:scale-[1.02] ${
                    p.highlight ? "bg-ink text-paper" : "bg-ink/5 text-ink hover:bg-ink/10"
                  }`}
                >
                  Escolher {p.name}
                </Link>
              </div>
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
