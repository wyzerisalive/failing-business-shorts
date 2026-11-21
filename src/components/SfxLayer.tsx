import { Audio } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import type { Episode } from "../episodes/schema";
import { TIMELINE } from "../timeline";

type Sfx = "tick" | "alert" | "cash_drop" | "whoosh";

const DURATION: Record<Sfx, number> = {
  tick: 6,
  alert: 40,
  cash_drop: 14,
  whoosh: 20,
};

type SfxEvent = { frame: number; sfx: Sfx; volume: number };

/** Every sound cue is derived from the episode data, so new JSON = new sound design. */
export const buildSfxEvents = (ep: Episode, fps: number): SfxEvent[] => {
  const events: SfxEvent[] = [];
  const add = (frame: number, sfx: Sfx, volume = 1) => {
    if (frame >= 0 && frame < TIMELINE.end) events.push({ frame: Math.round(frame), sfx, volume });
  };

  // Hook impact.
  add(0, "alert", 0.9);

  // Cash movement: blips during every fast segment of the cash path.
  const kf = ep.cash.keyframes;
  for (let i = 1; i < kf.length; i++) {
    const a = kf[i - 1];
    const b = kf[i];
    const frames = b.frame - a.frame;
    if (frames <= 0) continue;
    const rate = (b.value - a.value) / frames;
    if (Math.abs(rate) < 15) continue; // slow drains stay silent
    const step = rate < 0 ? 9 : 5;
    for (let f = a.frame; f < b.frame; f += step) {
      if (rate < 0) add(f, "cash_drop", 0.55);
      else add(f, "tick", 0.45);
    }
  }

  // Chart reveal.
  add(TIMELINE.hookEnd, "whoosh", 0.6);

  // Event card slam + exit.
  add(ep.event.frame - 5, "whoosh", 0.8);
  add(ep.event.frame, "alert", 1);
  add(ep.event.exitFrame, "whoosh", 0.5);

  // Final segment.
  if (ep.mode === "part1_dilemma" && ep.decision) {
    add(TIMELINE.complicationEnd + 4, "whoosh", 0.9);
    add(TIMELINE.complicationEnd + 14, "whoosh", 0.7);
    for (let s = 0; s < ep.decision.timerSeconds; s++) {
      add(ep.decision.timerStart + s * fps, "tick", 1);
    }
  }
  if (ep.mode === "part2_outcome") {
    add(TIMELINE.complicationEnd, "whoosh", 0.9);
    add(TIMELINE.complicationEnd + 6, "alert", 0.5);
  }

  // Loop point: rising whoosh into the cut back to frame 0.
  add(TIMELINE.end - 18, "whoosh", 0.7);
  return events;
};

export const SfxLayer: React.FC<{ episode: Episode }> = ({ episode }) => {
  const { fps } = useVideoConfig();
  const events = buildSfxEvents(episode, fps);
  return (
    <>
      {events.map((e, i) => (
        <Sequence
          key={`${e.sfx}-${e.frame}-${i}`}
          name={`sfx:${e.sfx}`}
          from={e.frame}
          durationInFrames={Math.min(DURATION[e.sfx], TIMELINE.end - e.frame)}
          layout="none"
        >
          <Audio src={staticFile(`sfx/${e.sfx}.wav`)} volume={e.volume} />
        </Sequence>
      ))}
    </>
  );
};
