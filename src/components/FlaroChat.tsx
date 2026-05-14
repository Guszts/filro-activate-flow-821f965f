import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { flaroChat } from "@/lib/flaro.functions";

type Msg = { role: "user" | "assistant"; content: string };

const INTRO: Msg = {
  role: "assistant",
  content:
    "Oi! Eu sou o Flaro, atendente inteligente da Filro. Como posso te ajudar a colocar sua página no ar em 24h?",
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
        aria-label={open ? "Fechar chat com Flaro" : "Abrir chat com Flaro"}
        className="fixed z-[60] bottom-5 right-5 md:bottom-6 md:right-6 h-14 w-14 rounded-full grid place-items-center text-paper shadow-2xl transition-transform hover:scale-105 active:scale-95"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, oklch(0.78 0.18 95) 0%, oklch(0.628 0.231 30) 60%, oklch(0.45 0.18 280) 100%)",
          boxShadow: "0 16px 40px -8px oklch(0.628 0.231 30 / 0.5)",
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
            className="fixed z-[59] bottom-24 right-3 md:right-6 w-[calc(100vw-1.5rem)] max-w-[400px] h-[min(640px,80vh)] rounded-3xl overflow-hidden border border-white/10 bg-paper shadow-2xl flex flex-col"
            style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.4)" }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 text-paper relative overflow-hidden"
              style={{
                background:
                  "radial-gradient(120% 120% at 0% 0%, oklch(0.78 0.18 95) 0%, oklch(0.628 0.231 30) 60%, oklch(0.35 0.15 280) 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "14px 14px" }} />
              <div className="relative flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-paper/95 grid place-items-center text-ink font-display font-black text-lg">F</div>
                <div>
                  <div className="font-display font-black leading-tight">Flaro</div>
                  <div className="text-xs opacity-90">Atendente inteligente da Filro</div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] bg-paper/15 px-2 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
                </span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-ink text-paper rounded-br-md"
                        : "bg-stone text-ink rounded-bl-md border border-border"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-stone border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-ink-soft text-sm">
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
                aria-label="Enviar"
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
