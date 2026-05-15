import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PlanCardProps {
  name: string;
  activationPrice: string;
  monthlyPrice: string;
  features: string[];
  highlight?: boolean;
  onSelect?: () => void;
  index?: number;
  children?: ReactNode;
}

export function PlanCard({
  name,
  activationPrice,
  monthlyPrice,
  features,
  highlight = false,
  onSelect,
  index = 0,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative flex flex-col p-7 md:p-9 rounded-3xl overflow-hidden",
        highlight
          ? "bg-paper text-ink border border-ink/10"
          : "bg-paper text-ink border border-border",
      ].join(" ")}
      style={highlight ? { boxShadow: "var(--shadow-pop)" } : { boxShadow: "var(--shadow-card)" }}
    >
      {highlight && (
        <>
          {/* Flaro-style color blocks */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: -20, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: 12 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-16 -top-16 h-[220px] w-[180px] rounded-[3rem] bg-lime pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: 20, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-12 top-10 h-[160px] w-[120px] rounded-[3rem] bg-flame pointer-events-none"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-10 left-12 h-[110px] w-[200px] rounded-[3rem] bg-ink pointer-events-none hidden md:block"
          />
          <div
            aria-hidden
            className="absolute right-6 bottom-6 h-5 w-5 rounded-full bg-paper ring-2 ring-ink pointer-events-none"
          />
          <span className="relative z-10 inline-flex items-center self-start gap-2 text-[10px] font-semibold tracking-widest bg-ink text-paper px-3 py-1 rounded-2xl mb-4">
            Mais escolhido
          </span>
        </>
      )}
      <div className="relative z-10 font-display text-3xl font-black tracking-tight">{name}</div>
      <div className="relative z-10 mt-6">
        <div className="text-5xl md:text-6xl font-display font-black tracking-tighter text-ink">
          {activationPrice}
        </div>
        <div className="mt-1 text-sm text-ink-soft">
          ativação · depois {monthlyPrice}/mês de manutenção
        </div>
      </div>
      <ul className="relative z-10 mt-8 space-y-3 text-sm leading-relaxed text-ink-soft">
        {features.map((f) => (
          <li key={f} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-2xl flex-none bg-flame" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className="relative z-10 mt-10 inline-flex items-center justify-center h-13 py-4 px-6 rounded-2xl text-sm font-semibold tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] bg-ink text-paper"
      >
        Selecionar plano
      </button>
    </motion.div>
  );
}
