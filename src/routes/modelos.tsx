import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ModelGrid } from "@/components/ModelGrid";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/modelos")({
  component: WorkLayout,
  head: () => ({
    meta: [
      { title: "Work · Filro" },
      { name: "description", content: "Explore Filro's page templates: local shop, clinic, restaurant, retail, automotive and more. Each template is adapted with your brand, colors, and content." },
      { property: "og:title", content: "Work · Filro" },
      { property: "og:description", content: "Work de página prontos para padarias, clínicas, restaurantes, moda e mais. Adaptados ao seu negócio." },
      { property: "og:url", content: "https://setup.filro.site/modelos" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/modelos" }],
  }),
});

function WorkLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId !== "/modelos" && m.routeId.startsWith("/modelos/"));
  if (isChild) return <Outlet />;
  return <WorkPage />;
}



function WorkPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-10 md:pt-20 pb-10">
          <span className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft">
            <span className="h-1.5 w-6 bg-flame" /> Work
          </span>
          <h1 className="mt-4 editorial-headline text-5xl md:text-7xl text-ink max-w-3xl">
            Pick a <span className="lime-mark">visual direction</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-pretty">
            Each template is a professional starting point tailored to a business type. Pick one, choose a plan, and the Filro team customizes it with your colors, photos, services, and contact.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
          <ModelGrid />
        </section>

        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
          <div className="rounded-[3rem] border border-border bg-paper p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-soft">Ready to start?</span>
              <h2 className="mt-4 editorial-headline text-4xl md:text-6xl text-ink max-w-2xl">
                Veja os planos e ative within 1 business day.
              </h2>
            </div>
            <Link to="/planos" className="inline-flex items-center h-14 px-8 rounded-2xl bg-ink text-paper font-semibold tracking-wide hover:scale-[1.02] transition-transform self-start md:self-end">
              See pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
