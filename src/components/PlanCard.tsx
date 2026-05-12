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
        "relative flex flex-col p-7 md:p-9 rounded-3xl",
        highlight
          ? "bg-ink text-paper"
          : "bg-paper text-ink border border-border",
      ].join(" ")}
      style={highlight ? { boxShadow: "var(--shadow-pop)" } : { boxShadow: "var(--shadow-card)" }}
    >
      {highlight && (
        <span className="absolute -top-3 left-7 text-[10px] font-semibold tracking-widest uppercase bg-lime text-ink px-3 py-1 rounded-full">
          Mais escolhido
        </span>
      )}
      <div className="font-display uppercase text-3xl font-black tracking-tight">{name}</div>
      <div className="mt-6">
        <div className={["text-5xl md:text-6xl font-display font-black tracking-tighter", highlight ? "text-paper" : "text-ink"].join(" ")}>
          {activationPrice}
        </div>
        <div className={["mt-1 text-sm", highlight ? "text-paper/60" : "text-ink-soft"].join(" ")}>
          ativação · depois {monthlyPrice}/mês de manutenção
        </div>
      </div>
      <ul className={["mt-8 space-y-3 text-sm leading-relaxed", highlight ? "text-paper/85" : "text-ink-soft"].join(" ")}>
        {features.map((f) => (
          <li key={f} className="flex gap-3">
            <span className={["mt-2 h-1.5 w-1.5 rounded-full flex-none", highlight ? "bg-lime" : "bg-flame"].join(" ")} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className={[
          "mt-10 inline-flex items-center justify-center h-13 py-4 px-6 rounded-full text-sm font-semibold tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98]",
          highlight ? "bg-lime text-ink" : "bg-ink text-paper",
        ].join(" ")}
      >
        Selecionar plano
      </button>
    </motion.div>
  );
}
