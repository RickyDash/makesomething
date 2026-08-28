import type { Difficulty, Question } from "../f1-question-bank";

export type { Difficulty } from "../f1-question-bank";

export type Stage = "formation" | "race" | "pitstop" | "finish_intro" | "finished";
export type FormationMode = "intro" | "briefing" | "drill";
export type UiVersion = "v1" | "v2";
export type V2Mode = "giorno" | "notte";
export type RaceCurve = "defend" | "snatch";

export type RaceGridPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type RacePosition = RaceGridPosition | "DNF";
export type RaceLapResult = "correct" | "wrong" | null;
export type RaceVerdict = Exclude<RaceLapResult, null>;
export type RaceBannerTone = "good" | "bad" | "pit";
export type RacePresentationPhase = "question" | "lap" | "result" | "pit" | "dnf" | "finish";

export type RaceLedgerEntry = {
  lapIndex: number;
  result: RaceLapResult;
  before: RaceGridPosition;
  after: RaceGridPosition;
  delta: number;
};

export type RaceBanner = {
  text: string;
  sub: string;
  tone: RaceBannerTone;
};

export type RacePresentationState = {
  phase: RacePresentationPhase;
  verdict: RaceVerdict | null;
  banner: RaceBanner | null;
};

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
  uiVersion: UiVersion;
  v2Mode: V2Mode;
  difficulty: Difficulty;
  tutorialStep: number;
  tutorialAnswers: (number | null)[];
  weekendQuestions: Question[];
  currentLap: number;
  lapAnswers: (number | null)[];
  raceCurve: RaceCurve;
  raceLedger: RaceLedgerEntry[];
  currentPosition: RaceGridPosition;
  finalPosition: RacePosition | null;
  racePresentation: RacePresentationState;
  startDrill: StartDrillState;
  pitStop: PitStopState;
  bestReactionMs: number | null;
  bestScore: number;
};

export const PIT_DEFAULT_MESSAGE = "pit window open. hit begin when you're ready.";
export const PIT_RUNNING_MESSAGE = "go go go. lock the tyres in order.";
