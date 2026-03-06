# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js + Turbopack)
npm run build        # Production build (also runs TypeScript checks)
npm run lint         # ESLint on app/, components/, and tests/
npm run test         # Vitest unit tests (one-shot)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright end-to-end tests
```

Run a single test file: `npx vitest run app/flow/__tests__/reducer.test.ts`

## Architecture

This is an **F1 Quiz Grand Prix** app — a single-page interactive quiz game themed as a Formula 1 race weekend. Built with Next.js 16 (App Router), HeroUI components, Tailwind CSS 4, and Framer Motion.

### The flow state machine (`app/flow/`)

The game progresses through stages managed by a `useReducer` in `app/page.tsx`:

- **`types.ts`** — `FlowState` is the central state shape. Stages: `formation` → `race` → `pitstop` → `finish_intro` → `finished`. Formation has sub-modes: `intro` → `briefing` → `drill`.
- **`events.ts`** — Discriminated union of all `FlowEvent` types (NAVIGATE, RACE_PICK, PIT_CLICK, etc.)
- **`reducer.ts`** — Pure reducer with `createInitialFlowState()` factory. Handles all stage transitions, navigation between track cards, and state updates. Calls `assertFlowInvariants` after every dispatch.
- **`invariants.ts`** — Runtime assertions that validate FlowState consistency (e.g., drill phase must be idle outside drill screen, currentLap must be in range).
- **`selectors.ts`** — Derived state selectors (`selectStartComplete`, `selectPitComplete`, `selectFinishChips`, etc.)

### Main page (`app/page.tsx` ~2000 lines)

This single file contains the entire game UI. Key sections:
- **Utility functions** (top) — scoring, feedback text, track geometry helpers like `getSegmentCheckpoints` and `clampToSegment`
- **Component body** — `useReducer` for flow state, `useMemo` chains for derived values (track positions, marker states, checkpoints), side effects for timers/sounds/localStorage
- **Track bar** — A horizontal progress bar with animated fill bars, clickable checkpoint markers (diamonds for tutorial, circles for race laps), a persistent checkered finish diamond, a car that stays visible into finish states, and DNF-only crash accents/`❌` overlays
- **Card stages** — Conditional rendering blocks for each stage: formation intro, tutorial cards, start drill (reaction time), race lap cards, pit stop challenge (tyre-clicking minigame), and finish/report variants for podium, points, backmarker, and DNF outcomes

### Question bank (`app/f1-question-bank.ts`)

Pool of F1 trivia questions with `prompt`, `options`, `answer` (index), `fact`, and `event` tag. `getRandomWeekendQuestions()` shuffles and picks a subset for each race. Answer options are shuffled at runtime.

### Track geometry model

The track bar maps game progress to a 0–100% horizontal range:
- `formationAnchor` (0%) → `grandPrixMarkerPos` (~24% desktop, ~33% mobile) → `pitStopMarkerPos` (computed from lap ratio) → `finishMarkerPos` (100%)
- Checkpoints are distributed within segments using `getSegmentCheckpoints()` with edge insets
- `currentTrackPercent` is a memo that resolves the car's position based on stage, lap, and finish outcome
- Successful finishes park the mirrored car at the end marker; DNF finishes stop short and add smoke/wrench crash accents plus a finish-marker `❌`

## Commit Preferences

- Never add "Co-Authored-By" lines to commit messages

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **React 19** (client-side only — the page is `"use client"`)
- **HeroUI** (`@heroui/react`) for Button, Card, Chip components
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Framer Motion** for all animations (`motion.div`)
- **Vitest** for unit tests (config includes only `app/**/*.test.ts`)
- **Playwright** for e2e tests (`tests/e2e/`)
- Path alias: `@/*` maps to project root
