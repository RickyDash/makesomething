import { describe, expect, it } from "vitest";

import type { Question } from "../../f1-question-bank";
import { assertFlowInvariants } from "../invariants";
import { createInitialFlowState, flowReducer } from "../reducer";
import type { FlowState, RaceGridPosition } from "../types";

const questions: Question[] = Array.from({ length: 6 }, (_, index) => ({
  prompt: `question ${index + 1}`,
  options: ["a", "b", "c"],
  answer: index % 3,
  fact: `fact ${index + 1}`,
  event: `event ${index + 1}`,
}));

const makeState = () =>
  createInitialFlowState({
    weekendQuestions: questions,
    tutorialStepCount: 3,
    bestReactionMs: null,
    bestScore: 0,
    raceCurve: "defend",
  });

describe("flow invariants", () => {
  it("accepts a valid six-lap ledger and finish classification", () => {
    let state = makeState();
    for (let lapIndex = 0; lapIndex < questions.length; lapIndex += 1) {
      state = flowReducer(state, {
        type: "NAVIGATE",
        target: { kind: "lap", lapIndex },
      });
      state = flowReducer(state, {
        type: "RACE_PICK",
        optionIndex: questions[lapIndex].answer,
      });
    }
    state = flowReducer(state, { type: "START_FINISH_INTRO" });

    expect(() => assertFlowInvariants(state)).not.toThrow();
    expect(state.finalPosition).toBe(1);
  });

  it("rejects an unknown difficulty value", () => {
    const state = makeState();
    const invalid = {
      ...state,
      difficulty: "expert",
    } as unknown as FlowState;

    expect(() => assertFlowInvariants(invalid)).toThrow(
      "difficulty must be beginner or regular",
    );
  });

  it("rejects a ledger position outside P1-P10", () => {
    const state = makeState();
    const invalid: FlowState = {
      ...state,
      raceLedger: state.raceLedger.map((entry, index) =>
        index === 0
          ? { ...entry, after: 11 as RaceGridPosition, delta: -1 }
          : entry,
      ),
    };

    expect(() => assertFlowInvariants(invalid)).toThrow(
      "race ledger positions must stay between P1 and P10",
    );
  });

  it("rejects discontinuous or formula-divergent ledger entries", () => {
    const state = flowReducer(
      flowReducer(makeState(), {
        type: "NAVIGATE",
        target: { kind: "lap", lapIndex: 0 },
      }),
      { type: "RACE_PICK", optionIndex: questions[0].answer },
    );
    const invalid: FlowState = {
      ...state,
      raceLedger: state.raceLedger.map((entry, index) =>
        index === 1 ? { ...entry, before: 10, after: 10 } : entry,
      ),
    };

    expect(() => assertFlowInvariants(invalid)).toThrow(
      "race ledger entries must form one continuous position history",
    );
  });

  it("rejects DNF when the race has a correct answer", () => {
    const answered = flowReducer(
      flowReducer(makeState(), {
        type: "NAVIGATE",
        target: { kind: "lap", lapIndex: 0 },
      }),
      { type: "RACE_PICK", optionIndex: questions[0].answer },
    );
    const invalid: FlowState = {
      ...answered,
      stage: "finished",
      finalPosition: "DNF",
      racePresentation: { phase: "finish", verdict: null, banner: null },
    };

    expect(() => assertFlowInvariants(invalid)).toThrow(
      "finish stages must expose the ledger-derived final position",
    );
  });
});
