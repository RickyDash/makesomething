import { expect, test, type Page } from "@playwright/test";

import {
  answerCurrentLap,
  completeLaunchWithJumpRetry,
  completePitWithWrongCorner,
  setPreference,
  skipFormationWarmup,
  switchToV1,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

// The mark is drawn in the header's bottom-right corner with a 44px hit box
// that only overlaps the static position badge, never a pinned CTA; the
// DAY/NIGHT toggle's hit area is extended to 44px by a pseudo-element, which
// boundingBox() cannot see, so it is verified with real hit-testing.
const expectHeaderMarkGeometry = async (page: Page) => {
  const v2Mark = page.locator('button[aria-label="Switch to the original V1 skin"]');
  const toggle = page.getByRole("button", { name: /switch to (notte dark|giorno light) mode/i });
  const markBox = await v2Mark.boundingBox();
  const headerBox = await v2Root(page).locator("header").first().boundingBox();
  const toggleBox = await toggle.boundingBox();
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

  const hitLabel = (x: number, y: number) =>
    page.evaluate(
      ([px, py]) =>
        document.elementFromPoint(px, py)?.closest("button")?.getAttribute("aria-label") ??
        null,
      [x, y] as const,
    );
  const toggleCentreX = toggleBox!.x + toggleBox!.width / 2;
  expect(await hitLabel(toggleCentreX, toggleBox!.y - 4)).toMatch(/switch to (notte|giorno)/i);
  expect(
    await hitLabel(toggleCentreX, toggleBox!.y + toggleBox!.height + 4),
  ).toMatch(/switch to (notte|giorno)/i);
  expect(
    await hitLabel(markBox!.x + markBox!.width / 2, markBox!.y + markBox!.height / 2),
  ).toBe("Switch to the original V1 skin");
};

test.describe("Monza V2 preferences and hidden corner marks", () => {
  test("the mark keeps its header-corner geometry in notte", async ({ page }) => {
    await setPreference(page, "v2", "notte");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    await expectHeaderMarkGeometry(page);
  });

  test("the mark stays reachable on the race report", async ({ page }) => {
    await page.goto("/");
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
    await expect(page.getByRole("heading", { name: "Race Winner" })).toBeVisible({
      timeout: 8_000,
    });
    await switchToV1(page);
    await expect(
      page.getByRole("button", { name: /run another grand prix/i }),
    ).toBeVisible();
  });

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
        paddingTop: "0px",
        paddingRight: "6px",
        paddingBottom: "2px",
        paddingLeft: "0px",
        transitionDuration: "0.4s",
      });

    await expectHeaderMarkGeometry(page);

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

  test("tapping the corner of a pinned CTA presses the CTA, not the mark", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
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
