import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "./components/Background";
import { Captions } from "./components/Captions";
import { CashCounter } from "./components/CashCounter";
import { CashFlowChart } from "./components/CashFlowChart";
import { DecisionCards } from "./components/DecisionCards";
import { EventCard } from "./components/EventCard";
import { ExpenseBars } from "./components/ExpenseBars";
import { OutcomePanel, VotedBadge } from "./components/Outcome";
import { OwnerAvatar } from "./components/OwnerAvatar";
import { HeaderBar } from "./components/HeaderBar";
import { SfxLayer } from "./components/SfxLayer";
import type { Episode } from "./episodes/schema";
import { COLORS, moodAt, valueAt } from "./theme";
import { TIMELINE, finalStart } from "./timeline";

/**
 * Layout (all y values in px; safe area is 180 → 1640):
 *   180  header
 *   390  cash counter
 *   660  chart card            | final segment: question + A/B cards + timer + CTA
 *  1060  expense bars + avatar |
 *  1440  captions (ends before 1640)
 */
const LAYOUT = {
  counterTop: 390,
  chartTop: 660,
  rowTop: 1062,
  rowHeight: 350,
  captionsTop: 1446,
  eventTop: 700,
  finalTop: 652,
};

export const FailingBusiness: React.FC<Episode> = (episode) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isPart2 = episode.mode === "part2_outcome";
  const { event } = episode;

  // ---- Camera: crash zoom in at the start, zoom back in at the end for the loop.
  const hookZoom = spring({ frame, fps, config: { damping: 200, stiffness: 90 }, durationInFrames: 50 });
  const loopZoom = interpolate(frame, [TIMELINE.end - TIMELINE.loopFrames, TIMELINE.end - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const cameraScale = interpolate(hookZoom, [0, 1], [1.9, 1]) * interpolate(loopZoom, [0, 1], [1, 1.9]);

  // ---- Flash: same color and strength at frame 0 and frame 899 → invisible loop cut.
  const loopFlashColor = isPart2
    ? episode.outcome?.votedChoice === "B"
      ? COLORS.amber
      : COLORS.cyan
    : COLORS.red;
  const startFlash = interpolate(frame, [0, 14], [0.85, 0], { extrapolateRight: "clamp" });
  const endFlash = interpolate(frame, [TIMELINE.end - 14, TIMELINE.end - 1], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eventFlash = interpolate(frame, [event.frame, event.frame + 10], [0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * (frame >= event.frame ? 1 : 0);
  const eventFlashColor = event.tone === "danger" ? COLORS.red : COLORS.emerald;

  // ---- Background mood glow.
  const cash = valueAt(frame, episode.cash.keyframes);
  const danger = Math.min(1, cash < episode.cash.lowThreshold ? 1 : frame < TIMELINE.hookEnd ? 0.7 : 0.3);
  const success = isPart2 && frame >= event.frame && event.tone === "success" ? 1 : 0;

  // ---- Dashboard dims while the event card or the final segment is on screen.
  const eventActive = frame >= event.frame && frame <= event.exitFrame + 10;
  const finalIn = interpolate(frame, [finalStart(episode), finalStart(episode) + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOpacity = (eventActive ? 0.3 : 1) * (1 - finalIn);
  const dashEnter = interpolate(frame, [TIMELINE.hookEnd - 20, TIMELINE.hookEnd + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ---- Avatar mood.
  const mood = moodAt(frame, episode.moods);
  const moodChangedAt = [...episode.moods].reverse().find((m) => frame >= m.from)?.from ?? 0;

  // ---- Header badge.
  const outcome = episode.outcome;
  const badge =
    isPart2 && outcome
      ? frame < event.frame
        ? { text: `YOU VOTED: ${outcome.votedChoice}`, color: outcome.votedChoice === "A" ? COLORS.cyan : COLORS.amber }
        : outcome.verdict === "SURVIVED"
          ? { text: "CRISIS AVERTED", color: COLORS.emerald }
          : { text: "SHOP CLOSED", color: COLORS.red }
      : { text: "CRITICAL ALERT", color: COLORS.red };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <Background danger={danger} success={success} />

      <AbsoluteFill
        style={{
          scale: String(cameraScale),
          transformOrigin: `50% ${LAYOUT.counterTop + 130}px`,
        }}
      >
        <HeaderBar episode={episode} badgeText={badge.text} badgeColor={badge.color} />
        <CashCounter episode={episode} top={LAYOUT.counterTop} />

        {/* Dashboard: chart + expenses + avatar */}
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: LAYOUT.chartTop,
            opacity: dashOpacity * dashEnter,
            translate: `0px ${interpolate(dashEnter, [0, 1], [80, 0])}px`,
            filter: eventActive ? "blur(3px)" : undefined,
          }}
        >
          <CashFlowChart
            title={episode.chart.title}
            revenue={episode.chart.revenue}
            burn={episode.chart.burn}
            drawStart={TIMELINE.hookEnd + 4}
            drawFrames={130}
          />
          <div
            style={{
              position: "absolute",
              top: LAYOUT.rowTop - LAYOUT.chartTop,
              left: 0,
              right: 0,
              height: LAYOUT.rowHeight,
              display: "flex",
              gap: 20,
            }}
          >
            <ExpenseBars expenses={episode.expenses} start={TIMELINE.hookEnd + 50} width={560} />
            <OwnerAvatar mood={mood} moodChangedAt={moodChangedAt} width={380} />
          </div>
        </div>

        <EventCard event={event} top={LAYOUT.eventTop} />

        {episode.mode === "part1_dilemma" && episode.decision && (
          <DecisionCards
            decision={episode.decision}
            from={finalStart(episode)}
            top={LAYOUT.finalTop}
            cardsHeight={480}
          />
        )}
        {isPart2 && outcome && (
          <>
            <VotedBadge outcome={outcome} top={720} exitFrom={TIMELINE.hookEnd - 14} />
            <OutcomePanel outcome={outcome} from={TIMELINE.complicationEnd} top={LAYOUT.finalTop + 20} />
          </>
        )}
      </AbsoluteFill>

      {/* Captions stay outside the camera so they're always readable. */}
      <Captions captions={episode.captions} top={LAYOUT.captionsTop} />

      <AbsoluteFill style={{ backgroundColor: eventFlashColor, opacity: eventFlash, pointerEvents: "none" }} />
      <AbsoluteFill
        style={{ backgroundColor: loopFlashColor, opacity: Math.max(startFlash, endFlash), mixBlendMode: "screen" }}
      />

      <SfxLayer episode={episode} />
      {episode.voiceoverFile ? <Audio src={staticFile(episode.voiceoverFile)} /> : null}
    </AbsoluteFill>
  );
};
