import type { ComponentType } from "react";
import { ClinicaPreview } from "@/routes/dev.preview.clinica-local";
import { RestaurantePreview } from "@/routes/dev.preview.restaurante-cardapio";
import { OficinaPreview } from "@/routes/dev.preview.oficina-auto";
import { MornaMarket } from "@/routes/dev.preview.loja-local";
import { RoofProSite } from "@/routes/dev.preview.prestador-servico";
import { SerenityYoga } from "@/routes/dev.preview.landing-vendas";
import { WishesPreview } from "@/routes/dev.preview.viagem-wishes";

/**
 * Maps a template slug to the exact bespoke preview component used on
 * /dev/preview/{slug}. When a user picks a template, the generated project
 * loads this component as its starting site — so the project preview matches
 * the template preview pixel-for-pixel.
 */
export const TEMPLATE_COMPONENTS: Record<string, ComponentType> = {
  "clinica-local": ClinicaPreview,
  "restaurante-cardapio": RestaurantePreview,
  "oficina-auto": OficinaPreview,
  "loja-local": MornaMarket,
  "prestador-servico": RoofProSite,
  "landing-vendas": SerenityYoga,
  "viagem-wishes": WishesPreview,
};

export function getTemplateComponent(slug: string | null | undefined): ComponentType | null {
  if (!slug) return null;
  return TEMPLATE_COMPONENTS[slug] ?? null;
}
