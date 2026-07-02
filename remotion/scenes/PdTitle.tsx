// Slide 1 — Title (dark, 12s)
// Gem logo · proverb · tagline · live badge + URL
import { Sequence, Audio, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { Display, Lead } from "../components/Display";
import { Kicker } from "../components/Kicker";
import { FadeUp } from "../components/FadeUp";
import { Gem } from "../components/Gem";
import { COLORS, FONTS } from "../brand";

export function PdTitle({ duration }: { duration: number }) {
  const exit = duration - 18;
  return (
    <Sequence durationInFrames={duration} name="PdTitle">
      <Stage dark>
        <div style={{ width: "100%", maxWidth: 1600, margin: "0 auto" }}>
          <FadeUp delay={4} exit={exit}>
            <Gem size={72} />
          </FadeUp>
          <div style={{ height: 40 }} />
          <FadeUp delay={12} exit={exit}>
            <Kicker color="rgba(255,255,255,0.42)">
              Colosseum · Consumer Track · May 2026
            </Kicker>
          </FadeUp>
          <div style={{ height: 28 }} />
          <FadeUp delay={24} exit={exit}>
            <Display size={120} color="#fff">
              Every little
              <br />
              makes a mickle.
            </Display>
          </FadeUp>
          <div style={{ height: 36 }} />
          <FadeUp delay={42} exit={exit}>
            <Lead size={34} color="rgba(255,255,255,0.62)" maxWidth={1200}>
              £1 a day into the S&amp;P 500. On Solana. Global.
              <br />
              Watch what consistency actually compounds into.
            </Lead>
          </FadeUp>
          <div style={{ height: 40 }} />
          <FadeUp delay={62} exit={exit}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(34,197,94,0.10)",
                  border: "1px solid rgba(34,197,94,0.28)",
                  borderRadius: 999,
                  padding: "7px 18px",
                  fontFamily: FONTS.mono,
                  fontSize: 15,
                  letterSpacing: "0.10em",
                  color: "#22c55e",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "#22c55e",
                  }}
                />
                Live mainnet
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 17,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.32)",
                }}
              >
                mickle-gamma.vercel.app
              </div>
            </div>
          </FadeUp>
        </div>
      </Stage>
      <Audio src={staticFile("audio/pd-title.mp3")} />
      {/* Coral accent bar */}
      <FadeUp delay={36}>
        <div
          style={{
            position: "absolute",
            bottom: 96,
            left: 96,
            width: 96,
            height: 4,
            borderRadius: 2,
            background: COLORS.accent,
          }}
        />
      </FadeUp>
    </Sequence>
  );
}
