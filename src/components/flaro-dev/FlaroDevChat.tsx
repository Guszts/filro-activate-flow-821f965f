import { useState, useRef, useEffect, Fragment } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

export type FlaroDevMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function renderMarkdown(text: string) {
  // strip ```json blocks for display
  const cleaned = text.replace(/```json[\s\S]*?```/g, "").trim();
  const parts = cleaned.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/);
    if (m) return <strong key={i}>{m[1]}</strong>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function FlaroDevChat({
  messages,
  onSend,
  loading,
}: {
  messages: FlaroDevMessage[];
  onSend: (text: string) => Promise<void> | void;
  loading: boolean;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await onSend(text);
  }

  return (
    <div className="flex flex-col h-full bg-paper">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-paper mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-ink">Comece a construir</h3>
            <p className="text-sm text-ink-soft mt-1 max-w-xs mx-auto">
              Descreva o que quer criar e o Flaro Dev gera para você.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id ?? i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-ink text-paper rounded-br-md"
                  : "bg-secondary text-ink rounded-bl-md"
              }`}
            >
              {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Flaro Dev está gerando…
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-border bg-paper flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Descreva o que você quer criar ou ajustar…"
          rows={2}
          disabled={loading}
          className="flex-1 resize-none rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-ink/40 max-h-40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Enviar"
          className="h-10 w-10 grid place-items-center rounded-xl bg-ink text-paper disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
