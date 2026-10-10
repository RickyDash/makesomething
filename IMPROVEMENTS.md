# Improvements backlog

Running list of proposed changes that are not yet decided or built. Statuses: `parked` (proposal written, decision deferred), `open` (agreed problem, no proposal yet), `idea`, `in progress`, `done`. QA row ids (IOS-nn) refer to `design-qa-ios.md`.

## Parked with proposed wording (revisit together)

The user asked to see every string before it lands. These were drafted on 2026-09-20 and deferred, not rejected. Current text on the left, proposed on the right.

### Race report (IOS-43, IOS-29 copy part) — `parked`

| Where | Now | Proposed |
|---|---|---|
| Reaction tile label | `REACTION` / `1758ms` | `LAUNCH` / `1.758s` (seconds with 3 dp, like the pit tile's `2.30s`) |
| Report footer | `BEST REACTION 1.758S · PIT +300MS PENALTY · GRID P10` | `SESSION BEST LAUNCH 1.758S · PIT +300MS PENALTY · GRID P10` |
| Report subtitle | `4 of 6 correct · defend-the-lead script` | `4 of 6 correct · P10 → P5` (DNF: `0 of 6 correct · retired from P10`) |
| Reaction card, first attempt | `SESSION BEST 1.758S` under the identical `1.758s` | line hidden; shown only after a retry when it differs, e.g. `SESSION BEST 1.758S · 1 JUMP START` |

Code: `components/monza-v2/MonzaV2Skin.tsx` FinishReport tiles (`finishStats`), `finishActions` footer, `finishSub`, ReactionCard `sessionBest`. Tests that pin current strings: `tests/e2e/monza-v2-flow.spec.ts` (`"3 of 6 correct"`, `${reactionMs}ms`), `tests/e2e/monza-v2-helpers.ts:143` (`/1 jump start/`).

### During the race (IOS-41, IOS-29) — `parked`

| Where | Now | Proposed |
|---|---|---|
| Row under every question | `SIM · defend curve · 2✓ 1✕ · ledger P8` | `2 RIGHT · 1 WRONG · RUNNING P8` (before any answer: `NO CALLS YET · RUNNING P10`) |
| Category chip | `TRACK MAP` (reads as a stage name) | `THEME · TRACK MAP` |
| Warm-up counter | `W 1 / 3` | `WARM-UP 1 / 3` |
| Header stage label | `FORM`, `FIN` | `FORMATION`, `FINISH` (`GRID`, `PIT`, `LAP 1/6` unchanged) |

Code: `MonzaV2Skin.tsx` QuizPanel `.raceFooter`, `.eventChip`, WarmupOverlay meta row, `lapLabel`. Keep the `.raceFooter` element (the responsive e2e measures it). The header `<em>` has no width limit; `FORMATION` fits within the masthead's width.

### Missed start (IOS-14, IOS-20) — `parked`

Cap the GO phase at 3 s; after that the attempt is a missed start, not a jump start.

| Skin | Proposed |
|---|---|
| V2 card | heading `Missed the start`, line `LIGHTS WENT OUT — THE FIELD LEFT WITHOUT YOU`, button `RETRY THE START` |
| V1 line | `missed the start. too slow.` with the existing `retry starting-lights sequence` button |

Implementation notes: schedule the miss timer inside `startReactionSequence`'s `onGo` in `app/page.tsx` (keeps `app/flow/timing.ts` and its `toEqual` timeline tests intact); add `START_DRILL_MISSED` to `app/flow/events.ts` with a `"missed"` phase in `app/flow/types.ts` and a reducer case mirroring `START_DRILL_EARLY`; `showJump` in `MonzaV2Skin.tsx` branches on copy; do not increment `jumpStartCount`; `completeLaunchWithJumpRetry` in the e2e helpers must still tap within 3 s of `GO GO GO`. Also removes the five-digit tile overflow (IOS-20).

### CTA voids (IOS-33) — `parked`

Replace `margin-top: auto` on `.lowerOverlay > .primaryButton` and `.finishActions` (`components/monza-v2/monza-v2.module.css`) with a bounded gap such as `clamp(16px, 5vh, 48px)`, so NEXT / BEGIN THE STOP / RUN ANOTHER GRAND PRIX follow their content instead of pinning to the bottom of tall phones. No copy involved.

### Sibling venue prompts — `parked`

The other 14 questions of the form "Which country hosts the X Grand Prix circuit?" (`app/f1-question-bank.ts`, the `track map` block) share the imprecision fixed for Monza; some read awkwardly ("the Baku City Circuit Grand Prix circuit"). Proposed: "In which country is the X circuit?" across the family, facts and options untouched. Decided 2026-09-20: Monza only for now.

Decided and kept as-is: the "Temple of Speed" question stays even though the intro card names it.

## Open design and copy rows (need a `/design` canvas)

| Row | Problem | Status |
|---|---|---|
| IOS-41, IOS-26 | `SKIP »` means "abandon all warm-ups" on warm-ups and "fast-forward the replay" during the race, and sits over the finish straight on the map | `open` |
| IOS-25, IOS-27, IOS-13 | Driver tags collide when the pack bunches; the map banner hides the pack on the Lesmo straight; tags clip at the map's top edge | `open` |
| IOS-40 | Header position and classification jump before the lap animation reveals the verdict | `open` |
| IOS-21 | iPhone SE shows two of four options with no scroll cue | `open` |
| IOS-08 | Landscape layout to replace the rotate-your-phone notice | `open` |
| Desktop V2 | Two-pane layout from 960 px, widened column 640–959 px | `done` (Phase 3b, verified locally 2026-10-10) |

Phase 3b keeps the phone rules and all game copy unchanged. Wide layouts now contain the warm-up, pit and reaction cards in the correct pane, use a two-column race report, and keep questions usable in short tablet-width desktop windows. Regression coverage lives in `tests/e2e/monza-v2-wide-layout.spec.ts` and runs in Chromium and touch WebKit alongside the existing phone and full-flow checks. No deployment is part of this completion.

## Second iOS pass (not yet covered)

Safari tab-bar layouts (iOS 26 Compact / Bottom / Top), Page Zoom 150 %, VoiceOver order and announcements, back-forward cache restore, memory-warning reload, iPad column, audio audibility. Cheap now that `scripts/ios-sim.sh` exists.

## Housekeeping

- Uncommitted policy edit in `AGENTS.md`.
- Whether `output/` screenshots (≈130 files) should be git-ignored or curated into the repo.
- Untracked `scripts/export-question-bank-to-csv.mjs`.
- `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` so the native simulator tool can attach.

## Larger ideas

- Animated finish end-cards (`work/link-to-action/endcard-animation-*/assessment.md`). Prerequisite: move the position and points labels out of the SVG into live overlays.
