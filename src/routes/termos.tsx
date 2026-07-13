import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LEGAL_BUSINESS_NAME, LEGAL_CONTACT_EMAIL, GOVERNING_LAW, TERMS_VERSION, TERMS_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Filro" },
      { name: "description", content: "The terms that govern the use of Filro's website and services." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[820px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-4xl tracking-tight">Terms of Service</h1>
        <p className="text-xs text-ink-soft mt-2">Version {TERMS_VERSION} · Last updated {TERMS_UPDATED}</p>

        <section className="mt-8 space-y-4 text-ink-soft leading-relaxed">
          <p>These Terms govern your use of the {LEGAL_BUSINESS_NAME} ("Filro", "we", "our") website and services. By using them you agree to these Terms.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">1. Services</h2>
          <p>Filro provides digital implementation services (websites, systems, integrations, automations) plus ongoing maintenance under the plan you select.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">2. Fees</h2>
          <p>Plans include a one-time implementation fee and a recurring monthly maintenance fee, both charged in USD via Stripe. All fees are non-refundable unless required by law or explicitly stated in a written agreement.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">3. Scope</h2>
          <p>The scope of each implementation is defined in the written plan we send before you commit. Changes outside that scope may result in additional fees.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">4. Client responsibilities</h2>
          <p>You are responsible for providing accurate information, timely feedback and access to the accounts we need to complete the implementation.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">5. Ownership</h2>
          <p>You own the accounts, content and data. We retain rights only over reusable tooling, templates and libraries we bring to the engagement.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">6. Cancellation</h2>
          <p>You can cancel your monthly maintenance at any time; access continues until the end of the paid billing period.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">7. Warranties & liability</h2>
          <p>Services are provided "as is". We do not guarantee specific business outcomes (revenue, rankings). Our aggregate liability will not exceed the fees you paid us in the prior 12 months.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">8. Governing law</h2>
          <p>These Terms are governed by {GOVERNING_LAW}.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">9. Contact</h2>
          <p>{LEGAL_CONTACT_EMAIL}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
