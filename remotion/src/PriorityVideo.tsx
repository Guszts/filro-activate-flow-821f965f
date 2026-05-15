import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { THEME } from "./theme";
import { PRIORITY_CAPTIONS, PRIORITY_SCENES, PRIORITY_FPS } from "./theme.priority";
import { CaptionBar } from "./components/CaptionBar";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { Scenes } from "./Scenes";
import { PlanLabelContext } from "./PlanLabelContext";

loadArchivo("normal", { weights: ["700", "900"] });
loadInter("normal", { weights: ["400", "500", "600", "700"] });

// Map priority's narrative beats onto the shared scene library so the visual
// language matches the other plans exactly.
const SCENE_ALIAS: Record<string, keyof typeof Scenes> = {
  hook: "hook",
  promise: "promise",
  structure: "page",
  beyond: "trust",
  differentials: "fields",
  sections: "adapt",
  clarity: "trust",
  responsive: "mobile",
  payFlow: "flow",
  customize: "fields",
  focus: "forWho",
  weHandle: "noTech",
  payOnce: "oneTime",
  ideal: "summary",
  cta: "cta",
};

export const PriorityVideo = () => {
  const frame = useCurrentFrame();
  const currentSecond = frame / PRIORITY_FPS;
  const activeCaption = PRIORITY_CAPTIONS.find((c) => currentSecond >= c.from && currentSecond <= c.to);

  return (
    <PlanLabelContext.Provider value="PRIORITY">
      <AbsoluteFill style={{ backgroundColor: THEME.paper, overflow: "hidden" }}>
        <Audio src={staticFile("audio/priority.wav")} />
        <BackgroundLayer />
        <AbsoluteFill>
          {PRIORITY_SCENES.map((s, i) => {
            const key = SCENE_ALIAS[s.id] ?? "promise";
            const Comp = Scenes[key];
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
