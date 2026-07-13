import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SECTIONS = [
  { t: "How we deliver", items: [
    "Written scope before you commit.",
    "One project manager and one lead engineer, both senior.",
    "Weekly progress notes and a shared staging environment.",
    "Documented handover: architecture, credentials, runbooks.",
  ]},
  { t: "Security", items: [
    "Least-privilege access to your accounts (SSO where possible).",
    "Secrets stored in a secrets manager, never in code.",
    "Encrypted backups for anything we host on your behalf.",
    "Two-factor authentication required for team access.",
  ]},
  { t: "What we don't promise", items: [
    "We don't guarantee revenue or ranking outcomes — no one honest can.",
    "We don't lock you into proprietary tech; you keep every account.",
  ]},
];

export const Route = createFileRoute("/security-and-delivery")({
  head: () => ({
    meta: [
      { title: "Security & delivery — Filro" },
      { name: "description", content: "How Filro delivers, what we secure, and what we don't promise." },
      { property: "og:title", content: "Security & delivery — Filro" },
      { property: "og:description", content: "How we deliver, what we secure, and what we won't promise." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[880px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Security & delivery</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Straightforward answers on how we work, what we secure, and what we won't promise.
        </p>

        {SECTIONS.map((s) => (
          <section key={s.t} className="mt-12">
            <h2 className="font-display font-bold text-2xl text-ink">{s.t}</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              {s.items.map((i) => (
                <li key={i} className="flex gap-3"><span aria-hidden>•</span><span>{i}</span></li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
