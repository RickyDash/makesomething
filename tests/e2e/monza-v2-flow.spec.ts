import { expect, test } from "@playwright/test";

import {
  answerCurrentLap,
  completeLaunchWithJumpRetry,
  completePitWithWrongCorner,
  switchToV1,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

test.describe("Monza V2 shared race flow", () => {
  test.setTimeout(100_000);

  test("completes a mixed-result weekend, wrong pit corner, ledger, and report", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: /switch to regular difficulty/i })
      .click();
    await expect(v2Root(page)).toHaveAttribute("data-difficulty", "regular");
    const reactionMs = await completeLaunchWithJumpRetry(page, "warmups");
    let pitTime = "";

    for (let lap = 0; lap < 6; lap += 1) {
      const expectedResult = lap % 2 === 0 ? "correct" : "wrong";
      await answerCurrentLap(page, expectedResult);

      if (lap === 2) {
        pitTime = await completePitWithWrongCorner(page);
      } else if (lap < 5) {
        await expect(v2Root(page)).toHaveAttribute("data-stage", "race", {
          timeout: 5_000,
        });
        await expect(
          v2Root(page).getByText(`Q ${lap + 2} / 6`, { exact: true }),
        ).toBeVisible();
      }
    }

    const report = page.getByRole("region", { name: "Classified — P8" });
    await expect(
      report.getByRole("heading", { name: "Classified — P8" }),
    ).toBeVisible({ timeout: 8_000 });
    await expect(report.getByText("3 of 6 correct", { exact: false })).toBeVisible();
    await expect(report.getByText(/pit \+300ms penalty/i)).toBeVisible();
    await expect(report.getByText(`${reactionMs}ms`, { exact: true })).toBeVisible();
    await expect(report.getByText(pitTime, { exact: true })).toBeVisible();
    await expect(
      report.getByRole("img", { name: "Pit wall debrief, classified position 8" }),
    ).toBeVisible();

    const chart = page.getByText("LAP CHART — SIX LAPS, SIX CALLS").locator("..");
    await expect(chart.getByText("✓")).toHaveCount(3);
    await expect(chart.getByText("✕")).toHaveCount(3);
    await page.getByRole("button", { name: "RUN ANOTHER GRAND PRIX" }).click();

    await expect(v2Root(page)).toHaveAttribute("data-stage", "formation");
    await expect(v2Root(page)).toHaveAttribute("data-difficulty", "regular");
    await expect(
      page.getByRole("button", { name: "START FORMATION LAP" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /switch to beginner difficulty/i }),
    ).toBeVisible();
    await expect(
      page.getByText("THE FULL PADDOCK QUIZ — STILL 6 LAPS", { exact: true }),
    ).toBeVisible();

    await switchToV1(page);
    const beginnerDifficulty = page.getByRole("button", {
      name: "beginner",
      exact: true,
    });
    const regularDifficulty = page.getByRole("button", {
      name: "regular",
      exact: true,
    });
    await expect(beginnerDifficulty).toBeVisible();
    await expect(beginnerDifficulty).toHaveAttribute("aria-pressed", "false");
    await expect(regularDifficulty).toBeVisible();
    await expect(regularDifficulty).toHaveAttribute("aria-pressed", "true");
  });

  test("mid-race and mid-pit skin swaps preserve progress and elapsed stop time", async ({
    page,
  }) => {
    await page.goto("/");
    await completeLaunchWithJumpRetry(page);

    await expect(v2Root(page).getByText("Q 1 / 6", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("listitem", { name: "YOU, position 10" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    await page.getByRole("button", { name: /switch to giorno light mode/i }).click();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "giorno");
    await expect(v2Root(page).getByText("Q 1 / 6", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("listitem", { name: "YOU, position 10" }),
    ).toBeVisible();

    await answerCurrentLap(page, "correct");
    await switchToV1(page);
    await expect(
      page.getByText("grand prix live · lap 2/6", { exact: true }),
    ).toBeVisible({ timeout: 5_000 });
    await switchToV2(page);
    await expect(v2Root(page).getByText("Q 2 / 6", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("listitem", { name: "YOU, position 8" }),
    ).toBeVisible();

    await answerCurrentLap(page, "wrong");
    await expect(v2Root(page).getByText("Q 3 / 6", { exact: true })).toBeVisible({
      timeout: 5_000,
    });
    await answerCurrentLap(page, "correct");
    const pit = page.getByRole("region", { name: "Pit stop challenge" });
    await expect(pit).toBeVisible({ timeout: 5_000 });
    await pit.getByRole("button", { name: /begin the stop/i }).click();
    await pit.getByRole("button", { name: /^front left/i }).click();

    const before = Number.parseFloat(
      (await pit.locator('[class*="pitClock"]').innerText()).replace("s", ""),
    );
    await switchToV1(page);
    await page.waitForTimeout(450);
    await switchToV2(page);

    const restoredPit = page.getByRole("region", { name: "Pit stop challenge" });
    await expect(restoredPit.getByRole("button", { name: /^front right/i })).toBeVisible();
    const after = Number.parseFloat(
      (await restoredPit.locator('[class*="pitClock"]').innerText()).replace("s", ""),
    );
    expect(after).toBeGreaterThan(before);

    for (const tyre of ["front right", "rear left", "rear right"]) {
      await restoredPit
        .getByRole("button", { name: new RegExp(`^${tyre}`, "i") })
        .click();
    }
    await expect(v2Root(page).getByText("Q 4 / 6", { exact: true })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("V1 marker jumps remain coherent when reflected in V2", async ({ page }) => {
    await page.goto("/");
    await switchToV1(page);

    await page.getByRole("button", { name: "Go to lap 4" }).click();
    await expect(
      page.getByText("grand prix live · lap 4/6", { exact: true }),
    ).toBeVisible();
    await switchToV2(page);
    await expect(v2Root(page).getByText("Q 4 / 6", { exact: true })).toBeVisible();

    await switchToV1(page);
    await page.getByRole("button", { name: "Go to final race report" }).click();
    await switchToV2(page);
    await expect(page.getByRole("heading", { name: "DNF — Retired" })).toBeVisible();
    await expect(page.getByText(/0 of 6 correct/i)).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Did not finish, car pushed to the garage" }),
    ).toBeVisible();
  });

  test("reload during a race preserves skin and mode but begins a fresh weekend", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
    await completeLaunchWithJumpRetry(page);
    await answerCurrentLap(page, "correct");

    await page.reload();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    await expect(v2Root(page)).toHaveAttribute("data-stage", "formation");
    await expect(page.getByRole("button", { name: "START FORMATION LAP" })).toBeVisible();
  });

  test("completes a full notte weekend through the chequered flag", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
    await completeLaunchWithJumpRetry(page);

    for (let lap = 0; lap < 6; lap += 1) {
      await answerCurrentLap(page, "correct", { skipPlayback: true });
      if (lap === 2) {
        await completePitWithWrongCorner(page);
      } else if (lap < 5) {
        await expect(
          v2Root(page).getByText(`Q ${lap + 2} / 6`, { exact: true }),
        ).toBeVisible({ timeout: 5_000 });
      }
    }

    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    await expect(page.getByRole("heading", { name: "Race Winner" })).toBeVisible({
      timeout: 8_000,
    });
    await expect(page.getByText(/6 of 6 correct/i)).toBeVisible();
    await expect(page.getByText("P1", { exact: true }).last()).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: "Top step, trophy lift, flares, and confetti",
      }),
    ).toBeVisible();

    await page.reload();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    await expect(v2Root(page)).toHaveAttribute("data-stage", "formation");
  });
});
