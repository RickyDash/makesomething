# Implementation Brief — Monza V2 Redesign + V1⇄V2 Toggle

For the coding agent implementing this in the live quiz app. Read this AND `V1-V2-TOGGLE-SPEC.md` fully before writing code.

## Package contents
- `monza-v2-reference.html` — WORKING reference implementation of the V2 redesign. Self-contained; open it in a browser. It is the source of truth for layout, colors, typography, copy, spacing, animation timing, and the race-sim behavior. Its internal framework is a design-tool runtime — do NOT port its runtime; port what it renders and its sim math (plain JS + SVG, readable in-file).
- `V1-V2-TOGGLE-SPEC.md` — state contract, per-phase V1↔V2 mapping, corner-mark specs, toggle behaviors.
- `CODEX-PROMPT.md` — the kickoff prompt this brief accompanies.

## What V2 is
A full reskin + race layer for the existing quiz: cream/ink/rosso letterpress "giorno" mode and dark/yellow "notte" mode (sun/moon toggle in the header), MONZA masthead (MONZA / ITALIAN GRAND PRIX / lap line), Temple of Speed start card with 1922 stamp and record footer, live Monza circuit map with 10 animated cars, position ledger (P10→P1), classification strip, pit-stop choreography, and an illustrated race-report end card. The existing UI ("V1") stays fully intact behind the hidden toggle.

## Architecture: reuse, extend, port
1. **REUSE the app's existing game state machine** — phases, question bank, answer capture, reaction timing, pit sequence, scoring. Do not rebuild it; do not port the reference's internal state handling.
2. **EXTEND it with the position ledger** — new shared state: position P1–P10 per lap, gains/losses derived from answer correctness, snatch/defend finale scripts, DNF path. The reference's ledger logic is in its script (search `ledger`, `curveMode`). Both the map sim and the race report read ONLY from this ledger.
3. **PORT the race sim as an isolated module** (`raceSim` or similar) — car positions along the SVG track path, speed smoothing, weave, bunching, overtakes, formation choreography, pit-box hold. It is a visualization that SUBSCRIBES to game state (phase, question index, ledger, pit/skip events) and never mutates it. Lift the math + SVG paths from the reference; wrap in an adapter for your framework. It must keep ticking headless while V1 is displayed (see spec).
4. **V2 skin renders from shared state**; V1 skin untouched except its corner "V1" mark. Toggle per spec.

## Fidelity requirements
- Fonts: Bodoni Moda (italic 900 display), Libre Franklin, Courier Prime (giorno); Space Grotesk, IBM Plex Mono (notte). Load via Google Fonts or self-host.
- Match the reference pixel-for-pixel at 390×844 logical px; it must also work responsively at other phone widths (the reference is fixed-width — extend paddings/scaling sensibly, don't redesign).
- Both modes must be complete: every screen, both palettes. Mode toggle animates (sun/moon swap) and persists across sessions.
- Copy verbatim from the reference, including "The Temple of Speed", "ITALIAN GRAND PRIX", record footer "FASTEST LAP IN F1 HISTORY — SET HERE · VERSTAPPEN · 264.7 KM/H AVG · 2025", radio messages, verdict banners.
- Small-text warning: any text intended to render at 9–10.5px must use a transform-scaled span (16px base scaled down), not font-size — some browsers clamp font sizes in that range (this is why the reference does it for the masthead lap line).
- End-card outcome illustrations ship STATIC in this pass (motion pass is planned later; do not animate them).

## Acceptance checklist (test all before done)
- [ ] Full flow in V2 giorno: start card → formation Q1–3 → lights → reaction (incl. deliberate jump start → retry) → laps 1–6 with correct/wrong position changes → pit challenge at half distance (wrong-corner penalty works) → race report with correct P, score, reaction ms, pit time, 6-lap chart, outcome scene.
- [ ] Same full flow in V2 notte; toggle mid-race flips palette instantly with state intact.
- [ ] Mode choice persists (reload mid-race and after finish).
- [ ] V1 unchanged and fully playable; device-persisted bests shared between V1 and V2.
- [ ] V1⇄V2 toggle: marks render at spec opacity (0.4), fade + disable during lights/go, swap the whole screen, state/timers/sim continuous across swaps (verify pit clock and race positions survive a mid-pit swap).
- [ ] Jump taken via V1's progress markers lands coherently in V2.
- [ ] No console errors; 60fps map animation on a mid-range phone (rAF, no layout thrash).

## Out of scope
Motion pass on end-card illustrations; any V1 restyling; new game mechanics; desktop layouts beyond keeping current behavior.
