import { describe, expect, it } from "vitest";

import {
  SEQUENCE_TIMINGS,
  createReactionTimeline,
  getPitRejoinDelayMs,
  scheduleReactionTimeline,
  scheduleV2LapTimeline,
} from "../timing";

const createFakeClock = () => {
  let now = 0;
  let nextId = 1;
  const queue = new Map<number, { at: number; callback: () => void }>();

  return {
    schedule: (callback: () => void, delayMs: number) => {
      const id = nextId;
      nextId += 1;
      queue.set(id, { at: now + delayMs, callback });
      return id;
    },
    cancel: (id: number) => queue.delete(id),
    advance: (elapsedMs: number) => {
      const end = now + elapsedMs;
      while (true) {
        const next = [...queue.entries()]
          .filter(([, item]) => item.at <= end)
          .sort((left, right) => left[1].at - right[1].at)[0];
        if (!next) break;
        queue.delete(next[0]);
        now = next[1].at;
        next[1].callback();
      }
      now = end;
    },
  };
};

describe("shared controller timing profiles", () => {
  it("keeps V1 and V2 reaction timing distinct and bounded", () => {
    expect(createReactionTimeline("v1", 0)).toEqual({
      lightAtMs: [700, 1400, 2100, 2800, 3500],
      goAtMs: 4400,
    });
    expect(createReactionTimeline("v1", 1).goAtMs).toBe(5300);
    expect(createReactionTimeline("v2", 0)).toEqual({
      lightAtMs: [340, 680, 1020, 1360, 1700],
      goAtMs: 2600,
    });
    expect(createReactionTimeline("v2", 1).goAtMs).toBe(3400);
    expect(SEQUENCE_TIMINGS.v2.formationLockMs).toBe(470);
    expect(SEQUENCE_TIMINGS.v2.launchMs).toBe(1500);
  });

  it("does not retime an active sequence when the visible skin changes", () => {
    const clock = createFakeClock();
    const events: string[] = [];
    let visibleSkin: "v1" | "v2" = "v2";
    const activeTimeline = createReactionTimeline(visibleSkin, 0);
    scheduleReactionTimeline(activeTimeline, clock.schedule, {
      onLight: (count) => events.push(`light-${count}`),
      onGo: () => events.push("go"),
    });

    visibleSkin = "v1";
    expect(visibleSkin).toBe("v1");
    clock.advance(2599);
    expect(events).toEqual([
      "light-1",
      "light-2",
      "light-3",
      "light-4",
      "light-5",
    ]);
    clock.advance(1);
    expect(events.at(-1)).toBe("go");
  });

  it("cancels the remaining lights and go callback after a jump start", () => {
    const clock = createFakeClock();
    const events: string[] = [];
    const timers = scheduleReactionTimeline(
      createReactionTimeline("v2", 0),
      clock.schedule,
      {
        onLight: (count) => events.push(`light-${count}`),
        onGo: () => events.push("go"),
      },
    );

    clock.advance(700);
    timers.forEach(clock.cancel);
    clock.advance(4000);
    expect(events).toEqual(["light-1", "light-2"]);
  });

  it("plays a V2 lap for 4.4s, then holds its verdict for 2.1s", () => {
    const clock = createFakeClock();
    const events: string[] = [];
    scheduleV2LapTimeline(clock.schedule, {
      onReveal: () => events.push("reveal"),
      onAdvance: () => events.push("advance"),
    });

    clock.advance(4399);
    expect(events).toEqual([]);
    clock.advance(1);
    expect(events).toEqual(["reveal"]);
    clock.advance(2099);
    expect(events).toEqual(["reveal"]);
    clock.advance(1);
    expect(events).toEqual(["reveal", "advance"]);
  });

  it("preserves the pit hold/rejoin window independently of penalties", () => {
    expect(getPitRejoinDelayMs(200)).toBe(2350);
    expect(getPitRejoinDelayMs(1200)).toBe(1350);
    expect(getPitRejoinDelayMs(4200)).toBe(1350);
  });
});
