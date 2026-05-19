import { createFileRoute } from "@tanstack/react-router";
import { ClinicaPreview } from "./dev.preview.clinica-local";

export const Route = createFileRoute("/vivara")({
  component: ClinicaPreview,
  head: () => ({
    meta: [
      { title: "Vivara Clínica · Saúde com acolhimento" },
      { name: "description", content: "Vivara Clínica — especialidades médicas, equipe humanizada e agendamento online em poucos cliques." },
      { property: "og:title", content: "Vivara Clínica · Saúde com acolhimento" },
      { property: "og:description", content: "Especialidades, planos, convênios e agendamento direto pelo WhatsApp." },
    ],
  }),
});
