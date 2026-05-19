import { createFileRoute } from "@tanstack/react-router";
import { RestaurantePreview } from "./dev.preview.restaurante-cardapio";

export const Route = createFileRoute("/forno")({
  component: RestaurantePreview,
  head: () => ({
    meta: [
      { title: "Forno & Brasa · Restaurante autoral" },
      { name: "description", content: "Forno & Brasa — cardápio autoral, combos, reservas e delivery próprio." },
      { property: "og:title", content: "Forno & Brasa · Restaurante autoral" },
      { property: "og:description", content: "Pratos frescos, combos e reservas direto pelo WhatsApp." },
    ],
  }),
});
