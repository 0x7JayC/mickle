// Slide 4 — Solution (cream, 25s)
// One tap · One pound · Every day you show up
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { PdCard } from "../components/PdCard";
import { COLORS } from "../brand";

const STEPS = [
  {
    kicker: "01 · Start",
    headline: "Sign in with email",
    body: "Privy provisions a Solana wallet in 5 seconds. No seed phrase. No app download. Apple · Google · external wallets too.",
  },
  {
    kicker: "02 · Daily ritual",
    headline: "Tap once for £1",
    body: "One tap debits your balance. The treasury batches the cohort daily via Jupiter Ultra — USDC → SPYx. Atomic. Idempotent. 24/7.",
  },
  {
    kicker: "03 · Watch it grow",
    headline: "Streak · Time Machine · NFT",
    body: "Day 7 / 30 / 100 streaks earn soulbound NFTs. Time Machine projects your contribution forward 1–10 years. The opposite of degen.",
  },
];

export function PdSolution({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdSolution">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker>The solution</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={92}>
              One tap. One pound.
              <br />
              Every day you show up.
            </Display>
          </FadeUp>
          <div style={{ height: 56 }} />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}
          >
            {STEPS.map((s, i) => (
              <FadeUp key={i} delay={42 + i * 18} exit={exit}>
                <PdCard kicker={s.kicker} headline={s.headline} body={s.body} />
              </FadeUp>
            ))}
          </div>
          <div style={{ height: 28 }} />
          <FadeUp delay={42 + STEPS.length * 18 + 10} exit={exit}>
            <Lead size={24} color={COLORS.inkMuted} maxWidth={1100}>
              Email login. No seed phrase. No app store. Designed for non-crypto humans. Built on Solana.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-solution.mp3")} />
    </Sequence>
  );
}
