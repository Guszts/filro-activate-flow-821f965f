type Props = {
  src: string;
  name: string;
  /** Optional live preview route — when present, renders a scaled desktop iframe. */
  previewRoute?: string;
  /** Aspect ratio of the cover. Defaults to 16/10. */
  className?: string;
};

/**
 * Cover that looks like a desktop browser preview of the template hero.
 * - Mac-style window chrome on top (dots + url bar)
 * - Viewport renders either a scaled desktop iframe (when previewRoute is set)
 *   or the static cover image cropped to the top (hero area).
 */
export function TemplateCover({ src, name, previewRoute, className }: Props) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#0f1115] ${className ?? ""}`}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-3 h-7 bg-muted/60 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 h-4 rounded bg-paper/80 border border-border/60" />
      </div>

      {/* Viewport: desktop hero preview */}
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        {previewRoute ? (
          <div
            className="absolute top-0 left-0 origin-top-left pointer-events-none"
            style={{
              width: "1280px",
              height: "720px",
              transform: "scale(var(--cover-scale))",
              // scale so 1280 desktop width fits the card width
              ["--cover-scale" as any]: "calc(100cqw / 1280)",
              containerType: "inline-size",
            } as React.CSSProperties}
          >
            <iframe
              src={previewRoute}
              title={`Pré-visualização ${name}`}
              className="w-[1280px] h-[720px] block bg-paper border-0"
              loading="lazy"
              scrolling="no"
            />
          </div>
        ) : (
          <img
            src={src}
            alt={`Pré-visualização do modelo ${name}`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        )}
      </div>
    </div>
  );
}
