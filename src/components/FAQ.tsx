import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Em quanto tempo recebo minha página?",
    a: "Estimativa de até 24 horas após o envio completo das informações do seu negócio. Materiais incompletos podem alongar o prazo.",
  },
  {
    q: "Quanto custa? Como funcionam os planos?",
    a: "Cobramos uma taxa única de ativação + mensalidade. Os planos vão do Start (R$ 197 + R$ 97/mês) ao Premium (R$ 897 + R$ 129/mês). O Plus (R$ 497 + R$ 97/mês) é o mais escolhido. Veja todos os planos na página /planos.",
  },
  {
    q: "Posso enviar um modelo de referência?",
    a: "Sim. No formulário de informações do negócio, você pode anexar um link, arquivo ou descrever em texto livre como gostaria que ficasse.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Pagamento seguro pela Stripe: cartão de crédito, cartão de débito ou Pix. A ativação é cobrada uma vez; a mensalidade é cobrada na mesma data todo mês.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade. Cancele a mensalidade a qualquer momento direto do seu painel. A página fica no ar até o fim do ciclo já pago.",
  },
  {
    q: "Vocês fazem alterações depois de entregue?",
    a: "Sim. Pequenas alterações (texto, fotos, horários, contatos, preços de catálogo) estão incluídas na mensalidade. Mudanças estruturais maiores são orçadas à parte.",
  },
  {
    q: "Preciso ter domínio próprio?",
    a: "Não é obrigatório. Entregamos em um subdomínio nosso (ex.: seu-negocio.filro.app), mas se você tiver um domínio (ex.: meunegocio.com.br) configuramos sem custo adicional.",
  },
  {
    q: "Funciona bem no celular?",
    a: "Sim. Todas as páginas são 100% responsivas, otimizadas para mobile-first, e instaláveis como PWA (atalho na tela inicial do celular).",
  },
  {
    q: "Tem integração com WhatsApp?",
    a: "Sim. O botão de WhatsApp é nativo em todos os planos. Cliques são rastreados no painel para você medir conversão.",
  },
  {
    q: "Vocês cuidam de SEO?",
    a: "Sim — SEO técnico básico está incluso em todos os planos: meta tags, schema.org, sitemap.xml, robots.txt e otimização de imagens. SEO de conteúdo (artigos, blog) é serviço à parte.",
  },
  {
    q: "Quais formas de pagamento aceitam?",
    a: "Cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard), cartão de débito e Pix. Cartões internacionais funcionam via Stripe.",
  },
  {
    q: "E se eu não gostar do resultado?",
    a: "Incluímos uma rodada de revisão visual nos primeiros 7 dias. Ajustes dentro do escopo são feitos sem custo nesse período.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 mx-auto max-w-[1100px] px-5 md:px-10 py-20 md:py-28">
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <span className="text-xs tracking-wide text-ink-soft">05 — Dúvidas</span>
          <h2 className="mt-3 editorial-headline text-5xl md:text-6xl text-ink">
            Perguntas <br /><span className="lime-mark">frequentes</span>
          </h2>
          <p className="mt-6 text-ink-soft max-w-sm">
            Se algo não estiver claro, fale com a gente pelo WhatsApp e respondemos rapidinho.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-display font-bold text-lg md:text-xl text-ink hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-ink-soft text-base pb-6 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
