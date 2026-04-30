import { Composition } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Hackathon90 } from "./Hackathon90";
import { Twitter30 } from "./Twitter30";
import { FPS } from "./brand";

loadGeist();
loadGeistMono();

export function Root() {
  return (
    <>
      <Composition
        id="Hackathon90"
        component={Hackathon90}
        durationInFrames={90 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Twitter30"
        component={Twitter30}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
}
