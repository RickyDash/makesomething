import { expect, test } from "@playwright/test";

import {
  answerCurrentLap,
  completeLaunchWithJumpRetry,
  correctAnswerByPrompt,
  switchToV1,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

const classificationGeometry = async (page: import("@playwright/test").Page) =>
  page
    .getByRole("region", { name: "Live classification" })
    .evaluate((strip) => {
      const stripRect = strip.getBoundingClientRect();
      const cells = Array.from(strip.querySelectorAll("li")).map((cell) => {
        const rect = cell.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        };
      });
      return { stripHeight: stripRect.height, cells };
    });

const expectReferenceClassificationGeometry = (
  geometry: Awaited<ReturnType<typeof classificationGeometry>>,
) => {
  expect(geometry.stripHeight).toBeCloseTo(58, 0);
  expect(geometry.cells).toHaveLength(10);
  geometry.cells.forEach((cell, index) => {
    expect(cell.width).toBeCloseTo(geometry.cells[0].width, 1);
    expect(cell.height).toBeGreaterThanOrEqual(36);
    if (index > 0) {
      expect(cell.left).toBeGreaterThanOrEqual(
        geometry.cells[index - 1].right - 0.01,
      );
    }
  });
};

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
    expectReferenceClassificationGeometry(await classificationGeometry(page));

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
    expectReferenceClassificationGeometry(await classificationGeometry(page));
    expect(errors).toEqual([]);

    const screenshot = await page.screenshot();
    await testInfo.attach(`monza-v2-notte-${viewport.width}x${viewport.height}`, {
      body: screenshot,
      contentType: "image/png",
    });
  });
}

test("long verdicts scroll inside the race panel without colliding with the footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/");
  await completeLaunchWithJumpRetry(page);

  const quiz = v2Root(page).locator('[class*="quizPanel"]').filter({
    visible: true,
  });
  const scroller = quiz.locator('[class*="quizScroller"]');
  const footer = quiz.locator('[class*="raceFooter"]');
  const mark = v2Root(page).locator('button[aria-label*="original V1 skin"]');

  await answerCurrentLap(page, "wrong", { skipPlayback: true });
  await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      quiz.evaluate((panel) => {
        const scrollArea = panel.querySelector<HTMLElement>(
          '[class*="quizScroller"]',
        );
        const verdict = panel.querySelector<HTMLElement>(
          '[class*="verdictCard"]',
        );
        if (!scrollArea || !verdict) return Number.POSITIVE_INFINITY;
        return (
          verdict.getBoundingClientRect().bottom -
          scrollArea.getBoundingClientRect().bottom
        );
      }),
    )
    .toBeLessThanOrEqual(-1);

  const layout = await quiz.evaluate((panel) => {
    const scrollArea = panel.querySelector<HTMLElement>('[class*="quizScroller"]');
    const verdict = panel.querySelector<HTMLElement>('[class*="verdictCard"]');
    const telemetry = panel.querySelector<HTMLElement>('[class*="raceFooter"]');
    const cornerMark = document.querySelector<HTMLElement>(
      'button[aria-label*="original V1 skin"]',
    );
    if (!scrollArea || !verdict || !telemetry || !cornerMark) return null;
    const scrollerRect = scrollArea.getBoundingClientRect();
    const verdictRect = verdict.getBoundingClientRect();
    const footerRect = telemetry.getBoundingClientRect();
    const markRect = cornerMark.getBoundingClientRect();
    return {
      clientHeight: scrollArea.clientHeight,
      scrollHeight: scrollArea.scrollHeight,
      scrollerBottom: scrollerRect.bottom,
      verdictBottom: verdictRect.bottom,
      footerTop: footerRect.top,
      footerRight: footerRect.right,
      markLeft: markRect.left,
    };
  });

  expect(layout).not.toBeNull();
  expect(layout!.scrollHeight).toBeGreaterThan(layout!.clientHeight);
  expect(layout!.verdictBottom).toBeLessThanOrEqual(layout!.scrollerBottom - 1);
  expect(layout!.footerTop).toBeGreaterThanOrEqual(layout!.scrollerBottom - 1);
  expect(layout!.footerRight).toBeLessThanOrEqual(layout!.markLeft + 1);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await scroller.evaluate((node) => {
    node.scrollTop = 0;
  });
  await scroller.hover();
  await page.mouse.wheel(0, 180);
  await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page
    .getByRole("button", { name: /switch to notte dark mode/i })
    .click();
  expectReferenceClassificationGeometry(await classificationGeometry(page));
  await expect(footer).toBeVisible();
  await expect(mark).toBeVisible();
});

test("classification slots stay fixed through an overtake and a mid-lap theme change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await switchToV1(page);
  await page.getByRole("button", { name: "Go to lap 1" }).click();
  await switchToV2(page);

  const quiz = v2Root(page).locator('[class*="quizPanel"]');
  const prompt = (await quiz.getByRole("heading").innerText())
    .trim()
    .toLocaleLowerCase();
  const correctAnswer = correctAnswerByPrompt.get(prompt);
  if (!correctAnswer) throw new Error(`No answer found for: ${prompt}`);
  const options = await quiz.getByRole("button").allInnerTexts();
  const answerIndex = options.findIndex(
    (label) =>
      label.trim().toLocaleLowerCase() ===
      correctAnswer.trim().toLocaleLowerCase(),
  );
  if (answerIndex < 0) throw new Error(`No matching option found for: ${prompt}`);

  const sample = page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>(
      '[aria-label="Monza Formula 1 quiz grand prix"]',
    );
    const strip = document.querySelector<HTMLElement>(
      '[aria-label="Live classification"]',
    );
    if (!root || !strip) return null;
    const baseline = Array.from(strip.querySelectorAll("li")).map((cell) =>
      cell.getBoundingClientRect(),
    );
    const modes = new Set<string>();
    let maxPositionDrift = 0;
    let maxOverlap = 0;
    const startedAt = performance.now();
    let toggled = false;

    while (performance.now() - startedAt < 4_700) {
      const elapsed = performance.now() - startedAt;
      if (!toggled && elapsed > 900) {
        const toggle = document.querySelector<HTMLButtonElement>(
          'button[aria-label*="notte dark mode"]',
        );
        toggle?.click();
        toggled = true;
      }
      modes.add(root.dataset.mode ?? "");
      const cells = Array.from(strip.querySelectorAll("li")).map((cell) =>
        cell.getBoundingClientRect(),
      );
      cells.forEach((cell, index) => {
        maxPositionDrift = Math.max(
          maxPositionDrift,
          Math.abs(cell.left - baseline[index].left),
          Math.abs(cell.width - baseline[index].width),
        );
        if (index > 0) {
          maxOverlap = Math.max(maxOverlap, cells[index - 1].right - cell.left);
        }
      });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    return {
      cellCount: baseline.length,
      maxPositionDrift,
      maxOverlap,
      modes: [...modes],
    };
  });

  await quiz.getByRole("button").nth(answerIndex).click();
  const report = await sample;
  expect(report).not.toBeNull();
  expect(report!.cellCount).toBe(10);
  expect(report!.maxPositionDrift).toBeLessThanOrEqual(0.02);
  expect(report!.maxOverlap).toBeLessThanOrEqual(0.02);
  expect(report!.modes).toEqual(expect.arrayContaining(["giorno", "notte"]));
});
