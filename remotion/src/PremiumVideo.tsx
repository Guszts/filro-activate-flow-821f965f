import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { THEME } from "./theme";
import { PREMIUM_CAPTIONS, PREMIUM_SCENES, PREMIUM_FPS } from "./theme.premium";
import { CaptionBar } from "./components/CaptionBar";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { PremiumScenes } from "./ScenesPremium";
import { PlanLabelContext } from "./PlanLabelContext";

loadArchivo("normal", { weights: ["700", "900"] });
loadInter("normal", { weights: ["400", "500", "600", "700", "800"] });

export const PremiumVideo = () => {
  const frame = useCurrentFrame();
  const currentSecond = frame / PREMIUM_FPS;
  const activeCaption = PREMIUM_CAPTIONS.find((c) => currentSecond >= c.from && currentSecond <= c.to);

  return (
    <PlanLabelContext.Provider value="PREMIUM">
      <AbsoluteFill style={{ backgroundColor: THEME.paper, overflow: "hidden" }}>
        <Audio src={staticFile("audio/premium.wav")} />
        <BackgroundLayer />
        <AbsoluteFill>
          {PREMIUM_SCENES.map((s) => {
            const Comp = PremiumScenes[s.id as keyof typeof PremiumScenes];
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
        <CaptionBar text={activeCaption?.text ?? ""} />
      </AbsoluteFill>
    </PlanLabelContext.Provider>
  );
};

const SceneStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        padding: "110px 140px 240px 140px",
        opacity: interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};
