import { motion } from "framer-motion";
import { useState, type ReactElement } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import padariaCover from "@/assets/cover-padaria.jpg";
import clinicaCover from "@/assets/cover-clinica.jpg";
import autoCover from "@/assets/cover-auto.jpg";
import restauranteCover from "@/assets/cover-restaurante.jpg";
import hamburguerCover from "@/assets/cover-hamburguer.jpg";
import modaCover from "@/assets/cover-moda.jpg";

type Cover = (props: { className?: string }) => ReactElement;

const photoCover =
  (src: string, alt: string): Cover =>
  ({ className }) => (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={896}
        height={704}
        className="h-full w-full object-cover"
      />
    </div>
  );

const ClinicaCover: Cover = photoCover(clinicaCover, "Capa do modelo Clínica");
const PadariaCover: Cover = photoCover(padariaCover, "Capa do modelo Padaria");
const AutoCover: Cover = photoCover(autoCover, "Capa do modelo Auto");
const RestauranteCover: Cover = photoCover(restauranteCover, "Capa do modelo Restaurante");
const HamburguerCover: Cover = photoCover(hamburguerCover, "Capa do modelo Hambúrguer");
const ModaCover: Cover = photoCover(modaCover, "Capa do modelo Moda");

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
