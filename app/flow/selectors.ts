import type { FlowState } from "./types";

export const selectStartComplete = (state: FlowState) => state.startDrill.resultMs !== null;

export const selectPitComplete = (state: FlowState) => state.pitStop.resultMs !== null;

export const selectStartWarning = (state: FlowState) =>
  !selectStartComplete(state) && state.startDrill.needsAttention;

export const selectPitWarning = (state: FlowState) =>
  !selectPitComplete(state) && state.pitStop.needsAttention;

export const selectStartSkipVisible = (state: FlowState) => !selectStartComplete(state);

export const selectPitSkipVisible = (state: FlowState) => !selectPitComplete(state);

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
