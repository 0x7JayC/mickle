// Placeholder device frame. Renders an iPhone-shaped surround so the user
// can drop a screen recording (or screenshot) into `src` later. If `src`
// is unset, shows a labeled placeholder so the storyboard reads even
// before footage is captured.
import { COLORS, FONTS } from "../brand";
import { Img, staticFile } from "remotion";

export function PhoneFrame({
  height = 720,
  src,
  label,
}: {
  height?: number;
  src?: string;
  label?: string;
}) {
  const aspect = 19.5 / 9; // iPhone 15 Pro
  const screenH = height - 24;
  const screenW = screenH / aspect;
  const totalW = screenW + 24;
  return (
    <div
      style={{
        height,
        width: totalW,
        borderRadius: 56,
        padding: 12,
        background: "#1d1d1f",
        boxShadow:
          "0 40px 80px -24px rgba(12,10,20,0.35), inset 0 0 0 2px rgba(255,255,255,0.08)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: screenW,
          height: screenH,
          borderRadius: 44,
          background: COLORS.bg,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          <Img
            src={staticFile(src)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: COLORS.inkSubtle,
              padding: 24,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Screen
            <br />
            {label ?? "recording"}
          </div>
        )}
      </div>
    </div>
  );
}
