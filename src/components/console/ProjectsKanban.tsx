import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  notifySitePublished,
  createProjectPdfUploadUrl,
  confirmProjectPdfUpload,
  removeProjectPdf,
  getProjectPdfDownloadUrl,
} from "@/lib/projects.functions";
import { FileText, Upload as UploadIcon, X } from "lucide-react";
import { toast } from "sonner";

type ProjectStatus =
  | "new"
  | "payment_confirmed"
  | "briefing_received"
  | "in_production"
  | "revision_sent"
  | "awaiting_client"
  | "published"
  | "maintenance"
  | "paused"
  | "cancelled";

type ProjectRow = {
  id: string;
  user_id: string;
  business_name: string | null;
  business_segment: string | null;
  project_status: ProjectStatus;
  preview_url: string | null;
  published_url: string | null;
  expected_delivery_at: string | null;
  published_at: string | null;
  business_info_submitted: boolean;
  updated_at: string;
  created_at: string;
  kanban_position: number;
  plan_id: string | null;
  project_pdf_url: string | null;
  project_pdf_path: string | null;
};

const COLUMNS: { id: ProjectStatus; label: string; tone: string }[] = [
  { id: "new", label: "New", tone: "bg-stone/40" },
  { id: "payment_confirmed", label: "Payment confirmado", tone: "bg-azure/15" },
  { id: "briefing_received", label: "Briefing recebido", tone: "bg-azure/25" },
  { id: "in_production", label: "In production", tone: "bg-lime/40" },
  { id: "revision_sent", label: "Revisão enviada", tone: "bg-amber-100" },
  { id: "awaiting_client", label: "Aguardando cliente", tone: "bg-amber-200" },
  { id: "published", label: "Published", tone: "bg-lime/70" },
  { id: "maintenance", label: "Maintenance", tone: "bg-muted" },
  { id: "paused", label: "Pausado", tone: "bg-muted" },
  { id: "cancelled", label: "Canceled", tone: "bg-flame/20" },
];

export function ProjectsKanban() {
  const qc = useQueryClient();
  const notifyPublished = useServerFn(notifySitePublished);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["console-projects-kanban"],
    queryFn: async () => {
      const [projects, profiles, plans] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .order("kanban_position", { ascending: true })
          .order("updated_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name, email"),
        supabase.from("plans").select("id, name").order("display_order"),
      ]);
      return {
        projects: (projects.data ?? []) as ProjectRow[],
        profiles: profiles.data ?? [],
        plans: plans.data ?? [],
      };
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel(`kanban-projects-${Math.random()}`)
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "projects" },
        () => qc.invalidateQueries({ queryKey: ["console-projects-kanban"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() + 86_400_000 : null;
    return data.projects.filter((p) => {
      if (planFilter !== "all" && p.plan_id !== planFilter) return false;
      const created = new Date(p.created_at).getTime();
      if (from !== null && created < from) return false;
      if (to !== null && created >= to) return false;
      if (!q) return true;
      const prof = data.profiles.find((x) => x.user_id === p.user_id);
      return [p.business_name, p.business_segment, prof?.name, prof?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [data, filter, planFilter, dateFrom, dateTo]);

  const grouped = useMemo(() => {
    const map: Record<ProjectStatus, ProjectRow[]> = {
      new: [],
      payment_confirmed: [],
      briefing_received: [],
      in_production: [],
      revision_sent: [],
      awaiting_client: [],
      published: [],
      maintenance: [],
      paused: [],
      cancelled: [],
    };
    filtered.forEach((p) => {
      if (map[p.project_status]) map[p.project_status].push(p);
    });
    return map;
  }, [filtered]);

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const projectId = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    if (!overId) return;
    const newStatus = overId as ProjectStatus;
    const project = data?.projects.find((p) => p.id === projectId);
    if (!project || project.project_status === newStatus) return;

    // optimistic update
    qc.setQueryData(["console-projects-kanban"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        projects: old.projects.map((p: ProjectRow) =>
          p.id === projectId ? { ...p, project_status: newStatus } : p,
        ),
      };
    });

    const { error } = await supabase
      .from("projects")
      .update({ project_status: newStatus })
      .eq("id", projectId);

    if (error) {
      // rollback
      qc.invalidateQueries({ queryKey: ["console-projects-kanban"] });
      alert(`Error ao atualizar status: ${error.message}`);
      return;
    }

    if (newStatus === "published") {
      notifyPublished({ data: { projectId } }).catch((e) =>
        console.error("[email] site-published failed", e),
      );
    }
  }

  const activeProject = activeId
    ? data?.projects.find((p) => p.id === activeId) ?? null
    : null;

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="editorial-headline text-4xl md:text-5xl text-ink">Projects</h1>
          <p className="mt-2 text-ink-soft text-sm">
            Quadro Kanban da operação. Arraste os cards para mover de etapa.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search cliente, negócio…"
            className="h-11 px-4 rounded-xl border border-border bg-paper outline-none focus:border-ink w-full md:w-64"
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm"
            aria-label="Filter por plano"
          >
            <option value="all">Todos os planos</option>
            {(data?.plans ?? []).map((pl) => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm"
            aria-label="Data inicial"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-paper outline-none focus:border-ink text-sm"
            aria-label="Data final"
          />
          {(planFilter !== "all" || dateFrom || dateTo || filter) && (
            <button
              type="button"
              onClick={() => { setFilter(""); setPlanFilter("all"); setDateFrom(""); setDateTo(""); }}
              className="h-11 px-3 rounded-xl text-sm text-ink-soft hover:text-ink"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-ink-soft">
        {filtered.length} de {data?.projects.length ?? 0} projetos
      </div>

      {isLoading && (
        <div className="mt-10 text-ink-soft">Carregando projetos...</div>
      )}

      {!isLoading && (
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
          onDragCancel={() => setActiveId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                tone={col.tone}
                items={grouped[col.id]}
                profiles={data?.profiles ?? []}
                plans={data?.plans ?? []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeProject && (
              <KanbanCard
                project={activeProject}
                profiles={data?.profiles ?? []}
                plans={data?.plans ?? []}
                dragging
              />
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  tone,
  items,
  profiles,
  plans,
}: {
  id: ProjectStatus;
  label: string;
  tone: string;
  items: ProjectRow[];
  profiles: { user_id: string; name: string; email: string }[];
  plans: { id: string; name: string }[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div className="w-[300px] shrink-0">
      <div className={`px-3 py-2 rounded-t-xl ${tone} flex items-center justify-between`}>
        <div className="text-xs font-bold tracking-wide text-ink uppercase">{label}</div>
        <div className="text-xs font-mono text-ink-soft">{items.length}</div>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[60vh] p-2 rounded-b-xl border border-border bg-paper transition-colors ${
          isOver ? "ring-2 ring-ink/50" : ""
        }`}
      >
        <div className="space-y-2">
          {items.map((p) => (
            <KanbanCard key={p.id} project={p} profiles={profiles} plans={plans} />
          ))}
          {items.length === 0 && (
            <div className="text-xs text-ink-soft p-3 text-center italic">Vazio</div>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanCard({
  project,
  profiles,
  plans,
  dragging,
}: {
  project: ProjectRow;
  profiles: { user_id: string; name: string; email: string }[];
  plans: { id: string; name: string }[];
  dragging?: boolean;
}) {
  const qc = useQueryClient();
  const createUploadUrl = useServerFn(createProjectPdfUploadUrl);
  const confirmUpload = useServerFn(confirmProjectPdfUpload);
  const removePdf = useServerFn(removeProjectPdf);
  const getDownloadUrl = useServerFn(getProjectPdfDownloadUrl);
  const [uploading, setUploading] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });
  const prof = profiles.find((x) => x.user_id === project.user_id);
  const plan = plans.find((p) => p.id === project.plan_id);
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const hasPdf = Boolean(project.project_pdf_path || project.project_pdf_url);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Apenas arquivos PDF"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("PDF maior que 20MB"); return; }
    setUploading(true);
    try {
      const { uploadUrl, path } = await createUploadUrl({ data: { projectId: project.id } });
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf", "x-upsert": "true" },
        body: file,
      });
      if (!putRes.ok) throw new Errorr(`Upload falhou (${putRes.status})`);
      await confirmUpload({ data: { projectId: project.id, path } });
      toast.success("PDF anexado em armazenamento privado");
      qc.invalidateQueries({ queryKey: ["console-projects-kanban"] });
    } catch (err) {
      toast.error("Failed ao enviar PDF: " + (err as Errorr).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleView(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const { url } = await getDownloadUrl({ data: { projectId: project.id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error("No foi possível gerar link: " + (err as Errorr).message);
    }
  }

  async function handlePdfRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Remove o PDF deste projeto?")) return;
    try {
      await removePdf({ data: { projectId: project.id } });
      qc.invalidateQueries({ queryKey: ["console-projects-kanban"] });
    } catch (err) {
      toast.error("Failed ao remover: " + (err as Errorr).message);
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: isDragging && !dragging ? 0.3 : 1, y: 0 }}
      className={`card-elevated p-3 select-none ${
        dragging ? "ring-2 ring-ink shadow-2xl rotate-2" : ""
      }`}
    >
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <div className="font-semibold text-sm text-ink truncate">
          {project.business_name || "Sem nome"}
        </div>
        <div className="text-xs text-ink-soft truncate mt-0.5">
          {prof?.name || prof?.email || "—"}
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {plan && (
            <span className="inline-flex px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-ink">
              {plan.name}
            </span>
          )}
          {project.business_info_submitted && (
            <span className="inline-flex px-2 py-0.5 rounded-full bg-lime text-[10px] font-semibold text-ink">
              Briefing
            </span>
          )}
          {project.preview_url && (
            <span className="inline-flex px-2 py-0.5 rounded-full bg-azure/20 text-[10px] font-semibold text-ink">
              Preview
            </span>
          )}
          {hasPdf && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-flame/15 text-[10px] font-semibold text-ink">
              <FileText className="h-3 w-3" /> PDF
            </span>
          )}
        </div>
        {project.expected_delivery_at && (
          <div className="mt-2 text-[10px] text-ink-soft">
            Entrega prevista: {formatDateTime(project.expected_delivery_at)}
          </div>
        )}
        <div className="mt-1 text-[10px] text-ink-soft">
          Atualizado: {formatDateTime(project.updated_at)}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
        <label className="inline-flex items-center gap-1 text-[10px] text-ink-soft hover:text-ink cursor-pointer">
          <UploadIcon className="h-3 w-3" />
          {uploading ? "Enviando…" : hasPdf ? "Trocar PDF" : "Anexar PDF"}
          <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={uploading} />
        </label>
        {hasPdf && (
          <>
            <button type="button" onClick={handleView} className="text-[10px] text-ink-soft hover:text-ink underline">Ver</button>
            <button type="button" onClick={handlePdfRemove} className="ml-auto text-[10px] text-flame hover:opacity-80 inline-flex items-center gap-0.5">
              <X className="h-3 w-3" /> Remove
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
