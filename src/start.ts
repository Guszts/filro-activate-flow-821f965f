import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Subdomínio wildcard *.filro.site → reescreve internamente para /s/{slug}
// Mantém URL pública como {slug}.filro.site mas serve o conteúdo da rota /s/$slug.
// Reservados: www, setup, app — caem no app normal (não são sites publicados).
const SUBDOMAIN_RESERVED = new Set(["www", "setup", "app", "api", "admin"]);

const subdomainRewriteMiddleware = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  // Só reescreve para *.filro.site (excluindo o domínio raiz)
  if (host.endsWith(".filro.site") && host !== "filro.site") {
    const sub = host.slice(0, -".filro.site".length);
    if (sub && !sub.includes(".") && !SUBDOMAIN_RESERVED.has(sub) && /^[a-z0-9-]+$/.test(sub)) {
      // Não reescreve assets, server fns ou rotas /api/*
      const isAsset = /\.[a-zA-Z0-9]+$/.test(url.pathname) || url.pathname.startsWith("/_serverFn") || url.pathname.startsWith("/api/");
      if (!isAsset) {
        // Reescreve só na rota raiz "/" — outras rotas do subdomínio (ex: /sobre) também passam,
        // mas para sites publicados só atendemos a página principal por enquanto.
        const rewrittenPath = url.pathname === "/" ? `/s/${sub}` : `/s/${sub}${url.pathname}`;
        const rewritten = new URL(rewrittenPath + url.search, url);
        const newRequest = new Request(rewritten, request);
        return next({ request: newRequest } as never);
      }
    }
  }

  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [subdomainRewriteMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
