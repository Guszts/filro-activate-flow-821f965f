import { Composition, staticFile, AbsoluteFill, Audio } from "remotion";
import { MainVideo } from "./MainVideo";
import { THEME, TOTAL_FRAMES, FPS } from "./theme";

export const RemotionRoot = () => {
  return (
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
