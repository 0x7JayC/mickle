// Dashboard ritual card mock — "Tap once for £1." with tap button.
import { COLORS, FONTS } from "../brand";

export function TapScreen() {
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
      {/* Mini nav */}
      <div
        style={{
          background: "rgba(255,255,255,0.6)",
          border: `1px solid ${COLORS.hairline}`,
          borderRadius: 999,
          padding: "6px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONTS.body,
          fontSize: 9,
          fontWeight: 600,
          color: COLORS.ink,
          marginBottom: 16,
        }}
      >
        <span>Mickle</span>
        <span style={{ background: COLORS.accent, color: "#fff", borderRadius: 999, padding: "3px 8px" }}>
          Top up
        </span>
      </div>

      {/* Greeting + streak */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.inkMuted }}>
            Good morning
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
            1 🔥
          </div>
        </div>
      </div>

      {/* Ritual card */}
      <div
        style={{
          borderRadius: 18,
          background: COLORS.accentSoft,
          border: `1px solid ${COLORS.accentBorder}`,
          padding: 18,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.accent, fontWeight: 700, marginBottom: 6 }}>
          Today&apos;s ritual
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 19, fontWeight: 800, letterSpacing: -0.5, color: COLORS.ink, marginBottom: 14 }}>
          Tap once for £1.
        </div>
        <div
          style={{
            background: COLORS.accent,
            color: "#fff",
            borderRadius: 999,
            padding: "12px 0",
            fontFamily: FONTS.body,
            fontSize: 16,
            fontWeight: 800,
            margin: "0 auto",
            width: "82%",
          }}
        >
          £1 · Tap
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 8.5, color: COLORS.inkSubtle, fontStyle: "italic", marginTop: 10 }}>
          He who is faithful with little will be faithful with much.
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
        {[
          { l: "Position", v: "—", note: "Live once first tap settles" },
          { l: "Contributed", v: "£30.00", note: "Total deposited" },
        ].map((s) => (
          <div key={s.l} style={{ background: "#fff", border: `1px solid ${COLORS.hairline}`, borderRadius: 14, padding: 10 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.inkMuted, marginBottom: 4 }}>
              {s.l}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 800, color: s.v === "—" ? COLORS.inkSubtle : COLORS.ink }}>
              {s.v}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 7.5, color: COLORS.inkSubtle, marginTop: 3 }}>{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
