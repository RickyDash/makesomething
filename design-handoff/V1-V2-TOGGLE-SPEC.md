# V1 ⇄ V2 Toggle — Implementation Spec

Standalone spec for wiring the hidden version toggle in the live app. Written so a coding agent with NO other context can implement it. Design mockups live in this project; the live app is the real target.

## What the toggle is
- **V2** = the Monza redesign (this project's deliverable; reference: `Monza Duale Mobile.dc.html` — cream/ink/rosso "giorno" + dark/yellow "notte" modes, live circuit map with animated cars, MONZA masthead, Temple of Speed start card).
- **V1** = the original quiz UI as it exists on the live site today (faithful mockup reference: `Current Quiz (Recreation).dc.html` — dark zinc UI, Geist Mono/Space Grotesk, rounded pills, progress bar with jump markers).
- A **whisper-faint "V2" mark** sits bottom-right of the V2 UI. Tapping it swaps the ENTIRE screen to the V1 UI at the same moment of the same game. The V1 UI carries a matching faint **"V1"** mark in the same corner; tapping that returns to V2. It is an Easter egg: no label, no onboarding, mistakable for a footer/printer's mark.

## Core model: one game engine, three skins
V1 and V2 are the SAME game — identical stage skeleton, question bank, and scoring. Implement ONE state store and render it through interchangeable skins (V2-giorno, V2-notte, V1). The toggle switches the render layer only; it must never construct a second game instance.

Shared state contract (single store, survives skin switches untouched):
- `phase` — intro/start → warmup (3 formation questions) → lights sequence → reaction test (incl. jump-start retry) → race laps 1–6 (question per lap) → pit challenge at half distance → finish/results
- `warmupIndex`, `warmupAnswers[]`
- `reactionMs`, `jumpStarted`, `sessionBestMs`
- `questionIndex` (0–5), `answers[]`, `correct/wrong counts`, current verdict/banner
- `pit`: { started, sequenceProgress (FL→FR→RL→RR), penaltyMs, finalTimeMs }
- `position` / ledger (P1–P10, DNF)
- `raceSim`: car positions/laps on the circuit (V2's animated map). **Keeps ticking while V1 is displayed** even though V1 never renders it — flipping back to V2 must show the race exactly where it would have been. Timers/rAF continue; only the drawing is skipped.
- `uiVersion`: 'v2' | 'v1'
- `v2Mode`: 'giorno' | 'notte' — preserved while in V1; returning to V2 restores it.

## Per-phase mapping (both skins render every phase)
| Phase | V2 renders | V1 renders |
| --- | --- | --- |
| Start/intro | Temple of Speed card (MONZA hero, 1922 stamp, record footer) | "quick warmup before lights out." intro + start/skip buttons |
| Warm-up Q1–3 | Formation-lap sectors over live map, amber lock before reveal | "formation lap (practice)" question cards, prev/skip buttons |
| Lights | 5-light gantry overlay | lights row + "initiate starting-lights sequence" |
| Reaction | tap-anywhere at lights-out; jump ⇒ retry card | LAUNCH button; jump ⇒ "jump start. too early." + retry |
| Race lap n | question panel + live classification strip + map | lap question card + "lap n of 6" meta + progress bar |
| Pit | tap FL→FR→RL→RR on car; live clock; +300ms per wrong corner | pit stop challenge card, target label, penalty readout |
| Finish | race report end card (position, score, reaction, pit, 6-lap chart, outcome scene) | chequered-flag results screen |

Input-model differences are per-skin behaviors over the same state: V1 has explicit prev/skip/jump-marker navigation (its progress bar markers map to phase jumps); V2 flows automatically with skip only. Reaction capture: V2 = tap anywhere, V1 = LAUNCH button — both write `reactionMs`.

## The marks (both sides)
- **V2 mark (already placed in `Monza Duale Mobile.dc.html`)**: literal text `V2`, mono font of the active mode (Courier Prime giorno / IBM Plex Mono notte), 7px, weight 700, letter-spacing .24em, ink-colored at 0.4 opacity (user-calibrated final; tweakable via `v2MarkDayOp` / `v2MarkNightOp`, both default 0.4), `position:absolute; bottom:5px; right:9px`, padding 4px 6px tap target, no background/border. Fades to opacity 0 AND `pointer-events:none` during `lights` and `go` phases (any stray tap there would register as a launch/jump start). 400ms opacity transition. Press feedback: 1px translateY.
- **V1 mark (to add on the live/original side)**: same recipe in V1's own language — text `V1`, Geist Mono 10px equivalent scaled to ~7px visual, zinc-400 at ~0.4 opacity (match the V2 mark’s calibrated weight), same corner, same lights/reaction fade rule.
- The mark always shows the version you are ON; tapping goes to the other.

## Behaviors
1. Tap V2 mark → `uiVersion='v1'`; full-screen skin swap (no partial overlay), instant or ≤200ms crossfade. Game state, timers, race sim untouched.
2. Tap V1 mark → `uiVersion='v2'`; restore `v2Mode` (giorno/notte) exactly as left.
3. Mid-timed-moment switches are legal (pit clock keeps running through a swap). If implementation must guard anything, disable the mark during the lights/go window only — already the design rule.
4. Persistence: original app saved bests to device (localStorage); keep that in V1 AND let V2 read/write the same keys so bests are shared (one game, one record book). `uiVersion` may persist across sessions; default new users to v2.

## Known deltas to respect (from comparing the two references)
- V1 has no day/night mode — `v2Mode` is V2-only state.
- V1 has no circuit map/sim rendering — sim continues headless (see contract).
- V1's progress-bar jump markers (formation/lights/pit) mutate `phase`; V2 currently has no equivalent — jumps taken in V1 must land coherently when flipped back to V2 (V2 renders whatever `phase` says).
- Copy/tone differs by design (V1 lowercase zinc utility copy; V2 Monza print language). Do not harmonize.

## Suggested agent prompt
"Implement a hidden version toggle in the quiz app. The app has two full UI skins over one shared game state machine: the current production UI ('V1') and the new Monza redesign ('V2', per the attached design references). Add `uiVersion` to the store; render skins conditionally from the same state; never duplicate game logic. Add the corner marks exactly as specified in V1-V2-TOGGLE-SPEC.md §The marks, with the lights-phase fade rule. Race-sim state must keep advancing while V1 is displayed. Preserve device-persisted bests and share them across skins. Default `uiVersion` to v2."
