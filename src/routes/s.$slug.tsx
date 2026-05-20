import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicSiteBySlug } from "@/lib/dev/generator.functions";
import { RenderedSite } from "@/components/dev-site/RenderedSite";
import { getTemplateComponent } from "@/lib/dev/template-registry";

export const Route = createFileRoute("/s/$slug")({
  loader: async ({ params }) => {
    const res = await getPublicSiteBySlug({ data: { slug: params.slug } });
    if (!res.site) throw notFound();
    return { site: res.site };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.site?.business_name ?? "Site";
    return {
      meta: [
        { title: `${name}` },
        { name: "description", content: `${name} — site oficial.` },
      ],
    };
  },
  component: PublicSitePage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-ink p-10 text-center">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-soft">404</div>
        <h1 className="mt-3 text-3xl font-bold">Site não encontrado</h1>
        <p className="mt-2 text-ink-soft">Esse endereço ainda não foi publicado.</p>
        <a href="/dev" className="mt-6 inline-flex h-12 px-6 items-center rounded-2xl bg-ink text-paper font-semibold">Criar meu site</a>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-10 text-center">
      <div>
        <h1 className="text-2xl font-bold">Erro ao carregar</h1>
        <p className="text-ink-soft mt-2">{error.message}</p>
      </div>
    </div>
  ),
});

function PublicSitePage() {
  const { site } = Route.useLoaderData();
  const content = (site.generated_content ?? {}) as Record<string, unknown>;
  // Once the user has any AI-generated/edited content (hero present), render
  // that JSON so chat edits actually show up. Only fall back to the bespoke
  // template component while the project is still untouched.
  const hasEdits = content && typeof content === "object" && "hero" in content;
  if (!hasEdits) {
    const TemplateComp = getTemplateComponent(site.template_slug);
    if (TemplateComp) return <TemplateComp />;
  }
  return <RenderedSite content={content} businessName={site.business_name ?? "Site"} />;
}

