import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PlanCardProps {
  name: string;
  activationPrice: string;
  monthlyPrice: string;
  features: string[];
  highlight?: boolean;
  onSelect?: () => void;
  index?: number;
  disabled?: boolean;
  disabledLabel?: string;
}

export function PlanCard({
  name,
  activationPrice,
  monthlyPrice,
  features,
  highlight = false,
  onSelect,
  index = 0,
  disabled = false,
  disabledLabel,
}: PlanCardProps) {

  // Highlight (Plus) — keep exactly as-is.
  if (highlight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex flex-col p-7 md:p-9 rounded-3xl overflow-hidden bg-paper text-ink border border-ink/10 lg:scale-[1.03] lg:z-10 ${disabled ? "opacity-60 grayscale" : ""}`}
        style={{ boxShadow: "var(--shadow-pop)" }}
      >

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
        <div className="relative z-10 font-display text-3xl font-black tracking-tight">{name}</div>
        <div className="relative z-10 mt-6">
          <div className="text-5xl md:text-6xl font-display font-black tracking-tighter text-ink">
            {activationPrice}
          </div>
          <div className="mt-1 text-sm text-ink-soft">
            activation · then {monthlyPrice}/mo maintenance
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
          onClick={disabled ? undefined : onSelect}
          disabled={disabled}
          className="relative z-10 mt-10 inline-flex items-center justify-center h-13 py-4 px-6 rounded-2xl text-sm font-semibold tracking-wide transition-transform bg-ink text-paper disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-soft enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
        >
          {disabled ? (disabledLabel ?? "Indisponível") : "Selecionar plano"}
        </button>

      </motion.div>
    );
  }

  // Non-highlighted (refined): cleaner, minimal, with hover lift + accent stripe.
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={disabled ? undefined : { y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
      className={`group relative flex flex-col p-7 md:p-9 rounded-3xl overflow-hidden bg-paper text-ink border border-border transition-shadow ${disabled ? "opacity-60 grayscale" : ""}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >

      {/* subtle accent stripe top */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ink/15 to-transparent" />
      {/* corner accent dot that grows on hover */}
      <div aria-hidden className="absolute top-5 right-5 h-2 w-2 rounded-full bg-flame transition-all duration-500 group-hover:w-10 group-hover:bg-flame" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
          Plan
        </div>
        <div className="mt-2 font-display text-3xl font-black tracking-tight text-ink">{name}</div>
      </div>

      <div className="relative z-10 mt-6">
        <div className="text-5xl md:text-[3.5rem] font-display font-black tracking-tighter text-ink leading-none">
          {activationPrice}
        </div>
        <div className="mt-2 text-sm text-ink-soft">
          activation · then <span className="text-ink font-semibold">{monthlyPrice}/mo</span> maintenance
        </div>
      </div>

      <div className="relative z-10 my-7 h-px bg-border" />

      <ul className="relative z-10 space-y-3 text-sm leading-relaxed text-ink-soft">
        {features.map((f) => (
          <li key={f} className="flex gap-3 items-start">
            <span className="mt-0.5 h-5 w-5 rounded-full bg-muted grid place-items-center flex-none group-hover:bg-lime/70 transition-colors">
              <Check className="h-3 w-3 text-ink" />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={disabled ? undefined : onSelect}
        disabled={disabled}
        className="relative z-10 mt-10 inline-flex items-center justify-center h-13 py-4 px-6 rounded-2xl text-sm font-semibold tracking-wide transition-all border border-ink/20 text-ink bg-paper enabled:hover:bg-ink enabled:hover:text-paper enabled:hover:border-ink disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-soft disabled:border-transparent"
      >
        {disabled ? (disabledLabel ?? "Indisponível") : "Selecionar plano"}
      </button>

    </motion.div>
  );
}
