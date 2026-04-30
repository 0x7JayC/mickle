import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const STACK = [
  { kicker: "Onboarding", name: "Privy" },
  { kicker: "State", name: "Supabase" },
  { kicker: "Swap", name: "Jupiter" },
  { kicker: "Asset", name: "Backed SPYx" },
  { kicker: "Proof", name: "Metaplex Core" },
  { kicker: "Float yield", name: "Kamino" },
];

// 1:10 – 1:25 — The stack. Six tiles, even rhythm.
export function Stack({ duration }: { duration: number }) {
  return (
    <Sequence durationInFrames={duration} name="Stack">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={duration - 18}>
            <Kicker>The build</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={duration - 18}>
            <Display size={92}>Five days, end to end.</Display>
          </FadeUp>
          <div style={{ height: 72 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {STACK.map((s, i) => (
              <FadeUp key={i} delay={36 + i * 12} exit={duration - 18}>
                <div
                  style={{
                    background: "#fff",
                    border: `1px solid ${COLORS.hairline}`,
                    borderRadius: 24,
                    padding: 32,
                    minHeight: 140,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 14,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: COLORS.inkMuted,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    {s.kicker}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 38,
                      fontWeight: 700,
                      color: COLORS.ink,
                      letterSpacing: -1,
                    }}
                  >
                    {s.name}
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
