import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Em quanto tempo recebo minha página?",
    a: "Estimativa de até 24 horas após o envio completo das informações do seu negócio. Materiais incompletos podem alongar o prazo.",
  },
  {
    q: "Quanto custa? How it worksm os planos?",
    a: "We charge a one-time activation fee plus a monthly maintenance. Plans range from Launch ($2,500 + $297/mo) to Revenue System ($10,000 + $997/mo) — Scale is custom. See all pricing on /pricing.",
  },
  {
    q: "Posso enviar um modelo de referência?",
    a: "Yes. In the business info form you can attach a link, a file, or describe in free text how you'd like it to look.",
  },
  {
    q: "How does payment work?",
    a: "Secure payments via Stripe: credit or debit card. Activation is charged once; the monthly fee is charged on the same date each month.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Yes. No há fidelidade. Cancele a mensalidade a qualquer momento direto do seu painel. A página fica no ar até o fim do ciclo já pago.",
  },
  {
    q: "Yous fazem alterações depois de entregue?",
    a: "Yes. Pequenas alterações (texto, fotos, horários, contatos, preços de catálogo) estão incluídas na mensalidade. Mudanças estruturais maiores são orçadas à parte.",
  },
  {
    q: "Preciso ter domínio próprio?",
    a: "It's not required. We deliver on a subdomain we host (e.g. your-business.filro.site). If you have your own domain (e.g. yourbusiness.com), we set it up at no extra cost.",
  },
  {
    q: "Funciona bem no celular?",
    a: "Yes. Todas as páginas são 100% responsivas, otimizadas para mobile-first, e instaláveis como PWA (atalho na tela inicial do celular).",
  },
  {
    q: "Do you integrate with WhatsApp?",
    a: "Yes. A WhatsApp button is native to all plans. Clicks are tracked in your dashboard so you can measure conversion.",
  },
  {
    q: "Yous cuidam de SEO?",
    a: "Yes — technical SEO basics are included in every plan: meta tags, schema.org, sitemap.xml, robots.txt, image optimization. Content SEO (articles, blog) is a separate service.",
  },
  {
    q: "Quais formas de pagamento aceitam?",
    a: "Cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard), cartão de débito e Pix. Cartões internacionais funcionam via Stripe.",
  },
  {
    q: "What if I don't like the result?",
    a: "Incluímos uma rodada de revisão visual nos primeiros 7 days. Ajustes dentro do escopo são feitos sem custo nesse período.",
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
            If anything is unclear, reach out and we'll get back quickly.
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
