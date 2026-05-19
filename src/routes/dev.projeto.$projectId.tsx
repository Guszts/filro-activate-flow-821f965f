import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PreviewFrame } from "@/components/dev/PreviewFrame";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { getDevProject } from "@/lib/dev/dev.functions";
import { editDevSiteWithAI } from "@/lib/dev/generator.functions";
import { getMyCredits } from "@/lib/credits/credits.functions";
import { estimateEditCost } from "@/lib/dev/credit-cost";
import { Loader2, ExternalLink } from "lucide-react";

const SearchSchema = z.object({ generated: z.string().optional() });

export const Route = createFileRoute("/dev/projeto/$projectId")({
  validateSearch: SearchSchema,
  component: ProjetoPage,
  head: () => ({ meta: [{ title: "Meu site · Flaro Dev" }, { name: "robots", content: "noindex,nofollow" }] }),
});

type Project = {
  id: string;
  business_name: string | null;
  business_segment: string | null;
  slug: string | null;
  published_url: string | null;
  status: string;
  generated_content: Record<string, unknown> | null;
  template_slug: string | null;
};

function ProjetoPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [instruction, setInstruction] = useState("");
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const fetchProject = useServerFn(getDevProject);
  const editAI = useServerFn(editDevSiteWithAI);
  const fetchCredits = useServerFn(getMyCredits);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: `/dev/projeto/${projectId}` } }); return; }
    (async () => {
      const res = (await fetchProject({ data: { projectId } })) as { error: string | null; project: unknown };
      if (res.error) setError(res.error);
      else setProject(res.project as Project | null);
    })();
    fetchCredits().then((r) => setBalance((r as { balance: number }).balance)).catch(() => {});
  }, [loading, user, projectId, navigate, fetchProject, fetchCredits, reloadKey]);

  const costEstimate = estimateEditCost(instruction);
  const estCost = instruction.trim().length >= 5 ? costEstimate.cost : 0;

  async function handleEdit() {
    if (!instruction.trim()) return;
    if ((balance ?? 0) < estCost) { toast.error(`Esta edição custa ${estCost} créditos.`); return; }
    setEditing(true);
    try {
      const res = await editAI({ data: { projectId, instruction: instruction.trim() } });
      if (!res.ok) throw new Error(res.error ?? "Falha na edição");
      toast.success(`Edição aplicada (${res.cost} créditos).`);
      setInstruction("");
      setReloadKey((k) => k + 1);
      fetchCredits().then((r) => setBalance((r as { balance: number }).balance)).catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha");
    } finally {
      setEditing(false);
    }
  }

  const publicUrl = project?.slug ? `/s/${project.slug}` : project?.published_url ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] w-full px-5 md:px-10 py-10 md:py-14">
        <nav className="text-xs text-ink-soft mb-4">
          <Link to="/dev" className="hover:text-ink">Flaro Dev</Link> <span className="mx-1">/</span> Meu site
        </nav>

        {error && <div className="text-destructive text-sm">{error}</div>}
        {!project && !error && (
          <div className="space-y-3">
            <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-72 w-full bg-muted rounded-2xl animate-pulse" />
          </div>
        )}

        {project && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="editorial-headline text-4xl md:text-5xl text-ink">{project.business_name || "Meu site"}</h1>
                {project.slug && (
                  <a href={`/s/${project.slug}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-flame hover:underline">
                    /s/{project.slug} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {balance !== null && (
                <div className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-border bg-paper text-sm">
                  
                  <span className="font-bold text-ink">{balance}</span>
                  <span className="text-ink-soft">créditos</span>
                </div>
              )}
            </div>

            <section className="mt-8 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {publicUrl ? (
                  <PreviewFrame
                    src={publicUrl}
                    title="Pré-visualização do site"
                    reloadKey={reloadKey}
                    height="min(76vh, 800px)"
                  />
                ) : (
                  <div className="rounded-3xl border border-border bg-paper p-10 text-center text-ink-soft text-sm">
                    Site não publicado ainda.
                  </div>
                )}
              </div>

              <aside className="rounded-3xl border border-border bg-muted/30 p-6 flex flex-col gap-5">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink-soft inline-flex items-center gap-1.5">Editor com IA</div>
                  <p className="mt-2 text-xs text-ink-soft">O custo varia conforme o tamanho e a complexidade do que você pedir.</p>
                  <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    rows={5}
                    maxLength={1500}
                    className="mt-3 input w-full"
                    placeholder='Ex: "Troque o título do hero para focar em entrega rápida" ou "Adicione uma nova seção de FAQ com 5 perguntas"'
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
                    <span>{instruction.length}/1500 caracteres</span>
                    {instruction.trim().length >= 5 && (
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        Custo estimado: {estCost} crédito{estCost > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {instruction.trim().length >= 5 && (
                    <div className="mt-2 text-[10px] text-ink-soft leading-relaxed">
                      {costEstimate.reasons.join(" · ")}
                    </div>
                  )}
                  <button
                    onClick={handleEdit}
                    disabled={editing || !instruction.trim() || (balance ?? 0) < estCost}
                    className="mt-3 w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink text-paper font-semibold text-sm disabled:opacity-50"
                  >
                    {editing ? <><Loader2 className="h-4 w-4 animate-spin" /> Aplicando…</> : <>Aplicar edição ({estCost || 1} crédito{(estCost || 1) > 1 ? "s" : ""})</>}
                  </button>
                  {(balance ?? 0) < estCost && estCost > 0 && (
                    <Link to="/dev/precos" className="mt-2 block text-center text-xs underline text-flame">Sem créditos suficientes · ver planos</Link>
                  )}
                </div>

                <div className="border-t border-border pt-5">
                  <div className="text-xs uppercase tracking-widest text-ink-soft">Quer mudar tudo?</div>
                  <Link to="/dev/novo" className="mt-2 block w-full text-center h-11 leading-[44px] rounded-xl border border-border bg-paper text-sm font-semibold hover:bg-muted">
                    Gerar outro site (5 créditos)
                  </Link>
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
