import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const ROWS: Array<{ cat: string; items: Array<{ f: string; launch: string; growth: string; rs: string; scale: string }> }> = [
  {
    cat: "Website",
    items: [
      { f: "Custom design", launch: "Up to 5 sections", growth: "Up to 10 pages", rs: "Unlimited", scale: "Custom" },
      { f: "SEO foundations", launch: "Basic", growth: "Advanced", rs: "Advanced", scale: "Custom" },
      { f: "CMS", launch: "—", growth: "Team CMS", rs: "Team CMS", scale: "Custom" },
    ],
  },
  {
    cat: "Systems",
    items: [
      { f: "CRM setup", launch: "—", growth: "Basic", rs: "Full pipeline", scale: "Custom" },
      { f: "Payments", launch: "—", growth: "Stripe", rs: "Stripe + subscriptions", scale: "Custom" },
      { f: "Automations", launch: "1", growth: "3", rs: "Up to 8", scale: "Unlimited" },
      { f: "Custom software", launch: "—", growth: "—", rs: "—", scale: "Included" },
    ],
  },
  {
    cat: "Support",
    items: [
      { f: "Response time", launch: "2 business days", growth: "1 business day", rs: "Same-day", scale: "SLA-backed" },
      { f: "Dedicated channel", launch: "Email", growth: "Email", rs: "Chat", scale: "Slack" },
      { f: "Strategy call", launch: "—", growth: "—", rs: "Monthly", scale: "Quarterly QBR" },
    ],
  },
];

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare plans — Filro" },
      { name: "description", content: "Side-by-side comparison of Filro's four plans: Launch, Growth, Revenue System and Scale." },
      { property: "og:title", content: "Compare plans — Filro" },
      { property: "og:description", content: "Full comparison across website, systems and support." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Compare plans</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          A full breakdown of what's included in each plan.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-3 pr-4 font-semibold text-ink-soft"></th>
                <th className="py-3 px-3 font-display font-bold text-ink">Launch</th>
                <th className="py-3 px-3 font-display font-bold text-ink">Growth</th>
                <th className="py-3 px-3 font-display font-bold text-ink">Revenue System</th>
                <th className="py-3 px-3 font-display font-bold text-ink">Scale</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((section) => (
                <>
                  <tr key={section.cat}>
                    <td colSpan={5} className="pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">{section.cat}</td>
                  </tr>
                  {section.items.map((r) => (
                    <tr key={r.f} className="border-t border-border/60">
                      <td className="py-3 pr-4 text-ink">{r.f}</td>
                      <td className="py-3 px-3 text-ink-soft">{r.launch}</td>
                      <td className="py-3 px-3 text-ink-soft">{r.growth}</td>
                      <td className="py-3 px-3 text-ink-soft">{r.rs}</td>
                      <td className="py-3 px-3 text-ink-soft">{r.scale}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link to="/pricing" className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-paper">See pricing</Link>
          <Link to="/get-started" className="inline-flex h-12 items-center rounded-full border border-border/60 px-7 text-sm font-semibold text-ink">Get a written plan</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
