// Mickle logomark. The one place a gradient is allowed (logo, not chrome).
import { COLORS } from "../brand";

export function Gem({ size = 64 }: { size?: number }) {
  const radius = size * 0.22;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.honey})`,
        boxShadow: `0 ${size * 0.12}px ${size * 0.4}px -${size * 0.06}px rgba(255,122,89,0.4)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%)",
        }}
      />
    </div>
  );
}
