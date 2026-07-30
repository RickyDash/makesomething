import { expect, test, type Page } from "@playwright/test";

import {
  correctAnswerByPrompt,
  setPreference,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const answerV1LapCorrectly = async (page: Page) => {
  const raceCard = page.locator('main[data-skin="v1"]').getByText(/lap \d\/6/i).last().locator("..").locator("..");
  const prompt = normalize(await raceCard.getByRole("heading").innerText());
  const answer = correctAnswerByPrompt.get(prompt);
  if (!answer) throw new Error(`No answer found for V1 prompt: ${prompt}`);
  await raceCard.getByRole("button", { name: new RegExp(`^${answer}$`, "i") }).click();
  await expect(raceCard.getByText(/^Correct:/)).toBeVisible();
};

test("V1 completes its unchanged flow and shares best records with V2", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await setPreference(page, "v1", "giorno");
  await page.addInitScript(() => {
    window.localStorage.setItem("f1-best-reaction-ms", "222");
    window.localStorage.setItem("f1-best-score", "4");
  });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "ricky's f1 quiz grand prix" }),
  ).toBeVisible();
  await expect(page.getByText("formation lap (practice)").first()).toBeVisible();
  await page
    .getByRole("button", { name: /start formation lap \(practice\)/i })
    .click();

  for (const answer of [
    "it locks immediately as final",
    "one race lap",
    "timed pit stop challenge",
  ]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    const next = page.getByRole("button", {
      name: /next weave|line up on the grid/i,
    });
    await next.click();
  }

  await page.getByRole("button", { name: /^skip/i }).click();
  await expect(
    page.getByText("grand prix live · lap 1/6", { exact: true }),
  ).toBeVisible();

  for (let lap = 0; lap < 6; lap += 1) {
    await answerV1LapCorrectly(page);
    await page
      .getByRole("button", {
        name: /next lap|box, box|chequered flag/i,
      })
      .click();

    if (lap === 2) {
      await expect(page.getByText("tyre change sprint")).toBeVisible();
      await page.getByRole("button", { name: /begin pit stop/i }).click();
      for (const tyre of ["front left", "front right", "rear left", "rear right"]) {
        await page.getByRole("button", { name: tyre, exact: true }).click();
      }
      await page.getByRole("button", { name: /rejoin the track/i }).click();
    }
  }

  await expect(page.getByText("race report", { exact: true })).toBeVisible({
    timeout: 6_000,
  });
  await expect(page.getByText(/best score/i)).toBeVisible();
  await expect(page.getByText("6/6", { exact: true }).first()).toBeVisible();

  await switchToV2(page);
  await expect(v2Root(page)).toHaveAttribute("data-stage", "finished");
  await expect(page.getByText(/6 of 6 correct/i)).toBeVisible();
  await expect(page.getByText(/best reaction 0\.222s/i)).toBeVisible();
});
