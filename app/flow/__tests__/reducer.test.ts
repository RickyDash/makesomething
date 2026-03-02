import { describe, expect, it } from "vitest";

import type { Question } from "../../f1-question-bank";
import { flowReducer, createInitialFlowState } from "../reducer";
import {
  selectFinishChips,
  selectPitComplete,
  selectPitWarning,
  selectStartComplete,
  selectStartSkipVisible,
  selectStartWarning,
} from "../selectors";

const makeQuestions = (): Question[] =>
  Array.from({ length: 6 }, (_, index) => ({
    prompt: `question ${index + 1}`,
    options: ["a", "b", "c"],
    answer: index % 3,
    fact: `fact ${index + 1}`,
    event: `event ${index + 1}`,
  }));

const makeState = () =>
  createInitialFlowState({
    weekendQuestions: makeQuestions(),
    tutorialStepCount: 3,
    bestReactionMs: null,
    bestScore: 0,
  });

const run = (
  state = makeState(),
  events: Parameters<typeof flowReducer>[1][],
) => events.reduce((current, event) => flowReducer(current, event), state);

const moveToStartDrill = (state = makeState()) =>
  run(state, [
    { type: "START_FORMATION_TUTORIAL" },
    { type: "TUTORIAL_NEXT" },
    { type: "TUTORIAL_NEXT" },
    { type: "TUTORIAL_NEXT" },
  ]);

describe("flow reducer", () => {
  it("keeps first arrival to start drill clean (no incomplete warning)", () => {
    const state = moveToStartDrill();
    expect(state.stage).toBe("formation");
    expect(state.formationMode).toBe("drill");
    expect(selectStartWarning(state)).toBe(false);
  });

  it("preserves completed start drill when re-entering via briefing next and marker nav", () => {
    const completed = run(moveToStartDrill(), [
      { type: "START_DRILL_INITIATE" },
      { type: "START_DRILL_GO" },
      { type: "START_DRILL_COMPLETE", timeMs: 287 },
    ]);

    const fromBriefingNext = run(completed, [
      { type: "NAVIGATE", target: { kind: "tutorial", stepIndex: 2 } },
      { type: "TUTORIAL_NEXT" },
    ]);

    const fromMarker = run(fromBriefingNext, [{ type: "NAVIGATE", target: { kind: "formation_drill" } }]);

    expect(selectStartComplete(fromMarker)).toBe(true);
    expect(fromMarker.stage).toBe("formation");
    expect(fromMarker.formationMode).toBe("drill");
    expect(fromMarker.startDrill.resultMs).toBe(287);
    expect(selectStartWarning(fromMarker)).toBe(false);
  });

  it("marks start drill warning after forward pass while incomplete", () => {
    const state = run(moveToStartDrill(), [
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
      { type: "NAVIGATE", target: { kind: "formation_drill" } },
    ]);

    expect(selectStartComplete(state)).toBe(false);
    expect(selectStartWarning(state)).toBe(true);
    expect(selectStartSkipVisible(state)).toBe(true);
  });

  it("marks start drill warning after start then leaving backward incomplete", () => {
    const state = run(moveToStartDrill(), [
      { type: "START_DRILL_INITIATE" },
      { type: "NAVIGATE", target: { kind: "tutorial", stepIndex: 2 } },
      { type: "NAVIGATE", target: { kind: "formation_drill" } },
    ]);

    expect(selectStartComplete(state)).toBe(false);
    expect(selectStartWarning(state)).toBe(true);
  });

  it("applies pit-stop warning rules for pass-ahead and start-then-leave", () => {
    const passAhead = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 3 } },
      { type: "NAVIGATE", target: { kind: "pitstop" } },
    ]);

    const startedThenLeft = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "PIT_BEGIN" },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 2 } },
      { type: "NAVIGATE", target: { kind: "pitstop" } },
    ]);

    expect(selectPitWarning(passAhead)).toBe(true);
    expect(selectPitComplete(passAhead)).toBe(false);
    expect(selectPitWarning(startedThenLeft)).toBe(true);
    expect(selectPitComplete(startedThenLeft)).toBe(false);
  });

  it("keeps skip action incomplete and uses finish summary fallback labels", () => {
    const skippedState = run(moveToStartDrill(), [
      { type: "START_DRILL_SKIP" },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
    ]);

    const incompleteFinishChips = selectFinishChips(skippedState);
    expect(selectStartComplete(skippedState)).toBe(false);
    expect(selectStartSkipVisible(skippedState)).toBe(true);
    expect(incompleteFinishChips.startDrill.kind).toBe("fallback");
    expect(incompleteFinishChips.startDrill.label).toBe("start-drill skipped");

    const completedBoth = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "formation_drill" } },
      { type: "START_DRILL_COMPLETE", timeMs: 261 },
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "PIT_COMPLETE", timeMs: 1720 },
    ]);

    const completeFinishChips = selectFinishChips(completedBoth);
    expect(completeFinishChips.startDrill.kind).toBe("time");
    expect(completeFinishChips.startDrill.timeMs).toBe(261);
    expect(completeFinishChips.pitStop.kind).toBe("time");
    expect(completeFinishChips.pitStop.timeMs).toBe(1720);
  });
});
