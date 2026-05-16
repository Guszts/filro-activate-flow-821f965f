import { useMemo, useState } from "react";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";

export function FlaroDevPreview({
  html,
  css,
  js,
  emptyHint,
}: {
  html: string;
  css: string;
  js: string;
  emptyHint?: string;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const srcDoc = useMemo(() => {
    if (!html.trim()) return "";
    // Inject CSS/JS into html if not already present
    const styleTag = css.trim() ? `<style>${css}</style>` : "";
    const scriptTag = js.trim() ? `<script>${js}</script>` : "";
    if (html.includes("</head>")) {
      return html
        .replace("</head>", `${styleTag}</head>`)
        .replace("</body>", `${scriptTag}</body>`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styleTag}</head><body>${html}${scriptTag}</body></html>`;
  }, [html, css, js]);

  return (
    <div className="h-full flex flex-col bg-secondary/40">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-paper">
        <div className="text-xs text-ink-soft font-medium">Preview</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`h-8 w-8 grid place-items-center rounded-lg transition ${device === "desktop" ? "bg-ink text-paper" : "text-ink-soft hover:bg-secondary"}`}
            aria-label="Visualizar em desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`h-8 w-8 grid place-items-center rounded-lg transition ${device === "mobile" ? "bg-ink text-paper" : "text-ink-soft hover:bg-secondary"}`}
            aria-label="Visualizar em mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 grid place-items-center p-4 overflow-auto">
        {srcDoc ? (
          <div
            className={`bg-white rounded-2xl shadow-card overflow-hidden transition-all ${
              device === "desktop" ? "w-full h-full" : "w-[390px] h-[780px] max-h-full"
            }`}
          >
            <iframe
              title="Preview"
              srcDoc={srcDoc}
              sandbox="allow-scripts allow-forms"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="text-center max-w-sm">
            <ExternalLink className="h-10 w-10 text-ink-soft/40 mx-auto mb-3" />
            <p className="text-sm text-ink-soft">
              {emptyHint ?? "Converse com o Flaro Dev para começar a gerar a sua página."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
