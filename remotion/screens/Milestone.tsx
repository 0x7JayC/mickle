// Day-30 celebration. Shows the earned milestone card.
import { COLORS, FONTS } from "../brand";

export function MilestoneScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bg,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Streak bumped */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.inkMuted }}>
            Today
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, letterSpacing: -0.6, color: COLORS.ink, marginTop: 2 }}>
            jay.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.inkMuted }}>
            Streak
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: COLORS.accent, marginTop: 2 }}>
            30 🔥
          </div>
        </div>
      </div>

      {/* Earned milestone card */}
      <div
        style={{
          borderRadius: 18,
          background: COLORS.accentSoft,
          border: `1px solid ${COLORS.accentBorder}`,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            background: COLORS.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🔥
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.accent, fontWeight: 700 }}>
            Milestone earned
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 800, color: COLORS.ink, marginTop: 2 }}>
            Day 30 · The mickle
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 9, color: COLORS.inkMuted, marginTop: 2 }}>
            Soulbound NFT minted to your wallet
          </div>
        </div>
      </div>

      {/* Progress bar to day 100 */}
      <div style={{ background: "#fff", border: `1px solid ${COLORS.hairline}`, borderRadius: 14, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.inkMuted }}>
            Next milestone
          </span>
          <span style={{ fontFamily: FONTS.body, fontSize: 9, fontWeight: 600, color: COLORS.accent }}>
            Day 100 · The muckle
          </span>
        </div>
        <div style={{ height: 6, background: "rgba(12,10,20,0.08)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: "30%", height: "100%", background: COLORS.accent, borderRadius: 999 }} />
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 8, color: COLORS.inkMuted, marginTop: 5 }}>
          30 of 100 days
        </div>
      </div>
    </div>
  );
}
