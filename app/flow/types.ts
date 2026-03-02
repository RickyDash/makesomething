import type { Question } from "../f1-question-bank";

export type Stage = "formation" | "race" | "pitstop" | "finish_intro" | "finished";
export type FormationMode = "intro" | "briefing" | "drill";

export type TrackTarget =
  | { kind: "formation_intro" }
  | { kind: "formation_drill" }
  | { kind: "pitstop" }
  | { kind: "finish" }
  | { kind: "tutorial"; stepIndex: number }
  | { kind: "lap"; lapIndex: number };

export type StartDrillPhase = "idle" | "countdown" | "go" | "early";
export type PitStopPhase = "idle" | "running";

export type ChallengeState<Phase extends string> = {
  resultMs: number | null;
  attemptStarted: boolean;
  needsAttention: boolean;
  phase: Phase;
};

export type StartDrillState = ChallengeState<StartDrillPhase> & {
  lightsOnCount: number;
};

export type PitStopState = ChallengeState<PitStopPhase> & {
  step: number;
  penaltyMs: number;
  message: string;
};

export type FlowState = {
  stage: Stage;
  formationMode: FormationMode;
  tutorialStep: number;
  tutorialAnswers: (number | null)[];
  weekendQuestions: Question[];
  currentLap: number;
  lapAnswers: (number | null)[];
  startDrill: StartDrillState;
  pitStop: PitStopState;
  bestReactionMs: number | null;
  bestScore: number;
};

export const PIT_DEFAULT_MESSAGE = "pit window open. hit begin when you're ready.";
export const PIT_RUNNING_MESSAGE = "go go go. lock the tires in order.";
