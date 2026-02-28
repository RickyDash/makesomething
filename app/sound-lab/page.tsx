"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useMemo, useRef, useState } from "react";

type SoundSample = {
  id: string;
  name: string;
  description: string;
  waveform: OscillatorType;
  frequencies: number[];
  noteDurationMs: number;
  gapMs: number;
  volume: number;
};

const samples: SoundSample[] = [
  {
    id: "sample-a",
    name: "Sample A",
    description: "clean 2-note rise",
    waveform: "sine",
    frequencies: [460, 560],
    noteDurationMs: 55,
    gapMs: 16,
    volume: 0.13,
  },
  {
    id: "sample-b",
    name: "Sample B",
    description: "brighter launch chirp",
    waveform: "triangle",
    frequencies: [500, 620],
    noteDurationMs: 48,
    gapMs: 14,
    volume: 0.14,
  },
  {
    id: "sample-c",
    name: "Sample C",
    description: "soft short triple step",
    waveform: "sine",
    frequencies: [430, 500, 570],
    noteDurationMs: 34,
    gapMs: 10,
    volume: 0.12,
  },
  {
    id: "sample-d",
    name: "Sample D",
    description: "confident 2-note pulse",
    waveform: "square",
    frequencies: [410, 520],
    noteDurationMs: 42,
    gapMs: 12,
    volume: 0.1,
  },
  {
    id: "sample-e",
    name: "Sample E",
    description: "quick warm upchime",
    waveform: "triangle",
    frequencies: [470, 540, 610],
    noteDurationMs: 30,
    gapMs: 8,
    volume: 0.11,
  },
  {
    id: "sample-f",
    name: "Sample F",
    description: "subtle single cue",
    waveform: "sine",
    frequencies: [520],
    noteDurationMs: 62,
    gapMs: 0,
    volume: 0.12,
  },
  {
    id: "sample-g",
    name: "Sample G",
    description: "slightly sporty double tap",
    waveform: "triangle",
    frequencies: [540, 640],
    noteDurationMs: 38,
    gapMs: 10,
    volume: 0.13,
  },
  {
    id: "sample-h",
    name: "Sample H",
    description: "short punchy rise",
    waveform: "square",
    frequencies: [470, 560, 650],
    noteDurationMs: 28,
    gapMs: 8,
    volume: 0.09,
  },
  {
    id: "sample-i",
    name: "Sample I",
    description: "smooth upward swell",
    waveform: "sine",
    frequencies: [390, 480, 590],
    noteDurationMs: 45,
    gapMs: 12,
    volume: 0.12,
  },
  {
    id: "sample-j",
    name: "Sample J",
    description: "calm 2-note ready cue",
    waveform: "triangle",
    frequencies: [450, 520],
    noteDurationMs: 58,
    gapMs: 14,
    volume: 0.12,
  },
  {
    id: "sample-k",
    name: "Sample K",
    description: "tight triple ping",
    waveform: "sine",
    frequencies: [520, 560, 600],
    noteDurationMs: 22,
    gapMs: 7,
    volume: 0.1,
  },
  {
    id: "sample-l",
    name: "Sample L",
    description: "energetic 2-note launch",
    waveform: "triangle",
    frequencies: [560, 700],
    noteDurationMs: 40,
    gapMs: 12,
    volume: 0.14,
  },
];

export default function SoundLabPage() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0]?.id ?? "sample-a");

  const selectedSample = useMemo(
    () => samples.find((sample) => sample.id === selectedSampleId) ?? samples[0],
    [selectedSampleId],
  );

  const ensureAudioContext = () => {
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    void audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playSequence = (sample: SoundSample) => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const noteStepSeconds = (sample.noteDurationMs + sample.gapMs) / 1000;

    sample.frequencies.forEach((frequency, index) => {
      const startAt = now + index * noteStepSeconds;
      const stopAt = startAt + sample.noteDurationMs / 1000;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = sample.waveform;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(sample.volume, startAt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.start(startAt);
      oscillator.stop(stopAt + 0.015);
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fee2e2_0%,_#fff7ed_45%,_#f5f5f4_100%)] px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Card className="sticky top-3 z-10 border border-zinc-900/10 bg-zinc-950 text-white">
          <CardBody className="gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">sound lab</p>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
                  prep-action sound audition
                </h1>
              </div>
              <Chip variant="flat" className="border border-red-300/40 bg-red-500/20 text-red-100">
                current choice: {selectedSample.name}
              </Chip>
            </div>

            <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
              test any sample below, then tell me the sample name you want for both:{" "}
              <span className="font-semibold text-zinc-100">initiate starting-lights sequence</span> and{" "}
              <span className="font-semibold text-zinc-100">begin pit stop</span>.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                color="danger"
                className="font-semibold"
                onPress={() => selectedSample && playSequence(selectedSample)}
              >
                preview as initiate starting-lights sequence
              </Button>
              <Button
                color="warning"
                className="font-semibold"
                onPress={() => selectedSample && playSequence(selectedSample)}
              >
                preview as begin pit stop
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {samples.map((sample) => {
            const isSelected = sample.id === selectedSample?.id;
            return (
              <Card
                key={sample.id}
                className={`border ${isSelected ? "border-red-300/60 bg-zinc-950 text-white" : "border-zinc-700/60 bg-zinc-900/80 text-zinc-100"}`}
              >
                <CardBody className="gap-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">{sample.name}</p>
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
                      onPress={() => playSequence(sample)}
                    >
                      play
                    </Button>
                    <Button
                      color={isSelected ? "danger" : "default"}
                      className="font-semibold"
                      onPress={() => setSelectedSampleId(sample.id)}
                    >
                      select this
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
