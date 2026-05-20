import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Paperclip,
  Plus,
  X,
  Check,
  Image as ImageIcon,
  Link2,
  FileText,
  LayoutGrid,
  Palette,
  Download,
  History,
  Send,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  PlayCircle,
  PauseCircle,
  Pencil,
  Copy,
  Rocket,
  FolderOpen,
  Wand2,
  CircleDot,
  ListChecks,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DEV_TEMPLATES } from "@/lib/dev/templates";
import { TemplateCover } from "@/components/dev/TemplateCover";

export const Route = createFileRoute("/dev/")({
  component: FlaroDevWorkspace,
  head: () => ({
    meta: [
      { title: "Flaro Dev · Workspace de criação por conversa" },
      {
        name: "description",
        content:
          "Crie sites profissionais conversando. Descreva, responda perguntas rápidas com opções e veja a prévia em segundos.",
      },
      { property: "og:title", content: "Flaro Dev · Workspace conversacional" },
      { property: "og:url", content: "https://setup.filro.site/dev" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev" }],
  }),
});

/* ----------------------------- Palette ----------------------------- */
const T = {
  page: "#EEEEEC",
  panel: "#FFFFFF",
  ink: "#111111",
  inkSoft: "#6F6F6F",
  muted: "#9A9A9A",
  divider: "#E7E7E4",
  assistant: "#F3E7D5",
  user: "#F6F6F4",
  input: "#F7F7F5",
  primary: "#050505",
  primaryFg: "#FFFFFF",
  beige: "#EAD7BD",
  success: "#2F8F55",
  warn: "#D89B28",
  err: "#D64545",
};

/* ----------------------------- Types ----------------------------- */
type Mode = "construir" | "plano" | "ajustar";

type Choice = { id: string; label: string };

type QuestionCard = {
  kind: "question";
  id: string;
  title: string;
  questions: {
    id: string;
    q: string;
    multi?: boolean;
    options: Choice[];
  }[];
  applied?: Record<string, string[]>;
};

type ProgressCard = {
  kind: "progress";
  id: string;
  steps: string[];
  current: number;
  done?: boolean;
};

type PlanCard = {
  kind: "plan";
  id: string;
  segment: string;
  objective: string;
  audience: string;
  pages: string[];
  components: string[];
  style: string;
  motion: string;
  data: string[];
  risks: string[];
  next: string;
};

type PreviewCard = {
  kind: "preview";
  id: string;
  name: string;
  cover: string;
  pages: number;
  components: number;
  previewRoute?: string;
  slug: string;
};

type Msg =
  | { kind: "assistant"; id: string; text: string }
  | { kind: "user"; id: string; text: string }
  | { kind: "system"; id: string; text: string }
  | { kind: "summary"; id: string; text: string }
  | QuestionCard
  | ProgressCard
  | PlanCard
  | PreviewCard;

/* ----------------------------- Helpers ----------------------------- */
function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: EASE, delay },
  };
}

/* ----------------------------- Smart Question Generation ----------------------------- */
function detectSegment(p: string): string {
  const t = p.toLowerCase();
  if (/odonto|dent/.test(t)) return "Clínica odontológica";
  if (/cl[ií]nic|saúde|estétic/.test(t)) return "Clínica";
  if (/mec[âa]nic|oficin|auto/.test(t)) return "Oficina automotiva";
  if (/restaur|pizz|hambur|caf[eé]|cardápio/.test(t)) return "Restaurante";
  if (/loja|moda|grocer|mercado/.test(t)) return "Loja local";
  if (/landing|venda|infoprodut/.test(t)) return "Landing de vendas";
  if (/saas|software/.test(t)) return "SaaS";
  if (/portf[óo]li/.test(t)) return "Portfólio";
  if (/serviç|encanador|eletricist|limpe/.test(t)) return "Serviço local";
  return "Projeto novo";
}

function buildClarification(prompt: string): QuestionCard {
  const seg = detectSegment(prompt);
  const sectionsBySeg: Record<string, string[]> = {
    "Clínica odontológica": ["Hero", "Serviços", "Equipe", "Avaliações", "Contato"],
    "Clínica": ["Hero", "Serviços", "Equipe", "Avaliações", "Contato"],
    "Oficina automotiva": ["Hero", "Serviços", "Processo", "Avaliações", "Planos/preços", "FAQ", "Contato"],
    "Restaurante": ["Hero", "Categorias", "Cardápio", "Combos", "Horários", "Localização"],
    "Loja local": ["Hero", "Vitrine", "Benefícios", "Promoções", "Localização"],
    "Landing de vendas": ["Hero", "Problema", "Solução", "Benefícios", "Oferta", "FAQ"],
    "SaaS": ["Hero", "Features", "Preços", "FAQ", "Prévia do dashboard"],
    "Portfólio": ["Hero", "Cases", "Serviços", "Sobre", "Contato"],
    "Serviço local": ["Hero", "Serviços", "Área atendida", "Avaliações", "FAQ", "Contato"],
    "Projeto novo": ["Hero", "Sobre", "Serviços", "Avaliações", "Contato"],
  };
  return {
    kind: "question",
    id: uid("q"),
    title: `Definir direção · ${seg}`,
    questions: [
      {
        id: "obj",
        q: "Qual é o objetivo principal?",
        options: [
          { id: "vender", label: "Vender serviço" },
          { id: "leads", label: "Capturar leads" },
          { id: "portfolio", label: "Apresentar portfólio" },
          { id: "pedidos", label: "Receber pedidos" },
          { id: "auto", label: "Decidir automaticamente" },
        ],
      },
      {
        id: "estilo",
        q: "Qual estilo visual você prefere?",
        options: [
          { id: "min", label: "Minimalista premium" },
          { id: "dark", label: "Moderno escuro" },
          { id: "claro", label: "Claro e comercial" },
          { id: "color", label: "Colorido e chamativo" },
          { id: "suporte", label: "Seguir estilo da Flaro Suporte" },
        ],
      },
      {
        id: "secoes",
        q: "Quais seções devem existir?",
        multi: true,
        options: (sectionsBySeg[seg] ?? sectionsBySeg["Projeto novo"]).map((s) => ({ id: s, label: s })).concat([{ id: "auto", label: "Decidir automaticamente" }]),
      },
      {
        id: "fluxo",
        q: "Quer gerar primeiro um plano ou construir direto?",
        options: [
          { id: "plano", label: "Gerar plano antes" },
          { id: "direto", label: "Construir direto" },
          { id: "expl", label: "Construir e explicar depois" },
        ],
      },
      {
        id: "fidel",
        q: "Qual nível de fidelidade?",
        options: [
          { id: "rapido", label: "Rápido e funcional" },
          { id: "refinado", label: "Visual muito refinado" },
          { id: "anim", label: "Completo com animações" },
          { id: "ultra", label: "Ultra detalhado" },
        ],
      },
    ],
  };
}

function buildPlanFromPrompt(prompt: string): PlanCard {
  const seg = detectSegment(prompt);
  return {
    kind: "plan",
    id: uid("plan"),
    segment: seg,
    objective: "Atrair contatos qualificados e apresentar serviços com clareza.",
    audience: "Clientes locais buscando atendimento confiável e rápido.",
    pages: ["Home / Landing", "Serviços", "Sobre", "Contato"],
    components: ["Hero com CTA", "Grid de serviços", "Prova social", "FAQ", "Formulário/WhatsApp"],
    style: "Tipografia limpa, paleta neutra, espaçamento generoso, micro-animações sutis.",
    motion: "Reveals suaves, easing ease-out 240ms, sem efeitos bruscos.",
    data: ["Nome do negócio", "WhatsApp", "Endereço", "Lista de serviços"],
    risks: ["Falta de imagens reais", "Texto genérico se não houver briefing"],
    next: "Construir uma primeira versão e iterar via prompt.",
  };
}

const PROGRESS_STEPS = [
  "Analisando pedido",
  "Definindo estrutura",
  "Criando componentes",
  "Aplicando estilo",
  "Preparando prévia",
];

/* ============================== Component ============================== */
function FlaroDevWorkspace() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("construir");
  const [prompt, setPrompt] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activePreviewRoute, setActivePreviewRoute] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<"Rascunho ativo" | "Construindo" | "Planejando" | "Aguardando resposta" | "Pronto para prévia">("Rascunho ativo");
  const [savedHint, setSavedHint] = useState("Salvo há instantes");

  const [messages, setMessages] = useState<Msg[]>([
    {
      kind: "assistant",
      id: uid("a"),
      text: "Descreva o projeto que você quer criar. Eu posso construir direto, gerar um plano antes ou fazer perguntas rápidas para definir o melhor caminho.",
    },
  ]);

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = timelineRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, previewOpen]);

  useEffect(() => {
    composerRef.current?.focus();
  }, []);

  function quickPrompt(text: string) {
    setPrompt(text);
    composerRef.current?.focus();
  }

  function pushMessage(m: Msg) {
    setMessages((prev) => [...prev, m]);
  }

  function simulateProgress(after?: () => void) {
    const id = uid("p");
    pushMessage({ kind: "progress", id, steps: PROGRESS_STEPS, current: 0 });
    setStatus("Construindo");
    let i = 0;
    const tick = () => {
      i++;
      setMessages((prev) =>
        prev.map((m) =>
          m.kind === "progress" && m.id === id
            ? { ...m, current: i, done: i >= PROGRESS_STEPS.length }
            : m,
        ),
      );
      if (i < PROGRESS_STEPS.length) {
        setTimeout(tick, 750);
      } else {
        setStatus("Pronto para prévia");
        setSavedHint("Salvo há instantes");
        after?.();
      }
    };
    setTimeout(tick, 600);
  }

  function handleSend(intent: Mode | "ask" = mode) {
    const text = prompt.trim();
    if (!text) return;
    setPrompt("");
    pushMessage({ kind: "user", id: uid("u"), text });

    if (intent === "plano") {
      setStatus("Planejando");
      setTimeout(() => {
        pushMessage({ kind: "assistant", id: uid("a"), text: "Aqui está um plano inicial baseado no seu pedido. Você pode ajustar antes de construir." });
        pushMessage(buildPlanFromPrompt(text));
        setStatus("Aguardando resposta");
      }, 500);
      return;
    }

    if (intent === "ask") {
      setTimeout(() => {
        pushMessage({
          kind: "assistant",
          id: uid("a"),
          text: "Consigo criar, mas faltam alguns detalhes que impactam o resultado. Responda rápido por opções.",
        });
        pushMessage(buildClarification(text));
        setStatus("Aguardando resposta");
      }, 400);
      return;
    }

    // Default "construir"
    setTimeout(() => {
      pushMessage({
        kind: "assistant",
        id: uid("a"),
        text: "Antes de construir, vou definir os pontos principais.",
      });
      pushMessage(buildClarification(text));
      setStatus("Aguardando resposta");
    }, 400);
  }

  function applyAnswers(card: QuestionCard, answers: Record<string, string[]>) {
    setMessages((prev) =>
      prev.map((m) => (m.kind === "question" && m.id === card.id ? { ...m, applied: answers } : m)),
    );
    const flat = Object.values(answers).flat();
    const labelById = new Map<string, string>();
    card.questions.forEach((q) => q.options.forEach((o) => labelById.set(`${q.id}:${o.id}`, o.label)));
    const summary = Object.entries(answers)
      .flatMap(([qid, ids]) => ids.map((id) => labelById.get(`${qid}:${id}`) ?? id))
      .filter(Boolean)
      .join(", ");
    pushMessage({ kind: "summary", id: uid("s"), text: `Preferências aplicadas: ${summary || "padrão"}.` });
    setTimeout(() => {
      simulateProgress(() => {
        const tpl = DEV_TEMPLATES[0];
        pushMessage({
          kind: "preview",
          id: uid("pv"),
          name: tpl.name,
          cover: tpl.coverImage,
          pages: 4 + Math.floor(Math.random() * 3),
          components: 18 + Math.floor(Math.random() * 6),
          previewRoute: tpl.previewRoute,
          slug: tpl.slug,
        });
      });
    }, 600);
  }

  function aiDecide(card: QuestionCard) {
    const auto: Record<string, string[]> = {};
    card.questions.forEach((q) => {
      const autoOpt = q.options.find((o) => o.id === "auto");
      auto[q.id] = [autoOpt ? autoOpt.id : q.options[0].id];
    });
    applyAnswers(card, auto);
  }

  function openPreview(route?: string) {
    setActivePreviewRoute(route);
    setPreviewOpen(true);
  }

  function pickTemplate(slug: string, name: string) {
    setShowTemplates(false);
    pushMessage({ kind: "summary", id: uid("s"), text: `Template selecionado: ${name}.` });
    const tpl = DEV_TEMPLATES.find((t) => t.slug === slug);
    if (tpl?.previewRoute) {
      pushMessage({
        kind: "preview",
        id: uid("pv"),
        name: tpl.name,
        cover: tpl.coverImage,
        pages: 5,
        components: 22,
        previewRoute: tpl.previewRoute,
        slug: tpl.slug,
      });
      setStatus("Pronto para prévia");
    }
  }

  function realGenerate() {
    // Bridge to existing generation flow with current prompt context.
    const last = [...messages].reverse().find((m) => m.kind === "user") as { text?: string } | undefined;
    const seed = (prompt.trim() || last?.text || "").trim();
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/dev/novo" } });
      return;
    }
    navigate({ to: "/dev/novo", search: seed ? { prompt: seed } : {} });
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: T.page, fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", color: T.ink }}
    >
      {/* Centered main panel */}
      <div className="flex-1 w-full flex items-start justify-center px-3 sm:px-6 py-4 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative w-full flex gap-4"
          style={{ maxWidth: previewOpen ? 1320 : 880 }}
        >
          {/* MAIN CARD */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
              background: T.panel,
              borderRadius: 30,
              border: `1px solid rgba(0,0,0,0.04)`,
              boxShadow: "0 30px 80px -40px rgba(15,15,15,0.18), 0 12px 30px -20px rgba(15,15,15,0.10)",
              minHeight: "min(82vh, 760px)",
              maxHeight: "calc(100vh - 80px)",
            }}
          >
            <Header
              status={status}
              savedHint={savedHint}
              onTemplates={() => setShowTemplates(true)}
              onHistory={() => setShowHistory(true)}
              onPublish={() => setShowPublish(true)}
              onPreview={() => openPreview(activePreviewRoute)}
            />

            <ModeSwitcher mode={mode} onChange={setMode} />

            <div
              ref={timelineRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-7 py-6"
              style={{ scrollbarGutter: "stable" }}
            >
              {messages.length === 1 && (
                <QuickActions onPick={quickPrompt} onTemplates={() => setShowTemplates(true)} onHistory={() => setShowHistory(true)} />
              )}

              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: EASE }}
                    >
                      <MessageView
                        m={m}
                        onApply={applyAnswers}
                        onAuto={aiDecide}
                        onOpenPreview={openPreview}
                        onPublish={() => setShowPublish(true)}
                        onBuild={realGenerate}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <Composer
              ref={composerRef}
              value={prompt}
              onChange={setPrompt}
              onSend={handleSend}
              mode={mode}
              sendOpen={sendOpen}
              setSendOpen={setSendOpen}
              attachOpen={attachOpen}
              setAttachOpen={setAttachOpen}
              onTemplates={() => setShowTemplates(true)}
            />
          </div>

          {/* RIGHT PREVIEW PANEL (desktop) */}
          <AnimatePresence>
            {previewOpen && (
              <motion.aside
                key="preview-drawer"
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 480 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                transition={{ duration: 0.34, ease: EASE }}
                className="hidden lg:flex flex-col overflow-hidden shrink-0"
                style={{
                  background: T.panel,
                  borderRadius: 30,
                  border: `1px solid rgba(0,0,0,0.04)`,
                  boxShadow: "0 30px 80px -40px rgba(15,15,15,0.18), 0 12px 30px -20px rgba(15,15,15,0.10)",
                  minHeight: "min(82vh, 760px)",
                  maxHeight: "calc(100vh - 80px)",
                }}
              >
                <PreviewPanel
                  route={activePreviewRoute}
                  device={previewDevice}
                  setDevice={setPreviewDevice}
                  onClose={() => setPreviewOpen(false)}
                  onPublish={() => setShowPublish(true)}
                />
              </motion.aside>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* MOBILE PREVIEW (full screen) */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            key="preview-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 flex flex-col"
            style={{ background: T.page }}
          >
            <PreviewPanel
              route={activePreviewRoute}
              device={previewDevice}
              setDevice={setPreviewDevice}
              onClose={() => setPreviewOpen(false)}
              onPublish={() => setShowPublish(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TemplatesModal open={showTemplates} onClose={() => setShowTemplates(false)} onPick={pickTemplate} />
      <HistoryModal open={showHistory} onClose={() => setShowHistory(false)} onOpenPreview={(r) => openPreview(r)} />
      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} />
    </div>
  );
}

/* ============================== Header ============================== */
function Header({
  status,
  savedHint,
  onTemplates,
  onHistory,
  onPublish,
  onPreview,
}: {
  status: string;
  savedHint: string;
  onTemplates: () => void;
  onHistory: () => void;
  onPublish: () => void;
  onPreview: () => void;
}) {
  const statusTone = (() => {
    if (status === "Construindo") return T.warn;
    if (status === "Aguardando resposta") return T.inkSoft;
    if (status === "Pronto para prévia") return T.success;
    return T.muted;
  })();

  return (
    <div className="px-4 sm:px-7 pt-5 pb-4 sm:pt-6 sm:pb-5" style={{ borderBottom: `1px solid ${T.divider}` }}>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Voltar"
          className="h-10 w-10 inline-flex items-center justify-center rounded-full transition-colors"
          style={{ background: T.input }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[15px] sm:text-base font-semibold tracking-tight">Flaro Dev</div>
            <StatusPill label={status} color={statusTone} />
          </div>
          <div className="mt-0.5 text-[12px] sm:text-[13px] flex items-center gap-2" style={{ color: T.inkSoft }}>
            <span>Sessão de criação</span>
            <span style={{ color: T.muted }}>·</span>
            <span style={{ color: T.muted }}>{savedHint}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center -space-x-2 mr-1" aria-hidden>
          {["A", "B", "C"].map((c, i) => (
            <div
              key={c}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold ring-2"
              style={{
                background: [T.beige, T.user, T.assistant][i],
                color: T.ink,
                // @ts-expect-error css var
                "--tw-ring-color": T.panel,
              }}
            >
              {c}
            </div>
          ))}
          <div
            className="h-7 px-2 rounded-full flex items-center text-[11px] font-semibold ring-2"
            style={{ background: T.input, color: T.inkSoft, ["--tw-ring-color" as any]: T.panel }}
          >
            +3
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn onClick={onTemplates} label="Templates"><LayoutGrid className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={onHistory} label="Histórico"><History className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={onPreview} label="Prévia"><Monitor className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={onPublish} label="Publicar"><Rocket className="h-4 w-4" /></IconBtn>
          <IconBtn label="Mais opções"><MoreHorizontal className="h-4 w-4" /></IconBtn>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-medium"
      style={{ background: T.input, color: T.ink }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function IconBtn({ children, onClick, label }: { children: ReactNode; onClick?: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
      style={{ color: T.ink }}
    >
      {children}
    </button>
  );
}

/* ============================== Mode Switcher ============================== */
function ModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const modes: { id: Mode; label: string }[] = [
    { id: "construir", label: "Construir" },
    { id: "plano", label: "Plano" },
    { id: "ajustar", label: "Ajustar" },
  ];
  return (
    <div className="px-4 sm:px-7 pt-4 pb-2 flex items-center gap-2 overflow-x-auto" style={{ borderBottom: `1px solid ${T.divider}` }}>
      <div className="relative inline-flex items-center p-1 rounded-full" style={{ background: T.input }}>
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className="relative h-8 px-4 rounded-full text-[13px] font-medium transition-colors"
              style={{ color: active ? T.primaryFg : T.ink }}
            >
              {active && (
                <motion.span
                  layoutId="mode-pill"
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: T.primary }}
                />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </div>
      <span className="text-[12px]" style={{ color: T.muted }}>
        {mode === "construir" && "Descreva e eu construo."}
        {mode === "plano" && "Eu organizo um plano antes de criar."}
        {mode === "ajustar" && "Peça mudanças no projeto atual."}
      </span>
    </div>
  );
}

/* ============================== Quick Actions ============================== */
function QuickActions({ onPick, onTemplates, onHistory }: { onPick: (p: string) => void; onTemplates: () => void; onHistory: () => void }) {
  const chips = [
    "Criar landing page",
    "Criar site institucional",
    "Criar loja local",
    "Criar cardápio digital",
  ];
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold mb-3" style={{ color: T.muted }}>
        Comece rápido
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            className="h-9 px-4 rounded-full text-[13px] font-medium transition-all hover:scale-[0.98] active:scale-95"
            style={{ background: T.input, color: T.ink }}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={onTemplates}
          className="h-9 px-4 rounded-full text-[13px] font-medium transition-all hover:scale-[0.98] inline-flex items-center gap-1.5"
          style={{ background: T.assistant, color: T.ink }}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Usar template
        </button>
        <button
          type="button"
          onClick={onHistory}
          className="h-9 px-4 rounded-full text-[13px] font-medium transition-all hover:scale-[0.98] inline-flex items-center gap-1.5"
          style={{ background: T.input, color: T.ink }}
        >
          <FolderOpen className="h-3.5 w-3.5" /> Continuar projeto
        </button>
      </div>
    </div>
  );
}

/* ============================== Messages ============================== */
function MessageView({
  m,
  onApply,
  onAuto,
  onOpenPreview,
  onPublish,
  onBuild,
}: {
  m: Msg;
  onApply: (c: QuestionCard, a: Record<string, string[]>) => void;
  onAuto: (c: QuestionCard) => void;
  onOpenPreview: (route?: string) => void;
  onPublish: () => void;
  onBuild: () => void;
}) {
  if (m.kind === "assistant") return <AssistantBubble text={m.text} />;
  if (m.kind === "user") return <UserBubble text={m.text} />;
  if (m.kind === "system") return <SystemNote text={m.text} />;
  if (m.kind === "summary") return <SystemNote text={m.text} muted />;
  if (m.kind === "question") return <QuestionView card={m} onApply={onApply} onAuto={onAuto} />;
  if (m.kind === "progress") return <ProgressView card={m} />;
  if (m.kind === "plan") return <PlanView card={m} onBuild={onBuild} />;
  if (m.kind === "preview") return <PreviewMsg card={m} onOpenPreview={onOpenPreview} onPublish={onPublish} />;
  return null;
}

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center" style={{ background: T.primary }}>
        <Wand2 className="h-4 w-4" style={{ color: T.primaryFg }} />
      </div>
      <div className="max-w-[78%] rounded-2xl rounded-tl-md px-4 py-3 text-[14px] leading-[1.55]" style={{ background: T.assistant, color: T.ink }}>
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-tr-md px-4 py-3 text-[14px] leading-[1.55] inline-flex flex-col items-end" style={{ background: T.user, color: T.ink }}>
        <span>{text}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-[11px]" style={{ color: T.muted }}>
          <Check className="h-3 w-3" /> Enviado
        </span>
      </div>
    </div>
  );
}

function SystemNote({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className="text-center text-[12px] py-1" style={{ color: muted ? T.muted : T.inkSoft }}>
      {text}
    </div>
  );
}

/* ----------------------------- Question Card ----------------------------- */
function QuestionView({
  card,
  onApply,
  onAuto,
}: {
  card: QuestionCard;
  onApply: (c: QuestionCard, a: Record<string, string[]>) => void;
  onAuto: (c: QuestionCard) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>(card.applied ?? {});

  function toggle(qid: string, oid: string, multi?: boolean) {
    if (card.applied) return;
    setAnswers((prev) => {
      const current = prev[qid] ?? [];
      if (multi) {
        const next = current.includes(oid) ? current.filter((x) => x !== oid) : [...current, oid];
        return { ...prev, [qid]: next };
      }
      return { ...prev, [qid]: [oid] };
    });
  }

  const isDone = !!card.applied;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: T.panel, border: `1px solid ${T.divider}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <ListChecks className="h-4 w-4" style={{ color: T.inkSoft }} />
        <div className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: T.muted }}>Perguntas rápidas</div>
      </div>
      <div className="font-semibold text-[16px]">{card.title}</div>

      <div className="mt-5 flex flex-col gap-5">
        {card.questions.map((q, qi) => (
          <div key={q.id}>
            <div className="text-[13.5px] font-medium mb-2.5 flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-semibold"
                style={{ background: T.input, color: T.inkSoft }}
              >
                {qi + 1}
              </span>
              {q.q}
              {q.multi && <span className="text-[11px] font-normal" style={{ color: T.muted }}>(múltipla escolha)</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {q.options.map((o) => {
                const selected = (answers[q.id] ?? []).includes(o.id);
                return (
                  <motion.button
                    key={o.id}
                    type="button"
                    onClick={() => toggle(q.id, o.id, q.multi)}
                    disabled={isDone}
                    whileTap={{ scale: 0.97 }}
                    className="h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors"
                    style={{
                      background: selected ? T.primary : T.input,
                      color: selected ? T.primaryFg : T.ink,
                      border: `1px solid ${selected ? T.primary : "transparent"}`,
                      opacity: isDone && !selected ? 0.5 : 1,
                    }}
                  >
                    {selected && <Check className="h-3 w-3 inline mr-1 -mt-0.5" />}
                    {o.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isDone}
          onClick={() => onApply(card, answers)}
          className="h-10 px-5 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 transition-transform hover:scale-[0.98] active:scale-95"
          style={{ background: T.primary, color: T.primaryFg, opacity: isDone ? 0.5 : 1 }}
        >
          Aplicar respostas <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={isDone}
          onClick={() => onAuto(card)}
          className="h-10 px-5 rounded-full text-[13px] font-medium"
          style={{ background: T.input, color: T.ink, opacity: isDone ? 0.5 : 1 }}
        >
          Deixar a IA decidir
        </button>
        <button
          type="button"
          disabled={isDone}
          className="h-10 px-4 rounded-full text-[13px] font-medium"
          style={{ color: T.inkSoft }}
        >
          Pular
        </button>
        <span className="ml-auto text-[12px]" style={{ color: T.muted }}>Você pode alterar isso depois.</span>
      </div>
      {isDone && (
        <div className="mt-3 text-[12px] inline-flex items-center gap-1.5" style={{ color: T.success }}>
          <Check className="h-3.5 w-3.5" /> Respostas aplicadas
        </div>
      )}
    </motion.div>
  );
}

/* ----------------------------- Progress Card ----------------------------- */
function ProgressView({ card }: { card: ProgressCard }) {
  const pct = Math.min(100, Math.round((card.current / card.steps.length) * 100));
  const label = card.done ? "Finalizado" : card.steps[Math.min(card.current, card.steps.length - 1)];
  return (
    <div className="rounded-2xl p-4 sm:p-5 flex items-center gap-4" style={{ background: T.assistant }}>
      <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: T.primary, color: T.primaryFg }}>
        {card.done ? <Check className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[13px] font-semibold">{label}</div>
          <div className="text-[11px]" style={{ color: T.inkSoft }}>{pct}%</div>
        </div>
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.45, ease: EASE }}
            className="h-full"
            style={{ background: T.primary }}
          />
        </div>
        <div className="mt-1.5 text-[11px]" style={{ color: T.muted }}>
          {card.current}/{card.steps.length} etapas
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Plan Card ----------------------------- */
function PlanView({ card, onBuild }: { card: PlanCard; onBuild: () => void }) {
  const rows: { label: string; value: string | string[] }[] = [
    { label: "Objetivo", value: card.objective },
    { label: "Público-alvo", value: card.audience },
    { label: "Estrutura de páginas", value: card.pages },
    { label: "Componentes principais", value: card.components },
    { label: "Estilo visual", value: card.style },
    { label: "Animações", value: card.motion },
    { label: "Dados necessários", value: card.data },
    { label: "Riscos / atenção", value: card.risks },
    { label: "Próximo passo", value: card.next },
  ];
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: T.panel, border: `1px solid ${T.divider}` }}>
      <div className="flex items-center gap-2 mb-1">
        <CircleDot className="h-4 w-4" style={{ color: T.inkSoft }} />
        <div className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: T.muted }}>Plano · {card.segment}</div>
      </div>
      <div className="font-semibold text-[16px]">Plano de construção</div>
      <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: T.muted }}>{r.label}</div>
            {Array.isArray(r.value) ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {r.value.map((v) => (
                  <span key={v} className="h-7 px-2.5 rounded-full text-[12px]" style={{ background: T.input, color: T.ink, display: "inline-flex", alignItems: "center" }}>{v}</span>
                ))}
              </div>
            ) : (
              <div className="mt-1 text-[13.5px]" style={{ color: T.ink }}>{r.value}</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBuild}
          className="h-10 px-5 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 hover:scale-[0.98] active:scale-95 transition-transform"
          style={{ background: T.primary, color: T.primaryFg }}
        >
          Construir agora <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="h-10 px-5 rounded-full text-[13px] font-medium" style={{ background: T.input, color: T.ink }}>Editar plano</button>
        <button type="button" className="h-10 px-5 rounded-full text-[13px] font-medium" style={{ background: T.input, color: T.ink }}>Gerar variação</button>
      </div>
    </div>
  );
}

/* ----------------------------- Preview Card ----------------------------- */
function PreviewMsg({ card, onOpenPreview, onPublish }: { card: PreviewCard; onOpenPreview: (r?: string) => void; onPublish: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.panel, border: `1px solid ${T.divider}` }}>
      <div className="overflow-hidden" style={{ background: T.input }}>
        <TemplateCover src={card.cover} name={card.name} previewRoute={card.previewRoute} />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: T.muted }}>Prévia pronta</div>
            <div className="mt-0.5 font-semibold text-[15px]">{card.name}</div>
            <div className="text-[12px] mt-0.5" style={{ color: T.inkSoft }}>{card.pages} páginas · {card.components} componentes</div>
          </div>
          <span className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium" style={{ background: T.input, color: T.ink }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.success }} /> Pronto
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onOpenPreview(card.previewRoute)} className="h-10 px-4 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 hover:scale-[0.98] active:scale-95 transition-transform" style={{ background: T.primary, color: T.primaryFg }}>
            <Monitor className="h-3.5 w-3.5" /> Abrir prévia
          </button>
          <button type="button" className="h-10 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5" style={{ background: T.input, color: T.ink }}>
            <Pencil className="h-3.5 w-3.5" /> Editar com prompt
          </button>
          <button type="button" onClick={onPublish} className="h-10 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5" style={{ background: T.input, color: T.ink }}>
            <Rocket className="h-3.5 w-3.5" /> Publicar
          </button>
          <button type="button" className="h-10 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5" style={{ background: T.input, color: T.ink }}>
            <Copy className="h-3.5 w-3.5" /> Duplicar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Composer ============================== */


const Composer = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (v: string) => void;
    onSend: (intent?: Mode | "ask") => void;
    mode: Mode;
    sendOpen: boolean;
    setSendOpen: (v: boolean) => void;
    attachOpen: boolean;
    setAttachOpen: (v: boolean) => void;
    onTemplates: () => void;
  }
>(function Composer({ value, onChange, onSend, mode, sendOpen, setSendOpen, attachOpen, setAttachOpen, onTemplates }, ref) {
  const sendOptions: { id: Mode | "ask"; label: string }[] = [
    { id: mode, label: "Enviar agora" },
    { id: "plano", label: "Gerar plano" },
    { id: "construir", label: "Construir direto" },
    { id: "ajustar", label: "Apenas ajustar" },
    { id: "ask", label: "Perguntar antes" },
  ];

  return (
    <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-2 relative" style={{ borderTop: `1px solid ${T.divider}` }}>
      {/* Attachment menu */}
      <AnimatePresence>
        {attachOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute bottom-full left-3 mb-2 z-20 w-[280px] p-1.5 rounded-2xl"
            style={{ background: T.panel, border: `1px solid ${T.divider}`, boxShadow: "0 20px 50px -20px rgba(0,0,0,0.18)" }}
          >
            {[
              { I: ImageIcon, t: "Anexar imagem", d: "Foto, logo ou referência visual" },
              { I: Link2, t: "Anexar referência de site", d: "Link para inspiração ou concorrência" },
              { I: FileText, t: "Anexar briefing", d: "PDF ou texto com o projeto" },
              { I: LayoutGrid, t: "Usar template", d: "Começar a partir de um modelo", onClick: () => { setAttachOpen(false); onTemplates(); } },
              { I: Download, t: "Importar projeto", d: "Continuar um trabalho existente" },
              { I: Palette, t: "Adicionar paleta de cores", d: "Definir cores da marca" },
            ].map((it) => (
              <button
                key={it.t}
                type="button"
                onClick={it.onClick ?? (() => setAttachOpen(false))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-black/[0.04]"
              >
                <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: T.input }}>
                  <it.I className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{it.t}</div>
                  <div className="text-[11.5px]" style={{ color: T.muted }}>{it.d}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl p-2.5 sm:p-3" style={{ background: T.input, border: `1px solid ${T.divider}` }}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={2}
          placeholder="Mensagem para Flaro Dev"
          className="w-full resize-none bg-transparent text-[14px] leading-[1.55] px-2 pt-2 pb-2 outline-none placeholder:text-[color:var(--mu)]"
          style={{ color: T.ink, ["--mu" as any]: T.muted, minHeight: 56, maxHeight: 180 }}
        />
        <div className="flex items-center gap-1.5 px-1">
          <button
            type="button"
            aria-label="Anexar"
            onClick={() => setAttachOpen(!attachOpen)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.05]"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Anexar arquivo"
            onClick={() => setAttachOpen(!attachOpen)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.05]"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onTemplates}
            className="h-9 px-3 rounded-full text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-colors hover:bg-black/[0.05]"
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Templates
          </button>

          <div className="flex-1" />

          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => onSend()}
              className="h-10 pl-4 pr-3 rounded-full text-[13px] font-semibold inline-flex items-center gap-2 hover:scale-[0.98] active:scale-95 transition-transform"
              style={{ background: T.primary, color: T.primaryFg }}
            >
              <Send className="h-3.5 w-3.5" /> Enviar agora
            </button>
            <button
              type="button"
              aria-label="Opções de envio"
              onClick={() => setSendOpen(!sendOpen)}
              className="h-10 w-10 ml-1 rounded-full inline-flex items-center justify-center hover:scale-[0.98] active:scale-95 transition-transform"
              style={{ background: T.primary, color: T.primaryFg }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {sendOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute bottom-full right-0 mb-2 z-20 w-[220px] p-1.5 rounded-2xl"
                  style={{ background: T.panel, border: `1px solid ${T.divider}`, boxShadow: "0 20px 50px -20px rgba(0,0,0,0.18)" }}
                >
                  {sendOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => { setSendOpen(false); onSend(opt.id); }}
                      className="w-full px-3 py-2 rounded-lg text-[13px] text-left transition-colors hover:bg-black/[0.04]"
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px]" style={{ color: T.muted }}>
        Pressione Enter para enviar · Shift + Enter para nova linha
      </p>
    </div>
  );
});

/* ============================== Preview Panel ============================== */
function PreviewPanel({
  route,
  device,
  setDevice,
  onClose,
  onPublish,
}: {
  route?: string;
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  onClose: () => void;
  onPublish: () => void;
}) {
  const frameWidth = device === "desktop" ? "100%" : device === "tablet" ? 820 : 390;
  return (
    <>
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.divider}` }}>
        <button type="button" aria-label="Fechar prévia" onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-full" style={{ background: T.input }}>
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">Prévia do projeto</div>
          <div className="text-[11.5px]" style={{ color: T.muted }}>Última alteração há instantes</div>
        </div>
        <div className="inline-flex items-center p-1 rounded-full" style={{ background: T.input }}>
          {([
            { id: "desktop", I: Monitor },
            { id: "tablet", I: Tablet },
            { id: "mobile", I: Smartphone },
          ] as const).map((d) => (
            <button
              key={d.id}
              type="button"
              aria-label={d.id}
              onClick={() => setDevice(d.id)}
              className="h-7 w-8 rounded-full inline-flex items-center justify-center"
              style={{ background: device === d.id ? T.panel : "transparent", color: T.ink, boxShadow: device === d.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}
            >
              <d.I className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <button type="button" onClick={onPublish} className="h-9 px-4 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5" style={{ background: T.primary, color: T.primaryFg }}>
          <Rocket className="h-3.5 w-3.5" /> Publicar
        </button>
      </div>
      <div className="flex-1 min-h-0 p-4 flex items-start justify-center overflow-auto" style={{ background: T.page }}>
        <div
          className="rounded-2xl overflow-hidden mx-auto"
          style={{ width: frameWidth, maxWidth: "100%", aspectRatio: device === "mobile" ? "9 / 16" : device === "tablet" ? "4 / 3" : "16 / 10", background: T.panel, border: `1px solid ${T.divider}` }}
        >
          {route ? (
            <iframe src={route} title="Prévia" className="w-full h-full block bg-white border-0" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[13px]" style={{ color: T.muted }}>
              Construa um projeto para ver a prévia aqui.
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-3 flex items-center justify-between text-[12px]" style={{ borderTop: `1px solid ${T.divider}`, color: T.inkSoft }}>
        <span>Editar seção</span>
        <span>Ver código</span>
      </div>
    </>
  );
}

/* ============================== Modals ============================== */
function ModalShell({ open, onClose, title, subtitle, children }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: "rgba(15,15,15,0.32)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-[920px] max-h-[92vh] flex flex-col overflow-hidden"
            style={{
              background: T.panel,
              borderRadius: 26,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              border: `1px solid ${T.divider}`,
            }}
          >
            <div className="px-5 sm:px-7 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.divider}` }}>
              <div className="flex-1">
                <div className="font-semibold text-[16px]">{title}</div>
                {subtitle && <div className="text-[12.5px]" style={{ color: T.inkSoft }}>{subtitle}</div>}
              </div>
              <button type="button" aria-label="Fechar" onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-full" style={{ background: T.input }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TemplatesModal({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (slug: string, name: string) => void }) {
  return (
    <ModalShell open={open} onClose={onClose} title="Templates" subtitle="Comece por um modelo pronto e ajuste por conversa.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEV_TEMPLATES.map((t) => (
          <div key={t.slug} className="rounded-2xl overflow-hidden flex flex-col" style={{ border: `1px solid ${T.divider}` }}>
            <div className="overflow-hidden" style={{ background: T.input }}>
              <TemplateCover src={t.coverImage} name={t.name} previewRoute={t.previewRoute} />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: T.muted }}>{t.segment.split(",")[0]}</div>
              <div className="mt-1 font-semibold text-[14px]">{t.name}</div>
              <p className="mt-1 text-[12.5px] flex-1" style={{ color: T.inkSoft }}>{t.description}</p>
              <button
                type="button"
                onClick={() => onPick(t.slug, t.name)}
                className="mt-3 h-9 px-4 rounded-full text-[12.5px] font-semibold self-start"
                style={{ background: T.primary, color: T.primaryFg }}
              >
                Usar template
              </button>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function HistoryModal({ open, onClose, onOpenPreview }: { open: boolean; onClose: () => void; onOpenPreview: (route?: string) => void }) {
  const items = DEV_TEMPLATES.slice(0, 5).map((t, i) => ({
    name: `Projeto ${t.name}`,
    date: ["há 12 min", "ontem", "há 2 dias", "há 5 dias", "semana passada"][i] ?? "recente",
    status: ["Em edição", "Prévia pronta", "Publicado", "Rascunho", "Prévia pronta"][i] as "Em edição" | "Prévia pronta" | "Publicado" | "Rascunho",
    last: ["Editou o hero", "Aplicou novo plano", "Publicou no domínio", "Iniciou nova sessão", "Trocou paleta"][i],
    cover: t.coverImage,
    previewRoute: t.previewRoute,
  }));
  return (
    <ModalShell open={open} onClose={onClose} title="Histórico de projetos" subtitle="Continue de onde parou ou duplique uma sessão.">
      <div className="flex flex-col gap-3">
        {items.map((it) => {
          const tone =
            it.status === "Publicado" ? T.success :
            it.status === "Prévia pronta" ? T.success :
            it.status === "Em edição" ? T.warn :
            T.muted;
          return (
            <div key={it.name} className="rounded-2xl p-3 sm:p-4 flex items-center gap-4" style={{ border: `1px solid ${T.divider}` }}>
              <div className="h-16 w-24 rounded-xl overflow-hidden shrink-0" style={{ background: T.input }}>
                <img src={it.cover} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-[14px] truncate">{it.name}</div>
                  <span className="h-6 px-2.5 inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium" style={{ background: T.input, color: T.ink }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} /> {it.status}
                  </span>
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: T.inkSoft }}>{it.last} · {it.date}</div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button type="button" onClick={() => { onClose(); onOpenPreview(it.previewRoute); }} className="h-9 px-3.5 rounded-full text-[12.5px] font-semibold" style={{ background: T.primary, color: T.primaryFg }}>Abrir</button>
                <button type="button" className="h-9 px-3.5 rounded-full text-[12.5px] font-medium" style={{ background: T.input, color: T.ink }}>Continuar</button>
                <button type="button" className="h-9 w-9 rounded-full inline-flex items-center justify-center" style={{ background: T.input, color: T.ink }} aria-label="Duplicar"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

function PublishModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [slug, setSlug] = useState("meu-projeto");
  const taken = ["meu-projeto", "clinica", "loja"];
  const isTaken = taken.includes(slug.toLowerCase());
  const url = `flaro.site/id/${slug || "meu-projeto"}`;
  const [option, setOption] = useState<"temp" | "domain" | "export" | "duplicate">("temp");

  return (
    <ModalShell open={open} onClose={onClose} title="Publicar projeto" subtitle="Escolha como deseja disponibilizar o site.">
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {([
          { id: "temp", I: Globe, t: "Link temporário", d: "Publique em segundos em flaro.site." },
          { id: "domain", I: Rocket, t: "Domínio conectado", d: "Use um domínio próprio já configurado." },
          { id: "export", I: Download, t: "Exportar projeto", d: "Baixe o código para hospedar onde quiser." },
          { id: "duplicate", I: Copy, t: "Duplicar projeto", d: "Crie uma cópia para iterar separadamente." },
        ] as const).map((opt) => {
          const active = option === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setOption(opt.id)}
              className="text-left rounded-2xl p-4 flex gap-3 transition-colors"
              style={{ border: `1px solid ${active ? T.primary : T.divider}`, background: active ? T.input : T.panel }}
            >
              <div className="h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0" style={{ background: T.input }}>
                <opt.I className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-[13.5px]">{opt.t}</div>
                <div className="text-[12px]" style={{ color: T.inkSoft }}>{opt.d}</div>
              </div>
            </button>
          );
        })}
      </div>

      {option === "temp" && (
        <div className="rounded-2xl p-4 sm:p-5" style={{ border: `1px solid ${T.divider}` }}>
          <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: T.muted }}>Slug do projeto</label>
          <div className="mt-2 flex items-center gap-2 rounded-full px-3 h-11" style={{ background: T.input }}>
            <span className="text-[13px]" style={{ color: T.inkSoft }}>flaro.site/id/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="flex-1 bg-transparent outline-none text-[13px]"
              placeholder="meu-projeto"
            />
            <span className="text-[11.5px]" style={{ color: isTaken ? T.err : T.success }}>
              {isTaken ? "Indisponível" : "Disponível"}
            </span>
          </div>
          {isTaken && (
            <div className="mt-3">
              <div className="text-[12px] mb-1.5" style={{ color: T.inkSoft }}>Sugestões disponíveis:</div>
              <div className="flex flex-wrap gap-2">
                {[`${slug}-1`, `${slug}-2`, `${slug}-local`].map((s) => (
                  <button key={s} type="button" onClick={() => setSlug(s)} className="h-8 px-3 rounded-full text-[12px]" style={{ background: T.input, color: T.ink }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 text-[12.5px]" style={{ color: T.inkSoft }}>URL de prévia: <span style={{ color: T.ink, fontWeight: 600 }}>{url}</span></div>
          {!isTaken ? (
            <button type="button" className="mt-5 h-11 px-5 rounded-full text-[13px] font-semibold inline-flex items-center gap-2" style={{ background: T.primary, color: T.primaryFg }}>
              <Rocket className="h-3.5 w-3.5" /> Publicar agora
            </button>
          ) : (
            <div className="mt-4 text-[12px]" style={{ color: T.err }}>Escolha um slug disponível para continuar.</div>
          )}
        </div>
      )}

      {option !== "temp" && (
        <div className="rounded-2xl p-5 text-[13px]" style={{ background: T.input, color: T.inkSoft }}>
          Esta opção será habilitada após você concluir as configurações do projeto.
        </div>
      )}
    </ModalShell>
  );
}
