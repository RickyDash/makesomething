import { expect, test } from "@playwright/test";

import {
  answerV1LapCorrectly,
  completeLaunchWithJumpRetry,
  setPreference,
  skipFormationWarmup,
  switchToV1,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

test.describe("Monza V2 preferences and hidden corner marks", () => {
  test("clean storage defaults to V2 giorno and persists notte across reload and V1", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(v2Root(page)).toBeVisible();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "giorno");
    await expect
      .poll(() =>
        page.evaluate(() =>
          JSON.parse(
            window.localStorage.getItem("f1-ui-preferences:v1") ?? "{}",
          ),
        ),
      )
      .toEqual({ uiVersion: "v2", v2Mode: "giorno", difficulty: "beginner" });

    await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    await page.reload();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");

    await switchToV1(page);
    await page.reload();
    await expect(page.locator('main[data-skin="v1"]')).toBeVisible();
    await switchToV2(page);
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
  });

  test("difficulty defaults to beginner and persists a regular pick across reload and V1", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(v2Root(page)).toHaveAttribute("data-difficulty", "beginner");
    await page
      .getByRole("button", { name: /switch to regular difficulty/i })
      .click();
    await expect(v2Root(page)).toHaveAttribute("data-difficulty", "regular");
    await expect
      .poll(() =>
        page.evaluate(() =>
          JSON.parse(
            window.localStorage.getItem("f1-ui-preferences:v1") ?? "{}",
          ),
        ),
      )
      .toEqual({ uiVersion: "v2", v2Mode: "giorno", difficulty: "regular" });

    await page.reload();
    await expect(v2Root(page)).toHaveAttribute("data-difficulty", "regular");

    await switchToV1(page);
    await expect(
      page.getByRole("button", { name: "regular", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "beginner", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "beginner", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(
      page.getByRole("button", { name: "beginner", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await switchToV2(page);
    await expect(v2Root(page)).toHaveAttribute("data-difficulty", "beginner");
  });

  test("hides both skins' difficulty pickers after the first race answer", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto("/");
    await completeLaunchWithJumpRetry(page, "skip");
    await switchToV1(page);

    await page.getByRole("button", { name: "Go to formation intro" }).click();
    await expect(page.getByText("formation lap (practice)").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "beginner", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "regular", exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Go to lap 1" }).click();
    await expect(
      page.getByText("grand prix live · lap 1/6", { exact: true }),
    ).toBeVisible();
    await answerV1LapCorrectly(page);

    await page.getByRole("button", { name: "Go to formation intro" }).click();
    await expect(page.getByText("formation lap (practice)").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "beginner", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "regular", exact: true }),
    ).toHaveCount(0);

    await switchToV2(page);
    await expect(
      page.getByRole("button", { name: "START FORMATION LAP" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /switch to (regular|beginner) difficulty/i }),
    ).toHaveCount(0);
    await expect(
      page.getByText(/rookie questions|the full paddock quiz/i),
    ).toHaveCount(0);
  });

  test("both marks use the specified offsets, opacity, padding, fade, and lights rule", async ({
    page,
  }) => {
    await page.goto("/");
    const v2Mark = page.locator(
      'button[aria-label="Switch to the original V1 skin"]',
    );

    await expect(v2Mark).toBeVisible();
    await expect(v2Mark).toHaveText("V2");
    await expect
      .poll(() =>
        v2Mark.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            opacity: style.opacity,
            right: style.right,
            bottom: style.bottom,
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            transitionDuration: style.transitionDuration,
          };
        }),
      )
      .toEqual({
        opacity: "0.4",
        right: "9px",
        bottom: "5px",
        paddingTop: "4px",
        paddingRight: "6px",
        paddingBottom: "4px",
        paddingLeft: "6px",
        transitionDuration: "0.4s",
      });

    await switchToV1(page);
    const v1Mark = page.getByRole("button", {
      name: "Switch to the Monza V2 design",
    });
    await expect(v1Mark).toHaveText("V1");
    await expect
      .poll(() =>
        v1Mark.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            opacity: style.opacity,
            right: style.right,
            bottom: style.bottom,
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            transitionDuration: style.transitionDuration,
          };
        }),
      )
      .toEqual({
        opacity: "0.4",
        right: "9px",
        bottom: "5px",
        paddingTop: "4px",
        paddingRight: "6px",
        transitionDuration: "0.4s",
      });

    await switchToV2(page);
    await skipFormationWarmup(page);

    await expect(v2Mark).toHaveAttribute("aria-hidden", "true");
    await expect
      .poll(() =>
        v2Mark.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
          };
        }),
      )
      .toEqual({ opacity: "0", pointerEvents: "none" });

    await expect(page.getByText(/go go go — tap now/i)).toBeVisible({
      timeout: 8_000,
    });
    await expect(v2Mark).toHaveAttribute("aria-hidden", "true");
    await expect(v2Mark).toHaveCSS("pointer-events", "none");
  });

  test("explicit V1 preference opens the original skin without copy changes", async ({
    page,
  }) => {
    await setPreference(page, "v1", "giorno");
    await page.goto("/");

    await expect(page.locator('main[data-skin="v1"]')).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ricky's f1 quiz grand prix" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /start formation lap/i }),
    ).toBeVisible();
  });
});
