// Activity feed mock — proves persistence to judges.
import { COLORS, FONTS } from "../brand";

const ITEMS = [
  { type: "milestone", icon: "★", color: "#6d5ef5", label: "Day 30 milestone", detail: "Soulbound NFT minted", amount: "", at: "now" },
  { type: "tap", icon: "·", color: COLORS.accent, label: "Daily tap", detail: "", amount: "+£1", at: "1m ago" },
  { type: "batch", icon: "↻", color: COLORS.ink, label: "Treasury swap", detail: "Executed on Solana", amount: "£14 → 0.0212 SPYx", at: "8h ago" },
  { type: "tap", icon: "·", color: COLORS.accent, label: "Daily tap", detail: "", amount: "+£1", at: "1d ago" },
  { type: "tap", icon: "·", color: COLORS.accent, label: "Daily tap", detail: "", amount: "+£1", at: "2d ago" },
  { type: "deposit", icon: "+", color: "#10b981", label: "Top-up", detail: "£30 via Open Banking", amount: "+£30", at: "3d ago" },
];

export function ActivityScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bg,
        padding: 14,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 8,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.inkMuted,
          marginBottom: 4,
        }}
      >
        Activity
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: -0.5,
          color: COLORS.ink,
          marginBottom: 12,
        }}
      >
        Receipt of every tap.
      </div>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${COLORS.hairline}`,
          borderRadius: 14,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {ITEMS.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: "8px 10px",
              borderTop: i === 0 ? "none" : `1px solid ${COLORS.hairline}`,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                borderRadius: 999,
                background: it.color,
                color: "#fff",
                fontFamily: FONTS.body,
                fontSize: 9,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {it.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: COLORS.ink }}>{it.label}</div>
              {it.detail && (
                <div style={{ fontFamily: FONTS.body, fontSize: 8.5, color: COLORS.inkMuted, marginTop: 1 }}>{it.detail}</div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {it.amount && (
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>
                  {it.amount}
                </div>
              )}
              <div style={{ fontFamily: FONTS.mono, fontSize: 7.5, color: COLORS.inkSubtle, marginTop: 1 }}>{it.at}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
