import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/planos/")({
  beforeLoad: () => { throw redirect({ to: "/pricing" }); },
});
