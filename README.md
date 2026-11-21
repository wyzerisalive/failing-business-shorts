# Save This Failing Business — Remotion Shorts Engine

Vertical 1080×1920 · 30fps · 900 frames (30s). Built for Reels, TikTok and Shorts.
Every episode is a JSON file: swap the JSON and you get a new video. No React changes needed.

## Commands

| Command | What it does |
|---|---|
| `npm run sfx` | Synthesizes `public/sfx/{tick,alert,cash_drop,whoosh}.wav` (runs automatically before `npm run dev`) |
| `npm run dev` | Opens Remotion Studio (props are editable there via the zod schema) |
| `npm run preview` | Renders frame 720 (the A/B vote) to `out/preview.png` |
| `npm run render` | Renders Part 1 to `out/episode1-part1.mp4` |
| `npm run render:part2` | Renders Part 2 to `out/episode1-part2.mp4` |
| `npx tsc --noEmit` | Type-check |

## Making a new episode

1. Copy `src/episodes/episode1.json` (Part 1) or `episode1-part2.json` (Part 2).
2. Edit the values. `src/episodes/schema.ts` documents every field and validates it at load time.
3. Import it in `src/Root.tsx` and add it to `EPISODES`.

### Modes
- `"part1_dilemma"`: needs a `decision` block. Ends on the Option A vs. Option B cards, the 5s timer and the comment CTA.
- `"part2_outcome"`: needs an `outcome` block. Opens with a "YOU VOTED: A/B" stamp and ends on the verdict panel.

### Timeline (fixed in `src/timeline.ts`)
| Frames | Beat |
|---|---|
| 0–90 | Hook: crash zoom on the cash counter |
| 90–360 | Breakdown: chart draws in, expense bars spring in |
| 360–660 | Complication: `event` card slams in (`event.frame` → `event.exitFrame`) |
| 660–900 | Vote (part 1) or verdict (part 2). The last 24 frames zoom and flash to match frame 0, so the loop is seamless |

Cash, runway pill, avatar mood, captions (`start`/`end`, optional `wordFrames`) and all SFX cues come from the JSON.
Numbers in captions are highlighted yellow automatically. Words listed in `highlight` are shown in green.

## Safe zones
Top 180px and bottom 280px stay clear of critical UI (see `SAFE` in `src/theme.ts`).

## Notes
- Inter and JetBrains Mono (SIL OFL) are bundled in `public/fonts/`, so renders work offline.
- In sandboxed environments with no browser download access, add `--browser-executable=/path/to/chrome-headless-shell`.
