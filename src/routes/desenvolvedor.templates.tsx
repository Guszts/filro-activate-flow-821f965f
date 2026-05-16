import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { listFlaroDevTemplates, createFlaroDevProject } from "@/lib/flaro-dev.functions";
import { FlaroDevEmptyState } from "@/components/flaro-dev/FlaroDevEmptyState";
import { ArrowLeft, Loader2, LayoutTemplate, Sparkles } from "lucide-react";

export const Route = createFileRoute("/desenvolvedor/templates")({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: "Templates · Flaro Dev" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
};

function TemplatesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const list = useServerFn(listFlaroDevTemplates);
  const create = useServerFn(createFlaroDevProject);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [fetching, setFetching] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/desenvolvedor/templates" } });
      return;
    }
    (async () => {
      const res = await list();
      setTemplates(res.templates as Template[]);
      setFetching(false);
    })();
  }, [loading, user, navigate, list]);

  async function handleUse(id: string) {
    setUsingId(id);
    try {
      const res = await create({ data: { templateId: id } });
      navigate({ to: "/desenvolvedor/projeto/$projectId", params: { projectId: res.id } });
    } finally {
      setUsingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[1200px] w-full px-5 md:px-10 py-12 md:py-16">
        <Link
          to="/desenvolvedor"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Flaro Dev
        </Link>
        <h1 className="editorial-headline text-4xl md:text-5xl text-ink">
          <LayoutTemplate className="inline h-8 w-8 mr-2 -mt-1" /> Templates
        </h1>
        <p className="mt-3 text-ink-soft max-w-2xl">
          Comece de um ponto pronto. Escolha um template e o Flaro Dev cria um novo projeto a partir dele.
        </p>

        <div className="mt-10">
          {fetching ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
            </div>
          ) : templates.length === 0 ? (
            <FlaroDevEmptyState
              title="Nenhum template disponível."
              description="Novos templates serão adicionados em breve. Enquanto isso, crie do zero conversando com o Flaro Dev."
              icon={<LayoutTemplate className="h-10 w-10" />}
              action={
                <Link
                  to="/desenvolvedor"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper font-semibold"
                >
                  <Sparkles className="h-4 w-4" /> Voltar e criar do zero
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-border bg-paper overflow-hidden shadow-card hover:border-ink/40 transition"
                >
                  <div className="aspect-video bg-secondary grid place-items-center">
                    {t.thumbnail_url ? (
                      <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <LayoutTemplate className="h-10 w-10 text-ink-soft/40" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-1">
                      {t.category}
                    </div>
                    <h3 className="font-display font-bold text-lg text-ink">{t.name}</h3>
                    {t.description && (
                      <p className="text-sm text-ink-soft mt-1 line-clamp-2">{t.description}</p>
                    )}
                    <button
                      onClick={() => handleUse(t.id)}
                      disabled={usingId === t.id}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ink text-paper font-semibold text-sm disabled:opacity-50"
                    >
                      {usingId === t.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Usar este template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
