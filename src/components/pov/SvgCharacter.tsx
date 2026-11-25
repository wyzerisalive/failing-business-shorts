import React from "react";
import type { PovAction, PovRole } from "../../data/restaurant-pov-episodes";

type Props = {
  role: PovRole;
  action: PovAction;
  icon: string;
  beatFrame: number;
};

const PALETTE: Record<PovRole, { top: string; pants: string; accent: string; skin: string; hat?: string }> = {
  landlord: {
    top: "#2B3445",
    pants: "#1C2230",
    accent: "#C0392B",
    skin: "#E8B58C",
  },
  contractor: {
    top: "#F39C12",
    pants: "#34495E",
    accent: "#D4E157",
    skin: "#C68B5E",
    hat: "#F1C40F",
  },
  chef: {
    top: "#F5F5F5",
    pants: "#2C2C2C",
    accent: "#E74C3C",
    skin: "#F0C29A",
    hat: "#FFFFFF",
  },
  customer: {
    top: "#2E86C1",
    pants: "#5D6D7E",
    accent: "#AED6F1",
    skin: "#D9A47A",
  },
};

/** Flat geometric character. Pivots are explicit so limbs swing from shoulders/hips. */
export const SvgCharacter: React.FC<Props> = ({ role, action, icon, beatFrame }) => {
  const c = PALETTE[role];
  const walking = action !== "idle-talk";
  const s = Math.sin(beatFrame * 0.35);
  const leg = walking ? s * 24 : 0;
  const arm = walking ? -s * 20 : 0;
  const bob = walking ? Math.abs(s) * -6 : 0;
  const talk = walking ? 0 : Math.sin(beatFrame * 0.18);
  const head = talk * 5;
  const gesture = walking ? arm : -35 + talk * 18;

  return (
    <svg width={220} height={460} viewBox="0 0 220 460" style={{ overflow: "visible" }}>
      <ellipse cx={110} cy={448} rx={62} ry={10} fill="rgba(0,0,0,0.28)" />
      <g transform={`translate(0 ${bob})`}>
        {/* Legs */}
        <rect x={84} y={290} width={22} height={150} rx={10} fill={c.pants} transform={`rotate(${leg} 95 295)`} />
        <rect x={114} y={290} width={22} height={150} rx={10} fill={c.pants} transform={`rotate(${-leg} 125 295)`} />
        {/* Back arm */}
        <rect x={56} y={168} width={20} height={118} rx={10} fill={c.top} transform={`rotate(${-arm} 66 175)`} />
        {/* Torso */}
        <rect x={70} y={160} width={80} height={140} rx={18} fill={c.top} />
        {role === "landlord" && (
          <>
            <polygon points="100,160 120,160 110,182" fill="#FFFFFF" />
            <polygon points="106,180 114,180 117,240 110,250 103,240" fill={c.accent} />
          </>
        )}
        {role === "contractor" && (
          <>
            <rect x={70} y={210} width={80} height={10} fill={c.accent} />
            <rect x={70} y={250} width={80} height={10} fill={c.accent} />
          </>
        )}
        {role === "chef" && <rect x={80} y={200} width={60} height={100} rx={8} fill={c.accent} opacity={0.9} />}
        {role === "customer" && <rect x={106} y={164} width={8} height={130} fill={c.accent} />}
        {/* Front arm (gesture) */}
        <g transform={`rotate(${gesture} 154 175)`}>
          <rect x={144} y={168} width={20} height={118} rx={10} fill={c.top} />
          <circle cx={154} cy={290} r={12} fill={c.skin} />
        </g>
        {/* Head */}
        <g transform={`rotate(${head} 110 150)`}>
          <rect x={102} y={136} width={16} height={26} fill={c.skin} />
          <circle cx={110} cy={110} r={40} fill={c.skin} />
          <circle cx={96} cy={106} r={5} fill="#1B1B1B" />
          <circle cx={124} cy={106} r={5} fill="#1B1B1B" />
          <rect x={98} y={126} width={24} height={talk > 0 ? 8 : 4} rx={3} fill="#5A2D22" />
          {role === "contractor" && <path d="M66 98 Q110 40 154 98 Z" fill={c.hat} />}
          {role === "chef" && <rect x={80} y={42} width={60} height={42} rx={14} fill={c.hat} />}
          {role === "landlord" && <path d="M72 96 Q110 58 148 96 Q110 78 72 96 Z" fill="#3B2A20" />}
          {role === "customer" && <path d="M70 102 Q110 50 150 102 L150 88 Q110 60 70 88 Z" fill="#6E4B3A" />}
        </g>
      </g>
      {/* Speech badge */}
      <g transform={`translate(110 ${12 + bob + talk * -4})`}>
        <circle r={38} fill="#FFFFFF" stroke="#111" strokeWidth={4} />
        <polygon points="-10,34 10,34 0,52" fill="#FFFFFF" />
        <text y={14} textAnchor="middle" fontSize={40}>
          {icon}
        </text>
      </g>
    </svg>
  );
};
