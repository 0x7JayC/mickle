import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const REASONS = [
  { hed: "Lagos.", sub: "60+ countries. Email is enough." },
  { hed: "24/7.", sub: "The ritual works any day. Equity markets don't." },
  { hed: "Soulbound.", sub: "Your streak is portable proof — composable, vendor-free." },
];

// 0:55 – 1:10 — Three reasons, equal weight. Strip out the chain → these break.
export function WhyOnChain({ duration }: { duration: number }) {
  return (
    <Sequence durationInFrames={duration} name="WhyOnChain">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={duration - 18}>
            <Kicker>Why on-chain</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={duration - 18}>
            <Display size={88}>Strip the chain. Three things break.</Display>
          </FadeUp>
          <div style={{ height: 80 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36 }}>
            {REASONS.map((r, i) => (
              <FadeUp key={i} delay={42 + i * 24} exit={duration - 18}>
                <div
                  style={{
                    background: COLORS.accentSoft,
                    border: `2px solid ${COLORS.accentBorder}`,
                    borderRadius: 24,
                    padding: 40,
                    minHeight: 280,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 14,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: COLORS.accent,
                      fontWeight: 700,
                      marginBottom: 18,
                    }}
                  >
                    0{i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 56,
                      fontWeight: 800,
                      letterSpacing: -1.5,
                      color: COLORS.ink,
                      marginBottom: 18,
                    }}
                  >
                    {r.hed}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 22,
                      color: COLORS.inkMuted,
                      lineHeight: 1.45,
                    }}
                  >
                    {r.sub}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </Stage>
    </Sequence>
  );
}
