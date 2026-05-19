import { createFileRoute } from "@tanstack/react-router";
import { OficinaPreview } from "./dev.preview.oficina-auto";

export const Route = createFileRoute("/motorpro")({
  component: OficinaPreview,
  head: () => ({
    meta: [
      { title: "MotorPro · Oficina e estética automotiva" },
      { name: "description", content: "MotorPro — mecânica, elétrica, funilaria e estética automotiva com orçamento por WhatsApp." },
      { property: "og:title", content: "MotorPro · Oficina e estética automotiva" },
      { property: "og:description", content: "Diagnóstico transparente, peças com garantia e atendimento direto com o mecânico." },
    ],
  }),
});
