import { AbsoluteFill } from "remotion";
import { COLORS } from "../brand";

// Default cream stage — every scene sits on this. One scene (Hook) inverts
// to ink; pass `dark` for that.
export function Stage({
  children,
  dark = false,
  pad = 96,
  align = "center",
}: {
  children: React.ReactNode;
  dark?: boolean;
  pad?: number;
  align?: "center" | "start";
}) {
  return (
    <AbsoluteFill
      style={{
        background: dark ? COLORS.ink : COLORS.bg,
        padding: pad,
        display: "flex",
        flexDirection: "column",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "flex-start",
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
