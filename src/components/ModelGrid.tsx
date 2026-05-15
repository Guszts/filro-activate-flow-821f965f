import { motion } from "framer-motion";
import { useState, type ReactElement } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import padariaCover from "@/assets/cover-padaria.jpg";

type Cover = (props: { className?: string }) => ReactElement;

// Each cover is a hand-composed abstract scene using Filro's palette.

const ClinicaCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.96_0.02_220)] ${className ?? ""}`}>
    <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,oklch(0.85_0.09_220/_0.55),transparent_60%)]" />
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-32 w-32">
        <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 rounded-full bg-azure" />
        <div className="absolute top-1/2 left-0 h-8 w-full -translate-y-1/2 rounded-full bg-azure" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper" />
      </div>
    </div>
    <div className="absolute left-6 top-6 h-2.5 w-2.5 rounded-full bg-azure/70" />
    <div className="absolute right-8 top-10 h-1.5 w-1.5 rounded-full bg-ink/40" />
    <div className="absolute right-12 bottom-10 h-2 w-2 rounded-full bg-azure/60" />
  </div>
);

const PadariaCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden ${className ?? ""}`}>
    <img
      src={padariaCover}
      alt="Capa do modelo Padaria"
      loading="lazy"
      width={896}
      height={704}
      className="h-full w-full object-cover"
    />
  </div>
);

const AutoCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-ink ${className ?? ""}`}>
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
    <div className="absolute inset-0">
      <div className="absolute -left-10 -top-10 h-56 w-44 rotate-12 rounded-3xl bg-lime" />
      <div className="absolute right-0 top-12 h-40 w-28 -rotate-6 rounded-3xl bg-flame" />
      <div className="absolute bottom-0 left-12 h-24 w-40 rotate-3 rounded-3xl bg-ink" />
    </div>
    <div className="absolute right-10 bottom-10 h-6 w-6 rounded-full bg-paper ring-2 ring-ink" />
  </div>
);

const RestauranteCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.94_0.04_250)] ${className ?? ""}`}>
    <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_20px_40px_-20px_oklch(0.255_0.035_260/0.4)]">
      <div className="absolute inset-3 rounded-full border border-stone/60" />
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-azure" />
    </div>
    <div className="absolute left-6 top-1/2 h-24 w-2 -translate-y-1/2 rounded-full bg-ink" />
    <div className="absolute right-6 top-1/2 h-24 w-2 -translate-y-1/2 rounded-full bg-ink" />
    <div className="absolute right-[18px] top-1/2 h-6 w-6 -translate-y-[34px] rounded-sm bg-ink" />
  </div>
);

const HamburguerCover: Cover = ({ className }) => (
  <div className={`relative overflow-hidden bg-[oklch(0.93_0.08_60)] ${className ?? ""}`}>
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
      <div className="h-7 w-36 rounded-t-[28px] bg-[oklch(0.78_0.12_60)]" />
      <div className="h-2 w-40 rounded-full bg-lime" />
      <div className="h-4 w-40 rounded-md bg-ink" />
      <div className="h-2 w-40 rounded-full bg-flame" />
      <div className="h-6 w-36 rounded-b-[28px] bg-[oklch(0.7_0.13_55)]" />
    </div>
    <div className="absolute left-1/2 top-[34%] -translate-x-8 h-1.5 w-1.5 rounded-full bg-paper/90" />
    <div className="absolute left-1/2 top-[32%] translate-x-2 h-1.5 w-1.5 rounded-full bg-paper/90" />
    <div className="absolute left-1/2 top-[36%] translate-x-10 h-1.5 w-1.5 rounded-full bg-paper/90" />
  </div>
);

interface Model {
  name: string;
  desc: string;
  Cover: Cover;
  highlights: string[];
}

const models: Model[] = [
  {
    name: "Clínica",
    desc: "Estrutura clara para clínicas e consultórios.",
    Cover: ClinicaCover,
    highlights: ["Especialidades e equipe", "Agendamento via WhatsApp", "Endereço com mapa"],
  },
  {
    name: "Padaria",
    desc: "Cardápio visual e localização em destaque.",
    Cover: PadariaCover,
    highlights: ["Cardápio com fotos", "Horário de funcionamento", "Pedido pelo WhatsApp"],
  },
  {
    name: "Auto",
    desc: "Serviços, agendamento e contato direto.",
    Cover: AutoCover,
    highlights: ["Lista de serviços", "Galeria de antes/depois", "Orçamento via WhatsApp"],
  },
  {
    name: "Moda",
    desc: "Coleções e vitrine de produtos.",
    Cover: ModaCover,
    highlights: ["Vitrine de produtos", "Coleções e lookbook", "Compra pelo WhatsApp"],
  },
  {
    name: "Restaurante",
    desc: "Menu, fotos e reservas via WhatsApp.",
    Cover: RestauranteCover,
    highlights: ["Menu completo", "Fotos do ambiente", "Reservas pelo WhatsApp"],
  },
  {
    name: "Hambúrguer",
    desc: "Cardápio rápido e pedido por WhatsApp.",
    Cover: HamburguerCover,
    highlights: ["Cardápio com combos", "Promoções em destaque", "Pedido pelo WhatsApp"],
  },
];

export function ModelGrid() {
  const [preview, setPreview] = useState<Model | null>(null);

  const goToActivation = () => {
    setPreview(null);
    if (typeof window !== "undefined") {
      window.location.hash = "#ativacao";
    }
  };

  return (
    <>
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
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-paper/10 to-transparent" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl font-black tracking-tight">{m.name}</h3>
                <p className="mt-2 text-sm text-ink-soft flex-1">{m.desc}</p>
                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreview(m)}
                    className="flex-1 h-10 rounded-2xl border border-border text-xs font-semibold tracking-wider hover:bg-ink hover:text-paper transition-colors"
                  >
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

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-black tracking-tight">
                  Modelo {preview.name}
                </DialogTitle>
                <DialogDescription className="text-ink-soft">
                  {preview.desc}
                </DialogDescription>
              </DialogHeader>
              <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border">
                <preview.Cover className="h-full w-full" />
              </div>
              <ul className="mt-2 space-y-2 text-sm text-ink-soft">
                {preview.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-flame flex-none" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToActivation}
                className="mt-4 h-12 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide hover:scale-[1.01] transition-transform"
              >
                Usar este modelo
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
