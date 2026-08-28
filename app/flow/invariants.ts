import type { FlowState } from "./types";

const isStartDrillScreen = (state: FlowState) =>
  state.stage === "formation" && state.formationMode === "drill";

const isRaceGridPosition = (position: unknown) =>
  Number.isInteger(position) && Number(position) >= 1 && Number(position) <= 10;

export const assertFlowInvariants = (state: FlowState) => {
  if (state.uiVersion !== "v1" && state.uiVersion !== "v2") {
    throw new Error("uiVersion must be v1 or v2");
  }

  if (state.v2Mode !== "giorno" && state.v2Mode !== "notte") {
    throw new Error("v2Mode must be giorno or notte");
  }

  if (state.difficulty !== "beginner" && state.difficulty !== "regular") {
    throw new Error("difficulty must be beginner or regular");
  }

  if (state.raceCurve !== "defend" && state.raceCurve !== "snatch") {
    throw new Error("raceCurve must be defend or snatch");
  }

  if (state.startDrill.resultMs !== null && state.startDrill.needsAttention) {
    throw new Error("start drill cannot be complete and attention-required at the same time");
  }

  if (state.pitStop.resultMs !== null && state.pitStop.needsAttention) {
    throw new Error("pit stop cannot be complete and attention-required at the same time");
  }

  if (state.startDrill.phase !== "idle" && !isStartDrillScreen(state)) {
    throw new Error("start drill phase must be idle outside the start drill screen");
  }

  if (state.startDrill.lightsOnCount < 0 || state.startDrill.lightsOnCount > 5) {
    throw new Error("start drill lights must stay between 0 and 5");
  }

  if (state.pitStop.phase === "running" && state.stage !== "pitstop") {
    throw new Error("pit stop can only run while on the pit stop screen");
  }

  if (state.currentLap < 0 || state.currentLap >= state.weekendQuestions.length) {
    throw new Error("currentLap must remain in range");
  }

  if (state.tutorialStep < 0 || state.tutorialStep >= state.tutorialAnswers.length) {
    throw new Error("tutorialStep must remain in range");
  }

  if (
    state.lapAnswers.length !== state.weekendQuestions.length ||
    state.raceLedger.length !== state.weekendQuestions.length
  ) {
    throw new Error("lap answers, ledger, and weekend questions must have the same length");
  }

  const gains =
    state.raceCurve === "defend"
      ? [0, 2, 4, 5, 7, 9, 9]
      : [0, 2, 3, 5, 6, 8, 9];
  let correctCount = 0;
  let wrongCount = 0;
  let expectedPosition = 10;

  state.raceLedger.forEach((entry, lapIndex) => {
    if (entry.lapIndex !== lapIndex) {
      throw new Error("race ledger lap indexes must stay ordered");
    }

    if (!isRaceGridPosition(entry.before) || !isRaceGridPosition(entry.after)) {
      throw new Error("race ledger positions must stay between P1 and P10");
    }

    if (entry.before !== expectedPosition) {
      throw new Error("race ledger entries must form one continuous position history");
    }

    const answer = state.lapAnswers[lapIndex] ?? null;
    const question = state.weekendQuestions[lapIndex];
    const expectedResult =
      answer === null ? null : answer === question.answer ? "correct" : "wrong";
    if (entry.result !== expectedResult) {
      throw new Error("race ledger result must match the locked lap answer");
    }

    if (expectedResult === "correct") correctCount += 1;
    if (expectedResult === "wrong") wrongCount += 1;

    const expectedAfter =
      expectedResult === null
        ? expectedPosition
        : Math.max(
            1,
            Math.min(10 - gains[Math.min(correctCount, gains.length - 1)] + wrongCount, 10),
          );
    if (entry.after !== expectedAfter) {
      throw new Error("race ledger position must match the selected race curve");
    }

    if (entry.delta !== entry.before - entry.after) {
      throw new Error("race ledger delta must equal before minus after");
    }

    expectedPosition = entry.after;
  });

  if (!isRaceGridPosition(state.currentPosition) || state.currentPosition !== expectedPosition) {
    throw new Error("currentPosition must match the latest ledger position");
  }

  const isFinishStage = state.stage === "finish_intro" || state.stage === "finished";
  const expectedFinalPosition = correctCount === 0 ? "DNF" : state.currentPosition;
  if (isFinishStage && state.finalPosition !== expectedFinalPosition) {
    throw new Error("finish stages must expose the ledger-derived final position");
  }

  if (!isFinishStage && state.finalPosition !== null) {
    throw new Error("finalPosition must be null before the finish");
  }

  if (
    state.finalPosition !== null &&
    state.finalPosition !== "DNF" &&
    !isRaceGridPosition(state.finalPosition)
  ) {
    throw new Error("finalPosition must be P1-P10, DNF, or null");
  }

  const presentation = state.racePresentation;
  if (presentation.phase === "lap" || presentation.phase === "result") {
    if (state.stage !== "race") {
      throw new Error("lap and result presentation phases require the race stage");
    }
  }

  if (presentation.phase === "pit" && state.stage !== "pitstop") {
    throw new Error("pit presentation phase requires the pit-stop stage");
  }

  if (state.stage === "pitstop" && presentation.phase !== "pit") {
    throw new Error("pit-stop stage must expose the pit presentation phase");
  }

  if (presentation.phase === "dnf") {
    if (state.stage !== "finish_intro" || state.finalPosition !== "DNF") {
      throw new Error("dnf presentation phase requires the DNF finish intro");
    }
  }

  if (
    presentation.phase === "finish" &&
    state.stage !== "finish_intro" &&
    state.stage !== "finished"
  ) {
    throw new Error("finish presentation phase requires a finish stage");
  }

  if (state.stage === "finished" && presentation.phase !== "finish") {
    throw new Error("finished stage must expose the finish presentation phase");
  }

  if (presentation.phase === "result") {
    const currentResult = state.raceLedger[state.currentLap]?.result ?? null;
    if (
      currentResult === null ||
      presentation.verdict !== currentResult ||
      presentation.banner === null
    ) {
      throw new Error("result presentation must match the current lap verdict and banner");
    }
  } else if (presentation.verdict !== null) {
    throw new Error("race verdict must be null outside the result presentation");
  }
};
