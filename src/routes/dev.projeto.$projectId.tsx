import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { PreviewFrame } from "@/components/dev/PreviewFrame";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { getDevProject } from "@/lib/dev/dev.functions";
import { editDevSiteWithAI } from "@/lib/dev/generator.functions";
import { getMyCredits } from "@/lib/credits/credits.functions";
import { estimateEditCost } from "@/lib/dev/credit-cost";
import { ArrowLeft, ArrowUp, ExternalLink, Loader2, MessageSquare, Monitor } from "lucide-react";

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

type RiskAction = "applied" | "safe_alternative" | "refused";
type ChatMsg =
  | { role: "assistant"; text: string; ts: number; action?: RiskAction; notice?: string }
  | { role: "user"; text: string; ts: number }
  | { role: "system"; text: string; ts: number };

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
  const [tab, setTab] = useState<"chat" | "preview">("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", text: "Site gerado e pronto. Me diga o que você quer ajustar — texto, cores, seções, qualquer coisa.", ts: Date.now() },
  ]);

  const fetchProject = useServerFn(getDevProject);
  const editAI = useServerFn(editDevSiteWithAI);
  const fetchCredits = useServerFn(getMyCredits);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, editing]);

  const costEstimate = estimateEditCost(instruction);
  const estCost = instruction.trim().length >= 5 ? costEstimate.cost : 1;

  async function handleSend() {
    const text = instruction.trim();
    if (!text) return;
    if ((balance ?? 0) < estCost) { toast.error(`Esta edição custa ${estCost} créditos.`); return; }
    setMessages((m) => [...m, { role: "user", text, ts: Date.now() }]);
    setInstruction("");
    setEditing(true);
    setMessages((m) => [...m, { role: "system", text: "Aplicando alterações…", ts: Date.now() }]);
    try {
      const res = await editAI({ data: { projectId, instruction: text } });
      if (!res.ok) throw new Error(res.error ?? "Falha na edição");
      const action = (res as { action?: string }).action ?? "applied";
      const notice = (res as { notice?: string }).notice ?? "";
      let reply: string;
      if (action === "refused") {
        reply = `Não apliquei esta alteração. ${notice || "Risco alto de quebrar o site."} Nenhum crédito foi consumido.`;
      } else if (action === "safe_alternative") {
        reply = `Apliquei uma alternativa mais segura (${res.cost} crédito${res.cost > 1 ? "s" : ""}). ${notice} Veja na prévia ao lado.`;
      } else {
        reply = `Pronto. Apliquei a edição (${res.cost} crédito${res.cost > 1 ? "s" : ""}).${notice ? ` ${notice}` : ""} Veja na prévia ao lado.`;
      }
      setMessages((m) => [
        ...m.filter((x) => x.role !== "system"),
        { role: "assistant", text: reply, ts: Date.now() },
      ]);
      if (action !== "refused") {
        setReloadKey((k) => k + 1);
        if (typeof window !== "undefined" && window.innerWidth < 1024) setTab("preview");
      }
      fetchCredits().then((r) => setBalance((r as { balance: number }).balance)).catch(() => {});
    } catch (err) {
      setMessages((m) => [
        ...m.filter((x) => x.role !== "system"),
        { role: "assistant", text: `Não consegui aplicar: ${err instanceof Error ? err.message : "erro"}. Tente reformular.`, ts: Date.now() },
      ]);
      toast.error(err instanceof Error ? err.message : "Falha");
    } finally {
      setEditing(false);
    }
  }

  const publicUrl = project?.slug ? `/s/${project.slug}` : project?.published_url ?? null;

  // Swipe (mobile)
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-160, 0, 160], [0.5, 1, 0.5]);
  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = 60;
    if (info.offset.x < -threshold && tab === "chat") setTab("preview");
    else if (info.offset.x > threshold && tab === "preview") setTab("chat");
    x.set(0);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* ===== Top bar (project + tabs) ===== */}
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 h-14 flex items-center gap-3">
          <Link
            to="/dev"
            aria-label="Voltar"
            className="shrink-0 h-9 w-9 grid place-items-center rounded-full border border-border text-ink hover:bg-muted transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-ink-soft truncate">Flaro Dev</div>
            <div className="font-display font-black text-sm md:text-base text-ink truncate">
              {project?.business_name || "Meu site"}
            </div>
          </div>

          {/* Tabs */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-paper">
            <button
              onClick={() => setTab("chat")}
              className={`relative h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition ${tab === "chat" ? "text-paper" : "text-ink-soft hover:text-ink"}`}
            >
              {tab === "chat" && <motion.span layoutId="proj-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
              <span className="relative inline-flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Chat</span>
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`relative h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition ${tab === "preview" ? "text-paper" : "text-ink-soft hover:text-ink"}`}
            >
              {tab === "preview" && <motion.span layoutId="proj-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
              <span className="relative inline-flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5" /> Preview</span>
            </button>
          </div>

          {balance !== null && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-full border border-border bg-paper text-xs">
              <span className="font-bold text-ink">{balance}</span>
              <span className="text-ink-soft">créditos</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {error && <div className="p-6 text-destructive text-sm text-center">{error}</div>}

        {!project && !error && (
          <div className="p-6 max-w-[1400px] mx-auto w-full">
            <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
            <div className="mt-4 h-[60vh] w-full bg-muted rounded-2xl animate-pulse" />
          </div>
        )}

        {project && (
          <div className="flex-1 mx-auto w-full max-w-[1400px] px-3 md:px-6 py-3 md:py-5">
            {/* ====== DESKTOP: split chat | preview ====== */}
            <div className="hidden lg:grid lg:grid-cols-[420px_1fr] gap-4 h-[calc(100vh-5.5rem-1rem)]">
              <ChatPanel
                project={project}
                messages={messages}
                editing={editing}
                instruction={instruction}
                setInstruction={setInstruction}
                estCost={estCost}
                balance={balance}
                onSend={handleSend}
                scrollRef={scrollRef}
              />
              <PreviewPanel publicUrl={publicUrl} reloadKey={reloadKey} project={project} />
            </div>

            {/* ====== MOBILE / TABLET: swipeable tabs ====== */}
            <div className="lg:hidden h-[calc(100vh-5.5rem)] relative overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                style={{ x, opacity }}
                className="h-full touch-pan-y"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {tab === "chat" ? (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ChatPanel
                        project={project}
                        messages={messages}
                        editing={editing}
                        instruction={instruction}
                        setInstruction={setInstruction}
                        estCost={estCost}
                        balance={balance}
                        onSend={handleSend}
                        scrollRef={scrollRef}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <PreviewPanel publicUrl={publicUrl} reloadKey={reloadKey} project={project} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Swipe hint */}
              <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center">
                <div className="text-[10px] uppercase tracking-widest text-ink-soft/70 bg-paper/80 backdrop-blur px-3 h-6 rounded-full inline-flex items-center">
                  Arraste {tab === "chat" ? "→" : "←"} para trocar
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   CHAT PANEL
========================================================= */
function ChatPanel({
  project, messages, editing, instruction, setInstruction, estCost, balance, onSend, scrollRef,
}: {
  project: Project;
  messages: ChatMsg[];
  editing: boolean;
  instruction: string;
  setInstruction: (v: string) => void;
  estCost: number;
  balance: number | null;
  onSend: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="h-full flex flex-col rounded-3xl border border-border bg-paper overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-ink-soft">Chat do projeto</div>
        <div className="text-[10px] text-ink-soft">{project.business_segment || "Site"}</div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} />
        ))}
        {editing && (
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 md:p-4">
        <div className="rounded-2xl bg-muted/40 border border-border p-2 pl-3 flex items-end gap-2">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!editing) onSend();
              }
            }}
            rows={2}
            maxLength={1500}
            placeholder='Ex: "Troque o título do hero" ou "Adicione uma seção de FAQ"'
            className="flex-1 resize-none bg-transparent outline-none text-sm text-ink placeholder:text-ink-soft/70 py-2 min-h-[44px] max-h-32"
            disabled={editing}
          />
          <button
            onClick={onSend}
            disabled={editing || !instruction.trim() || (balance ?? 0) < estCost}
            className="shrink-0 h-10 w-10 rounded-xl bg-ink text-paper grid place-items-center disabled:opacity-40 hover:scale-105 active:scale-95 transition"
            aria-label="Enviar"
          >
            {editing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-ink-soft">
          <span>{instruction.length}/1500</span>
          <span>
            {balance !== null && <span className="font-semibold text-ink">{balance}</span>} créditos · custo estimado {estCost}
          </span>
        </div>
        {(balance ?? 0) < estCost && (
          <Link to="/dev/precos" className="mt-2 block text-center text-[11px] underline text-flame">
            Sem créditos suficientes · ver planos
          </Link>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "system") {
    return (
      <div className="text-center text-[11px] text-ink-soft italic">{msg.text}</div>
    );
  }
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug whitespace-pre-wrap break-words ${
          isUser ? "bg-ink text-paper rounded-br-sm" : "bg-muted text-ink rounded-bl-sm"
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

/* =========================================================
   PREVIEW PANEL
========================================================= */
function PreviewPanel({ publicUrl, reloadKey, project }: { publicUrl: string | null; reloadKey: number; project: Project }) {
  return (
    <div className="h-full flex flex-col rounded-3xl border border-border bg-paper overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-widest text-ink-soft">Preview ao vivo</div>
        {project.slug && (
          <a
            href={`/s/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-flame hover:underline"
          >
            /s/{project.slug} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="flex-1 bg-muted/30">
        {publicUrl ? (
          <PreviewFrame src={publicUrl} title="Pré-visualização do site" reloadKey={reloadKey} height="100%" />
        ) : (
          <div className="h-full grid place-items-center text-center text-ink-soft text-sm p-8">
            Site não publicado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
