import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { Gem } from "../components/Gem";
import { COLORS, FONTS } from "../brand";

// 1:25 – 1:30 (or 0:25-0:30 in the Twitter cut) — Closing card.
export function CTA({ duration }: { duration: number }) {
  return (
    <Sequence durationInFrames={duration} name="CTA">
      <Stage align="center">
        <div style={{ width: "100%", maxWidth: 1500, margin: "0 auto", textAlign: "center" }}>
          <FadeUp delay={2}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
              <Gem size={96} />
            </div>
          </FadeUp>
          <FadeUp delay={14}>
            <Display size={104} align="center">
              Every great mickle
              <br />
              began with the smallest
              <br />
              possible thing,
              <br />
              done one more time.
            </Display>
          </FadeUp>
          <div style={{ height: 56 }} />
          <FadeUp delay={42}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: COLORS.accent,
              }}
            >
              mickle-gamma.vercel.app
            </div>
          </FadeUp>
          <div style={{ height: 16 }} />
          <FadeUp delay={54}>
            <Lead size={20} color={COLORS.inkSubtle} align="center">
              Colosseum · Consumer track
            </Lead>
          </FadeUp>
        </div>
      </Stage>
    </Sequence>
  );
}
