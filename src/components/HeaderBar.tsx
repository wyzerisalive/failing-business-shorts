import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Episode } from "../episodes/schema";
import { COLORS, INTER, MONO, SAFE, glassCard, pulse } from "../theme";

/**
 * Header that starts exactly at the top safe-zone line (y = 180).
 * Row 1: pulsing status badge + countdown pill. Row 2: business name.
 */
export const HeaderBar: React.FC<{
  episode: Episode;
  badgeText: string;
  badgeColor: string;
}> = ({ episode, badgeText, badgeColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { runway, business } = episode;
  const switched = frame >= runway.switchFrame;
  const p = pulse(frame, 24);

  const popIn = spring({
    frame: frame - runway.switchFrame,
    fps,
    config: { damping: 9, stiffness: 180 },
  });
  const pillScale = switched ? interpolate(popIn, [0, 1], [1.35, 1]) : 1;
  const pillColor =
    switched && episode.mode === "part2_outcome" ? COLORS.emerald : COLORS.red;

  const enter = spring({ frame: frame - 2, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        left: SAFE.side,
        right: SAFE.side,
        opacity: enter,
        translate: `0px ${interpolate(enter, [0, 1], [-30, 0])}px`,
        fontFamily: INTER,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 22px",
            borderRadius: 999,
            background: `${badgeColor}26`,
            border: `1.5px solid ${badgeColor}`,
            boxShadow: `0 0 ${14 + p * 26}px ${badgeColor}${Math.round(
              80 + p * 100,
            )
              .toString(16)
              .padStart(2, "0")}`,
            color: badgeColor,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: 2,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: badgeColor,
              opacity: 0.4 + p * 0.6,
              scale: String(0.8 + p * 0.4),
            }}
          />
          {badgeText}
        </div>

        {/* Countdown pill */}
        <div
          style={{
            ...glassCard,
            borderRadius: 999,
            border: `1.5px solid ${switched ? pillColor : "rgba(255,255,255,0.14)"}`,
            background: switched ? `${pillColor}22` : glassCard.background,
            padding: "10px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            scale: String(pillScale),
            boxShadow: switched
              ? `0 0 ${18 + p * 24}px ${pillColor}88`
              : glassCard.boxShadow,
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 2,
              color: COLORS.muted,
            }}
          >
            {switched ? runway.crisisLabel : runway.initialLabel}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 36,
              color: switched ? pillColor : COLORS.text,
              lineHeight: 1.1,
            }}
          >
            {switched ? runway.crisisValue : runway.initialValue}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          color: COLORS.text,
        }}
      >
        <span style={{ fontSize: 50, fontWeight: 900, letterSpacing: -1 }}>
          {business.emoji} {business.name}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: COLORS.muted,
          marginTop: 2,
          letterSpacing: 1,
        }}
      >
        {business.tagline} · EP {episode.episodeNumber}
        {episode.mode === "part2_outcome" ? " · PART 2" : " · PART 1"}
      </div>
    </div>
  );
};
