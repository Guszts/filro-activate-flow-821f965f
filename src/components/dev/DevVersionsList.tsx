import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listDevProjectVersions } from "@/lib/dev/dev.functions";

type Version = {
  id: string;
  version_number: number;
  notes: string;
  generated_site: { previewUrl?: string | null; publishedUrl?: string | null } | null;
  created_at: string;
};

export function DevVersionsList({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchVersions = useServerFn(listDevProjectVersions);

  useEffect(() => {
    (async () => {
      const res = await fetchVersions({ data: { projectId } });
      setVersions((res.versions ?? []) as Version[]);
      setLoading(false);
    })();
  }, [projectId, fetchVersions]);

  if (loading) return <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />;
  if (!versions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-ink-soft">
        Nenhuma versão publicada ainda. Assim que a equipe enviar uma versão, ela aparece aqui.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {versions.map((v) => (
        <li key={v.id} className="rounded-2xl border border-border bg-paper p-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-ink">Versão {v.version_number}</div>
            <div className="text-xs text-ink-soft mt-0.5">
              {new Date(v.created_at).toLocaleString("pt-BR")}
            </div>
            {v.notes && <p className="mt-2 text-sm text-ink">{v.notes}</p>}
          </div>
          <div className="flex gap-2">
            {v.generated_site?.previewUrl && (
              <a href={v.generated_site.previewUrl} target="_blank" rel="noreferrer" className="text-xs px-3 h-9 inline-flex items-center rounded-lg border border-border hover:bg-muted">Preview</a>
            )}
            {v.generated_site?.publishedUrl && (
              <a href={v.generated_site.publishedUrl} target="_blank" rel="noreferrer" className="text-xs px-3 h-9 inline-flex items-center rounded-lg bg-ink text-paper">Ver publicado</a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
