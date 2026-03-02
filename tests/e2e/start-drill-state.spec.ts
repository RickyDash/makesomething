import { expect, test } from "@playwright/test";

test("completed start drill stays completed when returning via briefing next", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start formation lap/i }).click();
  await page.getByRole("button", { name: /next weave/i }).click();
  await page.getByRole("button", { name: /next weave/i }).click();
  await page.getByRole("button", { name: /line up on the grid/i }).click();

  const completeStartDrill = async () => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const initiate = page.getByRole("button", { name: /initiate starting-lights sequence/i });
      if (await initiate.isVisible()) {
        await initiate.click();
      }

      await expect(page.getByRole("button", { name: "LAUNCH" })).toBeVisible();
      await expect(page.getByText(/^lights out$/i)).toBeVisible({ timeout: 8_000 });
      await page.getByRole("button", { name: "LAUNCH" }).click();

      const proceed = page.getByRole("button", { name: /lights out and away we go/i });
      if (await proceed.isVisible({ timeout: 3_000 }).catch(() => false)) {
        return;
      }

      const retry = page.getByRole("button", { name: /retry starting-lights sequence/i });
      if (await retry.isVisible()) {
        await retry.click();
      }
    }

    throw new Error("failed to complete start drill after retries");
  };

  await completeStartDrill();

  await page.getByRole("button", { name: /<- previous/i }).click();
  await page.getByRole("button", { name: /line up on the grid/i }).click();

  await expect(page.getByRole("button", { name: /lights out and away we go/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /initiate starting-lights sequence/i })).toHaveCount(0);
  await expect(page.getByText(/start-drill incomplete/i)).toHaveCount(0);
});
