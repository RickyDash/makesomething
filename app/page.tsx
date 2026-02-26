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
type FormationMode = "briefing" | "drill";
type ReactionPhase = "idle" | "countdown" | "go" | "early" | "success";

type TutorialStep = {
  prompt: string;
  options: string[];
  answer: number;
  note: string;
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

const grandPrixMarkerPos = 24;
const finishMarkerPos = 100;

const getReactionValueClass = (ms: number) =>
  ms < 250 ? "text-emerald-300" : ms < 300 ? "text-amber-300" : "text-red-300";

const getPitValueClass = (ms: number) =>
  ms < 1800 ? "text-emerald-300" : ms < 2400 ? "text-amber-300" : "text-red-300";

const getScoreValueClass = (value: number) =>
  value >= 5 ? "text-emerald-300" : value >= 3 ? "text-amber-300" : "text-red-300";

const getReactionFeedback = (ms: number) =>
  ms < 250
    ? "that's rapid. green band is under 250ms."
    : ms < 300
      ? "solid start. beat 250ms for green."
      : "you can be faster. get under 300ms for yellow, under 250ms for green.";

const getPitFeedback = (ms: number) =>
  ms < 1800
    ? "that's rapid. green band is under 1800ms."
    : ms < 2400
      ? "solid stop. beat 1800ms for green."
      : "you can be faster. get under 2400ms for yellow, under 1800ms for green.";

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
  const [formationMode, setFormationMode] = useState<FormationMode>("briefing");
  const [weekendQuestions, setWeekendQuestions] = useState<Question[]>(initialWeekendQuestions);

  const [currentLap, setCurrentLap] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialSelected, setTutorialSelected] = useState<number | null>(null);

  const [reactionPhase, setReactionPhase] = useState<ReactionPhase>("idle");
  const [reactionLights, setReactionLights] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  const [pitStopDone, setPitStopDone] = useState(false);
  const [pitStarted, setPitStarted] = useState(false);
  const [pitStep, setPitStep] = useState(0);
  const [pitPenalty, setPitPenalty] = useState(0);
  const [pitMessage, setPitMessage] = useState("pit window open. hit begin when you're ready.");
  const [pitTimeMs, setPitTimeMs] = useState<number | null>(null);

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
  const question = weekendQuestions[currentLap] ?? weekendQuestions[0] ?? initialWeekendQuestions[0];
  const answeredLaps = currentLap + (selected !== null ? 1 : 0);

  const tutorialCurrent = tutorialSteps[tutorialStep];
  const tutorialAnswered = tutorialStep + (tutorialSelected !== null ? 1 : 0);

  const formationSegmentProgress = useMemo(() => {
    if (stage !== "formation") return 100;
    if (formationMode === "drill") return 100;
    return (tutorialAnswered / tutorialSteps.length) * 100;
  }, [stage, formationMode, tutorialAnswered]);

  const raceSegmentProgress = useMemo(() => {
    if (stage === "formation") return 0;

    if (stage === "race") {
      return Math.min((answeredLaps / totalLaps) * 100, 100);
    }

    if (stage === "pitstop") {
      return (pitStopLap / totalLaps) * 100;
    }

    return 100;
  }, [stage, answeredLaps, totalLaps, pitStopLap]);

  const quizProgress = useMemo(() => ((currentLap + 1) / totalLaps) * 100, [currentLap, totalLaps]);

  const finishLabel = useMemo(() => {
    const ratio = score / totalLaps;
    if (ratio === 1) return "perfect weekend";
    if (ratio >= 0.75) return "podium finish";
    if (ratio >= 0.5) return "points finish";
    return "comeback story";
  }, [score, totalLaps]);

  const pitStopMarkerPos = useMemo(() => {
    const raceTrackWidth = finishMarkerPos - grandPrixMarkerPos;
    return grandPrixMarkerPos + raceTrackWidth * (pitStopLap / totalLaps);
  }, [pitStopLap, totalLaps]);

  const scoreValueClass = getScoreValueClass(score);
  const bestScoreValueClass = getScoreValueClass(bestScore);

  const formationActive = true;
  const grandPrixActive = stage !== "formation" || reactionPhase !== "idle";
  const pitStopActive =
    stage === "pitstop" || pitStopDone || stage === "finish_intro" || stage === "finished";
  const chequeredActive = stage === "finish_intro" || stage === "finished";

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

  const handleTutorialPick = (optionIndex: number) => {
    if (stage !== "formation" || formationMode !== "briefing" || tutorialSelected !== null) return;
    setTutorialSelected(optionIndex);
  };

  const goToNextBriefing = () => {
    if (tutorialSelected === null) return;
    playArrowButtonSound();

    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep((prev) => prev + 1);
      setTutorialSelected(null);
      return;
    }

    setFormationMode("drill");
    setTutorialSelected(null);
  };

  const skipFormationLab = () => {
    playArrowButtonSound();
    setFormationMode("drill");
    setTutorialSelected(null);
  };

  const startReactionSequence = (withActivationBeep = true) => {
    if (stage !== "formation" || formationMode !== "drill") return;

    clearReactionTimers();
    if (withActivationBeep) {
      playBeep(760, 100);
    }
    setReactionPhase("countdown");
    setReactionLights(0);
    setReactionMs(null);

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
      setReactionMs(null);
      playBeep(220, 220);
      return;
    }

    if (reactionPhase === "go" && goTimeRef.current !== null) {
      const time = Math.round(getNowMs() - goTimeRef.current);
      setReactionMs(time);
      setReactionPhase("success");
      clearReactionTimers();
      playBeep(960, 140);

      if (bestReactionMs === null || time < bestReactionMs) {
        setBestReactionMs(time);
        window.localStorage.setItem("f1-best-reaction-ms", String(time));
      }
    }
  };

  const startRace = () => {
    clearReactionTimers();
    playArrowButtonSound();
    setStage("race");
  };

  const rejoinRace = () => {
    playArrowButtonSound();
    setStage("race");
  };

  const handlePick = (optionIndex: number) => {
    if (selected !== null || stage !== "race") return;

    setSelected(optionIndex);
    if (optionIndex === question.answer) {
      setScore((prev) => prev + 1);
    }
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
    if (selected === null) return;

    if (currentLap === totalLaps - 1) {
      runFinishSequence();
      return;
    }

    playArrowButtonSound();

    const nextLap = currentLap + 1;
    setCurrentLap(nextLap);
    setSelected(null);

    if (nextLap === pitStopLap && !pitStopDone) {
      setStage("pitstop");
      setPitStarted(false);
      setPitStep(0);
      setPitPenalty(0);
      setPitMessage("pit window open. hit begin when you're ready.");
      setPitTimeMs(null);
      pitStartRef.current = null;
    }
  };

  const startPitStop = () => {
    setPitStarted(true);
    setPitStep(0);
    setPitPenalty(0);
    setPitTimeMs(null);
    setPitMessage("go go go. lock the tires in order.");
    pitStartRef.current = getNowMs();
    playBeep(760, 100);
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

  const restartWeekend = () => {
    clearReactionTimers();
    clearSoundTimers();
    clearFinishTimer();
    playRestartSound();

    setStage("formation");
    setFormationMode("briefing");
    setWeekendQuestions(getRandomWeekendQuestions());

    setCurrentLap(0);
    setSelected(null);
    setScore(0);

    setTutorialStep(0);
    setTutorialSelected(null);

    setReactionPhase("idle");
    setReactionLights(0);
    setReactionMs(null);

    setPitStopDone(false);
    setPitStarted(false);
    setPitStep(0);
    setPitPenalty(0);
    setPitMessage("pit window open. hit begin when you're ready.");
    setPitTimeMs(null);
  };

  const stageTitle =
    stage === "formation"
      ? "formation lap (tutorial)"
      : stage === "race"
        ? `grand prix live · lap ${currentLap + 1}/${totalLaps}`
        : stage === "pitstop"
          ? "pit stop window"
          : stage === "finish_intro"
            ? "chequered flag cutscene"
            : "race report";

  const raceTrackWidth = finishMarkerPos - grandPrixMarkerPos;

  const nextRaceButtonLabel =
    currentLap === totalLaps - 1
      ? "take the chequered flag ->"
      : currentLap === pitStopLap - 1 && !pitStopDone
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
            <div className="flex h-full min-h-0 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">{stageTitle}</p>
                {stage === "formation" && formationMode === "briefing" && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    step {tutorialStep + 1}/{tutorialSteps.length} · {totalLaps} laps total
                  </p>
                )}
                {stage === "formation" && formationMode === "drill" && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    start drill · {totalLaps} laps total
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

              <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-3 sm:px-4">
                <div className="relative h-2 rounded-full bg-zinc-700">
                  <motion.div
                    className="absolute left-0 top-0 h-2 rounded-full"
                    style={{ backgroundColor: "#5c9cad" }}
                    animate={{ width: `${(grandPrixMarkerPos * formationSegmentProgress) / 100}%` }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />

                  <motion.div
                    className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-zinc-100"
                    style={{ left: `${grandPrixMarkerPos}%` }}
                    animate={{ width: `${(raceTrackWidth * raceSegmentProgress) / 100}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />

                  <div className="pointer-events-none absolute inset-x-0 top-1 flex -translate-y-1/2 justify-between">
                    <span
                      className={`h-3.5 w-3.5 rotate-45 border-2 ${
                        formationActive
                          ? "border-[#8dc1cc] bg-[#5c9cad]"
                          : "border-zinc-500 bg-zinc-900"
                      }`}
                    />

                    <span
                      style={{ left: `${grandPrixMarkerPos}%` }}
                      className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 ${
                        grandPrixActive ? "border-red-200 bg-red-500" : "border-zinc-500 bg-zinc-900"
                      }`}
                    />

                    <span
                      style={{ left: `${pitStopMarkerPos}%` }}
                      className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 ${
                        pitStopActive ? "border-[#f9d781] bg-[#f5ba29]" : "border-zinc-500 bg-zinc-900"
                      }`}
                    />

                    <span
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        chequeredActive ? "border-zinc-200 bg-zinc-100" : "border-zinc-500 bg-zinc-900"
                      }`}
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

                <div className="mt-3 grid grid-cols-4 gap-1 text-center font-mono text-[9px] uppercase tracking-widest text-zinc-400 sm:hidden">
                  <p>formation</p>
                  <p>grand prix</p>
                  <p>pit stop</p>
                  <p>flag</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-700/60 bg-zinc-900/45 p-3 sm:p-4">
                {stage === "formation" && formationMode === "briefing" && (
                  <div className="flex flex-col gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-red-100">how this race works (practice)</p>
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
                        <p>{tutorialCurrent.note}</p>
                      ) : (
                        <p>race note: lock an answer and this panel shows the note for that step.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {tutorialSelected !== null && (
                        <Button color="danger" onPress={goToNextBriefing} className="w-fit font-semibold">
                          {tutorialStep === tutorialSteps.length - 1
                            ? "line up on the grid ->"
                            : "next briefing ->"}
                        </Button>
                      )}
                      <Button
                        variant="flat"
                        onPress={skipFormationLab}
                        className="w-fit bg-zinc-800 text-zinc-100"
                      >
                        skip formation lap -&gt;
                      </Button>
                    </div>
                  </div>
                )}

                {stage === "formation" && formationMode === "drill" && (
                  <div className="flex flex-col gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-red-100">start drill</p>
                    <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-100">
                      initiate the starting lights sequence, watch the lights above, then hit LAUNCH only
                      when the lights go out.
                    </p>

                    {reactionPhase === "idle" && (
                      <Button color="danger" onPress={handleStartDrillSequence} className="w-fit font-semibold">
                        initiate starting lights sequence -&gt;
                      </Button>
                    )}

                    {reactionPhase === "countdown" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button color="danger" onPress={handleReactionTap} className="font-semibold">
                          LAUNCH
                        </Button>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-red-100">
                          wait for lights out
                        </p>
                      </div>
                    )}

                    {reactionPhase === "go" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button color="success" onPress={handleReactionTap} className="font-semibold">
                          LAUNCH
                        </Button>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-emerald-100">
                          lights out
                        </p>
                      </div>
                    )}

                    {reactionPhase === "early" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-red-100">
                          jump start. too early.
                        </p>
                        <Button color="warning" onPress={handleRunAgainStartDrill} className="font-semibold">
                          retry start drill
                        </Button>
                      </div>
                    )}

                    {reactionPhase === "success" && reactionMs !== null && (
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-wrap items-center gap-2">
                          <Button color="danger" onPress={startRace} className="font-semibold">
                            lights out and away we go! -&gt;
                          </Button>
                          <Button color="warning" onPress={handleRunAgainStartDrill} className="font-semibold">
                            run again
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
                  </div>
                )}

                {stage === "race" && (
                  <motion.div
                    key={currentLap}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Chip variant="flat" color="danger" className="capitalize bg-red-400/25 text-red-100">
                        {question.event}
                      </Chip>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                        lap {currentLap + 1}/{totalLaps} · {Math.round(quizProgress)}%
                      </p>
                    </div>

                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold leading-tight text-white">
                      {question.prompt}
                    </h2>

                    <div className="grid gap-2.5">
                      {question.options.map((option, index) => {
                        const isCorrect = index === question.answer;
                        const isSelected = selected === index;

                        const variant = selected === null ? "flat" : isCorrect || isSelected ? "solid" : "flat";
                        const color =
                          selected === null
                            ? "default"
                            : isCorrect
                              ? "success"
                              : isSelected
                                ? "danger"
                                : "default";
                        const className =
                          selected === null
                            ? "justify-start bg-zinc-700 px-5 text-left text-base !text-zinc-100"
                            : isCorrect || isSelected
                              ? "justify-start px-5 text-left text-base"
                              : "justify-start bg-zinc-800 px-5 text-left text-base !text-zinc-300";

                        return (
                          <Button
                            key={option}
                            size="lg"
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

                    {selected !== null ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-zinc-600 bg-zinc-900/75 p-3.5 font-[family-name:var(--font-manrope)] text-sm text-zinc-100"
                      >
                        {question.fact}
                      </motion.div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-600 bg-zinc-900/55 p-3.5 font-[family-name:var(--font-manrope)] text-sm text-zinc-400">
                        race note: lock an answer and this note panel will update for the lap.
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <Button
                        color="danger"
                        isDisabled={selected === null}
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
                    className="flex h-full flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Chip color="warning" variant="flat" className="bg-amber-400/25 text-amber-100">
                        pit stop challenge
                      </Chip>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">mid-race</p>
                    </div>

                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-white">
                      tire change sprint
                    </h2>

                    <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                      lock tires in order: front left, front right, rear left, rear right. wrong corner adds
                      300ms.
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      {tireLabels.map((label, index) => {
                        const expected = pitOrder[pitStep] === index;

                        return (
                          <Button
                            key={label}
                            size="lg"
                            variant={pitStarted ? "solid" : "flat"}
                            color={pitStarted && expected ? "warning" : "default"}
                            className="h-14 capitalize"
                            onPress={() => handlePitClick(index)}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="rounded-xl border border-zinc-600 bg-zinc-900/70 p-3.5 font-[family-name:var(--font-manrope)] text-sm text-zinc-100">
                      {pitTimeMs === null ? (
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
                          <p className={`font-semibold ${getPitValueClass(pitTimeMs)}`}>pit time {pitTimeMs}ms</p>
                          <p className="mt-1 text-zinc-400">penalty total: {pitPenalty}ms</p>
                          <p className={`mt-1.5 ${getPitValueClass(pitTimeMs)}`}>{getPitFeedback(pitTimeMs)}</p>
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex w-full flex-wrap items-center gap-2">
                      {pitTimeMs !== null ? (
                        <>
                          <Button color="danger" onPress={rejoinRace} className="font-semibold">
                            rejoin the race -&gt;
                          </Button>
                          <Button color="warning" onPress={startPitStop} className="font-semibold">
                            retry pit stop
                          </Button>
                        </>
                      ) : !pitStarted ? (
                        <Button color="warning" onPress={startPitStop} className="font-semibold">
                          begin pit stop -&gt;
                        </Button>
                      ) : null}
                    </div>
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
                      animate={{ left: "76%", y: "-50%" }}
                      transition={{ duration: 2.1, ease: "easeInOut" }}
                    >
                      🏎️
                    </motion.div>

                    <motion.div
                      className="pointer-events-none absolute right-4 top-4 text-6xl"
                      animate={{ rotate: [0, -16, 14, -8, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      🏁
                    </motion.div>

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
                            {reactionMs !== null && (
                              <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                                start reaction
                                <span className={`ml-1 font-bold ${getReactionValueClass(reactionMs)}`}>
                                  {reactionMs}ms
                                </span>
                              </Chip>
                            )}
                            {pitTimeMs !== null && (
                              <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                                pit stop
                                <span className={`ml-1 font-bold ${getPitValueClass(pitTimeMs)}`}>
                                  {pitTimeMs}ms
                                </span>
                              </Chip>
                            )}
                            <Chip variant="flat" className="bg-zinc-800 text-zinc-100">
                              best score
                              <span className={`ml-1 font-bold ${bestScoreValueClass}`}>
                                {bestScore}/{totalLaps}
                              </span>
                            </Chip>
                          </div>

                          <Button color="danger" onPress={restartWeekend} className="w-fit font-semibold">
                            run another grand prix
                          </Button>
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
