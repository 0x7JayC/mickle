// Slide 8 — Ask (cream, 24s)
// Consumer track · 3 revenue legs · closing proverb
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { PdCard } from "../components/PdCard";
import { COLORS } from "../brand";

const CARDS = [
  {
    kicker: "Outcome",
    headline: "Win Consumer track",
    body: "Closest analog: Tap (Radar 2024). No one has shipped fractional equities for £1/day globally. The most underserved user in finance.",
  },
  {
    kicker: "Revenue · no token",
    headline: "3 legs, honest",
    body: "Leg 1: 0.99% deposit fee (live). Leg 2: Float yield via Kamino ~4.5% APY. Leg 3: £0.99/mo Streak Premium. Break-even Y1. Profitable Y2.",
  },
  {
    kicker: "Use of prize",
    headline: "Three doors",
    body: "Backed Finance SPYx whitelist · Privy upgrade past 1k MAW · Security audit before treasury custody at scale.",
  },
];

export function PdAsk({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdAsk">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker>The ask</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={88}>
              Consumer track.
              <br />
              The patience product Solana doesn't have.
            </Display>
          </FadeUp>
          <div style={{ height: 48 }} />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}
          >
            {CARDS.map((c, i) => (
              <FadeUp key={i} delay={38 + i * 18} exit={exit}>
                <PdCard kicker={c.kicker} headline={c.headline} body={c.body} />
              </FadeUp>
            ))}
          </div>
          <div style={{ height: 36 }} />
          <FadeUp delay={38 + CARDS.length * 18 + 12} exit={exit}>
            <Lead size={30} color={COLORS.inkMuted} maxWidth={1300}>
              Every great mickle began with the smallest possible thing, done one more time.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-ask.mp3")} />
    </Sequence>
  );
}
