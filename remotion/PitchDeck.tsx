// PitchDeck — 3-minute Colosseum submission video
// 8 slides matching pitch-deck-20260511-120000.html, PAS narrative arc.
//
// Scene budget (180s = 5400 frames @ 30fps):
//   PdTitle        12s   360 fr  — proverb opener
//   PdProblem      25s   750 fr  — lived moment + 3 strikes
//   PdWhyNow       22s   660 fr  — 3 rails
//   PdSolution     25s   750 fr  — 3 steps
//   PdDemo         30s   900 fr  — live vs next
//   PdWhyOnChain   22s   660 fr  — head-to-head
//   PdStack        20s   600 fr  — 6 tiles
//   PdAsk          24s   720 fr  — close
import { Series } from "remotion";
import { FPS } from "./brand";
import { PdTitle }      from "./scenes/PdTitle";
import { PdProblem }   from "./scenes/PdProblem";
import { PdWhyNow }    from "./scenes/PdWhyNow";
import { PdSolution }  from "./scenes/PdSolution";
import { PdDemo }      from "./scenes/PdDemo";
import { PdWhyOnChain } from "./scenes/PdWhyOnChain";
import { PdStack }     from "./scenes/PdStack";
import { PdAsk }       from "./scenes/PdAsk";

const sec = (n: number) => n * FPS;

export function PitchDeck() {
  return (
    <Series>
      <Series.Sequence durationInFrames={sec(12)}>
        <PdTitle duration={sec(12)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(25)}>
        <PdProblem duration={sec(25)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(22)}>
        <PdWhyNow duration={sec(22)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(25)}>
        <PdSolution duration={sec(25)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(30)}>
        <PdDemo duration={sec(30)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(22)}>
        <PdWhyOnChain duration={sec(22)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(20)}>
        <PdStack duration={sec(20)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sec(24)}>
        <PdAsk duration={sec(24)} />
      </Series.Sequence>
    </Series>
  );
}
