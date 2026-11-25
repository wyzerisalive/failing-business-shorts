import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { PovHandProp } from "../../data/restaurant-pov-episodes";
import { MONO } from "../../theme";

type Props = { prop: PovHandProp; beatStartFrame: number; cash: number };

const SKIN = "#E2A97E";
const SLEEVE = "#2F3A4F";

const Prop: React.FC<{ prop: PovHandProp; cash: number }> = ({ prop, cash }) => {
  if (prop === "keys")
    return (
      <g>
        <circle cx={540} cy={170} r={34} fill="none" stroke="#C9CED6" strokeWidth={10} />
        <rect x={500} y={200} width={16} height={90} rx={4} fill="#E5B93C" transform="rotate(-18 508 200)" />
        <rect x={560} y={200} width={16} height={80} rx={4} fill="#B8BFC9" transform="rotate(22 568 200)" />
      </g>
    );
  if (prop === "pen-contract")
    return (
      <g>
        <rect x={400} y={90} width={280} height={220} rx={8} fill="#FAFAF5" transform="rotate(-4 540 200)" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={430} y={125 + i * 32} width={200 - i * 30} height={8} fill="#B5BAC4" />
        ))}
        <rect x={610} y={150} width={14} height={150} rx={6} fill="#1E1E2A" transform="rotate(35 617 225)" />
      </g>
    );
  if (prop === "blueprint")
    return (
      <g>
        <rect x={360} y={80} width={360} height={240} rx={6} fill="#1F5FAF" />
        <path d="M400 120 H680 V280 H400 Z M400 200 H540 V280 M600 120 V200 H680" stroke="#CFE3FF" strokeWidth={4} fill="none" />
      </g>
    );
  return (
    <g>
      <rect x={430} y={70} width={220} height={260} rx={22} fill="#2A2D34" />
      <rect x={450} y={90} width={180} height={64} rx={8} fill="#B9E6A7" />
      <text x={620} y={136} textAnchor="end" fontSize={32} fontWeight={800} fontFamily={MONO} fill="#1B2A16">
        {Math.round(cash).toLocaleString("en-US")}
      </text>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={455 + (i % 3) * 60} y={170 + Math.floor(i / 3) * 50} width={46} height={38} rx={6} fill="#4B505B" />
      ))}
    </g>
  );
};

/** First-person arms anchored to the bottom of the stage. */
export const PovHands: React.FC<Props> = ({ prop, beatStartFrame, cash }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - beatStartFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const y = interpolate(enter, [0, 1], [260, 0]) + Math.sin(frame * 0.12) * 6;
  return (
    <svg width={1080} height={420} viewBox="0 0 1080 420" style={{ position: "absolute", left: 0, bottom: 0 }}>
      <g transform={`translate(0 ${y})`}>
        <rect x={250} y={260} width={130} height={240} rx={60} fill={SLEEVE} transform="rotate(28 315 380)" />
        <rect x={700} y={260} width={130} height={240} rx={60} fill={SLEEVE} transform="rotate(-28 765 380)" />
        <Prop prop={prop} cash={cash} />
        <ellipse cx={390} cy={250} rx={62} ry={50} fill={SKIN} />
        <ellipse cx={690} cy={250} rx={62} ry={50} fill={SKIN} />
      </g>
    </svg>
  );
};
