import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Política de Privacidade · Filro" },
      { name: "description", content: "Como a Filro coleta, usa, armazena e protege seus dados, em conformidade total com a LGPD." },
      { property: "og:title", content: "Política de Privacidade · Filro" },
      { property: "og:description", content: "Como a Filro coleta, usa e protege seus dados — conforme LGPD." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://setup.filro.site/privacidade" },
      { name: "twitter:title", content: "Política de Privacidade · Filro" },
      { name: "twitter:description", content: "Como a Filro coleta, usa e protege seus dados — conforme LGPD." },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/privacidade" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl w-full px-5 md:px-10 py-12 md:py-20 flex-1">
        <span className="text-xs tracking-wide text-ink-soft">Atualizado em 20 de maio de 2026 · Versão 2.1 · Conforme LGPD</span>
        <h1 className="mt-4 editorial-headline text-5xl md:text-6xl text-ink">Política de Privacidade</h1>
        <p className="mt-4 text-ink-soft">Sua privacidade importa. Esta Política descreve, de forma transparente, quais dados coletamos, por que coletamos, como armazenamos e quais são seus direitos. Está em conformidade integral com a Lei Geral de Proteção de Dados (Lei 13.709/18).</p>

        <article className="mt-10 space-y-6 text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:font-black [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-ink [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
          

          <h2>1. Quem somos (Controlador)</h2>
          <p>A Filro é a controladora dos dados pessoais coletados nesta plataforma. Nosso encarregado pelo tratamento de dados (DPO) pode ser contatado em <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a>.</p>

          <h2>2. Dados que coletamos</h2>
          <h3>2.1 Dados de cadastro</h3>
          <ul>
            <li>Nome completo, e-mail, WhatsApp (com DDI/DDD).</li>
            <li>Nome do negócio, segmento, descrição.</li>
            <li>Senha (armazenada apenas em formato hash bcrypt — nunca em texto puro).</li>
          </ul>
          <h3>2.2 Informações do negócio</h3>
          <ul>
            <li>Identidade visual: logo, cores da marca, slogan.</li>
            <li>Catálogo: produtos/serviços, preços, descrições, imagens.</li>
            <li>Contato comercial: endereço, horário, redes sociais.</li>
            <li>Materiais de referência: links, arquivos e briefs enviados.</li>
          </ul>
          <h3>2.3 Dados de pagamento</h3>
          <p>Todo o processamento financeiro é feito pelo Stripe (PCI-DSS Nível 1). <strong>Nunca armazenamos dados de cartão</strong>. Recebemos apenas os 4 últimos dígitos, bandeira e status da transação para fins de comprovante.</p>
          <h3>2.4 Dados de uso e técnicos</h3>
          <ul>
            <li>Endereço IP, user-agent, sistema operacional, navegador.</li>
            <li>Logs de acesso, ações realizadas no painel, timestamps.</li>
            <li>Cookies de sessão e autenticação (estritamente necessários).</li>
          </ul>

          <h2>3. Bases legais para o tratamento (LGPD art. 7º)</h2>
          <ul>
            <li><strong>Execução de contrato (art. 7º, V):</strong> dados necessários para entregar o serviço contratado.</li>
            <li><strong>Cumprimento de obrigação legal (art. 7º, II):</strong> retenção fiscal e tributária.</li>
            <li><strong>Legítimo interesse (art. 7º, IX):</strong> segurança, prevenção a fraudes e analytics anonimizados.</li>
            <li><strong>Consentimento (art. 7º, I):</strong> comunicações de marketing (opt-in explícito).</li>
          </ul>

          <h2>4. Para que usamos seus dados</h2>
          <ul>
            <li>Produzir, entregar e manter sua presença digital.</li>
            <li>Comunicação operacional por e-mail e WhatsApp sobre seu projeto.</li>
            <li>Emissão de notas fiscais e cumprimento de obrigações tributárias.</li>
            <li>Suporte técnico e atendimento ao cliente.</li>
            <li>Prevenção a fraudes, detecção de abuso e segurança da plataforma.</li>
            <li>Melhoria contínua do produto (analytics agregados e anônimos).</li>
          </ul>

          <h2>5. Compartilhamento com terceiros</h2>
          <p>Nunca vendemos, alugamos ou cedemos seus dados. Compartilhamos apenas com operadores essenciais à prestação do serviço:</p>
          <ul>
            <li><strong>Stripe</strong> (Irlanda/EUA) — processamento de pagamentos. <a href="https://stripe.com/br/privacy" target="_blank" rel="noreferrer" className="text-ink underline">Política</a>.</li>
            <li><strong>Cloudflare</strong> (EUA) — hospedagem edge e proteção DDoS.</li>
            <li><strong>Supabase</strong> (EUA/UE) — banco de dados e autenticação.</li>
            <li><strong>Google</strong> (caso autenticação social seja usada) — apenas e-mail e nome do perfil.</li>
            <li><strong>Provedores de IA</strong> (EUA/UE) — quando você usa o Flaro Dev, o prompt enviado no chat e o conteúdo atual do site são processados por provedores de modelos de linguagem (Google e/ou OpenAI) via gateway agregado. Os dados não são usados para treinar modelos públicos.</li>
            <li><strong>Autoridades públicas</strong> — somente mediante ordem judicial ou requisição legal formal.</li>
          </ul>
          <p>Todas as transferências internacionais respeitam o art. 33 da LGPD (cláusulas contratuais padrão e garantias adequadas).</p>

          <h2>6. Seus direitos como titular (LGPD art. 18)</h2>
          <p>Você pode, a qualquer tempo e gratuitamente:</p>
          <ul>
            <li><strong>Confirmar</strong> a existência de tratamento dos seus dados.</li>
            <li><strong>Acessar</strong> os dados que mantemos sobre você.</li>
            <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados.</li>
            <li><strong>Anonimizar, bloquear ou eliminar</strong> dados desnecessários ou tratados em desconformidade.</li>
            <li><strong>Portar</strong> seus dados a outro fornecedor (formato estruturado, JSON ou CSV).</li>
            <li><strong>Eliminar</strong> dados tratados com base no consentimento.</li>
            <li><strong>Revogar consentimento</strong> a qualquer momento.</li>
            <li><strong>Opor-se</strong> ao tratamento em caso de descumprimento.</li>
            <li><strong>Solicitar revisão</strong> de decisões automatizadas que afetem seus interesses.</li>
          </ul>
          <p>Solicitações: <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a>. Respondemos em até <strong>15 dias corridos</strong>.</p>

          <h2>7. Retenção de dados</h2>
          <ul>
            <li><strong>Conta ativa:</strong> mantemos enquanto você for cliente.</li>
            <li><strong>Após cancelamento:</strong> 5 anos para cumprir obrigações fiscais (Lei 8.846/94 e Decreto 9.580/18).</li>
            <li><strong>Logs técnicos:</strong> 6 meses (Marco Civil da Internet, art. 15).</li>
            <li><strong>Comunicações comerciais:</strong> 5 anos (Código de Defesa do Consumidor).</li>
            <li><strong>Backups:</strong> rotacionados a cada 90 dias.</li>
          </ul>

          <h2>8. Segurança da informação</h2>
          <ul>
            <li><strong>Criptografia em trânsito:</strong> TLS 1.3 (HTTPS obrigatório em todas as rotas).</li>
            <li><strong>Criptografia em repouso:</strong> AES-256 no banco e nos backups.</li>
            <li><strong>Senhas:</strong> hash bcrypt com salt único por usuário.</li>
            <li><strong>Row-Level Security (RLS):</strong> ativo em todas as tabelas, garantindo isolamento entre clientes.</li>
            <li><strong>Auditoria:</strong> logs de acesso preservados e auditáveis.</li>
            <li><strong>Acesso interno:</strong> mínimo necessário, com autenticação multifator e revisão trimestral.</li>
            <li><strong>Resposta a incidentes:</strong> notificação em até 48h ao titular e à ANPD em caso de violação relevante.</li>
          </ul>

          <h2>9. Cookies e tecnologias similares</h2>
          <ul>
            <li><strong>Necessários:</strong> sessão, autenticação, segurança (CSRF). Não exigem consentimento.</li>
            <li><strong>Analíticos:</strong> contagem agregada e anônima de páginas vistas.</li>
            <li><strong>Não usamos</strong> cookies de publicidade de terceiros, fingerprinting ou rastreamento cross-site.</li>
          </ul>

          <h2>10. Crianças e adolescentes</h2>
          <p>O serviço não é destinado a menores de 18 anos. Não coletamos conscientemente dados de crianças ou adolescentes. Caso identifiquemos, excluiremos imediatamente.</p>

          <h2>11. Alterações desta Política</h2>
          <p>Podemos atualizar esta Política periodicamente. Alterações relevantes serão comunicadas por e-mail com <strong>30 dias de antecedência</strong>. A versão vigente fica sempre disponível nesta URL, com data da última atualização no topo.</p>

          <h2>12. Autoridade Nacional (ANPD)</h2>
          <p>Você tem o direito de apresentar reclamação à Autoridade Nacional de Proteção de Dados: <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="text-ink underline">gov.br/anpd</a>.</p>

          <h2>13. Contato</h2>
          <p>Encarregado de dados (DPO) Filro:</p>
          <ul>
            <li>E-mail: <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/5592993561754" target="_blank" rel="noreferrer" className="text-ink underline">+55 92 99356-1754</a></li>
          </ul>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
