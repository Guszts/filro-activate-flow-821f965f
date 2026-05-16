import { History, RotateCcw } from "lucide-react";
import { FlaroDevEmptyState } from "./FlaroDevEmptyState";

export type FlaroDevVersion = {
  id: string;
  version_number: number;
  prompt_summary: string;
  created_at: string;
};

export function FlaroDevVersionList({
  versions,
  currentVersionId,
  onRestore,
  restoringId,
}: {
  versions: FlaroDevVersion[];
  currentVersionId?: string | null;
  onRestore: (id: string) => void;
  restoringId?: string | null;
}) {
  if (versions.length === 0) {
    return (
      <FlaroDevEmptyState
        title="Nenhuma versão ainda"
        description="Cada vez que o Flaro Dev gera código, uma versão é salva aqui."
        icon={<History className="h-8 w-8" />}
      />
    );
  }
  return (
    <ul className="space-y-2">
      {versions.map((v) => {
        const isCurrent = v.id === currentVersionId;
        const isRestoring = v.id === restoringId;
        return (
          <li
            key={v.id}
            className={`p-3 rounded-xl border transition ${
              isCurrent ? "border-ink bg-secondary" : "border-border bg-paper hover:border-ink/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink">v{v.version_number}</span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-ink text-paper">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft mt-1 line-clamp-2">{v.prompt_summary}</p>
                <p className="text-[10px] text-ink-soft/70 mt-1">
                  {new Date(v.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              {!isCurrent && (
                <button
                  onClick={() => onRestore(v.id)}
                  disabled={isRestoring}
                  className="shrink-0 inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-ink text-paper text-xs font-medium hover:scale-105 active:scale-95 transition disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restaurar
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
