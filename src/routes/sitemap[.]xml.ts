import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://setup.filro.site";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/planos", changefreq: "weekly", priority: "0.9" },
          { path: "/modelos", changefreq: "weekly", priority: "0.8" },
          { path: "/como-funciona", changefreq: "monthly", priority: "0.8" },
          { path: "/planos/start", changefreq: "monthly", priority: "0.7" },
          { path: "/planos/essencial", changefreq: "monthly", priority: "0.7" },
          { path: "/planos/plus", changefreq: "monthly", priority: "0.7" },
          { path: "/planos/profissional", changefreq: "monthly", priority: "0.7" },
          { path: "/planos/priority", changefreq: "monthly", priority: "0.7" },
          { path: "/planos/premium", changefreq: "monthly", priority: "0.7" },
          { path: "/docs", changefreq: "monthly", priority: "0.6" },
          { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
          { path: "/termos", changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
