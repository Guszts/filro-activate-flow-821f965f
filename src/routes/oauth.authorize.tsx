import { createFileRoute, useSearch, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getOAuthConsentContext, approveOAuthConsent } from "@/lib/oauth.functions";
import { toast } from "sonner";
import { Plug, ShieldCheck, AlertTriangle } from "lucide-react";

interface AuthorizeSearch {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  resource?: string;
}

export const Route = createFileRoute("/oauth/authorize")({
  component: AuthorizePage,
  validateSearch: (s: Record<string, unknown>): AuthorizeSearch => ({
    client_id: typeof s.client_id === "string" ? s.client_id : undefined,
    redirect_uri: typeof s.redirect_uri === "string" ? s.redirect_uri : undefined,
    response_type: typeof s.response_type === "string" ? s.response_type : undefined,
    scope: typeof s.scope === "string" ? s.scope : undefined,
    state: typeof s.state === "string" ? s.state : undefined,
    code_challenge: typeof s.code_challenge === "string" ? s.code_challenge : undefined,
    code_challenge_method: typeof s.code_challenge_method === "string" ? s.code_challenge_method : undefined,
    resource: typeof s.resource === "string" ? s.resource : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Autorizar conector · Filro" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AuthorizePage() {
  const search = useSearch({ from: "/oauth/authorize" });
  const navigate = useNavigate();
  const getCtx = useServerFn(getOAuthConsentContext);
  const approve = useServerFn(approveOAuthConsent);

  const [checking, setChecking] = useState(true);
  const [ctx, setCtx] = useState<{
    isAdmin: boolean;
    clientName: string | null;
    clientId: string | null;
    registeredRedirectUris: string[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validação dos params
  const missing: string[] = [];
  if (!search.client_id) missing.push("client_id");
  if (!search.redirect_uri) missing.push("redirect_uri");
  if (!search.code_challenge) missing.push("code_challenge");
  if (search.response_type && search.response_type !== "code") missing.push("response_type=code");
  if (search.code_challenge_method && search.code_challenge_method !== "S256") missing.push("S256");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const here = `/oauth/authorize${window.location.search}`;
        navigate({ to: "/login", search: { redirect: here } });
        return;
      }
      if (missing.length > 0 || !search.client_id) {
        setChecking(false);
        return;
      }
      try {
        const res = await getCtx({ data: { client_id: search.client_id } });
        if (!cancelled) setCtx(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao validar");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApprove = async () => {
    if (!search.client_id || !search.redirect_uri || !search.code_challenge) return;
    setSubmitting(true);
    try {
      const res = await approve({
        data: {
          client_id: search.client_id,
          redirect_uri: search.redirect_uri,
          code_challenge: search.code_challenge,
          code_challenge_method: "S256",
          state: search.state,
          scope: search.scope,
          resource: search.resource,
        },
      });
      window.location.href = res.redirectUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao autorizar");
      setSubmitting(false);
    }
  };

  const onDeny = () => {
    if (!search.redirect_uri) {
      navigate({ to: "/" });
      return;
    }
    try {
      const url = new URL(search.redirect_uri);
      url.searchParams.set("error", "access_denied");
      if (search.state) url.searchParams.set("state", search.state);
      window.location.href = url.toString();
    } catch {
      navigate({ to: "/" });
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen grid place-items-center px-5 py-10">
        <div className="text-sm text-ink-soft">Validando solicitação...</div>
      </main>
    );
  }

  if (missing.length > 0) {
    return (
      <main className="min-h-screen grid place-items-center px-5 py-10">
        <div className="max-w-md card-elevated p-7">
          <div className="flex items-center gap-2 text-flame">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-display font-black">Solicitação inválida</span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Parâmetros faltando ou inválidos: {missing.join(", ")}.
          </p>
          <Link to="/" className="mt-5 inline-block text-sm underline">Voltar ao início</Link>
        </div>
      </main>
    );
  }

  if (error || !ctx) {
    return (
      <main className="min-h-screen grid place-items-center px-5 py-10">
        <div className="max-w-md card-elevated p-7">
          <div className="flex items-center gap-2 text-flame">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-display font-black">Erro</span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">{error ?? "Cliente não encontrado."}</p>
          <Link to="/" className="mt-5 inline-block text-sm underline">Voltar ao início</Link>
        </div>
      </main>
    );
  }

  if (!ctx.isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center px-5 py-10">
        <div className="max-w-md card-elevated p-7">
          <div className="flex items-center gap-2 text-flame">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-display font-black">Acesso negado</span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            A integração MCP do Filro é restrita a administradores. Sua conta atual não tem permissão.
          </p>
          <button onClick={onDeny} className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-full bg-ink text-paper font-semibold">
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const uriOk = ctx.registeredRedirectUris.includes(search.redirect_uri!);

  return (
    <main className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-md card-elevated p-7">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center rounded-2xl bg-muted text-ink">
            <Plug className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-ink">Autorizar conector MCP</h1>
            <p className="text-xs text-ink-soft mt-0.5">Filro · acesso administrativo</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-ink-soft">
          <strong className="text-ink">{ctx.clientName ?? "Aplicação desconhecida"}</strong> está pedindo
          acesso ao servidor MCP do Filro como administrador. Ela poderá ler dados de qualquer cliente, executar
          ferramentas administrativas e modificar projetos em seu nome.
        </p>

        <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-xs text-ink-soft space-y-2">
          <div><span className="text-ink font-semibold">Cliente:</span> {ctx.clientId}</div>
          <div className="break-all">
            <span className="text-ink font-semibold">Redirect:</span> {search.redirect_uri}
            {!uriOk && <span className="ml-2 text-flame">(não registrado!)</span>}
          </div>
          <div><span className="text-ink font-semibold">Escopo:</span> {search.scope ?? "mcp"}</div>
        </div>

        {!uriOk && (
          <div className="mt-4 text-xs text-flame">
            redirect_uri não corresponde aos URIs registrados — autorização será rejeitada.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onDeny}
            disabled={submitting}
            className="flex-1 h-12 rounded-full border border-border text-ink font-semibold disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            onClick={onApprove}
            disabled={submitting || !uriOk}
            className="flex-1 h-12 rounded-full bg-ink text-paper font-semibold disabled:opacity-50"
          >
            {submitting ? "Autorizando..." : "Autorizar"}
          </button>
        </div>
      </div>
    </main>
  );
}
