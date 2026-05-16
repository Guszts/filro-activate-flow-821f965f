import { useState } from "react";
import { Globe, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { publishFlaroDevProject } from "@/lib/flaro-dev.functions";
import { FlaroDevEmptyState } from "./FlaroDevEmptyState";

export type FlaroDevDeployment = {
  id: string;
  slug: string;
  status: string;
  published_at: string;
};

export function FlaroDevPublishPanel({
  projectId,
  deployments,
  onPublished,
  hasVersion,
}: {
  projectId: string;
  deployments: FlaroDevDeployment[];
  onPublished: () => void;
  hasVersion: boolean;
}) {
  const publish = useServerFn(publishFlaroDevProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const latest = deployments[0];
  const latestUrl = latest ? `https://filro.site/id/${latest.slug}` : null;

  async function handlePublish() {
    setError(null);
    setLoading(true);
    try {
      await publish({ data: { projectId } });
      onPublished();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao publicar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!latestUrl) return;
    await navigator.clipboard.writeText(latestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-bold text-lg text-ink">Publicar</h3>
        <p className="text-sm text-ink-soft mt-1">
          Cada publicação gera uma URL única em <code className="text-xs">filro.site/id/[slug]</code>.
        </p>
      </div>

      <button
        onClick={handlePublish}
        disabled={loading || !hasVersion}
        className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper font-semibold hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
        {loading ? "Publicando…" : "Publicar versão atual"}
      </button>
      {!hasVersion && (
        <p className="text-xs text-ink-soft">Gere ao menos uma versão antes de publicar.</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div>
        <h4 className="font-semibold text-sm text-ink mb-3">Histórico de publicações</h4>
        {deployments.length === 0 ? (
          <FlaroDevEmptyState title="Nenhuma publicação realizada." icon={<Globe className="h-7 w-7" />} />
        ) : (
          <ul className="space-y-2">
            {deployments.map((d) => {
              const url = `https://filro.site/id/${d.slug}`;
              const isLatest = d.id === latest?.id;
              return (
                <li
                  key={d.id}
                  className={`p-3 rounded-xl border ${isLatest ? "border-ink bg-secondary" : "border-border bg-paper"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-ink hover:underline truncate flex items-center gap-1"
                      >
                        {url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <p className="text-[10px] text-ink-soft mt-0.5">
                        {new Date(d.published_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {isLatest && (
                      <button
                        onClick={handleCopy}
                        className="shrink-0 h-8 w-8 grid place-items-center rounded-lg bg-ink text-paper hover:scale-105 active:scale-95 transition"
                        aria-label="Copiar URL"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
