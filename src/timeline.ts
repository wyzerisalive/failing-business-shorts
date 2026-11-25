import type { Episode } from "./episodes/schema";

/** Fixed beat structure shared by every episode (900 frames @ 30fps). */
export const TIMELINE = {
  /** 0–3s: hook, crash zoom on the cash counter. */
  hookEnd: 90,
  /** 3–12s: chart + expense bars. */
  breakdownEnd: 360,
  /** 12–22s: event card. */
  complicationEnd: 660,
  /** 22–30s: vote (part1) or verdict (part2), then loop. */
  end: 900,
  /** Frames at each end used to hide the loop cut. */
  loopFrames: 24,
} as const;

/** First frame of the final segment: the vote's own startFrame if set, else 22s. */
export const finalStart = (ep: Episode): number =>
  ep.decision?.startFrame ?? TIMELINE.complicationEnd;
