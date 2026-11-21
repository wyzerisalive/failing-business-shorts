import { loadFont } from "@remotion/fonts";
import { interpolate, staticFile } from "remotion";
import type { Mood } from "./episodes/schema";

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
export const INTER = "Inter";
export const MONO = "JetBrains Mono";
loadFont({ family: INTER, url: staticFile("fonts/Inter-Variable.woff2"), weight: "100 900" });
loadFont({ family: MONO, url: staticFile("fonts/JetBrainsMono-Variable.woff2"), weight: "100 800" });

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 900,
} as const;

/** Platform UI (Reels/TikTok/Shorts) covers these regions. Keep critical UI out. */
export const SAFE = {
  top: 180,
  bottom: 280,
  side: 60,
  /** First y coordinate that is unsafe at the bottom. */
  bottomEdge: VIDEO.height - 280,
} as const;

export const COLORS = {
  bg: "#0B0F19",
  grid: "rgba(255,255,255,0.045)",
  glass: "rgba(255,255,255,0.045)",
  glassStrong: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  text: "#F4F6FB",
  muted: "rgba(226,232,240,0.6)",
  red: "#FF3B4E",
  redDeep: "#B3112A",
  emerald: "#10E39A",
  cyan: "#22D3EE",
  blue: "#3B82F6",
  amber: "#FFB020",
  orange: "#FF7A1A",
  neonYellow: "#FFE94D",
  neonGreen: "#5CFF8F",
} as const;

export const glassCard: React.CSSProperties = {
  background: COLORS.glass,
  border: COLORS.border,
  borderRadius: 28,
  boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(18px)",
};

/** Piecewise-linear lookup across keyframes (e.g. the cash path). */
export const valueAt = (
  frame: number,
  keyframes: { frame: number; value: number }[],
): number => {
  return interpolate(
    frame,
    keyframes.map((k) => k.frame),
    keyframes.map((k) => k.value),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

export const moodAt = (
  frame: number,
  moods: { from: number; mood: Mood }[],
): Mood => {
  let current = moods[0].mood;
  for (const m of moods) {
    if (frame >= m.from) current = m.mood;
  }
  return current;
};

export const formatMoney = (value: number): string => {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${Math.abs(rounded).toLocaleString("en-US")}`;
};

/** Triangle wave 0→1→0 for frame-driven pulses. */
export const pulse = (frame: number, periodFrames: number): number => {
  const t = (frame % periodFrames) / periodFrames;
  return 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
};
