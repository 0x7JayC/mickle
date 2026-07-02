// Slide 6 — Why On-Chain (cream, 22s)
// Web2 cannot ship this — side-by-side comparison
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const BAD = [
  "Country lock-outs — 60+ markets blocked",
  "Spread eats a £1 deposit before it invests",
  "Market hours only — ritual breaks on weekends",
  "Streak = vendor-locked badge, not portable",
  "Account minimums, KYC walls, app store required",
];

const GOOD = [
  "Permissionless — email is enough, 60+ countries",
  "Stablecoin in, fractional SPYx out, 0.99% flat fee",
  "24/7 ritual, 24/7 settlement, every single day",
  "Streak = soulbound NFT, composable anywhere",
  "No app store · no minimums · no token speculation",
];

export function PdWhyOnChain({ duration }: { duration: number }) {
  const exit = duration - 18;
  const badRed = "rgba(239,68,68,0.75)";
  return (
    <Sequence durationInFrames={duration} name="PdWhyOnChain">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker>Why on-chain</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={88}>
              Web2 cannot ship this.
              <br />
              We tried.
            </Display>
          </FadeUp>
          <div style={{ height: 48 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Bad column */}
            <FadeUp delay={38} exit={exit}>
              <div
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.22)",
                  borderRadius: 28,
                  padding: 36,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: badRed,
                    fontWeight: 500,
                    marginBottom: 28,
                  }}
                >
                  Robinhood · eToro · ISAs
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {BAD.map((line, i) => (
                    <FadeUp key={i} delay={52 + i * 14} exit={exit}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "14px 0",
                          borderBottom: i < BAD.length - 1 ? `1px solid rgba(0,0,0,0.07)` : "none",
                          fontFamily: FONTS.body,
                          fontSize: 24,
                          lineHeight: 1.35,
                          color: COLORS.inkMuted,
                        }}
                      >
                        <span style={{ color: badRed, fontWeight: 700, fontSize: 22, lineHeight: 1.35, flexShrink: 0 }}>✕</span>
                        {line}
                      </div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </FadeUp>
            {/* Good column */}
            <FadeUp delay={44} exit={exit}>
              <div
                style={{
                  background: "rgba(16,185,129,0.07)",
                  border: "1px solid rgba(16,185,129,0.24)",
                  borderRadius: 28,
                  padding: 36,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: COLORS.emerald,
                    fontWeight: 500,
                    marginBottom: 28,
                  }}
                >
                  Mickle on Solana
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {GOOD.map((line, i) => (
                    <FadeUp key={i} delay={58 + i * 14} exit={exit}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "14px 0",
                          borderBottom: i < GOOD.length - 1 ? `1px solid rgba(0,0,0,0.07)` : "none",
                          fontFamily: FONTS.body,
                          fontSize: 24,
                          lineHeight: 1.35,
                          color: COLORS.inkMuted,
                        }}
                      >
                        <span style={{ color: COLORS.emerald, fontWeight: 700, fontSize: 22, lineHeight: 1.35, flexShrink: 0 }}>✓</span>
                        {line}
                      </div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-why-on-chain.mp3")} />
    </Sequence>
  );
}
