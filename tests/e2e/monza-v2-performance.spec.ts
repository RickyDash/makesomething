import { expect, test, type Page } from "@playwright/test";

import {
  correctAnswerByPrompt,
  switchToV1,
  switchToV2,
  v2Root,
} from "./monza-v2-helpers";

type PerformanceSample = {
  intervals: number[];
  longTasks: { duration: number; name: string; startTime: number }[];
  elapsedMs: number;
};

const percentile = (values: number[], fraction: number) => {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * fraction))];
};

const collectPerformanceSample = (page: Page, durationMs: number) =>
  page.evaluate(async (duration): Promise<PerformanceSample> => {
    const intervals: number[] = [];
    const longTasks: { duration: number; name: string; startTime: number }[] = [];
    const startedAt = performance.now();
    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        longTasks.push({
          duration: entry.duration,
          name: entry.name,
          startTime: entry.startTime,
        });
      }
    });
    observer.observe({ type: "longtask" });

    let previous = startedAt;
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        intervals.push(now - previous);
        previous = now;
        if (now - startedAt >= duration) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.disconnect();
    const endedAt = performance.now();
    return {
      intervals: intervals.slice(1),
      longTasks: longTasks.filter(
        (entry) => entry.startTime >= startedAt && entry.startTime <= endedAt,
      ),
      elapsedMs: endedAt - startedAt,
    };
  }, durationMs);

test("active V2 racing meets the 4x CPU frame budget at 390x844", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await switchToV1(page);
  await page.getByRole("button", { name: "Go to lap 1" }).click();
  await switchToV2(page);
  await expect(v2Root(page)).toHaveAttribute("data-stage", "race");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const quiz = v2Root(page).locator('[class*="quizPanel"]');
  const prompt = (await quiz.getByRole("heading").innerText())
    .trim()
    .toLocaleLowerCase();
  const correctAnswer = correctAnswerByPrompt.get(prompt);
  if (!correctAnswer) throw new Error(`No answer found for performance prompt: ${prompt}`);
  const optionLabels = await quiz.getByRole("button").allInnerTexts();
  const correctOptionIndex = optionLabels.findIndex(
    (label) =>
      label.trim().toLocaleLowerCase() ===
      correctAnswer.trim().toLocaleLowerCase(),
  );
  if (correctOptionIndex < 0) {
    throw new Error(`No correct option found for: ${prompt}`);
  }
  const answerStartedAt = await page.evaluate(() => performance.now());
  await quiz.getByRole("button").nth(correctOptionIndex).click();
  await expect(quiz.locator('[class*="radioCard"] strong')).toContainText(
    "TEAM RADIO",
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  const activeBaselineAt = await page.evaluate(() => performance.now());
  const activeLapSampleMs = Math.max(
    500,
    4_000 - (activeBaselineAt - answerStartedAt),
  );
  const before = await cdp.send("Performance.getMetrics");

  const activeLapSample = await collectPerformanceSample(page, activeLapSampleMs);
  const activeLapMetrics = await cdp.send("Performance.getMetrics");
  const verdictSample = await collectPerformanceSample(
    page,
    5_000 - activeLapSampleMs,
  );
  const sample: PerformanceSample = {
    intervals: [...activeLapSample.intervals, ...verdictSample.intervals],
    longTasks: [...activeLapSample.longTasks, ...verdictSample.longTasks],
    elapsedMs: activeLapSample.elapsedMs + verdictSample.elapsedMs,
  };
  const after = await cdp.send("Performance.getMetrics");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  const metricValue = (
    metrics: typeof before.metrics,
    name: string,
  ) => metrics.find((metric) => metric.name === name)?.value ?? 0;
  const metricDelta = (name: string) =>
    metricValue(after.metrics, name) - metricValue(before.metrics, name);
  const activeLapMetricDelta = (name: string) =>
    metricValue(activeLapMetrics.metrics, name) -
    metricValue(before.metrics, name);
  const mean =
    sample.intervals.reduce((total, interval) => total + interval, 0) /
    sample.intervals.length;
  const report = {
    averageFps: Number((1_000 / mean).toFixed(2)),
    medianFrameMs: Number(percentile(sample.intervals, 0.5).toFixed(2)),
    p95FrameMs: Number(percentile(sample.intervals, 0.95).toFixed(2)),
    frames: sample.intervals.length,
    elapsedMs: Number(sample.elapsedMs.toFixed(1)),
    activeLapSampleMs: Number(activeLapSampleMs.toFixed(1)),
    longTasksOver50Ms: sample.longTasks.filter((entry) => entry.duration > 50),
    activeLapLayoutCountDelta: activeLapMetricDelta("LayoutCount"),
    layoutCountDelta: metricDelta("LayoutCount"),
    layoutDurationMs: Number((metricDelta("LayoutDuration") * 1_000).toFixed(3)),
    recalcStyleDurationMs: Number(
      (metricDelta("RecalcStyleDuration") * 1_000).toFixed(3),
    ),
  };

  await testInfo.attach("monza-v2-performance-4x.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  console.log(`MONZA_V2_PERF ${JSON.stringify(report)}`);

  expect(report.averageFps).toBeGreaterThanOrEqual(55);
  expect(report.medianFrameMs).toBeLessThanOrEqual(18);
  expect(report.p95FrameMs).toBeLessThanOrEqual(25);
  expect(report.longTasksOver50Ms).toEqual([]);
  expect(report.activeLapLayoutCountDelta).toBeLessThanOrEqual(5);
  expect(report.layoutCountDelta).toBeLessThanOrEqual(20);
  expect(report.layoutDurationMs).toBeLessThanOrEqual(25);
});
