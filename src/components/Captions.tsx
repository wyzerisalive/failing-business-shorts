import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "../episodes/schema";
import { COLORS, INTER } from "../theme";

const NUMBER_RE = /[$\d%]/;
const clean = (w: string) => w.replace(/[^\w$%\-']/g, "").toLowerCase();

/**
 * Kinetic word-by-word captions. Each word pops in on its frame.
 * Numbers/money → neon yellow. Words listed in `highlight` → neon green.
 */
export const Captions: React.FC<{ captions: Caption[]; top: number }> = ({ captions, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = captions.find((c) => frame >= c.start && frame < c.end);
  if (!active) return null;

  const words = active.text.split(/\s+/).filter(Boolean);
  const span = (active.end - active.start) * 0.6;
  const wordFrames =
    active.wordFrames && active.wordFrames.length === words.length
      ? active.wordFrames
      : words.map((_, i) => Math.round(active.start + (i / Math.max(1, words.length)) * span));
  const highlights = new Set((active.highlight ?? []).map(clean));
  const exit = interpolate(frame, [active.end - 4, active.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The "current" word is the latest one that has appeared.
  let currentIdx = 0;
  wordFrames.forEach((f, i) => {
    if (frame >= f) currentIdx = i;
  });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        display: "flex",
        justifyContent: "center",
        zIndex: 60,
        opacity: exit,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 22px",
          padding: "18px 28px",
          borderRadius: 26,
          background: "rgba(5,8,14,0.82)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
          fontFamily: INTER,
          fontWeight: 900,
          fontSize: 58,
          lineHeight: 1.15,
          letterSpacing: -0.5,
          textTransform: "uppercase",
        }}
      >
        {words.map((w, i) => {
          // Only revealed words take up space, so the pill grows word by word.
          if (frame < wordFrames[i]) return null;
          const appear = spring({ frame: frame - wordFrames[i], fps, config: { damping: 18, stiffness: 280 } });
          const isNum = NUMBER_RE.test(w);
          const isKey = highlights.has(clean(w));
          const color = isNum ? COLORS.neonYellow : isKey ? COLORS.neonGreen : "#FFFFFF";
          const isCurrent = i === currentIdx;
          return (
            <span
              key={`${w}-${i}`}
              style={{
                color,
                scale: String(interpolate(appear, [0, 1], [0.5, 1]) * (isCurrent ? 1.04 : 1)),
                display: "inline-block",
                WebkitTextStroke: "2px rgba(0,0,0,0.6)",
                paintOrder: "stroke fill",
                textShadow: isNum || isKey ? `0 0 22px ${color}99` : "0 3px 0 rgba(0,0,0,0.5)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
