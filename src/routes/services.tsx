import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SERVICES = [
  { t: "Marketing websites", d: "Fast, SEO-friendly sites that reflect the actual quality of your business." },
  { t: "E-commerce", d: "Shopify or headless commerce setups tuned for conversion and operations." },
  { t: "CRM setup", d: "HubSpot, Pipedrive or custom — clean pipelines, deduped data, real reporting." },
  { t: "Payments", d: "Stripe checkout, subscriptions, tax and dunning wired end-to-end." },
  { t: "Booking & scheduling", d: "Calendly, Cal.com or custom booking flows integrated with your CRM." },
  { t: "Email marketing", d: "Deliverable transactional and campaign email — templates, flows, warm-up." },
  { t: "Automations", d: "Zapier / Make / n8n workflows that connect tools you already use." },
  { t: "Custom software", d: "Internal tools, dashboards and portals built on modern stacks." },
  { t: "Data & reporting", d: "Warehouses, dashboards and reports on top of the tools you already run." },
  { t: "Integrations", d: "APIs, webhooks and middleware to make separate tools behave as one." },
  { t: "SEO foundations", d: "Technical SEO, metadata, sitemap and content structure done right." },
  { t: "Analytics", d: "GA4, server-side events and dashboards you can actually trust." },
  { t: "Migrations", d: "Move off legacy sites, CRMs and stores without losing data or SEO." },
  { t: "Ongoing maintenance", d: "Monthly updates, monitoring, backups and small improvements." },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Filro" },
      { name: "description", content: "Fourteen services Filro implements: websites, CRMs, payments, automations, custom software and more." },
      { property: "og:title", content: "Services — Filro" },
      { property: "og:description", content: "Websites, CRMs, payments, automations and custom software — implemented as one connected system." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Services</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Every service below is designed to work with the others. We rarely ship one thing in isolation — the value comes from connection.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.t} className="rounded-2xl border border-border/60 p-5">
              <h3 className="font-display font-bold text-lg text-ink">{s.t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap gap-3">
          <Link to="/get-started" className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-paper">Get a written plan</Link>
          <Link to="/pricing" className="inline-flex h-12 items-center rounded-full border border-border/60 px-7 text-sm font-semibold text-ink">See pricing</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
