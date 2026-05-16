import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Globe2, Loader2 } from "lucide-react";
import { addFlaroDevDomain } from "@/lib/flaro-dev.functions";

export function FlaroDevDomainPanel({ projectId }: { projectId: string }) {
  const addDomain = useServerFn(addFlaroDevDomain);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    domain: { domain: string; status: string };
    instructions: { type: string; name: string; value: string; note: string } | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await addDomain({ data: { projectId, domain: domain.trim() } });
      setResult({ domain: res.domain, instructions: res.instructions });
      setDomain("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao registrar domínio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-bold text-lg text-ink">Domínio personalizado</h3>
        <p className="text-sm text-ink-soft mt-1">
          Conecte seu próprio domínio à página publicada.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="meusite.com.br"
          className="flex-1 h-11 px-3 rounded-xl border border-border bg-paper text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-ink/40"
        />
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper font-semibold hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe2 className="h-4 w-4" />}
          Adicionar
        </button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result?.instructions && (
        <div className="rounded-xl border border-border bg-secondary p-4 space-y-2">
          <h4 className="text-sm font-semibold text-ink">Configuração DNS manual</h4>
          <p className="text-xs text-ink-soft">{result.instructions.note}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-ink-soft">Tipo</div>
              <div className="font-mono text-ink">{result.instructions.type}</div>
            </div>
            <div className="col-span-1">
              <div className="text-ink-soft">Nome</div>
              <div className="font-mono text-ink truncate">{result.instructions.name}</div>
            </div>
            <div>
              <div className="text-ink-soft">Valor</div>
              <div className="font-mono text-ink">{result.instructions.value}</div>
            </div>
          </div>
        </div>
      )}

      {result && !result.instructions && (
        <p className="text-xs text-ink-soft">
          Domínio registrado. A verificação automática começou e pode levar alguns minutos.
        </p>
      )}
    </div>
  );
}
