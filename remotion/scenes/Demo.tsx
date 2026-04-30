import { Sequence } from "remotion";
import { Stage } from "../components/Stage";
import { Display } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { PhoneFrame } from "../components/PhoneFrame";
import { COLORS, FONTS } from "../brand";

// 0:30 – 0:55 — The product demo. Five beats, each labelled. Phone
// placeholder swaps for a real screen recording later.
// Asset = optional path under public/. When unset, PhoneFrame renders a
// labelled placeholder so the storyboard reads even before footage is
// captured. To swap in real screen recordings later, drop a PNG into
// `public/demo-signin.png` (etc.) and set `asset` here.
const STEPS: { label: string; body: string; asset?: string }[] = [
  { label: "Sign in", body: "Apple ID. Wallet appears in 5 seconds." },
  { label: "Top up", body: "£30 covers 30 days of the ritual." },
  { label: "Tap", body: "£1 into the S&P 500. Streak begins." },
  { label: "Day 30", body: "The mickle 🔥 — soulbound NFT minted." },
  { label: "Receipt", body: "Activity ledger — every event in order." },
];

export function Demo({ duration }: { duration: number }) {
  // Each beat lasts ~150 frames (5s) with overlap
  const beat = Math.floor(duration / STEPS.length);
  return (
    <Sequence durationInFrames={duration} name="Demo">
      <Stage>
        <div style={{ width: "100%", maxWidth: 1700, margin: "0 auto", display: "flex", gap: 64, alignItems: "center" }}>
          {/* Left column: text steps */}
          <div style={{ flex: 1 }}>
            <FadeUp delay={4}>
              <Kicker>The ritual</Kicker>
            </FadeUp>
            <div style={{ height: 24 }} />
            <FadeUp delay={14}>
              <Display size={80}>One tap.<br />Once a day.</Display>
            </FadeUp>
            <div style={{ height: 56 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {STEPS.map((s, i) => (
                <FadeUp key={i} delay={36 + i * 28}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 18,
                        fontWeight: 600,
                        color: COLORS.accent,
                        letterSpacing: "0.18em",
                        minWidth: 64,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 30, fontWeight: 600, color: COLORS.ink }}>
                        {s.label}
                      </div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.inkMuted, marginTop: 4 }}>
                        {s.body}
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
          {/* Right column: phone placeholder, cycles through assets */}
          <div style={{ flexShrink: 0 }}>
            {STEPS.map((s, i) => {
              const start = i * beat;
              return (
                <Sequence key={i} from={start} durationInFrames={beat + 18} name={`Phone-${i}`}>
                  <FadeUp delay={0} exit={beat - 6}>
                    <PhoneFrame height={720} src={s.asset} label={s.label} />
                  </FadeUp>
                </Sequence>
              );
            })}
          </div>
        </div>
      </Stage>
    </Sequence>
  );
}
