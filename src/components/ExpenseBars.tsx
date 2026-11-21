import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Episode } from "../episodes/schema";
import { COLORS, INTER, MONO, glassCard } from "../theme";

const BAR_COLORS = [
  [COLORS.red, "#FF7A8A"],
  [COLORS.orange, COLORS.amber],
  ["#C026D3", "#F472B6"],
];

/** Three horizontal expense bars that spring into place, staggered. */
export const ExpenseBars: React.FC<{
  expenses: Episode["expenses"];
  start: number;
  width: number;
}> = ({ expenses, start, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        ...glassCard,
        width,
        padding: "24px 26px",
        fontFamily: INTER,
        boxSizing: "border-box",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2, color: COLORS.muted, marginBottom: 18 }}>
        MONTHLY EXPENSES
      </div>
      {expenses.map((e, i) => {
        const s = spring({
          frame: frame - start - i * 12,
          fps,
          config: { damping: 11, stiffness: 120, mass: 0.8 },
        });
        const [c1, c2] = BAR_COLORS[i % BAR_COLORS.length];
        return (
          <div key={e.label} style={{ marginBottom: i === expenses.length - 1 ? 0 : 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 23,
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: 9,
                opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              <span>{e.label}</span>
              <span style={{ fontFamily: MONO, color: c2 }}>{e.amount}</span>
            </div>
            <div
              style={{
                height: 18,
                borderRadius: 9,
                background: "rgba(255,255,255,0.07)",
                overflow: "visible",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.max(0, s * e.percent)}%`,
                  borderRadius: 9,
                  background: `linear-gradient(90deg, ${c1}, ${c2})`,
                  boxShadow: `0 0 18px ${c1}99`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
