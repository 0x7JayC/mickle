// Top-up modal mock. £30 preset selected.
import { COLORS, FONTS } from "../brand";

export function TopUpScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bg,
        padding: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          border: `1px solid ${COLORS.hairline}`,
          padding: 20,
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: COLORS.inkMuted,
            marginBottom: 6,
          }}
        >
          Top up
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: 800,
            color: COLORS.ink,
            letterSpacing: -0.6,
            marginBottom: 16,
          }}
        >
          How many days?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
          {[
            { d: "10 days", v: "£10", active: false },
            { d: "30 days", v: "£30", active: true },
            { d: "90 days", v: "£90", active: false },
          ].map((p) => (
            <div
              key={p.v}
              style={{
                borderRadius: 14,
                border: `2px solid ${p.active ? COLORS.accent : COLORS.hairline}`,
                background: p.active ? COLORS.accentSoft : "#fff",
                padding: 10,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 8,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: COLORS.inkMuted,
                }}
              >
                {p.d}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.ink,
                  marginTop: 2,
                }}
              >
                {p.v}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            border: `1px solid ${COLORS.hairline}`,
            borderRadius: 14,
            padding: 12,
            marginBottom: 14,
            fontFamily: FONTS.body,
            fontSize: 11,
          }}
        >
          <Row k="Top up" v="£30.00" />
          <Row k="Fee · 0.99%" v="−£0.30" muted />
          <div style={{ height: 1, background: COLORS.hairline, margin: "8px 0" }} />
          <Row k="Into your S&P 500" v="£29.70" bold />
        </div>
        <div
          style={{
            background: COLORS.accent,
            color: "#fff",
            borderRadius: 999,
            padding: "12px 0",
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Continue · £30
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, muted = false, bold = false }: { k: string; v: string; muted?: boolean; bold?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "3px 0",
        color: bold ? COLORS.ink : muted ? COLORS.inkMuted : COLORS.ink,
        fontWeight: bold ? 700 : 400,
        fontSize: bold ? 13 : 11,
      }}
    >
      <span>{k}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
    </div>
  );
}
