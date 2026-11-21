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
