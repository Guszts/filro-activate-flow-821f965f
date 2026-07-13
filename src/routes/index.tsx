import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Filro — US digital implementation partner" },
      { name: "description", content: "We design and build connected digital systems — websites, CRMs, payments and automations — for US businesses ready to grow." },
      { property: "og:title", content: "Filro — US digital implementation partner" },
      { property: "og:description", content: "Websites, CRMs, payments and automations working together as one revenue system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-[1200px] px-5 md:px-10 pt-16 md:pt-24 pb-20 md:pb-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Digital Implementation Partner</p>
          <h1 className="mt-4 font-display font-black text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
            Websites, CRMs, payments and automations — built as one system.
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-ink-soft">
            Filro designs and implements connected digital systems so US businesses stop juggling
            disconnected tools and start operating like one team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/get-started" className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-paper hover:opacity-90 transition">
              Get a written plan
            </Link>
            <Link to="/pricing" className="inline-flex h-12 items-center rounded-full border border-border/60 px-7 text-sm font-semibold text-ink hover:bg-surface transition">
              See pricing
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-16 grid gap-8 md:grid-cols-3">
          {[
            { t: "One connected system", d: "Website + CRM + payments + email + automation, designed together." },
            { t: "Async, senior team", d: "No account managers. You work directly with the people building it." },
            { t: "Documented delivery", d: "Written scope, weekly progress, handover docs — no surprises." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border/60 p-6">
              <h3 className="font-display font-bold text-lg text-ink">{c.t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{c.d}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-[1200px] px-5 md:px-10 py-20 border-t border-border/60">
          <div className="grid gap-10 md:grid-cols-2 items-end">
            <div>
              <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight text-ink">
                Ready to see what your system could look like?
              </h2>
              <p className="mt-3 text-ink-soft max-w-md">
                Tell us about your business and we'll send back a written plan with scope, timeline and price — usually within one business day.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/get-started" className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-paper">
                Get a written plan
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
