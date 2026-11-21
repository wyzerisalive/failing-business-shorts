import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { DecisionOption, Episode } from "../episodes/schema";
import { COLORS, INTER, MONO, pulse } from "../theme";

const RISK_LEVEL: Record<DecisionOption["risk"], number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  EXTREME: 4,
};

const OptionCard: React.FC<{
  letter: "A" | "B";
  option: DecisionOption;
  accent: string;
  accent2: string;
  enter: number;
  highlight: number;
}> = ({ letter, option, accent, accent2, enter, highlight }) => {
  const level = RISK_LEVEL[option.risk];
  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        boxSizing: "border-box",
        borderRadius: 30,
        padding: "26px 24px",
        background: `linear-gradient(170deg, ${accent}2E, rgba(11,15,25,0.92) 55%)`,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 ${24 + highlight * 36}px ${accent}77, 0 24px 60px rgba(0,0,0,0.55)`,
        translate: `0px ${interpolate(enter, [0, 1], [900, 0])}px`,
        opacity: interpolate(enter, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        display: "flex",
        flexDirection: "column",
        fontFamily: INTER,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
            color: COLORS.bg,
            fontSize: 54,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {letter}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, color: accent }}>OPTION {letter}</div>
      </div>
      <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.text, marginTop: 20, lineHeight: 1.08 }}>
        {option.title}
      </div>
      <div style={{ fontSize: 25, fontWeight: 500, color: COLORS.muted, marginTop: 12, lineHeight: 1.3 }}>
        {option.description}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: COLORS.muted }}>CASH IMPACT</div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: option.impact.length > 9 ? 34 : 54,
          color: accent2,
          marginTop: 4,
          lineHeight: 1.15,
        }}
      >
        {option.impact}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: COLORS.muted, marginTop: 16 }}>
        RISK · <span style={{ color: level >= 3 ? COLORS.red : COLORS.amber }}>{option.risk}</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 12,
              borderRadius: 6,
              background: i <= level ? (level >= 3 ? COLORS.red : COLORS.amber) : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Final 7-ish seconds: question, A/B cards sliding up, 5-second vote timer, CTA. */
export const DecisionCards: React.FC<{
  decision: NonNullable<Episode["decision"]>;
  from: number;
  top: number;
  cardsHeight: number;
}> = ({ decision, from, top, cardsHeight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;

  const q = spring({ frame: frame - from, fps, config: { damping: 14, stiffness: 160 } });
  const enterA = spring({ frame: frame - from - 8, fps, config: { damping: 16, stiffness: 110 } });
  const enterB = spring({ frame: frame - from - 16, fps, config: { damping: 16, stiffness: 110 } });

  const timerFrames = decision.timerSeconds * fps;
  const timerProgress = interpolate(
    frame,
    [decision.timerStart, decision.timerStart + timerFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const secondsLeft = Math.max(
    0,
    Math.ceil(decision.timerSeconds - (frame - decision.timerStart) / fps),
  );
  const timerOn = frame >= decision.timerStart;
  const tickPop = timerOn
    ? interpolate((frame - decision.timerStart) % fps, [0, 6], [1.25, 1], { extrapolateRight: "clamp" })
    : 1;
  const ctaEnter = spring({ frame: frame - decision.timerStart + 10, fps, config: { damping: 12 } });
  const p = pulse(frame, 30);
  // Gentle alternating emphasis so both cards feel "live".
  const alt = pulse(frame, 60);

  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, fontFamily: INTER }}>
      <div
        style={{
          textAlign: "center",
          fontSize: 60,
          fontWeight: 900,
          color: COLORS.text,
          letterSpacing: -1,
          scale: String(interpolate(q, [0, 1], [1.6, 1])),
          opacity: q,
          textShadow: "0 6px 30px rgba(0,0,0,0.6)",
        }}
      >
        {decision.question}
      </div>

      <div style={{ display: "flex", gap: 24, height: cardsHeight, marginTop: 26 }}>
        <OptionCard letter="A" option={decision.optionA} accent={COLORS.cyan} accent2="#60A5FA" enter={enterA} highlight={alt} />
        <OptionCard letter="B" option={decision.optionB} accent={COLORS.amber} accent2={COLORS.orange} enter={enterB} highlight={1 - alt} />
      </div>

      {/* Vote timer */}
      <div
        style={{
          marginTop: 26,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: ctaEnter,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 800,
            fontSize: 44,
            color: secondsLeft <= 2 ? COLORS.red : COLORS.text,
            width: 92,
            textAlign: "center",
            scale: String(tickPop),
          }}
        >
          {timerOn ? `${secondsLeft}s` : `${decision.timerSeconds}s`}
        </div>
        <div style={{ flex: 1, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.08)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div
            style={{
              height: "100%",
              width: `${(1 - timerProgress) * 100}%`,
              borderRadius: 10,
              background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.amber} 60%, ${COLORS.red})`,
              boxShadow: `0 0 18px ${COLORS.amber}`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: 1,
          color: COLORS.bg,
          background: COLORS.neonYellow,
          borderRadius: 18,
          padding: "16px 10px",
          scale: String(interpolate(ctaEnter, [0, 1], [0.6, 1]) * (1 + p * 0.03)),
          opacity: ctaEnter,
          boxShadow: `0 0 ${20 + p * 30}px ${COLORS.neonYellow}88`,
          translate: `0px ${interpolate(ctaEnter, [0, 1], [40, 0], { easing: Easing.out(Easing.cubic) })}px`,
        }}
      >
        💬 {decision.cta}
      </div>
    </div>
  );
};
