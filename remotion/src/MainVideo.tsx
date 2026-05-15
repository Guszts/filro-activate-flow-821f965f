import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { THEME, TOTAL_FRAMES, CAPTIONS, SCENES, FPS } from "./theme";
import { CaptionBar } from "./components/CaptionBar";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { BrandFrame } from "./components/BrandFrame";

import { SceneHook } from "./scenes/SceneHook";
import { ScenePromise } from "./scenes/ScenePromise";
import { ScenePage } from "./scenes/ScenePage";
import { SceneFields } from "./scenes/SceneFields";
import { SceneMobile } from "./scenes/SceneMobile";
import { SceneTrust } from "./scenes/SceneTrust";
import { SceneFlow } from "./scenes/SceneFlow";
import { SceneAdapt } from "./scenes/SceneAdapt";
import { SceneOneTime } from "./scenes/SceneOneTime";
import { SceneMonthly } from "./scenes/SceneMonthly";
import { SceneNoTech } from "./scenes/SceneNoTech";
import { SceneForWho } from "./scenes/SceneForWho";
import { SceneSummary } from "./scenes/SceneSummary";
import { SceneCta } from "./scenes/SceneCta";

loadArchivo("normal", { weights: ["700", "900"] });
loadInter("normal", { weights: ["400", "500", "600", "700"] });

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: SceneHook,
  promise: ScenePromise,
  page: ScenePage,
  fields: SceneFields,
  mobile: SceneMobile,
  trust: SceneTrust,
  flow: SceneFlow,
  adapt: SceneAdapt,
  oneTime: SceneOneTime,
  monthly: SceneMonthly,
  noTech: SceneNoTech,
  forWho: SceneForWho,
  summary: SceneSummary,
  cta: SceneCta,
};

export const MainVideo = () => {
  const frame = useCurrentFrame();
  const currentSecond = frame / FPS;
  const activeCaption = CAPTIONS.find((c) => currentSecond >= c.from && currentSecond <= c.to);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.paper, overflow: "hidden" }}>
      <Audio src={staticFile("audio/start.wav")} />
      <BackgroundLayer />

      {/* Scene stage — keeps every scene within a fixed safe area, leaving room for caption bar */}
      <AbsoluteFill>
        {SCENES.map((s) => {
          const Comp = SCENE_COMPONENTS[s.id];
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

      <BrandFrame />
      <CaptionBar text={activeCaption?.text ?? ""} />
    </AbsoluteFill>
  );
};

// Stage = bounded box where ALL scene content must live.
// 1920x1080 canvas; reserve bottom 180px for caption + 60px margin from brand frame.
const SceneStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  // Gentle scene-level fade-in/out so transitions never overlap content.
  return (
    <AbsoluteFill
      style={{
        padding: "120px 140px 260px 140px",
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>{children}</div>
    </AbsoluteFill>
  );
};
