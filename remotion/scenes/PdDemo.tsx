// Slide 5 — Demo (dark, 30s)
// Live features vs roadmap — two columns with badges
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { COLORS, FONTS } from "../brand";

const LIVE = [
  "Apple · email · Google → embedded Solana wallet (Privy, 5s, no seed)",
  "SIWS — Backpack / Phantom / Solflare external wallet sign-in",
  "USDC deposit → treasury (CDP embedded wallet + direct SPL transfer)",
  "£1/day tap — idempotent atomic Postgres RPC, streak counter bumps",
  "Daily cohort swap via Jupiter Ultra API — treasury signs on-chain",
  "Pro-rata SPYx position card · Activity ledger · Time Machine",
];

const NEXT = [
  "SPYx direct routing — Backed Finance whitelist pending (live: pbUSDC yield vault proves the pipeline)",
  "Metaplex Core on-chain NFT mint for streaks (ledger + schema done)",
  "EMI partnership — Griffin / Modulr for safeguarded GBP float",
  "Kamino USDC vault for cohort float yield (leg 2 of revenue)",
  "Streak Premium £0.99/mo subscription (leg 3 of revenue)",
  "Security audit before unattended treasury custody at scale",
];

function Badge({ type }: { type: "live" | "next" }) {
  const isLive = type === "live";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px 3px 8px",
        borderRadius: 999,
        fontFamily: FONTS.mono,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        flexShrink: 0,
        background: isLive ? "rgba(34,197,94,0.10)" : "rgba(129,140,248,0.10)",
        border: `1px solid ${isLive ? "rgba(34,197,94,0.28)" : "rgba(129,140,248,0.28)"}`,
        color: isLive ? "#22c55e" : "#818cf8",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: "currentColor",
          flexShrink: 0,
        }}
      />
      {isLive ? "Live" : "Next"}
    </div>
  );
}

function FeatureList({
  items,
  type,
  startDelay,
  exit,
}: {
  items: string[];
  type: "live" | "next";
  startDelay: number;
  exit: number;
}) {
  const isLive = type === "live";
  const headerColor = isLive ? "#22c55e" : "#818cf8";
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `1px solid rgba(255,255,255,0.09)`,
        borderRadius: 28,
        padding: 36,
      }}
    >
      <FadeUp delay={startDelay} exit={exit}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color: headerColor,
            fontWeight: 500,
            marginBottom: 24,
          }}
        >
          {isLive ? "Shipped · live mainnet" : "Roadmap · post-Colosseum"}
        </div>
      </FadeUp>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item, i) => (
          <FadeUp key={i} delay={startDelay + 10 + i * 12} exit={exit}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontFamily: FONTS.body,
                fontSize: 20,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <div style={{ marginTop: 3, flexShrink: 0 }}>
                <Badge type={type} />
              </div>
              {item}
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

export function PdDemo({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdDemo">
      <Stage dark align="start">
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Kicker color="rgba(255,255,255,0.45)">Live · mainnet</Kicker>
          </FadeUp>
          <div style={{ height: 18 }} />
          <FadeUp delay={14} exit={exit}>
            <Display size={72} color="#fff">
              mickle-gamma.vercel.app
            </Display>
          </FadeUp>
          <div style={{ height: 36 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <FeatureList items={LIVE} type="live" startDelay={28} exit={exit} />
            <FeatureList items={NEXT} type="next" startDelay={40} exit={exit} />
          </div>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-demo.mp3")} />
    </Sequence>
  );
}
