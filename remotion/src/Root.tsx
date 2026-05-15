import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { EssencialVideo } from "./EssencialVideo";
import { TOTAL_FRAMES, FPS } from "./theme";
import { ESSENCIAL_TOTAL_FRAMES, ESSENCIAL_FPS } from "./theme.essencial";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="main"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="essencial"
        component={EssencialVideo}
        durationInFrames={ESSENCIAL_TOTAL_FRAMES}
        fps={ESSENCIAL_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
