import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/comparar")({
  beforeLoad: () => { throw redirect({ to: "/compare" }); },
});
