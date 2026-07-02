// Slide 7 — Stack (dark, 20s)
// Six tiles — updated with Jupiter Ultra + pbUSDC→SPYx
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const TILES = [
  { kicker: "Auth + wallet", name: "Privy + CDP" },
  { kicker: "State + ledger", name: "Supabase" },
  { kicker: "Daily swap", name: "Jupiter Ultra" },
  { kicker: "Target asset", name: "pbUSDC → SPYx" },
  { kicker: "Milestones", name: "Metaplex Core" },
  { kicker: "Infrastructure", name: "Vercel + Next.js" },
];

export function PdStack({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdStack">
      <Stage dark>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker color="rgba(255,255,255,0.45)">The build</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={92} color="#fff">
              Five days. End to end.
            </Display>
          </FadeUp>
          <div style={{ height: 64 }} />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}
          >
            {TILES.map((t, i) => (
              <FadeUp key={i} delay={36 + i * 12} exit={exit}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid rgba(255,255,255,0.10)`,
                    borderRadius: 28,
                    padding: 36,
                    minHeight: 160,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 13,
                      letterSpacing: "0.20em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.38)",
                      fontWeight: 500,
                      marginBottom: 14,
                    }}
                  >
                    {t.kicker}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 40,
                      fontWeight: 700,
                      letterSpacing: -1,
                      color: COLORS.accent,
                    }}
                  >
                    {t.name}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-stack.mp3")} />
    </Sequence>
  );
}
