import { Series } from "remotion";
import { FPS } from "./brand";
import { Hook } from "./scenes/Hook";
import { BarTest } from "./scenes/BarTest";
import { Demo } from "./scenes/Demo";
import { CTA } from "./scenes/CTA";

// 30s tight cut: hook → bar test → demo flash → CTA. Skips Problem,
// WhyOnChain, Stack — Twitter audience is post-context, they want
// the punchline.
const sec = (n: number) => n * FPS;

export function Twitter30() {
  return (
    <Series>
      <Series.Sequence durationInFrames={sec(4)}>
        <Hook duration={sec(4)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(7)}>
        <BarTest duration={sec(7)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(15)}>
        <Demo duration={sec(15)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(4)}>
        <CTA duration={sec(4)} />
      </Series.Sequence>
    </Series>
  );
}
