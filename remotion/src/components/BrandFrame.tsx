import { AbsoluteFill } from "remotion";
import { THEME } from "../theme";

// Top-left brand mark and top-right page indicator — small, always visible, never overlaps scenes.
export const BrandFrame: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "Archivo, sans-serif",
          fontWeight: 900,
          fontSize: 28,
          color: THEME.ink,
          letterSpacing: -0.5,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            borderRadius: 4,
            background: THEME.azure,
            boxShadow: `3px 3px 0 ${THEME.ink}`,
          }}
        />
        FILRO
      </div>
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 56,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 18,
          color: THEME.ink,
          background: THEME.lime,
          padding: "10px 18px",
          borderRadius: 999,
          border: `3px solid ${THEME.ink}`,
          boxShadow: `4px 4px 0 ${THEME.ink}`,
        }}
      >
        PLANO · START
      </div>
    </AbsoluteFill>
  );
};
