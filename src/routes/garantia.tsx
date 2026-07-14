import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/garantia")({
  beforeLoad: () => { throw redirect({ to: "/security-and-delivery" }); },
});
