"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  getRandomWeekendQuestions,
  initialWeekendQuestions,
  type Question,
} from "./f1-question-bank";

type Stage = "formation" | "race" | "pitstop" | "finish_intro" | "finished";
type FormationMode = "intro" | "briefing" | "drill";
type ReactionPhase = "idle" | "countdown" | "go" | "early" | "success";
type MarkerState = "unanswered" | "correct" | "incorrect";
type TrackTarget =
  | { kind: "formation_intro" }
  | { kind: "formation_drill" }
  | { kind: "pitstop" }
  | { kind: "finish" }
  | { kind: "tutorial"; stepIndex: number }
  | { kind: "lap"; lapIndex: number };

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

const tireLabels = ["front left", "front right", "rear left", "rear right"] as const;
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

const getNowMs = () => performance.now();
const getReactionLightsOutDelayMs = () => 3500 + 900 + Math.random() * 900;

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

export default function Home() {
  const [stage, setStage] = useState<Stage>("formation");
  const [formationMode, setFormationMode] = useState<FormationMode>("intro");
  const [weekendQuestions, setWeekendQuestions] = useState<Question[]>(initialWeekendQuestions);

  const [currentLap, setCurrentLap] = useState(0);
  const [lapAnswers, setLapAnswers] = useState<(number | null)[]>(() =>
    initialWeekendQuestions.map(() => null),
  );

  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialAnswers, setTutorialAnswers] = useState<(number | null)[]>(() =>
    tutorialSteps.map(() => null),
  );

  const [reactionPhase, setReactionPhase] = useState<ReactionPhase>("idle");
  const [reactionLights, setReactionLights] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [startDrillSkipped, setStartDrillSkipped] = useState(false);

  const [pitStopDone, setPitStopDone] = useState(false);
  const [pitStarted, setPitStarted] = useState(false);
  const [pitStep, setPitStep] = useState(0);
  const [pitPenalty, setPitPenalty] = useState(0);
  const [pitMessage, setPitMessage] = useState("pit window open. hit begin when you're ready.");
  const [pitTimeMs, setPitTimeMs] = useState<number | null>(null);
  const [pitStopSkipped, setPitStopSkipped] = useState(false);
  const [isMobileTrack, setIsMobileTrack] = useState(false);
  const [isTouchLikeDevice, setIsTouchLikeDevice] = useState(false);

  const [bestReactionMs, setBestReactionMs] = useState<number | null>(getStoredBestReaction);
  const [bestScore, setBestScore] = useState(getStoredBestScore);

  const timersRef = useRef<number[]>([]);
  const soundTimersRef = useRef<number[]>([]);
  const goTimeRef = useRef<number | null>(null);
  const pitStartRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  const hasCompletedStartDrill = reactionMs !== null;
  const hasPitStopCheckpoint = pitStopDone || pitStopSkipped || pitTimeMs !== null;
  const hasCompletedPitStop = pitTimeMs !== null;

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
      const angle = (index / Math.max(count, 1)) * Math.PI * 1.8 + 0.35;
      const radiusX = 13;
      const radiusY = 19;
      return {
        id: `sparkle-${index}`,
        left: `${76 + Math.cos(angle) * radiusX}%`,
        top: `${38 + Math.sin(angle) * radiusY}%`,
        delay: 1.5 + index * 0.18,
      };
    });
  }, [finishTier]);

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

    return finishAnchor;
  }, [
    currentLap,
    finishAnchor,
    formationAnchor,
    formationMode,
    grandPrixAnchor,
    pitAnchor,
    raceCheckpoints,
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

  const formationActive = true;
  const grandPrixActive = reactionMs !== null;
  const pitStopActive = pitStopDone && !pitStopSkipped;
  const chequeredActive = stage === "finish_intro" || stage === "finished";
  const grandPrixBand = reactionMs === null ? null : getReactionBand(reactionMs);
  const pitStopBand = pitTimeMs === null ? null : getPitBand(pitTimeMs, activePitBands);

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
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      soundTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
    };
  }, []);

  const clearReactionTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    goTimeRef.current = null;
  };

  const clearSoundTimers = () => {
    soundTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    soundTimersRef.current = [];
  };

  const clearFinishTimer = () => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const enterStartDrillState = () => {
    clearReactionTimers();
    setReactionLights(0);
    setReactionPhase(hasCompletedStartDrill ? "success" : "idle");
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
    const frequencies = [500, 620];
    const noteDurationMs = 48;
    const gapMs = 14;

    frequencies.forEach((frequency, index) => {
      const timer = window.setTimeout(() => {
        playBeep(frequency, noteDurationMs, { waveform: "triangle", volume: 0.14 });
      }, index * (noteDurationMs + gapMs));
      soundTimersRef.current.push(timer);
    });
  };

  const playRestartSound = () => {
    const frequencies = [700, 560, 430];
    const noteDurationMs = 55;
    const gapMs = 18;

    frequencies.forEach((frequency, index) => {
      const timer = window.setTimeout(() => {
        playBeep(frequency, noteDurationMs, { waveform: "triangle", volume: 0.16 });
      }, index * (noteDurationMs + gapMs));
      soundTimersRef.current.push(timer);
    });
  };

  const playRunAgainSound = () => {
    const frequencies = [980, 760];
    const noteDurationMs = 48;
    const gapMs = 12;

    frequencies.forEach((frequency, index) => {
      const timer = window.setTimeout(() => {
        playBeep(frequency, noteDurationMs, { waveform: "triangle", volume: 0.14 });
      }, index * (noteDurationMs + gapMs));
      soundTimersRef.current.push(timer);
    });
  };

  const playAnswerCorrectSound = () => {
    const frequencies = [540, 660, 820];
    const noteDurationMs = 34;
    const gapMs = 8;

    frequencies.forEach((frequency, index) => {
      const timer = window.setTimeout(() => {
        playBeep(frequency, noteDurationMs, { waveform: "triangle", volume: 0.14 });
      }, index * (noteDurationMs + gapMs));
      soundTimersRef.current.push(timer);
    });
  };

  const playAnswerWrongSound = () => {
    const frequencies = [430, 330];
    const noteDurationMs = 58;
    const gapMs = 12;

    frequencies.forEach((frequency, index) => {
      const timer = window.setTimeout(() => {
        playBeep(frequency, noteDurationMs, { waveform: "triangle", volume: 0.13 });
      }, index * (noteDurationMs + gapMs));
      soundTimersRef.current.push(timer);
    });
  };

  const handleTutorialPick = (optionIndex: number) => {
    if (stage !== "formation" || formationMode !== "briefing" || tutorialSelected !== null) return;
    const isCorrect = optionIndex === tutorialSteps[tutorialStep]?.answer;
    if (isCorrect) {
      playAnswerCorrectSound();
    } else {
      playAnswerWrongSound();
    }
    setTutorialAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers];
      nextAnswers[tutorialStep] = optionIndex;
      return nextAnswers;
    });
  };

  const goToNextBriefing = () => {
    playArrowButtonSound();

    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep((prev) => prev + 1);
      return;
    }

    setFormationMode("drill");
  };

  const goToPreviousBriefing = () => {
    playArrowButtonSound();
    if (tutorialStep === 0) {
      setFormationMode("intro");
      setTutorialStep(0);
      return;
    }
    setTutorialStep((prev) => prev - 1);
  };

  const skipFormationLab = () => {
    playArrowButtonSound();
    setFormationMode("drill");
  };

  const startFormationLapTutorial = () => {
    playArrowButtonSound();
    setTutorialStep(0);
    setFormationMode("briefing");
  };

  const jumpToTrackCard = (target: TrackTarget) => {
    playArrowButtonSound();
    clearReactionTimers();
    clearFinishTimer();
    setReactionPhase("idle");
    setReactionLights(0);
    setPitStarted(false);
    pitStartRef.current = null;

    if (target.kind === "formation_intro") {
      setStage("formation");
      setFormationMode("intro");
      setTutorialStep(0);
      return;
    }

    if (target.kind === "formation_drill") {
      setStage("formation");
      setFormationMode("drill");
      setTutorialStep(tutorialSteps.length - 1);
      enterStartDrillState();
      return;
    }

    if (target.kind === "pitstop") {
      setStage("pitstop");
      setCurrentLap(pitStopLap);
      return;
    }

    if (target.kind === "finish") {
      setStage("finished");
      setCurrentLap(Math.max(totalLaps - 1, 0));
      return;
    }

    if (target.kind === "tutorial") {
      const safeStep = Math.max(0, Math.min(target.stepIndex, tutorialSteps.length - 1));
      setStage("formation");
      setFormationMode("briefing");
      setTutorialStep(safeStep);
      return;
    }

    const safeLap = Math.max(0, Math.min(target.lapIndex, totalLaps - 1));
    setStage("race");
    setCurrentLap(safeLap);
  };

  const startReactionSequence = (withActivationBeep = true) => {
    if (stage !== "formation" || formationMode !== "drill") return;

    clearReactionTimers();
    if (withActivationBeep) {
      playPrepActionSound();
    }
    setReactionPhase("countdown");
    setReactionLights(0);

    for (let i = 1; i <= 5; i += 1) {
      const timer = window.setTimeout(() => {
        setReactionLights(i);
        playBeep(760 + i * 30, 100);
      }, i * 700);
      timersRef.current.push(timer);
    }

    const lightsOutDelay = getReactionLightsOutDelayMs();
    const goTimer = window.setTimeout(() => {
      setReactionLights(0);
      setReactionPhase("go");
      goTimeRef.current = getNowMs();
      playBeep(520, 180);
    }, lightsOutDelay);
    timersRef.current.push(goTimer);
  };

  const handleRunAgainStartDrill = () => {
    playRunAgainSound();
    startReactionSequence(false);
  };

  const handleStartDrillSequence = () => {
    startReactionSequence();
  };

  const handleReactionTap = () => {
    if (reactionPhase === "countdown") {
      clearReactionTimers();
      setReactionPhase("early");
      setReactionLights(0);
      playBeep(220, 220);
      return;
    }

    if (reactionPhase === "go" && goTimeRef.current !== null) {
      const time = Math.round(getNowMs() - goTimeRef.current);
      setReactionMs(time);
      setStartDrillSkipped(false);
      setReactionPhase("success");
      clearReactionTimers();
      playBeep(960, 140);

      if (bestReactionMs === null || time < bestReactionMs) {
        setBestReactionMs(time);
        window.localStorage.setItem("f1-best-reaction-ms", String(time));
      }
    }
  };

  const goPreviousFromStartDrill = () => {
    playArrowButtonSound();
    clearReactionTimers();
    setReactionPhase("idle");
    setReactionLights(0);
    setFormationMode("briefing");
    setTutorialStep(tutorialSteps.length - 1);
  };

  const goNextFromStartDrill = () => {
    playArrowButtonSound();
    clearReactionTimers();
    setReactionPhase("idle");
    setReactionLights(0);
    setStage("race");
    setCurrentLap(0);
  };

  const skipStartDrill = () => {
    setStartDrillSkipped(true);
    goNextFromStartDrill();
  };

  const startRace = () => {
    setStartDrillSkipped(false);
    goNextFromStartDrill();
  };

  const goPreviousFromRace = () => {
    if (stage !== "race") return;
    playArrowButtonSound();

    if (currentLap === pitStopLap && hasPitStopCheckpoint) {
      setStage("pitstop");
      return;
    }

    if (currentLap > 0) {
      setCurrentLap((previousLap) => previousLap - 1);
      return;
    }

    enterStartDrillState();
    setStage("formation");
    setFormationMode("drill");
    setTutorialStep(tutorialSteps.length - 1);
  };

  const handlePick = (optionIndex: number) => {
    if (stage !== "race" || selectedForCurrentLap !== null) return;
    const isCorrect = optionIndex === weekendQuestions[currentLap]?.answer;
    if (isCorrect) {
      playAnswerCorrectSound();
    } else {
      playAnswerWrongSound();
    }
    setLapAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers];
      nextAnswers[currentLap] = optionIndex;
      return nextAnswers;
    });
  };

  const runFinishSequence = () => {
    clearFinishTimer();
    setBestScore((previousBest) => {
      if (score > previousBest) {
        window.localStorage.setItem("f1-best-score", String(score));
        return score;
      }
      return previousBest;
    });
    setStage("finish_intro");
    playFinishFanfare();

    finishTimerRef.current = window.setTimeout(() => {
      setStage("finished");
      finishTimerRef.current = null;
    }, 2600);
  };

  const handleNextLap = () => {
    if (currentLap === totalLaps - 1) {
      runFinishSequence();
      return;
    }

    playArrowButtonSound();

    const nextLap = currentLap + 1;
    setCurrentLap(nextLap);

    if (nextLap === pitStopLap) {
      setStage("pitstop");
    }
  };

  const startPitStop = () => {
    setPitStarted(true);
    setPitStep(0);
    setPitPenalty(0);
    setPitTimeMs(null);
    setPitMessage("go go go. lock the tires in order.");
    pitStartRef.current = getNowMs();
  };

  const handleBeginPitStop = () => {
    playPrepActionSound();
    startPitStop();
  };

  const handleRetryPitStop = () => {
    playRunAgainSound();
    startPitStop();
  };

  const handlePitClick = (tireIndex: number) => {
    if (!pitStarted || pitTimeMs !== null) return;

    const expectedTire = pitOrder[pitStep];

    if (tireIndex === expectedTire) {
      if (pitStep === pitOrder.length - 1) {
        const elapsed = Math.round(
          getNowMs() - (pitStartRef.current ?? getNowMs()) + pitPenalty,
        );

        setPitTimeMs(elapsed);
        setPitStarted(false);
        setPitStopDone(true);
        setPitStopSkipped(false);
        setPitMessage("pit stop complete.");
        playBeep(1000, 140);
        return;
      }

      const nextStep = pitStep + 1;
      setPitStep(nextStep);
      setPitMessage(`nice. now lock ${tireLabels[pitOrder[nextStep]]}.`);
      playBeep(860, 90);
      return;
    }

    setPitPenalty((prev) => prev + 300);
    setPitMessage("wrong corner. +300ms penalty.");
    playBeep(260, 180);
  };

  const goPreviousFromPitStop = () => {
    playArrowButtonSound();
    setPitStarted(false);
    pitStartRef.current = null;
    setStage("race");
    setCurrentLap(Math.max(pitStopLap - 1, 0));
  };

  const goNextFromPitStop = () => {
    playArrowButtonSound();
    setPitStarted(false);
    pitStartRef.current = null;
    setStage("race");
    setCurrentLap(pitStopLap);
  };

  const skipPitStop = () => {
    setPitStopDone(true);
    setPitStopSkipped(true);
    setPitStarted(false);
    setPitTimeMs(null);
    setPitMessage("pit stop skipped.");
    pitStartRef.current = null;
    goNextFromPitStop();
  };

  const goPreviousFromFinish = () => {
    playArrowButtonSound();
    setStage("race");
    setCurrentLap(totalLaps - 1);
  };

  const restartWeekend = () => {
    clearReactionTimers();
    clearSoundTimers();
    clearFinishTimer();
    playRestartSound();

    setStage("formation");
    setFormationMode("intro");
    const nextWeekendQuestions = getRandomWeekendQuestions();
    setWeekendQuestions(nextWeekendQuestions);

    setCurrentLap(0);
    setLapAnswers(nextWeekendQuestions.map(() => null));

    setTutorialStep(0);
    setTutorialAnswers(tutorialSteps.map(() => null));

    setReactionPhase("idle");
    setReactionLights(0);
    setReactionMs(null);
    setStartDrillSkipped(false);

    setPitStopDone(false);
    setPitStarted(false);
    setPitStep(0);
    setPitPenalty(0);
    setPitMessage("pit window open. hit begin when you're ready.");
    setPitTimeMs(null);
    setPitStopSkipped(false);
    pitStartRef.current = null;
  };

  const stageTitle =
    stage === "formation"
      ? formationMode === "drill"
        ? "starting-lights sequence"
        : "formation lap (practice)"
      : stage === "race"
        ? `grand prix live · lap ${currentLap + 1}/${totalLaps}`
        : stage === "pitstop"
          ? "pit stop window"
          : stage === "finish_intro"
            ? "chequered flag cutscene"
            : "race report";

  const nextRaceButtonLabel =
    currentLap === totalLaps - 1
      ? "chequered flag ->"
      : currentLap === pitStopLap - 1
        ? "box, box! ->"
        : "next lap ->";

  return (
    <main className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_#fee2e2_0%,_#fff7ed_45%,_#f5f5f4_100%)] px-3 py-1.5 sm:px-5 sm:py-2">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-1.5 sm:gap-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex"
        >
          <h1 className="w-fit rounded-full bg-red-600/95 px-4 py-1.5 font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight text-white sm:text-xl">
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

              <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-4 pb-0.5 pt-3.5">
                <div className="relative h-2 rounded-full bg-zinc-700">
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

                  <div className="absolute inset-x-0 top-1/2 h-0">
                    {tutorialCheckpoints.map((leftPercent, stepIndex) => {
                      const tutorialState = tutorialMarkerStates[stepIndex] ?? "unanswered";
                      const tutorialRingClass =
                        tutorialState === "unanswered" ? "border-zinc-500" : "border-zinc-300";

                      return (
                        <button
                          type="button"
                          key={`tutorial-marker-${stepIndex}`}
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
                      aria-label="Go to pit stop"
                      onClick={() => jumpToTrackCard({ kind: "pitstop" })}
                      style={{ left: `${pitStopMarkerPos}%` }}
                      className={`absolute top-0 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 sm:h-5 sm:w-5 ${
                        pitStopActive && pitStopBand
                          ? getBandMarkerClass(pitStopBand)
                          : "border-zinc-500 bg-zinc-900"
                      } transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80`}
                    />

                    <button
                      type="button"
                      aria-label="Go to final race report"
                      onClick={() => jumpToTrackCard({ kind: "finish" })}
                      style={{ left: "100%" }}
                      className={`absolute top-0 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 sm:h-5 sm:w-5 ${
                        chequeredActive ? "border-zinc-400 bg-zinc-100" : "border-zinc-500 bg-zinc-900"
                      } transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80`}
                    />
                  </div>
                </div>

                <div className="relative mt-3 hidden h-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 sm:block">
                  <p className="absolute left-0">formation lap</p>
                  <p style={{ left: `${grandPrixMarkerPos}%` }} className="absolute -translate-x-1/2">
                    grand prix
                  </p>
                  <p style={{ left: `${pitStopMarkerPos}%` }} className="absolute -translate-x-1/2">
                    pit stop
                  </p>
                  <p className="absolute right-0">chequered flag</p>
                </div>

                <div className="relative mt-2 h-4 font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400 sm:hidden">
                  <p className="absolute left-0 whitespace-nowrap">formation</p>
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
                  <p className="absolute right-0 whitespace-nowrap">flag</p>
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
                      let&apos;s weave and get some heat in your tyres.
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
                        onPress={goToPreviousBriefing}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      <Button
                        color="danger"
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
                            onPress={goPreviousFromStartDrill}
                            className="w-fit bg-zinc-800 text-zinc-100"
                          >
                            &lt;- previous
                          </Button>
                          <Button color="warning" onPress={handleRunAgainStartDrill} className="font-semibold">
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
                            onPress={goPreviousFromStartDrill}
                            className="w-fit bg-zinc-800 text-zinc-100"
                          >
                            &lt;- previous
                          </Button>
                          <Button color="danger" onPress={startRace} className="font-semibold">
                            lights out and away we go! -&gt;
                          </Button>
                          <Button color="warning" onPress={handleRunAgainStartDrill} className="font-semibold">
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

                    {reactionMs === null && startDrillSkipped && (
                      <p className="font-[family-name:var(--font-manrope)] text-sm font-semibold text-red-300">
                        start-drill incomplete.
                      </p>
                    )}

                    {!hasCompletedStartDrill && (
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
                    className="flex h-full flex-col gap-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Chip variant="flat" color="danger" className="capitalize bg-red-400/25 text-red-100">
                        {question.event}
                      </Chip>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                        lap {currentLap + 1}/{totalLaps} · {Math.round(quizProgress)}%
                      </p>
                    </div>

                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-[1.25rem] font-semibold leading-tight text-white sm:text-[1.325rem]">
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
                        className="rounded-xl border border-zinc-600 bg-zinc-900/75 p-3 font-[family-name:var(--font-manrope)] text-sm text-zinc-100"
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
                      <div className="rounded-xl border border-dashed border-zinc-600 bg-zinc-900/55 p-3 font-[family-name:var(--font-manrope)] text-sm text-zinc-400">
                        race note: lock an answer and this note panel will update for the lap.
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <Button
                        variant="flat"
                        onPress={goPreviousFromRace}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      <Button
                        color="danger"
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
                      tire change sprint
                    </h2>

                    <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                      lock tires in order: front left, front right, rear left, rear right. wrong corner adds
                      300ms.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {tireLabels.map((label, index) => {
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
                      {pitTimeMs === null && pitStopSkipped ? (
                        <>
                          <p className="font-semibold text-red-300">pit stop incomplete.</p>
                          <p className="mt-1.5 text-zinc-400">penalty total: {pitPenalty}ms</p>
                        </>
                      ) : pitTimeMs === null ? (
                        <>
                          <p>{pitMessage}</p>
                          {pitStarted && (
                            <p className="mt-1.5 text-zinc-400">
                              target now: <span className="font-semibold capitalize">{tireLabels[pitOrder[pitStep]]}</span>
                            </p>
                          )}
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
                        onPress={goPreviousFromPitStop}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        &lt;- previous
                      </Button>
                      {!pitStarted && hasCompletedPitStop && (
                        <Button color="danger" onPress={goNextFromPitStop} className="font-semibold">
                          rejoin the track -&gt;
                        </Button>
                      )}
                      {!pitStarted && !hasCompletedPitStop && (
                        <Button color="warning" onPress={handleBeginPitStop} className="font-semibold">
                          begin pit stop -&gt;
                        </Button>
                      )}
                      {!pitStarted && hasCompletedPitStop && (
                        <Button color="warning" onPress={handleRetryPitStop} className="font-semibold">
                          retry pit stop
                        </Button>
                      )}
                    </div>

                    {!hasCompletedPitStop && (
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
                      animate={{ left: finishTier === 0 ? "46%" : "76%", y: "-50%" }}
                      transition={{
                        duration: finishTier === 4 ? 6 : finishTier === 0 ? 2.4 : 2.1,
                        ease: finishTier === 4 ? "linear" : finishTier === 0 ? "easeOut" : "easeInOut",
                      }}
                    >
                      🏎️
                    </motion.div>

                    {finishTier === 0 && (
                      <>
                        {[0, 1, 2].map((smokeIndex) => (
                          <motion.div
                            key={`dnf-smoke-${smokeIndex}`}
                            className="pointer-events-none absolute top-[38%] text-2xl sm:text-3xl"
                            initial={{ left: `${44 + smokeIndex * 2.4}%`, opacity: 0, scale: 0.65 }}
                            animate={{
                              left: `${42 + smokeIndex * 3.6}%`,
                              top: `${30 + smokeIndex * 2}%`,
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
                          className="pointer-events-none absolute left-[52%] top-[38%] text-3xl sm:text-4xl"
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

                    <motion.div
                      className="pointer-events-none absolute right-4 top-4 text-6xl"
                      animate={{ rotate: [0, -16, 14, -8, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      🏁
                    </motion.div>

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
                                  className="absolute -top-8 text-2xl"
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
                                  className="absolute -top-7 text-2xl"
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
                          className="pointer-events-none absolute bottom-24 right-40 text-3xl sm:bottom-28 sm:right-52"
                          initial={{ opacity: 0, scale: 0.6, rotate: -18 }}
                          animate={{ opacity: 1, scale: 1, rotate: -7 }}
                          transition={{ delay: 2, duration: 0.35, ease: "easeOut" }}
                        >
                          🍾
                        </motion.div>
                        <motion.div
                          className="pointer-events-none absolute bottom-24 right-2 text-3xl sm:bottom-28 sm:right-10"
                          initial={{ opacity: 0, scale: 0.6, rotate: 18 }}
                          animate={{ opacity: 1, scale: 1, rotate: 8 }}
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

                    <div className="relative flex h-full flex-col gap-3">
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
                          <div className="flex flex-wrap gap-2">
                            {reactionMs !== null ? (
                              <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                                start-drill
                                <span className={`ml-1 font-bold ${getReactionValueClass(reactionMs)}`}>
                                  {reactionMs}ms
                                </span>
                              </Chip>
                            ) : (
                              <Chip
                                variant="flat"
                                className="border border-red-300/40 bg-red-500/20 text-red-200"
                              >
                                start-drill skipped
                              </Chip>
                            )}
                            {pitTimeMs !== null ? (
                              <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                                pit stop
                                <span className={`ml-1 font-bold ${getPitValueClass(pitTimeMs, activePitBands)}`}>
                                  {pitTimeMs}ms
                                </span>
                              </Chip>
                            ) : (
                              <Chip
                                variant="flat"
                                className="border border-red-300/40 bg-red-500/20 text-red-200"
                              >
                                pit stop skipped
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
    </main>
  );
}
