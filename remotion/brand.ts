// Single source of truth for video brand tokens. Mirrors the live app:
// cream surface, single coral accent, Geist Sans + Mono, Apple discipline
// (no decorative gradients on chrome, only one effect family).

export const COLORS = {
  bg: "#faf6ee",
  ink: "#0c0a14",
  inkMuted: "rgba(12, 10, 20, 0.62)",
  inkSubtle: "rgba(12, 10, 20, 0.42)",
  accent: "#ff7a59",
  accentSoft: "rgba(255, 122, 89, 0.08)",
  accentBorder: "rgba(255, 122, 89, 0.28)",
  honey: "#f5b94a",        // for the gem logomark only
  emerald: "#10b981",       // milestone tier 1
  indigo: "#6d5ef5",        // milestone tier 3 (rare)
  hairline: "rgba(12, 10, 20, 0.10)",
} as const;

export const FONTS = {
  display: "GeistDisplay, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  body: "Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  mono: "GeistMono, ui-monospace, SFMono-Regular, monospace",
} as const;

export const FPS = 30;
