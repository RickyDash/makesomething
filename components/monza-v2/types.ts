import type { ComponentPropsWithoutRef } from "react";

import type { Difficulty, FlowState } from "../../app/flow/types";
import type {
  RaceSim,
  RaceSimCarFrame,
  RaceSimFrame,
} from "../../app/race-sim/raceSim";

export type MonzaV2Mode = "giorno" | "notte";

export type MonzaRacePhase = "question" | "lap" | "result";

export type MonzaBannerTone = "good" | "bad" | "pit";

export type MonzaBanner = {
  text: string;
  sub?: string;
  tone: MonzaBannerTone;
};

export type MonzaClassificationEntry = {
  id: string;
  code: string;
  color: string;
  position: number;
  delta?: number;
  isPlayer?: boolean;
  status?: "running" | "dnf";
};

export type MonzaRaceCarFrame = RaceSimCarFrame;

export type MonzaRaceFrame = RaceSimFrame;

/**
 * Minimal presentation-facing race-sim surface.
 *
 * The skin only subscribes and writes frame values into SVG refs. Game commands,
 * timers, scoring, and position-order ownership stay in the shared controller.
 */
export type MonzaRaceSimLike = Pick<RaceSim, "getFrame" | "subscribe">;

export type MonzaV2SkinProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children"
> & {
  state: FlowState;
  mode: MonzaV2Mode;
  raceSim?: MonzaRaceSimLike;
  racePhase?: MonzaRacePhase;
  classification?: readonly MonzaClassificationEntry[];
  playerPosition?: number;
  lapStartPosition?: number;
  banner?: MonzaBanner | null;
  pitElapsedMs?: number | null;
  jumpStartCount?: number;
  warmupLocked?: boolean;
  launching?: boolean;
  onModeChange: (mode: MonzaV2Mode) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSwitchToV1: () => void;
  onStartFormation: () => void;
  onWarmupAnswer: (optionIndex: number) => void;
  onWarmupNext: () => void;
  onWarmupSkip: () => void;
  onStartLights: () => void;
  onLaunchTap: () => void;
  onRetryStart: () => void;
  onBeginRace: () => void;
  onRaceAnswer: (optionIndex: number) => void;
  onSkipLap: () => void;
  onPitBegin: () => void;
  onPitTyre: (tyreIndex: number) => void;
  onPitContinue: () => void;
  onRestart: () => void;
};
