import type { FlowState } from "./types";

const isStartDrillScreen = (state: FlowState) =>
  state.stage === "formation" && state.formationMode === "drill";

export const assertFlowInvariants = (state: FlowState) => {
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
};
