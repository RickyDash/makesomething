export const MONZA_MAIN_TRACK_PATH_D =
  "M 740,452 L 415,452 L 404,437 L 388,443 L 300,450 C 230,454 182,448 176,406 L 168,262 L 157,243 L 137,239 L 130,220 L 112,152 C 102,98 118,72 152,65 L 196,58 C 222,53 236,62 246,82 L 448,318 C 458,330 450,348 470,351 C 490,354 487,325 507,321 C 527,317 533,337 546,352 L 878,352 C 950,352 976,366 972,402 C 968,436 930,452 878,452 Z";

export const MONZA_PIT_LANE_PATH_D =
  "M 856,450 C 828,443 812,434 786,432 L 560,432 C 538,432 524,442 506,450";

export const RACE_SIM_DRIVER_CODES = [
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
] as const;

export type RaceSimDriverCode = (typeof RACE_SIM_DRIVER_CODES)[number];
export type RaceSimDriverIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type RacePosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const RACE_SIM_INITIAL_ORDER = [1, 4, 2, 6, 3, 5, 7, 8, 9, 0] as const satisfies
  readonly RaceSimDriverIndex[];

export type RaceSimPhase =
  | "grid"
  | "formation"
  | "forming"
  | "lights"
  | "go"
  | "jump"
  | "reacted"
  | "launch"
  | "question"
  | "lap"
  | "result"
  | "pit"
  | "dnf"
  | "finish";

export type RaceSimPitState = "none" | "idle" | "running" | "done";

export type RaceSimGameSnapshot = Readonly<{
  phase: RaceSimPhase;
  lap: number;
  ledgerPosition: RacePosition | "DNF";
  lastAnswerCorrect?: boolean | null;
  formationSector?: 0 | 1 | 2 | 3;
  pitState?: RaceSimPitState;
  revision?: number | string;
}>;

export type RaceSimSemanticEvent =
  | Readonly<{ type: "reset" }>
  | Readonly<{ type: "formation:start" }>
  | Readonly<{ type: "formation:advance"; sector: 1 | 2 | 3 }>
  | Readonly<{ type: "formation:finish"; rushed?: boolean }>
  | Readonly<{ type: "launch" }>
  | Readonly<{
      type: "lap:start";
      lap: number;
      targetPosition: RacePosition;
      correct: boolean;
      durationMs?: number;
      revision?: number | string;
    }>
  | Readonly<{ type: "lap:skip" }>
  | Readonly<{ type: "pit:enter" }>
  | Readonly<{ type: "pit:complete" }>
  | Readonly<{ type: "dnf" }>;

export type RaceSimTrackSample = Readonly<{
  x: number;
  y: number;
  tangentX: number;
  tangentY: number;
}>;

export type RaceSimGeometrySampler = Readonly<{
  mainLength: number;
  pitLength: number;
  sampleMain(progress: number): RaceSimTrackSample;
  samplePit(progress: number): RaceSimTrackSample;
}>;

export type SvgPathLike = Readonly<{
  getTotalLength(): number;
  getPointAtLength(distance: number): Readonly<{ x: number; y: number }>;
}>;

export type RaceSimFrameHandle = unknown;

export type RaceSimDependencies = Readonly<{
  now?: () => number;
  requestFrame?: (callback: (timestampMs: number) => void) => RaceSimFrameHandle;
  cancelFrame?: (handle: RaceSimFrameHandle) => void;
  geometry?: RaceSimGeometrySampler;
  random?: () => number;
  lapDurationMs?: number;
  drama?: 0 | 1 | 2;
}>;

export type RaceSimCarFrame = Readonly<{
  driverIndex: RaceSimDriverIndex;
  code: RaceSimDriverCode;
  position: RacePosition | "DNF";
  visualSlot: number;
  progress: number;
  x: number;
  y: number;
  heading: number;
  lateralOffset: number;
  opacity: number;
  inPit: boolean;
  rejoining: boolean;
}>;

export type RaceSimFrame = Readonly<{
  timestampMs: number;
  deltaSeconds: number;
  running: boolean;
  phase: RaceSimPhase;
  progress: number;
  absoluteProgress: number;
  gap: number;
  targetPosition: RacePosition | "DNF";
  order: readonly RaceSimDriverIndex[];
  cars: readonly RaceSimCarFrame[];
  formation: Readonly<{
    active: boolean;
    holding: boolean;
    arrived: boolean;
    targetProgress: number | null;
  }>;
  lap: Readonly<{
    active: boolean;
    index: number | null;
    progress: number;
    targetPosition: RacePosition | null;
  }>;
  pit: Readonly<{
    active: boolean;
    holding: boolean;
    rejoining: boolean;
    progress: number | null;
  }>;
}>;

export type RaceSim = Readonly<{
  start(): void;
  destroy(): void;
  sync(snapshot: RaceSimGameSnapshot): void;
  publish(event: RaceSimSemanticEvent): void;
  getFrame(): RaceSimFrame;
  subscribe(listener: (frame: RaceSimFrame) => void): () => void;
}>;

type NormalizedSnapshot = Readonly<{
  phase: RaceSimPhase;
  lap: number;
  ledgerPosition: RacePosition | "DNF";
  lastAnswerCorrect: boolean | null;
  formationSector: 0 | 1 | 2 | 3;
  pitState: RaceSimPitState;
  revision: number | string;
}>;

type LapMove = "gain" | "lose";

type LapEvent =
  | Readonly<{ t: number; type: LapMove; background?: false }>
  | Readonly<{ t: number; background: true; type?: undefined }>;

type LapAnimation = {
  startedAt: number;
  durationMs: number;
  baseProgress: number;
  events: readonly LapEvent[];
  eventIndex: number;
  correct: boolean;
  previousPosition: RacePosition;
  targetPosition: RacePosition;
  lap: number;
};

type FormationAnimation = {
  startedAt: number;
  startProgress: number;
  limit: number;
  speed: number;
  holding: boolean;
  holdStartedAt: number | null;
  arrived: boolean;
  rushed: boolean;
  collapseStartedAt: number | null;
  releaseDeficits: Float64Array;
  carArc: Float64Array;
  carVelocity: Float64Array;
  bunchSmooth: Float64Array;
  weaveSmooth: Float64Array;
};

type PitAnimation = {
  startedAt: number;
  doneElapsedSeconds: number | null;
};

type RejoinAnimation = {
  startedAt: number;
  from: RaceSimTrackSample;
};

const DRIVER_INDICES = RACE_SIM_DRIVER_CODES.map((_, index) => index as RaceSimDriverIndex);
const FORMATION_GAP = 0.0075;
const RACE_GAP = 0.0155;
const INITIAL_PROGRESS = 0.985;
const DEFAULT_LAP_DURATION_MS = 4_400;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const wrapProgress = (value: number) => ((value % 1) + 1) % 1;

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const normalizeVector = (x: number, y: number) => {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
};

const toPosition = (value: number): RacePosition =>
  Math.round(clamp(value, 1, 10)) as RacePosition;

const normalizeSnapshot = (snapshot: RaceSimGameSnapshot): NormalizedSnapshot =>
  Object.freeze({
    phase: snapshot.phase,
    lap: Math.max(0, Math.floor(snapshot.lap)),
    ledgerPosition:
      snapshot.ledgerPosition === "DNF" ? "DNF" : toPosition(snapshot.ledgerPosition),
    lastAnswerCorrect: snapshot.lastAnswerCorrect ?? null,
    formationSector: clamp(
      Math.floor(snapshot.formationSector ?? 0),
      0,
      3,
    ) as NormalizedSnapshot["formationSector"],
    pitState: snapshot.pitState ?? (snapshot.phase === "pit" ? "idle" : "none"),
    revision: snapshot.revision ?? 0,
  });

const createDefaultGeometry = (): RaceSimGeometrySampler =>
  Object.freeze({
    mainLength: 1_000,
    pitLength: 350,
    sampleMain: (progress: number) =>
      Object.freeze({
        x: wrapProgress(progress) * 1_000,
        y: 0,
        tangentX: 1,
        tangentY: 0,
      }),
    samplePit: (progress: number) =>
      Object.freeze({
        x: clamp(progress, 0, 1) * 350,
        y: 1,
        tangentX: 1,
        tangentY: 0,
      }),
  });

const createSvgPathSampleTable = (
  path: SvgPathLike,
  length: number,
  segmentCount: number,
  wraps: boolean,
) => {
  const coordinates = new Float64Array((segmentCount + 1) * 2);

  // Reading SVG path geometry can synchronously flush layout. Sample it once
  // when the sim is created so the persistent RAF remains read-free.
  for (let index = 0; index <= segmentCount; index += 1) {
    const point = path.getPointAtLength((index / segmentCount) * length);
    coordinates[index * 2] = point.x;
    coordinates[index * 2 + 1] = point.y;
  }

  const samplePoint = (progress: number) => {
    const safeProgress = wraps ? wrapProgress(progress) : clamp(progress, 0, 1);
    const scaled = safeProgress * segmentCount;
    const index = Math.min(segmentCount - 1, Math.floor(scaled));
    const fraction = scaled - index;
    const nextIndex = index + 1;
    const coordinateIndex = index * 2;
    const nextCoordinateIndex = nextIndex * 2;

    return {
      x:
        coordinates[coordinateIndex] +
        (coordinates[nextCoordinateIndex] - coordinates[coordinateIndex]) * fraction,
      y:
        coordinates[coordinateIndex + 1] +
        (coordinates[nextCoordinateIndex + 1] - coordinates[coordinateIndex + 1]) *
          fraction,
    };
  };

  return (progress: number): RaceSimTrackSample => {
    const safeProgress = wraps ? wrapProgress(progress) : clamp(progress, 0, 1);
    const point = samplePoint(safeProgress);
    const next = samplePoint(
      wraps
        ? wrapProgress(safeProgress + 0.004)
        : clamp(safeProgress + 0.004, 0, 1),
    );
    const tangent = normalizeVector(next.x - point.x, next.y - point.y);

    return Object.freeze({
      x: point.x,
      y: point.y,
      tangentX: tangent.x,
      tangentY: tangent.y,
    });
  };
};

export const createSvgPathGeometrySampler = (
  mainPath: SvgPathLike,
  pitPath: SvgPathLike,
): RaceSimGeometrySampler => {
  const mainLength = mainPath.getTotalLength();
  const pitLength = pitPath.getTotalLength();
  const sampleMain = createSvgPathSampleTable(mainPath, mainLength, 1_024, true);
  const samplePit = createSvgPathSampleTable(pitPath, pitLength, 256, false);

  return Object.freeze({
    mainLength,
    pitLength,
    sampleMain,
    samplePit,
  });
};

const createFloatArray = (fill = 0) => {
  const values = new Float64Array(RACE_SIM_DRIVER_CODES.length);
  values.fill(fill);
  return values;
};

const createFormationAnimation = (now: number, progress: number): FormationAnimation => ({
  startedAt: now,
  startProgress: progress,
  limit: progress + 1 / 3 - 0.03,
  speed: 0,
  holding: false,
  holdStartedAt: null,
  arrived: false,
  rushed: false,
  collapseStartedAt: null,
  releaseDeficits: createFloatArray(),
  carArc: createFloatArray(Number.NaN),
  carVelocity: createFloatArray(),
  bunchSmooth: createFloatArray(),
  weaveSmooth: createFloatArray(Number.NaN),
});

const createInitialSnapshot = (): NormalizedSnapshot =>
  normalizeSnapshot({
    phase: "grid",
    lap: 0,
    ledgerPosition: 10,
    formationSector: 0,
    pitState: "none",
    revision: 0,
  });

const createInitialSlots = (order: readonly RaceSimDriverIndex[]) =>
  Float64Array.from(DRIVER_INDICES, (driver) => order.indexOf(driver));

export const createRaceSim = (dependencies: RaceSimDependencies = {}): RaceSim => {
  const now = dependencies.now ?? (() => performance.now());
  const random = dependencies.random ?? Math.random;
  const geometry = dependencies.geometry ?? createDefaultGeometry();
  const lapDurationMs = Math.max(1, dependencies.lapDurationMs ?? DEFAULT_LAP_DURATION_MS);
  const drama = dependencies.drama ?? 1;

  const requestFrame =
    dependencies.requestFrame ??
    ((callback: (timestampMs: number) => void): RaceSimFrameHandle => {
      if (typeof globalThis.requestAnimationFrame === "function") {
        return globalThis.requestAnimationFrame(callback);
      }
      return globalThis.setTimeout(() => callback(now()), 16);
    });

  const cancelFrame =
    dependencies.cancelFrame ??
    ((handle: RaceSimFrameHandle) => {
      if (typeof globalThis.cancelAnimationFrame === "function" && typeof handle === "number") {
        globalThis.cancelAnimationFrame(handle);
        return;
      }
      globalThis.clearTimeout(handle as number);
    });

  let game = createInitialSnapshot();
  let visualPhase: RaceSimPhase = "grid";
  let targetPosition: RacePosition | "DNF" = 10;
  let order = [...RACE_SIM_INITIAL_ORDER] as RaceSimDriverIndex[];
  let visualSlots = createInitialSlots(order);
  let absoluteProgress = INITIAL_PROGRESS;
  let gap = FORMATION_GAP;
  let lap: LapAnimation | null = null;
  let formation: FormationAnimation | null = null;
  let pit: PitAnimation | null = null;
  let rejoin: RejoinAnimation | null = null;
  let dnf = false;
  let dnfLag = 0;
  let launchStartedAt = 0;
  let lastLapKey: string | null = null;
  let lastPitKey: string | null = null;
  let lastTimestamp = now();
  let running = false;
  let destroyed = false;
  let rafHandle: RaceSimFrameHandle | null = null;
  const listeners = new Set<(frame: RaceSimFrame) => void>();

  const getPlayerPosition = (): RacePosition => toPosition(order.indexOf(0) + 1);

  const makeLapKey = (
    revision: number | string,
    lapIndex: number,
    nextPosition: RacePosition,
  ) => `${String(revision)}:${lapIndex}:${nextPosition}`;

  const validMoves = (previousPosition: RacePosition, moves: readonly LapMove[]) => {
    let position = previousPosition;
    for (const move of moves) {
      position += move === "gain" ? -1 : 1;
      if (position < 1 || position > 10) return false;
    }
    return true;
  };

  const buildLapScript = (
    previousPosition: RacePosition,
    nextPosition: RacePosition,
    correct: boolean,
  ): readonly LapEvent[] => {
    const net = previousPosition - nextPosition;
    let moves: LapMove[] = [];

    if (correct) {
      moves = Array.from({ length: Math.max(0, net) }, () => "gain" as const);
      if (net === 0) {
        moves = ["lose", "gain"];
      } else if (drama > 0 && random() < 0.65) {
        const candidate = [...moves];
        candidate.splice(1, 0, "lose");
        candidate.push("gain");
        if (validMoves(previousPosition, candidate)) moves = candidate;
      }
    } else {
      moves = Array.from({ length: Math.max(0, -net) }, () => "lose" as const);
      if (net === 0) {
        moves = ["gain", "lose"];
      } else if (drama > 0 && random() < 0.6) {
        const candidate: LapMove[] = ["gain", ...moves, "lose"];
        if (validMoves(previousPosition, candidate)) moves = candidate;
      }
    }

    if (!validMoves(previousPosition, moves)) {
      moves =
        net >= 0
          ? Array.from({ length: net }, () => "gain" as const)
          : Array.from({ length: -net }, () => "lose" as const);
    }

    const anchors = [0.07, 0.23, 0.36, 0.55, 0.78, 0.93] as const;
    let times: number[];

    if (moves.length <= anchors.length) {
      const step = anchors.length / Math.max(1, moves.length);
      const used = new Set<number>();
      times = moves.map((_, moveIndex) => {
        let anchorIndex = Math.min(
          anchors.length - 1,
          Math.floor(moveIndex * step + random() * step),
        );
        while (used.has(anchorIndex)) anchorIndex = (anchorIndex + 1) % anchors.length;
        used.add(anchorIndex);
        return clamp(anchors[anchorIndex] + (random() - 0.5) * 0.03, 0.05, 0.95);
      });
      times.sort((left, right) => left - right);
    } else {
      times = moves.map(
        (_, moveIndex) => 0.08 + 0.84 * (moveIndex / Math.max(1, moves.length - 1)),
      );
    }

    const events: LapEvent[] = moves.map((move, moveIndex) =>
      Object.freeze({ t: times[moveIndex], type: move }),
    );
    const backgroundEventCount = 1 + (random() < 0.5 ? 1 : 0);
    for (let eventIndex = 0; eventIndex < backgroundEventCount; eventIndex += 1) {
      events.push(Object.freeze({ t: 0.15 + random() * 0.7, background: true }));
    }

    return Object.freeze(events.sort((left, right) => left.t - right.t));
  };

  const movePlayerTo = (position: RacePosition) => {
    const currentIndex = order.indexOf(0);
    const targetIndex = position - 1;
    if (currentIndex === targetIndex) return;
    order.splice(currentIndex, 1);
    order.splice(targetIndex, 0, 0);
  };

  const applyLapEvent = (event: LapEvent) => {
    const swap = (index: number) => {
      const first = order[index];
      order[index] = order[index + 1];
      order[index + 1] = first;
    };

    if (event.background) {
      const playerIndex = order.indexOf(0);
      const candidates: number[] = [];
      for (let index = 0; index < order.length - 1; index += 1) {
        if (index !== playerIndex && index + 1 !== playerIndex) candidates.push(index);
      }
      if (candidates.length > 0) {
        swap(candidates[Math.floor(random() * candidates.length)]);
      }
      return;
    }

    const playerIndex = order.indexOf(0);
    if (event.type === "gain" && playerIndex > 0) swap(playerIndex - 1);
    if (event.type === "lose" && playerIndex < order.length - 1) swap(playerIndex);
  };

  const completeLap = () => {
    if (!lap) return;
    while (lap.eventIndex < lap.events.length) {
      applyLapEvent(lap.events[lap.eventIndex]);
      lap.eventIndex += 1;
    }
    movePlayerTo(lap.targetPosition);
    targetPosition = lap.targetPosition;
    lap = null;
    visualPhase = "result";
  };

  const startLap = (
    lapIndex: number,
    nextPosition: RacePosition,
    correct: boolean,
    duration: number,
    revision: number | string,
  ) => {
    const key = makeLapKey(revision, lapIndex, nextPosition);
    if (key === lastLapKey) {
      visualPhase = lap ? "lap" : "result";
      return;
    }

    const previousPosition = getPlayerPosition();
    lap = {
      startedAt: now(),
      durationMs: Math.max(1, duration),
      baseProgress: absoluteProgress,
      events: buildLapScript(previousPosition, nextPosition, correct),
      eventIndex: 0,
      correct,
      previousPosition,
      targetPosition: nextPosition,
      lap: Math.max(0, Math.floor(lapIndex)),
    };
    lastLapKey = key;
    targetPosition = nextPosition;
    visualPhase = "lap";
  };

  const startFormation = () => {
    if (!formation) formation = createFormationAnimation(now(), absoluteProgress);
    visualPhase = "formation";
  };

  const advanceFormation = (sector: 1 | 2 | 3) => {
    startFormation();
    if (!formation) return;
    formation.holding = false;
    formation.holdStartedAt = null;
    formation.limit =
      sector >= 3
        ? formation.startProgress + 1
        : formation.startProgress + (sector + 1) / 3 - 0.03;
  };

  const finishFormation = (rushed = false) => {
    startFormation();
    if (!formation) return;
    formation.limit = formation.startProgress + 1;
    formation.rushed = rushed;
    visualPhase = "forming";
  };

  const enterPit = (restart = false) => {
    if (restart || !pit) {
      pit = {
        startedAt: now(),
        doneElapsedSeconds: null,
      };
      rejoin = null;
    }
    visualPhase = "pit";
  };

  const completePit = () => {
    if (!pit || pit.doneElapsedSeconds !== null) return;
    pit.doneElapsedSeconds = Math.max(1.2, (now() - pit.startedAt) / 1_000);
  };

  const beginDnf = () => {
    dnf = true;
    targetPosition = "DNF";
    visualPhase = "dnf";
  };

  const resetMotion = () => {
    visualPhase = "grid";
    targetPosition = 10;
    order = [...RACE_SIM_INITIAL_ORDER] as RaceSimDriverIndex[];
    visualSlots = createInitialSlots(order);
    absoluteProgress = INITIAL_PROGRESS;
    gap = FORMATION_GAP;
    lap = null;
    formation = null;
    pit = null;
    rejoin = null;
    dnf = false;
    dnfLag = 0;
    launchStartedAt = 0;
    lastLapKey = null;
    lastPitKey = null;
  };

  const getSlotsByDriver = () => {
    const slots = new Int8Array(RACE_SIM_DRIVER_CODES.length);
    order.forEach((driver, slot) => {
      slots[driver] = slot;
    });
    return slots;
  };

  const getFormationLag = (
    driver: RaceSimDriverIndex,
    slot: number,
    timestamp: number,
    deltaSeconds: number,
  ) => {
    if (!formation) return 0;

    const releaseAt = formation.startedAt + 400 + slot * 240;
    const travelled = absoluteProgress - formation.startProgress;
    let lag: number;

    if (timestamp <= releaseAt) {
      formation.releaseDeficits[driver] = travelled;
      lag = travelled;
    } else {
      const releaseDeficit = formation.releaseDeficits[driver] || 0;
      const releaseProgress = Math.min(1, (timestamp - releaseAt) / 1_100);
      lag =
        releaseDeficit +
        (slot * 0.015 - releaseDeficit) * (1 - Math.pow(1 - releaseProgress, 3));
    }

    const distanceToLimit = Math.max(0, formation.limit - absoluteProgress);
    const closeFactor = easeInOutCubic(clamp(1 - distanceToLimit / 0.14, 0, 1));
    let bunchTarget = 0;

    if (closeFactor > 0) {
      bunchTarget = slot * 0.015 * 0.85 * closeFactor;
      if (formation.holdStartedAt !== null) {
        const seconds = timestamp / 1_000;
        const heldRatio = Math.min(1, (timestamp - formation.holdStartedAt) / 1_200);
        bunchTarget *=
          1 - 0.18 * heldRatio * (0.5 + 0.5 * Math.sin(seconds * 0.55 - slot * 0.7));
      }
    }

    const bunchAlpha = Math.min(1, Math.max(0.001, deltaSeconds) * 3);
    formation.bunchSmooth[driver] +=
      (bunchTarget - formation.bunchSmooth[driver]) * bunchAlpha;
    lag -= formation.bunchSmooth[driver];

    if (formation.collapseStartedAt !== null) {
      const collapseProgress = Math.min(
        1,
        (timestamp - formation.collapseStartedAt) / 650,
      );
      lag *= 1 - easeInOutCubic(collapseProgress);
    }

    return lag;
  };

  const getFormationWeave = (
    driver: RaceSimDriverIndex,
    slot: number,
    timestamp: number,
    arc: number,
    deltaSeconds: number,
  ) => {
    if (!formation || (visualPhase !== "formation" && visualPhase !== "forming")) {
      return { lateralOffset: 0, yaw: 0 };
    }

    const releaseAt = formation.startedAt + 400 + slot * 240;
    const releaseRatio = clamp((timestamp - releaseAt) / 300, 0, 1);
    if (releaseRatio <= 0) return { lateralOffset: 0, yaw: 0 };

    const velocity = formation.carVelocity[driver] || formation.speed;
    const weaveTarget = Math.min(1, velocity / 0.006);
    const previousWeave = Number.isNaN(formation.weaveSmooth[driver])
      ? weaveTarget
      : formation.weaveSmooth[driver];
    const weaveStrength =
      previousWeave +
      (weaveTarget - previousWeave) * Math.min(1, Math.max(0.001, deltaSeconds) * 3.5);
    formation.weaveSmooth[driver] = weaveStrength;
    if (weaveStrength <= 0.03) return { lateralOffset: 0, yaw: 0 };

    const tangent = geometry.sampleMain(arc);
    const futureTangent = geometry.sampleMain(arc + 0.014);
    let curvature =
      Math.atan2(futureTangent.tangentY, futureTangent.tangentX) -
      Math.atan2(tangent.tangentY, tangent.tangentX);
    while (curvature > Math.PI) curvature -= Math.PI * 2;
    while (curvature < -Math.PI) curvature += Math.PI * 2;

    const straightFactor = clamp(1 - Math.abs(curvature) / 0.34, 0, 1);
    if (straightFactor <= 0.02) return { lateralOffset: 0, yaw: 0 };

    const seconds = timestamp / 1_000;
    const group = Math.floor((driver + Math.floor(seconds / 6)) / 3);
    const groupHash = ((group * 53) % 17) / 17;
    const period = 2.55 + groupHash;
    const activeRatio = 0.58;
    const offset =
      (((group * 0.41) % 1) + 1) % 1 + (((driver * 0.13) % 1) - 0.5) * 0.05;
    const direction = (group * 131) % 2 ? 1 : -1;
    const driverHash = ((driver * 73) % 17) / 17;
    const amplitude =
      (driver === 0 ? 7.5 : 4.5 + 2.5 * driverHash) *
      (0.9 + 0.2 * ((driver * 0.29) % 1));
    const drive = releaseRatio * weaveStrength * straightFactor;

    const shape = (time: number) => {
      const cycle = ((((time / period + offset) % 1) + 1) % 1);
      if (cycle >= activeRatio) return 0;
      const unit = cycle / activeRatio;
      return Math.sin(unit * 2 * Math.PI) * Math.pow(Math.sin(unit * Math.PI), 2) * 2;
    };

    const carRelativeProgress = formation.carArc[driver] - formation.startProgress;
    const launchZone =
      formation.collapseStartedAt === null && carRelativeProgress < 1 / 6
        ? Math.min(1, (1 / 6 - Math.max(carRelativeProgress, 0)) / 0.03)
        : 0;
    const crossFactor = 0.7;
    const crossPhase = (2 * Math.PI * carRelativeProgress) / 0.045;
    const crossWave = (slot % 2 ? -1 : 1) * Math.sin(crossPhase);

    const lateralAt = (time: number) => {
      let normal = amplitude * drive * direction * shape(time);
      normal =
        10 * releaseRatio * weaveStrength * straightFactor * crossWave * crossFactor +
        normal * (1 - crossFactor);
      if (launchZone <= 0) return normal;
      return (
        10.5 * releaseRatio * weaveStrength * straightFactor * crossWave * launchZone +
        normal * (1 - launchZone)
      );
    };

    const lateralOffset = lateralAt(seconds);
    const lateralVelocity = (lateralAt(seconds + 0.05) - lateralOffset) / 0.05;
    const forwardVelocity = Math.max(28, formation.speed * geometry.mainLength);
    let yaw = (Math.atan2(lateralVelocity, forwardVelocity) * 180 * 1.05) / Math.PI;
    const geometryFactor = Math.max(launchZone, crossFactor);

    if (geometryFactor > 0) {
      const yawAmplitude = launchZone > 0 ? 10.5 : 10;
      const slope =
        (yawAmplitude *
          (slot % 2 ? -1 : 1) *
          (2 * Math.PI / 0.045) *
          Math.cos(crossPhase)) /
        geometry.mainLength;
      const geometricYaw =
        ((Math.atan(slope) * 180) / Math.PI) *
        1.15 *
        weaveStrength *
        straightFactor;
      yaw = geometricYaw * geometryFactor + yaw * (1 - geometryFactor);
    }

    return {
      lateralOffset,
      yaw: clamp(yaw, -26, 26),
    };
  };

  const getPitProgress = (timestamp: number) => {
    if (!pit) return null;
    const elapsedSeconds = (timestamp - pit.startedAt) / 1_000;
    const doneElapsed =
      pit.doneElapsedSeconds === null ? Number.POSITIVE_INFINITY : pit.doneElapsedSeconds;

    if (elapsedSeconds < 1.2) {
      return easeInOutCubic(elapsedSeconds / 1.2) * 0.48;
    }
    if (elapsedSeconds < doneElapsed) return 0.48;
    return (
      0.48 +
      easeInOutCubic(Math.min(1, (elapsedSeconds - doneElapsed) / 1.3)) * 0.52
    );
  };

  const buildFrame = (timestamp: number, deltaSeconds: number): RaceSimFrame => {
    const slotsByDriver = getSlotsByDriver();
    const cars: RaceSimCarFrame[] = [];

    for (const driver of DRIVER_INDICES) {
      const slot = slotsByDriver[driver];
      let inPit = false;
      let rejoining = false;
      let lateralOffset = 0;
      let heading: number;
      let point: RaceSimTrackSample;
      let carProgress: number;

      if (driver === 0 && pit) {
        inPit = true;
        const pitProgress = getPitProgress(timestamp) ?? 0;
        point = geometry.samplePit(pitProgress);
        carProgress = pitProgress;
        heading = 180;
      } else {
        let lag = driver === 0 && dnf ? dnfLag : 0;
        lag += getFormationLag(driver, slot, timestamp, deltaSeconds);

        if (formation) {
          const safeDelta = Math.max(0.001, deltaSeconds);
          const rawArc = absoluteProgress - lag;
          const previousArc = formation.carArc[driver];
          const relaxed = formation.holdStartedAt !== null;
          const carArc = Number.isNaN(previousArc)
            ? rawArc
            : relaxed
              ? Math.max(previousArc - 0.004 * safeDelta, rawArc)
              : Math.max(previousArc, rawArc);
          formation.carArc[driver] = carArc;
          formation.carVelocity[driver] = Number.isNaN(previousArc)
            ? 1
            : Math.max(0, (carArc - previousArc) / safeDelta);
          lag = absoluteProgress - carArc;
        }

        carProgress = wrapProgress(absoluteProgress - visualSlots[driver] * gap - lag);
        point = geometry.sampleMain(carProgress);
        heading = (Math.atan2(point.tangentY, point.tangentX) * 180) / Math.PI;

        const weave = getFormationWeave(
          driver,
          slot,
          timestamp,
          carProgress,
          deltaSeconds,
        );
        lateralOffset = weave.lateralOffset;
        heading += weave.yaw;
        point = Object.freeze({
          ...point,
          x: point.x - point.tangentY * lateralOffset,
          y: point.y + point.tangentX * lateralOffset,
        });

        if (driver === 0 && rejoin) {
          const rejoinProgress = Math.min(1, (timestamp - rejoin.startedAt) / 700);
          const easedProgress = easeInOutCubic(rejoinProgress);
          point = Object.freeze({
            ...point,
            x: rejoin.from.x + (point.x - rejoin.from.x) * easedProgress,
            y: rejoin.from.y + (point.y - rejoin.from.y) * easedProgress,
          });
          rejoining = rejoinProgress < 1;
          if (rejoinProgress >= 1) rejoin = null;
        }
      }

      cars.push(
        Object.freeze({
          driverIndex: driver,
          code: RACE_SIM_DRIVER_CODES[driver],
          position: driver === 0 && dnf ? "DNF" : toPosition(slot + 1),
          visualSlot: visualSlots[driver],
          progress: wrapProgress(carProgress),
          x: point.x,
          y: point.y,
          heading,
          lateralOffset,
          opacity: driver === 0 && dnf ? Math.max(0.35, 1 - dnfLag * 10) : 1,
          inPit,
          rejoining,
        }),
      );
    }

    const pitProgress = getPitProgress(timestamp);
    const lapProgress = lap
      ? clamp((timestamp - lap.startedAt) / lap.durationMs, 0, 1)
      : 0;

    return Object.freeze({
      timestampMs: timestamp,
      deltaSeconds,
      running,
      phase: visualPhase,
      progress: wrapProgress(absoluteProgress),
      absoluteProgress,
      gap,
      targetPosition,
      order: Object.freeze([...order]),
      cars: Object.freeze(cars),
      formation: Object.freeze({
        active: formation !== null,
        holding: formation?.holding ?? false,
        arrived: formation?.arrived ?? false,
        targetProgress: formation ? wrapProgress(formation.limit) : null,
      }),
      lap: Object.freeze({
        active: lap !== null,
        index: lap?.lap ?? null,
        progress: lapProgress,
        targetPosition: lap?.targetPosition ?? null,
      }),
      pit: Object.freeze({
        active: pit !== null,
        holding: pitProgress === 0.48 && pit?.doneElapsedSeconds === null,
        rejoining: rejoin !== null,
        progress: pitProgress,
      }),
    });
  };

  let frame = buildFrame(lastTimestamp, 0);

  const emitFrame = (timestamp = now(), deltaSeconds = 0) => {
    frame = buildFrame(timestamp, deltaSeconds);
    for (const listener of [...listeners]) listener(frame);
  };

  const advance = (timestamp: number) => {
    const deltaSeconds = Math.min(
      0.05,
      Math.max(0, (timestamp - lastTimestamp) / 1_000),
    );
    lastTimestamp = timestamp;

    const preRace =
      visualPhase === "grid" ||
      visualPhase === "formation" ||
      visualPhase === "forming" ||
      visualPhase === "lights" ||
      visualPhase === "go" ||
      visualPhase === "jump" ||
      visualPhase === "reacted";
    const targetGap = preRace ? FORMATION_GAP : RACE_GAP;
    gap += (targetGap - gap) * Math.min(1, deltaSeconds * 1.2);

    if (visualPhase === "lap" && lap) {
      const lapProgress = Math.min(1, (timestamp - lap.startedAt) / lap.durationMs);
      while (
        lap.eventIndex < lap.events.length &&
        lap.events[lap.eventIndex].t <= lapProgress
      ) {
        applyLapEvent(lap.events[lap.eventIndex]);
        lap.eventIndex += 1;
      }
      absoluteProgress = lap.baseProgress + easeInOutCubic(lapProgress);
      if (lapProgress >= 1) completeLap();
    } else if (visualPhase === "pit" && pit) {
      absoluteProgress += deltaSeconds * 0.045;
      const elapsedSeconds = (timestamp - pit.startedAt) / 1_000;
      const doneElapsed =
        pit.doneElapsedSeconds === null ? null : Math.max(1.2, pit.doneElapsedSeconds);
      if (doneElapsed !== null && elapsedSeconds >= doneElapsed + 1.35) {
        const exitPoint = geometry.samplePit(
          0.48 +
            easeInOutCubic(
              Math.min(1, (doneElapsed + 1.34 - doneElapsed) / 1.3),
            ) *
              0.52,
        );
        rejoin = { startedAt: timestamp, from: exitPoint };
        pit = null;
        visualPhase = "question";
      }
    } else if (visualPhase === "launch") {
      const launchProgress = Math.min(1, (timestamp - launchStartedAt) / 1_400);
      absoluteProgress += deltaSeconds * 0.3 * launchProgress;
    } else if (visualPhase === "dnf") {
      dnfLag += deltaSeconds * 0.05;
      absoluteProgress += deltaSeconds * 0.02;
    } else if (
      (visualPhase === "formation" || visualPhase === "forming") &&
      formation
    ) {
      const distanceToLimit = Math.max(0, formation.limit - absoluteProgress);
      const relativeProgress = absoluteProgress - formation.startProgress;
      const holdingNow = visualPhase === "formation" && distanceToLimit <= 0.0008;
      if (holdingNow && formation.holdStartedAt === null) {
        formation.holdStartedAt = timestamp;
      }
      if (!holdingNow && formation.holdStartedAt !== null) {
        formation.holdStartedAt = null;
      }
      formation.holding = holdingNow;

      let targetSpeed = 0;
      if (distanceToLimit <= 0.0004) {
        if (visualPhase === "forming" && !formation.arrived) {
          if (formation.collapseStartedAt === null) {
            formation.collapseStartedAt = timestamp;
          } else if (timestamp - formation.collapseStartedAt > 700) {
            formation.arrived = true;
          }
        }
      } else if ((timestamp - formation.startedAt) / 1_000 >= 0.4) {
        const launchCruise = 0.032 * 7;
        const cruise = visualPhase === "forming" && formation.rushed ? 0.4 : 0.21;
        const maximumSpeed = relativeProgress < 1 / 6 ? launchCruise : cruise;
        targetSpeed =
          maximumSpeed * Math.min(1, Math.pow(distanceToLimit / 0.14, 0.8));
      }

      formation.speed +=
        (targetSpeed - formation.speed) * Math.min(1, deltaSeconds * 4.5);
      absoluteProgress = Math.min(
        formation.limit,
        absoluteProgress + formation.speed * deltaSeconds,
      );
    } else if (
      visualPhase === "question" ||
      visualPhase === "result" ||
      visualPhase === "finish"
    ) {
      absoluteProgress += deltaSeconds * 0.012;
    }

    const slotsByDriver = getSlotsByDriver();
    for (const driver of DRIVER_INDICES) {
      visualSlots[driver] +=
        (slotsByDriver[driver] - visualSlots[driver]) * Math.min(1, deltaSeconds * 4);
    }

    emitFrame(timestamp, deltaSeconds);
  };

  const tick = (timestamp: number) => {
    if (!running || destroyed) return;
    rafHandle = requestFrame(tick);
    advance(Number.isFinite(timestamp) ? timestamp : now());
  };

  const start = () => {
    if (running || destroyed) return;
    running = true;
    lastTimestamp = now();
    emitFrame(lastTimestamp, 0);
    rafHandle = requestFrame(tick);
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    running = false;
    if (rafHandle !== null) cancelFrame(rafHandle);
    rafHandle = null;
    frame = buildFrame(now(), 0);
    listeners.clear();
  };

  const sync = (snapshot: RaceSimGameSnapshot) => {
    if (destroyed) return;
    const previous = game;
    game = normalizeSnapshot(snapshot);

    if (previous.revision !== game.revision) {
      resetMotion();
    }

    visualPhase = game.phase;
    targetPosition = game.ledgerPosition;

    if (game.ledgerPosition === "DNF" || game.phase === "dnf") {
      beginDnf();
    } else if (dnf) {
      dnf = false;
      dnfLag = 0;
    }

    if (game.phase === "formation") {
      startFormation();
      if (game.formationSector > 0) {
        advanceFormation(game.formationSector as 1 | 2 | 3);
      }
    } else if (game.phase === "forming") {
      finishFormation();
    } else if (game.phase !== "lights" && game.phase !== "go") {
      if (game.phase !== "grid") formation = null;
    } else {
      formation = null;
    }

    if (game.phase === "launch" && previous.phase !== "launch") {
      launchStartedAt = now();
    }

    if (game.phase === "lap" && game.ledgerPosition !== "DNF") {
      startLap(
        game.lap,
        game.ledgerPosition,
        game.lastAnswerCorrect ?? game.ledgerPosition <= getPlayerPosition(),
        lapDurationMs,
        game.revision,
      );
    } else if (
      (game.phase === "question" || game.phase === "result" || game.phase === "finish") &&
      game.ledgerPosition !== "DNF" &&
      lap === null
    ) {
      movePlayerTo(game.ledgerPosition);
    }

    if (game.phase === "pit") {
      const pitKey = `${String(game.revision)}:${game.lap}`;
      if (pitKey !== lastPitKey || previous.phase !== "pit") {
        lastPitKey = pitKey;
        enterPit();
      } else if (pit) {
        visualPhase = "pit";
      } else {
        visualPhase = "question";
      }
      if (game.pitState === "done") completePit();
    } else if (pit && game.phase === "question") {
      // The controller owns the phase change, but the visual keeps driving out
      // of the box until the reference hold/rejoin choreography completes.
      visualPhase = "pit";
    } else if (pit && previous.phase !== game.phase) {
      pit = null;
    }

    emitFrame(now(), 0);
  };

  const publish = (event: RaceSimSemanticEvent) => {
    if (destroyed) return;

    switch (event.type) {
      case "reset":
        resetMotion();
        break;
      case "formation:start":
        startFormation();
        break;
      case "formation:advance":
        advanceFormation(event.sector);
        break;
      case "formation:finish":
        finishFormation(event.rushed ?? false);
        break;
      case "launch":
        visualPhase = "launch";
        launchStartedAt = now();
        break;
      case "lap:start":
        startLap(
          event.lap,
          event.targetPosition,
          event.correct,
          event.durationMs ?? lapDurationMs,
          event.revision ?? game.revision,
        );
        break;
      case "lap:skip":
        if (lap) {
          absoluteProgress = lap.baseProgress + 1;
          completeLap();
        }
        break;
      case "pit:enter":
        enterPit(true);
        break;
      case "pit:complete":
        completePit();
        break;
      case "dnf":
        beginDnf();
        break;
    }

    emitFrame(now(), 0);
  };

  const subscribe = (listener: (nextFrame: RaceSimFrame) => void) => {
    if (destroyed) return () => {};
    listeners.add(listener);
    listener(frame);
    return () => {
      listeners.delete(listener);
    };
  };

  return Object.freeze({
    start,
    destroy,
    sync,
    publish,
    getFrame: () => frame,
    subscribe,
  });
};
