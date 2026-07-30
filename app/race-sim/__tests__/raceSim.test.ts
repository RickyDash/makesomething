import { describe, expect, it } from "vitest";

import {
  MONZA_MAIN_TRACK_PATH_D,
  MONZA_PIT_LANE_PATH_D,
  RACE_SIM_DRIVER_CODES,
  RACE_SIM_INITIAL_ORDER,
  createRaceSim,
  createSvgPathGeometrySampler,
  type RaceSimFrameHandle,
  type RaceSimGeometrySampler,
} from "../raceSim";

const geometry: RaceSimGeometrySampler = {
  mainLength: 1_000,
  pitLength: 300,
  sampleMain: (progress) => ({
    x: (((progress % 1) + 1) % 1) * 1_000,
    y: 0,
    tangentX: 1,
    tangentY: 0,
  }),
  samplePit: (progress) => ({
    x: progress * 300,
    y: 100,
    tangentX: 1,
    tangentY: 0,
  }),
};

const createRafHarness = () => {
  let time = 0;
  let nextId = 1;
  const callbacks = new Map<number, (timestampMs: number) => void>();

  return {
    now: () => time,
    requestFrame: (callback: (timestampMs: number) => void): RaceSimFrameHandle => {
      const id = nextId;
      nextId += 1;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame: (handle: RaceSimFrameHandle) => {
      callbacks.delete(handle as number);
    },
    step: (milliseconds: number) => {
      time += milliseconds;
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach((callback) => callback(time));
    },
    pending: () => callbacks.size,
  };
};

const createHarnessedSim = (options: { lapDurationMs?: number } = {}) => {
  const raf = createRafHarness();
  const sim = createRaceSim({
    now: raf.now,
    requestFrame: raf.requestFrame,
    cancelFrame: raf.cancelFrame,
    geometry,
    random: () => 0.99,
    drama: 0,
    lapDurationMs: options.lapDurationMs,
  });
  return { raf, sim };
};

describe("race simulator", () => {
  it("samples live SVG geometry once and keeps RAF sampling layout-read-free", () => {
    let geometryReads = 0;
    const path = {
      getTotalLength: () => 1_000,
      getPointAtLength: (distance: number) => {
        geometryReads += 1;
        return { x: distance, y: distance * 0.25 };
      },
    };
    const sampler = createSvgPathGeometrySampler(path, path);
    const readsAfterCreation = geometryReads;

    for (let index = 0; index < 120; index += 1) {
      sampler.sampleMain(index / 120);
      sampler.samplePit(index / 120);
    }

    expect(readsAfterCreation).toBeGreaterThan(0);
    expect(geometryReads).toBe(readsAfterCreation);
    expect(sampler.sampleMain(0.5)).toMatchObject({
      x: 500,
      y: 125,
    });
  });

  it("ships the exact Monza paths, driver roster, and P10 grid order", () => {
    expect(MONZA_MAIN_TRACK_PATH_D).toBe(
      "M 740,452 L 415,452 L 404,437 L 388,443 L 300,450 C 230,454 182,448 176,406 L 168,262 L 157,243 L 137,239 L 130,220 L 112,152 C 102,98 118,72 152,65 L 196,58 C 222,53 236,62 246,82 L 448,318 C 458,330 450,348 470,351 C 490,354 487,325 507,321 C 527,317 533,337 546,352 L 878,352 C 950,352 976,366 972,402 C 968,436 930,452 878,452 Z",
    );
    expect(MONZA_PIT_LANE_PATH_D).toBe(
      "M 856,450 C 828,443 812,434 786,432 L 560,432 C 538,432 524,442 506,450",
    );
    expect(RACE_SIM_DRIVER_CODES).toEqual([
      "YOU",
      "VOL",
      "OKA",
      "TAN",
      "LIN",
      "MOR",
      "KOV",
      "DUB",
      "SAL",
      "ROS",
    ]);
    expect(RACE_SIM_INITIAL_ORDER).toEqual([1, 4, 2, 6, 3, 5, 7, 8, 9, 0]);

    const { sim } = createHarnessedSim();
    expect(sim.getFrame().order).toEqual(RACE_SIM_INITIAL_ORDER);
    expect(sim.getFrame().cars[0].position).toBe(10);
  });

  it("keeps advancing headlessly and caps each RAF delta at 0.05 seconds", () => {
    const { raf, sim } = createHarnessedSim();
    sim.sync({
      phase: "question",
      lap: 0,
      ledgerPosition: 10,
    });
    const before = sim.getFrame().absoluteProgress;

    sim.start();
    expect(raf.pending()).toBe(1);
    raf.step(1_000);
    raf.step(1_000);

    expect(sim.getFrame().deltaSeconds).toBe(0.05);
    expect(sim.getFrame().absoluteProgress - before).toBeCloseTo(0.0012, 8);
    expect(raf.pending()).toBe(1);

    sim.destroy();
    const destroyedAt = sim.getFrame().absoluteProgress;
    expect(raf.pending()).toBe(0);
    raf.step(1_000);
    expect(sim.getFrame().absoluteProgress).toBe(destroyedAt);
    expect(sim.getFrame().running).toBe(false);
  });

  it("detaches subscribers without stopping the headless RAF", () => {
    const { raf, sim } = createHarnessedSim();
    sim.sync({
      phase: "question",
      lap: 0,
      ledgerPosition: 10,
    });
    let calls = 0;
    const unsubscribe = sim.subscribe(() => {
      calls += 1;
    });

    expect(calls).toBe(1);
    sim.start();
    expect(calls).toBe(2);
    raf.step(16);
    expect(calls).toBe(3);

    unsubscribe();
    const progressAtDetach = sim.getFrame().absoluteProgress;
    raf.step(16);
    raf.step(16);

    expect(calls).toBe(3);
    expect(sim.getFrame().absoluteProgress).toBeGreaterThan(progressAtDetach);
    expect(raf.pending()).toBe(1);
  });

  it("holds the player at the pit box, releases it, and rejoins smoothly", () => {
    const { raf, sim } = createHarnessedSim();
    sim.sync({
      phase: "pit",
      lap: 3,
      ledgerPosition: 6,
      pitState: "idle",
    });
    sim.start();

    raf.step(1_300);
    let frame = sim.getFrame();
    expect(frame.pit.active).toBe(true);
    expect(frame.pit.holding).toBe(true);
    expect(frame.pit.progress).toBe(0.48);
    expect(frame.cars[0].inPit).toBe(true);

    sim.publish({ type: "pit:complete" });
    raf.step(650);
    frame = sim.getFrame();
    expect(frame.pit.active).toBe(true);
    expect(frame.pit.holding).toBe(false);
    expect(frame.pit.progress).toBeGreaterThan(0.48);

    raf.step(701);
    frame = sim.getFrame();
    expect(frame.pit.active).toBe(false);
    expect(frame.pit.rejoining).toBe(true);
    expect(frame.cars[0].inPit).toBe(false);
    expect(frame.cars[0].rejoining).toBe(true);

    raf.step(700);
    frame = sim.getFrame();
    expect(frame.pit.rejoining).toBe(false);
    expect(frame.cars[0].rejoining).toBe(false);

    sim.sync({
      phase: "pit",
      lap: 3,
      ledgerPosition: 6,
      pitState: "done",
    });
    expect(sim.getFrame().pit.active).toBe(false);
  });

  it("finishes the pit release if the controller advances to question first", () => {
    const { raf, sim } = createHarnessedSim();
    sim.sync({
      phase: "pit",
      lap: 3,
      ledgerPosition: 6,
      pitState: "running",
    });
    sim.start();
    raf.step(1_300);
    sim.publish({ type: "pit:complete" });

    sim.sync({
      phase: "question",
      lap: 3,
      ledgerPosition: 6,
      pitState: "none",
    });
    expect(sim.getFrame().phase).toBe("pit");

    raf.step(1_351);
    expect(sim.getFrame().pit.active).toBe(false);
    expect(sim.getFrame().pit.rejoining).toBe(true);
    expect(sim.getFrame().cars[0].inPit).toBe(false);
  });

  it("restarts pit hold and clears a prior rejoin when a new attempt enters", () => {
    const { raf, sim } = createHarnessedSim();
    sim.sync({
      phase: "pit",
      lap: 3,
      ledgerPosition: 6,
      pitState: "running",
    });
    sim.start();
    raf.step(1_300);
    sim.publish({ type: "pit:complete" });
    raf.step(1_351);
    expect(sim.getFrame().pit.rejoining).toBe(true);

    sim.publish({ type: "pit:enter" });
    let frame = sim.getFrame();
    expect(frame.pit.active).toBe(true);
    expect(frame.pit.rejoining).toBe(false);
    expect(frame.pit.progress).toBe(0);

    raf.step(1_300);
    frame = sim.getFrame();
    expect(frame.pit.holding).toBe(true);
    expect(frame.pit.progress).toBe(0.48);
  });

  it("scripts overtakes toward the supplied immutable ledger target", () => {
    const { raf, sim } = createHarnessedSim({ lapDurationMs: 1_000 });
    const snapshot = Object.freeze({
      phase: "lap" as const,
      lap: 0,
      ledgerPosition: 4 as const,
      lastAnswerCorrect: true,
      revision: "weekend-1",
    });

    sim.sync(snapshot);
    sim.start();
    raf.step(1_000);

    const frame = sim.getFrame();
    expect(snapshot).toEqual({
      phase: "lap",
      lap: 0,
      ledgerPosition: 4,
      lastAnswerCorrect: true,
      revision: "weekend-1",
    });
    expect(frame.order.indexOf(0) + 1).toBe(4);
    expect(frame.targetPosition).toBe(4);
    expect(frame.lap.active).toBe(false);
    expect(frame.phase).toBe("result");
    expect(Object.isFrozen(frame)).toBe(true);
    expect(Object.isFrozen(frame.cars)).toBe(true);
    expect(Object.isFrozen(frame.cars[0])).toBe(true);
  });

  it("releases and weaves the formation in staggered order", () => {
    const { raf, sim } = createHarnessedSim();
    sim.publish({ type: "formation:start" });
    sim.start();

    raf.step(1_000);
    const frame = sim.getFrame();
    const firstReleasedDriver = RACE_SIM_INITIAL_ORDER[0];
    const player = frame.cars[0];

    expect(frame.formation.active).toBe(true);
    expect(frame.absoluteProgress).toBeGreaterThan(0.985);
    expect(Math.abs(frame.cars[firstReleasedDriver].lateralOffset)).toBeGreaterThan(0);
    expect(player.progress).toBeLessThan(frame.cars[firstReleasedDriver].progress);
  });

  it("falls behind and fades the player on a DNF without moving game state", () => {
    const { raf, sim } = createHarnessedSim();
    sim.sync({
      phase: "dnf",
      lap: 6,
      ledgerPosition: "DNF",
    });
    sim.start();
    const before = sim.getFrame().cars[0].progress;

    raf.step(1_000);
    const frame = sim.getFrame();
    expect(frame.targetPosition).toBe("DNF");
    expect(frame.cars[0].position).toBe("DNF");
    expect(frame.cars[0].opacity).toBeLessThan(1);
    expect(frame.cars[0].progress).not.toBe(before);
  });
});
