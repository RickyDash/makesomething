import { describe, expect, it } from "vitest";

import { questionBank } from "../f1-question-bank";

// The bank is display-cased (V2 renders it verbatim; V1 lowercases at
// render). These checks stop a new lowercase entry from reintroducing
// "Nico rosberg" / "in f1" on the Monza skin (design-qa-ios.md IOS-23).
const bank = questionBank;

const lowercaseProperNouns = [
  "monza",
  "monaco",
  "silverstone",
  "ferrari",
  "mercedes",
  "mclaren",
  "verstappen",
  "hamilton",
  "leclerc",
  "alonso",
  "vettel",
  "schumacher",
  "senna",
  "italy",
  "italian",
  "british",
  "f1",
  "drs",
  "fia",
  "vsc",
];

// Sentence start: skip opening quotes/brackets; a leading digit ("2014
// introduced…") is a valid start and the following word stays lowercase.
const startsAsASentence = (value: string) => {
  const trimmed = value.replace(/^["'‘“(\[]+/, "");
  const first = trimmed.charAt(0);
  if (/[0-9]/.test(first)) return true;
  return /[A-Z]/.test(first);
};

describe("question bank casing", () => {
  it("iterates the whole bank", () => {
    expect(bank.length).toBeGreaterThan(100);
  });

  it("starts every prompt, option and fact with a capital", () => {
    for (const question of bank) {
      expect(startsAsASentence(question.prompt), question.prompt).toBe(true);
      expect(startsAsASentence(question.fact), question.fact).toBe(true);
      for (const option of [
        question.correct,
        ...question.distractors,
        ...(question.beginnerDistractors ?? []),
      ]) {
        expect(startsAsASentence(option), option).toBe(true);
      }
    }
  });

  it("never leaves a known proper noun or acronym in lowercase", () => {
    const offenders: string[] = [];
    for (const question of bank) {
      for (const text of [
        question.prompt,
        question.fact,
        question.correct,
        ...question.distractors,
        ...(question.beginnerDistractors ?? []),
      ]) {
        for (const noun of lowercaseProperNouns) {
          const pattern = new RegExp(`(?<![A-Za-z])${noun}(?![A-Za-z])`);
          if (pattern.test(text)) offenders.push(`${noun}: ${text}`);
        }
      }
    }
    // "grand prix" is deliberately not in the list: it is lowercase when
    // generic ("a full grand prix race distance") and capitalised in names.
    expect(offenders).toEqual([]);
  });
});
