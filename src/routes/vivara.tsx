import { createFileRoute } from "@tanstack/react-router";
import { ClinicaPreview } from "./dev.preview.clinica-local";

export const Route = createFileRoute("/vivara")({
  component: ClinicaPreview,
  head: () => ({
    meta: [
      { title: "eye surgeons · Saving Eyes, Changing Lives" },
      { name: "description", content: "Premium ophthalmology care — cataract, corneal and laser vision treatments delivered by fellowship-trained surgeons." },
      { property: "og:title", content: "eye surgeons · Saving Eyes, Changing Lives" },
      { property: "og:description", content: "Specialist eye surgery, advanced diagnostics, and personalised treatment from consultation to recovery." },
    ],
  }),
});
