export type PovRole = "landlord" | "contractor" | "chef" | "customer";
export type PovAction = "walk-in" | "walk-across" | "idle-talk";
export type PovHandProp = "keys" | "pen-contract" | "blueprint" | "calculator";
export type PovStatus = "neutral" | "danger" | "warning" | "success";
export type PovSceneTheme = "empty-storefront" | "open-kitchen";

export interface PovBeat {
  startSec: number;
  endSec: number;
  caption: string;
  /** Cash balance once this beat lands. */
  cash: number;
  /** Change shown in the delta pill. */
  delta: number;
  status: PovStatus;
  character: { role: PovRole; action: PovAction; icon: string };
  handProp: PovHandProp;
  /** Floating badge text; empty string hides it. */
  popupText: string;
}

export interface PovEpisode {
  id: string;
  seriesLabel: string;
  title: string;
  sceneTheme: PovSceneTheme;
  /** File name inside public/. Skipped silently if missing. */
  voiceoverFile?: string;
  durationInSeconds: number;
  startingCash: number;
  endingCash: number;
  beats: PovBeat[];
}

export const RESTAURANT_POV_EPISODES: PovEpisode[] = [
  {
    id: "ep01-empty-storefront",
    seriesLabel: "POV: BUILDING A RESTAURANT — EP 1",
    title: "Signing the Empty Storefront",
    sceneTheme: "empty-storefront",
    voiceoverFile: "pov-ep1.mp3",
    durationInSeconds: 30,
    startingCash: 25000,
    endingCash: 13500,
    beats: [
      {
        startSec: 0,
        endSec: 4,
        caption: "DAY 1: $25,000 SEED BUDGET",
        cash: 25000,
        delta: 0,
        status: "neutral",
        character: { role: "landlord", action: "walk-in", icon: "🔑" },
        handProp: "keys",
        popupText: "",
      },
      {
        startSec: 4,
        endSec: 12,
        caption: "LEASE DEPOSIT + FIRST MONTH: -$6,500",
        cash: 18500,
        delta: -6500,
        status: "danger",
        character: { role: "landlord", action: "idle-talk", icon: "📄" },
        handProp: "pen-contract",
        popupText: "-$6,500",
      },
      {
        startSec: 12,
        endSec: 21,
        caption: "PERMITS, HOOD & PLUMBING ROUGH-IN: -$5,000",
        cash: 13500,
        delta: -5000,
        status: "danger",
        character: { role: "contractor", action: "walk-across", icon: "🛠️" },
        handProp: "blueprint",
        popupText: "-$5,000",
      },
      {
        startSec: 21,
        endSec: 30,
        caption: "A: USED KITCHEN GEAR ($4K)  |  B: LEASE NEW ($600/MO)",
        cash: 13500,
        delta: -11500,
        status: "warning",
        character: { role: "contractor", action: "idle-talk", icon: "❓" },
        handProp: "calculator",
        popupText: "$13,500 LEFT",
      },
    ],
  },
];
