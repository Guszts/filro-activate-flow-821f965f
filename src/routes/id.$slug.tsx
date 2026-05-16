import { createFileRoute } from "@tanstack/react-router";
import { getPublicFlaroDevSite } from "@/lib/flaro-dev.public.functions";
import { useMemo } from "react";

export const Route = createFileRoute("/id/$slug")({
  loader: async ({ params }) => getPublicFlaroDevSite({ data: { slug: params.slug } }),
  component: PublicSitePage,
  head: ({ loaderData }) => {
    if (!loaderData || !loaderData.found) {
      return { meta: [{ title: "Página não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const seo = loaderData.seo;
    return {
      meta: [
        { title: seo?.title || loaderData.projectName },
        ...(seo?.description ? [{ name: "description", content: seo.description }] : []),
        ...(seo?.og_image_url ? [{ property: "og:image", content: seo.og_image_url }] : []),
      ],
    };
  },
});

function PublicSitePage() {
  const data = Route.useLoaderData();

  const srcDoc = useMemo(() => {
    if (!data.found) return "";
    const styleTag = data.css.trim() ? `<style>${data.css}</style>` : "";
    const scriptTag = data.js.trim() ? `<script>${data.js}</script>` : "";
    if (data.html.includes("</head>")) {
      return data.html
        .replace("</head>", `${styleTag}</head>`)
        .replace("</body>", `${scriptTag}</body>`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styleTag}</head><body>${data.html}${scriptTag}</body></html>`;
  }, [data]);

  if (!data.found) {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-6xl font-black text-ink">404</h1>
          <p className="mt-3 text-ink-soft">Esta página não existe ou foi despublicada.</p>
          <a
            href="/desenvolvedor"
            className="mt-6 inline-flex h-11 px-5 items-center rounded-full bg-ink text-paper font-semibold"
          >
            Explorar o Flaro Dev
          </a>
        </div>
      </main>
    );
  }

  return (
    <iframe
      title={data.seo?.title || data.projectName}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
      className="w-screen h-screen border-0 block"
    />
  );
}
