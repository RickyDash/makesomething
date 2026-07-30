import type { FlowState } from "./types";

export const selectStartComplete = (state: FlowState) => state.startDrill.resultMs !== null;

export const selectPitComplete = (state: FlowState) => state.pitStop.resultMs !== null;

export const selectStartWarning = (state: FlowState) =>
  !selectStartComplete(state) && state.startDrill.needsAttention;

export const selectPitWarning = (state: FlowState) =>
  !selectPitComplete(state) && state.pitStop.needsAttention;

export const selectStartSkipVisible = (state: FlowState) => !selectStartComplete(state);

export const selectPitSkipVisible = (state: FlowState) => !selectPitComplete(state);

export const selectRaceCounts = (state: FlowState) =>
  state.raceLedger.reduce(
    (counts, entry) => {
      if (entry.result === "correct") counts.correct += 1;
      if (entry.result === "wrong") counts.wrong += 1;
      return counts;
    },
    { correct: 0, wrong: 0 },
  );

export const selectDisplayedRacePosition = (state: FlowState) =>
  state.finalPosition ?? state.currentPosition;

export const selectCurrentLapLedgerEntry = (state: FlowState) =>
  state.raceLedger[state.currentLap] ?? null;

export const selectVersionMarkEnabled = (state: FlowState) =>
  !(
    state.stage === "formation" &&
    state.formationMode === "drill" &&
    (state.startDrill.phase === "countdown" || state.startDrill.phase === "go")
  );

export const selectFinishChips = (state: FlowState) => {
  const startComplete = selectStartComplete(state);
  const pitComplete = selectPitComplete(state);

  return {
    startDrill: startComplete
      ? { kind: "time" as const, timeMs: state.startDrill.resultMs }
      : { kind: "fallback" as const, label: "start-drill skipped" },
    pitStop: pitComplete
      ? { kind: "time" as const, timeMs: state.pitStop.resultMs }
      : { kind: "fallback" as const, label: "pit stop skipped" },
  };
};
