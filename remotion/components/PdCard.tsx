// Shared card for PitchDeck scenes. Supports dark and light stages.
import { COLORS, FONTS } from "../brand";

export function PdCard({
  kicker,
  headline,
  body,
  dark = false,
  accentHeadline = false,
}: {
  kicker: string;
  headline: string;
  body: string;
  dark?: boolean;
  accentHeadline?: boolean;
}) {
  return (
    <div
      style={{
        background: dark ? "rgba(255,255,255,0.06)" : "#fff",
        border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : COLORS.hairline}`,
        borderRadius: 28,
        padding: 36,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          color: dark ? "rgba(255,255,255,0.38)" : COLORS.inkSubtle,
          fontWeight: 500,
          marginBottom: 16,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -0.6,
          color: accentHeadline ? COLORS.accent : dark ? "#fff" : COLORS.ink,
          marginBottom: 16,
          lineHeight: 1.1,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 22,
          lineHeight: 1.5,
          color: dark ? "rgba(255,255,255,0.55)" : COLORS.inkMuted,
        }}
      >
        {body}
      </div>
    </div>
  );
}
