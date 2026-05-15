import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { EssencialVideo } from "./EssencialVideo";
import { ProfissionalVideo } from "./ProfissionalVideo";
import { TOTAL_FRAMES, FPS } from "./theme";
import { ESSENCIAL_TOTAL_FRAMES, ESSENCIAL_FPS } from "./theme.essencial";
import { PROFISSIONAL_TOTAL_FRAMES, PROFISSIONAL_FPS } from "./theme.profissional";

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="main" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="essencial" component={EssencialVideo} durationInFrames={ESSENCIAL_TOTAL_FRAMES} fps={ESSENCIAL_FPS} width={1920} height={1080} />
      <Composition id="profissional" component={ProfissionalVideo} durationInFrames={PROFISSIONAL_TOTAL_FRAMES} fps={PROFISSIONAL_FPS} width={1920} height={1080} />
    </>
  );
};
