import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, INTER, MONO, glassCard, pulse } from "../theme";

const W = 898;
const H = 250;
const PAD = 14;

const toPoints = (values: number[], min: number, max: number) =>
  values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2),
  }));

const pathOf = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

const lengthOf = (pts: { x: number; y: number }[]) =>
  pts.reduce(
    (sum, p, i) => (i === 0 ? 0 : sum + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y)),
    0,
  );

/**
 * Revenue (emerald) vs burn (red) line chart. Lines draw in with
 * strokeDashoffset between `drawStart` and `drawStart + drawFrames`.
 */
export const CashFlowChart: React.FC<{
  title: string;
  revenue: number[];
  burn: number[];
  drawStart: number;
  drawFrames: number;
}> = ({ title, revenue, burn, drawStart, drawFrames }) => {
  const frame = useCurrentFrame();
  const all = [...revenue, ...burn];
  const min = Math.min(...all) * 0.9;
  const max = Math.max(...all) * 1.05;
  const rev = toPoints(revenue, min, max);
  const brn = toPoints(burn, min, max);
  const revLen = lengthOf(rev);
  const brnLen = lengthOf(brn);

  const progress = interpolate(frame, [drawStart, drawStart + drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });
  const visibleIndex = progress * (revenue.length - 1);
  const p = pulse(frame, 30);

  const lastRev = revenue[revenue.length - 1];
  const lastBurn = burn[burn.length - 1];
  const net = lastRev - lastBurn;

  const areaPath =
    pathOf(brn) + ` L${brn[brn.length - 1].x},${H} L${brn[0].x},${H} Z`;

  return (
    <div style={{ ...glassCard, padding: "26px 30px 22px", fontFamily: INTER }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: COLORS.muted }}>
          {title}
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: COLORS.emerald }}>● Revenue</span>
          <span style={{ color: COLORS.red }}>● Burn</span>
        </div>
      </div>

      <svg width={W} height={H} style={{ marginTop: 16, overflow: "visible" }}>
        <defs>
          <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="burnFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.28} />
            <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
          </linearGradient>
          <clipPath id="reveal">
            <rect x={0} y={-20} width={PAD + progress * (W - PAD * 2)} height={H + 40} />
          </clipPath>
        </defs>

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={0}
            x2={W}
            y1={H * t}
            y2={H * t}
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="4 8"
          />
        ))}

        <path d={areaPath} fill="url(#burnFill)" clipPath="url(#reveal)" />

        <path
          d={pathOf(brn)}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={brnLen}
          strokeDashoffset={brnLen * (1 - progress)}
          filter="url(#glow)"
        />
        <path
          d={pathOf(rev)}
          fill="none"
          stroke={COLORS.emerald}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={revLen}
          strokeDashoffset={revLen * (1 - progress)}
          filter="url(#glow)"
        />

        {/* Data nodes every 5 days, pulsing once revealed */}
        {rev.map((pt, i) => {
          if (i % 5 !== 4 && i !== rev.length - 1) return null;
          if (i > visibleIndex + 0.01) return null;
          const isLast = i === rev.length - 1;
          return (
            <g key={`n${i}`}>
              {[{ pt, c: COLORS.emerald }, { pt: brn[i], c: COLORS.red }].map(({ pt: q, c }, k) => (
                <g key={k}>
                  <circle
                    cx={q.x}
                    cy={q.y}
                    r={(isLast ? 14 : 9) + p * (isLast ? 12 : 5)}
                    fill={c}
                    opacity={0.25 * (1 - p) + 0.08}
                  />
                  <circle cx={q.x} cy={q.y} r={isLast ? 8 : 5.5} fill={COLORS.bg} stroke={c} strokeWidth={3} />
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          fontFamily: MONO,
          fontSize: 22,
          color: COLORS.muted,
          opacity: interpolate(progress, [0.8, 1], [0, 1]),
        }}
      >
        <span>DAY 1</span>
        <span style={{ color: net < 0 ? COLORS.red : COLORS.emerald, fontWeight: 800 }}>
          NET TODAY {net < 0 ? "-" : "+"}${Math.abs(net).toLocaleString("en-US")}/day
        </span>
        <span>DAY {revenue.length}</span>
      </div>
    </div>
  );
};
