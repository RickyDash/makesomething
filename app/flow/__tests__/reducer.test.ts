import { describe, expect, it, vi } from "vitest";

import type { Question } from "../../f1-question-bank";
import {
  flowReducer,
  createInitialFlowState,
  getLedgerPosition,
} from "../reducer";
import {
  selectDisplayedRacePosition,
  selectFinishChips,
  selectPitComplete,
  selectRaceCounts,
  selectPitWarning,
  selectStartComplete,
  selectStartSkipVisible,
  selectStartWarning,
  selectVersionMarkEnabled,
} from "../selectors";
import type { RaceCurve } from "../types";

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
    raceCurve: "defend",
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

  it("clears the prior pit result when retrying and allows progression during the new attempt", () => {
    const retried = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "PIT_COMPLETE", timeMs: 1720 },
      { type: "PIT_RETRY" },
      { type: "PIT_ADVANCE" },
    ]);

    expect(retried.pitStop.resultMs).toBeNull();
    expect(retried.pitStop.phase).toBe("running");
    expect(retried.pitStop.step).toBe(1);
    expect(retried.pitStop.penaltyMs).toBe(0);
    expect(retried.pitStop.needsAttention).toBe(false);
    expect(selectPitComplete(retried)).toBe(false);
    expect(selectPitWarning(retried)).toBe(false);
  });

  it("clears pit warnings when beginning or retrying a new attempt", () => {
    const warned = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 3 } },
      { type: "NAVIGATE", target: { kind: "pitstop" } },
    ]);

    expect(selectPitWarning(warned)).toBe(true);

    const begun = run(warned, [{ type: "PIT_BEGIN" }]);
    expect(begun.pitStop.needsAttention).toBe(false);
    expect(selectPitWarning(begun)).toBe(false);

    const retried = run(
      run(begun, [{ type: "PIT_COMPLETE", timeMs: 1720 }]),
      [{ type: "PIT_RETRY" }],
    );
    expect(retried.pitStop.needsAttention).toBe(false);
    expect(selectPitWarning(retried)).toBe(false);
  });

  it("overwrites pit score on a newly completed retry", () => {
    const completedRetry = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "PIT_COMPLETE", timeMs: 1720 },
      { type: "PIT_RETRY" },
      { type: "PIT_COMPLETE", timeMs: 1810 },
    ]);

    expect(completedRetry.pitStop.resultMs).toBe(1810);
    expect(completedRetry.pitStop.phase).toBe("idle");
    expect(selectPitComplete(completedRetry)).toBe(true);
    expect(selectPitWarning(completedRetry)).toBe(false);
  });

  it("marks an abandoned retry incomplete instead of restoring the stale completion", () => {
    const leftMidRetry = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "pitstop" } },
      { type: "PIT_COMPLETE", timeMs: 1720 },
      { type: "PIT_RETRY" },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 2 } },
      { type: "NAVIGATE", target: { kind: "pitstop" } },
    ]);

    expect(leftMidRetry.pitStop.resultMs).toBeNull();
    expect(selectPitComplete(leftMidRetry)).toBe(false);
    expect(selectPitWarning(leftMidRetry)).toBe(true);
    expect(leftMidRetry.pitStop.phase).toBe("idle");
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

const answerRace = (curve: RaceCurve, correctAnswers: number) => {
  let state = createInitialFlowState({
    weekendQuestions: makeQuestions(),
    tutorialStepCount: 3,
    bestReactionMs: null,
    bestScore: 0,
    raceCurve: curve,
  });

  for (let lapIndex = 0; lapIndex < state.weekendQuestions.length; lapIndex += 1) {
    const question = state.weekendQuestions[lapIndex];
    const optionIndex =
      lapIndex < correctAnswers
        ? question.answer
        : (question.answer + 1) % question.options.length;
    state = run(state, [
      { type: "NAVIGATE", target: { kind: "lap", lapIndex } },
      { type: "RACE_PICK", optionIndex },
    ]);
  }

  return flowReducer(state, { type: "START_FINISH_INTRO" });
};

describe("Monza shared race state", () => {
  it("uses the exact defend and snatch ledger formulas", () => {
    expect(
      Array.from({ length: 7 }, (_, correctCount) =>
        getLedgerPosition(correctCount, 6 - correctCount, "defend"),
      ),
    ).toEqual([10, 10, 10, 8, 5, 2, 1]);

    expect(
      Array.from({ length: 7 }, (_, correctCount) =>
        getLedgerPosition(correctCount, 6 - correctCount, "snatch"),
      ),
    ).toEqual([10, 10, 10, 8, 6, 3, 1]);
  });

  it.each([
    ["defend", ["DNF", 10, 10, 8, 5, 2, 1]],
    ["snatch", ["DNF", 10, 10, 8, 6, 3, 1]],
  ] as const)("produces the reference final classification for %s", (curve, expected) => {
    const classifications = Array.from(
      { length: 7 },
      (_, correctAnswers) => answerRace(curve, correctAnswers).finalPosition,
    );

    expect(classifications).toEqual(expected);
  });

  it("recomputes all six ledger entries in lap order after out-of-order V1 navigation", () => {
    const questions = makeQuestions();
    const lapFiveWrong = (questions[5].answer + 1) % questions[5].options.length;

    const lateFirst = run(
      createInitialFlowState({
        weekendQuestions: questions,
        tutorialStepCount: 3,
        bestReactionMs: null,
        bestScore: 0,
        raceCurve: "defend",
      }),
      [
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 5 } },
        { type: "RACE_PICK", optionIndex: lapFiveWrong },
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 2 } },
        { type: "RACE_PICK", optionIndex: questions[2].answer },
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
        { type: "RACE_PICK", optionIndex: questions[0].answer },
      ],
    );

    const earlyFirst = run(
      createInitialFlowState({
        weekendQuestions: questions,
        tutorialStepCount: 3,
        bestReactionMs: null,
        bestScore: 0,
        raceCurve: "defend",
      }),
      [
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
        { type: "RACE_PICK", optionIndex: questions[0].answer },
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 2 } },
        { type: "RACE_PICK", optionIndex: questions[2].answer },
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 5 } },
        { type: "RACE_PICK", optionIndex: lapFiveWrong },
      ],
    );

    expect(lateFirst.raceLedger).toEqual(earlyFirst.raceLedger);
    expect(lateFirst.raceLedger).toEqual([
      { lapIndex: 0, result: "correct", before: 10, after: 8, delta: 2 },
      { lapIndex: 1, result: null, before: 8, after: 8, delta: 0 },
      { lapIndex: 2, result: "correct", before: 8, after: 6, delta: 2 },
      { lapIndex: 3, result: null, before: 6, after: 6, delta: 0 },
      { lapIndex: 4, result: null, before: 6, after: 6, delta: 0 },
      { lapIndex: 5, result: "wrong", before: 6, after: 7, delta: -1 },
    ]);
    expect(lateFirst.currentPosition).toBe(7);
    expect(selectRaceCounts(lateFirst)).toEqual({ correct: 2, wrong: 1 });
  });

  it("exposes lap, verdict, banner, reset, and marker-reentry presentation states", () => {
    const questions = makeQuestions();
    const picked = run(
      createInitialFlowState({
        weekendQuestions: questions,
        tutorialStepCount: 3,
        bestReactionMs: null,
        bestScore: 0,
        raceCurve: "defend",
      }),
      [
        { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
        { type: "RACE_PICK", optionIndex: questions[0].answer },
      ],
    );

    expect(picked.racePresentation).toEqual({
      phase: "lap",
      verdict: null,
      banner: null,
    });

    const revealed = flowReducer(picked, { type: "RACE_REVEAL" });
    expect(revealed.racePresentation).toEqual({
      phase: "result",
      verdict: "correct",
      banner: {
        text: "CLEAN PASS — UP 2 INTO THE RETTIFILO",
        sub: "",
        tone: "good",
      },
    });

    const reset = flowReducer(revealed, { type: "RACE_RESET_PRESENTATION" });
    expect(reset.racePresentation).toEqual({
      phase: "question",
      verdict: null,
      banner: null,
    });

    const reentered = run(reset, [
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 1 } },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
    ]);
    expect(reentered.racePresentation).toEqual(revealed.racePresentation);
  });

  it("publishes DNF during a scoreless finish intro and the finish presentation afterward", () => {
    const dnfIntro = flowReducer(makeState(), { type: "START_FINISH_INTRO" });

    expect(dnfIntro.stage).toBe("finish_intro");
    expect(dnfIntro.currentPosition).toBe(10);
    expect(dnfIntro.finalPosition).toBe("DNF");
    expect(selectDisplayedRacePosition(dnfIntro)).toBe("DNF");
    expect(dnfIntro.racePresentation).toEqual({
      phase: "dnf",
      verdict: null,
      banner: {
        text: "RETIRING THE CAR",
        sub: "TOO MUCH DAMAGE · DNF",
        tone: "bad",
      },
    });

    const finished = flowReducer(dnfIntro, { type: "FINISH_INTRO_DONE" });
    expect(finished.racePresentation).toEqual({
      phase: "finish",
      verdict: null,
      banner: null,
    });
    expect(finished.finalPosition).toBe("DNF");
  });

  it("updates skin and mode without touching the game, then preserves them across restart", () => {
    const changed = run(makeState(), [
      { type: "SET_UI_VERSION", uiVersion: "v1" },
      { type: "SET_V2_MODE", mode: "notte" },
      { type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } },
      { type: "RACE_PICK", optionIndex: makeQuestions()[0].answer },
    ]);

    const restarted = flowReducer(changed, {
      type: "RESTART_WEEKEND",
      weekendQuestions: makeQuestions(),
      raceCurve: "snatch",
    });

    expect(restarted.uiVersion).toBe("v1");
    expect(restarted.v2Mode).toBe("notte");
    expect(restarted.raceCurve).toBe("snatch");
    expect(restarted.raceLedger).toHaveLength(6);
    expect(restarted.raceLedger.every((entry) => entry.result === null)).toBe(true);
    expect(restarted.currentPosition).toBe(10);
    expect(restarted.finalPosition).toBeNull();
  });

  it("switches difficulty at the intro, swapping questions and rebuilding the ledger", () => {
    const nextQuestions = makeQuestions().map((question, index) => ({
      ...question,
      prompt: `regular question ${index + 1}`,
    }));

    const switched = flowReducer(makeState(), {
      type: "SET_DIFFICULTY",
      difficulty: "regular",
      weekendQuestions: nextQuestions,
    });

    expect(switched.difficulty).toBe("regular");
    expect(switched.weekendQuestions[0].prompt).toBe("regular question 1");
    expect(switched.currentLap).toBe(0);
    expect(switched.lapAnswers.every((answer) => answer === null)).toBe(true);
    expect(switched.raceLedger).toHaveLength(nextQuestions.length);
    expect(switched.raceLedger.every((entry) => entry.result === null)).toBe(true);
    expect(switched.finalPosition).toBeNull();
  });

  it("ignores a same-value difficulty dispatch and any dispatch after leaving the intro", () => {
    const initial = makeState();
    const sameValue = flowReducer(initial, {
      type: "SET_DIFFICULTY",
      difficulty: "beginner",
      weekendQuestions: makeQuestions(),
    });
    expect(sameValue).toBe(initial);

    const midGame = run(makeState(), [
      { type: "START_FORMATION_TUTORIAL" },
    ]);
    const ignored = flowReducer(midGame, {
      type: "SET_DIFFICULTY",
      difficulty: "regular",
      weekendQuestions: makeQuestions(),
    });
    expect(ignored).toBe(midGame);
    expect(ignored.difficulty).toBe("beginner");
  });

  it("preserves difficulty across a weekend restart", () => {
    const regular = flowReducer(makeState(), {
      type: "SET_DIFFICULTY",
      difficulty: "regular",
      weekendQuestions: makeQuestions(),
    });

    const restarted = flowReducer(regular, {
      type: "RESTART_WEEKEND",
      weekendQuestions: makeQuestions(),
    });

    expect(restarted.difficulty).toBe("regular");
  });

  it("chooses a fresh 50/50 curve when restart does not force one", () => {
    const random = vi.spyOn(Math, "random");
    random.mockReturnValueOnce(0.1);
    const snatch = flowReducer(makeState(), {
      type: "RESTART_WEEKEND",
      weekendQuestions: makeQuestions(),
    });

    random.mockReturnValueOnce(0.9);
    const defend = flowReducer(snatch, {
      type: "RESTART_WEEKEND",
      weekendQuestions: makeQuestions(),
    });
    random.mockRestore();

    expect(snatch.raceCurve).toBe("snatch");
    expect(defend.raceCurve).toBe("defend");
  });

  it("disables the hidden version mark only during countdown and go", () => {
    const drill = run(makeState(), [
      { type: "NAVIGATE", target: { kind: "formation_drill" } },
    ]);
    expect(selectVersionMarkEnabled(drill)).toBe(true);

    const countdown = flowReducer(drill, { type: "START_DRILL_INITIATE" });
    expect(selectVersionMarkEnabled(countdown)).toBe(false);

    const go = flowReducer(countdown, { type: "START_DRILL_GO" });
    expect(selectVersionMarkEnabled(go)).toBe(false);

    const completed = flowReducer(go, { type: "START_DRILL_COMPLETE", timeMs: 250 });
    expect(selectVersionMarkEnabled(completed)).toBe(true);
  });
});
