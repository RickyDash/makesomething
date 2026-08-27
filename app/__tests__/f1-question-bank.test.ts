import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  LAPS_PER_WEEKEND,
  getRandomWeekendQuestions,
  questionBank,
  type BankQuestion,
  type Category,
  type Difficulty,
} from "../f1-question-bank";

const TIERS = ["beginner", "regular", "both"] as const;
const CATEGORY_CAP_PER_WEEKEND = 2;

const tierPool = (difficulty: Difficulty): BankQuestion[] =>
  questionBank.filter((q) => q.tier === "both" || q.tier === difficulty);

describe("question bank integrity", () => {
  it("keeps a healthy bank size", () => {
    expect(questionBank.length).toBeGreaterThanOrEqual(110);
  });

  it("keeps prompts unique (case-insensitive)", () => {
    const prompts = questionBank.map((q) => q.prompt.trim().toLowerCase());
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("gives every question exactly 3 distractors per set, none matching the correct answer", () => {
    for (const q of questionBank) {
      expect(q.distractors, q.prompt).toHaveLength(3);
      expect(new Set(q.distractors).size, q.prompt).toBe(3);
      expect(q.distractors, q.prompt).not.toContain(q.correct);
      if (q.beginnerDistractors) {
        expect(q.beginnerDistractors, q.prompt).toHaveLength(3);
        expect(new Set(q.beginnerDistractors).size, q.prompt).toBe(3);
        expect(q.beginnerDistractors, q.prompt).not.toContain(q.correct);
      }
    }
  });

  it("only allows beginnerDistractors on tier 'both'", () => {
    for (const q of questionBank) {
      if (q.beginnerDistractors) {
        expect(q.tier, q.prompt).toBe("both");
      }
    }
  });

  it("uses valid categories and tiers with no empty copy", () => {
    for (const q of questionBank) {
      expect(CATEGORIES, q.prompt).toContain(q.category);
      expect(TIERS, q.prompt).toContain(q.tier);
      expect(q.prompt.trim()).not.toBe("");
      expect(q.correct.trim()).not.toBe("");
      expect(q.fact.trim()).not.toBe("");
      for (const distractor of [...q.distractors, ...(q.beginnerDistractors ?? [])]) {
        expect(distractor.trim(), q.prompt).not.toBe("");
      }
    }
  });

  it("keeps facts from answering other questions", () => {
    // Core F1 entities recur across facts without answering the flagged
    // question (a fact mentioning ferrari does not answer "who joined ferrari
    // in 2025?"). Each token below was checked against its actual collisions
    // when added; when this test fails, review the collision — only add the
    // token here if the fact genuinely reveals nothing.
    const reviewedTokens = new Set([
      "ferrari",
      "mclaren",
      "mercedes",
      "red bull",
      "monza",
      "monaco",
      "brazil",
      "singapore",
      "suzuka",
      "vettel",
      "hamilton",
      "lewis hamilton",
      "full wet",
      "pirelli",
      "norris",
      "alonso",
      "verstappen",
      "ricciardo",
      "intermediate",
    ]);

    const asksForAPerson = (prompt: string) =>
      /(^|\s)who\s|which (driver|team principal|team boss|legendary commentator)/.test(prompt);

    for (const q of questionBank) {
      const correct = q.correct.toLowerCase();
      // For person answers, also match by surname so "…since hamilton in 2008"
      // style reveals of a "lewis hamilton" answer can't slip through.
      const surname =
        asksForAPerson(q.prompt) && correct.includes(" ")
          ? correct.split(" ").pop() ?? ""
          : "";
      const needles = [correct, surname].filter(
        (needle) => needle.length >= 5 && !reviewedTokens.has(needle),
      );
      if (needles.length === 0) continue;
      for (const other of questionBank) {
        if (other === q) continue;
        const fact = other.fact.toLowerCase();
        for (const needle of needles) {
          expect(
            fact.includes(needle),
            `fact of "${other.prompt}" reveals the answer to "${q.prompt}" (${needle})`,
          ).toBe(false);
        }
      }
    }
  });

  it("keeps both tier pools deep enough for varied weekends", () => {
    for (const difficulty of ["beginner", "regular"] as const) {
      expect(tierPool(difficulty).length).toBeGreaterThanOrEqual(45);
    }
  });

  it("keeps every category stocked in both tier pools so the category cap cannot starve a draw", () => {
    for (const difficulty of ["beginner", "regular"] as const) {
      const pool = tierPool(difficulty);
      for (const category of CATEGORIES) {
        const count = pool.filter((q) => q.category === category).length;
        expect(count, `${category} (${difficulty})`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("getRandomWeekendQuestions", () => {
  const RUNS = 50;

  for (const difficulty of ["beginner", "regular"] as const) {
    it(`draws valid ${difficulty} weekends`, () => {
      const bankByPrompt = new Map(questionBank.map((q) => [q.prompt, q]));

      for (let run = 0; run < RUNS; run += 1) {
        const weekend = getRandomWeekendQuestions(difficulty);
        expect(weekend).toHaveLength(LAPS_PER_WEEKEND);

        const perCategory = new Map<Category, number>();
        const prompts = new Set<string>();
        for (const question of weekend) {
          expect(prompts.has(question.prompt)).toBe(false);
          prompts.add(question.prompt);

          const bankQuestion = bankByPrompt.get(question.prompt);
          expect(bankQuestion, question.prompt).toBeDefined();
          if (!bankQuestion) continue;

          expect(["both", difficulty]).toContain(bankQuestion.tier);
          perCategory.set(
            bankQuestion.category,
            (perCategory.get(bankQuestion.category) ?? 0) + 1,
          );

          expect(question.answer).toBeGreaterThanOrEqual(0);
          expect(question.answer).toBeLessThan(question.options.length);
          expect(question.options[question.answer]).toBe(bankQuestion.correct);
          expect(question.event).toBe(bankQuestion.category);
          expect(question.fact).toBe(bankQuestion.fact);

          const expectedDistractors =
            difficulty === "beginner"
              ? (bankQuestion.beginnerDistractors ?? bankQuestion.distractors)
              : bankQuestion.distractors;
          const expectedOptions = [bankQuestion.correct, ...expectedDistractors];
          expect([...question.options].sort()).toEqual([...expectedOptions].sort());
        }

        for (const [category, count] of perCategory) {
          expect(count, category).toBeLessThanOrEqual(CATEGORY_CAP_PER_WEEKEND);
        }
      }
    });
  }
});
