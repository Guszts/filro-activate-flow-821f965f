import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { THEME } from "./theme";
import { PROFISSIONAL_CAPTIONS, PROFISSIONAL_SCENES, PROFISSIONAL_FPS } from "./theme.profissional";
import { CaptionBar } from "./components/CaptionBar";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { Scenes } from "./Scenes";
import { PlanLabelContext } from "./PlanLabelContext";

loadArchivo("normal", { weights: ["700", "900"] });
loadInter("normal", { weights: ["400", "500", "600", "700"] });

export const ProfissionalVideo = () => {
  const frame = useCurrentFrame();
  const currentSecond = frame / PROFISSIONAL_FPS;
  const activeCaption = PROFISSIONAL_CAPTIONS.find((c) => currentSecond >= c.from && currentSecond <= c.to);

  return (
    <PlanLabelContext.Provider value="PROFISSIONAL">
      <AbsoluteFill style={{ backgroundColor: THEME.paper, overflow: "hidden" }}>
        <Audio src={staticFile("audio/profissional.wav")} />
        <BackgroundLayer />
        <AbsoluteFill>
          {PROFISSIONAL_SCENES.map((s, i) => {
            const Comp = Scenes[s.id as keyof typeof Scenes];
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
        {/* No BrandFrame — clean, no watermark */}
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
