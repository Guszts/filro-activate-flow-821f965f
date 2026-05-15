import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { THEME, TOTAL_FRAMES, CAPTIONS, SCENES, FPS } from "./theme";
import { CaptionBar } from "./components/CaptionBar";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { BrandFrame } from "./components/BrandFrame";
import { Scenes } from "./Scenes";

loadArchivo("normal", { weights: ["700", "900"] });
loadInter("normal", { weights: ["400", "500", "600", "700"] });

export const MainVideo = () => {
  const frame = useCurrentFrame();
  const currentSecond = frame / FPS;
  const activeCaption = CAPTIONS.find((c) => currentSecond >= c.from && currentSecond <= c.to);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.paper, overflow: "hidden" }}>
      <Audio src={staticFile("audio/start.wav")} />
      <BackgroundLayer />
      <AbsoluteFill>
        {SCENES.map((s) => {
          const Comp = Scenes[s.id as keyof typeof Scenes];
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

const SceneStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        padding: "130px 140px 260px 140px",
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};
