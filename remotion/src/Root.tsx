import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { EssencialVideo } from "./EssencialVideo";
import { ProfissionalVideo } from "./ProfissionalVideo";
import { PriorityVideo } from "./PriorityVideo";
import { PremiumVideo } from "./PremiumVideo";
import { TOTAL_FRAMES, FPS } from "./theme";
import { ESSENCIAL_TOTAL_FRAMES, ESSENCIAL_FPS } from "./theme.essencial";
import { PROFISSIONAL_TOTAL_FRAMES, PROFISSIONAL_FPS } from "./theme.profissional";
import { PRIORITY_TOTAL_FRAMES, PRIORITY_FPS } from "./theme.priority";
import { PREMIUM_TOTAL_FRAMES, PREMIUM_FPS } from "./theme.premium";

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="main" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="essencial" component={EssencialVideo} durationInFrames={ESSENCIAL_TOTAL_FRAMES} fps={ESSENCIAL_FPS} width={1920} height={1080} />
      <Composition id="profissional" component={ProfissionalVideo} durationInFrames={PROFISSIONAL_TOTAL_FRAMES} fps={PROFISSIONAL_FPS} width={1920} height={1080} />
      <Composition id="priority" component={PriorityVideo} durationInFrames={PRIORITY_TOTAL_FRAMES} fps={PRIORITY_FPS} width={1920} height={1080} />
      <Composition id="premium" component={PremiumVideo} durationInFrames={PREMIUM_TOTAL_FRAMES} fps={PREMIUM_FPS} width={1920} height={1080} />
    </>
  );
};
