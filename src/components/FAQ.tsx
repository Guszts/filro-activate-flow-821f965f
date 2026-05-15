import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Em quanto tempo recebo minha página?",
    a: "Estimativa de até 24 horas após o envio completo das informações do seu negócio. Materiais incompletos podem alongar o prazo.",
  },
  {
    q: "Posso enviar um modelo de referência?",
    a: "Sim. No formulário de informações do negócio, você pode anexar um link, arquivo ou descrever em texto livre como gostaria que ficasse.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Cobramos uma taxa única de ativação + uma mensalidade que cobre hospedagem, manutenção e pequenas alterações. Pagamento seguro pela Stripe.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade. Cancele a mensalidade a qualquer momento direto do seu painel.",
  },
  {
    q: "Vocês fazem alterações depois de entregue?",
    a: "Sim. Pequenas alterações (texto, fotos, horários, contatos) estão incluídas na mensalidade. Mudanças estruturais maiores são orçadas à parte.",
  },
  {
    q: "Preciso ter domínio próprio?",
    a: "Não é obrigatório. Entregamos em um subdomínio nosso, mas se você tiver um domínio (ex: meunegocio.com.br) configuramos sem custo adicional.",
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
