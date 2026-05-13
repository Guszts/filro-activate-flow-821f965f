import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const items = [
  {
    name: "Carla M.",
    business: "Padaria Vó Lúcia",
    text: "Recebi minha página em menos de 24 horas e já comecei a receber pedidos pelo WhatsApp no mesmo dia. Visual limpo, fácil de mostrar pro cliente.",
  },
  {
    name: "Rodrigo S.",
    business: "Estúdio de Tatuagem",
    text: "Eles entenderam a vibe do estúdio. Portfólio organizado, contato direto, sem enrolação. Indico de olhos fechados.",
  },
  {
    name: "Janaína P.",
    business: "Salão de Beleza Bloom",
    text: "Cardápio de serviços impecável e o agendamento via WhatsApp simplificou minha vida. Suporte rápido sempre que preciso ajustar algo.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-stone py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs tracking-wide text-ink-soft">06 — Quem confia</span>
            <h2 className="mt-3 editorial-headline text-5xl md:text-7xl text-ink max-w-2xl">
              Negócios que <span className="lime-mark">já ativaram</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-ink-soft text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-flame text-flame" />
              ))}
            </div>
            <span>4,9 / 5 — média de avaliação</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-3xl bg-paper border border-border p-7 flex flex-col"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <Quote className="h-7 w-7 text-flame" />
              <blockquote className="mt-5 text-ink text-base leading-relaxed flex-1">
                {t.text}
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border">
                <div className="font-display font-black text-ink">{t.name}</div>
                <div className="text-xs tracking-wide text-ink-soft mt-0.5">{t.business}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
