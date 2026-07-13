import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LEGAL_BUSINESS_NAME, LEGAL_CONTACT_EMAIL, PRIVACY_VERSION, PRIVACY_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Filro" },
      { name: "description", content: "How Filro collects, uses and protects your personal information." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[820px] px-5 md:px-10 py-16 md:py-24 prose prose-neutral">
        <h1 className="font-display font-black text-4xl tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-ink-soft mt-2">Version {PRIVACY_VERSION} · Last updated {PRIVACY_UPDATED}</p>

        <section className="mt-8 space-y-4 text-ink-soft leading-relaxed">
          <p>This Privacy Policy explains how {LEGAL_BUSINESS_NAME} ("we", "our", "Filro") collects, uses and protects your personal information when you use our website and services.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">1. Information we collect</h2>
          <p>We collect information you provide directly (name, email, company details, project information) and information collected automatically (log data, device info, analytics).</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">2. How we use it</h2>
          <p>To deliver services, communicate with you, process payments (via Stripe), operate our website, and comply with legal obligations.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">3. Sharing</h2>
          <p>We use third-party processors including hosting providers, Stripe (payments), Supabase (database & auth), and email delivery services. We do not sell your personal information.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">4. Data retention</h2>
          <p>We retain your data as long as your account is active and as needed to comply with legal obligations.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">5. Your rights</h2>
          <p>You can request access, correction, or deletion of your personal information by emailing {LEGAL_CONTACT_EMAIL}.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">6. Security</h2>
          <p>We use industry-standard security controls, including encryption in transit and at rest for data we host on your behalf.</p>

          <h2 className="font-display font-bold text-xl text-ink mt-8">7. Contact</h2>
          <p>Questions about this policy: {LEGAL_CONTACT_EMAIL}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
