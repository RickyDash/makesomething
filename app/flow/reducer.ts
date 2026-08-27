import type { FlowEvent } from "./events";
import { assertFlowInvariants } from "./invariants";
import {
  PIT_DEFAULT_MESSAGE,
  PIT_RUNNING_MESSAGE,
  type Difficulty,
  type FlowState,
  type RaceBanner,
  type RaceCurve,
  type RaceGridPosition,
  type RaceLedgerEntry,
  type RacePresentationState,
  type TrackTarget,
  type UiVersion,
  type V2Mode,
} from "./types";

const tyreLabels = ["front left", "front right", "rear left", "rear right"] as const;
const pitOrder = [0, 1, 2, 3] as const;
const defendGains = [0, 2, 4, 5, 7, 9, 9] as const;
const snatchGains = [0, 2, 3, 5, 6, 8, 9] as const;
const raceCorners = ["THE RETTIFILO", "ROGGIA", "LESMO", "ASCARI", "PARABOLICA"] as const;

const questionPresentation = (): RacePresentationState => ({
  phase: "question",
  verdict: null,
  banner: null,
});

const pitPresentation = (): RacePresentationState => ({
  phase: "pit",
  verdict: null,
  banner: {
    text: "BOX BOX BOX",
    sub: "TYRE CHANGE · POSITIONS HOLD",
    tone: "pit",
  },
});

const dnfPresentation = (): RacePresentationState => ({
  phase: "dnf",
  verdict: null,
  banner: {
    text: "RETIRING THE CAR",
    sub: "TOO MUCH DAMAGE · DNF",
    tone: "bad",
  },
});

const finishPresentation = (): RacePresentationState => ({
  phase: "finish",
  verdict: null,
  banner: null,
});

const getPitStopLap = (totalLaps: number) => Math.floor(totalLaps / 2);

const getScore = (state: FlowState) =>
  state.lapAnswers.reduce<number>((total, answer, lapIndex) => {
    if (answer === null) return total;
    return answer === state.weekendQuestions[lapIndex]?.answer ? total + 1 : total;
  }, 0);

const clampRacePosition = (position: number): RaceGridPosition =>
  Math.max(1, Math.min(position, 10)) as RaceGridPosition;

export const getLedgerPosition = (
  correctCount: number,
  wrongCount: number,
  raceCurve: RaceCurve,
): RaceGridPosition => {
  const gains = raceCurve === "defend" ? defendGains : snatchGains;
  const safeCorrectCount = Math.max(0, Math.min(Math.trunc(correctCount), gains.length - 1));
  const safeWrongCount = Math.max(0, Math.trunc(wrongCount));
  return clampRacePosition(10 - gains[safeCorrectCount] + safeWrongCount);
};

export const recomputeRaceLedger = (
  lapAnswers: FlowState["lapAnswers"],
  weekendQuestions: FlowState["weekendQuestions"],
  raceCurve: RaceCurve,
): RaceLedgerEntry[] => {
  let correctCount = 0;
  let wrongCount = 0;
  let position: RaceGridPosition = 10;

  return weekendQuestions.map((question, lapIndex) => {
    const before = position;
    const answer = lapAnswers[lapIndex] ?? null;
    const result =
      answer === null ? null : answer === question.answer ? ("correct" as const) : ("wrong" as const);

    if (result === "correct") correctCount += 1;
    if (result === "wrong") wrongCount += 1;

    const after =
      result === null ? before : getLedgerPosition(correctCount, wrongCount, raceCurve);
    position = after;

    return {
      lapIndex,
      result,
      before,
      after,
      delta: before - after,
    };
  });
};

export const getRandomRaceCurve = (): RaceCurve =>
  Math.random() < 0.5 ? "snatch" : "defend";

const getCurrentPosition = (raceLedger: RaceLedgerEntry[]): RaceGridPosition =>
  raceLedger[raceLedger.length - 1]?.after ?? 10;

const getRaceBanner = (state: FlowState, lapIndex: number): RaceBanner | null => {
  const entry = state.raceLedger[lapIndex];
  if (!entry || entry.result === null) return null;

  const corner = raceCorners[lapIndex % raceCorners.length];

  if (entry.result === "correct") {
    let text: string;
    if (entry.after === 1 && entry.delta === 0) {
      text = `P1 DEFENDED INTO ${corner}`;
    } else if (entry.delta === 0) {
      text = `HELD THROUGH ${corner}`;
    } else {
      text = `CLEAN PASS — UP ${entry.delta} INTO ${corner}`;
    }

    let streak = 0;
    for (let index = lapIndex; index >= 0; index -= 1) {
      if (state.raceLedger[index]?.result !== "correct") break;
      streak += 1;
    }

    return {
      text,
      sub: streak >= 2 ? `PURPLE SECTOR · ${streak} CORRECT IN A ROW` : "",
      tone: "good",
    };
  }

  const wrongCount = state.raceLedger
    .slice(0, lapIndex + 1)
    .filter((ledgerEntry) => ledgerEntry.result === "wrong").length;

  return {
    text:
      entry.delta === 0
        ? `NO WAY THROUGH AT ${corner}`
        : `LOST ${Math.abs(entry.delta)} AT ${corner}`,
    sub: wrongCount >= 2 ? "DAMAGE BUILDING · CAREFUL" : "",
    tone: "bad",
  };
};

const getRevealedPresentation = (
  state: FlowState,
  lapIndex: number,
): RacePresentationState => {
  const result = state.raceLedger[lapIndex]?.result ?? null;
  if (result === null) return questionPresentation();

  return {
    phase: "result",
    verdict: result,
    banner: getRaceBanner(state, lapIndex),
  };
};

const getFinalPosition = (state: FlowState) =>
  getScore(state) === 0 ? ("DNF" as const) : state.currentPosition;

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
      finalPosition: null,
      racePresentation: questionPresentation(),
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
      finalPosition: null,
      racePresentation: questionPresentation(),
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
      finalPosition: null,
      racePresentation: questionPresentation(),
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
      finalPosition: null,
      racePresentation: getRevealedPresentation(state, safeLap),
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  if (target.kind === "pitstop") {
    return {
      ...state,
      stage: "pitstop",
      currentLap: pitStopLap,
      finalPosition: null,
      racePresentation: pitPresentation(),
      startDrill: { ...state.startDrill, phase: "idle", lightsOnCount: 0 },
      pitStop: { ...state.pitStop, phase: "idle" },
    };
  }

  return {
    ...state,
    stage: "finished",
    currentLap: Math.max(totalLaps - 1, 0),
    finalPosition: getFinalPosition(state),
    racePresentation: finishPresentation(),
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
    case "SET_UI_VERSION":
      return {
        ...state,
        uiVersion: event.uiVersion,
      };

    case "SET_V2_MODE":
      return {
        ...state,
        v2Mode: event.mode,
      };

    case "SET_DIFFICULTY": {
      if (event.difficulty === state.difficulty) return state;
      if (state.stage !== "formation" || state.formationMode !== "intro") {
        return state;
      }

      const nextLapAnswers = event.weekendQuestions.map(() => null);
      const nextRaceLedger = recomputeRaceLedger(
        nextLapAnswers,
        event.weekendQuestions,
        state.raceCurve,
      );

      return {
        ...state,
        difficulty: event.difficulty,
        weekendQuestions: event.weekendQuestions,
        currentLap: 0,
        lapAnswers: nextLapAnswers,
        raceLedger: nextRaceLedger,
        currentPosition: getCurrentPosition(nextRaceLedger),
        finalPosition: null,
        racePresentation: questionPresentation(),
      };
    }

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
      const nextRaceLedger = recomputeRaceLedger(
        nextLapAnswers,
        state.weekendQuestions,
        state.raceCurve,
      );

      return {
        ...state,
        lapAnswers: nextLapAnswers,
        raceLedger: nextRaceLedger,
        currentPosition: getCurrentPosition(nextRaceLedger),
        finalPosition: null,
        racePresentation: {
          phase: "lap",
          verdict: null,
          banner: null,
        },
      };
    }

    case "RACE_REVEAL": {
      if (state.stage !== "race") return state;
      if (state.lapAnswers[state.currentLap] === null) return state;

      return {
        ...state,
        racePresentation: getRevealedPresentation(state, state.currentLap),
      };
    }

    case "RACE_RESET_PRESENTATION":
      if (state.stage !== "race") return state;
      return {
        ...state,
        racePresentation: questionPresentation(),
      };

    case "RACE_NEXT": {
      if (state.stage !== "race") return state;
      if (state.currentLap >= totalLaps - 1) return state;

      const nextLap = state.currentLap + 1;
      if (nextLap === pitStopLap) {
        return {
          ...state,
          currentLap: nextLap,
          stage: "pitstop",
          racePresentation: pitPresentation(),
          pitStop: { ...state.pitStop, phase: "idle" },
        };
      }

      return {
        ...state,
        currentLap: nextLap,
        racePresentation: getRevealedPresentation(state, nextLap),
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
        return applyNavigationTarget(state, {
          kind: "lap",
          lapIndex: state.currentLap - 1,
        });
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
          resultMs: null,
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
          resultMs: null,
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
        finalPosition: getFinalPosition(state),
        racePresentation: score === 0 ? dnfPresentation() : finishPresentation(),
        bestScore: Math.max(state.bestScore, score),
      };
    }

    case "FINISH_INTRO_DONE":
      if (state.stage !== "finish_intro") return state;
      return {
        ...state,
        stage: "finished",
        racePresentation: finishPresentation(),
      };

    case "GO_PREVIOUS_FROM_FINISH":
      return {
        ...state,
        stage: "race",
        currentLap: Math.max(totalLaps - 1, 0),
        finalPosition: null,
        racePresentation: getRevealedPresentation(state, Math.max(totalLaps - 1, 0)),
      };

    case "RESTART_WEEKEND": {
      const nextRaceCurve = event.raceCurve ?? getRandomRaceCurve();
      const nextLapAnswers = event.weekendQuestions.map(() => null);
      const nextRaceLedger = recomputeRaceLedger(
        nextLapAnswers,
        event.weekendQuestions,
        nextRaceCurve,
      );

      return {
        ...state,
        stage: "formation",
        formationMode: "intro",
        tutorialStep: 0,
        tutorialAnswers: state.tutorialAnswers.map(() => null),
        weekendQuestions: event.weekendQuestions,
        currentLap: 0,
        lapAnswers: nextLapAnswers,
        raceCurve: nextRaceCurve,
        raceLedger: nextRaceLedger,
        currentPosition: getCurrentPosition(nextRaceLedger),
        finalPosition: null,
        racePresentation: questionPresentation(),
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
  uiVersion?: UiVersion;
  v2Mode?: V2Mode;
  difficulty?: Difficulty;
  raceCurve?: RaceCurve;
};

export const createInitialFlowState = ({
  weekendQuestions,
  tutorialStepCount,
  bestReactionMs,
  bestScore,
  uiVersion = "v2",
  v2Mode = "giorno",
  difficulty = "beginner",
  raceCurve = getRandomRaceCurve(),
}: InitialFlowStateParams): FlowState => {
  const lapAnswers = weekendQuestions.map(() => null);
  const raceLedger = recomputeRaceLedger(lapAnswers, weekendQuestions, raceCurve);

  return {
    stage: "formation",
    formationMode: "intro",
    uiVersion,
    v2Mode,
    difficulty,
    tutorialStep: 0,
    tutorialAnswers: Array.from({ length: tutorialStepCount }, () => null),
    weekendQuestions,
    currentLap: 0,
    lapAnswers,
    raceCurve,
    raceLedger,
    currentPosition: getCurrentPosition(raceLedger),
    finalPosition: null,
    racePresentation: questionPresentation(),
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
  };
};
