import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const STEPS = [
  { n: "01", t: "Written plan", d: "You share your business. We reply with a written scope, timeline and price." },
  { n: "02", t: "Kickoff", d: "Once you're in, we run a kickoff to align on outcomes and constraints." },
  { n: "03", t: "Implementation Brief", d: "You complete a structured brief covering brand, content, integrations and access." },
  { n: "04", t: "Design & build", d: "We design the interface, wire the integrations and set up the automations." },
  { n: "05", t: "Review", d: "You review a staging environment. We iterate on feedback in-line." },
  { n: "06", t: "Launch", d: "We publish, migrate DNS and hand over documentation." },
  { n: "07", t: "Maintenance", d: "Your monthly plan keeps the system healthy: updates, monitoring, improvements." },
];

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process — Filro" },
      { name: "description", content: "How Filro implements connected digital systems: from written plan to launch and ongoing maintenance." },
      { property: "og:title", content: "Process — Filro" },
      { property: "og:description", content: "Seven steps from written plan to launch." },
    ],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[1000px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Process</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          A predictable path from first conversation to live system — with the same senior team throughout.
        </p>
        <ol className="mt-12 space-y-6">
          {STEPS.map((s) => (
            <li key={s.n} className="grid gap-3 md:grid-cols-[120px_1fr] items-start border-t border-border/60 pt-6">
              <div className="font-display font-black text-3xl text-ink-soft">{s.n}</div>
              <div>
                <h3 className="font-display font-bold text-xl text-ink">{s.t}</h3>
                <p className="mt-1 text-ink-soft">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
