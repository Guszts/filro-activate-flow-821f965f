import { createFileRoute } from "@tanstack/react-router";
import { WishesPreview } from "./dev.preview.viagem-wishes";

export const Route = createFileRoute("/wishes")({
  component: WishesPreview,
  head: () => ({
    meta: [
      { title: "Wishes · Experiência de Viagem" },
      {
        name: "description",
        content:
          "Reserve sua próxima viagem com a Wishes — pacotes, destinos e experiências de viagem em português.",
      },
      { property: "og:title", content: "Wishes · Experiência de Viagem" },
      {
        property: "og:description",
        content:
          "Pacotes selecionados, destinos populares e reserva direta pelo WhatsApp.",
      },
    ],
  }),
});
