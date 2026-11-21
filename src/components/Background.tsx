import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

/** Deep slate background, subtle grid, and a danger glow (0–1) that tints the top. */
export const Background: React.FC<{ danger: number; success: number }> = ({
  danger,
  success,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: "-1px -1px",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 700px at 50% 22%, rgba(255,59,78,${0.08 + danger * 0.22}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 60%, rgba(16,227,154,${success * 0.2}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
