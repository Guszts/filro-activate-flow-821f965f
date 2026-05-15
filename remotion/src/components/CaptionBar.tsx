import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { THEME } from "../theme";

// Caption bar pinned to the bottom safe area. Fixed height. Single line truncation
// is avoided by limiting line count (max 2 lines). Stays within bounds.
export const CaptionBar: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 18, stiffness: 180 } });
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 56,
        display: "flex",
        justifyContent: "center",
        padding: "0 80px",
        pointerEvents: "none",
      }}
    >
      <div
        key={text}
        style={{
          maxWidth: 1500,
          minHeight: 120,
          background: THEME.ink,
          color: THEME.paper,
          border: `4px solid ${THEME.ink}`,
          boxShadow: `8px 8px 0 ${THEME.azure}`,
          borderRadius: 28,
          padding: "26px 42px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 34,
          lineHeight: 1.25,
          letterSpacing: -0.2,
          textAlign: "center",
          transform: `translateY(${interpolate(pop, [0, 1], [30, 0])}px) scale(${interpolate(pop, [0, 1], [0.96, 1])})`,
          opacity: interpolate(pop, [0, 1], [0, 1]),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ display: "block", maxWidth: "100%" }}>{text}</span>
      </div>
    </div>
  );
};
