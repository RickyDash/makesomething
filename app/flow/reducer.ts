import type { FlowEvent } from "./events";
import { assertFlowInvariants } from "./invariants";
import {
  PIT_DEFAULT_MESSAGE,
  PIT_RUNNING_MESSAGE,
  type FlowState,
  type TrackTarget,
} from "./types";

const tyreLabels = ["front left", "front right", "rear left", "rear right"] as const;
const pitOrder = [0, 1, 2, 3] as const;

const getPitStopLap = (totalLaps: number) => Math.floor(totalLaps / 2);

const getScore = (state: FlowState) =>
  state.lapAnswers.reduce<number>((total, answer, lapIndex) => {
    if (answer === null) return total;
    return answer === state.weekendQuestions[lapIndex]?.answer ? total + 1 : total;
  }, 0);

const getDrillRank = (state: FlowState) => state.tutorialAnswers.length + 1;

const getPitRank = (state: FlowState, pitStopLap: number) => getDrillRank(state) + 1 + pitStopLap;

const getTargetRank = (target: TrackTarget, state: FlowState, pitStopLap: number) => {
  const drillRank = getDrillRank(state);

  switch (target.kind) {
    case "formation_intro":
      return 0;
    case "tutorial":
      return 1 + target.stepIndex;
    case "formation_drill":
      return drillRank;
    case "lap": {
      const lapOffset = target.lapIndex >= pitStopLap ? 1 : 0;
      return drillRank + 1 + target.lapIndex + lapOffset;
    }
    case "pitstop":
      return getPitRank(state, pitStopLap);
    case "finish":
      return getDrillRank(state) + state.weekendQuestions.length + 3;
    default: {
      const neverTarget: never = target;
      return neverTarget;
    }
  }
};

export const isPastStartCheckpoint = (target: TrackTarget, state: FlowState) => {
  const pitStopLap = getPitStopLap(state.weekendQuestions.length);
  return getTargetRank(target, state, pitStopLap) > getDrillRank(state);
};

export const isPastPitCheckpoint = (
  target: TrackTarget,
  pitStopLap: number,
  state: FlowState,
) => getTargetRank(target, state, pitStopLap) > getPitRank(state, pitStopLap);

const setStartDrillIdle = (state: FlowState): FlowState => ({
  ...state,
  startDrill: { ...state.startDrill, phase: "idle" as const, lightsOnCount: 0 },
});

const setPitStopIdle = (state: FlowState): FlowState => ({
  ...state,
  pitStop: { ...state.pitStop, phase: "idle" as const },
});

const applyNavigationTarget = (state: FlowState, target: TrackTarget): FlowState => {
  const totalLaps = state.weekendQuestions.length;
  const pitStopLap = getPitStopLap(totalLaps);
  const maxTutorialStep = Math.max(state.tutorialAnswers.length - 1, 0);

  if (target.kind === "formation_intro") {
    return {
      ...state,
      stage: "formation",
      formationMode: "intro",
      tutorialStep: 0,
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  if (target.kind === "formation_drill") {
    return {
      ...state,
      stage: "formation",
      formationMode: "drill",
      tutorialStep: maxTutorialStep,
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  if (target.kind === "tutorial") {
    const safeStep = Math.max(0, Math.min(target.stepIndex, maxTutorialStep));
    return {
      ...state,
      stage: "formation",
      formationMode: "briefing",
      tutorialStep: safeStep,
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  if (target.kind === "lap") {
    const safeLap = Math.max(0, Math.min(target.lapIndex, Math.max(totalLaps - 1, 0)));
    return {
      ...state,
      stage: "race",
      currentLap: safeLap,
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  if (target.kind === "pitstop") {
    return {
      ...state,
      stage: "pitstop",
      currentLap: pitStopLap,
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  return {
    ...state,
    stage: "finished",
    currentLap: Math.max(totalLaps - 1, 0),
    startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
    pitStop: { ...state.pitStop, phase: "idle" },
  };
};

export const applyAttentionOnNavigation = (state: FlowState, target: TrackTarget): FlowState => {
  const pitStopLap = getPitStopLap(state.weekendQuestions.length);
  const next = {
    ...state,
    startDrill: { ...state.startDrill },
    pitStop: { ...state.pitStop },
  };

  const leavingStartDrill = state.stage === "formation" && state.formationMode === "drill";
  if (leavingStartDrill && state.startDrill.resultMs === null && state.startDrill.attemptStarted) {
    next.startDrill.needsAttention = true;
  }

  const leavingPitStop = state.stage === "pitstop";
  if (leavingPitStop && state.pitStop.resultMs === null && state.pitStop.attemptStarted) {
    next.pitStop.needsAttention = true;
  }

  if (state.startDrill.resultMs === null && isPastStartCheckpoint(target, state)) {
    next.startDrill.needsAttention = true;
  }

  if (state.pitStop.resultMs === null && isPastPitCheckpoint(target, pitStopLap, state)) {
    next.pitStop.needsAttention = true;
  }

  return next;
};

const reduceFlowState = (state: FlowState, event: FlowEvent): FlowState => {
  const totalLaps = state.weekendQuestions.length;
  const pitStopLap = getPitStopLap(totalLaps);
  const maxTutorialStep = Math.max(state.tutorialAnswers.length - 1, 0);

  switch (event.type) {
    case "NAVIGATE": {
      const withAttention = applyAttentionOnNavigation(state, event.target);
      return applyNavigationTarget(withAttention, event.target);
    }

    case "START_FORMATION_TUTORIAL":
      return {
        ...state,
        stage: "formation",
        formationMode: "briefing",
        tutorialStep: 0,
      };

    case "FORMATION_SKIP_TO_DRILL":
      return {
        ...state,
        stage: "formation",
        formationMode: "drill",
        tutorialStep: maxTutorialStep,
        startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      };

    case "TUTORIAL_PICK": {
      if (state.stage !== "formation" || state.formationMode !== "briefing") return state;
      if (state.tutorialAnswers[state.tutorialStep] !== null) return state;

      const nextTutorialAnswers = [...state.tutorialAnswers];
      nextTutorialAnswers[state.tutorialStep] = event.optionIndex;

      return {
        ...state,
        tutorialAnswers: nextTutorialAnswers,
      };
    }

    case "TUTORIAL_NEXT": {
      if (state.stage !== "formation" || state.formationMode !== "briefing") return state;

      if (state.tutorialStep < maxTutorialStep) {
        return {
          ...state,
          tutorialStep: state.tutorialStep + 1,
        };
      }

      return {
        ...state,
        formationMode: "drill",
        tutorialStep: maxTutorialStep,
        startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      };
    }

    case "TUTORIAL_PREVIOUS": {
      if (state.stage !== "formation" || state.formationMode !== "briefing") return state;

      if (state.tutorialStep === 0) {
        return {
          ...state,
          formationMode: "intro",
          tutorialStep: 0,
        };
      }

      return {
        ...state,
        tutorialStep: state.tutorialStep - 1,
      };
    }

    case "START_DRILL_INITIATE": {
      if (state.stage !== "formation" || state.formationMode !== "drill") return state;

      return {
        ...state,
        startDrill: {
          ...state.startDrill,
          attemptStarted: true,
          phase: "countdown",
          lightsOnCount: 0,
        },
      };
    }

    case "START_DRILL_SET_LIGHTS": {
      if (state.stage !== "formation" || state.formationMode !== "drill") return state;
      if (state.startDrill.phase !== "countdown") return state;

      return {
        ...state,
        startDrill: {
          ...state.startDrill,
          lightsOnCount: Math.max(0, Math.min(event.lightsOnCount, 5)),
        },
      };
    }

    case "START_DRILL_GO": {
      if (state.stage !== "formation" || state.formationMode !== "drill") return state;
      if (state.startDrill.phase !== "countdown") return state;

      return {
        ...state,
        startDrill: {
          ...state.startDrill,
          phase: "go",
          lightsOnCount: 0,
        },
      };
    }

    case "START_DRILL_LAUNCH":
      return state;

    case "START_DRILL_EARLY": {
      if (state.stage !== "formation" || state.formationMode !== "drill") return state;

      return {
        ...state,
        startDrill: {
          ...state.startDrill,
          attemptStarted: true,
          phase: "early",
          lightsOnCount: 0,
        },
      };
    }

    case "START_DRILL_COMPLETE": {
      if (state.stage !== "formation" || state.formationMode !== "drill") return state;
      const nextBestReaction =
        state.bestReactionMs === null || event.timeMs < state.bestReactionMs
          ? event.timeMs
          : state.bestReactionMs;

      return {
        ...state,
        bestReactionMs: nextBestReaction,
        startDrill: {
          ...state.startDrill,
          resultMs: event.timeMs,
          attemptStarted: true,
          needsAttention: false,
          phase: "idle",
          lightsOnCount: 0,
        },
      };
    }

    case "START_DRILL_RETRY": {
      if (state.stage !== "formation" || state.formationMode !== "drill") return state;

      return {
        ...state,
        startDrill: {
          ...state.startDrill,
          attemptStarted: true,
          phase: "idle",
          lightsOnCount: 0,
        },
      };
    }

    case "START_DRILL_SKIP":
      return state;

    case "RACE_PICK": {
      if (state.stage !== "race") return state;
      if (state.lapAnswers[state.currentLap] !== null) return state;

      const nextLapAnswers = [...state.lapAnswers];
      nextLapAnswers[state.currentLap] = event.optionIndex;

      return {
        ...state,
        lapAnswers: nextLapAnswers,
      };
    }

    case "RACE_NEXT": {
      if (state.stage !== "race") return state;
      if (state.currentLap >= totalLaps - 1) return state;

      const nextLap = state.currentLap + 1;
      if (nextLap === pitStopLap) {
        return {
          ...state,
          currentLap: nextLap,
          stage: "pitstop",
          pitStop: { ...state.pitStop, phase: "idle" },
        };
      }

      return {
        ...state,
        currentLap: nextLap,
      };
    }

    case "RACE_PREVIOUS": {
      if (state.stage !== "race") return state;

      if (
        state.currentLap === pitStopLap &&
        (state.pitStop.resultMs !== null || state.pitStop.needsAttention || state.pitStop.attemptStarted)
      ) {
        return applyNavigationTarget(
          applyAttentionOnNavigation(state, { kind: "pitstop" }),
          { kind: "pitstop" },
        );
      }

      if (state.currentLap > 0) {
        return {
          ...state,
          currentLap: state.currentLap - 1,
        };
      }

      return applyNavigationTarget(
        applyAttentionOnNavigation(state, { kind: "formation_drill" }),
        { kind: "formation_drill" },
      );
    }

    case "PIT_BEGIN": {
      if (state.stage !== "pitstop") return state;

      return {
        ...state,
        pitStop: {
          ...state.pitStop,
          attemptStarted: true,
          needsAttention: false,
          phase: "running",
          step: 0,
          penaltyMs: 0,
          message: PIT_RUNNING_MESSAGE,
        },
      };
    }

    case "PIT_CLICK":
      return state;

    case "PIT_ADVANCE": {
      if (state.stage !== "pitstop") return state;
      if (state.pitStop.phase !== "running") return state;

      const nextStep = Math.min(state.pitStop.step + 1, pitOrder.length - 1);

      return {
        ...state,
        pitStop: {
          ...state.pitStop,
          step: nextStep,
          message: `nice. now lock ${tyreLabels[pitOrder[nextStep]]}.`,
        },
      };
    }

    case "PIT_ADD_PENALTY": {
      if (state.stage !== "pitstop") return state;
      if (state.pitStop.phase !== "running") return state;

      return {
        ...state,
        pitStop: {
          ...state.pitStop,
          penaltyMs: state.pitStop.penaltyMs + event.amountMs,
          message: "wrong corner. +300ms penalty.",
        },
      };
    }

    case "PIT_COMPLETE": {
      if (state.stage !== "pitstop") return state;

      return {
        ...state,
        pitStop: {
          ...state.pitStop,
          resultMs: event.timeMs,
          attemptStarted: true,
          needsAttention: false,
          phase: "idle",
          message: "pit stop complete.",
        },
      };
    }

    case "PIT_RETRY": {
      if (state.stage !== "pitstop") return state;

      return {
        ...state,
        pitStop: {
          ...state.pitStop,
          attemptStarted: true,
          needsAttention: false,
          phase: "running",
          step: 0,
          penaltyMs: 0,
          message: PIT_RUNNING_MESSAGE,
        },
      };
    }

    case "PIT_SKIP":
      return state;

    case "START_FINISH_INTRO": {
      const score = getScore(state);
      return {
        ...setPitStopIdle(setStartDrillIdle(state)),
        stage: "finish_intro",
        bestScore: Math.max(state.bestScore, score),
      };
    }

    case "FINISH_INTRO_DONE":
      if (state.stage !== "finish_intro") return state;
      return {
        ...state,
        stage: "finished",
      };

    case "GO_PREVIOUS_FROM_FINISH":
      return {
        ...state,
        stage: "race",
        currentLap: Math.max(totalLaps - 1, 0),
      };

    case "RESTART_WEEKEND": {
      return {
        ...state,
        stage: "formation",
        formationMode: "intro",
        tutorialStep: 0,
        tutorialAnswers: state.tutorialAnswers.map(() => null),
        weekendQuestions: event.weekendQuestions,
        currentLap: 0,
        lapAnswers: event.weekendQuestions.map(() => null),
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
          message: PIT_DEFAULT_MESSAGE,
        },
      };
    }

    default: {
      const neverEvent: never = event;
      return neverEvent;
    }
  }
};

export const flowReducer = (state: FlowState, event: FlowEvent): FlowState => {
  const next = reduceFlowState(state, event);

  if (process.env.NODE_ENV !== "production") {
    assertFlowInvariants(next);
  }

  return next;
};

type InitialFlowStateParams = {
  weekendQuestions: FlowState["weekendQuestions"];
  tutorialStepCount: number;
  bestReactionMs: number | null;
  bestScore: number;
};

export const createInitialFlowState = ({
  weekendQuestions,
  tutorialStepCount,
  bestReactionMs,
  bestScore,
}: InitialFlowStateParams): FlowState => ({
  stage: "formation",
  formationMode: "intro",
  tutorialStep: 0,
  tutorialAnswers: Array.from({ length: tutorialStepCount }, () => null),
  weekendQuestions,
  currentLap: 0,
  lapAnswers: weekendQuestions.map(() => null),
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
    message: PIT_DEFAULT_MESSAGE,
  },
  bestReactionMs,
  bestScore,
});
