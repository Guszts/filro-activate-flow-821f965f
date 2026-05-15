import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJet } from "@remotion/google-fonts/JetBrainsMono";
import { PRIORITY_CAPTIONS, PRIORITY_SCENES, PRIORITY_FPS, PRIORITY_THEME as T } from "./theme.priority";
import { ScenesPriority } from "./ScenesPriority";

loadCormorant("normal", { weights: ["400", "500"] });
loadCormorant("italic", { weights: ["400", "500"] });
loadInter("normal", { weights: ["400", "500", "600", "700"] });
loadJet("normal", { weights: ["400", "500"] });

// --- background: vignette + slow drifting gold haze + faint grid ---
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 220) * 30;
  const drift2 = Math.cos(frame / 280) * 40;
  return (
    <AbsoluteFill style={{ background: T.noir, overflow: "hidden" }}>
      {/* soft gold glow top-left */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          left: -300 + drift,
          top: -400 - drift,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${T.gold}22 0%, ${T.gold}00 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* deep rose glow bottom-right */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          right: -350 + drift2,
          bottom: -350 - drift2,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${T.rose}18 0%, ${T.rose}00 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* faint grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${T.hairline}40 1px, transparent 1px), linear-gradient(90deg, ${T.hairline}40 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.18,
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 50%, ${T.noir} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// --- elegant frame with PRIORITY marks (no Filro watermark) ---
const Frame: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* corner hairlines */}
      {[
        { top: 60, left: 60 },
        { top: 60, right: 60 },
        { bottom: 60, left: 60 },
        { bottom: 60, right: 60 },
      ].map((pos, i) => (
        <div key={i} style={{ position: "absolute", width: 28, height: 28, ...pos }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 28, height: 1, background: T.gold, opacity: 0.7 }} />
          <div style={{ position: "absolute", top: 0, left: 0, height: 28, width: 1, background: T.gold, opacity: 0.7 }} />
        </div>
      ))}
      {/* top label */}
      <div style={{ position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 30, height: 1, background: T.gold, opacity: 0.6 }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 6, color: T.gold, textTransform: "uppercase" }}>
          PRIORITY · Plano
        </span>
        <span style={{ width: 30, height: 1, background: T.gold, opacity: 0.6 }} />
      </div>
    </AbsoluteFill>
  );
};

// --- refined caption bar (no shadow, gold hairlines, serif italic accent) ---
const PriorityCaption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 22, stiffness: 180 }, durationInFrames: 18 });
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 96,
        display: "flex",
        justifyContent: "center",
        padding: "0 140px",
        pointerEvents: "none",
      }}
    >
      <div
        key={text}
        style={{
          maxWidth: 1500,
          background: `${T.noirSoft}E6`,
          color: T.ink,
          border: `1px solid ${T.gold}80`,
          borderRadius: 4,
          padding: "20px 36px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 28,
          lineHeight: 1.3,
          letterSpacing: 0.1,
          textAlign: "center",
          transform: `translateY(${interpolate(pop, [0, 1], [16, 0])}px)`,
          opacity: interpolate(pop, [0, 1], [0, 1]),
          backdropFilter: "blur(0px)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const SceneStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        padding: "140px 160px 260px 160px",
        opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};

export const PriorityVideo = () => {
  const frame = useCurrentFrame();
  const second = frame / PRIORITY_FPS;
  const active = PRIORITY_CAPTIONS.find((c) => second >= c.from && second <= c.to);

  return (
    <AbsoluteFill style={{ background: T.noir }}>
      <Audio src={staticFile("audio/priority.wav")} />
      <Backdrop />
      <Frame />
      <AbsoluteFill>
        {PRIORITY_SCENES.map((s, i) => {
          const Comp = ScenesPriority[s.id as keyof typeof ScenesPriority];
          if (!Comp) return null;
          return (
            <Sequence key={`${s.id}-${i}`} from={s.from} durationInFrames={s.duration}>
              <SceneStage>
                <Comp />
              </SceneStage>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <PriorityCaption text={active?.text ?? ""} />
    </AbsoluteFill>
  );
};
