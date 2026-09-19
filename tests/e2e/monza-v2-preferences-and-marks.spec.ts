import { expect, test } from "@playwright/test";

import {
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
      .toEqual({ uiVersion: "v2", v2Mode: "giorno" });

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

  test("both marks use the specified offsets, opacity, padding, fade, and lights rule", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
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
        right: "4px",
        bottom: "0px",
        paddingTop: "0px",
        paddingRight: "6px",
        paddingBottom: "2px",
        paddingLeft: "0px",
        transitionDuration: "0.4s",
      });

    // The mark lives inside the header with a 44px hit box that only
    // overlaps the static position badge, never a pinned CTA.
    const markBox = await v2Mark.boundingBox();
    const headerBox = await v2Root(page).locator("header").first().boundingBox();
    const toggleBox = await page
      .getByRole("button", { name: /switch to notte dark mode/i })
      .boundingBox();
    expect(markBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(toggleBox).not.toBeNull();
    expect(markBox!.width).toBeGreaterThanOrEqual(44);
    expect(markBox!.height).toBeGreaterThanOrEqual(44);
    expect(markBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
    expect(markBox!.x + markBox!.width).toBeLessThanOrEqual(
      headerBox!.x + headerBox!.width + 0.5,
    );
    expect(markBox!.y + markBox!.height).toBeLessThanOrEqual(
      headerBox!.y + headerBox!.height + 0.5,
    );
    expect(markBox!.x).toBeGreaterThanOrEqual(toggleBox!.x + toggleBox!.width);
    expect(toggleBox!.height).toBeGreaterThanOrEqual(34);

    // Tapping the bottom-right corner of a pinned CTA must press the CTA.
    await page.getByRole("button", { name: "START FORMATION LAP" }).click();
    const warmup = page.getByRole("region", { name: "Formation warmup 1 of 3" });
    await warmup
      .getByRole("button", { name: "It locks in immediately", exact: true })
      .click();
    const next = warmup.getByRole("button", { name: "NEXT →", exact: true });
    await expect(next).toBeVisible();
    const nextBox = await next.boundingBox();
    expect(nextBox).not.toBeNull();
    await page.mouse.click(
      nextBox!.x + nextBox!.width - 6,
      nextBox!.y + nextBox!.height - 6,
    );
    await expect(
      page.getByRole("region", { name: "Formation warmup 2 of 3" }),
    ).toBeVisible();
    await expect(page.locator('main[data-skin="v1"]')).toHaveCount(0);

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
