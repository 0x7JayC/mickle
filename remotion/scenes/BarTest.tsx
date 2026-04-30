import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { Gem } from "../components/Gem";

// 0:05 – 0:15 — The bar test. £1 a day. S&P 500. On Solana.
export function BarTest({ duration }: { duration: number }) {
  return (
    <Sequence durationInFrames={duration} name="BarTest">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1500, margin: "0 auto" }}>
          <FadeUp delay={4} exit={duration - 18}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Gem size={72} />
              <Kicker>Mickle</Kicker>
            </div>
          </FadeUp>
          <div style={{ height: 56 }} />
          <FadeUp delay={18} exit={duration - 18}>
            <Display size={170}>
              £1 a day.
              <br />
              The S&amp;P 500.
              <br />
              On Solana.
            </Display>
          </FadeUp>
          <div style={{ height: 40 }} />
          <FadeUp delay={48} exit={duration - 18}>
            <Lead size={32} maxWidth={1100}>
              Email login. Tap once a day. Watch what consistency actually compounds into.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
    </Sequence>
  );
}
