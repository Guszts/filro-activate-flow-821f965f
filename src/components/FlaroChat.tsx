import { useState, useRef, useEffect, Fragment } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Mail, ArrowRight } from "lucide-react";
import { flaroChat } from "@/lib/flaro.functions";

type Msg = { role: "user" | "assistant"; content: string };

type Action = { type: "wa" | "email" | "plans"; href: string; label: string; icon: "wa" | "mail" | "spark" };

const WA_HREF = "https://wa.me/5592993561754";
const PLANS_HREF = "/#ativacao";

function parseAssistantMessage(content: string): { text: string; actions: Action[] } {
  const actions: Action[] = [];
  let text = content;

  const waRegex = /(?:https?:\/\/wa\.me\/\d+|(?:\+?\s?55[\s.-]?)?\(?\s?92\s?\)?[\s.-]?9?\s?9356[\s.-]?1754)/gi;
  if (waRegex.test(text)) {
    actions.push({ type: "wa", href: WA_HREF, label: "Falar no WhatsApp", icon: "wa" });
    text = text.replace(waRegex, "");
  }

  const emailRegex = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
  const seen = new Set<string>();
  const emails = text.match(emailRegex) || [];
  for (const e of emails) {
    if (seen.has(e.toLowerCase())) continue;
    seen.add(e.toLowerCase());
    actions.push({ type: "email", href: `mailto:${e}`, label: "Send e-mail", icon: "mail" });
  }
  text = text.replace(emailRegex, "");

  if (/\b(planos?|preços?|iniciar ativação|ativar (sua |a )?página|ver planos|contratar)\b/i.test(text)) {
    actions.push({ type: "plans", href: PLANS_HREF, label: "See pricing", icon: "spark" });
  }

  text = text
    .replace(/\(\s*[·\-,]?\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, actions };
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/);
    if (m) return <strong key={i} className="font-bold">{m[1]}</strong>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function ActionChip({ a }: { a: Action }) {
  const Icon = a.icon === "wa" ? MessageCircle : a.icon === "mail" ? Mail : ArrowRight;
  const isExternal = a.href.startsWith("http") || a.href.startsWith("mailto:");
  return (
    <a
      href={a.href}
      target={isExternal && a.href.startsWith("http") ? "_blank" : undefined}
      rel={isExternal && a.href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-ink text-paper text-xs font-semibold hover:scale-105 active:scale-95 transition"
    >
      <Icon className="h-3.5 w-3.5" />
      {a.label}
    </a>
  );
}

const INTRO: Msg = {
  role: "assistant",
  content:
    "Oi! Eu sou o Flaro, atendente inteligente da Filro. Como posso te ajudar a colocar sua página no ar within 1 business day?",
};

export function FlaroChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INTRO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendChat = useServerFn(flaroChat);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const result = await sendChat({ data: { messages: next } });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tive um problema agora. Pode tentar de novo?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat com Flaro" : "Abrir chat com Flaro"}
        className="fixed z-[60] bottom-5 right-5 md:bottom-6 md:right-6 h-14 w-14 rounded-full grid place-items-center text-ink shadow-2xl transition-transform hover:scale-105 active:scale-95 bg-lime ring-2 ring-ink"
        style={{
          boxShadow: "0 16px 40px -8px oklch(0.255 0.035 260 / 0.45)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[59] bottom-24 right-3 md:right-6 w-[calc(100vw-1.5rem)] max-w-[400px] h-[min(640px,80vh)] rounded-3xl overflow-hidden border border-ink/10 bg-paper shadow-2xl flex flex-col"
            style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.4)" }}
          >
            {/* Header — Moda palette: paper base with lime + flame blocks */}
            <div className="px-5 py-4 text-ink relative overflow-hidden bg-paper border-b border-ink/10">
              <div className="absolute -left-8 -top-8 h-28 w-24 rotate-12 rounded-3xl bg-lime" />
              <div className="absolute right-0 -top-4 h-20 w-16 -rotate-6 rounded-3xl bg-flame" />
              <div className="absolute -bottom-6 left-16 h-12 w-28 rotate-3 rounded-3xl bg-ink/90" />
              <div className="relative flex items-center gap-3">
                <div>
                  <div className="font-display font-black leading-tight text-ink">Flaro</div>
                  <div className="text-xs text-ink-soft">Atendente inteligente da Filro</div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] bg-ink text-paper px-2 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Online
                </span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper">
              {messages.map((m, i) => {
                const parsed = m.role === "assistant" ? parseAssistantMessage(m.content) : null;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-ink text-paper rounded-br-md"
                          : "bg-lime/30 text-ink rounded-bl-md border border-ink/10"
                      }`}
                    >
                      {parsed ? renderInline(parsed.text) : m.content}
                    </div>
                    {parsed && parsed.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                        {parsed.actions.map((a, k) => <ActionChip key={k} a={a} />)}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-lime/30 border border-ink/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-ink text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Flaro está digitando…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-3 border-t border-border bg-paper flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Pergunte ao Flaro…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-ink/40 max-h-32"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="h-10 w-10 grid place-items-center rounded-xl bg-ink text-paper disabled:opacity-40 transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
