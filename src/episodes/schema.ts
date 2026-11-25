import { z } from "zod";

/**
 * Episode data contract.
 * Every visual element in the video is driven from a JSON file that matches
 * this schema. To make a new episode, copy `episode1.json`, edit the values,
 * and register it in `src/Root.tsx`. No React changes needed.
 */

const keyframe = z.object({
  frame: z.number().int().min(0),
  value: z.number(),
});

const caption = z.object({
  text: z.string(),
  /** First frame the caption is on screen. */
  start: z.number().int().min(0),
  /** Last frame (exclusive) the caption is on screen. */
  end: z.number().int().min(0),
  /**
   * Optional exact frame for each word (same length as the word count).
   * If omitted, words are spread evenly across the first 60% of the caption.
   */
  wordFrames: z.array(z.number().int()).optional(),
  /** Extra words to highlight in neon green (numbers are auto-highlighted yellow). */
  highlight: z.array(z.string()).optional(),
});

const option = z.object({
  title: z.string(),
  description: z.string(),
  /** e.g. "-$3,000" or "+$800 / -20% Morale" */
  impact: z.string(),
  risk: z.enum(["LOW", "MEDIUM", "HIGH", "EXTREME"]),
});

const eventCard = z.object({
  /** Frame the card slams onto the screen. */
  frame: z.number().int().min(0),
  /** Frame it gets dismissed. */
  exitFrame: z.number().int().min(0),
  tone: z.enum(["danger", "success"]),
  sender: z.string(),
  title: z.string(),
  message: z.string(),
  amount: z.string(),
});

export const moodEnum = z.enum(["stressed", "panicked", "relieved"]);
export type Mood = z.infer<typeof moodEnum>;

export const episodeSchema = z.object({
  mode: z.enum(["part1_dilemma", "part2_outcome"]),
  episodeNumber: z.number().int(),
  /** Optional header label, e.g. "CASE #01 — PART 2". Replaces the default "EP n · PART n". */
  caseLabel: z.string().optional(),
  /** Optional voiceover in public/, e.g. "voiceover-ep2.mp3". Plays from frame 0. */
  voiceoverFile: z.string().optional(),
  business: z.object({
    name: z.string(),
    emoji: z.string(),
    tagline: z.string(),
  }),
  cash: z.object({
    /** Piecewise-linear cash path. The counter interpolates between these. */
    keyframes: z.array(keyframe).min(2),
    /** Counter flashes red when below this value. */
    lowThreshold: z.number(),
    label: z.string(),
  }),
  runway: z.object({
    initialLabel: z.string(),
    initialValue: z.string(),
    crisisLabel: z.string(),
    crisisValue: z.string(),
    /** Frame when the pill switches to the crisis copy. */
    switchFrame: z.number().int(),
  }),
  chart: z.object({
    title: z.string(),
    /** 30 daily values each. */
    revenue: z.array(z.number()).min(2),
    burn: z.array(z.number()).min(2),
  }),
  expenses: z
    .array(
      z.object({
        label: z.string(),
        amount: z.string(),
        /** 0–100: bar fill. */
        percent: z.number().min(0).max(100),
      }),
    )
    .length(3),
  moods: z.array(z.object({ from: z.number().int(), mood: moodEnum })).min(1),
  event: eventCard,
  captions: z.array(caption),

  /** part1_dilemma only. */
  decision: z
    .object({
      question: z.string(),
      optionA: option,
      optionB: option,
      cta: z.string(),
      /** Optional frame the A/B cards come in. Defaults to 660 (22s). */
      startFrame: z.number().int().min(0).optional(),
      /** Optional frame Option B's card arrives. Defaults to 8 frames after Option A. */
      optionBFrame: z.number().int().min(0).optional(),
      /** First frame of the 5-second vote timer. */
      timerStart: z.number().int(),
      timerSeconds: z.number().int().min(1),
    })
    .optional(),

  /** part2_outcome only. */
  outcome: z
    .object({
      votedChoice: z.enum(["A", "B"]),
      votedTitle: z.string(),
      votePercent: z.number().min(0).max(100).optional(),
      verdict: z.enum(["SURVIVED", "BANKRUPT", "ON LIFE SUPPORT"]),
      headline: z.string(),
      stats: z.array(z.object({ label: z.string(), value: z.string() })).max(3),
      cta: z.string(),
    })
    .optional(),
});

export type Episode = z.infer<typeof episodeSchema>;
export type Caption = z.infer<typeof caption>;
export type DecisionOption = z.infer<typeof option>;
export type EventCardData = z.infer<typeof eventCard>;
