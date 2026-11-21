import { useCurrentFrame } from "remotion";
import type { Episode } from "../episodes/schema";
import { COLORS, INTER, MONO, formatMoney, pulse, valueAt } from "../theme";

/** Large monospace cash figure that follows the JSON cash keyframes. */
export const CashCounter: React.FC<{ episode: Episode; top: number }> = ({
  episode,
  top,
}) => {
  const frame = useCurrentFrame();
  const { keyframes, lowThreshold, label } = episode.cash;

  const value = valueAt(frame, keyframes);
  const prev = valueAt(frame - 1, keyframes);
  const velocity = value - prev;
  const dropping = velocity < -0.5;
  const rising = velocity > 0.5;
  const low = value < lowThreshold;

  // Flash red ~2x per second when below the threshold.
  const flash = low ? pulse(frame, 15) : 0;
  const color = low
    ? flash > 0.5
      ? COLORS.red
      : "#FFD5DA"
    : dropping
      ? "#FF8A96"
      : rising
        ? COLORS.emerald
        : COLORS.text;

  // Running delta since the last flat keyframe, to show "▼ -$9,800".
  let segStart = keyframes[0];
  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].frame <= frame) segStart = keyframes[i];
  }
  const nextKf = keyframes.find((k) => k.frame > frame);
  const segDelta = nextKf ? value - segStart.value : 0;
  const showDelta = (dropping || rising) && Math.abs(segDelta) > 1;

  // Subtle jitter while dropping fast.
  const shake = dropping ? Math.sin(frame * 2.7) * Math.min(6, -velocity / 30) : 0;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: INTER,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 6,
          color: low ? COLORS.red : COLORS.muted,
        }}
      >
        {label}
        {low ? " · CRITICAL" : ""}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 168,
          lineHeight: 1.05,
          letterSpacing: -6,
          color,
          translate: `${shake}px 0px`,
          textShadow: `0 0 ${low ? 30 + flash * 40 : 24}px ${
            low || dropping ? "rgba(255,59,78,0.65)" : rising ? "rgba(16,227,154,0.5)" : "rgba(255,255,255,0.15)"
          }`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatMoney(value)}
      </div>
      <div
        style={{
          height: 48,
          marginTop: 4,
          opacity: showDelta ? 1 : 0,
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 34,
          color: segDelta < 0 ? COLORS.red : COLORS.emerald,
          padding: "4px 20px",
          borderRadius: 12,
          background: segDelta < 0 ? "rgba(255,59,78,0.14)" : "rgba(16,227,154,0.14)",
        }}
      >
        {segDelta < 0 ? "▼ " : "▲ +"}
        {formatMoney(segDelta)}
      </div>
    </div>
  );
};
