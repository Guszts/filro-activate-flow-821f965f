import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/planos/$slug")({
  beforeLoad: () => { throw redirect({ to: "/pricing" }); },
});
