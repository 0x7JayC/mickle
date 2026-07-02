// Slide 2 — Problem (cream, 25s)
// Lived moment · 3 strikethroughs · closing statement
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const STRIKES = [
  "Robinhood — not available in their country.",
  "eToro — the spread eats the pound.",
  "UK ISAs — a tax wrapper, not a product.",
];

export function PdProblem({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdProblem">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1600, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker>The problem</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={94}>
              I tried to set up £1 a day
              <br />
              for someone in my family.
            </Display>
          </FadeUp>
          <div style={{ height: 52 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {STRIKES.map((line, i) => (
              <FadeUp key={i} delay={52 + i * 26} exit={exit}>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 38,
                    fontWeight: 500,
                    color: COLORS.ink,
                    textDecoration: "line-through",
                    textDecorationColor: COLORS.accent,
                    textDecorationThickness: 5,
                    letterSpacing: -0.5,
                  }}
                >
                  {line}
                </div>
              </FadeUp>
            ))}
          </div>
          <div style={{ height: 52 }} />
          <FadeUp delay={52 + STRIKES.length * 26 + 16} exit={exit}>
            <Lead size={30} color={COLORS.inkMuted} maxWidth={1400}>
              The most boring trade in finance is locked away from billions of people.
              The rails existed on Solana. Nobody had built it.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-problem.mp3")} />
    </Sequence>
  );
}
