import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Mood } from "../episodes/schema";
import { COLORS, INTER, glassCard, pulse } from "../theme";

const MOOD_LABEL: Record<Mood, { text: string; color: string }> = {
  stressed: { text: "STRESSED", color: COLORS.amber },
  panicked: { text: "PANICKING", color: COLORS.red },
  relieved: { text: "RELIEVED", color: COLORS.emerald },
};

/**
 * 2.5D geometric storefront: owner behind a counter, noren curtain, steaming bowl.
 * The face reacts to `mood`.
 */
export const OwnerAvatar: React.FC<{ mood: Mood; moodChangedAt: number; width: number }> = ({
  mood,
  moodChangedAt,
  width,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - moodChangedAt, fps, config: { damping: 8, stiffness: 200 } });
  const p = pulse(frame, 20);

  // Blink every ~2.7s (not while relieved: eyes are already closed arcs).
  const blink = frame % 80 > 75;
  const shakeX = mood === "panicked" ? Math.sin(frame * 1.9) * 2.5 : 0;
  const bob = Math.sin(frame / 12) * 2;
  const label = MOOD_LABEL[mood];

  const browTilt = mood === "stressed" ? 12 : mood === "panicked" ? -14 : -4;
  const browY = mood === "panicked" ? -8 : 0;
  const eyeR = mood === "panicked" ? 9 : 7;

  return (
    <div
      style={{
        ...glassCard,
        width,
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        fontFamily: INTER,
      }}
    >
      <svg viewBox="0 0 360 330" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1A2236" />
            <stop offset="1" stopColor="#0F1524" />
          </linearGradient>
          <linearGradient id="counterTop" x1="0" x2="1">
            <stop offset="0" stopColor="#8B5A34" />
            <stop offset="1" stopColor="#B07445" />
          </linearGradient>
        </defs>
        <rect width="360" height="330" fill="url(#wall)" />

        {/* Warm lamp glow; flickers red when panicked */}
        <circle
          cx="180"
          cy="40"
          r={120}
          fill={mood === "panicked" ? COLORS.red : "#FFB45A"}
          opacity={mood === "panicked" ? 0.12 + p * 0.1 : 0.14}
        />
        <line x1="180" y1="0" x2="180" y2="28" stroke="#3A4560" strokeWidth="3" />
        <path d="M160 28 L200 28 L192 42 L168 42 Z" fill="#FFCF7A" />

        {/* Noren curtain */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 72} y={52} width={66} height={54} rx={4} fill="#B3112A" opacity={0.85} />
        ))}
        <text x="180" y="88" textAnchor="middle" fill="#FFE7C2" fontSize="22" fontWeight="900" fontFamily={INTER}>
          ラーメン
        </text>

        {/* Owner */}
        <g transform={`translate(${shakeX}, ${bob})`}>
          {/* body */}
          <path d="M112 330 L120 250 Q180 220 240 250 L248 330 Z" fill="#2C3A58" />
          <path d="M150 238 L180 270 L210 238 Z" fill="#F4F6FB" />
          {/* neck + head */}
          <rect x="166" y="205" width="28" height="30" fill="#E9B48A" />
          <g transform={`translate(180, 172) scale(${interpolate(pop, [0, 1], [1.12, 1])})`}>
            <ellipse cx="0" cy="0" rx="50" ry="56" fill="#F2C29A" />
            {/* side shading for 2.5D */}
            <path d="M18 -50 Q55 -20 44 30 Q30 52 10 56 Q40 10 18 -50 Z" fill="#D99D72" opacity="0.55" />
            {/* headband */}
            <rect x="-52" y="-38" width="104" height="16" rx="6" fill="#F4F6FB" />
            <circle cx="-44" cy="-30" r="7" fill="#B3112A" />
            <path d="M-50 -40 Q0 -78 50 -40 Z" fill="#1B1F2B" />

            {/* brows */}
            <rect x="-34" y={-14 + browY} width="22" height="5" rx="2.5" fill="#1B1F2B" transform={`rotate(${browTilt} -23 ${-12 + browY})`} />
            <rect x="12" y={-14 + browY} width="22" height="5" rx="2.5" fill="#1B1F2B" transform={`rotate(${-browTilt} 23 ${-12 + browY})`} />

            {/* eyes */}
            {mood === "relieved" ? (
              <>
                <path d="M-30 4 Q-21 -4 -12 4" stroke="#1B1F2B" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M12 4 Q21 -4 30 4" stroke="#1B1F2B" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : blink ? (
              <>
                <rect x="-30" y="2" width="18" height="3" rx="1.5" fill="#1B1F2B" />
                <rect x="12" y="2" width="18" height="3" rx="1.5" fill="#1B1F2B" />
              </>
            ) : (
              <>
                <circle cx="-21" cy="4" r={eyeR + 3} fill="#FFFFFF" />
                <circle cx="21" cy="4" r={eyeR + 3} fill="#FFFFFF" />
                <circle cx={-21 + (mood === "panicked" ? Math.sin(frame / 3) * 2 : 0)} cy="5" r={eyeR - 2} fill="#1B1F2B" />
                <circle cx={21 + (mood === "panicked" ? Math.sin(frame / 3) * 2 : 0)} cy="5" r={eyeR - 2} fill="#1B1F2B" />
              </>
            )}

            {/* cheeks */}
            {mood === "relieved" && (
              <>
                <ellipse cx="-30" cy="22" rx="9" ry="5" fill="#FF8A8A" opacity="0.5" />
                <ellipse cx="30" cy="22" rx="9" ry="5" fill="#FF8A8A" opacity="0.5" />
              </>
            )}

            {/* mouth */}
            {mood === "stressed" && (
              <path d="M-14 32 Q-7 27 0 32 Q7 37 14 32" stroke="#7A2E2E" strokeWidth="4" fill="none" strokeLinecap="round" />
            )}
            {mood === "panicked" && (
              <ellipse cx="0" cy={34} rx={11} ry={10 + p * 4} fill="#5A1A1A" />
            )}
            {mood === "relieved" && (
              <path d="M-18 26 Q0 46 18 26 Z" fill="#7A2E2E" />
            )}

            {/* sweat */}
            {mood !== "relieved" && (
              <path
                d={`M44 ${-18 + (frame % 40) * 0.8} q6 10 0 14 q-6 -4 0 -14 Z`}
                fill="#7FD3FF"
                opacity={interpolate(frame % 40, [0, 30, 40], [1, 1, 0])}
              />
            )}
            {mood === "panicked" && (
              <path
                d={`M-48 ${-10 + ((frame + 18) % 36) * 0.9} q6 10 0 14 q-6 -4 0 -14 Z`}
                fill="#7FD3FF"
                opacity={interpolate((frame + 18) % 36, [0, 28, 36], [1, 1, 0])}
              />
            )}
          </g>
        </g>

        {/* 2.5D counter: top face + front face */}
        <path d="M0 262 L360 262 L340 282 L20 282 Z" fill="url(#counterTop)" />
        <rect x="20" y="282" width="320" height="48" fill="#5C3A22" />
        <rect x="20" y="282" width="320" height="6" fill="#3E2716" />

        {/* ramen bowl with steam */}
        <g transform="translate(270, 248)">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${-10 + i * 10} -8 q-6 -10 0 -20 q6 -10 0 -20`}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity={0.3 + 0.5 * pulse(frame + i * 10, 40)}
              transform={`translate(0, ${-(frame % 40) * 0.2})`}
            />
          ))}
          <path d="M-30 -6 L30 -6 Q26 18 0 20 Q-26 18 -30 -6 Z" fill="#E8EDF5" />
          <rect x="-30" y="-9" width="60" height="5" rx="2" fill="#B3112A" />
        </g>
        {/* cash register */}
        <g transform="translate(48, 222)">
          <path d="M0 40 L12 0 L64 0 L72 40 Z" fill="#2B3550" />
          <rect x="16" y="6" width="44" height="14" rx="2" fill={mood === "relieved" ? COLORS.emerald : COLORS.red} opacity={0.85} />
        </g>
      </svg>

      {/* Mood tag */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          padding: "6px 14px",
          borderRadius: 999,
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: 2,
          color: label.color,
          background: "rgba(11,15,25,0.75)",
          border: `1px solid ${label.color}`,
          scale: String(interpolate(pop, [0, 1], [1.3, 1])),
        }}
      >
        OWNER · {label.text}
      </div>
    </div>
  );
};
