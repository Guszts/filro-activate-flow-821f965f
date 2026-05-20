import React from "react";

type Props = {
  src: string;
  name: string;
  previewRoute?: string;
  className?: string;
};

/**
 * Cover that renders the template hero fullbleed inside the card.
 * - No browser chrome
 * - Scales a 1280x720 iframe of the live preview to fit the card width
 * - Falls back to the static cover image when no preview route exists
 */
export function TemplateCover({ src, name, previewRoute, className }: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-paper ${className ?? ""}`}
      style={{ aspectRatio: "16 / 9", containerType: "inline-size" } as React.CSSProperties}
    >
      {previewRoute ? (
        <div
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{
            width: "1280px",
            height: "720px",
            transform: "scale(calc(100cqw / 1280))",
          }}
        >
          <iframe
            src={`${previewRoute}${previewRoute.includes("?") ? "&" : "?"}cover=1`}
            title={`Pré-visualização ${name}`}
            className="w-[1280px] h-[720px] block bg-paper border-0"
            loading="lazy"
            scrolling="no"
            tabIndex={-1}
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
  );
}
