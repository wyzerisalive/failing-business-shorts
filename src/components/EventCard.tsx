import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { EventCardData } from "../episodes/schema";
import { COLORS, INTER, MONO, pulse } from "../theme";

/** Notification card that slams onto the screen (crisis or good news). */
export const EventCard: React.FC<{ event: EventCardData; top: number }> = ({ event, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - event.frame;
  if (frame < event.frame || frame > event.exitFrame + 15) return null;

  const slam = spring({ frame: local, fps, config: { damping: 12, stiffness: 260, mass: 0.7 } });
  const exit = interpolate(frame, [event.exitFrame, event.exitFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const impactShake = local < 14 ? Math.sin(local * 3.1) * (14 - local) * 1.4 : 0;
  const danger = event.tone === "danger";
  const accent = danger ? COLORS.red : COLORS.emerald;
  const p = pulse(frame, 22);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        fontFamily: INTER,
        scale: String(interpolate(slam, [0, 1], [2.1, 1]) * interpolate(exit, [0, 1], [1, 0.85])),
        rotate: `${interpolate(slam, [0, 1], [-8, -1.5])}deg`,
        translate: `${impactShake}px ${interpolate(exit, [0, 1], [0, -260])}px`,
        opacity: interpolate(slam, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }) * (1 - exit),
        zIndex: 50,
      }}
    >
      <div
        style={{
          borderRadius: 32,
          padding: "30px 34px",
          background: danger
            ? "linear-gradient(160deg, rgba(70,10,20,0.96), rgba(20,8,14,0.96))"
            : "linear-gradient(160deg, rgba(8,58,40,0.96), rgba(6,20,18,0.96))",
          border: `2px solid ${accent}`,
          boxShadow: `0 0 ${40 + p * 40}px ${accent}88, 0 30px 80px rgba(0,0,0,0.6)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 900,
              color: COLORS.bg,
            }}
          >
            {danger ? "!" : "★"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.muted, letterSpacing: 1 }}>
              NEW MESSAGE · {event.sender}
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: accent, letterSpacing: 1 }}>
              {event.title}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.text, marginTop: 20, lineHeight: 1.3 }}>
          {event.message}
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: MONO,
            fontSize: 84,
            fontWeight: 800,
            color: accent,
            textShadow: `0 0 30px ${accent}`,
          }}
        >
          {event.amount}
        </div>
      </div>
    </div>
  );
};
