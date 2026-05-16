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
import { capturePartnerFromUrl } from "@/lib/partner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-black text-ink">404</h1>
        <p className="mt-4 text-ink-soft">Página não encontrada.</p>
        <a href="/" className="mt-6 inline-flex h-12 px-6 items-center rounded-full bg-ink text-paper font-semibold">Voltar ao início</a>
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
        <h1 className="font-display text-3xl font-black text-ink">Algo deu errado</h1>
        <p className="mt-2 text-ink-soft text-sm">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 inline-flex h-12 px-6 items-center rounded-full bg-ink text-paper font-semibold">Tentar novamente</button>
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
      { title: "Filro Setup — Sites profissionais para negócios locais" },
      { name: "description", content: "Filro Setup: ative em 24h sua página, cardápio digital, portfólio ou site de negócio. Design editorial, checkout seguro e suporte por WhatsApp." },
      { name: "keywords", content: "Filro, Filro Site, Setup Filro, Filro Setup, Setup Filro site, filro.site, setup.filro.site, site para negócio local, cardápio digital, página profissional, portfólio online, site para clínica, site para restaurante, site para padaria, ativação de presença digital" },
      { name: "application-name", content: "Filro" },
      { name: "apple-mobile-web-app-title", content: "Filro" },
      { name: "author", content: "Filro" },
      { property: "og:site_name", content: "Filro" },
      { property: "og:title", content: "Filro Setup — Sites profissionais para negócios locais" },
      { property: "og:description", content: "Filro Setup: ative em 24h sua página, cardápio digital, portfólio ou site de negócio. Design editorial e checkout seguro." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "https://setup.filro.site/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Filro Setup — Sites profissionais para negócios locais" },
      { name: "twitter:description", content: "Ativação digital rápida: página, cardápio, portfólio ou site de negócio." },
      { name: "twitter:image", content: "https://setup.filro.site/og-cover.png" },
    ],
    links: [
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
          description: "Páginas profissionais e sites para negócios locais com ativação rápida.",
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
        <FlaroChat />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
