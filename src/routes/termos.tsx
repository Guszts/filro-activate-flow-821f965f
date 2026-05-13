import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/termos")({
  component: TermsPage,
  head: () => ({ meta: [
    { title: "Termos de Uso · Filro" },
    { name: "description", content: "Termos e condições de uso dos serviços Filro: contratação, prazo de 24h, pagamentos, cancelamento e responsabilidades." },
  ]}),
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl w-full px-5 md:px-10 py-12 md:py-20 flex-1">
        <span className="text-xs tracking-wide text-ink-soft">Atualizado em 13 de maio de 2026 · Versão 2.0</span>
        <h1 className="mt-4 editorial-headline text-5xl md:text-6xl text-ink">Termos de Uso</h1>
        <p className="mt-4 text-ink-soft">Estes Termos regulam o uso da plataforma Filro e a contratação dos seus serviços. Ao criar conta ou contratar um plano, você declara que leu, entendeu e aceita integralmente todas as cláusulas abaixo.</p>

        <article className="mt-10 space-y-6 text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:font-black [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-ink [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
          <h2>1. Definições</h2>
          <ul>
            <li><strong>Filro:</strong> plataforma de produção e hospedagem de presença digital para empresas locais.</li>
            <li><strong>Cliente:</strong> pessoa física ou jurídica que contrata um plano.</li>
            <li><strong>Plano:</strong> conjunto de entregas (site, cardápio, portfólio) descrito na página inicial.</li>
            <li><strong>Ativação:</strong> taxa única de produção e publicação inicial.</li>
            <li><strong>Mensalidade:</strong> valor recorrente por hospedagem, manutenção e suporte.</li>
          </ul>

          <h2>2. Objeto do contrato</h2>
          <p>A Filro presta serviço de produção, publicação e manutenção de presença digital (sites institucionais, cardápios online e portfólios) para empresas locais brasileiras. A contratação ocorre 100% online por meio dos planos descritos na página inicial.</p>

          <h2>3. Aceitação e capacidade</h2>
          <p>Para contratar, o Cliente declara ser maior de 18 anos (ou representante legal de pessoa jurídica) e possuir plena capacidade civil. O cadastro deve conter dados verdadeiros, atuais e completos. Dados falsos podem resultar em cancelamento sem reembolso.</p>

          <h2>4. Prazo de entrega — Garantia de 24 horas</h2>
          <p>O prazo de <strong>24 horas corridas</strong> começa a contar a partir do <em>envio completo</em> das informações do negócio (formulário pós-pagamento). Materiais incompletos, ilegíveis ou inadequados pausam o cronômetro até o reenvio correto.</p>
          <p><strong>Garantia:</strong> se o atraso for de responsabilidade exclusiva da Filro, o Cliente recebe <strong>1 (um) mês de mensalidade gratuito</strong> como compensação. A garantia não se aplica em casos de força maior (queda de provedores, ataques DDoS, exigências legais).</p>

          <h2>5. Pagamento e faturamento</h2>
          <h3>5.1 Forma de pagamento</h3>
          <p>Os valores são processados via Stripe (cartão de crédito, débito ou Pix). A Filro não armazena dados de cartão; toda informação financeira é tokenizada pelo Stripe sob padrão PCI-DSS Nível 1.</p>
          <h3>5.2 Ativação</h3>
          <p>A taxa de ativação é <strong>cobrada uma única vez</strong> e <strong>não é reembolsável</strong> após o início da produção (até 2 horas após o pagamento). Antes desse marco, o Cliente pode solicitar reembolso integral.</p>
          <h3>5.3 Mensalidade</h3>
          <p>Cobrada automaticamente todo mês na mesma data da ativação. Em caso de falha de cobrança, o serviço é suspenso após 7 dias e cancelado após 30 dias de inadimplência.</p>
          <h3>5.4 Reajustes</h3>
          <p>Os valores podem ser reajustados anualmente pelo IPCA, com aviso prévio de 30 dias.</p>

          <h2>6. Cancelamento e direito de arrependimento</h2>
          <ul>
            <li><strong>Direito de arrependimento (CDC art. 49):</strong> 7 dias corridos após a contratação, desde que a produção não tenha iniciado.</li>
            <li><strong>Cancelamento da mensalidade:</strong> a qualquer tempo, com 7 dias de antecedência. O serviço permanece ativo até o fim do ciclo já pago.</li>
            <li><strong>Cancelamento por inadimplência:</strong> imediato após 30 dias, com perda dos dados após 90 dias adicionais.</li>
          </ul>

          <h2>7. Propriedade intelectual</h2>
          <p>O Cliente mantém integralmente os direitos sobre logo, fotografias, textos próprios, marcas registradas e demais materiais enviados. A Filro mantém os direitos sobre o código-fonte, templates, ferramentas internas e qualquer biblioteca proprietária.</p>
          <p>O resultado entregue (site/cardápio/portfólio) pode ser usado pela Filro para divulgação institucional (portfólio, redes sociais, propostas comerciais), salvo solicitação contrária por escrito.</p>

          <h2>8. Conduta proibida</h2>
          <p>É expressamente vedado utilizar a plataforma para:</p>
          <ul>
            <li>Conteúdo ilegal, ofensivo, discriminatório ou que viole direitos de terceiros.</li>
            <li>Atividades fraudulentas, esquemas em pirâmide ou venda de produtos proibidos.</li>
            <li>Violação de propriedade intelectual de terceiros (logos, fotos, textos não autorizados).</li>
            <li>Spam, phishing ou qualquer prática que comprometa a reputação da infraestrutura.</li>
          </ul>
          <p>Violações resultam em <strong>suspensão imediata sem reembolso</strong> e podem ser comunicadas às autoridades.</p>

          <h2>9. Disponibilidade e SLA</h2>
          <p>A Filro garante disponibilidade de <strong>99,5% mensal</strong> (downtime máximo de ~3,6h/mês). Em caso de descumprimento comprovado, o Cliente recebe crédito proporcional na próxima fatura. Manutenções programadas são avisadas com 48h de antecedência.</p>

          <h2>10. Limitação de responsabilidade</h2>
          <p>A Filro responde por danos diretos comprovados, limitados <strong>ao valor pago pelo Cliente nos últimos 3 meses</strong>. Não respondemos por:</p>
          <ul>
            <li>Lucros cessantes, perda de oportunidade ou dano reputacional.</li>
            <li>Falhas de terceiros (Stripe, Cloudflare, registradores de domínio).</li>
            <li>Conteúdo enviado pelo próprio Cliente.</li>
            <li>Caso fortuito ou força maior.</li>
          </ul>

          <h2>11. Suporte</h2>
          <p>O suporte é prestado via WhatsApp (+55 92 99356-1754) e e-mail (<a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a>) em horário comercial (segunda a sexta, 9h às 18h, horário de Brasília). SLA de resposta: até 4h úteis para dúvidas; até 1h para incidentes críticos.</p>

          <h2>12. Alterações destes Termos</h2>
          <p>Podemos atualizar estes Termos a qualquer tempo. Alterações relevantes serão comunicadas por e-mail e WhatsApp com <strong>30 dias de antecedência</strong>. O uso continuado após a vigência implica aceitação tácita.</p>

          <h2>13. Foro e legislação aplicável</h2>
          <p>Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial pelo Código de Defesa do Consumidor (Lei 8.078/90), Marco Civil da Internet (Lei 12.965/14) e LGPD (Lei 13.709/18). Fica eleito o foro da Comarca de <strong>Manaus/AM</strong> para dirimir quaisquer questões oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>

          <h2>14. Contato</h2>
          <p>Dúvidas sobre estes Termos: <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a> · WhatsApp <a href="https://wa.me/5592993561754" className="text-ink underline" target="_blank" rel="noreferrer">+55 92 99356-1754</a>.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
