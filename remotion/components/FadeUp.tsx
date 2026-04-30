// Single-effect-family entrance. Spring-driven fade + 24px slide-up.
// Used everywhere — no other entrance variants. Apple-discipline.
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export function FadeUp({
  children,
  delay = 0,
  duration = 24,
  distance = 24,
  exit,
  exitDuration = 12,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  exit?: number;
  exitDuration?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: duration,
  });
  const exitProgress =
    typeof exit === "number"
      ? spring({
          frame: frame - exit,
          fps,
          config: { damping: 200 },
          durationInFrames: exitDuration,
        })
      : 0;
  const opacity = Math.max(0, progress - exitProgress);
  const y = (1 - progress) * distance;
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}
