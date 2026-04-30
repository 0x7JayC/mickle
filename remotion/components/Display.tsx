import { COLORS, FONTS } from "../brand";

export function Display({
  children,
  size = 140,
  color = COLORS.ink,
  align = "left",
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 0.95,
        letterSpacing: -0.04 * size,
        color,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
}

export function Lead({
  children,
  size = 36,
  color = COLORS.inkMuted,
  align = "left",
  maxWidth,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  align?: "left" | "center";
  maxWidth?: number;
}) {
  return (
    <div
      style={{
        fontFamily: FONTS.body,
        fontSize: size,
        lineHeight: 1.4,
        color,
        textAlign: align,
        maxWidth,
      }}
    >
      {children}
    </div>
  );
}
