"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";

type SoundSample = {
  id: string;
  name: string;
  description: string;
  waveform: OscillatorType;
  frequencies: readonly number[];
  noteDurationMs: number;
  gapMs: number;
  volume: number;
};

type MockQuestion = {
  prompt: string;
  choices: readonly string[];
  answerIndex: number;
};

type SimulatorMode = "single" | "rapid";
type OutcomeState = "correct" | "wrong" | null;

const correctSamples: readonly SoundSample[] = [
  {
    id: "a1",
    name: "A1",
    description: "triple clean rise",
    waveform: "sine",
    frequencies: [500, 620, 760],
    noteDurationMs: 38,
    gapMs: 9,
    volume: 0.13,
  },
  {
    id: "a2",
    name: "A2",
    description: "bright triple chirp",
    waveform: "triangle",
    frequencies: [540, 660, 820],
    noteDurationMs: 34,
    gapMs: 8,
    volume: 0.14,
  },
  {
    id: "a3",
    name: "A3",
    description: "tight positive triple",
    waveform: "sine",
    frequencies: [470, 560, 700],
    noteDurationMs: 30,
    gapMs: 8,
    volume: 0.12,
  },
  {
    id: "a4",
    name: "A4",
    description: "warm upward triplet",
    waveform: "triangle",
    frequencies: [520, 610, 730],
    noteDurationMs: 36,
    gapMs: 9,
    volume: 0.13,
  },
  {
    id: "a5",
    name: "A5",
    description: "sporty triple climb",
    waveform: "triangle",
    frequencies: [560, 670, 800],
    noteDurationMs: 28,
    gapMs: 7,
    volume: 0.12,
  },
  {
    id: "a6",
    name: "A6",
    description: "smooth triple sparkle",
    waveform: "sine",
    frequencies: [510, 630, 780],
    noteDurationMs: 32,
    gapMs: 8,
    volume: 0.11,
  },
  {
    id: "a7",
    name: "A7",
    description: "compact arcade triple",
    waveform: "square",
    frequencies: [480, 580, 700],
    noteDurationMs: 24,
    gapMs: 7,
    volume: 0.08,
  },
  {
    id: "a8",
    name: "A8",
    description: "energetic victory three",
    waveform: "triangle",
    frequencies: [600, 700, 860],
    noteDurationMs: 27,
    gapMs: 8,
    volume: 0.12,
  },
  {
    id: "a9",
    name: "A9",
    description: "rounded melodic triple",
    waveform: "sine",
    frequencies: [490, 590, 740],
    noteDurationMs: 35,
    gapMs: 9,
    volume: 0.12,
  },
  {
    id: "a10",
    name: "A10",
    description: "light, crisp triple up",
    waveform: "triangle",
    frequencies: [530, 620, 750],
    noteDurationMs: 26,
    gapMs: 7,
    volume: 0.11,
  },
  {
    id: "a11",
    name: "A11",
    description: "high-energy triple ping",
    waveform: "triangle",
    frequencies: [620, 760, 910],
    noteDurationMs: 28,
    gapMs: 8,
    volume: 0.12,
  },
  {
    id: "a12",
    name: "A12",
    description: "clean harmonic triplet",
    waveform: "sine",
    frequencies: [520, 650, 820],
    noteDurationMs: 34,
    gapMs: 8,
    volume: 0.12,
  },
];

const wrongSamples: readonly SoundSample[] = [
  {
    id: "b1",
    name: "B1",
    description: "short descending cue",
    waveform: "triangle",
    frequencies: [430, 330],
    noteDurationMs: 58,
    gapMs: 12,
    volume: 0.13,
  },
  {
    id: "b2",
    name: "B2",
    description: "compact low drop",
    waveform: "sine",
    frequencies: [410, 300],
    noteDurationMs: 50,
    gapMs: 10,
    volume: 0.12,
  },
  {
    id: "b3",
    name: "B3",
    description: "triple downstep",
    waveform: "triangle",
    frequencies: [460, 380, 320],
    noteDurationMs: 30,
    gapMs: 8,
    volume: 0.11,
  },
  {
    id: "b4",
    name: "B4",
    description: "muted incorrect tap",
    waveform: "square",
    frequencies: [390, 320],
    noteDurationMs: 40,
    gapMs: 10,
    volume: 0.08,
  },
  {
    id: "b5",
    name: "B5",
    description: "low double pulse",
    waveform: "sine",
    frequencies: [370, 280],
    noteDurationMs: 44,
    gapMs: 12,
    volume: 0.11,
  },
  {
    id: "b6",
    name: "B6",
    description: "subtle downward blip",
    waveform: "triangle",
    frequencies: [420, 340],
    noteDurationMs: 34,
    gapMs: 8,
    volume: 0.1,
  },
  {
    id: "b7",
    name: "B7",
    description: "short soft buzzy drop",
    waveform: "square",
    frequencies: [450, 340, 290],
    noteDurationMs: 24,
    gapMs: 7,
    volume: 0.08,
  },
  {
    id: "b8",
    name: "B8",
    description: "calm two-note sink",
    waveform: "sine",
    frequencies: [400, 320],
    noteDurationMs: 56,
    gapMs: 12,
    volume: 0.11,
  },
  {
    id: "b9",
    name: "B9",
    description: "tight penalty ping",
    waveform: "triangle",
    frequencies: [440, 360],
    noteDurationMs: 30,
    gapMs: 9,
    volume: 0.1,
  },
  {
    id: "b10",
    name: "B10",
    description: "gentle triple fall",
    waveform: "sine",
    frequencies: [430, 360, 300],
    noteDurationMs: 26,
    gapMs: 7,
    volume: 0.1,
  },
  {
    id: "b11",
    name: "B11",
    description: "low damped cue",
    waveform: "triangle",
    frequencies: [390, 300],
    noteDurationMs: 48,
    gapMs: 9,
    volume: 0.11,
  },
  {
    id: "b12",
    name: "B12",
    description: "neutral miss tone",
    waveform: "sine",
    frequencies: [360, 280],
    noteDurationMs: 54,
    gapMs: 12,
    volume: 0.1,
  },
];

const mockQuestions: readonly MockQuestion[] = [
  {
    prompt: "which team is based in maranello?",
    choices: ["ferrari", "mclaren", "williams"],
    answerIndex: 0,
  },
  {
    prompt: "what color flag ends the race?",
    choices: ["yellow", "black", "chequered"],
    answerIndex: 2,
  },
  {
    prompt: "what is the race start called?",
    choices: ["formation lap", "parc ferme", "sprint shootout"],
    answerIndex: 0,
  },
  {
    prompt: "what does drs help with most?",
    choices: ["tyre warming", "overtaking speed", "fuel saving"],
    answerIndex: 1,
  },
  {
    prompt: "what does a pit stop usually change?",
    choices: ["driver helmet", "tyres", "engine mapping only"],
    answerIndex: 1,
  },
  {
    prompt: "what does a red flag mean?",
    choices: ["race stopped", "final lap", "safety car only"],
    answerIndex: 0,
  },
  {
    prompt: "what is q3 in qualifying?",
    choices: ["warmup session", "last elimination round", "media session"],
    answerIndex: 1,
  },
  {
    prompt: "what does box, box usually mean?",
    choices: ["retire now", "pit this lap", "switch to wets"],
    answerIndex: 1,
  },
  {
    prompt: "which tyre compound is usually the fastest?",
    choices: ["hard", "medium", "soft"],
    answerIndex: 2,
  },
  {
    prompt: "what is parc ferme?",
    choices: ["pit lane speed check", "post-session car restrictions", "practice curfew"],
    answerIndex: 1,
  },
  {
    prompt: "what can trigger a five-second penalty?",
    choices: ["unsafe release", "using drs once", "missing apex once"],
    answerIndex: 0,
  },
  {
    prompt: "what does undercut strategy mean?",
    choices: ["pit earlier to gain track position", "stay out on old tyres", "use harder tyres first"],
    answerIndex: 0,
  },
];

const RAPID_TOTAL_ATTEMPTS = 6;

export default function AnswerSoundLabPage() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const rapidAdvanceTimeoutRef = useRef<number | null>(null);

  const [selectedCorrectSampleId, setSelectedCorrectSampleId] = useState<string | null>(null);
  const [selectedWrongSampleId, setSelectedWrongSampleId] = useState<string | null>("b1");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [simulatorMode, setSimulatorMode] = useState<SimulatorMode>("single");

  const [singleQuestionSeed, setSingleQuestionSeed] = useState(0);
  const [singleSelectedChoice, setSingleSelectedChoice] = useState<number | null>(null);

  const [rapidQuestionSeed, setRapidQuestionSeed] = useState(3);
  const [rapidAttemptIndex, setRapidAttemptIndex] = useState(0);
  const [rapidLockedChoice, setRapidLockedChoice] = useState<number | null>(null);
  const [rapidCorrectCount, setRapidCorrectCount] = useState(0);
  const [rapidWrongCount, setRapidWrongCount] = useState(0);
  const [rapidOutcomes, setRapidOutcomes] = useState<OutcomeState[]>(
    Array.from({ length: RAPID_TOTAL_ATTEMPTS }, () => null),
  );

  const selectedCorrectSample = useMemo(
    () => correctSamples.find((sample) => sample.id === selectedCorrectSampleId) ?? null,
    [selectedCorrectSampleId],
  );
  const selectedWrongSample = useMemo(
    () => wrongSamples.find((sample) => sample.id === selectedWrongSampleId) ?? null,
    [selectedWrongSampleId],
  );

  const singleQuestion = mockQuestions[singleQuestionSeed % mockQuestions.length];
  const rapidQuestionIndices = useMemo(
    () =>
      Array.from({ length: RAPID_TOTAL_ATTEMPTS }, (_, index) => (rapidQuestionSeed + index) % mockQuestions.length),
    [rapidQuestionSeed],
  );
  const rapidQuestion =
    rapidAttemptIndex < RAPID_TOTAL_ATTEMPTS ? mockQuestions[rapidQuestionIndices[rapidAttemptIndex]] : null;
  const rapidFinished = rapidAttemptIndex >= RAPID_TOTAL_ATTEMPTS;

  const clearRapidAdvanceTimeout = () => {
    if (rapidAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(rapidAdvanceTimeoutRef.current);
      rapidAdvanceTimeoutRef.current = null;
    }
  };

  const stopActiveSounds = () => {
    activeOscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // oscillator can already be stopped if sequence ended naturally.
      }
      try {
        oscillator.disconnect();
      } catch {
        // disconnect can throw if already disconnected.
      }
    });
    activeOscillatorsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearRapidAdvanceTimeout();
      stopActiveSounds();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    };
  }, []);

  const ensureAudioContext = () => {
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }
    void audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playBeepSequence = (sample: SoundSample | null) => {
    if (!sample) return false;

    const ctx = ensureAudioContext();
    if (!ctx) return false;

    stopActiveSounds();

    const startTime = ctx.currentTime;
    const noteStepSeconds = (sample.noteDurationMs + sample.gapMs) / 1000;

    sample.frequencies.forEach((frequency, index) => {
      const noteStart = startTime + index * noteStepSeconds;
      const noteStop = noteStart + sample.noteDurationMs / 1000;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = sample.waveform;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(sample.volume, noteStart + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStop);

      oscillator.start(noteStart);
      oscillator.stop(noteStop + 0.015);
      activeOscillatorsRef.current.push(oscillator);

      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gain.disconnect();
        } catch {
          // ignore cleanup errors
        }
      };
    });

    return true;
  };

  const playOutcomeSound = (outcome: "correct" | "wrong") => {
    const sample = outcome === "correct" ? selectedCorrectSample : selectedWrongSample;
    if (!sample) {
      setStatusMessage(
        outcome === "correct"
          ? "pick a correct-answer sample first."
          : "pick a wrong-answer sample first.",
      );
      return;
    }
    setStatusMessage(null);
    playBeepSequence(sample);
  };

  const handleSingleChoice = (choiceIndex: number) => {
    if (singleSelectedChoice !== null) return;
    setSingleSelectedChoice(choiceIndex);
    const isCorrect = choiceIndex === singleQuestion.answerIndex;
    playOutcomeSound(isCorrect ? "correct" : "wrong");
  };

  const handleNewSingleAttempt = () => {
    setSingleQuestionSeed((seed) => (seed + 1) % mockQuestions.length);
    setSingleSelectedChoice(null);
  };

  const handleRapidChoice = (choiceIndex: number) => {
    if (rapidFinished || rapidLockedChoice !== null || !rapidQuestion) return;

    clearRapidAdvanceTimeout();
    setRapidLockedChoice(choiceIndex);

    const isCorrect = choiceIndex === rapidQuestion.answerIndex;
    playOutcomeSound(isCorrect ? "correct" : "wrong");

    setRapidOutcomes((current) => {
      const next = [...current];
      next[rapidAttemptIndex] = isCorrect ? "correct" : "wrong";
      return next;
    });
    if (isCorrect) {
      setRapidCorrectCount((count) => count + 1);
    } else {
      setRapidWrongCount((count) => count + 1);
    }

    if (rapidAttemptIndex < RAPID_TOTAL_ATTEMPTS - 1) {
      const nextAttempt = rapidAttemptIndex + 1;
      rapidAdvanceTimeoutRef.current = window.setTimeout(() => {
        setRapidAttemptIndex(nextAttempt);
        setRapidLockedChoice(null);
      }, 520);
    } else {
      rapidAdvanceTimeoutRef.current = window.setTimeout(() => {
        setRapidAttemptIndex(RAPID_TOTAL_ATTEMPTS);
        setRapidLockedChoice(null);
      }, 520);
    }
  };

  const handleRestartRapid = () => {
    clearRapidAdvanceTimeout();
    setRapidQuestionSeed((seed) => (seed + 2) % mockQuestions.length);
    setRapidAttemptIndex(0);
    setRapidLockedChoice(null);
    setRapidCorrectCount(0);
    setRapidWrongCount(0);
    setRapidOutcomes(Array.from({ length: RAPID_TOTAL_ATTEMPTS }, () => null));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fee2e2_0%,_#fff7ed_45%,_#f5f5f4_100%)] px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <Card className="sticky top-3 z-20 border border-zinc-900/10 bg-zinc-950 text-white">
          <CardBody className="gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">sound lab</p>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
                  answer-outcome audition
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip className="border border-emerald-300/40 bg-emerald-500/20 text-emerald-100" variant="flat">
                  correct: {selectedCorrectSample ? selectedCorrectSample.name : "not selected"}
                </Chip>
                <Chip className="border border-red-300/40 bg-red-500/20 text-red-100" variant="flat">
                  wrong: {selectedWrongSample ? selectedWrongSample.name : "not selected"}
                </Chip>
              </div>
            </div>

            <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
              pick one correct-answer sound and one wrong-answer sound, then test them with mock taps below.
              selections are session-only on this page.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-emerald-500 text-black font-semibold"
                onPress={() => playOutcomeSound("correct")}
              >
                preview correct answer
              </Button>
              <Button className="bg-red-500 text-white font-semibold" onPress={() => playOutcomeSound("wrong")}>
                preview wrong answer
              </Button>
            </div>

            {statusMessage && (
              <p className="font-[family-name:var(--font-manrope)] text-sm font-semibold text-red-200">
                {statusMessage}
              </p>
            )}
          </CardBody>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border border-emerald-300/25 bg-zinc-950 text-white">
            <CardBody className="gap-4 p-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-emerald-200">correct answer sounds</p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                  pick your positive cue
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {correctSamples.map((sample) => {
                  const isSelected = sample.id === selectedCorrectSampleId;
                  return (
                    <Card
                      key={sample.id}
                      className={`border ${isSelected ? "border-emerald-300/70 bg-emerald-500/10" : "border-zinc-700/60 bg-zinc-900/80"}`}
                    >
                      <CardBody className="gap-3 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                            Sample {sample.name}
                          </p>
                          {isSelected && (
                            <Chip
                              variant="flat"
                              className="border border-emerald-300/40 bg-emerald-500/20 text-emerald-100"
                            >
                              selected
                            </Chip>
                          )}
                        </div>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                          {sample.description}
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                          {sample.waveform} • {sample.frequencies.join(" / ")}hz
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            variant="flat"
                            className="bg-zinc-800 text-zinc-100"
                            onPress={() => playBeepSequence(sample)}
                          >
                            play
                          </Button>
                          <Button
                            className="bg-emerald-500 text-black font-semibold"
                            onPress={() => {
                              setSelectedCorrectSampleId(sample.id);
                              setStatusMessage(null);
                            }}
                          >
                            select this
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card className="border border-red-300/25 bg-zinc-950 text-white">
            <CardBody className="gap-4 p-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-red-200">wrong answer sounds</p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                  pick your miss cue
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {wrongSamples.map((sample) => {
                  const isSelected = sample.id === selectedWrongSampleId;
                  return (
                    <Card
                      key={sample.id}
                      className={`border ${isSelected ? "border-red-300/70 bg-red-500/10" : "border-zinc-700/60 bg-zinc-900/80"}`}
                    >
                      <CardBody className="gap-3 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                            Sample {sample.name}
                          </p>
                          {isSelected && (
                            <Chip variant="flat" className="border border-red-300/40 bg-red-500/20 text-red-100">
                              selected
                            </Chip>
                          )}
                        </div>
                        <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                          {sample.description}
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                          {sample.waveform} • {sample.frequencies.join(" / ")}hz
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            variant="flat"
                            className="bg-zinc-800 text-zinc-100"
                            onPress={() => playBeepSequence(sample)}
                          >
                            play
                          </Button>
                          <Button
                            className="bg-red-500 text-white font-semibold"
                            onPress={() => {
                              setSelectedWrongSampleId(sample.id);
                              setStatusMessage(null);
                            }}
                          >
                            select this
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="border border-zinc-900/10 bg-zinc-950 text-white">
          <CardBody className="gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">mock attempts</p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold">
                  question attempt simulator
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={simulatorMode === "single" ? "solid" : "flat"}
                  className={simulatorMode === "single" ? "bg-fuchsia-500 text-white font-semibold" : "bg-zinc-800 text-zinc-100"}
                  onPress={() => setSimulatorMode("single")}
                >
                  single simulator
                </Button>
                <Button
                  variant={simulatorMode === "rapid" ? "solid" : "flat"}
                  className={simulatorMode === "rapid" ? "bg-fuchsia-500 text-white font-semibold" : "bg-zinc-800 text-zinc-100"}
                  onPress={() => setSimulatorMode("rapid")}
                >
                  rapid simulator
                </Button>
              </div>
            </div>

            {simulatorMode === "single" ? (
              <div className="space-y-4 rounded-2xl border border-zinc-700/70 bg-zinc-900/70 p-4">
                <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold">
                  {singleQuestion.prompt}
                </p>

                <div className="grid gap-2">
                  {singleQuestion.choices.map((choice, index) => {
                    const isSelected = singleSelectedChoice === index;
                    const isCorrect = index === singleQuestion.answerIndex;
                    let className =
                      "justify-start bg-zinc-800/80 text-zinc-100 font-[family-name:var(--font-manrope)] text-lg";
                    if (singleSelectedChoice !== null && isSelected && isCorrect) {
                      className =
                        "justify-start bg-emerald-400 text-black font-[family-name:var(--font-manrope)] text-lg";
                    } else if (singleSelectedChoice !== null && isSelected && !isCorrect) {
                      className = "justify-start bg-red-500 text-white font-[family-name:var(--font-manrope)] text-lg";
                    }
                    return (
                      <Button
                        key={`single-choice-${choice}`}
                        fullWidth
                        className={className}
                        onPress={() => handleSingleChoice(index)}
                        isDisabled={singleSelectedChoice !== null}
                      >
                        {choice}
                      </Button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button className="bg-fuchsia-500 text-white font-semibold" onPress={handleNewSingleAttempt}>
                    new mock attempt
                  </Button>
                  {singleSelectedChoice !== null && (
                    <Chip
                      variant="flat"
                      className={
                        singleSelectedChoice === singleQuestion.answerIndex
                          ? "border border-emerald-300/40 bg-emerald-500/20 text-emerald-100"
                          : "border border-red-300/40 bg-red-500/20 text-red-100"
                      }
                    >
                      {singleSelectedChoice === singleQuestion.answerIndex ? "correct tap" : "wrong tap"}
                    </Chip>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-zinc-700/70 bg-zinc-900/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip variant="flat" className="border border-zinc-600 bg-zinc-800 text-zinc-100">
                    attempt {Math.min(rapidAttemptIndex + 1, RAPID_TOTAL_ATTEMPTS)}/{RAPID_TOTAL_ATTEMPTS}
                  </Chip>
                  <Chip variant="flat" className="border border-emerald-300/40 bg-emerald-500/20 text-emerald-100">
                    correct: {rapidCorrectCount}
                  </Chip>
                  <Chip variant="flat" className="border border-red-300/40 bg-red-500/20 text-red-100">
                    wrong: {rapidWrongCount}
                  </Chip>
                </div>

                {!rapidFinished && rapidQuestion ? (
                  <>
                    <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold">
                      {rapidQuestion.prompt}
                    </p>
                    <div className="grid gap-2">
                      {rapidQuestion.choices.map((choice, index) => {
                        const isSelected = rapidLockedChoice === index;
                        const isCorrect = index === rapidQuestion.answerIndex;
                        let className =
                          "justify-start bg-zinc-800/80 text-zinc-100 font-[family-name:var(--font-manrope)] text-lg";
                        if (rapidLockedChoice !== null && isSelected && isCorrect) {
                          className =
                            "justify-start bg-emerald-400 text-black font-[family-name:var(--font-manrope)] text-lg";
                        } else if (rapidLockedChoice !== null && isSelected && !isCorrect) {
                          className = "justify-start bg-red-500 text-white font-[family-name:var(--font-manrope)] text-lg";
                        }
                        return (
                          <Button
                            key={`rapid-choice-${choice}`}
                            fullWidth
                            className={className}
                            onPress={() => handleRapidChoice(index)}
                            isDisabled={rapidLockedChoice !== null}
                          >
                            {choice}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                      rapid mode auto-advances after each tap.
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold">rapid run complete</p>
                    <p className="font-[family-name:var(--font-manrope)] text-lg text-zinc-200">
                      final: {rapidCorrectCount} correct, {rapidWrongCount} wrong
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button className="bg-fuchsia-500 text-white font-semibold" onPress={handleRestartRapid}>
                    restart rapid test
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rapidOutcomes.map((outcome, index) => (
                    <span
                      key={`rapid-outcome-${index}`}
                      className={`h-3.5 w-3.5 rounded-full border ${
                        outcome === "correct"
                          ? "border-emerald-200 bg-emerald-400"
                          : outcome === "wrong"
                            ? "border-red-200 bg-red-500"
                            : "border-zinc-500 bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
