import { COLORS, FONTS } from "../brand";

export function Kicker({
  children,
  color = COLORS.inkMuted,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}
