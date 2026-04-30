// iPhone-shaped surround. Renders any React content inside the screen.
// Used by Demo.tsx with the in-Remotion screen mocks at remotion/screens/.
import { COLORS } from "../brand";

export function PhoneFrame({
  height = 720,
  children,
}: {
  height?: number;
  children?: React.ReactNode;
}) {
  // iPhone 15 Pro aspect (19.5:9 portrait → height/width = 19.5/9)
  const aspect = 19.5 / 9;
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
        flexShrink: 0,
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
        }}
      >
        {children}
      </div>
    </div>
  );
}
