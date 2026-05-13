import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/termos")({
  component: TermsPage,
  head: () => ({ meta: [
    { title: "Termos de Uso · Filro" },
    { name: "description", content: "Termos e condições de uso dos serviços Filro." },
  ]}),
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl w-full px-5 md:px-10 py-12 md:py-20 flex-1">
        <span className="text-xs tracking-wide text-ink-soft">Atualizado em 13 de maio de 2026</span>
        <h1 className="mt-4 editorial-headline text-5xl md:text-6xl text-ink">Termos de Uso</h1>
        <article className="mt-10 space-y-6 text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:font-black [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-ink">
          <h2>1. Objeto</h2>
          <p>A Filro presta serviço de produção e hospedagem de presença digital (sites, cardápios e portfólios) para empresas locais. A contratação ocorre online por planos descritos na página inicial.</p>
          <h2>2. Aceitação</h2>
          <p>Ao criar conta e contratar um plano, você concorda integralmente com estes termos.</p>
          <h2>3. Prazo de entrega</h2>
          <p>O prazo de <strong>24 horas</strong> começa a contar a partir do <em>envio completo</em> das informações do negócio (formulário pós-pagamento). Materiais incompletos pausam o prazo.</p>
          <h2>4. Pagamento</h2>
          <p>Os valores de ativação e mensalidade são cobrados via Stripe. A ativação <strong>não é reembolsável</strong> após início da produção. Mensalidade pode ser cancelada com 7 dias de antecedência.</p>
          <h2>5. Propriedade intelectual</h2>
          <p>O cliente mantém os direitos sobre logo, fotos, textos e marcas próprias. A Filro mantém os direitos sobre o código, templates e ferramentas. Conteúdo entregue pode ser usado em portfólio, salvo solicitação contrária.</p>
          <h2>6. Conduta proibida</h2>
          <p>É vedado usar a plataforma para conteúdo ilegal, ofensivo, enganoso ou que viole direitos de terceiros. Violações resultam em suspensão imediata sem reembolso.</p>
          <h2>7. Limitação de responsabilidade</h2>
          <p>A Filro responde até o limite do valor pago nos últimos 3 meses. Não respondemos por perdas indiretas (lucros cessantes, dano reputacional).</p>
          <h2>8. Foro</h2>
          <p>Fica eleito o foro de Belo Horizonte/MG para dirimir quaisquer questões.</p>
          <h2>9. Contato</h2>
          <p>Dúvidas: <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a>.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
