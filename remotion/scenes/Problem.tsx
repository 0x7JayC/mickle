import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const STRIKES = [
  "Robinhood — not in your country.",
  "eToro — the spread eats the dollar.",
  "UK ISAs — a tax wrapper, not a product.",
];

// 0:15 – 0:30 — The lived problem. Strikethroughs land in sequence.
export function Problem({ duration }: { duration: number }) {
  return (
    <Sequence durationInFrames={duration} name="Problem">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1500, margin: "0 auto" }}>
          <FadeUp delay={4} exit={duration - 18}>
            <Kicker>The lived moment</Kicker>
          </FadeUp>
          <div style={{ height: 28 }} />
          <FadeUp delay={14} exit={duration - 18}>
            <Display size={92}>
              I tried to set up £1 a day
              <br />
              for someone in my family.
            </Display>
          </FadeUp>
          <div style={{ height: 56 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {STRIKES.map((line, i) => (
              <FadeUp key={i} delay={56 + i * 24} exit={duration - 18}>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 36,
                    fontWeight: 500,
                    color: COLORS.ink,
                    textDecoration: "line-through",
                    textDecorationColor: COLORS.accent,
                    textDecorationThickness: 4,
                  }}
                >
                  {line}
                </div>
              </FadeUp>
            ))}
          </div>
          <div style={{ height: 56 }} />
          <FadeUp delay={56 + STRIKES.length * 24 + 12} exit={duration - 18}>
            <Lead size={28} color={COLORS.inkMuted} maxWidth={1200}>
              The most boring trade in finance is locked away from billions of people.
              The rails exist on Solana. Nobody had built it.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
    </Sequence>
  );
}
