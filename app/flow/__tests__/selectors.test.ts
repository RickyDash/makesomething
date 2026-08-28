import { describe, expect, it } from "vitest";

import type { FlowState } from "../types";
import {
  selectCurrentLapLedgerEntry,
  selectDisplayedRacePosition,
  selectFinishChips,
  selectPitComplete,
  selectPitSkipVisible,
  selectPitWarning,
  selectRaceCounts,
  selectStartComplete,
  selectStartSkipVisible,
  selectStartWarning,
  selectVersionMarkEnabled,
} from "../selectors";

const baseState: FlowState = {
  stage: "formation",
  formationMode: "drill",
  uiVersion: "v2",
  v2Mode: "giorno",
  difficulty: "beginner",
  tutorialStep: 0,
  tutorialAnswers: [null, null, null],
  weekendQuestions: [
    { prompt: "q", options: ["a"], answer: 0, fact: "f", event: "e" },
  ],
  currentLap: 0,
  lapAnswers: [null],
  raceCurve: "defend",
  raceLedger: [
    { lapIndex: 0, result: null, before: 10, after: 10, delta: 0 },
  ],
  currentPosition: 10,
  finalPosition: null,
  racePresentation: {
    phase: "question",
    verdict: null,
    banner: null,
  },
  startDrill: {
    resultMs: null,
    attemptStarted: false,
    needsAttention: false,
    phase: "idle",
    lightsOnCount: 0,
  },
  pitStop: {
    resultMs: null,
    attemptStarted: false,
    needsAttention: false,
    phase: "idle",
    step: 0,
    penaltyMs: 0,
    message: "pit window open. hit begin when you're ready.",
  },
  bestReactionMs: null,
  bestScore: 0,
};

describe("flow selectors", () => {
  it("derives completion, warning, and skip visibility from result + attention", () => {
    expect(selectStartComplete(baseState)).toBe(false);
    expect(selectPitComplete(baseState)).toBe(false);
    expect(selectStartWarning(baseState)).toBe(false);
    expect(selectPitWarning(baseState)).toBe(false);
    expect(selectStartSkipVisible(baseState)).toBe(true);
    expect(selectPitSkipVisible(baseState)).toBe(true);

    const warningState: FlowState = {
      ...baseState,
      startDrill: { ...baseState.startDrill, needsAttention: true },
      pitStop: { ...baseState.pitStop, needsAttention: true },
    };

    expect(selectStartWarning(warningState)).toBe(true);
    expect(selectPitWarning(warningState)).toBe(true);
  });

  it("returns finish chips based on completion-only state", () => {
    const incomplete = selectFinishChips(baseState);
    expect(incomplete.startDrill.kind).toBe("fallback");
    expect(incomplete.pitStop.kind).toBe("fallback");

    const completeState: FlowState = {
      ...baseState,
      startDrill: { ...baseState.startDrill, resultMs: 250 },
      pitStop: { ...baseState.pitStop, resultMs: 1800 },
    };

    const complete = selectFinishChips(completeState);
    expect(complete.startDrill.kind).toBe("time");
    expect(complete.startDrill.timeMs).toBe(250);
    expect(complete.pitStop.kind).toBe("time");
    expect(complete.pitStop.timeMs).toBe(1800);
  });

  it("selects race counts, position, current ledger entry, and mark availability", () => {
    const raceState: FlowState = {
      ...baseState,
      stage: "race",
      formationMode: "intro",
      lapAnswers: [0],
      raceLedger: [
        { lapIndex: 0, result: "correct", before: 10, after: 8, delta: 2 },
      ],
      currentPosition: 8,
      racePresentation: {
        phase: "result",
        verdict: "correct",
        banner: { text: "CLEAN PASS", sub: "", tone: "good" },
      },
    };

    expect(selectRaceCounts(raceState)).toEqual({ correct: 1, wrong: 0 });
    expect(selectDisplayedRacePosition(raceState)).toBe(8);
    expect(selectCurrentLapLedgerEntry(raceState)).toEqual(raceState.raceLedger[0]);
    expect(selectVersionMarkEnabled(raceState)).toBe(true);

    const finishedState: FlowState = {
      ...baseState,
      stage: "finished",
      finalPosition: "DNF",
      racePresentation: { phase: "finish", verdict: null, banner: null },
    };
    expect(selectDisplayedRacePosition(finishedState)).toBe("DNF");
  });
});
