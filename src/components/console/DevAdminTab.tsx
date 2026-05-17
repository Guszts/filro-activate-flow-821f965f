import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListDevProjects, adminUpdateDevProject, adminRespondDevChangeRequest, adminPublishDevVersion } from "@/lib/dev/dev.functions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type DevProject = {
  id: string;
  business_name: string | null;
  business_segment: string | null;
  template_slug: string | null;
  plan_slug: string | null;
  status: string;
  preview_url: string | null;
  published_url: string | null;
  user_id: string;
  created_at: string;
};

type ChangeRequest = {
  id: string;
  project_id: string;
  message: string;
  ai_category: string;
  ai_summary: string;
  ai_priority: string;
  status: string;
  admin_response: string;
  created_at: string;
};

const STATUSES = ["briefing", "awaiting_payment", "queued", "in_production", "review", "published", "paused", "cancelled"] as const;

export function DevAdminTab() {
  const list = useServerFn(adminListDevProjects);
  const upd = useServerFn(adminUpdateDevProject);
  const respond = useServerFn(adminRespondDevChangeRequest);
  const publish = useServerFn(adminPublishDevVersion);
  const qc = useQueryClient();

  const { data: projData, isLoading: projLoading } = useQuery({
    queryKey: ["admin-dev-projects"],
    queryFn: () => list(),
  });
  const projects: DevProject[] = (projData?.projects ?? []) as DevProject[];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && projects.length) setSelectedId(projects[0].id);
  }, [projects, selectedId]);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  // requests for selected project (admin RLS: ALL)
  const { data: reqData } = useQuery({
    queryKey: ["admin-dev-requests", selectedId],
    queryFn: async () => {
      if (!selectedId) return { data: [] };
      const { data } = await supabase
        .from("dev_change_requests")
        .select("id, project_id, message, ai_category, ai_summary, ai_priority, status, admin_response, created_at")
        .eq("project_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(50);
      return { data: data ?? [] };
    },
    enabled: !!selectedId,
  });
  const requests: ChangeRequest[] = (reqData?.data ?? []) as ChangeRequest[];

  const [editing, setEditing] = useState({ status: "", preview: "", published: "", notes: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (selected) {
      setEditing({
        status: selected.status,
        preview: selected.preview_url ?? "",
        published: selected.published_url ?? "",
        notes: "",
      });
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await upd({
        data: {
          projectId: selected.id,
          status: editing.status,
          previewUrl: editing.preview,
          publishedUrl: editing.published,
          notes: editing.notes || undefined,
        },
      });
      if (res.error) toast.error(res.error);
      else { toast.success("Projeto atualizado"); qc.invalidateQueries({ queryKey: ["admin-dev-projects"] }); }
    } finally { setSaving(false); }
  }

  async function reply(reqId: string, status: string, response: string) {
    const res = await respond({ data: { requestId: reqId, status, response } });
    if (res.error) toast.error(res.error);
    else { toast.success("Solicitação atualizada"); qc.invalidateQueries({ queryKey: ["admin-dev-requests", selectedId] }); }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs tracking-wide text-ink-soft">Flaro Dev</div>
        <h1 className="mt-1 font-display font-black text-3xl text-ink">Projetos sob demanda</h1>
      </div>

      {projLoading ? (
        <div className="text-sm text-ink-soft inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>
      ) : projects.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhum projeto Dev ainda.</p>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left rounded-2xl border p-3 transition-colors ${selectedId === p.id ? "border-ink bg-muted/40" : "border-border hover:bg-muted/30"}`}
              >
                <div className="text-sm font-semibold text-ink truncate">{p.business_name || "Projeto sem nome"}</div>
                <div className="text-[11px] text-ink-soft truncate">{p.template_slug} · {p.plan_slug}</div>
                <div className="mt-1 inline-flex text-[10px] px-2 py-0.5 rounded-full bg-muted text-ink-soft">{p.status}</div>
              </button>
            ))}
          </aside>

          <section className="space-y-6 min-w-0">
            {selected && (
              <>
                <div className="card-elevated p-6">
                  <div className="text-xs tracking-wide text-ink-soft">Editar projeto</div>
                  <h3 className="mt-1 font-semibold text-lg text-ink">{selected.business_name || "—"}</h3>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-soft">Status</span>
                      <select
                        value={editing.status}
                        onChange={(e) => setEditing((s) => ({ ...s, status: e.target.value }))}
                        className="h-11 px-3 rounded-xl border border-border bg-paper"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-soft">Preview URL</span>
                      <input
                        value={editing.preview}
                        onChange={(e) => setEditing((s) => ({ ...s, preview: e.target.value }))}
                        placeholder="https://preview.filro.site/..."
                        className="h-11 px-3 rounded-xl border border-border bg-paper"
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs text-ink-soft">Published URL</span>
                      <input
                        value={editing.published}
                        onChange={(e) => setEditing((s) => ({ ...s, published: e.target.value }))}
                        placeholder="https://cliente.com.br"
                        className="h-11 px-3 rounded-xl border border-border bg-paper"
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs text-ink-soft">Notas internas (opcional)</span>
                      <textarea
                        value={editing.notes}
                        onChange={(e) => setEditing((s) => ({ ...s, notes: e.target.value }))}
                        rows={2}
                        className="px-3 py-2 rounded-xl border border-border bg-paper"
                      />
                    </label>
                  </div>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Salvar alterações
                  </button>
                  <button
                    onClick={async () => {
                      const notes = window.prompt("Notas da versão (opcional):", "") ?? "";
                      const markPub = window.confirm("Marcar projeto como PUBLICADO? OK = publicar, Cancelar = só registrar versão para revisão.");
                      const res = await publish({ data: { projectId: selected.id, previewUrl: editing.preview || undefined, publishedUrl: editing.published || undefined, notes, markPublished: markPub } });
                      if (res.error) toast.error(res.error);
                      else { toast.success(`Versão ${res.version} registrada`); qc.invalidateQueries({ queryKey: ["admin-dev-projects"] }); }
                    }}
                    className="mt-4 ml-3 inline-flex items-center h-11 px-5 rounded-xl border border-border text-sm font-semibold"
                  >
                    Publicar nova versão
                  </button>
                </div>

                <div className="card-elevated p-6">
                  <div className="text-xs tracking-wide text-ink-soft">Solicitações de alteração</div>
                  <h3 className="mt-1 font-semibold text-lg text-ink">Pedidos do cliente</h3>
                  {requests.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">Sem pedidos.</p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {requests.map((r) => (
                        <AdminRequestRow key={r.id} req={r} onReply={reply} />
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function AdminRequestRow({ req, onReply }: { req: ChangeRequest; onReply: (id: string, status: string, response: string) => Promise<void> }) {
  const [response, setResponse] = useState(req.admin_response);
  const [status, setStatus] = useState(req.status);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try { await onReply(req.id, status, response); } finally { setBusy(false); }
  }

  return (
    <li className="rounded-2xl border border-border p-4 bg-muted/10">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-soft mb-2">
        <span className="font-semibold text-ink">{req.ai_category}</span>
        <span>· {req.ai_priority}</span>
        <span className="ml-auto">{new Date(req.created_at).toLocaleString("pt-BR")}</span>
      </div>
      <p className="text-sm text-ink whitespace-pre-wrap">{req.message}</p>
      <div className="mt-3 grid sm:grid-cols-[160px_1fr] gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-paper text-sm">
          <option value="open">Aberto</option>
          <option value="in_progress">Em andamento</option>
          <option value="done">Concluído</option>
          <option value="rejected">Recusado</option>
        </select>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={2}
          placeholder="Resposta para o cliente (opcional)"
          className="px-3 py-2 rounded-lg border border-border bg-paper text-sm"
        />
      </div>
      <button
        onClick={save}
        disabled={busy}
        className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-ink text-paper text-xs font-semibold disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Atualizar
      </button>
    </li>
  );
}
