import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { HERO_THEME as T, HERO_CAPTIONS, HERO_SCENES, HERO_FPS } from "./theme.hero";
import { CaptionBar } from "./components/CaptionBar";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { HeroScenes } from "./ScenesHero";

loadArchivo("normal", { weights: ["700", "900"] });
loadInter("normal", { weights: ["400", "500", "600", "700", "800"] });

export const HeroVideo = () => {
  const frame = useCurrentFrame();
  const currentSecond = frame / HERO_FPS;
  const activeCaption = HERO_CAPTIONS.find((c) => currentSecond >= c.from && currentSecond <= c.to);

  return (
    <AbsoluteFill style={{ backgroundColor: T.paper, overflow: "hidden" }}>
      <Audio src={staticFile("audio/hero.wav")} />
      <BackgroundLayer />
      <AbsoluteFill>
        {HERO_SCENES.map((s) => {
          const Comp = HeroScenes[s.id as keyof typeof HeroScenes];
          if (!Comp) return null;
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.duration}>
              <SceneStage>
                <Comp />
              </SceneStage>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      {/* Minimal brand mark (no plan label) */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: 48, left: 56, display: "flex", alignItems: "center", gap: 12,
          fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 28, color: T.ink, letterSpacing: -0.5,
        }}>
          <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 4, background: T.azure, boxShadow: `3px 3px 0 ${T.ink}` }} />
          FILRO
        </div>
        <div style={{
          position: "absolute", top: 48, right: 56, fontFamily: "Inter, sans-serif", fontWeight: 700,
          fontSize: 16, color: T.ink, background: T.lime, padding: "10px 18px", borderRadius: 999,
          border: `3px solid ${T.ink}`, boxShadow: `4px 4px 0 ${T.ink}`, letterSpacing: 2,
        }}>
          PRESENÇA DIGITAL · 24H
        </div>
      </AbsoluteFill>
      <CaptionBar text={activeCaption?.text ?? ""} />
    </AbsoluteFill>
  );
};

const SceneStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      padding: "130px 140px 260px 140px",
      opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
    }}>
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};
