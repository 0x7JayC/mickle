// In-video render of the Mickle login modal. Mirrors the live /app
// unauthenticated state — single coral accent, Apple-discipline glass.
import { COLORS, FONTS } from "../brand";
import { Gem } from "../components/Gem";

export function SignInScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 28,
          border: `1px solid ${COLORS.hairline}`,
          padding: 24,
          width: "92%",
          textAlign: "center",
          boxShadow: "0 12px 40px -12px rgba(12,10,20,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Gem size={36} />
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.5,
            color: COLORS.ink,
            marginBottom: 8,
          }}
        >
          Welcome to Mickle.
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 12,
            color: COLORS.inkMuted,
            lineHeight: 1.4,
            marginBottom: 16,
          }}
        >
          A Solana wallet appears in 5 seconds. No seed phrase.
        </div>
        <div
          style={{
            background: COLORS.ink,
            color: "#fff",
            borderRadius: 999,
            padding: "10px 0",
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
           Continue with Apple
        </div>
        <div
          style={{
            background: "#fff",
            color: COLORS.ink,
            border: `1px solid ${COLORS.hairline}`,
            borderRadius: 999,
            padding: "10px 0",
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Continue with email
        </div>
      </div>
    </div>
  );
}
