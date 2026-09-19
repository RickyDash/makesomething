import { expect, test } from "@playwright/test";

import {
  answerCurrentLap,
  completeLaunchWithJumpRetry,
  setPreference,
  skipFormationWarmup,
  v2Root,
} from "./monza-v2-helpers";

// Regression coverage for the fixes from the real iOS Safari pass
// (design-qa-ios.md). Each test names the row it protects.

test.describe("iOS pass regressions", () => {
  test("a stored notte preference paints black before hydration (IOS-09, IOS-10)", async ({
    page,
  }) => {
    await setPreference(page, "v2", "notte");
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { __preHydration: unknown }).__preHydration = {
          mode: document.documentElement.dataset.v2Mode ?? null,
          themeColor:
            document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ??
            null,
          htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          hydrated: document.querySelector('[data-hydrated="true"]') !== null,
        };
      });
    });
    await page.goto("/");
    await expect(v2Root(page)).toHaveAttribute("data-hydrated", "true");

    const snapshot = await page.evaluate(
      () => (window as unknown as { __preHydration: unknown }).__preHydration,
    );
    expect(snapshot).toEqual({
      mode: "notte",
      themeColor: "#0e0e0e",
      htmlBackground: "rgb(14, 14, 14)",
      bodyBackground: "rgb(14, 14, 14)",
      hydrated: false,
    });
    // Every theme-color tag (React hoists a second copy on hydration)
    // carries the mode colour, and the toggle keeps them in step.
    const themeColors = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('meta[name="theme-color"]')).map((meta) =>
          meta.getAttribute("content"),
        ),
      );
    expect(new Set(await themeColors())).toEqual(new Set(["#0e0e0e"]));
    await page.getByRole("button", { name: /switch to giorno light mode/i }).click();
    await expect.poll(async () => new Set(await themeColors())).toEqual(new Set(["#f3edde"]));
  });

  test("a countdown hidden by the OS restarts in place on return (IOS-04)", async ({
    page,
  }) => {
    await page.goto("/");
    await skipFormationWarmup(page);
    const hint = page.getByText(/tap anywhere at lights out/i);
    await expect(hint).toBeVisible();

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(
      page.locator('button[aria-label="Launch — tap at lights out"]'),
    ).toHaveCount(0);
    await expect(v2Root(page).getByText("REACTION TIME", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Jump start" })).toHaveCount(0);

    await page.waitForTimeout(1_500);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // The lights re-arm after ~600 ms. A replayed formation lap would take
    // ~6 s, so the short timeout also guards the sim resync.
    await expect(hint).toBeVisible({ timeout: 2_500 });
    await expect(page.getByText(/go go go — tap now/i)).toBeVisible({ timeout: 8_000 });
  });

  test("Reduce Motion keeps the wrong-corner penalty readable (IOS-18)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await completeLaunchWithJumpRetry(page);
    for (let lap = 0; lap < 3; lap += 1) {
      await answerCurrentLap(page, "correct", { skipPlayback: true });
      if (lap < 2) {
        await expect(
          v2Root(page).getByText(`Q ${lap + 2} / 6`, { exact: true }),
        ).toBeVisible({ timeout: 5_000 });
      }
    }
    const pit = page.getByRole("region", { name: "Pit stop challenge" });
    await expect(pit).toBeVisible({ timeout: 5_000 });
    // Proof the emulation is on: the overlay's own entrance collapses to 1ms.
    expect(await pit.evaluate((element) => getComputedStyle(element).animationDuration)).toBe(
      "0.001s",
    );
    await pit.getByRole("button", { name: /begin the stop/i }).click();
    await pit.getByRole("button", { name: /^rear right/i }).click();
    const flash = pit.getByText(/wrong corner — \+300ms/i);
    await expect(flash).toBeVisible();
    expect(await flash.evaluate((element) => getComputedStyle(element).animationDuration)).toBe(
      "1.35s",
    );
  });

  test("the rotate notice never covers a short desktop window (IOS-08)", async ({
    page,
  }, testInfo) => {
    test.skip(Boolean(testInfo.project.use.hasTouch), "desktop pointer only");
    await page.setViewportSize({ width: 1280, height: 480 });
    await page.goto("/");
    await expect(page.locator('[class*="rotateNotice"]')).toBeHidden();
    await expect(page.getByRole("button", { name: "START FORMATION LAP" })).toBeVisible();
  });

  test("the rotate notice covers phone landscape (IOS-08)", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, "touch devices only");
    await page.setViewportSize({ width: 852, height: 393 });
    await page.goto("/");
    await expect(page.locator('[class*="rotateNotice"]')).toBeVisible();
  });
});
