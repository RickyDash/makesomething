import { expect, test } from "@playwright/test";

import {
  answerV1LapCorrectly,
  setPreference,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

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
    "no — it locks the moment you tap",
    "6 laps — one lap per question",
    "tap the 4 tyres in order, against the clock",
  ]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    const next = page.getByRole("button", {
      name: /next warm-up|line up on the grid/i,
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
