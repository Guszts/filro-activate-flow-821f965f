import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import {
  listFlaroDevProjects,
  createFlaroDevProject,
  deleteFlaroDevProject,
} from "@/lib/flaro-dev.functions";
import { FlaroDevEmptyState } from "@/components/flaro-dev/FlaroDevEmptyState";
import { Sparkles, Plus, Loader2, Trash2, FolderKanban, LayoutTemplate, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/desenvolvedor/")({
  component: DesenvolvedorPage,
  head: () => ({
    meta: [
      { title: "Flaro Dev — Crie aplicativos web com IA · Filro" },
      { name: "description", content: "Flaro Dev: ambiente de desenvolvimento web com IA dentro do Filro Setup. Crie, edite, publique e gerencie projetos com chat inteligente." },
      { name: "robots", content: "index,follow" },
    ],
  }),
});

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  updated_at: string;
  current_version_id: string | null;
};

function DesenvolvedorPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const list = useServerFn(listFlaroDevProjects);
  const create = useServerFn(createFlaroDevProject);
  const del = useServerFn(deleteFlaroDevProject);

  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/desenvolvedor" } });
      return;
    }
    (async () => {
      const res = await list();
      setProjects(res.projects as Project[]);
      setFetching(false);
    })();
  }, [loading, user, navigate, list]);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await create({ data: {} });
      navigate({ to: "/desenvolvedor/projeto/$projectId", params: { projectId: res.id } });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      await del({ data: { id } });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-5 md:px-10 pt-16 md:pt-24 pb-10">
          <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-ink text-paper text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Flaro Dev
          </div>
          <h1 className="editorial-headline text-5xl md:text-7xl text-ink leading-[1.05]">
            Construa apps web<br />
            <span className="lime-mark">conversando com IA</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">
            Ambiente completo de desenvolvimento web do Filro. Descreva o que quer e o Flaro Dev gera, edita e publica para você — sem código.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-ink text-paper font-semibold hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar novo projeto
            </button>
            <Link
              to="/desenvolvedor/templates"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-ink/20 text-ink font-semibold hover:bg-secondary transition"
            >
              <LayoutTemplate className="h-4 w-4" /> Explorar templates
            </Link>
          </div>
        </section>

        {/* Projects */}
        <section className="mx-auto max-w-[1200px] px-5 md:px-10 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-black text-2xl text-ink flex items-center gap-2">
              <FolderKanban className="h-5 w-5" /> Seus projetos
            </h2>
          </div>

          {fetching ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
            </div>
          ) : projects.length === 0 ? (
            <FlaroDevEmptyState
              title="Você ainda não criou nenhum projeto no Flaro Dev."
              description="Comece criando seu primeiro projeto. O Flaro Dev gera tudo a partir de uma descrição."
              icon={<Sparkles className="h-10 w-10" />}
              action={
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper font-semibold disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Criar primeiro projeto
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group relative p-5 rounded-2xl border border-border bg-paper hover:border-ink/40 transition shadow-card"
                >
                  <Link
                    to="/desenvolvedor/projeto/$projectId"
                    params={{ projectId: p.id }}
                    className="block"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-display font-bold text-lg text-ink truncate">{p.name}</h3>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.status === "published" ? "bg-lime text-ink" : "bg-secondary text-ink-soft"
                        }`}
                      >
                        {p.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-sm text-ink-soft line-clamp-2 mb-4">{p.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>Atualizado {new Date(p.updated_at).toLocaleDateString("pt-BR")}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 h-7 w-7 grid place-items-center rounded-lg bg-paper border border-border text-ink-soft hover:text-destructive hover:border-destructive transition disabled:opacity-50"
                    aria-label="Excluir projeto"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
