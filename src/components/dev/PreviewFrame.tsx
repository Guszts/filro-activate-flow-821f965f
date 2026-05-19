import { useMemo, useState } from "react";
import { Monitor, Tablet, Smartphone, RotateCw, ExternalLink, Copy, Check } from "lucide-react";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

type Props = {
  src: string;
  title: string;
  /** Optional external/absolute URL shown in the bar and used for "open in new tab". */
  externalUrl?: string;
  /** Visual height of the viewport area, e.g. "min(75vh, 760px)". */
  height?: string;
  /** Controlled reload signal — bump to force iframe refresh. */
  reloadKey?: number;
  onReloadRequest?: () => void;
};

const DEVICE_WIDTHS: Record<PreviewDevice, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

export function PreviewFrame({ src, title, externalUrl, height = "min(75vh, 760px)", reloadKey, onReloadRequest }: Props) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [internalReload, setInternalReload] = useState(0);
  const [copied, setCopied] = useState(false);
  const effectiveReload = (reloadKey ?? 0) + internalReload;

  const url = externalUrl ?? src;
  const iframeSrc = useMemo(() => {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}__v=${effectiveReload}`;
  }, [src, effectiveReload]);

  function reload() {
    setInternalReload((n) => n + 1);
    onReloadRequest?.();
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  }

  const isDesktop = device === "desktop";
  const frameWidth = DEVICE_WIDTHS[device];

  return (
    <div className="rounded-3xl border border-border bg-paper overflow-hidden shadow-elegant">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
        <div className="flex items-center gap-1.5 pr-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>

        <button
          type="button"
          onClick={reload}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-ink-soft hover:text-ink hover:bg-paper transition-colors"
          aria-label="Recarregar pré-visualização"
          title="Recarregar"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>

        <div className="flex-1 min-w-0 mx-1">
          <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-paper border border-border text-xs text-ink-soft truncate">
            <span className="truncate flex-1">{url}</span>
            <button
              type="button"
              onClick={copyUrl}
              className="h-6 w-6 inline-flex items-center justify-center rounded text-ink-soft hover:text-ink hover:bg-muted transition-colors"
              aria-label="Copiar URL"
              title="Copiar URL"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>

        <div className="inline-flex items-center rounded-lg border border-border bg-paper p-0.5">
          {(["desktop", "tablet", "mobile"] as const).map((d) => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            const active = device === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                aria-label={`Pré-visualizar em ${d}`}
                title={d === "desktop" ? "Desktop" : d === "tablet" ? "Tablet" : "Mobile"}
                className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink hover:bg-muted"}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-ink-soft hover:text-ink hover:bg-paper transition-colors"
          aria-label="Abrir em nova aba"
          title="Abrir em nova aba"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Viewport */}
      <div
        className={`relative bg-[#0f1115] flex justify-center ${isDesktop ? "p-0" : "p-4 md:p-8"}`}
        style={{ height }}
      >
        <div
          className={`relative bg-paper overflow-hidden ${isDesktop ? "w-full h-full" : "h-full rounded-[28px] shadow-2xl ring-1 ring-black/40"}`}
          style={isDesktop ? undefined : { width: `min(${frameWidth}px, 100%)`, maxWidth: `${frameWidth}px` }}
        >
          <iframe
            key={effectiveReload}
            src={iframeSrc}
            title={title}
            className="w-full h-full block bg-paper"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
