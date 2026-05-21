import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Plug, Plus, Trash2, Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  listMcpTokens,
  createMcpToken,
  revokeMcpToken,
} from "@/lib/mcp-tokens.functions";

interface TokenRow {
  id: string;
  name: string;
  token_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function McpTokensSection() {
  const listFn = useServerFn(listMcpTokens);
  const createFn = useServerFn(createMcpToken);
  const revokeFn = useServerFn(revokeMcpToken);

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("Claude Desktop");
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // URL canônica — domínios .lovable.app fazem 302 redirect para filro.site,
  // e clientes MCP (Claude/Cursor) não seguem redirect em POST.
  const mcpUrl = "https://filro.site/api/mcp";

  const refresh = async () => {
    try {
      const res = await listFn();
      setTokens(res.tokens as TokenRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao listar tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    if (!name.trim()) return toast.error("Dê um nome ao token");
    setCreating(true);
    try {
      const res = await createFn({ data: { name: name.trim() } });
      setJustCreated(res.token);
      setName("Claude Desktop");
      await refresh();
      toast.success("Token gerado — copie agora");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar token");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revogar este token? Aplicações conectadas perderão acesso imediatamente.")) return;
    try {
      await revokeFn({ data: { id } });
      await refresh();
      toast.success("Token revogado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao revogar");
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const configJson = justCreated
    ? JSON.stringify(
        {
          mcpServers: {
            filro: {
              url: mcpUrl,
              headers: { Authorization: `Bearer ${justCreated}` },
            },
          },
        },
        null,
        2,
      )
    : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="mt-6 card-elevated p-7"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 grid place-items-center rounded-2xl bg-muted text-ink">
          <Plug className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Integração MCP</h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Conecte o Filro ao Claude, Cursor e outras ferramentas via Model Context Protocol
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        Gere um token pessoal e cole na configuração do seu cliente MCP. Ele poderá consultar seus projetos,
        pagamentos, planos e abrir chamados de suporte em seu nome.
      </p>

      {/* New token reveal */}
      {justCreated && (
        <div className="mt-5 rounded-2xl border border-flame/40 bg-flame/5 p-5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-flame shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-display font-black text-ink">Copie agora — não será exibido novamente</div>
              <div className="mt-3 flex gap-2">
                <code className="flex-1 px-3 py-2 rounded-xl bg-ink text-paper text-xs font-mono break-all">
                  {justCreated}
                </code>
                <button
                  onClick={() => copy(justCreated)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink text-paper text-xs font-semibold"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">
                  Como configurar no Claude Desktop
                </summary>
                <div className="mt-3 space-y-2 text-sm text-ink-soft">
                  <p>
                    1. Abra <code className="px-1 rounded bg-muted">claude_desktop_config.json</code>{" "}
                    (Configurações → Developer → Edit Config).
                  </p>
                  <p>2. Adicione o servidor abaixo e salve:</p>
                  <pre className="text-xs bg-ink text-paper rounded-xl p-3 overflow-x-auto">{configJson}</pre>
                  <p>3. Reinicie o Claude Desktop. As ferramentas do Filro aparecerão automaticamente.</p>
                </div>
              </details>

              <button
                onClick={() => setJustCreated(null)}
                className="mt-4 text-xs text-ink-soft underline"
              >
                Fechar — já copiei
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {!justCreated && (
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome (ex: Claude Desktop)"
            className="flex-1 h-12 px-4 rounded-2xl border border-border bg-paper text-ink"
          />
          <button
            onClick={create}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-2xl bg-ink text-paper font-semibold disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {creating ? "Gerando..." : "Gerar token"}
          </button>
        </div>
      )}

      {/* MCP URL info */}
      <div className="mt-5 flex items-center gap-2 text-xs text-ink-soft">
        <span>URL do servidor:</span>
        <code className="px-2 py-1 rounded bg-muted font-mono">{mcpUrl}</code>
      </div>

      {/* Tokens list */}
      <div className="mt-5">
        {loading ? (
          <div className="text-sm text-ink-soft">Carregando...</div>
        ) : tokens.length === 0 ? (
          <div className="text-sm text-ink-soft">Nenhum token criado ainda.</div>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink truncate">{t.name}</span>
                    {t.revoked_at && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-ink-soft">
                        revogado
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-soft mt-0.5">
                    <code className="font-mono">{t.token_prefix}…</code> · criado {fmtDate(t.created_at)} · último uso{" "}
                    {fmtDate(t.last_used_at)}
                  </div>
                </div>
                {!t.revoked_at && (
                  <button
                    onClick={() => revoke(t.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-ink hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revogar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
