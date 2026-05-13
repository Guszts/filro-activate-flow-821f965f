import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-black text-ink">404</h1>
        <p className="mt-4 text-ink-soft">Página não encontrada.</p>
        <a href="/" className="mt-6 inline-flex h-12 px-6 items-center rounded-full bg-ink text-paper font-semibold">Voltar ao início</a>
      </div>
    </div>
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
      { title: "Filro — Ative sua presença digital" },
      { name: "description", content: "Páginas profissionais, cardápios digitais, portfólios e sites para negócios locais. Ativação rápida, design editorial e direto." },
      { property: "og:title", content: "Filro — Ative sua presença digital" },
      { property: "og:description", content: "Páginas profissionais, cardápios digitais, portfólios e sites para negócios locais. Ativação rápida, design editorial e direto." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Filro — Ative sua presença digital" },
      { name: "twitter:description", content: "Páginas profissionais, cardápios digitais, portfólios e sites para negócios locais. Ativação rápida, design editorial e direto." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db1d6b0e-ec10-4087-9c08-13d163ed03a6/id-preview-7f6d005e--dda9f651-8d6f-45c8-92a8-0cf8f17a35cf.lovable.app-1778606157284.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db1d6b0e-ec10-4087-9c08-13d163ed03a6/id-preview-7f6d005e--dda9f651-8d6f-45c8-92a8-0cf8f17a35cf.lovable.app-1778606157284.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PaymentTestModeBanner />
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
