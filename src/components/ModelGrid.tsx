import { motion } from "framer-motion";
import type { ReactElement } from "react";

type Cover = (props: { className?: string }) => ReactElement;

// Each cover is a hand-composed abstract scene using Filro's palette.
// No images, no text — only color, shape, and rhythm.

const ClinicaCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.96_0.02_220)] ${className ?? ""}`}>
    <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,oklch(0.85_0.09_220/_0.55),transparent_60%)]" />
    {/* Plus cross — calm, medical */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-32 w-32">
        <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 rounded-full bg-azure" />
        <div className="absolute top-1/2 left-0 h-8 w-full -translate-y-1/2 rounded-full bg-azure" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper" />
      </div>
    </div>
    {/* Floating dots */}
    <div className="absolute left-6 top-6 h-2.5 w-2.5 rounded-full bg-azure/70" />
    <div className="absolute right-8 top-10 h-1.5 w-1.5 rounded-full bg-ink/40" />
    <div className="absolute right-12 bottom-10 h-2 w-2 rounded-full bg-azure/60" />
  </div>
);

const PadariaCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.95_0.05_75)] ${className ?? ""}`}>
    {/* Warm sun */}
    <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-flame/80" />
    <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[oklch(0.86_0.16_55)]" />
    {/* Wheat-like vertical strokes */}
    <div className="absolute bottom-0 left-0 right-0 flex h-24 items-end gap-1.5 px-6 pb-4">
      {[6, 10, 8, 12, 7, 11, 9, 13, 8, 10, 6].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-full bg-ink/85"
          style={{ height: `${h * 6}px` }}
        />
      ))}
    </div>
    <div className="absolute left-6 top-6 h-3 w-3 rounded-full bg-ink" />
  </div>
);

const AutoCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-ink ${className ?? ""}`}>
    {/* Speed lines */}
    <div className="absolute inset-0">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute h-[2px] bg-paper/60"
          style={{
            top: `${15 + i * 12}%`,
            left: `${i % 2 === 0 ? 10 : 30}%`,
            right: `${i % 2 === 0 ? 30 : 10}%`,
          }}
        />
      ))}
    </div>
    {/* Two wheels */}
    <div className="absolute bottom-8 left-10 h-16 w-16 rounded-full border-[6px] border-paper">
      <div className="absolute inset-2 rounded-full border-2 border-paper/50" />
    </div>
    <div className="absolute bottom-8 right-10 h-16 w-16 rounded-full border-[6px] border-lime">
      <div className="absolute inset-2 rounded-full border-2 border-lime/50" />
    </div>
  </div>
);

const ModaCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-paper ${className ?? ""}`}>
    {/* Diagonal color blocks */}
    <div className="absolute inset-0">
      <div className="absolute -left-10 -top-10 h-56 w-44 rotate-12 rounded-3xl bg-lime" />
      <div className="absolute right-0 top-12 h-40 w-28 -rotate-6 rounded-3xl bg-flame" />
      <div className="absolute bottom-0 left-12 h-24 w-40 rotate-3 rounded-3xl bg-ink" />
    </div>
    {/* Pearl */}
    <div className="absolute right-10 bottom-10 h-6 w-6 rounded-full bg-paper ring-2 ring-ink" />
  </div>
);

const RestauranteCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.94_0.04_250)] ${className ?? ""}`}>
    {/* Plate */}
    <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_20px_40px_-20px_oklch(0.255_0.035_260/0.4)]">
      <div className="absolute inset-3 rounded-full border border-stone/60" />
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-azure" />
    </div>
    {/* Cutlery as bars */}
    <div className="absolute left-6 top-1/2 h-24 w-2 -translate-y-1/2 rounded-full bg-ink" />
    <div className="absolute right-6 top-1/2 h-24 w-2 -translate-y-1/2 rounded-full bg-ink" />
    <div className="absolute right-[18px] top-1/2 h-6 w-6 -translate-y-[34px] rounded-sm bg-ink" />
  </div>
);

const HamburguerCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.93_0.08_60)] ${className ?? ""}`}>
    {/* Stacked burger as horizontal bands */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
      <div className="h-7 w-36 rounded-t-[28px] bg-[oklch(0.78_0.12_60)]" />
      <div className="h-2 w-40 rounded-full bg-lime" />
      <div className="h-4 w-40 rounded-md bg-ink" />
      <div className="h-2 w-40 rounded-full bg-flame" />
      <div className="h-6 w-36 rounded-b-[28px] bg-[oklch(0.7_0.13_55)]" />
    </div>
    {/* Sesame dots */}
    <div className="absolute left-1/2 top-[34%] -translate-x-8 h-1.5 w-1.5 rounded-full bg-paper/90" />
    <div className="absolute left-1/2 top-[32%] translate-x-2 h-1.5 w-1.5 rounded-full bg-paper/90" />
    <div className="absolute left-1/2 top-[36%] translate-x-10 h-1.5 w-1.5 rounded-full bg-paper/90" />
  </div>
);

const models: { name: string; desc: string; Cover: Cover }[] = [
  { name: "Clínica", desc: "Estrutura clara para clínicas e consultórios.", Cover: ClinicaCover },
  { name: "Padaria", desc: "Cardápio visual e localização em destaque.", Cover: PadariaCover },
  { name: "Auto", desc: "Serviços, agendamento e contato direto.", Cover: AutoCover },
  { name: "Moda", desc: "Coleções e vitrine de produtos.", Cover: ModaCover },
  { name: "Restaurante", desc: "Menu, fotos e reservas via WhatsApp.", Cover: RestauranteCover },
  { name: "Hambúrguer", desc: "Cardápio rápido e pedido por WhatsApp.", Cover: HamburguerCover },
];

export function ModelGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((m, i) => {
        const Cover = m.Cover;
        return (
          <motion.article
            key={m.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.35, ease: "easeOut" } }}
            className="group card-personality rounded-3xl bg-paper border border-border overflow-hidden flex flex-col"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="relative h-56 w-full overflow-hidden">
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Cover className="h-full w-full" />
              </motion.div>
              {/* Subtle sheen on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-paper/10 to-transparent" />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-display text-2xl font-black tracking-tight">{m.name}</h3>
              <p className="mt-2 text-sm text-ink-soft flex-1">{m.desc}</p>
              <div className="mt-6 flex gap-2">
                <button className="flex-1 h-10 rounded-2xl border border-border text-xs font-semibold tracking-wider hover:bg-ink hover:text-paper transition-colors">
                  Ver exemplo
                </button>
                <a
                  href="/#ativacao"
                  className="flex-1 h-10 grid place-items-center rounded-2xl bg-ink text-paper text-xs font-semibold tracking-wider hover:scale-[1.02] transition-transform"
                >
                  Usar este
                </a>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
