import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Sparkles, Workflow, Globe, Wrench, MessageCircle, FileQuestion, Rocket, Palette, CreditCard, RefreshCw, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  head: () => ({ meta: [
    { title: "Documentação · Filro" },
    { name: "description", content: "Como funciona a Filro: ativação em 24h, o que enviar, dúvidas frequentes e detalhes técnicos." },
  ]}),
});

const sections = [
  { id: "comecando", label: "Começando", icon: Rocket },
  { id: "fluxo", label: "Fluxo de ativação", icon: Workflow },
  { id: "envio", label: "O que enviar", icon: Palette },
  { id: "pagamento", label: "Pagamento e planos", icon: CreditCard },
  { id: "tecnico", label: "Detalhes técnicos", icon: Wrench },
  { id: "dominio", label: "Domínio e hospedagem", icon: Globe },
  { id: "manutencao", label: "Manutenção e edições", icon: RefreshCw },
  { id: "metricas", label: "Métricas e SEO", icon: BarChart3 },
  { id: "faq", label: "FAQ", icon: FileQuestion },
  { id: "suporte", label: "Suporte", icon: MessageCircle },
] as const;

function DocsPage() {
  const [active, setActive] = useState<string>("comecando");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-[1300px] w-full px-5 md:px-10 py-12 md:py-16 flex-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft"><span className="h-1.5 w-6 bg-flame" /> Documentação</span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink">Tudo que você precisa saber.</h1>
          <p className="mt-4 max-w-2xl text-ink-soft">Guia completo: do cadastro à entrega em 24h, passando pelo que enviar, como funciona por baixo dos panos e como pedir suporte.</p>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[260px_1fr] gap-10">
          <nav className="lg:sticky lg:top-28 h-fit space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active === s.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-muted"}`}>
                  <Icon className="h-4 w-4" /> {s.label}
                </a>
              );
            })}
          </nav>

          <article className="prose-docs space-y-16">
            <Section id="comecando" title="Começando" icon={Rocket}>
              <p>Filro entrega presença digital pronta para empresas locais. Ativação acontece em <strong>até 24 horas</strong> após o pagamento e o envio das informações do negócio.</p>
              <ol>
                <li><strong>Escolha um plano</strong> na home (Essencial, Avançado ou Premium).</li>
                <li><strong>Crie sua conta</strong> e finalize o pagamento (Stripe, seguro).</li>
                <li><strong>Envie as informações do negócio</strong> — identidade, contato, catálogo e referência de modelo.</li>
                <li>Em até 24h, sua presença digital está no ar e você recebe o link no WhatsApp.</li>
              </ol>
              <Card><Clock className="h-5 w-5 text-flame" /><div><strong>Garantia 24h.</strong> Se passarmos do prazo, mês de mensalidade por nossa conta.</div></Card>
            </Section>

            <Section id="fluxo" title="Fluxo de ativação" icon={Workflow}>
              <ul>
                <li><strong>Confirmação de pagamento</strong> · webhook automático libera o formulário em segundos.</li>
                <li><strong>Coleta de informações</strong> · você preenche em ~10 minutos. Tudo é editável depois.</li>
                <li><strong>Produção</strong> · time interno monta a página com base no modelo escolhido + sua identidade.</li>
                <li><strong>QA visual</strong> · revisamos cada tela em desktop e mobile.</li>
                <li><strong>Publicação</strong> · domínio temporário <code>.filro.app</code> imediato; domínio próprio em 24-72h.</li>
              </ul>
            </Section>

            <Section id="envio" title="O que enviar (e como)" icon={Palette}>
              <p>Quanto mais detalhes, mais rápido entregamos. Mínimo necessário:</p>
              <ul>
                <li><strong>Identidade:</strong> nome, segmento, descrição curta, cores da marca, logo (PNG ou SVG ideal).</li>
                <li><strong>Contato:</strong> WhatsApp com DDD, Instagram, endereço, horário.</li>
                <li><strong>Catálogo:</strong> produtos ou serviços com nome, preço, descrição e imagem (jpg/png, ~1MB).</li>
                <li><strong>Promoções:</strong> cupons, combos, descontos ativos.</li>
                <li><strong>Modelo:</strong> link de referência, arquivo (brief, PDF, imagem) ou descrição livre.</li>
              </ul>
            </Section>

            <Section id="tecnico" title="Detalhes técnicos" icon={Wrench}>
              <h3>Stack</h3>
              <ul>
                <li>Frontend: React 19 + TanStack Start v1 (SSR + Edge runtime).</li>
                <li>Backend: Lovable Cloud (Postgres + Auth + Storage + Realtime).</li>
                <li>Pagamentos: Stripe via Lovable Connector Gateway, com Embedded Checkout.</li>
                <li>Hospedagem: Cloudflare Workers Edge, com cache global.</li>
              </ul>
              <h3>Performance</h3>
              <ul>
                <li>Lighthouse 95+ em todas as categorias.</li>
                <li>Imagens otimizadas automaticamente (WebP/AVIF).</li>
                <li>SSR para SEO e first-paint sub-segundo.</li>
              </ul>
              <h3>Segurança</h3>
              <ul>
                <li>RLS (Row-Level Security) ativo em todas as tabelas.</li>
                <li>Roles separados em tabela própria (sem escalonamento de privilégio).</li>
                <li>Webhooks com verificação HMAC.</li>
              </ul>
            </Section>

            <Section id="dominio" title="Domínio e hospedagem" icon={Globe}>
              <p>Sua página fica em <code>seu-negocio.filro.app</code> imediatamente. Para usar domínio próprio:</p>
              <ol>
                <li>Compre o domínio (Registro.br, GoDaddy, Cloudflare).</li>
                <li>Aponte CNAME para <code>cdn.filro.app</code>.</li>
                <li>Avise o time pelo WhatsApp; SSL/HTTPS é provisionado em ~1h.</li>
              </ol>
            </Section>

            <Section id="faq" title="Perguntas frequentes" icon={FileQuestion}>
              <Q q="Posso editar depois?">Sim. Você acessa o painel a qualquer hora e atualiza informações, fotos e promoções.</Q>
              <Q q="Quanto tempo até estar no ar?">Até 24 horas após o envio das informações. Geralmente entregamos em menos.</Q>
              <Q q="Preciso entender de tecnologia?">Não. Você só envia as informações; nosso time monta tudo.</Q>
              <Q q="Posso cancelar?">Sim, a qualquer momento. A ativação não é reembolsável; mensalidade pode ser cancelada com 7 dias de antecedência.</Q>
              <Q q="Vocês fazem cardápio digital?">Sim, é uma das categorias mais pedidas. Plano Avançado em diante.</Q>
              <Q q="Aceita cartão internacional?">Sim, Stripe processa em 135+ moedas.</Q>
            </Section>

            <Section id="suporte" title="Suporte" icon={MessageCircle}>
              <p>Atendimento humano via WhatsApp em horário comercial (9h-18h, seg-sex):</p>
              <p><a href="https://wa.me/5592993561754" className="text-ink underline" target="_blank" rel="noreferrer">+55 92 99356-1754</a></p>
              <p>Para dúvidas legais, veja <Link to="/termos" className="text-ink underline">Termos</Link> e <Link to="/privacidade" className="text-ink underline">Privacidade</Link>.</p>
              <Card><ShieldCheck className="h-5 w-5 text-azure" /><div>SLA: resposta em até 4h úteis. Incidentes críticos em até 1h.</div></Card>
            </Section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof Rocket; children: React.ReactNode }) {
  return (
    <motion.section id={id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="scroll-mt-28">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 grid place-items-center rounded-2xl bg-ink text-paper"><Icon className="h-5 w-5" /></div>
        <h2 className="font-display font-black text-3xl md:text-4xl text-ink">{title}</h2>
      </div>
      <div className="space-y-3 text-ink-soft [&_strong]:text-ink [&_h3]:text-ink [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:space-y-2 [&_ol]:space-y-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-ink leading-relaxed">
        {children}
      </div>
    </motion.section>
  );
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-border py-4 group">
      <summary className="cursor-pointer font-semibold text-ink list-none flex justify-between items-center"><span>{q}</span><Sparkles className="h-4 w-4 text-ink-soft group-open:rotate-180 transition-transform" /></summary>
      <div className="mt-2 text-ink-soft">{children}</div>
    </details>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 p-5 rounded-2xl bg-muted">{children}</div>;
}
