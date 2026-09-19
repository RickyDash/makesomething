import { expect, test } from "@playwright/test";

import { skipFormationWarmup, v2Root } from "./monza-v2-helpers";

const launchSurface = (page: import("@playwright/test").Page) =>
  page.locator('button[aria-label="Launch — tap at lights out"]');

// Pointer-down only (no release) inside the launch surface. The root is a
// centred 430px column, so page coordinates must come from the element.
const pressDown = async (page: import("@playwright/test").Page) => {
  const box = await launchSurface(page).boundingBox();
  if (!box) throw new Error("launch surface has no bounding box");
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
};

test.describe("V2 launch registers on pointer-down", () => {
  test("a press that starts during the countdown is a jump start before release", async ({
    page,
  }) => {
    await page.goto("/");
    await skipFormationWarmup(page);
    await expect(launchSurface(page)).toBeVisible();

    await pressDown(page);
    await expect(page.getByRole("heading", { name: "Jump start" })).toBeVisible();
    await page.mouse.up();
  });

  test("the reaction time is captured at pointer-down, before the finger lifts", async ({
    page,
  }) => {
    await page.goto("/");
    await skipFormationWarmup(page);
    await expect(page.getByText(/go go go — tap now/i)).toBeVisible({
      timeout: 8_000,
    });

    await pressDown(page);
    const reactionCard = v2Root(page).getByText("REACTION TIME", { exact: true });
    await expect(reactionCard).toBeVisible();
    await expect(page.getByText(/1 jump start/i)).toHaveCount(0);
    await page.mouse.up();
    await expect(reactionCard).toBeVisible();
  });
});
