import { describe, expect, it } from "vitest";

import { formationWarmups, formationWarmupsV1 } from "../formation-warmups";

describe("formation warmups", () => {
  it("keeps exactly 3 steps (V2 overlay regions and V1 track markers assume 3)", () => {
    expect(formationWarmups).toHaveLength(3);
  });

  it("gives every step 3 options and an answer index in range", () => {
    for (const step of formationWarmups) {
      expect(step.options).toHaveLength(3);
      expect(step.answer).toBeGreaterThanOrEqual(0);
      expect(step.answer).toBeLessThan(step.options.length);
    }
  });

  it("has non-empty copy in every field", () => {
    for (const step of formationWarmups) {
      expect(step.lesson.trim()).not.toBe("");
      expect(step.prompt.trim()).not.toBe("");
      expect(step.note.trim()).not.toBe("");
      expect(step.noteWrong.trim()).not.toBe("");
      for (const option of step.options) {
        expect(option.trim()).not.toBe("");
      }
    }
  });

  it("keeps each comprehension check answerable from its own lesson", () => {
    // The correct option should never be a guess: the lesson must state the rule
    // the answer restates. Spot-check the load-bearing keywords per step.
    expect(formationWarmups[0].lesson).toMatch(/locks in/i);
    expect(formationWarmups[0].options[formationWarmups[0].answer]).toMatch(/locks/i);
    expect(formationWarmups[1].lesson).toMatch(/6 questions, 6 laps/i);
    expect(formationWarmups[1].options[formationWarmups[1].answer]).toMatch(/6 laps/i);
    expect(formationWarmups[2].lesson).toMatch(/tap the 4 tyres/i);
    expect(formationWarmups[2].options[formationWarmups[2].answer]).toMatch(/4 tyres/i);
  });

  it("keeps the V1 lowercase variant in lockstep with the canonical set", () => {
    expect(formationWarmupsV1).toHaveLength(formationWarmups.length);
    formationWarmupsV1.forEach((step, index) => {
      const canonical = formationWarmups[index];
      expect(step.answer).toBe(canonical.answer);
      expect(step.options).toHaveLength(canonical.options.length);
      expect(step.lesson).toBe(canonical.lesson.toLowerCase());
      expect(step.prompt).toBe(canonical.prompt.toLowerCase());
      expect(step.note).toBe(canonical.note.toLowerCase());
      expect(step.noteWrong).toBe(canonical.noteWrong.toLowerCase());
      step.options.forEach((option, optionIndex) => {
        expect(option).toBe(canonical.options[optionIndex].toLowerCase());
      });
    });
  });
});
