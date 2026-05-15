import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../theme";

export const BackgroundLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 20;
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.paper }}>
      {/* warm vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 800px at ${50 + drift / 4}% 30%, ${THEME.paperWarm} 0%, transparent 60%)`,
        }}
      />
      {/* grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${THEME.ink}10 1px, transparent 1px), linear-gradient(90deg, ${THEME.ink}10 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.35,
          transform: `translate(${drift}px, ${drift / 2}px)`,
        }}
      />
      {/* corner accent shapes — outside scene safe area */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: 40,
          background: THEME.azure,
          transform: `rotate(${12 + drift / 8}deg)`,
          boxShadow: `12px 12px 0 ${THEME.ink}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: 999,
          background: THEME.lime,
          boxShadow: `10px 10px 0 ${THEME.ink}`,
        }}
      />
    </AbsoluteFill>
  );
};
