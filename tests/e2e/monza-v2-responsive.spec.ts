import { expect, test } from "@playwright/test";

import { v2Root } from "./monza-v2-helpers";

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

for (const viewport of viewports) {
  test(`V2 fills and locks the mobile viewport in both modes at ${viewport.width}x${viewport.height}`, async ({
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

    const dimensions = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>(
        '[aria-label="Monza Formula 1 quiz grand prix"]',
      );
      const header = root?.querySelector("header");
      const rootRect = root?.getBoundingClientRect();
      const headerRect = header?.getBoundingClientRect();

      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        bodyWidth: document.body.scrollWidth,
        bodyHeight: document.body.scrollHeight,
        rootWidth: rootRect?.width ?? 0,
        rootHeight: rootRect?.height ?? 0,
        rootTop: rootRect?.top ?? -1,
        headerTop: headerRect?.top ?? -1,
      };
    });
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.innerWidth);
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.innerWidth);
    expect(dimensions.documentHeight).toBeLessThanOrEqual(dimensions.innerHeight);
    expect(dimensions.bodyHeight).toBeLessThanOrEqual(dimensions.innerHeight);
    expect(dimensions.rootWidth).toBeCloseTo(
      Math.min(viewport.width, 430),
      0,
    );
    expect(dimensions.rootHeight).toBeCloseTo(viewport.height, 0);
    expect(dimensions.rootTop).toBeGreaterThanOrEqual(0);
    expect(dimensions.headerTop).toBeGreaterThanOrEqual(dimensions.rootTop);

    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(50);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    const giornoRect = await v2Root(page).boundingBox();
    await page
      .getByRole("button", { name: /switch to notte dark mode/i })
      .click();
    await expect(v2Root(page)).toHaveAttribute("data-mode", "notte");
    expect(await v2Root(page).boundingBox()).toEqual(giornoRect);
    expect(errors).toEqual([]);

    const screenshot = await page.screenshot();
    await testInfo.attach(`monza-v2-notte-${viewport.width}x${viewport.height}`, {
      body: screenshot,
      contentType: "image/png",
    });
  });
}
