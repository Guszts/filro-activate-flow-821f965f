import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { type ReactElement } from "react";
import padariaSrc from "@/assets/cover-padaria.jpg?w=896&format=webp";
import padariaSet from "@/assets/cover-padaria.jpg?w=480;768;896&format=webp&as=srcset";
import clinicaSrc from "@/assets/cover-clinica.jpg?w=896&format=webp";
import clinicaSet from "@/assets/cover-clinica.jpg?w=480;768;896&format=webp&as=srcset";
import autoSrc from "@/assets/cover-auto.jpg?w=896&format=webp";
import autoSet from "@/assets/cover-auto.jpg?w=480;768;896&format=webp&as=srcset";
import restauranteSrc from "@/assets/cover-restaurante.jpg?w=896&format=webp";
import restauranteSet from "@/assets/cover-restaurante.jpg?w=480;768;896&format=webp&as=srcset";
import hamburguerSrc from "@/assets/cover-hamburguer.jpg?w=896&format=webp";
import hamburguerSet from "@/assets/cover-hamburguer.jpg?w=480;768;896&format=webp&as=srcset";
import modaSrc from "@/assets/cover-moda.jpg?w=896&format=webp";
import modaSet from "@/assets/cover-moda.jpg?w=480;768;896&format=webp&as=srcset";
import clinicaLocalCover from "@/assets/dev-templates/clinica-local.jpg";
import restauranteCardapioCover from "@/assets/dev-templates/restaurante-cardapio.jpg";
import oficinaCover from "@/assets/dev-templates/oficina-auto.jpg";
import lojaCover from "@/assets/dev-templates/loja-local.jpg";
import prestadorCover from "@/assets/dev-templates/prestador-servico.jpg";
import landingCover from "@/assets/dev-templates/landing-vendas.jpg";
import viagemCover from "@/assets/dev-templates/viagem-wishes.jpg";

type Cover = (props: { className?: string }) => ReactElement;

const COVER_SIZES = "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw";

const photoCover =
  (src: string, srcSet: string | undefined, alt: string): Cover =>
  ({ className }) => (
    <div className={`relative overflow-hidden bg-paper ${className ?? ""}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={COVER_SIZES}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={896}
        height={704}
        className="h-full w-full object-cover object-center"
      />
    </div>
  );

interface Model {
  name: string;
  desc: string;
  Cover: Cover;
  /** Internal preview route. */
  previewPath: string;
  /** Featured = appears on the home page. */
  featured: boolean;
}

const models: Model[] = [
  // ===== FEATURED (home) — 7 modelos =====
  {
    name: "Clínica Local",
    desc: "Estrutura clara para clínicas, consultórios e estética.",
    Cover: photoCover(clinicaLocalCover, undefined, "Capa Clínica Local"),
    previewPath: "/modelos/clinica-local",
    featured: true,
  },
  {
    name: "Restaurante & Cardápio",
    desc: "Cardápio visual, combos e pedido por WhatsApp.",
    Cover: photoCover(restauranteCardapioCover, undefined, "Capa Restaurante e Cardápio"),
    previewPath: "/modelos/restaurante-cardapio",
    featured: true,
  },
  {
    name: "Oficina & Auto",
    desc: "Serviços, antes/depois e orçamento direto.",
    Cover: photoCover(oficinaCover, undefined, "Capa Oficina e Auto"),
    previewPath: "/modelos/oficina-auto",
    featured: true,
  },
  {
    name: "Loja Local",
    desc: "Vitrine de produtos e coleções em destaque.",
    Cover: photoCover(lojaCover, undefined, "Capa Loja Local"),
    previewPath: "/modelos/loja-local",
    featured: true,
  },
  {
    name: "Prestador de Serviço",
    desc: "Captação de orçamento para profissionais autônomos.",
    Cover: photoCover(prestadorCover, undefined, "Capa Prestador de Serviço"),
    previewPath: "/modelos/prestador-servico",
    featured: true,
  },
  {
    name: "Landing de Venda",
    desc: "Página única focada em conversão.",
    Cover: photoCover(landingCover, undefined, "Capa Landing de Venda"),
    previewPath: "/modelos/landing-vendas",
    featured: true,
  },
  {
    name: "Viagem & Turismo",
    desc: "Landing premium para agências e pacotes.",
    Cover: photoCover(viagemCover, undefined, "Capa Viagem e Turismo"),
    previewPath: "/modelos/viagem-wishes",
    featured: true,
  },
  // ===== EXTRAS (somente /modelos) — modelos antigos da Filro =====
  {
    name: "Clínica (exemplo Filro)",
    desc: "Versão alternativa de clínica já publicada.",
    Cover: photoCover(clinicaSrc, clinicaSet, "Capa Clínica Filro"),
    previewPath: "https://clinica.filro.site/",
    featured: false,
  },
  {
    name: "Padaria",
    desc: "Cardápio visual e localização em destaque.",
    Cover: photoCover(padariaSrc, padariaSet, "Capa Padaria"),
    previewPath: "https://padaria.filro.site/",
    featured: false,
  },
  {
    name: "Auto",
    desc: "Serviços, agendamento e contato direto.",
    Cover: photoCover(autoSrc, autoSet, "Capa Auto"),
    previewPath: "https://mecanica.filro.site/",
    featured: false,
  },
  {
    name: "Moda",
    desc: "Coleções e vitrine de produtos.",
    Cover: photoCover(modaSrc, modaSet, "Capa Moda"),
    previewPath: "https://roupas.filro.site/",
    featured: false,
  },
  {
    name: "Restaurante",
    desc: "Menu, fotos e reservas via WhatsApp.",
    Cover: photoCover(restauranteSrc, restauranteSet, "Capa Restaurante"),
    previewPath: "https://restaurante.filro.site/",
    featured: false,
  },
  {
    name: "Hambúrguer",
    desc: "Cardápio rápido e pedido por WhatsApp.",
    Cover: photoCover(hamburguerSrc, hamburguerSet, "Capa Hambúrguer"),
    previewPath: "https://hamburguer.filro.site/",
    featured: false,
  },
];

interface ModelGridProps {
  /** When true, only featured (home) models are rendered. */
  featuredOnly?: boolean;
}

export function ModelGrid({ featuredOnly = false }: ModelGridProps) {
  const visible = featuredOnly ? models.filter((m) => m.featured) : models;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((m, i) => {
        const Cover = m.Cover;

        return (
          <motion.article
            key={m.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
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
                <a
                  href={m.previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 grid place-items-center rounded-2xl border border-border text-xs font-semibold tracking-wider hover:bg-ink hover:text-paper transition-colors"
                >
                  Ver exemplo
                </a>
                <Link
                  to="/"
                  hash="ativacao"
                  className="flex-1 h-10 grid place-items-center rounded-2xl bg-ink text-paper text-xs font-semibold tracking-wider hover:scale-[1.02] transition-transform"
                >
                  Usar este
                </Link>
              </div>

            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
