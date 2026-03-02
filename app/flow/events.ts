import type { Question } from "../f1-question-bank";
import type { TrackTarget } from "./types";

export type FlowEvent =
  | { type: "NAVIGATE"; target: TrackTarget }
  | { type: "START_FORMATION_TUTORIAL" }
  | { type: "FORMATION_SKIP_TO_DRILL" }
  | { type: "TUTORIAL_PICK"; optionIndex: number }
  | { type: "TUTORIAL_NEXT" }
  | { type: "TUTORIAL_PREVIOUS" }
  | { type: "START_DRILL_INITIATE" }
  | { type: "START_DRILL_LAUNCH" }
  | { type: "START_DRILL_SET_LIGHTS"; lightsOnCount: number }
  | { type: "START_DRILL_GO" }
  | { type: "START_DRILL_EARLY" }
  | { type: "START_DRILL_COMPLETE"; timeMs: number }
  | { type: "START_DRILL_RETRY" }
  | { type: "START_DRILL_SKIP" }
  | { type: "RACE_PICK"; optionIndex: number }
  | { type: "RACE_NEXT" }
  | { type: "RACE_PREVIOUS" }
  | { type: "PIT_BEGIN" }
  | { type: "PIT_CLICK"; tireIndex: number }
  | { type: "PIT_ADVANCE" }
  | { type: "PIT_ADD_PENALTY"; amountMs: number }
  | { type: "PIT_COMPLETE"; timeMs: number }
  | { type: "PIT_RETRY" }
  | { type: "PIT_SKIP" }
  | { type: "START_FINISH_INTRO" }
  | { type: "FINISH_INTRO_DONE" }
  | { type: "GO_PREVIOUS_FROM_FINISH" }
  | { type: "RESTART_WEEKEND"; weekendQuestions: Question[] };
