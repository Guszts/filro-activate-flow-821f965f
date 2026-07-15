import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, ChevronDown, Workflow, Globe, Wrench, MessageCircle, FileQuestion, Rocket, Palette, CreditCard, RefreshCw, BarChart3, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  head: () => ({
    meta: [
      { title: "Documentation · Filro" },
      { name: "description", content: "How Filro works: kickoff within 1 business day, what to send, FAQs, and technical details." },
      { property: "og:title", content: "Documentation · Filro" },
      { property: "og:description", content: "How Filro works: kickoff, what to send, and technical details." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://setup.filro.site/docs" },
      { name: "twitter:title", content: "Documentation · Filro" },
      { name: "twitter:description", content: "How the kickoff works, what to send, and FAQs." },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/docs" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://setup.filro.site/" },
          { "@type": "ListItem", position: 2, name: "Documentation", item: "https://setup.filro.site/docs" },
        ],
      }),
    }],
  }),
});

const sections = [
  { id: "comecando", label: "Começando", icon: Rocket },
  { id: "fluxo", label: "Activation flow", icon: Workflow },
  { id: "envio", label: "O que enviar", icon: Palette },
  { id: "pagamento", label: "Payment e planos", icon: CreditCard },
  { id: "tecnico", label: "Details técnicos", icon: Wrench },
  { id: "dominio", label: "Domínio e hospedagem", icon: Globe },
  { id: "manutencao", label: "Maintenance e edições", icon: RefreshCw },
  { id: "metricas", label: "Métricas e SEO", icon: BarChart3 },
  
  { id: "faq", label: "FAQ", icon: FileQuestion },
  { id: "suporte", label: "Support", icon: MessageCircle },
] as const;

function DocsPage() {
  const [active, setActive] = useState<string>("comecando");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-[1300px] w-full px-5 md:px-10 py-12 md:py-16 flex-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft"><span className="h-1.5 w-6 bg-flame" /> Documentation</span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink">Everything you need to know.</h1>
          <p className="mt-4 max-w-2xl text-ink-soft">Guia completo: do cadastro à entrega within 1 business day, passando pelo que enviar, como funciona por baixo dos panos e como pedir suporte.</p>
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
              <p>Filro delivers implementation for growing businesses. Kickoff happens within <strong>one business day</strong> after payment and business info submission. You don't need to be technical — our team builds everything from the info you provide.</p>
              <h3>Pré-requisitos</h3>
              <ul>
                <li>Um e-mail válido (usado para login e notificações).</li>
                <li>WhatsApp ativo (usado para entrega e suporte direto).</li>
                <li>Materiais básicos do negócio: logo (se tiver), fotos, descrições, contato.</li>
              </ul>
              <h3>Passo a passo</h3>
              <ol>
                <li><strong>Escolha um plano</strong> na home (Essencial, Avançado ou Premium).</li>
                <li><strong>Create your account</strong> with email/password or Google sign-in.</li>
                <li><strong>Finalize o pagamento</strong> via Stripe (cartão, débito ou Pix).</li>
                <li><strong>Envie as informações do negócio</strong> — identidade, contato, catálogo e referência de modelo.</li>
                <li>Em estimativa de até 24h após envio completo das informações, sua presença digital fica no ar e o link chega no WhatsApp.</li>
              </ol>
              <Card><Clock className="h-5 w-5 text-flame" /><div><strong>Estimativa 24h.</strong> Prazo contado a partir do envio completo do formulário; materiais incompletos pausam o cronômetro.</div></Card>
            </Section>

            <Section id="fluxo" title="Activation flow" icon={Workflow}>
              <p>Veja em detalhes o que acontece nos bastidores entre o seu pagamento e o site no ar:</p>
              <ul>
                <li><strong>0–5 min · Payment confirmation:</strong> Stripe webhook validates the transaction and unlocks the info form.</li>
                <li><strong>5–60 min · Info collection:</strong> you complete it in ~10 minutes. Everything editable later.</li>
                <li><strong>1–2h · Briefing interno:</strong> validamos materiais, identificamos lacunas e (se necessário) chamamos no WhatsApp.</li>
                <li><strong>2–18h · Production:</strong> our team builds the page from the chosen template + your brand identity.</li>
                <li><strong>18–22h · Visual QA:</strong> we review each screen on desktop, tablet, mobile. Image optimization and SEO.</li>
                <li><strong>22–24h · Publishing:</strong> temporary domain <code>seu-negocio.filro.site</code> immediately; custom domain setup runs in parallel (24–72h depending on registrar).</li>
              </ul>
            </Section>

            <Section id="envio" title="O que enviar (e como)" icon={Palette}>
              <p>Quanto mais detalhes, mais rápido entregamos. Abaixo o checklist completo organizado pelas seções do formulário:</p>
              <h3>Identidade visual</h3>
              <ul>
                <li>Business name and segment (food, beauty, retail, services, etc.).</li>
                <li>Short description (1 line) and long description (2–3 paragraphs).</li>
                <li>Slogan ou frase de impacto (opcional, mas recomendado).</li>
                <li>Cores da marca (HEX preferencialmente; ou indicar referência).</li>
                <li>Logo: PNG transparente ou SVG (ideal); JPG funciona se for em fundo neutro.</li>
              </ul>
              <h3>Contato e redes</h3>
              <ul>
                <li>WhatsApp com DDD (será usado como CTA principal).</li>
                <li>Instagram, Facebook, TikTok (URLs completas).</li>
                <li>Endereço físico (se atende presencialmente) — mostramos no Google Maps.</li>
                <li>Horário de atendimento por dia da semana.</li>
              </ul>
              <h3>Catálogo</h3>
              <ul>
                <li>List of products or services with name, price, description.</li>
                <li>Imagens: jpg/png/webp, ~1MB cada, idealmente quadradas (1080×1080).</li>
                <li>Categorias (cardápio, portfólio por área, coleções).</li>
              </ul>
              <h3>Promoções e referência</h3>
              <ul>
                <li>Coupons, combos, descontos por tempo limitado.</li>
                <li><strong>Select template:</strong> reference link (a site you like), file (brief, PDF, image) or free-form description of the desired feel.</li>
              </ul>
              <Card><Lightbulb className="h-5 w-5 text-flame" /><div>No tem logo ou fotos profissionais? Sem problema. Trabalhamos com tipografia, ilustrações e fotos do seu celular ou stock licenciado.</div></Card>
            </Section>

            <Section id="pagamento" title="Payment e planos" icon={CreditCard}>
              <h3>Estrutura de cobrança</h3>
              <ul>
                <li><strong>Activation (one-time):</strong> charged once, unlocks production.</li>
                <li><strong>Monthly:</strong> billed monthly on the same date; covers hosting, maintenance, and support.</li>
              </ul>
              <h3>Formas de pagamento</h3>
              <ul>
                <li>Cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard).</li>
                <li>Cartão de débito.</li>
                <li>Pix (à vista).</li>
                <li>Cartão internacional (135+ moedas via Stripe).</li>
              </ul>
              <h3>Cancellation e reembolso</h3>
              <ul>
                <li>7-day right of withdrawal if production hasn't started.</li>
                <li>Once production has started, activation is non-refundable.</li>
                <li>Monthly pode ser cancelada com 7 days de antecedência.</li>
              </ul>
              <p>Details completos em <Link to="/termos" className="text-ink underline">Terms of Use</Link>.</p>
            </Section>

            <Section id="tecnico" title="Details técnicos" icon={Wrench}>
              <h3>Stack</h3>
              <ul>
                <li>Frontend: React 19 + TanStack Start v1 (SSR + Edge runtime).</li>
                <li>Backend gerenciado: Postgres + Auth + Storage + Realtime.</li>
                <li>Payments: Stripe com Embedded Checkout.</li>
                <li>Stays em edge global, com cache em centenas de POPs.</li>
                <li>Image CDN with automatic optimization (WebP/AVIF).</li>
              </ul>
              <h3>Performance</h3>
              <ul>
                <li>Boas práticas de performance e SEO técnico (Core Web Vitals como meta de trabalho).</li>
                <li>SSR para SEO e first-paint rápido.</li>
                <li>Lazy-loading nativo em imagens e componentes pesados.</li>
                <li>Fontes auto-hospedadas com <code>font-display: swap</code>.</li>
              </ul>
              <h3>Segurança</h3>
              <ul>
                <li>RLS (Row-Level Security) ativo em todas as tabelas.</li>
                <li>Roles separados em tabela própria (sem escalonamento de privilégio).</li>
                <li>Webhooks with HMAC verification.</li>
                <li>Rate limiting and DDoS protection via Cloudflare.</li>
                <li>HTTPS obrigatório com TLS 1.3 e HSTS.</li>
              </ul>
              <h3>Acessibilidade</h3>
              <ul>
                <li>Contraste mínimo WCAG AA em todos os componentes.</li>
                <li>Navigation completa por teclado.</li>
                <li>Alt-text obrigatório em todas as imagens publicadas.</li>
              </ul>
            </Section>

            <Section id="dominio" title="Domínio e hospedagem" icon={Globe}>
              <p>Your page lives at <code>seu-negocio.filro.site</code> immediately after publishing. To use a custom domain:</p>
              <ol>
                <li>Compre o domínio em um registrador (Registro.br para .com, GoDaddy ou Cloudflare para .com).</li>
                <li>Aponte o registro CNAME para <code>cdn.filro.site</code> (apex/raiz: usar ALIAS ou ANAME).</li>
                <li>Let the team know; SSL/HTTPS is provisioned automatically within ~1h of DNS propagation.</li>
              </ol>
              <h3>Custos</h3>
              <p>Domains are paid directly to the registrar (typically $10–20/yr for <code>.com</code>).Filro doesn't charge to connect a custom domain.</p>
              <h3>E-mail profissional</h3>
              <p>We support Google Workspace and Microsoft 365 (you subscribe; we set up MX and SPF records at no charge).</p>
            </Section>

            <Section id="manutencao" title="Maintenance e edições" icon={RefreshCw}>
              <h3>O que está incluso na mensalidade</h3>
              <ul>
                <li>Pequenas alterações de catálogo (preços, fotos, descrições) inclusas via painel.</li>
                <li>Pequenos ajustes visuais (até 2h/mo de equipe).</li>
                <li>Stays ativa enquanto a mensalidade estiver em dia.</li>
                <li>Basic maintenance support via email/chat.</li>
              </ul>
              <h3>Edições maiores</h3>
              <p>Redesigns, novas seções customizadas ou integrações específicas são orçados à parte. Pedidos pelo WhatsApp; orçamento em até 1 dia útil.</p>
            </Section>

            <Section id="metricas" title="Métricas e SEO" icon={BarChart3}>
              <h3>SEO básico incluso</h3>
              <ul>
                <li>Meta tags otimizadas por página (title, description, OG, Twitter Card).</li>
                <li>Schema.org / JSON-LD para LocalBusiness, Restaurant, Product.</li>
                <li>Sitemap.xml e robots.txt automáticos.</li>
                <li>URL amigável e canonical tags.</li>
                <li>Submissão ao Google Search Console (sob solicitação).</li>
              </ul>
              <h3>Analytics</h3>
              <ul>
                <li>Dashboard próprio com visitas, cliques no WhatsApp e conversões.</li>
                <li>Support a Google Analytics 4 e Meta Pixel (você fornece o ID).</li>
              </ul>
            </Section>


            <Section id="faq" title="Perguntas frequentes" icon={FileQuestion}>
              
              <Q q="Quanto tempo até estar no ar?">Até 24 horas após o envio das informações. Geralmente entregamos em menos de 18h.</Q>
              <Q q="Preciso entender de tecnologia?">No. You só envia as informações; nosso time monta tudo. O painel também é desenhado para uso por leigos.</Q>
              <Q q="What if I don't like the result?">Incluímos 1 rodada de revisão visual nos primeiros 7 days. Ajustes simples dentro do escopo são feitos sem custo nesse período.</Q>
              <Q q="Posso cancelar?">Yes, a qualquer momento. A ativação não é reembolsável após início da produção; mensalidade pode ser cancelada com 7 days de antecedência.</Q>
              <Q q="O que acontece se eu cancelar?">O site fica no ar até o fim do ciclo já pago. Depois disso, exportamos seus dados em JSON/CSV e o domínio próprio continua seu para apontar onde quiser.</Q>
              <Q q="Yous fazem cardápio digital?">Yes, é uma das categorias mais pedidas. Plan Avançado em diante, com QR code para mesas.</Q>
              <Q q="Aceita cartão internacional?">Yes, Stripe processa em 135+ moedas.</Q>
              <Q q="Yous criam logo?">No fazemos design de marca do zero, mas trabalhamos com tipografia e refinamentos no que você já tem. Se precisar de logo profissional, indicamos parceiros.</Q>
              <Q q="Hospedam meu e-mail também?">No diretamente. Configuramos gratuitamente os DNS para Google Workspace ou Microsoft 365.</Q>
              <Q q="Tem app mobile?">A página é 100% responsiva e instalável como PWA (atalho na tela inicial). App nativo (iOS/Android) é projeto à parte.</Q>
            </Section>

            <Section id="suporte" title="Support" icon={MessageCircle}>
              <p>Atendimento humano via WhatsApp em horário comercial (segunda a sexta, 9h às 18h, horário de Brasília):</p>
              <ul>
                <li>WhatsApp: <a href="https://wa.me/5592993561754" className="text-ink underline" target="_blank" rel="noreferrer">+55 92 99356-1754</a></li>
                <li>E-mail: <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a></li>
              </ul>
              <p>Para dúvidas legais, veja <Link to="/termos" className="text-ink underline">Terms of Use</Link> e <Link to="/privacidade" className="text-ink underline">Privacy Policy</Link>.</p>
              <Card><ShieldCheck className="h-5 w-5 text-azure" /><div><strong>SLA:</strong> resposta em até 4h úteis para dúvidas; até 1h para incidentes críticos (site fora do ar, falha de pagamento).</div></Card>
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
      <summary className="cursor-pointer font-semibold text-ink list-none flex justify-between items-center"><span>{q}</span><ChevronDown className="h-4 w-4 text-ink-soft group-open:rotate-180 transition-transform" /></summary>
      <div className="mt-2 text-ink-soft">{children}</div>
    </details>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 p-5 rounded-2xl bg-muted">{children}</div>;
}
