import type { UiVersion } from "./types";

export const SEQUENCE_TIMINGS = {
  v1: {
    lightStepMs: 700,
    lightCount: 5,
    lightsOutHoldMinMs: 900,
    lightsOutHoldRangeMs: 900,
    finishMs: 2600,
  },
  v2: {
    formationLockMs: 470,
    lightStepMs: 340,
    lightCount: 5,
    lightsOutHoldMinMs: 900,
    lightsOutHoldRangeMs: 800,
    launchMs: 1500,
    lapMs: 4400,
    verdictMs: 2100,
    dnfMs: 2800,
    finishMs: 450,
    pitMinimumArrivalMs: 1200,
    pitReleaseMs: 1350,
  },
} as const;

export type ReactionTimeline = Readonly<{
  lightAtMs: readonly number[];
  goAtMs: number;
}>;

export const createReactionTimeline = (
  profile: UiVersion,
  randomValue = Math.random(),
): ReactionTimeline => {
  const timing = SEQUENCE_TIMINGS[profile];
  const boundedRandom = Math.max(0, Math.min(1, randomValue));
  const lightAtMs = Array.from(
    { length: timing.lightCount },
    (_, index) => (index + 1) * timing.lightStepMs,
  );

  return Object.freeze({
    lightAtMs: Object.freeze(lightAtMs),
    goAtMs:
      timing.lightCount * timing.lightStepMs +
      timing.lightsOutHoldMinMs +
      boundedRandom * timing.lightsOutHoldRangeMs,
  });
};

export type TimerScheduler = (
  callback: () => void,
  delayMs: number,
) => number;

export const scheduleReactionTimeline = (
  timeline: ReactionTimeline,
  schedule: TimerScheduler,
  callbacks: Readonly<{
    onLight: (lightsOnCount: number) => void;
    onGo: () => void;
  }>,
): number[] => {
  const timers = timeline.lightAtMs.map((delayMs, index) =>
    schedule(() => callbacks.onLight(index + 1), delayMs),
  );
  timers.push(schedule(callbacks.onGo, timeline.goAtMs));
  return timers;
};

export const scheduleV2LapTimeline = (
  schedule: TimerScheduler,
  callbacks: Readonly<{
    onReveal: () => void;
    onAdvance: () => void;
  }>,
): number[] => [
  schedule(callbacks.onReveal, SEQUENCE_TIMINGS.v2.lapMs),
  schedule(
    callbacks.onAdvance,
    SEQUENCE_TIMINGS.v2.lapMs + SEQUENCE_TIMINGS.v2.verdictMs,
  ),
];

export const getPitRejoinDelayMs = (rawElapsedMs: number) =>
  Math.max(
    SEQUENCE_TIMINGS.v2.pitReleaseMs,
    SEQUENCE_TIMINGS.v2.pitMinimumArrivalMs +
      SEQUENCE_TIMINGS.v2.pitReleaseMs -
      Math.max(0, rawElapsedMs),
  );
