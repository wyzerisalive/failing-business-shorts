import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Episode } from "../episodes/schema";
import { COLORS, INTER, MONO, pulse } from "../theme";

type Outcome = NonNullable<Episode["outcome"]>;

const choiceColor = (c: "A" | "B") => (c === "A" ? COLORS.cyan : COLORS.amber);

/** "YOU VOTED: A" stamp shown at the very start of a part2_outcome episode. */
export const VotedBadge: React.FC<{ outcome: Outcome; top: number; exitFrom: number }> = ({
  outcome,
  top,
  exitFrom,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spring({ frame: frame - 2, fps, config: { damping: 10, stiffness: 220 } });
  // After the hook, the stamp shrinks and flies up into the header badge slot.
  const exit = interpolate(frame, [exitFrom, exitFrom + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  if (exit >= 1) return null;
  const accent = choiceColor(outcome.votedChoice);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        display: "flex",
        justifyContent: "center",
        fontFamily: INTER,
        zIndex: 40,
        translate: `${interpolate(exit, [0, 1], [0, -260])}px ${interpolate(exit, [0, 1], [0, -500])}px`,
        scale: String(interpolate(stamp, [0, 1], [2.4, 1]) * interpolate(exit, [0, 1], [1, 0.35])),
        rotate: `${interpolate(stamp, [0, 1], [10, -2])}deg`,
        opacity: interpolate(stamp, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }) * (1 - exit),
      }}
    >
      <div
        style={{
          padding: "22px 36px",
          borderRadius: 26,
          border: `3px solid ${accent}`,
          background: "rgba(11,15,25,0.92)",
          boxShadow: `0 0 50px ${accent}99`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 900, color: accent, letterSpacing: 2 }}>
          YOU VOTED: {outcome.votedChoice}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.text, marginTop: 6 }}>
          {outcome.votedTitle}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.muted, marginTop: 4 }}>
          {outcome.votePercent}% of comments agreed
        </div>
      </div>
    </div>
  );
};

/** Final verdict panel for part2_outcome episodes. */
export const OutcomePanel: React.FC<{ outcome: Outcome; from: number; top: number }> = ({
  outcome,
  from,
  top,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;
  const enter = spring({ frame: frame - from, fps, config: { damping: 13, stiffness: 140 } });
  const p = pulse(frame, 30);
  const good = outcome.verdict === "SURVIVED";
  const accent = good ? COLORS.emerald : outcome.verdict === "BANKRUPT" ? COLORS.red : COLORS.amber;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        fontFamily: INTER,
        translate: `0px ${interpolate(enter, [0, 1], [700, 0])}px`,
        opacity: interpolate(enter, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div
        style={{
          borderRadius: 32,
          padding: "34px 34px",
          background: `linear-gradient(170deg, ${accent}30, rgba(11,15,25,0.94) 60%)`,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 ${30 + p * 30}px ${accent}66`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 4, color: COLORS.muted }}>VERDICT</div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            color: accent,
            letterSpacing: -2,
            textShadow: `0 0 40px ${accent}`,
            scale: String(interpolate(enter, [0, 1], [1.4, 1])),
          }}
        >
          {outcome.verdict}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.text, marginTop: 4 }}>{outcome.headline}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          {outcome.stats.map((s, i) => {
            const e = spring({ frame: frame - from - 12 - i * 6, fps, config: { damping: 14 } });
            return (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  padding: "18px 10px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  scale: String(e),
                }}
              >
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: COLORS.text }}>{s.value}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.muted, marginTop: 4, letterSpacing: 1 }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          marginTop: 28,
          textAlign: "center",
          fontSize: 42,
          fontWeight: 900,
          color: COLORS.bg,
          background: COLORS.neonYellow,
          borderRadius: 18,
          padding: "16px 10px",
          boxShadow: `0 0 ${20 + p * 30}px ${COLORS.neonYellow}88`,
          scale: String(1 + p * 0.03),
        }}
      >
        👉 {outcome.cta}
      </div>
    </div>
  );
};
