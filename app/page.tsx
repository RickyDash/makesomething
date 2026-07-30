"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  getRandomWeekendQuestions,
  initialWeekendQuestions,
} from "./f1-question-bank";
import {
  selectFinishChips,
  selectPitComplete,
  selectPitSkipVisible,
  selectPitWarning,
  selectStartComplete,
  selectStartSkipVisible,
  selectStartWarning,
} from "./flow/selectors";
import {
  createInitialFlowState,
  flowReducer,
  recomputeRaceLedger,
} from "./flow/reducer";
import {
  SEQUENCE_TIMINGS,
  createReactionTimeline,
  getPitRejoinDelayMs,
  scheduleReactionTimeline,
  scheduleV2LapTimeline,
} from "./flow/timing";
import type { FormationMode, Stage, TrackTarget, UiVersion } from "./flow/types";
import {
  createRaceSim,
  createSvgPathGeometrySampler,
  MONZA_MAIN_TRACK_PATH_D,
  MONZA_PIT_LANE_PATH_D,
  type RaceSim,
  type RaceSimGameSnapshot,
  type RaceSimPhase,
} from "./race-sim/raceSim";
import { loadUiPreferences, saveUiPreferences } from "./ui-preferences";
import { MonzaV2Skin } from "../components/monza-v2";

type ReactionPhase = "idle" | "countdown" | "go" | "early" | "success";
type MarkerState = "unanswered" | "correct" | "incorrect";

type TutorialStep = {
  prompt: string;
  options: string[];
  answer: number;
  note: string;
};

type PitBands = {
  greenUpper: number;
  yellowUpper: number;
};

const tutorialSteps: TutorialStep[] = [
  {
    prompt: "once you tap an answer, what happens next?",
    options: ["you can keep changing it", "it locks immediately as final", "it auto-skips"],
    answer: 1,
    note: "answers lock immediately, then the race note appears for that lap.",
  },
  {
    prompt: "in this game, each quiz question represents what?",
    options: ["one race lap", "one full season", "one pit stop"],
    answer: 0,
    note: "each quiz question represents one lap in your grand prix run.",
  },
  {
    prompt: "what happens around mid-race?",
    options: ["timed pit stop challenge", "double points lap", "weather lottery"],
    answer: 0,
    note: "mid-race, the pit stop mini challenge appears before you continue laps.",
  },
];

const tyreLabels = ["front left", "front right", "rear left", "rear right"] as const;
const pitOrder = [0, 1, 2, 3] as const;

const DESKTOP_GRAND_PRIX_MARKER_POS = 24;
const MOBILE_GRAND_PRIX_MARKER_POS = 33;
const finishMarkerPos = 100;
const DESKTOP_PIT_BANDS: PitBands = { greenUpper: 1800, yellowUpper: 2400 };
const MOBILE_PIT_BANDS: PitBands = { greenUpper: 750, yellowUpper: 1000 };
const MOBILE_TUTORIAL_EDGE_INSET = 0;
const MOBILE_RACE_EDGE_INSET = 0;
const TUTORIAL_NUDGE_RIGHT_MOBILE_TABLET = 0;
const POST_PIT_NUDGE_LEFT_MOBILE_TABLET = 0;
const MOBILE_PIT_STOP_LEFT_SHIFT = 1.0;

const getReactionValueClass = (ms: number) =>
  ms < 250 ? "text-emerald-300" : ms < 300 ? "text-amber-300" : "text-red-300";

const getPitBand = (ms: number, bands: PitBands): "green" | "yellow" | "red" => {
  if (ms < bands.greenUpper) return "green";
  if (ms < bands.yellowUpper) return "yellow";
  return "red";
};

const getReactionBand = (ms: number): "green" | "yellow" | "red" => {
  if (ms < 250) return "green";
  if (ms < 300) return "yellow";
  return "red";
};

const getBandMarkerClass = (band: "green" | "yellow" | "red") => {
  if (band === "green") return "border-zinc-300 bg-emerald-400";
  if (band === "yellow") return "border-zinc-300 bg-amber-400";
  return "border-zinc-300 bg-red-500";
};

const getPitValueClass = (ms: number, bands: PitBands) => {
  const band = getPitBand(ms, bands);
  if (band === "green") return "text-emerald-300";
  if (band === "yellow") return "text-amber-300";
  return "text-red-300";
};

const getScoreValueClass = (value: number) =>
  value >= 5 ? "text-emerald-300" : value >= 3 ? "text-amber-300" : "text-red-300";

const getReactionFeedback = (ms: number) =>
  ms < 250
    ? "that's rapid. green band is under 250ms."
    : ms < 300
      ? "solid start. beat 250ms for green."
      : "you can be faster. get under 300ms for yellow, under 250ms for green.";

const getPitFeedback = (ms: number, bands: PitBands) => {
  const band = getPitBand(ms, bands);
  if (band === "green") {
    return `that's rapid. green band is under ${bands.greenUpper}ms.`;
  }
  if (band === "yellow") {
    return `solid stop. beat ${bands.greenUpper}ms for green.`;
  }
  return `you can be faster. get under ${bands.yellowUpper}ms for yellow, under ${bands.greenUpper}ms for green.`;
};

const getMarkerInnerClass = (state: MarkerState) =>
  state === "correct" ? "bg-emerald-400" : state === "incorrect" ? "bg-red-500" : "bg-zinc-900";

const RADIO_START = [
  "lights out and away we go, keep it clean through turn one",
  "okay let's have a good start, stay out of trouble",
  "green light, go go go, nice and smooth off the line",
];
const RADIO_POST_PIT = [
  "fresh rubber, let's make these tyres count",
  "new tyres on, push now, we've got pace in hand",
  "box exit clean, these tyres should be good to the end",
];
const RADIO_LAST_LAP = [
  "last lap, give it everything",
  "final lap, bring it home",
  "this is it, one more lap, leave nothing on the table",
];
const RADIO_PRE_PIT = [
  "box box next lap, standby for pit window",
  "pit next lap, we'll go for a quick stop",
  "prepare to box next time around",
];
const RADIO_FLAWLESS = [
  "flawless so far, don't lift",
  "perfect run, keep this pace up",
  "zero mistakes, you're in the zone",
];
const RADIO_STRUGGLING = [
  "tough weekend, let's finish strong",
  "keep pushing, anything can happen",
  "head down, points are still possible",
];
const RADIO_CORRECT = [
  "good pace, tyres are in the window",
  "nice work, gap's looking healthy",
  "solid lap, keep this rhythm",
];
const RADIO_INCORRECT = [
  "we'll get that back, stay focused",
  "no worries, long race ahead",
  "shake it off, plenty of laps to recover",
];
const RADIO_NEUTRAL = [
  "copy, keep your head down",
  "understood, maintain position",
  "roger, stay on plan",
];

const getRadioMessage = (opts: {
  currentLap: number;
  totalLaps: number;
  score: number;
  pitStopLap: number;
  lastAnswerCorrect: boolean | null;
}): string => {
  const { currentLap, totalLaps, score, pitStopLap, lastAnswerCorrect } = opts;
  // Deterministic pick: branch index adds variety across conditions on the same lap
  const pick = (pool: string[], branch: number) =>
    pool[(currentLap * 7 + totalLaps + branch * 13) % pool.length];

  if (currentLap === 0) return pick(RADIO_START, 0);
  if (currentLap === pitStopLap) return pick(RADIO_POST_PIT, 1);
  if (currentLap === totalLaps - 1) return pick(RADIO_LAST_LAP, 2);
  if (currentLap === pitStopLap - 1) return pick(RADIO_PRE_PIT, 3);
  if (score > 0 && score === currentLap) return pick(RADIO_FLAWLESS, 4);
  if (score === 0 && currentLap > 2) return pick(RADIO_STRUGGLING, 5);
  if (lastAnswerCorrect === true) return pick(RADIO_CORRECT, 6);
  if (lastAnswerCorrect === false) return pick(RADIO_INCORRECT, 7);
  return pick(RADIO_NEUTRAL, 8);
};

const clampPercent = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const clampToSegment = (value: number, start: number, end: number, padding = 0.2) => {
  const min = Math.min(start, end) + padding;
  const max = Math.max(start, end) - padding;
  return clampPercent(value, min, max);
};

const getSegmentCheckpoints = (
  start: number,
  end: number,
  count: number,
  edgeInsetPercent: number,
) => {
  if (count <= 0) return [];

  const segmentWidth = Math.max(end - start, 0);
  const maxInset = Math.max(segmentWidth / 2 - 0.01, 0);
  const safeInset = Math.min(Math.max(edgeInsetPercent, 0), maxInset);
  const innerStart = start + safeInset;
  const innerEnd = end - safeInset;

  return Array.from({ length: count }, (_, index) => {
    return innerStart + ((innerEnd - innerStart) * (index + 1)) / (count + 1);
  });
};

const raceMiniBorderColors = [
  "border-zinc-300",
  "border-zinc-300",
  "border-zinc-300",
  "border-zinc-300",
  "border-zinc-300",
  "border-zinc-300",
] as const;

const mirroredCarStyle = {
  display: "inline-block",
  transform: "scaleX(-1)",
} as const;

const chequeredMarkerFillStyle = {
  backgroundColor: "#09090b",
  backgroundImage:
    "linear-gradient(45deg,#f4f4f5 25%,transparent 25%),linear-gradient(-45deg,#f4f4f5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f4f4f5 75%),linear-gradient(-45deg,transparent 75%,#f4f4f5 75%)",
  backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0",
  backgroundSize: "6px 6px",
} as const;

const getNowMs = () => performance.now();

const getStoredBestReaction = () => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("f1-best-reaction-ms");
  return stored ? Number(stored) : null;
};

const getStoredBestScore = () => {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem("f1-best-score");
  return stored ? Number(stored) : 0;
};

const getStageTitle = (opts: {
  stage: Stage;
  formationMode: FormationMode;
  currentLap: number;
  totalLaps: number;
}) => {
  const { stage, formationMode, currentLap, totalLaps } = opts;

  if (stage === "formation") {
    return formationMode === "drill" ? "starting-lights sequence" : "formation lap (practice)";
  }
  if (stage === "race") {
    return `grand prix live · lap ${currentLap + 1}/${totalLaps}`;
  }
  if (stage === "pitstop") {
    return "pit stop window";
  }
  if (stage === "finish_intro") {
    return "chequered flag cutscene";
  }

  return "race report";
};

const getNextRaceButtonLabel = (opts: { currentLap: number; totalLaps: number; pitStopLap: number }) => {
  const { currentLap, totalLaps, pitStopLap } = opts;

  if (currentLap === totalLaps - 1) return "chequered flag ->";
  if (currentLap === pitStopLap - 1) return "box, box! ->";
  return "next lap ->";
};

const clearTimerList = (timerListRef: { current: number[] }) => {
  timerListRef.current.forEach((timer) => window.clearTimeout(timer));
  timerListRef.current = [];
};

export default function Home() {
  const [flowState, dispatch] = useReducer(
    flowReducer,
    undefined,
    () =>
      createInitialFlowState({
        weekendQuestions: initialWeekendQuestions,
        tutorialStepCount: tutorialSteps.length,
        bestReactionMs: getStoredBestReaction(),
        bestScore: getStoredBestScore(),
      }),
  );

  const [isMobileTrack, setIsMobileTrack] = useState(false);
  const [isTouchLikeDevice, setIsTouchLikeDevice] = useState(false);
  const [v2WarmupLocked, setV2WarmupLocked] = useState(false);
  const [formationTravelPending, setFormationTravelPending] = useState(false);
  const [v2Launching, setV2Launching] = useState(false);
  const [pitElapsedMs, setPitElapsedMs] = useState<number | null>(null);
  const [jumpStartCount, setJumpStartCount] = useState(0);
  const [raceSim, setRaceSim] = useState<RaceSim | null>(null);
  const [pitSequenceProfile, setPitSequenceProfile] =
    useState<UiVersion>("v1");
  const [raceSequenceProfile, setRaceSequenceProfile] =
    useState<UiVersion | null>(null);
  const [pitRejoinPending, setPitRejoinPending] = useState(false);

  const timersRef = useRef<number[]>([]);
  const soundTimersRef = useRef<number[]>([]);
  const v2TimersRef = useRef<number[]>([]);
  const goTimeRef = useRef<number | null>(null);
  const pitStartRef = useRef<number | null>(null);
  const pitAttemptIdRef = useRef(0);
  const pitRejoinTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const flowStateRef = useRef(flowState);
  const skipInitialPreferenceSaveRef = useRef(true);
  const formationSequenceProfileRef = useRef<UiVersion | null>(null);
  const formationTravelPendingRef = useRef(false);
  const formationAutoStartedRef = useRef(false);
  const startReactionSequenceRef = useRef<(profile: UiVersion) => void>(() => {});

  const stage = flowState.stage;
  const formationMode = flowState.formationMode;
  const uiVersion = flowState.uiVersion;
  const v2Mode = flowState.v2Mode;
  const weekendQuestions = flowState.weekendQuestions;
  const currentLap = flowState.currentLap;
  const lapAnswers = flowState.lapAnswers;
  const tutorialStep = flowState.tutorialStep;
  const tutorialAnswers = flowState.tutorialAnswers;
  const reactionPhase: ReactionPhase =
    flowState.startDrill.phase === "idle" && flowState.startDrill.resultMs !== null
      ? "success"
      : flowState.startDrill.phase;
  const reactionLights = flowState.startDrill.lightsOnCount;
  const reactionMs = flowState.startDrill.resultMs;
  const pitStarted = flowState.pitStop.phase === "running";
  const pitStep = flowState.pitStop.step;
  const pitPenalty = flowState.pitStop.penaltyMs;
  const pitMessage = flowState.pitStop.message;
  const pitTimeMs = flowState.pitStop.resultMs;
  const bestReactionMs = flowState.bestReactionMs;
  const bestScore = flowState.bestScore;

  const totalLaps = weekendQuestions.length;
  const pitStopLap = Math.floor(totalLaps / 2);
  const grandPrixMarkerPos = isMobileTrack
    ? MOBILE_GRAND_PRIX_MARKER_POS
    : DESKTOP_GRAND_PRIX_MARKER_POS;
  const raceTrackWidth = finishMarkerPos - grandPrixMarkerPos;
  const question = weekendQuestions[currentLap] ?? weekendQuestions[0] ?? initialWeekendQuestions[0];
  const selectedForCurrentLap = lapAnswers[currentLap] ?? null;
  const isCurrentLapCorrect =
    selectedForCurrentLap !== null && selectedForCurrentLap === question.answer;
  const v2RaceSequencePending =
    stage === "race" &&
    raceSequenceProfile === "v2" &&
    selectedForCurrentLap !== null;
  const v2FormationSequencePending =
    formationTravelPending &&
    formationSequenceProfileRef.current === "v2";
  const v2FinishSequencePending =
    stage === "finish_intro" && raceSequenceProfile === "v2";
  const v2OriginSequencePending =
    v2WarmupLocked ||
    v2FormationSequencePending ||
    v2Launching ||
    v2RaceSequencePending ||
    pitRejoinPending ||
    v2FinishSequencePending;

  const score = useMemo(
    () =>
      lapAnswers.reduce<number>((total, answer, lapIndex) => {
        if (answer === null) return total;
        return answer === weekendQuestions[lapIndex]?.answer ? total + 1 : total;
      }, 0),
    [lapAnswers, weekendQuestions],
  );

  const tutorialCurrent = tutorialSteps[tutorialStep];
  const tutorialSelected = tutorialAnswers[tutorialStep] ?? null;
  const isCurrentTutorialCorrect =
    tutorialSelected !== null && tutorialSelected === tutorialCurrent.answer;

  const hasCompletedStartDrill = selectStartComplete(flowState);
  const hasCompletedPitStop = selectPitComplete(flowState);
  const showStartDrillWarning = selectStartWarning(flowState);
  const showPitWarning = selectPitWarning(flowState);
  const showStartSkip = selectStartSkipVisible(flowState);
  const showPitSkip = selectPitSkipVisible(flowState);
  const finishChips = selectFinishChips(flowState);

  const quizProgress = useMemo(() => ((currentLap + 1) / totalLaps) * 100, [currentLap, totalLaps]);
  const activePitBands = useMemo(
    () => (isTouchLikeDevice ? MOBILE_PIT_BANDS : DESKTOP_PIT_BANDS),
    [isTouchLikeDevice],
  );
  const tutorialEdgeInset = isMobileTrack ? MOBILE_TUTORIAL_EDGE_INSET : 0;
  const raceEdgeInset = isMobileTrack ? MOBILE_RACE_EDGE_INSET : 0;
  const tutorialMarkerNudge = isMobileTrack ? TUTORIAL_NUDGE_RIGHT_MOBILE_TABLET : 0;
  const postPitMarkerNudge = isMobileTrack ? -POST_PIT_NUDGE_LEFT_MOBILE_TABLET : 0;

  const finishLabel = useMemo(() => {
    if (score === 0) return "DNF — did not finish";
    const ratio = score / totalLaps;
    if (ratio === 1) return "perfect finish — P1";
    if (ratio >= 0.75) return "podium finish";
    if (ratio >= 0.5) return "points finish";
    return "back of the grid";
  }, [score, totalLaps]);

  const finishTier = useMemo(() => {
    if (score === 0) return 0;
    const ratio = score / totalLaps;
    if (ratio === 1) return 1;
    if (ratio >= 0.75) return 2;
    if (ratio >= 0.5) return 3;
    return 4;
  }, [score, totalLaps]);

  const finishSparkles = useMemo(() => {
    const count = finishTier === 1 ? 6 : finishTier === 2 ? 4 : 0;
    return Array.from({ length: count }, (_, index) => {
      const angle = isMobileTrack
        ? (index / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2
        : (index / Math.max(count, 1)) * Math.PI * 1.8 + 0.35;
      const radiusX = 13;
      const radiusY = isMobileTrack ? 14 : 19;
      return {
        id: `sparkle-${index}`,
        left: `${76 + Math.cos(angle) * radiusX}%`,
        top: `${44 + Math.sin(angle) * radiusY + (index === 0 && !isMobileTrack ? -7.2 : 0)}%`,
        delay: 1.5 + index * 0.18,
      };
    });
  }, [finishTier, isMobileTrack]);

  const pitStopMarkerPos = useMemo(() => {
    const basePosition = grandPrixMarkerPos + raceTrackWidth * (pitStopLap / totalLaps);
    if (!isMobileTrack) return basePosition;
    return clampToSegment(
      basePosition - MOBILE_PIT_STOP_LEFT_SHIFT,
      grandPrixMarkerPos,
      finishMarkerPos,
    );
  }, [grandPrixMarkerPos, isMobileTrack, pitStopLap, raceTrackWidth, totalLaps]);

  const formationAnchor = 0;
  const grandPrixAnchor = grandPrixMarkerPos;
  const pitAnchor = pitStopMarkerPos;
  const finishAnchor = finishMarkerPos;

  const tutorialMarkerStates = useMemo<MarkerState[]>(
    () =>
      tutorialSteps.map((step, stepIndex) => {
        const answer = tutorialAnswers[stepIndex];
        if (answer === null) return "unanswered";
        return answer === step.answer ? "correct" : "incorrect";
      }),
    [tutorialAnswers],
  );

  const raceMarkerStates = useMemo<MarkerState[]>(
    () =>
      weekendQuestions.map((weekendQuestion, lapIndex) => {
        const answer = lapAnswers[lapIndex];
        if (answer === null) return "unanswered";
        return answer === weekendQuestion.answer ? "correct" : "incorrect";
      }),
    [lapAnswers, weekendQuestions],
  );

  const lastAnswerCorrect: boolean | null = useMemo(() => {
    if (currentLap === 0) return null;
    const prev = raceMarkerStates[currentLap - 1];
    if (prev === "unanswered") return null;
    return prev === "correct";
  }, [currentLap, raceMarkerStates]);

  const radioMessage = useMemo(
    () => getRadioMessage({ currentLap, totalLaps, score, pitStopLap, lastAnswerCorrect }),
    [currentLap, totalLaps, score, pitStopLap, lastAnswerCorrect],
  );

  const baseTutorialCheckpoints = useMemo(
    () => getSegmentCheckpoints(formationAnchor, grandPrixAnchor, tutorialSteps.length, tutorialEdgeInset),
    [formationAnchor, grandPrixAnchor, tutorialEdgeInset],
  );

  const tutorialCheckpoints = useMemo(
    () =>
      baseTutorialCheckpoints.map((checkpoint) =>
        clampToSegment(checkpoint + tutorialMarkerNudge, formationAnchor, grandPrixAnchor),
      ),
    [baseTutorialCheckpoints, formationAnchor, grandPrixAnchor, tutorialMarkerNudge],
  );

  const basePrePitCheckpoints = useMemo(
    () => getSegmentCheckpoints(grandPrixAnchor, pitAnchor, pitStopLap, raceEdgeInset),
    [grandPrixAnchor, pitAnchor, pitStopLap, raceEdgeInset],
  );

  const prePitCheckpoints = useMemo(() => basePrePitCheckpoints, [basePrePitCheckpoints]);

  const postPitLapCount = Math.max(totalLaps - pitStopLap, 0);

  const basePostPitCheckpoints = useMemo(
    () => getSegmentCheckpoints(pitAnchor, finishAnchor, postPitLapCount, raceEdgeInset),
    [finishAnchor, pitAnchor, postPitLapCount, raceEdgeInset],
  );

  const postPitCheckpoints = useMemo(
    () =>
      basePostPitCheckpoints.map((checkpoint) =>
        clampToSegment(checkpoint + postPitMarkerNudge, pitAnchor, finishAnchor),
      ),
    [basePostPitCheckpoints, finishAnchor, pitAnchor, postPitMarkerNudge],
  );

  const raceCheckpoints = useMemo(
    () => [...prePitCheckpoints, ...postPitCheckpoints],
    [postPitCheckpoints, prePitCheckpoints],
  );

  const progressBarCarFinalPosition = {
    successOffsetFromFinish: isMobileTrack ? 1.2 : 0.5,
    dnfStopFactor: isMobileTrack ? 0.36 : 0.5,
  };

  const successTrackPercent = useMemo(
    () => finishAnchor - progressBarCarFinalPosition.successOffsetFromFinish,
    [finishAnchor, progressBarCarFinalPosition.successOffsetFromFinish],
  );

  const dnfTrackPercent = useMemo(() => {
    const lastRaceMarker = raceCheckpoints[raceCheckpoints.length - 1] ?? pitAnchor;
    const stopFactor = progressBarCarFinalPosition.dnfStopFactor;
    return lastRaceMarker + (finishAnchor - lastRaceMarker) * stopFactor;
  }, [finishAnchor, pitAnchor, progressBarCarFinalPosition.dnfStopFactor, raceCheckpoints]);

  const currentTrackPercent = useMemo(() => {
    if (stage === "formation") {
      if (formationMode === "intro") return formationAnchor;
      if (formationMode === "drill") return grandPrixAnchor;
      return tutorialCheckpoints[tutorialStep] ?? tutorialCheckpoints[tutorialCheckpoints.length - 1] ?? 0;
    }

    if (stage === "race") {
      return raceCheckpoints[currentLap] ?? finishAnchor;
    }

    if (stage === "pitstop") {
      return pitAnchor;
    }

    return finishTier === 0 ? dnfTrackPercent : successTrackPercent;
  }, [
    currentLap,
    dnfTrackPercent,
    finishAnchor,
    finishTier,
    formationAnchor,
    formationMode,
    grandPrixAnchor,
    pitAnchor,
    raceCheckpoints,
    successTrackPercent,
    stage,
    tutorialCheckpoints,
    tutorialStep,
  ]);

  const formationFillWidth = clampPercent(currentTrackPercent, formationAnchor, grandPrixAnchor);
  const raceFillWidth = clampPercent(
    currentTrackPercent - grandPrixAnchor,
    0,
    finishAnchor - grandPrixAnchor,
  );

  const scoreValueClass = getScoreValueClass(score);
  const bestScoreValueClass = getScoreValueClass(bestScore);

  const isFinishStage = stage === "finish_intro" || stage === "finished";
  const isDnfFinish = isFinishStage && finishTier === 0;
  const trackCarMoveDuration = isFinishStage ? 0.16 : 0.3;
  const trackCrashDelay = 0.18;
  const formationActive = true;
  const grandPrixActive = hasCompletedStartDrill;
  const pitStopActive = hasCompletedPitStop;
  const chequeredActive = isFinishStage;
  const grandPrixBand = reactionMs === null ? null : getReactionBand(reactionMs);
  const pitStopBand = pitTimeMs === null ? null : getPitBand(pitTimeMs, activePitBands);

  useEffect(() => {
    const storedPreferences = loadUiPreferences();
    dispatch({ type: "SET_UI_VERSION", uiVersion: storedPreferences.uiVersion });
    dispatch({ type: "SET_V2_MODE", mode: storedPreferences.v2Mode });
    saveUiPreferences(storedPreferences);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.uiVersion = uiVersion;
    document.documentElement.dataset.v2Mode = v2Mode;

    if (skipInitialPreferenceSaveRef.current) {
      skipInitialPreferenceSaveRef.current = false;
      return;
    }
    saveUiPreferences({ uiVersion, v2Mode });
  }, [uiVersion, v2Mode]);

  useEffect(() => {
    flowStateRef.current = flowState;
  }, [flowState]);

  useEffect(() => {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const geometrySvg = document.createElementNS(svgNamespace, "svg");
    const mainPath = document.createElementNS(svgNamespace, "path");
    const pitPath = document.createElementNS(svgNamespace, "path");

    geometrySvg.setAttribute("aria-hidden", "true");
    geometrySvg.setAttribute("viewBox", "55 5 945 510");
    geometrySvg.style.position = "fixed";
    geometrySvg.style.width = "0";
    geometrySvg.style.height = "0";
    geometrySvg.style.visibility = "hidden";
    geometrySvg.style.pointerEvents = "none";
    mainPath.setAttribute("d", MONZA_MAIN_TRACK_PATH_D);
    pitPath.setAttribute("d", MONZA_PIT_LANE_PATH_D);
    geometrySvg.append(mainPath, pitPath);
    document.body.append(geometrySvg);

    const instance = createRaceSim({
      geometry: createSvgPathGeometrySampler(mainPath, pitPath),
    });
    instance.start();
    const revealSimFrame = window.requestAnimationFrame(() => {
      setRaceSim(instance);
    });

    return () => {
      window.cancelAnimationFrame(revealSimFrame);
      instance.destroy();
      geometrySvg.remove();
    };
  }, []);

  useEffect(() => {
    if (!raceSim) return;

    let phase: RaceSimPhase;
    if (flowState.stage === "formation") {
      if (flowState.formationMode === "intro") {
        phase = "grid";
      } else if (flowState.formationMode === "briefing") {
        phase = "formation";
      } else if (v2Launching) {
        phase = "launch";
      } else if (flowState.startDrill.phase === "countdown") {
        phase = "lights";
      } else if (flowState.startDrill.phase === "go") {
        phase = "go";
      } else if (flowState.startDrill.phase === "early") {
        phase = "jump";
      } else if (flowState.startDrill.resultMs !== null) {
        phase = "reacted";
      } else {
        phase = "forming";
      }
    } else if (flowState.stage === "race") {
      const presentationPhase = flowState.racePresentation.phase;
      if (presentationPhase === "lap") {
        phase = "lap";
      } else if (
        presentationPhase === "result" &&
        raceSim.getFrame().lap.active
      ) {
        // Keep the visual lap script running when V1 reveals immediately.
        phase = "lap";
      } else {
        phase = presentationPhase === "result" ? "result" : "question";
      }
    } else if (flowState.stage === "pitstop") {
      phase = "pit";
    } else if (
      flowState.stage === "finish_intro" &&
      flowState.finalPosition === "DNF"
    ) {
      phase = "dnf";
    } else {
      phase = "finish";
    }

    const answeredFormationSector =
      flowState.formationMode === "briefing" &&
      flowState.tutorialAnswers[flowState.tutorialStep] !== null
        ? 1
        : 0;
    const formationSector = Math.min(
      3,
      flowState.tutorialStep + answeredFormationSector,
    ) as RaceSimGameSnapshot["formationSector"];
    const currentLedgerEntry = flowState.raceLedger[flowState.currentLap];

    raceSim.sync({
      phase,
      lap: flowState.currentLap,
      ledgerPosition:
        flowState.finalPosition === "DNF"
          ? "DNF"
          : flowState.currentPosition,
      lastAnswerCorrect:
        currentLedgerEntry?.result === null ||
        currentLedgerEntry?.result === undefined
          ? null
          : currentLedgerEntry.result === "correct",
      formationSector,
      pitState:
        flowState.stage !== "pitstop"
          ? "none"
          : flowState.pitStop.resultMs !== null
            ? "done"
            : flowState.pitStop.phase === "running"
              ? "running"
              : "idle",
    });
  }, [flowState, raceSim, v2Launching]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mobileTrackQuery = window.matchMedia("(max-width: 639px)");

    const updateIsMobileTrack = () => {
      setIsMobileTrack(mobileTrackQuery.matches);
    };

    updateIsMobileTrack();

    if (typeof mobileTrackQuery.addEventListener === "function") {
      mobileTrackQuery.addEventListener("change", updateIsMobileTrack);
      return () => {
        mobileTrackQuery.removeEventListener("change", updateIsMobileTrack);
      };
    }

    mobileTrackQuery.addListener(updateIsMobileTrack);
    return () => {
      mobileTrackQuery.removeListener(updateIsMobileTrack);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const anyPointerQuery = window.matchMedia("(any-pointer: coarse)");

    const updateIsTouchLikeDevice = () => {
      const hasTouch = navigator.maxTouchPoints > 0;
      const coarsePointer = pointerQuery.matches || anyPointerQuery.matches;
      setIsTouchLikeDevice(hasTouch || coarsePointer);
    };

    updateIsTouchLikeDevice();

    const handleChange = () => {
      updateIsTouchLikeDevice();
    };

    if (typeof pointerQuery.addEventListener === "function") {
      pointerQuery.addEventListener("change", handleChange);
      anyPointerQuery.addEventListener("change", handleChange);
      return () => {
        pointerQuery.removeEventListener("change", handleChange);
        anyPointerQuery.removeEventListener("change", handleChange);
      };
    }

    pointerQuery.addListener(handleChange);
    anyPointerQuery.addListener(handleChange);
    return () => {
      pointerQuery.removeListener(handleChange);
      anyPointerQuery.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (bestReactionMs === null) return;
    window.localStorage.setItem("f1-best-reaction-ms", String(bestReactionMs));
  }, [bestReactionMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("f1-best-score", String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    if (!pitStarted || pitStartRef.current === null || uiVersion !== "v2") return;

    const updatePitClock = () => {
      const startedAt = pitStartRef.current;
      if (startedAt === null) return;
      setPitElapsedMs(Math.round(getNowMs() - startedAt + pitPenalty));
    };

    updatePitClock();
    const timer = window.setInterval(updatePitClock, 100);
    return () => window.clearInterval(timer);
  }, [pitPenalty, pitStarted, uiVersion]);

  useEffect(() => {
    return () => {
      clearTimerList(timersRef);
      clearTimerList(soundTimersRef);
      clearTimerList(v2TimersRef);
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
      if (pitRejoinTimerRef.current !== null) {
        window.clearTimeout(pitRejoinTimerRef.current);
      }
    };
  }, []);

  const clearReactionTimers = () => {
    clearTimerList(timersRef);
    goTimeRef.current = null;
  };

  const clearSoundTimers = () => {
    clearTimerList(soundTimersRef);
  };

  const clearV2Timers = () => {
    clearTimerList(v2TimersRef);
  };

  const cancelPitRejoin = () => {
    pitAttemptIdRef.current += 1;
    if (pitRejoinTimerRef.current !== null) {
      window.clearTimeout(pitRejoinTimerRef.current);
      pitRejoinTimerRef.current = null;
    }
    setPitRejoinPending(false);
  };

  const clearFinishTimer = () => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const playBeep = (
    frequency: number,
    durationMs = 120,
    options?: { waveform?: OscillatorType; volume?: number },
  ) => {
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    const ctx = audioCtxRef.current;
    void ctx.resume();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = options?.waveform ?? "square";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(options?.volume ?? 0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    oscillator.start(now);
    oscillator.stop(now + durationMs / 1000 + 0.02);
  };

  const playBeepSequence = (opts: {
    frequencies: number[];
    noteDurationMs: number;
    gapMs: number;
    waveform?: OscillatorType;
    volume?: number;
  }) => {
    const { frequencies, noteDurationMs, gapMs, waveform = "triangle", volume = 0.14 } = opts;

    frequencies.forEach((frequency, index) => {
      const timer = window.setTimeout(() => {
        playBeep(frequency, noteDurationMs, { waveform, volume });
      }, index * (noteDurationMs + gapMs));
      soundTimersRef.current.push(timer);
    });
  };

  const playFinishFanfare = () => {
    clearSoundTimers();

    const notes = [620, 760, 920, 1180, 980];
    notes.forEach((note, index) => {
      const timer = window.setTimeout(() => {
        playBeep(note, index === notes.length - 1 ? 220 : 130);
      }, index * 140);
      soundTimersRef.current.push(timer);
    });
  };

  const playArrowButtonSound = () => {
    playBeep(430, 42, { waveform: "sine", volume: 0.12 });
  };

  const playPrepActionSound = () => {
    playBeepSequence({
      frequencies: [500, 620],
      noteDurationMs: 48,
      gapMs: 14,
      waveform: "triangle",
      volume: 0.14,
    });
  };

  const playRestartSound = () => {
    playBeepSequence({
      frequencies: [700, 560, 430],
      noteDurationMs: 55,
      gapMs: 18,
      waveform: "triangle",
      volume: 0.16,
    });
  };

  const playRunAgainSound = () => {
    playBeepSequence({
      frequencies: [980, 760],
      noteDurationMs: 48,
      gapMs: 12,
      waveform: "triangle",
      volume: 0.14,
    });
  };

  const playAnswerCorrectSound = () => {
    playBeepSequence({
      frequencies: [540, 660, 820],
      noteDurationMs: 34,
      gapMs: 8,
      waveform: "triangle",
      volume: 0.14,
    });
  };

  const playAnswerWrongSound = () => {
    playBeepSequence({
      frequencies: [430, 330],
      noteDurationMs: 58,
      gapMs: 12,
      waveform: "triangle",
      volume: 0.13,
    });
  };

  const handleTutorialPick = (optionIndex: number) => {
    if (
      v2WarmupLocked ||
      stage !== "formation" ||
      formationMode !== "briefing" ||
      tutorialSelected !== null
    ) {
      return;
    }
    const isCorrect = optionIndex === tutorialSteps[tutorialStep]?.answer;
    if (isCorrect) {
      playAnswerCorrectSound();
    } else {
      playAnswerWrongSound();
    }
    dispatch({ type: "TUTORIAL_PICK", optionIndex });
  };

  const handleV2WarmupAnswer = (optionIndex: number) => {
    if (stage !== "formation" || formationMode !== "briefing" || tutorialSelected !== null) return;

    const isCorrect = optionIndex === tutorialSteps[tutorialStep]?.answer;
    if (isCorrect) {
      playAnswerCorrectSound();
    } else {
      playAnswerWrongSound();
    }

    clearV2Timers();
    setV2WarmupLocked(true);
    dispatch({ type: "TUTORIAL_PICK", optionIndex });
    const timer = window.setTimeout(() => {
      setV2WarmupLocked(false);
    }, SEQUENCE_TIMINGS.v2.formationLockMs);
    v2TimersRef.current.push(timer);
  };

  const goToNextBriefing = () => {
    if (v2WarmupLocked) return;
    playArrowButtonSound();
    setV2WarmupLocked(false);
    dispatch({ type: "TUTORIAL_NEXT" });
  };

  const goToPreviousBriefing = () => {
    if (v2WarmupLocked) return;
    playArrowButtonSound();
    dispatch({ type: "TUTORIAL_PREVIOUS" });
  };

  const skipFormationLab = () => {
    if (v2WarmupLocked) return;
    playArrowButtonSound();
    formationTravelPendingRef.current = false;
    setFormationTravelPending(false);
    formationSequenceProfileRef.current ??= uiVersion;
    raceSim?.publish({ type: "formation:finish", rushed: true });
    dispatch({ type: "FORMATION_SKIP_TO_DRILL" });
  };

  const startFormationLapTutorial = () => {
    playArrowButtonSound();
    formationSequenceProfileRef.current = uiVersion;
    formationTravelPendingRef.current = true;
    setFormationTravelPending(true);
    formationAutoStartedRef.current = false;
    raceSim?.publish({ type: "formation:start" });
    dispatch({ type: "START_FORMATION_TUTORIAL" });
  };

  const jumpToTrackCard = (target: TrackTarget) => {
    if (v2OriginSequencePending) return;
    playArrowButtonSound();
    clearReactionTimers();
    clearV2Timers();
    clearFinishTimer();
    cancelPitRejoin();
    setV2WarmupLocked(false);
    setV2Launching(false);
    pitStartRef.current = null;
    setPitElapsedMs(null);
    setRaceSequenceProfile(null);
    setPitSequenceProfile("v1");
    formationSequenceProfileRef.current =
      target.kind === "formation_intro" ||
      target.kind === "tutorial" ||
      target.kind === "formation_drill"
        ? "v1"
        : null;
    formationAutoStartedRef.current = false;
    formationTravelPendingRef.current = false;
    setFormationTravelPending(false);
    if (raceSim?.getFrame().lap.active) {
      raceSim.publish({ type: "lap:skip" });
    }
    dispatch({ type: "NAVIGATE", target });
  };

  const startReactionSequence = (profile: UiVersion, withActivationBeep = true) => {
    if (stage !== "formation" || formationMode !== "drill") return;

    clearReactionTimers();
    if (withActivationBeep) {
      playPrepActionSound();
    }
    dispatch({ type: "START_DRILL_INITIATE" });

    const scheduledTimers = scheduleReactionTimeline(
      createReactionTimeline(profile),
      (callback, delayMs) => window.setTimeout(callback, delayMs),
      {
        onLight: (lightsOnCount) => {
          dispatch({ type: "START_DRILL_SET_LIGHTS", lightsOnCount });
          playBeep(760 + lightsOnCount * 30, 100);
        },
        onGo: () => {
          dispatch({ type: "START_DRILL_GO" });
          goTimeRef.current = getNowMs();
          playBeep(520, 180);
        },
      },
    );
    timersRef.current.push(...scheduledTimers);
  };

  useEffect(() => {
    startReactionSequenceRef.current = startReactionSequence;
  });

  useEffect(() => {
    if (!raceSim) return;

    return raceSim.subscribe((frame) => {
      const current = flowStateRef.current;
      const originatingProfile =
        formationSequenceProfileRef.current ?? current.uiVersion;
      const shouldAutoStart =
        originatingProfile === "v2" || current.uiVersion === "v2";
      const readyForLights =
        current.stage === "formation" &&
        current.formationMode === "drill" &&
        current.startDrill.phase === "idle" &&
        current.startDrill.resultMs === null;

      if (formationTravelPendingRef.current && frame.formation.arrived) {
        formationTravelPendingRef.current = false;
        setFormationTravelPending(false);
      }

      if (
        shouldAutoStart &&
        readyForLights &&
        frame.formation.arrived &&
        !formationAutoStartedRef.current
      ) {
        formationAutoStartedRef.current = true;
        startReactionSequenceRef.current(originatingProfile);
      }
    });
  }, [raceSim]);

  const handleRunAgainStartDrill = () => {
    if (v2Launching) return;
    playRunAgainSound();
    dispatch({ type: "START_DRILL_RETRY" });
    startReactionSequence("v1", false);
  };

  const handleStartDrillSequence = () => {
    formationAutoStartedRef.current = true;
    startReactionSequence("v1");
  };

  const handleV2StartDrillSequence = () => {
    formationAutoStartedRef.current = true;
    startReactionSequence("v2");
  };

  const handleV2RunAgainStartDrill = () => {
    playRunAgainSound();
    dispatch({ type: "START_DRILL_RETRY" });
    startReactionSequence("v2", false);
  };

  const handleReactionTap = () => {
    dispatch({ type: "START_DRILL_LAUNCH" });

    if (reactionPhase === "countdown") {
      setJumpStartCount((count) => count + 1);
      clearReactionTimers();
      dispatch({ type: "START_DRILL_EARLY" });
      playBeep(220, 220);
      return;
    }

    if (reactionPhase === "go" && goTimeRef.current !== null) {
      const time = Math.round(getNowMs() - goTimeRef.current);
      dispatch({ type: "START_DRILL_COMPLETE", timeMs: time });
      clearReactionTimers();
      playBeep(960, 140);
    }
  };

  const goPreviousFromStartDrill = () => {
    if (v2Launching) return;
    playArrowButtonSound();
    clearReactionTimers();
    formationSequenceProfileRef.current = "v1";
    formationAutoStartedRef.current = false;
    formationTravelPendingRef.current = false;
    setFormationTravelPending(false);
    dispatch({ type: "NAVIGATE", target: { kind: "tutorial", stepIndex: tutorialSteps.length - 1 } });
  };

  const goNextFromStartDrill = () => {
    playArrowButtonSound();
    clearReactionTimers();
    formationSequenceProfileRef.current = null;
    formationAutoStartedRef.current = false;
    formationTravelPendingRef.current = false;
    setFormationTravelPending(false);
    dispatch({ type: "NAVIGATE", target: { kind: "lap", lapIndex: 0 } });
  };

  const skipStartDrill = () => {
    dispatch({ type: "START_DRILL_SKIP" });
    goNextFromStartDrill();
  };

  const startRace = () => {
    if (v2Launching) return;
    goNextFromStartDrill();
  };

  const startV2Race = () => {
    if (reactionMs === null || v2Launching) return;
    clearV2Timers();
    setV2Launching(true);
    raceSim?.publish({ type: "launch" });
    const timer = window.setTimeout(() => {
      setV2Launching(false);
      goNextFromStartDrill();
    }, SEQUENCE_TIMINGS.v2.launchMs);
    v2TimersRef.current.push(timer);
  };

  const goPreviousFromRace = () => {
    if (stage !== "race" || v2RaceSequencePending) return;
    playArrowButtonSound();
    if (raceSim?.getFrame().lap.active) {
      raceSim.publish({ type: "lap:skip" });
    }
    dispatch({ type: "RACE_PREVIOUS" });
  };

  const handlePick = (optionIndex: number) => {
    if (stage !== "race" || selectedForCurrentLap !== null) return;
    setRaceSequenceProfile("v1");
    const isCorrect = optionIndex === weekendQuestions[currentLap]?.answer;
    if (isCorrect) {
      playAnswerCorrectSound();
    } else {
      playAnswerWrongSound();
    }
    const nextLapAnswers = [...lapAnswers];
    nextLapAnswers[currentLap] = optionIndex;
    const nextLedger = recomputeRaceLedger(
      nextLapAnswers,
      weekendQuestions,
      flowState.raceCurve,
    );
    const target = nextLedger[currentLap];
    if (target) {
      raceSim?.publish({
        type: "lap:start",
        lap: currentLap,
        targetPosition: target.after,
        correct: target.result === "correct",
        durationMs: SEQUENCE_TIMINGS.v2.lapMs,
      });
    }
    dispatch({ type: "RACE_PICK", optionIndex });
    dispatch({ type: "RACE_REVEAL" });
  };

  const advanceV2Race = () => {
    const current = flowStateRef.current;
    if (current.stage !== "race") {
      return;
    }

    if (current.currentLap >= current.weekendQuestions.length - 1) {
      clearFinishTimer();
      dispatch({ type: "START_FINISH_INTRO" });
      playFinishFanfare();

      const currentScore = current.lapAnswers.reduce<number>((total, answer, lapIndex) => {
        if (answer === null) return total;
        return answer === current.weekendQuestions[lapIndex]?.answer ? total + 1 : total;
      }, 0);
      const finishDelayMs =
        currentScore === 0
          ? SEQUENCE_TIMINGS.v2.dnfMs
          : SEQUENCE_TIMINGS.v2.finishMs;
      finishTimerRef.current = window.setTimeout(() => {
        dispatch({ type: "FINISH_INTRO_DONE" });
        setRaceSequenceProfile(null);
        finishTimerRef.current = null;
      }, finishDelayMs);
      return;
    }

    playArrowButtonSound();
    setRaceSequenceProfile(null);
    dispatch({ type: "RACE_NEXT" });
  };

  const scheduleV2RaceAdvance = (delayMs = SEQUENCE_TIMINGS.v2.verdictMs) => {
    const timer = window.setTimeout(advanceV2Race, delayMs);
    v2TimersRef.current.push(timer);
  };

  const handleV2RaceAnswer = (optionIndex: number) => {
    if (stage !== "race" || selectedForCurrentLap !== null) return;
    setRaceSequenceProfile("v2");

    const isCorrect = optionIndex === weekendQuestions[currentLap]?.answer;
    if (isCorrect) {
      playAnswerCorrectSound();
    } else {
      playAnswerWrongSound();
    }

    clearV2Timers();
    const nextLapAnswers = [...lapAnswers];
    nextLapAnswers[currentLap] = optionIndex;
    const nextLedger = recomputeRaceLedger(
      nextLapAnswers,
      weekendQuestions,
      flowState.raceCurve,
    );
    const target = nextLedger[currentLap];
    if (target) {
      raceSim?.publish({
        type: "lap:start",
        lap: currentLap,
        targetPosition: target.after,
        correct: target.result === "correct",
        durationMs: SEQUENCE_TIMINGS.v2.lapMs,
      });
    }
    dispatch({ type: "RACE_PICK", optionIndex });

    v2TimersRef.current.push(
      ...scheduleV2LapTimeline(
        (callback, delayMs) => window.setTimeout(callback, delayMs),
        {
          onReveal: () => dispatch({ type: "RACE_REVEAL" }),
          onAdvance: advanceV2Race,
        },
      ),
    );
  };

  const handleV2SkipLap = () => {
    if (stage !== "race" || selectedForCurrentLap === null) return;
    clearV2Timers();
    raceSim?.publish({ type: "lap:skip" });
    dispatch({ type: "RACE_REVEAL" });
    scheduleV2RaceAdvance();
  };

  const runFinishSequence = () => {
    clearFinishTimer();
    dispatch({ type: "START_FINISH_INTRO" });
    playFinishFanfare();

    finishTimerRef.current = window.setTimeout(() => {
      dispatch({ type: "FINISH_INTRO_DONE" });
      finishTimerRef.current = null;
    }, SEQUENCE_TIMINGS.v1.finishMs);
  };

  const handleNextLap = () => {
    if (v2RaceSequencePending) return;
    clearV2Timers();
    if (raceSim?.getFrame().lap.active) {
      raceSim.publish({ type: "lap:skip" });
    }
    if (currentLap === totalLaps - 1) {
      setRaceSequenceProfile(null);
      runFinishSequence();
      return;
    }

    playArrowButtonSound();
    setRaceSequenceProfile(null);
    dispatch({ type: "RACE_NEXT" });
  };

  const startPitStop = () => {
    dispatch({ type: "PIT_BEGIN" });
    pitStartRef.current = getNowMs();
    setPitElapsedMs(0);
  };

  const handleBeginPitStop = () => {
    cancelPitRejoin();
    playPrepActionSound();
    setPitSequenceProfile(uiVersion);
    raceSim?.publish({ type: "pit:enter" });
    startPitStop();
  };

  const handleRetryPitStop = () => {
    if (pitRejoinPending) return;
    cancelPitRejoin();
    playRunAgainSound();
    setPitSequenceProfile(uiVersion);
    raceSim?.publish({ type: "pit:enter" });
    dispatch({ type: "PIT_RETRY" });
    pitStartRef.current = getNowMs();
    setPitElapsedMs(0);
  };

  const handlePitClick = (tyreIndex: number) => {
    if (!pitStarted) return;
    dispatch({ type: "PIT_CLICK", tyreIndex });

    const expectedTyre = pitOrder[pitStep];

    if (tyreIndex === expectedTyre) {
      if (pitStep === pitOrder.length - 1) {
        const rawElapsed = Math.round(
          getNowMs() - (pitStartRef.current ?? getNowMs()),
        );
        const elapsed = Math.round(
          rawElapsed + pitPenalty,
        );

        dispatch({ type: "PIT_COMPLETE", timeMs: elapsed });
        setPitElapsedMs(elapsed);
        raceSim?.publish({ type: "pit:complete" });
        playBeep(1000, 140);

        if (pitSequenceProfile === "v2") {
          const attemptId = pitAttemptIdRef.current;
          const rejoinDelayMs = getPitRejoinDelayMs(rawElapsed);
          setPitRejoinPending(true);
          pitRejoinTimerRef.current = window.setTimeout(() => {
            const current = flowStateRef.current;
            if (pitAttemptIdRef.current !== attemptId) return;
            pitRejoinTimerRef.current = null;
            if (
              current.stage !== "pitstop" ||
              current.pitStop.phase !== "idle" ||
              current.pitStop.resultMs === null
            ) {
              setPitRejoinPending(false);
              return;
            }
            setPitRejoinPending(false);
            advanceFromPitStop();
          }, rejoinDelayMs);
        }
        return;
      }

      dispatch({ type: "PIT_ADVANCE" });
      playBeep(860, 90);
      return;
    }

    dispatch({ type: "PIT_ADD_PENALTY", amountMs: 300 });
    playBeep(260, 180);
  };

  const goPreviousFromPitStop = () => {
    if (pitRejoinPending) return;
    playArrowButtonSound();
    cancelPitRejoin();
    pitStartRef.current = null;
    setPitElapsedMs(null);
    dispatch({ type: "NAVIGATE", target: { kind: "lap", lapIndex: Math.max(pitStopLap - 1, 0) } });
  };

  const advanceFromPitStop = () => {
    cancelPitRejoin();
    playArrowButtonSound();
    pitStartRef.current = null;
    setPitElapsedMs(null);
    dispatch({ type: "NAVIGATE", target: { kind: "lap", lapIndex: pitStopLap } });
  };

  const goNextFromPitStop = () => {
    if (pitRejoinPending) return;
    advanceFromPitStop();
  };

  const skipPitStop = () => {
    if (pitRejoinPending) return;
    dispatch({ type: "PIT_SKIP" });
    pitStartRef.current = null;
    setPitElapsedMs(null);
    advanceFromPitStop();
  };

  const goPreviousFromFinish = () => {
    playArrowButtonSound();
    dispatch({ type: "GO_PREVIOUS_FROM_FINISH" });
  };

  const restartWeekend = () => {
    clearReactionTimers();
    clearSoundTimers();
    clearV2Timers();
    clearFinishTimer();
    cancelPitRejoin();
    playRestartSound();
    setV2WarmupLocked(false);
    setV2Launching(false);
    setPitElapsedMs(null);
    setJumpStartCount(0);
    setRaceSequenceProfile(null);
    formationSequenceProfileRef.current = null;
    formationAutoStartedRef.current = false;
    formationTravelPendingRef.current = false;
    setFormationTravelPending(false);
    raceSim?.publish({ type: "reset" });

    const nextWeekendQuestions = getRandomWeekendQuestions();
    dispatch({ type: "RESTART_WEEKEND", weekendQuestions: nextWeekendQuestions });
    pitStartRef.current = null;
  };

  const switchUiVersion = (nextVersion: UiVersion) => {
    dispatch({ type: "SET_UI_VERSION", uiVersion: nextVersion });
  };

  const versionMarkHidden =
    stage === "formation" &&
    formationMode === "drill" &&
    (flowState.startDrill.phase === "countdown" || flowState.startDrill.phase === "go");

  const stageTitle = getStageTitle({ stage, formationMode, currentLap, totalLaps });

  const nextRaceButtonLabel = getNextRaceButtonLabel({ currentLap, totalLaps, pitStopLap });

  if (uiVersion === "v2") {
    const v2RacePhase =
      flowState.racePresentation.phase === "lap" ||
      flowState.racePresentation.phase === "result"
        ? flowState.racePresentation.phase
        : "question";

    return (
      <main
        data-skin="v2"
        data-mode={v2Mode}
        data-phase={v2RacePhase}
        className={`fixed inset-0 flex h-[100svh] w-full justify-center overflow-clip overscroll-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
          v2Mode === "notte" ? "bg-[#0e0e0e]" : "bg-[#f3edde]"
        }`}
      >
        <motion.div
          className="flex h-full w-full justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <MonzaV2Skin
            state={flowState}
            mode={v2Mode}
            raceSim={raceSim ?? undefined}
            racePhase={v2RacePhase}
            playerPosition={flowState.currentPosition}
            lapStartPosition={flowState.raceLedger[currentLap]?.before}
            banner={flowState.racePresentation.banner}
            pitElapsedMs={pitElapsedMs ?? pitTimeMs}
            jumpStartCount={jumpStartCount}
            warmupLocked={v2WarmupLocked}
            launching={v2Launching}
            onModeChange={(mode) => dispatch({ type: "SET_V2_MODE", mode })}
            onSwitchToV1={() => switchUiVersion("v1")}
            onStartFormation={startFormationLapTutorial}
            onWarmupAnswer={handleV2WarmupAnswer}
            onWarmupNext={goToNextBriefing}
            onWarmupSkip={skipFormationLab}
            onStartLights={handleV2StartDrillSequence}
            onLaunchTap={handleReactionTap}
            onRetryStart={handleV2RunAgainStartDrill}
            onBeginRace={startV2Race}
            onRaceAnswer={handleV2RaceAnswer}
            onSkipLap={handleV2SkipLap}
            onPitBegin={handleBeginPitStop}
            onPitTyre={handlePitClick}
            onPitContinue={goNextFromPitStop}
            pitRequiresManualContinue={
              pitTimeMs !== null && !pitRejoinPending
            }
            manualRaceAdvance={
              selectedForCurrentLap !== null &&
              flowState.racePresentation.phase === "result" &&
              raceSequenceProfile !== "v2"
            }
            onManualRaceAdvance={handleNextLap}
            onRestart={restartWeekend}
          />
        </motion.div>
      </main>
    );
  }

  return (
    <main
      data-skin="v1"
      data-phase={flowState.racePresentation.phase}
      className="relative h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_#fee2e2_0%,_#fff7ed_45%,_#f5f5f4_100%)] px-3 py-1.5 sm:px-5 sm:py-2"
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-1.5 sm:gap-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex"
        >
          <h1 className="w-fit rounded-full bg-red-600/95 px-3.5 py-1 font-[family-name:var(--font-space-grotesk)] text-base font-bold tracking-tight text-white sm:text-xl sm:px-4 sm:py-1.5">
            ricky&apos;s f1 quiz grand prix
          </h1>
        </motion.div>

        <Card className="min-h-0 flex-1 border border-zinc-900/10 bg-zinc-950 text-white">
          <CardBody className="h-full min-h-0 p-4 sm:p-5">
            <div className="flex h-full min-h-0 flex-col gap-1.5 sm:gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">{stageTitle}</p>
                {stage === "formation" && formationMode === "intro" && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    formation intro · {totalLaps} laps total
                  </p>
                )}
                {stage === "formation" && formationMode === "briefing" && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    step {tutorialStep + 1}/{tutorialSteps.length} · {totalLaps} laps total
                  </p>
                )}
                {stage === "formation" && formationMode === "drill" && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    starting-lights sequence · {totalLaps} laps total
                  </p>
                )}
                {(stage === "race" || stage === "pitstop") && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    score {score} · lap {currentLap + 1}/{totalLaps}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-full bg-zinc-900/60 px-4 py-2.5">
                {[0, 1, 2, 3, 4].map((index) => {
                  const formationIdle = stage === "formation" && reactionPhase === "idle";

                  const isOn =
                    stage === "formation"
                      ? reactionPhase === "countdown"
                        ? reactionLights > index
                        : reactionPhase === "go" || reactionPhase === "early"
                          ? false
                          : true
                      : stage === "pitstop"
                        ? index <= 2
                        : true;

                  const onColor =
                    stage === "formation"
                      ? reactionPhase === "success"
                        ? "bg-emerald-400"
                        : "bg-red-500"
                      : stage === "race"
                        ? "bg-emerald-400"
                        : stage === "pitstop"
                          ? "bg-amber-400"
                          : index % 2 === 0
                            ? "bg-zinc-100"
                            : "bg-zinc-700";

                  const offColor =
                    stage === "formation"
                      ? "bg-red-500/20"
                      : stage === "race"
                        ? "bg-emerald-400/30"
                        : stage === "pitstop"
                          ? "bg-amber-400/25"
                          : "bg-zinc-500/30";

                  return (
                    <motion.span
                      key={index}
                      className={`h-4.5 w-4.5 rounded-full ${isOn ? onColor : offColor}`}
                      animate={
                        formationIdle
                          ? { opacity: [0.35, 1, 0.35], scale: [1, 1.15, 1] }
                          : stage === "race" || stage === "pitstop"
                            ? { opacity: [0.45, 1, 0.45], scale: [1, 1.08, 1] }
                            : stage === "finish_intro"
                              ? { opacity: [1, 0.25, 1] }
                              : { opacity: 1, scale: 1 }
                      }
                      transition={{
                        duration: 0.7,
                        delay: index * 0.14,
                        repeat:
                          stage === "finish_intro" ||
                          formationIdle ||
                          stage === "race" ||
                          stage === "pitstop"
                            ? Infinity
                            : 0,
                        ease: "easeInOut",
                      }}
                    />
                  );
                })}
              </div>

              <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-4 pb-0.5 pt-6">
                <div className="relative mx-2 h-2 rounded-full bg-zinc-700">
                  <motion.div
                    className="absolute left-0 top-0 h-2 rounded-full bg-zinc-100"
                    animate={{ width: `${formationFillWidth}%` }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />

                  <motion.div
                    className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-zinc-100"
                    style={{ left: `${grandPrixMarkerPos}%` }}
                    animate={{ width: `${raceFillWidth}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />

                  <motion.div
                    className="pointer-events-none absolute z-10 -top-5 -translate-x-1/2 text-sm sm:text-base relative inline-flex w-fit"
                    animate={{ left: `${currentTrackPercent}%` }}
                    transition={{ duration: trackCarMoveDuration, ease: "easeOut" }}
                  >
                    {isDnfFinish &&
                      [0, 1, 2].map((smokeIndex) => (
                        <motion.span
                          key={`track-dnf-smoke-${smokeIndex}`}
                          className="absolute text-[7px] leading-none sm:text-[8px]"
                          style={{ left: `${-6 - smokeIndex * 5}px`, top: `${4 - smokeIndex}px` }}
                          initial={false}
                          animate={{
                            opacity: [0, 0.85, 0],
                            x: [0, -3, -7],
                            y: [0, -2, -4],
                            scale: [0.7, 1.05, 1.15],
                          }}
                          transition={{
                            duration: 1.05,
                            delay: trackCrashDelay + smokeIndex * 0.12,
                            ease: "easeOut",
                            repeat: Infinity,
                            repeatDelay: 0.2,
                          }}
                        >
                          💨
                        </motion.span>
                      ))}

                    {isDnfFinish && (
                      <motion.span
                        className="absolute text-[8px] leading-none sm:text-[9px]"
                        style={{ left: "8px", top: "-1px" }}
                        initial={false}
                        animate={{
                          opacity: [0, 1, 1],
                          y: [4, 0, 2],
                          rotate: [-18, 8, -10],
                        }}
                        transition={{
                          duration: 1.15,
                          delay: trackCrashDelay + 0.12,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 0.2,
                        }}
                      >
                        🔧
                      </motion.span>
                    )}

                    <motion.span
                      className="inline-block"
                      initial={false}
                      animate={{ scaleX: isDnfFinish ? 1 : -1 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                      🏎️
                    </motion.span>
                  </motion.div>

                  <div className="absolute inset-x-0 top-1/2 h-0">
                    {tutorialCheckpoints.map((leftPercent, stepIndex) => {
                      const tutorialState = tutorialMarkerStates[stepIndex] ?? "unanswered";
                      const tutorialRingClass =
                        tutorialState === "unanswered" ? "border-zinc-500" : "border-zinc-300";

                      return (
                        <button
                          type="button"
                          key={`tutorial-marker-${stepIndex}`}
                          disabled={v2OriginSequencePending}
                          aria-label={`Go to tutorial step ${stepIndex + 1}`}
                          onClick={() => jumpToTrackCard({ kind: "tutorial", stepIndex })}
                          style={{ left: `${leftPercent}%` }}
                          className={`absolute top-0 z-[1] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-[1.5px] bg-zinc-900 p-0 transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80 sm:h-3 sm:w-3 ${tutorialRingClass}`}
                        >
                          <span
                            className={`pointer-events-none absolute inset-[1px] ${getMarkerInnerClass(tutorialState)}`}
                          />
                        </button>
                      );
                    })}
                    {raceCheckpoints.map((leftPercent, lapIndex) => {
                      const raceState = raceMarkerStates[lapIndex] ?? "unanswered";
                      const raceRingClass =
                        raceState === "unanswered"
                          ? "border-zinc-500"
                          : raceMiniBorderColors[Math.min(lapIndex, raceMiniBorderColors.length - 1)];

                      return (
                        <button
                          type="button"
                          key={`race-marker-${lapIndex}`}
                          disabled={v2OriginSequencePending}
                          aria-label={`Go to lap ${lapIndex + 1}`}
                          onClick={() => jumpToTrackCard({ kind: "lap", lapIndex })}
                          style={{ left: `${leftPercent}%` }}
                          className={`absolute top-0 z-[1] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-zinc-900 p-0 transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80 sm:h-4 sm:w-4 ${raceRingClass}`}
                        >
                          <span
                            className={`pointer-events-none absolute inset-[1px] rounded-full ${getMarkerInnerClass(raceState)}`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      disabled={v2OriginSequencePending}
                      aria-label="Go to formation intro"
                      onClick={() => jumpToTrackCard({ kind: "formation_intro" })}
                      style={{ left: "0%" }}
                      className={`absolute top-0 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 sm:h-5 sm:w-5 ${
                        formationActive
                          ? "border-zinc-400 bg-zinc-100"
                          : "border-zinc-500 bg-zinc-900"
                      } transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80`}
                    />

                    <button
                      type="button"
                      disabled={v2OriginSequencePending}
                      aria-label="Go to starting-lights sequence"
                      onClick={() => jumpToTrackCard({ kind: "formation_drill" })}
                      style={{ left: `${grandPrixMarkerPos}%` }}
                      className={`absolute top-0 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 sm:h-5 sm:w-5 ${
                        grandPrixActive && grandPrixBand
                          ? getBandMarkerClass(grandPrixBand)
                          : "border-zinc-500 bg-zinc-900"
                      } transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80`}
                    />

                    <button
                      type="button"
                      disabled={v2OriginSequencePending}
                      aria-label="Go to pit stop"
                      onClick={() => jumpToTrackCard({ kind: "pitstop" })}
                      style={{ left: `${pitStopMarkerPos}%` }}
                      className={`absolute top-0 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 sm:h-5 sm:w-5 ${
                        pitStopActive && pitStopBand
                          ? getBandMarkerClass(pitStopBand)
                          : "border-zinc-500 bg-zinc-900"
                      } transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80`}
                    />

                    <div
                      className="absolute top-0 z-[2] h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 sm:h-5 sm:w-5"
                      style={{ left: "100%" }}
                    >
                      <button
                        type="button"
                        disabled={v2OriginSequencePending}
                        aria-label="Go to final race report"
                        onClick={() => jumpToTrackCard({ kind: "finish" })}
                        className={`relative isolate block h-full w-full rotate-45 overflow-hidden border-2 leading-none ${
                          chequeredActive ? "border-zinc-300" : "border-zinc-500"
                        } transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80`}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 -rotate-45 scale-[1.4]"
                          style={chequeredMarkerFillStyle}
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-0 ${
                            chequeredActive ? "bg-white/8" : "bg-zinc-950/28"
                          }`}
                        />
                      </button>

                      {isDnfFinish && (
                        <motion.span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2 text-[14px] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-[16px]"
                          initial={{ opacity: 0, scale: 0.65, rotate: -12 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: 0.16, duration: 0.2, ease: "easeOut" }}
                        >
                          ❌
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative mx-2 mt-3 hidden h-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 sm:block">
                  <p className="absolute -left-3">formation lap</p>
                  <p style={{ left: `${grandPrixMarkerPos}%` }} className="absolute -translate-x-1/2">
                    grand prix
                  </p>
                  <p style={{ left: `${pitStopMarkerPos}%` }} className="absolute -translate-x-1/2">
                    pit stop
                  </p>
                  <p className="absolute -right-3">chequered flag</p>
                </div>

                <div className="relative mx-2 mt-2 h-4 font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400 sm:hidden">
                  <p className="absolute -left-3 whitespace-nowrap">formation</p>
                  <p
                    style={{ left: `${grandPrixMarkerPos}%` }}
                    className="absolute -translate-x-1/2 whitespace-nowrap"
                  >
                    gp
                  </p>
                  <p
                    style={{ left: `${pitStopMarkerPos}%` }}
                    className="absolute -translate-x-1/2 whitespace-nowrap"
                  >
                    pit
                  </p>
                  <p className="absolute -right-3 whitespace-nowrap">flag</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-700/60 bg-zinc-900/45 p-3 sm:p-4">
                {stage === "formation" && formationMode === "intro" && (
                  <div className="flex flex-col gap-3.5">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-red-100">
                      formation lap (practice)
                    </p>
                    <p className="font-[family-name:var(--font-space-grotesk)] text-[1.325rem] font-semibold text-white">
                      quick warmup before lights out.
                    </p>
                    <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                      let&apos;s get some heat in your tyres.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="flat"
                        isDisabled
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      <Button
                        color="danger"
                        onPress={startFormationLapTutorial}
                        className="w-fit font-semibold"
                      >
                        start formation lap (practice) -&gt;
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="flat"
                        onPress={skipFormationLab}
                        className="w-fit border border-transparent bg-stone-900 lowercase font-semibold tracking-wide text-stone-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                      >
                        <span>skip</span>
                        <span className="ml-1.5 inline-block -translate-y-[2px] text-base leading-none">⋙</span>
                      </Button>
                    </div>
                  </div>
                )}

                {stage === "formation" && formationMode === "briefing" && (
                  <div className="flex flex-col gap-3.5">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-red-100">formation lap (practice)</p>
                    <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">
                      {tutorialCurrent.prompt}
                    </p>

                    <div className="grid gap-2">
                      {tutorialCurrent.options.map((option, index) => {
                        const isCorrect = index === tutorialCurrent.answer;
                        const isSelected = tutorialSelected === index;

                        const variant =
                          tutorialSelected === null
                            ? "flat"
                            : isCorrect || isSelected
                              ? "solid"
                              : "flat";

                        const color =
                          tutorialSelected === null
                            ? "default"
                            : isCorrect
                              ? "success"
                              : isSelected
                                ? "danger"
                                : "default";

                        const className =
                          tutorialSelected === null
                            ? "justify-start bg-zinc-700 px-4 text-left !text-zinc-100"
                            : isCorrect || isSelected
                              ? "justify-start px-4 text-left"
                              : "justify-start bg-zinc-800 px-4 text-left !text-zinc-300";

                        return (
                          <Button
                            key={option}
                            size="md"
                            variant={variant}
                            color={color}
                            isDisabled={v2WarmupLocked}
                            className={className}
                            onPress={() => handleTutorialPick(index)}
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="rounded-xl border border-red-300/25 bg-zinc-900/70 p-3 font-[family-name:var(--font-manrope)] text-sm text-zinc-100">
                      {tutorialSelected !== null ? (
                        <p>
                          <span
                            className={`font-semibold ${isCurrentTutorialCorrect ? "text-emerald-300" : "text-red-300"}`}
                          >
                            {isCurrentTutorialCorrect ? "Correct:" : "Incorrect:"}
                          </span>{" "}
                          {tutorialCurrent.note}
                        </p>
                      ) : (
                        <p>race note: lock an answer and this panel shows the note for that step.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="flat"
                        isDisabled={v2WarmupLocked}
                        onPress={goToPreviousBriefing}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      <Button
                        color="danger"
                        isDisabled={v2WarmupLocked}
                        onPress={goToNextBriefing}
                        className="w-fit font-semibold"
                      >
                        {tutorialStep === tutorialSteps.length - 1
                          ? "line up on the grid ->"
                          : "next weave ->"}
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="flat"
                        isDisabled={v2WarmupLocked}
                        onPress={skipFormationLab}
                        className="w-fit border border-transparent bg-stone-900 lowercase font-semibold tracking-wide text-stone-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                      >
                        <span>skip</span>
                        <span className="ml-1.5 inline-block -translate-y-[2px] text-base leading-none">⋙</span>
                      </Button>
                    </div>
                  </div>
                )}

                {stage === "formation" && formationMode === "drill" && (
                  <div className="flex flex-col gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-red-100">starting-lights sequence</p>
                    <p className="font-[family-name:var(--font-manrope)] text-base text-zinc-100">
                      initiate the starting-lights sequence, watch the lights above, then hit LAUNCH only
                      when the lights go out.
                    </p>

                    {reactionPhase === "idle" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="flat"
                          onPress={goPreviousFromStartDrill}
                          className="w-fit bg-zinc-800 text-zinc-100"
                        >
                          &lt;- previous
                        </Button>
                        <Button color="warning" onPress={handleStartDrillSequence} className="w-fit font-semibold">
                          initiate starting-lights sequence -&gt;
                        </Button>
                      </div>
                    )}

                    {reactionPhase === "countdown" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="flat"
                          onPress={goPreviousFromStartDrill}
                          className="w-fit bg-zinc-800 text-zinc-100"
                        >
                          &lt;- previous
                        </Button>
                        <Button color="warning" onPress={handleReactionTap} className="font-semibold">
                          LAUNCH
                        </Button>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-red-100">
                          wait for lights out
                        </p>
                      </div>
                    )}

                    {reactionPhase === "go" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="flat"
                          onPress={goPreviousFromStartDrill}
                          className="w-fit bg-zinc-800 text-zinc-100"
                        >
                          &lt;- previous
                        </Button>
                        <Button color="warning" onPress={handleReactionTap} className="font-semibold">
                          LAUNCH
                        </Button>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-emerald-100">
                          lights out
                        </p>
                      </div>
                    )}

                    {reactionPhase === "early" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="flat"
                            isDisabled={v2Launching}
                            onPress={goPreviousFromStartDrill}
                            className="w-fit bg-zinc-800 text-zinc-100"
                          >
                            &lt;- previous
                          </Button>
                          <Button
                            color="warning"
                            isDisabled={v2Launching}
                            onPress={handleRunAgainStartDrill}
                            className="font-semibold"
                          >
                            retry starting-lights sequence
                          </Button>
                        </div>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-red-100">
                          jump start. too early.
                        </p>
                      </div>
                    )}

                    {reactionPhase === "success" && reactionMs !== null && (
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-wrap items-center gap-2">
                          <Button
                            variant="flat"
                            isDisabled={v2Launching}
                            onPress={goPreviousFromStartDrill}
                            className="w-fit bg-zinc-800 text-zinc-100"
                          >
                            &lt;- previous
                          </Button>
                          <Button
                            color="danger"
                            isDisabled={v2Launching}
                            onPress={startRace}
                            className="font-semibold"
                          >
                            lights out and away we go! -&gt;
                          </Button>
                          <Button
                            color="warning"
                            isDisabled={v2Launching}
                            onPress={handleRunAgainStartDrill}
                            className="font-semibold"
                          >
                            retry starting-lights sequence
                          </Button>
                        </div>
                        <p className={`font-semibold ${getReactionValueClass(reactionMs)}`}>
                          reaction {reactionMs}ms
                        </p>
                        <p className={`font-[family-name:var(--font-manrope)] text-sm ${getReactionValueClass(reactionMs)}`}>
                          {getReactionFeedback(reactionMs)}
                        </p>
                      </div>
                    )}

                    {showStartDrillWarning && (
                      <p className="font-[family-name:var(--font-manrope)] text-sm font-semibold text-red-300">
                        start-drill incomplete.
                      </p>
                    )}

                    {showStartSkip && (
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        <Button
                          variant="flat"
                          onPress={skipStartDrill}
                          className="w-fit border border-transparent bg-stone-900 lowercase font-semibold tracking-wide text-stone-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                        >
                          <span>skip</span>
                          <span className="ml-1.5 inline-block -translate-y-[2px] text-base leading-none">⋙</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {stage === "race" && (
                  <motion.div
                    key={currentLap}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full flex-col gap-2.5"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="flex items-start gap-1.5 border-l-2 border-zinc-600 pl-2.5 py-0.5"
                    >
                      <span className="text-xs leading-none mt-px">📻</span>
                      <p className="font-mono text-[11px] italic leading-snug text-zinc-400">
                        &ldquo;{radioMessage}&rdquo;
                      </p>
                    </motion.div>

                    <div className="flex items-center justify-between gap-2">
                      <Chip variant="flat" color="danger" className="capitalize bg-red-400/25 text-red-100">
                        {question.event}
                      </Chip>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                        lap {currentLap + 1}/{totalLaps} · {Math.round(quizProgress)}%
                      </p>
                    </div>

                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-[19.5px] font-semibold leading-tight text-white sm:text-[1.325rem]">
                      {question.prompt}
                    </h2>

                    <div className="grid gap-2">
                      {question.options.map((option, index) => {
                        const isCorrect = index === question.answer;
                        const isSelected = selectedForCurrentLap === index;

                        const variant =
                          selectedForCurrentLap === null ? "flat" : isCorrect || isSelected ? "solid" : "flat";
                        const color =
                          selectedForCurrentLap === null
                            ? "default"
                            : isCorrect
                              ? "success"
                              : isSelected
                                ? "danger"
                                : "default";
                        const className =
                          selectedForCurrentLap === null
                            ? "justify-start bg-zinc-700 px-4 text-left !text-zinc-100"
                            : isCorrect || isSelected
                              ? "justify-start px-4 text-left"
                              : "justify-start bg-zinc-800 px-4 text-left !text-zinc-300";

                        return (
                          <Button
                            key={option}
                            size="md"
                            variant={variant}
                            color={color}
                            className={className}
                            onPress={() => handlePick(index)}
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>

                    {selectedForCurrentLap !== null ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="-my-0.5 rounded-xl border border-zinc-600 bg-zinc-900/75 p-3 font-[family-name:var(--font-manrope)] text-sm text-zinc-100"
                      >
                        <p>
                          <span
                            className={`font-semibold ${isCurrentLapCorrect ? "text-emerald-300" : "text-red-300"}`}
                          >
                            {isCurrentLapCorrect ? "Correct:" : "Incorrect:"}
                          </span>{" "}
                          {question.fact}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="-my-0.5 rounded-xl border border-dashed border-zinc-600 bg-zinc-900/55 p-3 font-[family-name:var(--font-manrope)] text-sm text-zinc-400">
                        race note: lock an answer and this note panel will update for the lap.
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <Button
                        variant="flat"
                        isDisabled={v2RaceSequencePending}
                        onPress={goPreviousFromRace}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      <Button
                        color="danger"
                        isDisabled={v2RaceSequencePending}
                        onPress={handleNextLap}
                        className="font-semibold"
                      >
                        {nextRaceButtonLabel}
                      </Button>
                      <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-400">score: {score}</p>
                    </div>
                  </motion.div>
                )}

                {stage === "pitstop" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full flex-col gap-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Chip color="warning" variant="flat" className="bg-amber-400/25 text-amber-100">
                        pit stop challenge
                      </Chip>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">mid-race</p>
                    </div>

                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-[1.325rem] font-semibold text-white">
                      tyre change sprint
                    </h2>

                    <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                      lock tyres in order: front left, front right, rear left, rear right. wrong corner adds
                      300ms.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {tyreLabels.map((label, index) => {
                        const expected = pitOrder[pitStep] === index;

                        return (
                          <Button
                            key={label}
                            size="md"
                            variant={pitStarted ? "solid" : "flat"}
                            color={pitStarted && expected ? "warning" : "default"}
                            className="h-12 capitalize"
                            onPress={() => handlePitClick(index)}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="rounded-xl border border-zinc-600 bg-zinc-900/70 p-3 font-[family-name:var(--font-manrope)] text-sm text-zinc-100">
                      {pitStarted ? (
                        <>
                          <p>{pitMessage}</p>
                          <p className="mt-1.5 text-zinc-400">
                            target now: <span className="font-semibold capitalize">{tyreLabels[pitOrder[pitStep]]}</span>
                          </p>
                          <p className="mt-1.5 text-zinc-400">penalty total: {pitPenalty}ms</p>
                        </>
                      ) : showPitWarning ? (
                        <>
                          <p className="font-semibold text-red-300">pit stop incomplete.</p>
                          <p className="mt-1.5 text-zinc-400">penalty total: {pitPenalty}ms</p>
                        </>
                      ) : pitTimeMs === null ? (
                        <>
                          <p>{pitMessage}</p>
                          <p className="mt-1.5 text-zinc-400">penalty total: {pitPenalty}ms</p>
                        </>
                      ) : (
                        <>
                          <p className={`font-semibold ${getPitValueClass(pitTimeMs, activePitBands)}`}>
                            pit time {pitTimeMs}ms
                          </p>
                          <p className="mt-1 text-zinc-400">penalty total: {pitPenalty}ms</p>
                          <p className={`mt-1.5 ${getPitValueClass(pitTimeMs, activePitBands)}`}>
                            {getPitFeedback(pitTimeMs, activePitBands)}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex w-full flex-wrap items-center gap-2">
                      <Button
                        variant="flat"
                        isDisabled={pitRejoinPending}
                        onPress={goPreviousFromPitStop}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      {!pitStarted && hasCompletedPitStop && (
                        <Button
                          color="danger"
                          isDisabled={pitRejoinPending}
                          onPress={goNextFromPitStop}
                          className="font-semibold"
                        >
                          rejoin the track -&gt;
                        </Button>
                      )}
                      {!pitStarted && !hasCompletedPitStop && (
                        <Button color="warning" onPress={handleBeginPitStop} className="font-semibold">
                          begin pit stop -&gt;
                        </Button>
                      )}
                      {!pitStarted && hasCompletedPitStop && (
                        <Button
                          color="warning"
                          isDisabled={pitRejoinPending}
                          onPress={handleRetryPitStop}
                          className="font-semibold"
                        >
                          retry pit stop
                        </Button>
                      )}
                    </div>

                    {showPitSkip && (
                      <div className="flex w-full flex-wrap items-center gap-2">
                        <Button
                          variant="flat"
                          onPress={skipPitStop}
                          className="w-fit border border-transparent bg-stone-900 lowercase font-semibold tracking-wide text-stone-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                        >
                          <span>skip</span>
                          <span className="ml-1.5 inline-block -translate-y-[2px] text-base leading-none">⋙</span>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {(stage === "finish_intro" || stage === "finished") && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-full overflow-hidden rounded-xl bg-zinc-950 p-5 sm:p-8"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,#ffffff_25%,transparent_25%),linear-gradient(-45deg,#ffffff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ffffff_75%),linear-gradient(-45deg,transparent_75%,#ffffff_75%)] [background-position:0_0,0_14px,14px_-14px,-14px_0] [background-size:28px_28px]" />

                    <motion.div
                      className="pointer-events-none absolute top-[43%] text-5xl sm:text-6xl"
                      initial={{ left: "6%", y: "-50%" }}
                      animate={{
                        left: finishTier === 0
                          ? isMobileTrack
                            ? "51%"
                            : "46%"
                          : isMobileTrack
                            ? "72%"  // mobile
                            : "74%", // desktop
                        y: "-40%",
                      }}
                      transition={{
                        duration: finishTier === 4 ? 6 : finishTier === 0 ? 2.4 : 2.1,
                        ease: finishTier === 4 ? "linear" : finishTier === 0 ? "easeOut" : "easeInOut",
                      }}
                    >
                      {finishTier === 0 ? "🏎️" : <span style={mirroredCarStyle}>🏎️</span>}
                    </motion.div>

                    {finishTier === 0 && (
                      <>
                        {[0, 1, 2].map((smokeIndex) => (
                          <motion.div
                            key={`dnf-smoke-${smokeIndex}`}
                            className={`pointer-events-none absolute text-2xl ${
                              isMobileTrack ? "top-[40%]" : "top-[38%] sm:text-3xl"
                            }`}
                            initial={{
                              left: `${(isMobileTrack ? 48 : 44) + smokeIndex * (isMobileTrack ? 1.8 : 2.4)}%`,
                              opacity: 0,
                              scale: 0.65,
                            }}
                            animate={{
                              left: `${(isMobileTrack ? 46 : 42) + smokeIndex * (isMobileTrack ? 2.4 : 3.6)}%`,
                              top: `${(isMobileTrack ? 33 : 30) + smokeIndex * (isMobileTrack ? 1.5 : 2)}%`,
                              opacity: [0, 0.85, 0],
                              scale: [0.65, 1.2, 1.35],
                            }}
                            transition={{
                              delay: 1.2 + smokeIndex * 0.28,
                              duration: 1.3,
                              ease: "easeOut",
                              repeat: Infinity,
                              repeatDelay: 0.45,
                            }}
                          >
                            💨
                          </motion.div>
                        ))}

                        <motion.div
                          className={`pointer-events-none absolute ${
                            isMobileTrack ? "left-[66%] top-[41%] text-[1.5rem]" : "left-[52%] top-[38%] text-3xl sm:text-4xl"
                          }`}
                          initial={{ opacity: 0, y: -8, rotate: -14 }}
                          animate={{ opacity: [0, 1, 1], y: [-8, -12, -8], rotate: [-14, -6, -14] }}
                          transition={{ delay: 1.5, duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                        >
                          🔧
                        </motion.div>
                      </>
                    )}

                    {finishTier === 4 && (
                      <>
                        {[0, 1, 2].map((dustIndex) => (
                          <motion.div
                            key={`dust-${dustIndex}`}
                            className="pointer-events-none absolute top-[48%] text-3xl sm:text-4xl"
                            initial={{ left: `${7 + dustIndex * 1.8}%`, opacity: 0, y: "-50%" }}
                            animate={{ left: `${34 + dustIndex * 8}%`, opacity: [0, 0.65, 0], y: ["-50%", "-64%", "-56%"] }}
                            transition={{
                              duration: 1.25,
                              delay: 0.6 + dustIndex * 0.6,
                              ease: "easeOut",
                              repeat: 1,
                              repeatDelay: 0.2,
                            }}
                          >
                            💨
                          </motion.div>
                        ))}

                        <motion.div
                          className="pointer-events-none absolute top-[49%] text-4xl sm:text-5xl"
                          initial={{ left: "2.5%", y: "-50%" }}
                          animate={{ left: "62%", y: "-50%" }}
                          transition={{ duration: 7, delay: 0.3, ease: "linear" }}
                        >
                          🐢
                        </motion.div>
                      </>
                    )}

                    <div className="pointer-events-none absolute right-3 top-3 grid h-16 w-16 place-items-center sm:right-4 sm:top-4 sm:h-[4.5rem] sm:w-[4.5rem]">
                      <motion.div
                        className="text-6xl leading-none"
                        animate={{ rotate: [0, -16, 14, -8, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        🏁
                      </motion.div>

                      {finishTier === 0 && (
                        <motion.div
                          className="absolute inset-0 grid place-items-center text-5xl leading-none sm:text-6xl"
                          initial={{ opacity: 0, scale: 0.5, rotate: -18 }}
                          animate={{ opacity: 1, scale: 1, rotate: [-18, 8, -8] }}
                          transition={{ delay: 0.5, duration: 0.45, ease: "easeOut" }}
                        >
                          ❌
                        </motion.div>
                      )}
                    </div>

                    {(finishTier === 1 || finishTier === 2) && (
                      <>
                        <motion.div
                          className="pointer-events-none absolute bottom-4 right-4 w-44 sm:right-8 sm:w-52"
                          initial={{ y: 64, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                        >
                          <div className="flex items-end justify-center gap-2">
                            <div className="relative flex h-16 w-12 items-end justify-center rounded-t-md bg-zinc-600 pb-5 sm:h-20 sm:w-14">
                              <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-200">
                                P2
                              </span>
                              {finishTier === 2 && (
                                <motion.div
                                  className="absolute -top-17 text-2xl"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 1.6, type: "spring", stiffness: 360, damping: 16 }}
                                >
                                  🥈
                                </motion.div>
                              )}
                            </div>
                            <div className="relative flex h-24 w-12 items-end justify-center rounded-t-md bg-zinc-700 pb-5 sm:h-28 sm:w-14">
                              <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-200">
                                P1
                              </span>
                              <motion.div
                                className="absolute -top-10 text-3xl"
                                initial={{ y: -60, opacity: 0, scale: 0.55 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2, type: "spring", stiffness: 350, damping: 13 }}
                              >
                                {finishTier === 1 ? "🏆" : "❓"}
                              </motion.div>
                            </div>
                            <div className="relative flex h-12 w-12 items-end justify-center rounded-t-md bg-zinc-600 pb-4 sm:h-16 sm:w-14">
                              <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-200">
                                P3
                              </span>
                              {finishTier === 2 && (
                                <motion.div
                                  className="absolute -top-18 text-2xl"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 1.8, type: "spring", stiffness: 360, damping: 16 }}
                                >
                                  🥉
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="pointer-events-none absolute bottom-22 right-37 text-3xl sm:bottom-25 sm:right-48"
                          initial={{ opacity: 0, scale: 0.6, rotate: -18 }}
                          animate={{ opacity: 1, scale: 1, rotate: -1 }}
                          transition={{ delay: 2, duration: 0.35, ease: "easeOut" }}
                        >
                          🍾
                        </motion.div>
                        <motion.div
                          className="pointer-events-none absolute bottom-18 right-9 text-3xl sm:bottom-21.5 sm:right-15"
                          initial={{ opacity: 0, scale: 0.6, rotate: 18 }}
                          animate={{ opacity: 1, scale: 1, rotate: -1 }}
                          transition={{ delay: 2, duration: 0.35, ease: "easeOut" }}
                        >
                          🍾
                        </motion.div>

                        {finishSparkles.map((sparkle) => (
                          <motion.div
                            key={sparkle.id}
                            className="pointer-events-none absolute text-xl sm:text-2xl"
                            style={{ left: sparkle.left, top: sparkle.top }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0.25, 1, 0.35], scale: [0.65, 1.2, 0.8] }}
                            transition={{
                              delay: sparkle.delay,
                              duration: 1.2,
                              repeat: Infinity,
                              repeatType: "mirror",
                            }}
                          >
                            ✨
                          </motion.div>
                        ))}

                        {finishTier === 2 &&
                          [0, 1, 2].map((confettiIndex) => (
                            <motion.div
                              key={`confetti-${confettiIndex}`}
                              className="pointer-events-none absolute text-2xl sm:text-3xl"
                              initial={{ top: `${6 + confettiIndex * 4}%`, left: `${62 + confettiIndex * 11}%`, opacity: 0 }}
                              animate={{
                                top: `${32 + confettiIndex * 7}%`,
                                left: `${58 + confettiIndex * 10}%`,
                                opacity: [0, 1, 0],
                                rotate: confettiIndex % 2 === 0 ? [0, 95, 190] : [0, -95, -190],
                              }}
                              transition={{
                                delay: 2.2 + confettiIndex * 0.3,
                                duration: 0.8,
                                ease: "easeInOut",
                              }}
                            >
                              🎊
                            </motion.div>
                          ))}
                      </>
                    )}

                    {finishTier === 3 &&
                      [
                        { left: "20%", top: "26%" },
                        { left: "34%", top: "44%" },
                        { left: "52%", top: "26%" },
                        { left: "68%", top: "42%" },
                      ].map((clap, clapIndex) => (
                        <motion.div
                          key={`clap-${clapIndex}`}
                          className="pointer-events-none absolute text-2xl sm:text-3xl"
                          style={{ left: clap.left, top: clap.top }}
                          initial={{ opacity: 0, scale: 0.65 }}
                          animate={{ opacity: [0, 1, 0], scale: [0.65, 1.15, 0.8] }}
                          transition={{
                            delay: 1 + clapIndex * 0.25,
                            duration: 1,
                            ease: "easeOut",
                            repeat: 1,
                            repeatDelay: 0.15,
                          }}
                        >
                          👏
                        </motion.div>
                      ))}

                    <div className="relative flex h-full flex-col gap-3 pt-6 sm:pt-0">
                      <Chip color="default" variant="flat" className="w-fit bg-zinc-800 text-zinc-100">
                        chequered flag
                      </Chip>

                      <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-4xl">
                        {finishLabel}
                      </h2>

                      <motion.p
                        initial={{ scale: 0.75, opacity: 0 }}
                        animate={{ scale: [0.75, 1.12, 1], opacity: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`font-[family-name:var(--font-space-grotesk)] text-6xl font-bold ${scoreValueClass} sm:text-7xl`}
                      >
                        {score}/{totalLaps}
                      </motion.p>

                      <p className="font-mono text-xs uppercase tracking-widest text-zinc-300">final score</p>

                      {stage === "finished" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="mt-auto flex flex-col gap-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {finishChips.startDrill.kind === "time" && finishChips.startDrill.timeMs !== null ? (
                              <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                                start-drill
                                <span className={`ml-1 font-bold ${getReactionValueClass(finishChips.startDrill.timeMs)}`}>
                                  {finishChips.startDrill.timeMs}ms
                                </span>
                              </Chip>
                            ) : (
                              <Chip
                                variant="flat"
                                className="border border-red-300/40 bg-red-500/20 text-red-200"
                              >
                                {finishChips.startDrill.label}
                              </Chip>
                            )}
                            {finishChips.pitStop.kind === "time" && finishChips.pitStop.timeMs !== null ? (
                              <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                                pit stop
                                <span
                                  className={`ml-1 font-bold ${getPitValueClass(finishChips.pitStop.timeMs, activePitBands)}`}
                                >
                                  {finishChips.pitStop.timeMs}ms
                                </span>
                              </Chip>
                            ) : (
                              <Chip
                                variant="flat"
                                className="border border-red-300/40 bg-red-500/20 text-red-200"
                              >
                                {finishChips.pitStop.label}
                              </Chip>
                            )}
                            <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                              best score
                              <span className={`ml-1 font-bold ${bestScoreValueClass}`}>
                                {bestScore}/{totalLaps}
                              </span>
                            </Chip>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="flat"
                              onPress={goPreviousFromFinish}
                              className="w-fit bg-zinc-800 text-zinc-100"
                            >
                              &lt;- previous
                            </Button>
                            <Button color="danger" onPress={restartWeekend} className="w-fit font-semibold">
                              run another grand prix
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      <button
        type="button"
        aria-label="Switch to the Monza V2 design"
        aria-hidden={versionMarkHidden}
        tabIndex={versionMarkHidden ? -1 : undefined}
        onClick={() => switchUiVersion("v2")}
        className="absolute bottom-[5px] right-[9px] z-[60] border-0 bg-transparent px-[6px] py-[4px] font-mono text-[10px] font-bold tracking-[.24em] text-zinc-400 transition-opacity duration-[400ms] active:translate-y-px"
        style={{
          opacity: versionMarkHidden ? 0 : 0.4,
          pointerEvents: versionMarkHidden ? "none" : "auto",
        }}
      >
        <span className="inline-block origin-bottom-right scale-[.7]">V1</span>
      </button>
    </main>
  );
}
