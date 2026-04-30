import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS } from "../brand";

// 0:00 – 0:05 — Dark ink stage. Scottish proverb opens cold.
export function Hook({ duration }: { duration: number }) {
  return (
    <Sequence durationInFrames={duration} name="Hook">
      <Stage dark>
        <div style={{ width: "100%", maxWidth: 1500, margin: "0 auto" }}>
          <FadeUp delay={6} exit={duration - 18}>
            <Kicker color="rgba(255,255,255,0.55)">An old Scottish proverb</Kicker>
          </FadeUp>
          <div style={{ height: 32 }} />
          <FadeUp delay={18} exit={duration - 18}>
            <Display size={140} color="#fff">
              Many a mickle
              <br />
              makes a muckle.
            </Display>
          </FadeUp>
          <div style={{ height: 36 }} />
          <FadeUp delay={42} exit={duration - 18}>
            <Lead size={32} color="rgba(255,255,255,0.65)" maxWidth={1100}>
              Lots of small things, quietly compounding, become a big thing.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
      {/* Coral accent line, the only colour on this scene */}
      <FadeUp delay={36}>
        <div
          style={{
            position: "absolute",
            bottom: 96,
            left: 96,
            width: 96,
            height: 4,
            borderRadius: 2,
            background: COLORS.accent,
          }}
        />
      </FadeUp>
    </Sequence>
  );
}
