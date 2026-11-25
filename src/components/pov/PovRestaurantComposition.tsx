import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { PovBeat, PovEpisode, PovSceneTheme, PovStatus } from "../../data/restaurant-pov-episodes";
import { INTER, MONO } from "../../theme";
import { PovHands } from "./PovHands";
import { SvgCharacter } from "./SvgCharacter";

const STAGE_H = 1344;
const HUD_H = 576;

const STATUS_COLOR: Record<PovStatus, string> = {
  neutral: "#9AA4B2",
  danger: "#FF4D4F",
  warning: "#FFB020",
  success: "#2ECC71",
};

const THEMES: Record<
  PovSceneTheme,
  {
    wall: string;
    side: string;
    floor: string;
    ceiling: string;
    counter: string;
    light: string;
  }
> = {
  "empty-storefront": {
    wall: "#8E9399",
    side: "#6F757C",
    floor: "#5B6066",
    ceiling: "#3E4349",
    counter: "#4A5058",
    light: "#FFD9A0",
  },
  "open-kitchen": {
    wall: "#E9DCC8",
    side: "#8A5A3B",
    floor: "#6B4429",
    ceiling: "#3A2618",
    counter: "#7A4B2A",
    light: "#FFC870",
  },
};

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;

/** Voiceover is only mounted if the file actually exists in public/, so renders never fail on a missing mp3. */
const SafeVoiceover: React.FC<{ file?: string }> = ({ file }) => {
  if (!file || !getStaticFiles().some((f) => f.name === file)) return null;
  return <Audio src={staticFile(file)} />;
};

const Room: React.FC<{ theme: PovSceneTheme; frame: number }> = ({ theme, frame }) => {
  const t = THEMES[theme];
  const empty = theme === "empty-storefront";
  const flicker = 0.85 + Math.sin(frame * 0.3) * 0.05;
  return (
    <svg width={1080} height={STAGE_H} viewBox={`0 0 1080 ${STAGE_H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="pov-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor={t.light} stopOpacity={0.55} />
          <stop offset="100%" stopColor={t.light} stopOpacity={0} />
        </radialGradient>
        <pattern id="pov-tile" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill={t.wall} />
          <path d="M60 0 V60 H0" stroke="rgba(0,0,0,0.12)" strokeWidth={3} fill="none" />
        </pattern>
      </defs>
      {/* Perspective box: ceiling, side walls, floor, back wall */}
      <polygon points={`0,0 1080,0 820,260 260,260`} fill={t.ceiling} />
      <polygon points={`0,0 260,260 260,880 0,${STAGE_H}`} fill={t.side} />
      <polygon points={`1080,0 820,260 820,880 1080,${STAGE_H}`} fill={t.side} />
      <polygon points={`260,880 820,880 1080,${STAGE_H} 0,${STAGE_H}`} fill={t.floor} />
      <rect x={260} y={260} width={560} height={620} fill={empty ? t.wall : "url(#pov-tile)"} />
      {empty ? (
        // Blueprint chalk lines + concrete seams
        <g stroke="rgba(120,180,255,0.35)" strokeWidth={3} fill="none" strokeDasharray="14 10">
          <rect x={300} y={300} width={180} height={140} />
          <path d="M300 520 H780 M560 300 V520" />
          <path d="M260 880 L0 1344 M820 880 L1080 1344 M540 880 V1344" stroke="rgba(0,0,0,0.18)" strokeDasharray="none" />
        </g>
      ) : (
        <g>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M${260 + i * 93} 880 L${-60 + i * 200} ${STAGE_H}`} stroke="rgba(0,0,0,0.18)" strokeWidth={4} />
          ))}
          <text
            x={360}
            y={360}
            fontSize={86}
            fontWeight={900}
            fontFamily={INTER}
            fill="#FF3B8D"
            opacity={flicker}
            style={{ filter: "drop-shadow(0 0 18px #FF3B8D)" }}
          >
            OPEN
          </text>
        </g>
      )}
      {/* Glass storefront door */}
      <rect x={560} y={500} width={200} height={380} fill="#1B2A36" stroke="#2A2F35" strokeWidth={12} />
      <rect x={572} y={512} width={176} height={356} fill="rgba(170,215,240,0.35)" />
      <path d="M590 540 L650 520 M590 600 L700 560" stroke="rgba(255,255,255,0.45)" strokeWidth={6} />
      <rect x={580} y={680} width={10} height={60} rx={4} fill="#C9CED6" />
      {/* Pendant lights */}
      {[380, 540, 700].map((x, i) => {
        const sway = Math.sin(frame * 0.05 + i) * 4;
        return (
          <g key={x} transform={`rotate(${sway} ${x} 0)`}>
            <line x1={x} y1={0} x2={x} y2={150} stroke="#222" strokeWidth={4} />
            <path d={`M${x - 40} 190 L${x - 18} 150 H${x + 18} L${x + 40} 190 Z`} fill="#1E1E1E" />
            <ellipse cx={x} cy={192} rx={30} ry={10} fill={t.light} />
          </g>
        );
      })}
      <rect x={0} y={0} width={1080} height={900} fill="url(#pov-glow)" />
    </svg>
  );
};

const characterPlacement = (beat: PovBeat, beatFrame: number, beatLen: number) => {
  const p = Math.min(1, beatFrame / Math.max(1, beatLen * 0.8));
  const ease = Easing.out(Easing.cubic)(p);
  if (beat.character.action === "walk-in")
    return {
      x: interpolate(ease, [0, 1], [660, 540]),
      scale: interpolate(ease, [0, 1], [0.6, 1.05]),
    };
  if (beat.character.action === "walk-across") return { x: interpolate(p, [0, 1], [200, 820]), scale: 1 };
  return { x: 540, scale: 1.05 };
};

export const PovRestaurantComposition: React.FC<{ episode: PovEpisode }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const idx = Math.max(
    0,
    episode.beats.findIndex((b) => sec >= b.startSec && sec < b.endSec),
  );
  const beatIdx = sec >= episode.durationInSeconds ? episode.beats.length - 1 : idx;
  const beat = episode.beats[beatIdx];
  const beatStart = Math.round(beat.startSec * fps);
  const beatFrame = frame - beatStart;
  const beatLen = Math.round((beat.endSec - beat.startSec) * fps);
  const prevCash = beatIdx === 0 ? episode.startingCash : episode.beats[beatIdx - 1].cash;
  const cash = interpolate(beatFrame, [0, fps * 1.2], [prevCash, beat.cash], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const enter = spring({ frame: beatFrame, fps, config: { damping: 12 } });
  const swayX = Math.sin(frame * 0.04) * 10;
  const swayR = Math.sin(frame * 0.04 + 1) * 0.6;
  const place = characterPlacement(beat, beatFrame, beatLen);
  const color = STATUS_COLOR[beat.status];
  const isChoice = beatIdx === episode.beats.length - 1 && beat.caption.includes("|");
  const choices = isChoice ? beat.caption.split("|").map((s) => s.trim()) : [];
  const popupY = interpolate(beatFrame, [0, fps * 2.5], [0, -70], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07090F", fontFamily: INTER }}>
      <SafeVoiceover file={episode.voiceoverFile} />

      {/* ---------- POV STAGE (top 70%) ---------- */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: STAGE_H,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -40,
            transform: `translateX(${swayX}px) rotate(${swayR}deg) scale(1.05)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 40,
              width: 1080,
              height: STAGE_H,
            }}
          >
            <Room theme={episode.sceneTheme} frame={frame} />
            <div
              style={{
                position: "absolute",
                left: place.x - 110,
                top: 520,
                transform: `scale(${place.scale})`,
                transformOrigin: "50% 100%",
              }}
            >
              <SvgCharacter {...beat.character} beatFrame={beatFrame} />
            </div>
          </div>
        </div>

        {/* Foreground counter edge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 150,
            background: `linear-gradient(${THEMES[episode.sceneTheme].counter}, #1A1D22)`,
            borderTop: "6px solid rgba(255,255,255,0.18)",
          }}
        />

        {beat.popupText !== "" && (
          <div
            style={{
              position: "absolute",
              top: 300 + popupY,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              transform: `scale(${enter})`,
              opacity: interpolate(beatFrame, [fps * 3, fps * 4], [1, 0.85], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                padding: "18px 40px",
                borderRadius: 999,
                background: color,
                color: "#0B0F19",
                fontSize: 78,
                fontWeight: 900,
                fontFamily: MONO,
                boxShadow: `0 0 40px ${color}88`,
              }}
            >
              {beat.popupText}
            </div>
          </div>
        )}

        <PovHands prop={beat.handProp} beatStartFrame={beatStart} cash={cash} />
      </div>

      {/* ---------- FORENSIC HUD (bottom 30%) ---------- */}
      <div
        style={{
          position: "absolute",
          top: STAGE_H,
          left: 0,
          width: 1080,
          height: HUD_H,
          background: "linear-gradient(#0D1117, #05070B)",
          borderTop: `6px solid ${color}`,
          padding: "26px 60px",
          boxSizing: "border-box",
          color: "#F5F7FA",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 28,
              letterSpacing: 2,
              color: "#8B95A5",
            }}
          >
            {episode.seriesLabel}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: "#5C6675" }}>{`T+${sec.toFixed(1)}s`}</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 28,
            marginTop: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#8B95A5",
              }}
            >
              CASH REMAINING
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 104,
                fontWeight: 800,
                lineHeight: 1,
                color: cash < episode.startingCash * 0.6 ? "#FFB020" : "#F5F7FA",
              }}
            >
              {money(cash)}
            </div>
          </div>
          {beat.delta !== 0 && (
            <div
              style={{
                transform: `scale(${enter})`,
                padding: "10px 24px",
                borderRadius: 999,
                background: `${color}22`,
                border: `3px solid ${color}`,
                color,
                fontFamily: MONO,
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              {`${beat.delta < 0 ? "−" : "+"}${money(beat.delta)}`}
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: isChoice ? 30 : 46,
            fontWeight: 900,
            lineHeight: 1.15,
            opacity: enter,
          }}
        >
          {isChoice ? "WHAT WOULD YOU DO?" : beat.caption}
        </div>
        {isChoice && (
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            {choices.map((c, i) => {
              const s = spring({
                frame: beatFrame - 8 - i * 6,
                fps,
                config: { damping: 13 },
              });
              const pulse = 1 + Math.sin(frame * 0.15 + i * Math.PI) * 0.015;
              const [letter, ...rest] = c.split(":");
              const accent = i === 0 ? "#2ECC71" : "#4DA3FF";
              return (
                <div
                  key={c}
                  style={{
                    flex: 1,
                    transform: `translateY(${(1 - s) * 60}px) scale(${pulse})`,
                    opacity: s,
                    borderRadius: 22,
                    border: `4px solid ${accent}`,
                    background: `${accent}1A`,
                    padding: "16px 22px",
                  }}
                >
                  <div style={{ fontSize: 46, fontWeight: 900, color: accent }}>{letter}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>{rest.join(":").trim()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
