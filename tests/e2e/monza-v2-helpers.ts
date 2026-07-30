import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, type Page } from "@playwright/test";

type BankQuestion = {
  prompt: string;
  options: string[];
  answer: number;
};

const questionBankSource = readFileSync(
  resolve(process.cwd(), "app/f1-question-bank.ts"),
  "utf8",
);
const questionBankStart = questionBankSource.indexOf(
  "const questionBank: Question[] = ",
);
const questionBankArrayStart =
  questionBankSource.indexOf("= [", questionBankStart) + 2;
const questionBankArrayEnd = questionBankSource.indexOf(
  "\n];",
  questionBankArrayStart,
);
const questionBank = JSON.parse(
  questionBankSource.slice(questionBankArrayStart, questionBankArrayEnd + 2),
) as BankQuestion[];

const canonicalPrompt = (value: string) => value.trim().toLocaleLowerCase();

export const correctAnswerByPrompt = new Map(
  questionBank.map((question) => [
    canonicalPrompt(question.prompt),
    question.options[question.answer],
  ]),
);

export const setPreference = async (
  page: Page,
  uiVersion: "v1" | "v2",
  v2Mode: "giorno" | "notte" = "giorno",
) => {
  await page.addInitScript(
    ({ version, mode }) => {
      window.localStorage.setItem(
        "f1-ui-preferences:v1",
        JSON.stringify({ uiVersion: version, v2Mode: mode }),
      );
    },
    { version: uiVersion, mode: v2Mode },
  );
};

export const v2Root = (page: Page) =>
  page.getByRole("region", { name: "Monza Formula 1 quiz grand prix" });

export const switchToV1 = async (page: Page) => {
  await page
    .locator('button[aria-label="Switch to the original V1 skin"]')
    .click();
  await expect(page.locator('main[data-skin="v1"]')).toBeVisible();
};

export const switchToV2 = async (page: Page) => {
  await page
    .getByRole("button", { name: "Switch to the Monza V2 design" })
    .click();
  await expect(v2Root(page)).toBeVisible();
};

export const skipFormationWarmup = async (page: Page) => {
  await page.getByRole("button", { name: "START FORMATION LAP" }).click();
  await expect(
    page.getByRole("region", { name: "Formation warmup 1 of 3" }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Formation warmup 1 of 3" })
    .getByRole("button", { name: "SKIP »", exact: true })
    .click();
  await expect(
    page.locator('button[aria-label="Launch — tap at lights out"]'),
  ).toBeVisible({ timeout: 12_000 });
};

export const completeFormationWarmups = async (page: Page) => {
  await page.getByRole("button", { name: "START FORMATION LAP" }).click();

  const warmups = [
    {
      region: "Formation warmup 1 of 3",
      answer: "I can change it before the lap",
      verdict: "NOT QUITE",
      next: "NEXT →",
    },
    {
      region: "Formation warmup 2 of 3",
      answer: "One lap of the race",
      verdict: "RIGHT CALL",
      next: "NEXT →",
    },
    {
      region: "Formation warmup 3 of 3",
      answer: "A timed pit stop you perform",
      verdict: "RIGHT CALL",
      next: "TO THE GRID →",
    },
  ] as const;

  for (const warmup of warmups) {
    const region = page.getByRole("region", { name: warmup.region });
    await expect(region).toBeVisible();
    await region.getByRole("button", { name: warmup.answer, exact: true }).click();
    await expect(region.getByText(warmup.verdict, { exact: true })).toBeVisible();
    await region.getByRole("button", { name: warmup.next, exact: true }).click();
  }

  await expect(
    page.locator('button[aria-label="Launch — tap at lights out"]'),
  ).toBeVisible({ timeout: 12_000 });
};

export const completeLaunchWithJumpRetry = async (
  page: Page,
  formation: "skip" | "warmups" = "skip",
) => {
  if (formation === "warmups") await completeFormationWarmups(page);
  else await skipFormationWarmup(page);

  await page
    .locator('button[aria-label="Launch — tap at lights out"]')
    .click({ position: { x: 20, y: 20 } });
  await expect(page.getByRole("heading", { name: "Jump start" })).toBeVisible();
  await expect(page.getByText(/lights were still on/i)).toBeVisible();

  await page.getByRole("button", { name: "RETRY THE START" }).click();
  await expect(page.getByText(/go go go — tap now/i)).toBeVisible({
    timeout: 8_000,
  });
  await page
    .locator('button[aria-label="Launch — tap at lights out"]')
    .click({ position: { x: 20, y: 20 } });

  await expect(page.getByText(/1 jump start/i)).toBeVisible();
  const reactionMs = Math.round(
    Number.parseFloat(
      await page.locator('[class*="reactionTime"]').innerText(),
    ) * 1_000,
  );
  await page.getByRole("button", { name: /away we go/i }).click();
  await expect(v2Root(page)).toHaveAttribute("data-stage", "race", {
    timeout: 5_000,
  });
  return reactionMs;
};

const currentQuiz = (page: Page) =>
  v2Root(page).locator('[class*="quizPanel"]').filter({ visible: true });

export const answerCurrentLap = async (
  page: Page,
  result: "correct" | "wrong",
  options: { skipPlayback?: boolean } = {},
) => {
  const quiz = currentQuiz(page);
  await expect(quiz).toBeVisible();
  const prompt = canonicalPrompt(await quiz.getByRole("heading").innerText());
  const correctAnswer = correctAnswerByPrompt.get(prompt);
  if (!correctAnswer) {
    throw new Error(`No canonical answer found for visible prompt: ${prompt}`);
  }

  const optionButtons = quiz.getByRole("button");
  const optionCount = await optionButtons.count();
  const labels = await optionButtons.allInnerTexts();
  const targetIndex =
    result === "correct"
      ? labels.findIndex(
          (label) => canonicalPrompt(label) === canonicalPrompt(correctAnswer),
        )
      : labels.findIndex(
          (label) => canonicalPrompt(label) !== canonicalPrompt(correctAnswer),
        );

  if (targetIndex < 0 || targetIndex >= optionCount) {
    throw new Error(
      `Could not choose a ${result} answer for "${prompt}". Options: ${labels.join(", ")}`,
    );
  }

  await optionButtons.nth(targetIndex).click();
  await expect(quiz.locator('[class*="radioCard"] strong')).toContainText(
    "TEAM RADIO",
  );
  if (options.skipPlayback) {
    await v2Root(page)
      .getByRole("button", { name: "SKIP »", exact: true })
      .click();
  }
  await expect(
    quiz.getByText(result === "correct" ? "CORRECT" : "INCORRECT", {
      exact: true,
    }),
  ).toBeVisible({ timeout: 7_000 });
};

export const completePitWithWrongCorner = async (page: Page) => {
  const pit = page.getByRole("region", { name: "Pit stop challenge" });
  await expect(pit).toBeVisible({ timeout: 5_000 });
  await pit.getByRole("button", { name: /begin the stop/i }).click();
  await pit.getByRole("button", { name: /^rear right/i }).click();
  await expect(pit.getByText(/wrong corner — \+300ms/i)).toBeVisible();

  for (const tyre of ["front left", "front right", "rear left", "rear right"]) {
    await pit.getByRole("button", { name: new RegExp(`^${tyre}`, "i") }).click();
  }

  await expect(pit.getByText(/stationary time/i)).toBeVisible();
  const pitTime = await pit.locator('[class*="pitResult"]').innerText();
  await expect(v2Root(page)).toHaveAttribute("data-stage", "race", {
    timeout: 5_000,
  });
  return pitTime;
};
