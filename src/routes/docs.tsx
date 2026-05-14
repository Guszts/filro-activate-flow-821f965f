import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, ChevronDown, Workflow, Globe, Wrench, MessageCircle, FileQuestion, Rocket, Palette, CreditCard, RefreshCw, BarChart3, Lightbulb } from "lucide-react";

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
              <p>Filro entrega presença digital pronta para empresas locais. Ativação acontece em <strong>até 24 horas</strong> após o pagamento e o envio das informações do negócio. Você não precisa entender de tecnologia — nosso time monta tudo a partir das informações que você fornece.</p>
              <h3>Pré-requisitos</h3>
              <ul>
                <li>Um e-mail válido (usado para login e notificações).</li>
                <li>WhatsApp ativo (usado para entrega e suporte direto).</li>
                <li>Materiais básicos do negócio: logo (se tiver), fotos, descrições, contato.</li>
              </ul>
              <h3>Passo a passo</h3>
              <ol>
                <li><strong>Escolha um plano</strong> na home (Essencial, Avançado ou Premium).</li>
                <li><strong>Crie sua conta</strong> com e-mail/senha ou login Google.</li>
                <li><strong>Finalize o pagamento</strong> via Stripe (cartão, débito ou Pix).</li>
                <li><strong>Envie as informações do negócio</strong> — identidade, contato, catálogo e referência de modelo.</li>
                <li>Em até 24h, sua presença digital está no ar e você recebe o link no WhatsApp.</li>
              </ol>
              <Card><Clock className="h-5 w-5 text-flame" /><div><strong>Garantia 24h.</strong> Se passarmos do prazo por culpa nossa, mês de mensalidade por nossa conta.</div></Card>
            </Section>

            <Section id="fluxo" title="Fluxo de ativação" icon={Workflow}>
              <p>Veja em detalhes o que acontece nos bastidores entre o seu pagamento e o site no ar:</p>
              <ul>
                <li><strong>0–5 min · Confirmação de pagamento:</strong> webhook Stripe valida a transação e libera o formulário de informações.</li>
                <li><strong>5–60 min · Coleta de informações:</strong> você preenche em ~10 minutos. Tudo é editável depois.</li>
                <li><strong>1–2h · Briefing interno:</strong> validamos materiais, identificamos lacunas e (se necessário) chamamos no WhatsApp.</li>
                <li><strong>2–18h · Produção:</strong> time monta a página com base no modelo escolhido + sua identidade visual.</li>
                <li><strong>18–22h · QA visual:</strong> revisamos cada tela em desktop, tablet e mobile. Otimização de imagens e SEO.</li>
                <li><strong>22–24h · Publicação:</strong> domínio temporário <code>seu-negocio.filro.app</code> imediato; configuração de domínio próprio em paralelo (24–72h conforme registrador).</li>
              </ul>
            </Section>

            <Section id="envio" title="O que enviar (e como)" icon={Palette}>
              <p>Quanto mais detalhes, mais rápido entregamos. Abaixo o checklist completo organizado pelas seções do formulário:</p>
              <h3>Identidade visual</h3>
              <ul>
                <li>Nome do negócio e segmento (alimentação, beleza, moda, serviços, etc.).</li>
                <li>Descrição curta (1 linha) e descrição longa (2-3 parágrafos).</li>
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
                <li>Lista de produtos ou serviços com nome, preço, descrição.</li>
                <li>Imagens: jpg/png/webp, ~1MB cada, idealmente quadradas (1080×1080).</li>
                <li>Categorias (cardápio, portfólio por área, coleções).</li>
              </ul>
              <h3>Promoções e referência</h3>
              <ul>
                <li>Cupons, combos, descontos por tempo limitado.</li>
                <li><strong>Selecionar modelo:</strong> link de referência (site que você gosta), arquivo (brief, PDF, imagem) ou descrição livre do clima desejado.</li>
              </ul>
              <Card><Sparkles className="h-5 w-5 text-flame" /><div>Não tem logo ou fotos profissionais? Sem problema. Trabalhamos com tipografia, ilustrações e fotos do seu celular ou stock licenciado.</div></Card>
            </Section>

            <Section id="pagamento" title="Pagamento e planos" icon={CreditCard}>
              <h3>Estrutura de cobrança</h3>
              <ul>
                <li><strong>Ativação (única):</strong> taxa cobrada uma vez, libera a produção.</li>
                <li><strong>Mensalidade:</strong> cobrada mensalmente na mesma data, cobre hospedagem, manutenção e suporte.</li>
              </ul>
              <h3>Formas de pagamento</h3>
              <ul>
                <li>Cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard).</li>
                <li>Cartão de débito.</li>
                <li>Pix (à vista).</li>
                <li>Cartão internacional (135+ moedas via Stripe).</li>
              </ul>
              <h3>Cancelamento e reembolso</h3>
              <ul>
                <li>Direito de arrependimento de 7 dias se a produção não tiver iniciado.</li>
                <li>Após início da produção, ativação não é reembolsável.</li>
                <li>Mensalidade pode ser cancelada com 7 dias de antecedência.</li>
              </ul>
              <p>Detalhes completos em <Link to="/termos" className="text-ink underline">Termos de Uso</Link>.</p>
            </Section>

            <Section id="tecnico" title="Detalhes técnicos" icon={Wrench}>
              <h3>Stack</h3>
              <ul>
                <li>Frontend: React 19 + TanStack Start v1 (SSR + Edge runtime).</li>
                <li>Backend: Lovable Cloud (Postgres + Auth + Storage + Realtime).</li>
                <li>Pagamentos: Stripe via Lovable Connector Gateway, com Embedded Checkout.</li>
                <li>Hospedagem: Cloudflare Workers Edge, com cache global em 300+ POPs.</li>
                <li>CDN de imagens: Cloudflare Images com otimização automática (WebP/AVIF).</li>
              </ul>
              <h3>Performance</h3>
              <ul>
                <li>Lighthouse 95+ em todas as categorias (Performance, A11y, SEO, Best Practices).</li>
                <li>SSR para SEO e first-paint sub-segundo (TTFB &lt; 200ms na média global).</li>
                <li>Lazy-loading nativo em imagens e componentes pesados.</li>
                <li>Fontes auto-hospedadas com <code>font-display: swap</code>.</li>
              </ul>
              <h3>Segurança</h3>
              <ul>
                <li>RLS (Row-Level Security) ativo em todas as tabelas.</li>
                <li>Roles separados em tabela própria (sem escalonamento de privilégio).</li>
                <li>Webhooks com verificação HMAC.</li>
                <li>Rate limiting e proteção DDoS via Cloudflare.</li>
                <li>HTTPS obrigatório com TLS 1.3 e HSTS.</li>
              </ul>
              <h3>Acessibilidade</h3>
              <ul>
                <li>Contraste mínimo WCAG AA em todos os componentes.</li>
                <li>Navegação completa por teclado.</li>
                <li>Alt-text obrigatório em todas as imagens publicadas.</li>
              </ul>
            </Section>

            <Section id="dominio" title="Domínio e hospedagem" icon={Globe}>
              <p>Sua página fica em <code>seu-negocio.filro.app</code> imediatamente após a publicação. Para usar domínio próprio:</p>
              <ol>
                <li>Compre o domínio em um registrador (Registro.br para .com.br, GoDaddy ou Cloudflare para .com).</li>
                <li>Aponte o registro CNAME para <code>cdn.filro.app</code> (apex/raiz: usar ALIAS ou ANAME).</li>
                <li>Avise o time pelo WhatsApp; SSL/HTTPS é provisionado automaticamente em ~1h após a propagação DNS.</li>
              </ol>
              <h3>Custos</h3>
              <p>O domínio é pago diretamente ao registrador (R$ 40-120/ano para <code>.com.br</code>). A Filro não cobra taxa adicional para conectar domínio próprio.</p>
              <h3>E-mail profissional</h3>
              <p>Suportamos integração com Google Workspace e Microsoft 365 (você contrata; configuramos os registros MX e SPF gratuitamente).</p>
            </Section>

            <Section id="manutencao" title="Manutenção e edições" icon={RefreshCw}>
              <h3>O que está incluso na mensalidade</h3>
              <ul>
                <li>Atualizações de catálogo (preços, fotos, descrições) ilimitadas via painel.</li>
                <li>Pequenos ajustes visuais (até 2h/mês de equipe).</li>
                <li>Backups diários automáticos com retenção de 90 dias.</li>
                <li>Monitoramento 24/7 de uptime.</li>
              </ul>
              <h3>Edições maiores</h3>
              <p>Redesigns completos, novas seções customizadas ou integrações específicas são orçados à parte. Pedidos pelo WhatsApp; orçamento em até 1 dia útil.</p>
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
                <li>Painel próprio com visitas, cliques no WhatsApp e conversões.</li>
                <li>Suporte a Google Analytics 4 e Meta Pixel (você fornece o ID).</li>
              </ul>
            </Section>

            <Section id="faq" title="Perguntas frequentes" icon={FileQuestion}>
              <Q q="Posso editar depois?">Sim. Você acessa o painel a qualquer hora e atualiza informações, fotos, preços e promoções sem cobrança extra.</Q>
              <Q q="Quanto tempo até estar no ar?">Até 24 horas após o envio das informações. Geralmente entregamos em menos de 18h.</Q>
              <Q q="Preciso entender de tecnologia?">Não. Você só envia as informações; nosso time monta tudo. O painel também é desenhado para uso por leigos.</Q>
              <Q q="E se eu não gostar do resultado?">Incluímos 1 rodada de revisão visual gratuita nos primeiros 7 dias. Ajustes finos são feitos sem custo nesse período.</Q>
              <Q q="Posso cancelar?">Sim, a qualquer momento. A ativação não é reembolsável após início da produção; mensalidade pode ser cancelada com 7 dias de antecedência.</Q>
              <Q q="O que acontece se eu cancelar?">O site fica no ar até o fim do ciclo já pago. Depois disso, exportamos seus dados em JSON/CSV e o domínio próprio continua seu para apontar onde quiser.</Q>
              <Q q="Vocês fazem cardápio digital?">Sim, é uma das categorias mais pedidas. Plano Avançado em diante, com QR code para mesas.</Q>
              <Q q="Aceita cartão internacional?">Sim, Stripe processa em 135+ moedas.</Q>
              <Q q="Vocês criam logo?">Não fazemos design de marca do zero, mas trabalhamos com tipografia e refinamentos no que você já tem. Se precisar de logo profissional, indicamos parceiros.</Q>
              <Q q="Hospedam meu e-mail também?">Não diretamente. Configuramos gratuitamente os DNS para Google Workspace ou Microsoft 365.</Q>
              <Q q="Tem app mobile?">A página é 100% responsiva e instalável como PWA (atalho na tela inicial). App nativo (iOS/Android) é projeto à parte.</Q>
            </Section>

            <Section id="suporte" title="Suporte" icon={MessageCircle}>
              <p>Atendimento humano via WhatsApp em horário comercial (segunda a sexta, 9h às 18h, horário de Brasília):</p>
              <ul>
                <li>WhatsApp: <a href="https://wa.me/5592993561754" className="text-ink underline" target="_blank" rel="noreferrer">+55 92 99356-1754</a></li>
                <li>E-mail: <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a></li>
              </ul>
              <p>Para dúvidas legais, veja <Link to="/termos" className="text-ink underline">Termos de Uso</Link> e <Link to="/privacidade" className="text-ink underline">Política de Privacidade</Link>.</p>
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
      <summary className="cursor-pointer font-semibold text-ink list-none flex justify-between items-center"><span>{q}</span><Sparkles className="h-4 w-4 text-ink-soft group-open:rotate-180 transition-transform" /></summary>
      <div className="mt-2 text-ink-soft">{children}</div>
    </details>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 p-5 rounded-2xl bg-muted">{children}</div>;
}
