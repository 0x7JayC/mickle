import { Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { Stage } from "../components/Stage";
import { Display } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { PhoneFrame } from "../components/PhoneFrame";
import { COLORS, FONTS } from "../brand";
import { SignInScreen } from "../screens/SignIn";
import { TopUpScreen } from "../screens/TopUp";
import { TapScreen } from "../screens/Tap";
import { MilestoneScreen } from "../screens/Milestone";
import { ActivityScreen } from "../screens/Activity";

const STEPS = [
  { label: "Sign in", body: "Apple ID. Wallet appears in 5 seconds.", Screen: SignInScreen },
  { label: "Top up", body: "£30 covers 30 days of the ritual.", Screen: TopUpScreen },
  { label: "Tap", body: "£1 into the S&P 500. Streak begins.", Screen: TapScreen },
  { label: "Day 30", body: "The mickle 🔥 — soulbound NFT minted.", Screen: MilestoneScreen },
  { label: "Receipt", body: "Activity ledger — every event in order.", Screen: ActivityScreen },
];

// 0:30 – 0:55 — Numbered ritual on the left, phone screens cycling on
// the right. Switching is frame-based (no nested Sequences) so the flex
// row never collapses.
export function Demo({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = Math.floor(duration / STEPS.length);
  const activeIdx = Math.min(STEPS.length - 1, Math.floor(frame / beat));
  const Active = STEPS[activeIdx].Screen;

  // Cross-fade phone content between beats: last 8f of each beat
  const localFrame = frame - activeIdx * beat;
  const fadeOut = interpolate(
    localFrame,
    [beat - 8, beat],
    [1, activeIdx < STEPS.length - 1 ? 0 : 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );

  void fps; // (kept for future timing tweaks)

  return (
    <Sequence durationInFrames={duration} name="Demo">
      <Stage>
        <div
          style={{
            width: "100%",
            maxWidth: 1700,
            margin: "0 auto",
            display: "flex",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Left column — text steps */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <FadeUp delay={4}>
              <Kicker>The ritual</Kicker>
            </FadeUp>
            <div style={{ height: 24 }} />
            <FadeUp delay={14}>
              <Display size={80}>
                One tap.
                <br />
                Once a day.
              </Display>
            </FadeUp>
            <div style={{ height: 56 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {STEPS.map((s, i) => {
                const isActive = i === activeIdx;
                return (
                  <FadeUp key={i} delay={36 + i * 18}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 24,
                        opacity: isActive ? 1 : 0.45,
                        transition: "opacity 0.3s",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 18,
                          fontWeight: 700,
                          color: COLORS.accent,
                          letterSpacing: "0.18em",
                          minWidth: 64,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div style={{ fontFamily: FONTS.body, fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontFamily: FONTS.body,
                            fontSize: 22,
                            color: COLORS.inkMuted,
                            marginTop: 4,
                          }}
                        >
                          {s.body}
                        </div>
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>

          {/* Right column — single phone, content swaps with frame */}
          <FadeUp delay={20}>
            <div style={{ opacity: fadeOut }}>
              <PhoneFrame height={720}>
                <Active />
              </PhoneFrame>
            </div>
          </FadeUp>
        </div>
      </Stage>
    </Sequence>
  );
}
