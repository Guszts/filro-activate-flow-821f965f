import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { FlaroChat } from "@/components/FlaroChat";
import { useRouterState } from "@tanstack/react-router";

function ConditionalFlaroChat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hiddenPrefixes = [
    "/checkout",
    "/console",
    "/painel",
    "/projeto",
    "/lead",
    "/settings",
    "/business-info",
    "/payment-success",
    "/payment-failed",
    "/login",
    "/register",
    "/verify-email",
    "/unsubscribe",
    "/suporte",
    "/modelos",
    "/wishes",
  ];
  if (hiddenPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <FlaroChat />;
}
import { capturePartnerFromUrl } from "@/lib/partner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-black text-ink">404</h1>
        <p className="mt-4 text-ink-soft">Page not found.</p>
        <a href="/" className="mt-6 inline-flex h-12 px-6 items-center rounded-full bg-ink text-paper font-semibold">Back home</a>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-black text-ink">Something went wrong</h1>
        <p className="mt-2 text-ink-soft text-sm">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 inline-flex h-12 px-6 items-center rounded-full bg-ink text-paper font-semibold">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0f0f10" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { title: "Filro — US digital implementation partner" },
      { name: "description", content: "Filro designs and implements connected digital systems — websites, CRMs, payments and automations — for US businesses." },
      { name: "keywords", content: "digital implementation, web development agency USA, CRM setup, Stripe integration, automation partner, custom software, revenue system" },
      { name: "application-name", content: "Filro" },
      { name: "apple-mobile-web-app-title", content: "Filro" },
      { name: "author", content: "Filro" },
      { property: "og:site_name", content: "Filro" },
      { property: "og:title", content: "Filro — US digital implementation partner" },
      { property: "og:description", content: "Websites, CRMs, payments and automations working together as one revenue system." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Filro — US digital implementation partner" },
      { name: "twitter:description", content: "Websites, CRMs, payments and automations built as one connected system." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Archivo:wght@500;600;700;800;900&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Filro",
          alternateName: ["Filro Setup", "Setup Filro", "Filro Site", "Setup Filro Site"],
          url: "https://setup.filro.site",
          logo: "https://setup.filro.site/favicon.ico",
          description: "Estrutura digital simples que transforma Instagram, Google e WhatsApp em pedidos de orçamento para negócios locais.",
          sameAs: ["https://filro.site", "https://setup.filro.site"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Filro Setup",
          alternateName: ["Filro", "Setup Filro", "Filro Site"],
          url: "https://setup.filro.site",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://setup.filro.site/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { capturePartnerFromUrl(); }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Decorative brand blobs — global personality background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="float-slow absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
               style={{ background: "radial-gradient(circle, var(--flame), transparent 60%)" }} />
          <div className="float-slower absolute top-1/3 -left-40 h-[480px] w-[480px] rounded-full blur-3xl opacity-35"
               style={{ background: "radial-gradient(circle, var(--lime), transparent 60%)" }} />
          <div className="float-slow absolute bottom-0 right-1/4 h-[460px] w-[460px] rounded-full blur-3xl opacity-30"
               style={{ background: "radial-gradient(circle, var(--azure), transparent 60%)" }} />
        </div>
        <PaymentTestModeBanner />
        <Outlet />
        <ConditionalFlaroChat />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
