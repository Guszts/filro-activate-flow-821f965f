import { createFileRoute } from "@tanstack/react-router";
import { LojaPreview } from "./dev.preview.loja-local";

export const Route = createFileRoute("/atelier")({
  component: LojaPreview,
  head: () => ({
    meta: [
      { title: "Atelier Norte · Moda e curadoria local" },
      { name: "description", content: "Atelier Norte — moda, acessórios e objetos para casa com curadoria autoral e atendimento por WhatsApp." },
      { property: "og:title", content: "Atelier Norte · Loja Local" },
      { property: "og:description", content: "Curadoria autoral, peças atemporais e atendimento humano por WhatsApp." },
    ],
  }),
});
