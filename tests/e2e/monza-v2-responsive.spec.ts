import { expect, test } from "@playwright/test";

import { v2Root } from "./monza-v2-helpers";

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

for (const viewport of viewports) {
  test(`V2 giorno has no horizontal overflow or page errors at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(v2Root(page)).toBeVisible();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "giorno");

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.innerWidth);
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.innerWidth);
    expect(errors).toEqual([]);

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`monza-v2-${viewport.width}x${viewport.height}`, {
      body: screenshot,
      contentType: "image/png",
    });
  });
}
