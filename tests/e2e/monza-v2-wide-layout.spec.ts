import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

import {
  skipFormationWarmup,
  switchToV1,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

const viewports = [
  { width: 639, height: 844 }, // Last phone width: retain the existing column.
  { width: 640, height: 900 }, // First widened tablet width.
  { width: 959, height: 900 }, // Last stacked tablet width.
  { width: 800, height: 450 }, // A short/zoomed desktop in the tablet range.
  { width: 960, height: 800 }, // First two-pane width.
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1280, height: 480 }, // A short desktop must remain playable.
] as const;

const currentQuiz = (page: Page) =>
  v2Root(page).locator('[class*="quizPanel"]');

const capture = async (page: Page, testInfo: TestInfo, name: string) => {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path });
  await testInfo.attach(name, {
    path,
    contentType: "image/png",
  });
};

const jumpFromV2 = async (page: Page, marker: string) => {
  await switchToV1(page);
  await page.getByRole("button", { name: marker, exact: true }).click();
  await switchToV2(page);
};

const expectReachable = async (button: Locator) => {
  // Trial clicks also check hit-testing and scroll the appropriate inner
  // panel, without advancing the game or accepting an answer.
  await button.click({ trial: true });
  await expect(button).toBeInViewport();
};

const expectDocumentLocked = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth,
    bodyHeight: document.body.scrollHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.documentHeight).toBeLessThanOrEqual(dimensions.height);
  expect(dimensions.bodyHeight).toBeLessThanOrEqual(dimensions.height);
  expect(dimensions.scrollX).toBe(0);
  expect(dimensions.scrollY).toBe(0);
};

const expectMapAligned = async (page: Page) => {
  const map = v2Root(page).locator('[aria-label="Live Monza circuit map"]');
  await expect(map).toHaveAttribute("data-map-measured", "true");
  await expect(map.locator('[class*="raceOverlay"]')).toBeVisible();
  await expect
    .poll(() =>
      map.evaluate((element) => {
        const svg = element.querySelector("svg");
        const overlay = element.querySelector<HTMLElement>('[class*="raceOverlay"]');
        if (!svg || !overlay) return Number.POSITIVE_INFINITY;
        const bounds = element.getBoundingClientRect();
        const painted = overlay.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        const scale = Math.min(bounds.width / viewBox.width, bounds.height / viewBox.height);
        return Math.max(
          Math.abs(painted.width - viewBox.width * scale),
          Math.abs(painted.height - viewBox.height * scale),
          Math.abs(painted.left + painted.width / 2 - bounds.left - bounds.width / 2),
          Math.abs(painted.top + painted.height / 2 - bounds.top - bounds.height / 2),
        );
      }),
    )
    .toBeLessThan(1);
};

const expectRaceLayout = async (page: Page) => {
  await expect(currentQuiz(page)).toBeVisible();
  await expectMapAligned(page);
  const layout = await v2Root(page).evaluate((root) => {
    const box = (selector: string) => {
      const node = root.querySelector(selector);
      if (!node) throw new Error(`Missing layout element: ${selector}`);
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
        width: rect.width, height: rect.height,
      };
    };
    const rect = root.getBoundingClientRect();
    const strip = root.querySelector('[aria-label="Live classification"]')!;
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      root: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
      header: box("header"),
      map: box('[aria-label="Live Monza circuit map"]'),
      strip: box('[aria-label="Live classification"]'),
      print: box('[class*="printPane"]'),
      quiz: box('[class*="quizPanel"]'),
      scroller: box('[class*="quizScroller"]'),
      footer: box('[class*="raceFooter"]'),
      cells: Array.from(strip.querySelectorAll("li")).map((cell) => {
        const cellRect = cell.getBoundingClientRect();
        return { left: cellRect.left, right: cellRect.right };
      }),
    };
  });

  expect(layout.root.height).toBeCloseTo(layout.viewport.height, 0);
  expect(layout.root.top).toBeGreaterThanOrEqual(0);
  expect(layout.root.left).toBeGreaterThanOrEqual(0);
  expect(layout.root.right).toBeLessThanOrEqual(layout.viewport.width + 1);
  expect(layout.header.left).toBeCloseTo(layout.root.left, 0);
  expect(layout.header.right).toBeCloseTo(layout.root.right, 0);
  expect(layout.map.top).toBeGreaterThanOrEqual(layout.header.bottom - 1);
  expect(layout.map.height).toBeGreaterThan(0);
  expect(layout.strip.top).toBeGreaterThanOrEqual(layout.map.bottom - 1);
  expect(layout.strip.left).toBeCloseTo(layout.map.left, 0);
  expect(layout.strip.right).toBeCloseTo(layout.map.right, 0);
  expect(layout.scroller.height).toBeGreaterThanOrEqual(100);
  expect(layout.scroller.bottom).toBeLessThanOrEqual(layout.footer.top + 1);
  expect(layout.footer.bottom).toBeLessThanOrEqual(layout.root.bottom + 1);
  expect(layout.quiz.right).toBeLessThanOrEqual(layout.root.right + 1);

  if (layout.viewport.width >= 960) {
    expect(layout.map.right).toBeLessThanOrEqual(layout.print.left + 1);
    expect(layout.print.top).toBeCloseTo(layout.header.bottom, 0);
    expect(layout.print.bottom).toBeCloseTo(layout.root.bottom, 0);
    expect(layout.quiz.left).toBeGreaterThanOrEqual(layout.print.left);
    expect(layout.quiz.top).toBeLessThan(layout.strip.top);
  } else {
    expect(layout.map.left).toBeCloseTo(layout.root.left, 0);
    expect(layout.map.right).toBeCloseTo(layout.root.right, 0);
    expect(layout.quiz.top).toBeGreaterThanOrEqual(layout.strip.bottom - 1);
    if (layout.viewport.width < 640) {
      expect(layout.root.width).toBeCloseTo(Math.min(layout.viewport.width, 430), 0);
      expect(layout.strip.height).toBeCloseTo(58, 0);
    } else {
      expect(layout.root.width).toBeGreaterThan(430);
    }
  }

  expect(layout.cells).toHaveLength(10);
  layout.cells.forEach((cell, index) => {
    expect(cell.left).toBeGreaterThanOrEqual(layout.strip.left);
    expect(cell.right).toBeLessThanOrEqual(layout.strip.right);
    if (index > 0) expect(cell.left).toBeGreaterThanOrEqual(layout.cells[index - 1].right - 0.1);
  });
  await expectDocumentLocked(page);
};

const expectOverlayPlacement = async (page: Page, overlay: Locator) => {
  await expect(overlay).toBeVisible();
  // Wait for the existing entrance animation before measuring its final
  // position; its initial translateY is intentionally outside the pane.
  await expect.poll(() => overlay.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
  const box = await overlay.boundingBox();
  const rootBox = await v2Root(page).boundingBox();
  expect(box).not.toBeNull();
  expect(rootBox).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(rootBox!.x - 1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(rootBox!.x + rootBox!.width + 1);
  expect(box!.y).toBeGreaterThanOrEqual(rootBox!.y - 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(rootBox!.y + rootBox!.height + 1);
  if (page.viewportSize()!.width >= 960) {
    const pane = await v2Root(page).locator('[class*="printPane"]').boundingBox();
    expect(pane).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(pane!.x - 1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(pane!.x + pane!.width + 1);
    expect(box!.y).toBeGreaterThanOrEqual(pane!.y - 1);
  }
  await expectDocumentLocked(page);
};

for (const viewport of viewports) {
  test(`V2 uses the correct layout in both modes at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(viewport.height < 500 && Boolean(testInfo.project.use.hasTouch), "short touch landscape retains the phone rotate notice");
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expectReachable(page.getByRole("button", { name: "START FORMATION LAP", exact: true }));
    if (viewport.width === 1440 || viewport.height === 480) {
      await capture(page, testInfo, `intro-${viewport.width}x${viewport.height}`);
    }
    await jumpFromV2(page, "Go to lap 1");
    const question = await currentQuiz(page).getByRole("heading").textContent();

    for (const mode of ["giorno", "notte"] as const) {
      if (mode === "notte") {
        await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
      }
      await expect(v2Root(page)).toHaveAttribute("data-mode", mode);
      await expectRaceLayout(page);
      expect(await currentQuiz(page).getByRole("heading").textContent()).toBe(question);
      await expectReachable(currentQuiz(page).getByRole("button").last());
      await currentQuiz(page).locator('[class*="quizScroller"]').evaluate((node) => { node.scrollTop = 0; });
      await capture(page, testInfo, `question-${mode}-${viewport.width}x${viewport.height}`);
    }
  });
}

test("the map stays aligned through repeated resizing and skin remounts", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await jumpFromV2(page, "Go to lap 4");
  const question = await currentQuiz(page).getByRole("heading").textContent();
  for (const viewport of [
    { width: 959, height: 900 },
    { width: 639, height: 844 },
    { width: 640, height: 900 },
    { width: 960, height: 700 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await expectRaceLayout(page);
    await switchToV1(page);
    await switchToV2(page);
    await expectRaceLayout(page);
    await expect(v2Root(page).getByText("Q 4 / 6", { exact: true })).toBeVisible();
    expect(await currentQuiz(page).getByRole("heading").textContent()).toBe(question);
    await expect(currentQuiz(page).getByRole("button").first()).toBeEnabled();
  }
  await capture(page, testInfo, "question-after-resizing-and-skin-remounts");
});

test("warm-up feedback and next steps remain reachable across desktop and tablet", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "START FORMATION LAP", exact: true }).click();
  const first = page.getByRole("region", { name: "Formation warmup 1 of 3" });
  await first.getByRole("button", { name: "No — it locks the moment you tap", exact: true }).click();
  await expect(first.getByText("RIGHT CALL", { exact: true })).toBeVisible();
  await expectOverlayPlacement(page, first);
  await expectReachable(first.getByRole("button", { name: "NEXT →", exact: true }));
  await capture(page, testInfo, "warmup-desktop-feedback");

  await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
  await page.setViewportSize({ width: 768, height: 1024 });
  await expectOverlayPlacement(page, first);
  await first.getByRole("button", { name: "NEXT →", exact: true }).click();
  const second = page.getByRole("region", { name: "Formation warmup 2 of 3" });
  await expect(second.getByRole("heading", { name: "How many laps is the 6-question race?" })).toBeInViewport();
  await expect.poll(() => second.evaluate((node) => node.scrollTop)).toBe(0);
  await capture(page, testInfo, "warmup-tablet-next-step");

  await page.setViewportSize({ width: 1280, height: testInfo.project.use.hasTouch ? 600 : 480 });
  await second.getByRole("button", { name: "6 laps — one lap per question", exact: true }).click();
  await expect(second.getByText("RIGHT CALL", { exact: true })).toBeVisible();
  await expectOverlayPlacement(page, second);
  const next = second.getByRole("button", { name: "NEXT →", exact: true });
  await expectReachable(next);
  await capture(page, testInfo, "warmup-short-desktop-feedback");
  await next.click();
  await expect(page.getByRole("region", { name: "Formation warmup 3 of 3" })).toBeVisible();
});

test("pit controls survive tablet resizing and repeated skin navigation", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await jumpFromV2(page, "Go to pit stop");
  const pit = page.getByRole("region", { name: "Pit stop challenge" });
  await expectOverlayPlacement(page, pit);
  await expectReachable(pit.getByRole("button", { name: /begin the stop/i }));
  await capture(page, testInfo, "pit-desktop-idle");
  await pit.getByRole("button", { name: /begin the stop/i }).click();
  await pit.getByRole("button", { name: /^front left/i }).click();

  for (const viewport of [{ width: 768, height: 1024 }, { width: 960, height: 700 }]) {
    await page.setViewportSize(viewport);
    await switchToV1(page);
    await switchToV2(page);
    await expectOverlayPlacement(page, pit);
    await expect(pit.getByRole("button", { name: "FRONT RIGHT, next tyre", exact: true })).toBeVisible();
    for (const button of await pit.getByRole("button").all()) await expectReachable(button);
    await expectMapAligned(page);
    await capture(page, testInfo, `pit-active-${viewport.width}x${viewport.height}`);
  }

  for (const tyre of ["front right", "rear left", "rear right"]) {
    await pit.getByRole("button", { name: new RegExp(`^${tyre}`, "i") }).click();
  }
  await expect(v2Root(page)).toHaveAttribute("data-stage", "race", { timeout: 5_000 });
  await jumpFromV2(page, "Go to pit stop");
  await expect(pit.getByText("STATIONARY TIME", { exact: true })).toBeVisible();
  await expectOverlayPlacement(page, pit);
  await pit.getByRole("button", { name: "REJOIN THE RACE →", exact: true }).click();
  await expectRaceLayout(page);
});

test("an interrupted launch and retry place the reaction card in the current layout", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await skipFormationWarmup(page);
  await expect(page.getByText(/tap anywhere at lights out/i)).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const launch = page.locator('button[aria-label="Launch — tap at lights out"]');
  await expect(launch).toHaveCount(0);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByText(/tap anywhere at lights out/i)).toBeVisible({ timeout: 2_500 });
  await launch.click({ position: { x: 20, y: 20 } });
  const card = v2Root(page).locator('[class*="compactCard"]');
  await expect(page.getByRole("heading", { name: "Jump start", exact: true })).toBeVisible();
  await expectOverlayPlacement(page, card);
  await capture(page, testInfo, "jump-card-after-interrupted-tablet-launch");
  await page.getByRole("button", { name: "RETRY THE START", exact: true }).click();
  await page.setViewportSize({ width: 960, height: 700 });
  await expect(page.getByText(/go go go — tap now/i)).toBeVisible({ timeout: 8_000 });
  // Capture over the right pane as well as the map: the launch surface must
  // continue to cover the entire game after it becomes a two-pane layout.
  const launchBox = await launch.boundingBox();
  expect(launchBox).not.toBeNull();
  await launch.click({ position: { x: launchBox!.width * 0.9, y: launchBox!.height / 2 } });
  await expect(v2Root(page).getByText("REACTION TIME", { exact: true })).toBeVisible();
  await expectOverlayPlacement(page, card);
  await expectReachable(page.getByRole("button", { name: /away we go/i }));
  await capture(page, testInfo, "reaction-desktop-after-retry");

  await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
  await page.setViewportSize({ width: 959, height: 900 });
  await expectOverlayPlacement(page, card);
  await switchToV1(page);
  await switchToV2(page);
  await expect(v2Root(page).getByText("REACTION TIME", { exact: true })).toBeVisible();
  await expectOverlayPlacement(page, card);
  await capture(page, testInfo, "reaction-tablet-after-skin-navigation");
  await page.setViewportSize({ width: 800, height: testInfo.project.use.hasTouch ? 600 : 450 });
  await expectOverlayPlacement(page, card);
  await expectReachable(page.getByRole("button", { name: /away we go/i }));
  await capture(page, testInfo, "reaction-short-tablet");
  await page.getByRole("button", { name: /away we go/i }).click();
  await expectRaceLayout(page);
});

test("report art and actions remain reachable through resizing and repeated restarts", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (let run = 0; run < 2; run += 1) {
    await jumpFromV2(page, "Go to final race report");
    const report = page.getByRole("region", { name: "DNF — Retired", exact: true });
    await expect(report).toBeVisible();
    await expect.poll(() => report.evaluate((node) => getComputedStyle(node).transform)).toBe("none");

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 768, height: 1024 },
      { width: 1280, height: testInfo.project.use.hasTouch ? 600 : 480 },
    ]) {
      await page.setViewportSize(viewport);
      const art = await report.locator('[class*="finishArt"]').boundingBox();
      const body = await report.locator('[class*="finishBody"]').boundingBox();
      const header = await report.locator("header").boundingBox();
      const mark = v2Root(page).getByRole("button", { name: "Switch to the original V1 skin", exact: true });
      const markBox = await mark.boundingBox();
      expect(art).not.toBeNull();
      expect(body).not.toBeNull();
      expect(header).not.toBeNull();
      expect(markBox).not.toBeNull();
      expect(art!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
      expect(markBox!.y + markBox!.height).toBeLessThanOrEqual(header!.y + header!.height + 1);
      if (viewport.width >= 960) {
        expect(art!.x + art!.width).toBeLessThanOrEqual(body!.x + 1);
        expect(body!.y).toBeCloseTo(art!.y, 0);
      } else {
        expect(body!.y).toBeGreaterThanOrEqual(art!.y + art!.height - 1);
      }
      await expectReachable(report.getByRole("button", { name: "RUN ANOTHER GRAND PRIX", exact: true }));
      await expectReachable(mark);
      await expectDocumentLocked(page);
      if (run === 0) await capture(page, testInfo, `report-${viewport.width}x${viewport.height}`);
    }

    await report.getByRole("button", { name: "RUN ANOTHER GRAND PRIX", exact: true }).click();
    await expectReachable(page.getByRole("button", { name: "START FORMATION LAP", exact: true }));
    await expect(v2Root(page)).toHaveAttribute("data-intro", "true");
    if (run === 0) await page.getByRole("button", { name: /switch to notte dark mode/i }).click();
  }
});
