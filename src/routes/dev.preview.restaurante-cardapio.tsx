import { createFileRoute } from "@tanstack/react-router";
import { SushiXTI } from "./sushixti";

export const Route = createFileRoute("/dev/preview/restaurante-cardapio")({
  component: RestaurantePreview,
  head: () => ({
    meta: [
      { title: "SUSHI X TI · Restaurante e Cardápio" },
      { name: "description", content: "SUSHI X TI — cardápio autoral japonês, omakase e reservas." },
    ],
  }),
});

export function RestaurantePreview() {
  return <SushiXTI />;
}
