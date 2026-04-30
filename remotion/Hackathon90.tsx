import { Series, Sequence } from "remotion";
import { FPS } from "./brand";
import { Hook } from "./scenes/Hook";
import { BarTest } from "./scenes/BarTest";
import { Problem } from "./scenes/Problem";
import { Demo } from "./scenes/Demo";
import { WhyOnChain } from "./scenes/WhyOnChain";
import { Stack } from "./scenes/Stack";
import { CTA } from "./scenes/CTA";

// Scene budget (90s total = 2700 frames @ 30fps)
//   Hook         5s   150 fr
//   BarTest     10s   300 fr
//   Problem     15s   450 fr
//   Demo        25s   750 fr
//   WhyOnChain  15s   450 fr
//   Stack       15s   450 fr
//   CTA          5s   150 fr
const sec = (n: number) => n * FPS;

export function Hackathon90() {
  return (
    <Series>
      <Series.Sequence durationInFrames={sec(5)}>
        <Hook duration={sec(5)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(10)}>
        <BarTest duration={sec(10)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(15)}>
        <Problem duration={sec(15)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(25)}>
        <Demo duration={sec(25)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(15)}>
        <WhyOnChain duration={sec(15)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(15)}>
        <Stack duration={sec(15)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(5)}>
        <CTA duration={sec(5)} />
      </Series.Sequence>
    </Series>
  );
}

// Silence the unused-import lint when Sequence is only used by scenes
void Sequence;
