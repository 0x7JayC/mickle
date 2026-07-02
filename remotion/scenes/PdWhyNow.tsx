// Slide 3 — Why Now (dark, 22s)
// Three rails: SPYx on Solana · Privy wallets · USDC global
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { PdCard } from "../components/PdCard";

const RAILS = [
  {
    kicker: "01 · Asset",
    headline: "Tokenized stocks went live",
    body: "Backed Finance's SPYx — tokenized SPDR S&P 500 — trades 24/7 on Solana under EU prospectus. The index became a programmable token.",
  },
  {
    kicker: "02 · Onboarding",
    headline: "Email → wallet, 5 seconds",
    body: "Privy ships embedded Solana wallets keyed to email. No seed phrase. No app store. Works on any phone, globally, any country.",
  },
  {
    kicker: "03 · Money",
    headline: "USDC matured globally",
    body: "Stablecoins are regulated, liquid, and free to move. A pound from Lagos to Solana costs nothing and settles in seconds.",
  },
];

export function PdWhyNow({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdWhyNow">
      <Stage dark>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker color="rgba(255,255,255,0.45)">Why now</Kicker>
          </FadeUp>
          <div style={{ height: 24 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={92} color="#fff">
              Three rails matured
              <br />
              in the last 12 months.
            </Display>
          </FadeUp>
          <div style={{ height: 56 }} />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}
          >
            {RAILS.map((r, i) => (
              <FadeUp key={i} delay={42 + i * 18} exit={exit}>
                <PdCard
                  kicker={r.kicker}
                  headline={r.headline}
                  body={r.body}
                  dark
                  accentHeadline
                />
              </FadeUp>
            ))}
          </div>
          <div style={{ height: 32 }} />
          <FadeUp delay={42 + RAILS.length * 18 + 10} exit={exit}>
            <Lead size={24} color="rgba(255,255,255,0.35)" maxWidth={1000}>
              Before 2025 this product was impossible. The rails weren't there. Now they are.
            </Lead>
          </FadeUp>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-why-now.mp3")} />
    </Sequence>
  );
}
