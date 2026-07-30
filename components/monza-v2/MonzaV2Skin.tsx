"use client";

import { Button } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MutableRefObject } from "react";

import type { FlowState } from "../../app/flow/types";
import type { Question } from "../../app/f1-question-bank";
import {
  MONZA_MAIN_TRACK_PATH_D,
  MONZA_PIT_LANE_PATH_D,
} from "../../app/race-sim/raceSim";
import { FinishIllustration, type FinishScene } from "./FinishIllustration";
import styles from "./monza-v2.module.css";
import type {
  MonzaBanner,
  MonzaClassificationEntry,
  MonzaRaceFrame,
  MonzaV2SkinProps,
} from "./types";

type MonzaV2SequenceBridgeProps = MonzaV2SkinProps & {
  /**
   * V1-origin sequences retain V1's manual progression even while the V2 skin
   * is visible. V2-origin sequences leave both flags false and advance from the
   * shared controller's original clock.
   */
  pitRequiresManualContinue?: boolean;
  manualRaceAdvance?: boolean;
  onManualRaceAdvance?: () => void;
};

const WARMUPS = [
  {
    prompt: "You tap an answer — what happens?",
    options: [
      "I can change it before the lap",
      "It locks in immediately",
      "It skips the lap",
    ],
    answer: 1,
    note: "Answers lock the moment you tap — the lap then plays out your call.",
  },
  {
    prompt: "One question equals what out there?",
    options: ["One lap of the race", "One full season", "One pit stop"],
    answer: 0,
    note: "Six questions, six laps. Every answer is a lap of racing.",
  },
  {
    prompt: "What breaks the race at half distance?",
    options: [
      "A timed pit stop you perform",
      "A double-points lap",
      "A weather lottery",
    ],
    answer: 0,
    note: "After lap 3 you box: four tyres, in order, against the clock.",
  },
] as const;

const TYRES = ["FRONT LEFT", "FRONT RIGHT", "REAR LEFT", "REAR RIGHT"] as const;

const DAY_RADIOS = [
  "Lights out. Build the gap early — head down.",
  "Traffic into the first chicane. Trust your braking.",
  "He’s defending into Ascari — be patient, pick your moment.",
  "Fresh tyres underneath you. Use them now.",
  "Two cars in the fight ahead. Keep it clean through Lesmo.",
  "Last lap. Flat out — everything you have.",
] as const;

const NIGHT_RADIOS = [
  "Green green green. Head down, build the gap.",
  "Traffic into T1. Brake late, keep it clean.",
  "Car ahead defending Ascari. Wait for the exit.",
  "Fresh rubber. Push now — this is the window.",
  "Two-car fight ahead. No mistakes through Lesmo.",
  "Final lap. Maximum attack. Everything you have.",
] as const;

const BASE_DRIVERS = [
  { id: "you", code: "YOU", day: "#C8102E", night: "#F2F2F2", isPlayer: true },
  { id: "vol", code: "VOL", day: "#1E3F8F", night: "#E10600" },
  { id: "oka", code: "OKA", day: "#C75B12", night: "#FF8700" },
  { id: "tan", code: "TAN", day: "#2E6E6A", night: "#00B8C4" },
  { id: "lin", code: "LIN", day: "#3E5F9E", night: "#0057B8" },
  { id: "mor", code: "MOR", day: "#6B4FA0", night: "#FFD400" },
  { id: "kov", code: "KOV", day: "#1F5C43", night: "#00A651" },
  { id: "dub", code: "DUB", day: "#A34B6B", night: "#C6007E" },
  { id: "sal", code: "SAL", day: "#8A7F68", night: "#8C8C8C" },
  { id: "ros", code: "ROS", day: "#221C15", night: "#7F00FF" },
] as const;

const START_ORDER = ["vol", "lin", "oka", "kov", "tan", "mor", "dub", "sal", "ros", "you"];
const RACE_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const keyedPosition = (id: string, position: number | string) =>
  `${id}:${position}`;

const setInlineOpacity = (
  element: HTMLElement | undefined,
  visible: boolean,
) => {
  if (!element) return;
  const opacity = visible ? "1" : "0";
  if (element.style.opacity !== opacity) element.style.opacity = opacity;
};

function MicroText({
  children,
  scale,
  origin = "left center",
  className,
}: {
  children: React.ReactNode;
  scale: number;
  origin?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(styles.microText, className)}
      style={
        {
          "--micro-scale": scale,
          "--micro-origin": origin,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}

const sentenceCase = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const scoreFor = (state: FlowState) =>
  state.lapAnswers.reduce<number>((total, answer, index) => {
    if (answer === null) return total;
    return total + (answer === state.weekendQuestions[index]?.answer ? 1 : 0);
  }, 0);

const buildClassification = (
  playerPosition: number,
  notte: boolean,
  dnf: boolean,
): MonzaClassificationEntry[] => {
  const rivals = START_ORDER.filter((id) => id !== "you");
  const order = [...rivals];
  order.splice(Math.max(0, Math.min(9, playerPosition - 1)), 0, "you");

  return order.map((id, index) => {
    const driver = BASE_DRIVERS.find((item) => item.id === id) ?? BASE_DRIVERS[0];
    return {
      id,
      code: driver.code,
      color: notte ? driver.night : driver.day,
      position: index + 1,
      isPlayer: id === "you",
      status: id === "you" && dnf ? "dnf" : "running",
    };
  });
};

const reactionBand = (ms: number | null) => {
  if (ms === null) return { word: "—", tone: "neutral" as const };
  if (ms < 220) return { word: "LIGHTNING", tone: "good" as const };
  if (ms < 300) return { word: "RACE SHARP", tone: "good" as const };
  if (ms < 400) return { word: "ON PACE", tone: "chosen" as const };
  return { word: "SLOW AWAY", tone: "bad" as const };
};

const pitBand = (ms: number | null) => {
  if (ms === null) return { word: "—", tone: "neutral" as const };
  if (ms < 2000) return { word: "CREW PROUD", tone: "good" as const };
  if (ms < 2800) return { word: "SOLID STOP", tone: "chosen" as const };
  return { word: "SLOW STOP", tone: "bad" as const };
};

const defaultBanner = (
  state: FlowState,
  warmupLocked: boolean,
  formationHolding: boolean,
): MonzaBanner | null => {
  if (state.stage === "formation" && state.formationMode === "briefing") {
    const step = Math.min(state.tutorialStep, 2);
    const picked = state.tutorialAnswers[step] !== null;
    if (picked) {
      if (step === 2) {
        return { text: "FORMATION LAP", sub: "FORMING UP ON THE GRID", tone: "pit" };
      }
      return {
        text: "FORMATION LAP",
        sub: `SECTOR ${step + 2} OF 3 · TYRES WARMING`,
        tone: "pit",
      };
    }
    if (formationHolding && !warmupLocked) {
      return {
        text: "FORMATION LAP",
        sub: "HOLDING · MAKE YOUR CALL",
        tone: "pit",
      };
    }
    return {
      text: "FORMATION LAP",
      sub: `SECTOR ${step + 1} OF 3 · TYRES WARMING`,
      tone: "pit",
    };
  }
  if (state.stage === "pitstop") {
    return { text: "BOX BOX BOX", sub: "TYRE CHANGE · POSITIONS HOLD", tone: "pit" };
  }
  return null;
};

function useFormationHolding(raceSim: MonzaV2SkinProps["raceSim"]) {
  const [holding, setHolding] = useState(
    () => raceSim?.getFrame().formation.holding ?? false,
  );

  useEffect(() => {
    if (!raceSim) return;

    let last = raceSim.getFrame().formation.holding;
    return raceSim.subscribe((frame) => {
      if (frame.formation.holding === last) return;
      last = frame.formation.holding;
      setHolding(last);
    });
  }, [raceSim]);

  return holding;
}

function useRaceFrames(
  raceSim: MonzaV2SkinProps["raceSim"],
  carRefs: MutableRefObject<Map<string, HTMLDivElement>>,
  rotationRefs: MutableRefObject<Map<string, HTMLDivElement>>,
  tagRefs: MutableRefObject<Map<string, HTMLDivElement>>,
  tetherRefs: MutableRefObject<Map<string, HTMLDivElement>>,
  normalTagBoxRefs: MutableRefObject<Map<string, HTMLDivElement>>,
  contestTagBoxRefs: MutableRefObject<Map<string, HTMLDivElement>>,
  normalTagLabelRefs: MutableRefObject<Map<string, HTMLSpanElement>>,
  gainTagLabelRefs: MutableRefObject<Map<string, HTMLSpanElement>>,
  lossTagLabelRefs: MutableRefObject<Map<string, HTMLSpanElement>>,
  gainTagDirectionRefs: MutableRefObject<Map<string, HTMLSpanElement>>,
  lossTagDirectionRefs: MutableRefObject<Map<string, HTMLSpanElement>>,
) {
  useEffect(() => {
    if (!raceSim) return;

    const previousPositions = new Map<string, number>();
    const tagMoments = new Map<
      string,
      { direction: "gain" | "loss"; contestUntil: number; settledUntil: number }
    >();
    const tagStates = new Map<string, "normal" | "contest" | "settled">();
    const tagPositions = new Map<string, string>();
    const tagDirections = new Map<string, "gain" | "loss">();
    const settleAnimations = new Map<string, Animation>();

    const paint = (frame: MonzaRaceFrame) => {
      const now = performance.now();
      frame.cars.forEach((car) => {
        const id =
          car.code?.toLowerCase() ??
          BASE_DRIVERS[car.driverIndex]?.id ??
          String(car.driverIndex);
        const carElement = carRefs.current.get(id);
        const rotationElement = rotationRefs.current.get(id);
        const tagElement = tagRefs.current.get(id);
        const tetherElement = tetherRefs.current.get(id);
        const previousPosition = previousPositions.get(id);
        const numericPosition =
          typeof car.position === "number" ? car.position : undefined;

        const positionChanged =
          numericPosition !== undefined &&
          previousPosition !== undefined &&
          previousPosition !== numericPosition;
        if (positionChanged) {
          tagMoments.set(id, {
            direction: numericPosition < previousPosition ? "gain" : "loss",
            contestUntil: now + 1500,
            settledUntil: now + 4000,
          });
        }
        if (numericPosition !== undefined) {
          previousPositions.set(id, numericPosition);
        }

        if (carElement) {
          carElement.style.transform = `translate3d(${(car.x - 55).toFixed(2)}px, ${(car.y - 5).toFixed(2)}px, 0)`;
          const opacity = String(car.opacity ?? 1);
          if (carElement.style.opacity !== opacity) carElement.style.opacity = opacity;
        }
        if (rotationElement) {
          rotationElement.style.transform = `rotate(${car.heading.toFixed(2)}deg)`;
        }
        if (tagElement) {
          const moment = tagMoments.get(id);
          const contesting = moment && now < moment.contestUntil;
          const settled = moment && !contesting && now < moment.settledUntil;
          const tagState = contesting
            ? "contest"
            : settled
              ? "settled"
              : "normal";
          const displayedPosition =
            numericPosition === undefined ? "dnf" : String(numericPosition);
          const tagLift =
            car.driverIndex === 0 ? 53 : Math.round(car.visualSlot) % 2 ? 54 : 82;
          const localX = car.x - 55;
          const localY = car.y - 5;
          const tagY = localY - tagLift;

          if (!tagStates.has(id)) tagStates.set(id, "normal");
          const previousTagState = tagStates.get(id) ?? "normal";
          if (previousTagState !== tagState) {
            tagStates.set(id, tagState);
            setInlineOpacity(normalTagBoxRefs.current.get(id), !contesting);
            setInlineOpacity(contestTagBoxRefs.current.get(id), Boolean(contesting));
            if (tagState === "settled") {
              settleAnimations.get(id)?.cancel();
              const normalBox = normalTagBoxRefs.current.get(id);
              if (normalBox) {
                settleAnimations.set(
                  id,
                  normalBox.animate(
                    [{ opacity: 0.72 }, { opacity: 1 }],
                    { duration: 650, easing: "ease-out" },
                  ),
                );
              }
            }
          }

          let visiblePosition = tagPositions.get(id);
          if (visiblePosition === undefined) {
            visiblePosition =
              [...RACE_POSITIONS, "dnf"].find(
                (position) =>
                  normalTagLabelRefs.current.get(keyedPosition(id, position))
                    ?.style.opacity === "1",
              )?.toString() ?? displayedPosition;
            tagPositions.set(id, visiblePosition);
          }
          if (visiblePosition !== displayedPosition) {
            for (const refs of [
              normalTagLabelRefs,
              gainTagLabelRefs,
              lossTagLabelRefs,
            ]) {
              setInlineOpacity(
                refs.current.get(keyedPosition(id, visiblePosition)),
                false,
              );
              setInlineOpacity(
                refs.current.get(keyedPosition(id, displayedPosition)),
                true,
              );
            }
            tagPositions.set(id, displayedPosition);
          }

          if (positionChanged && moment) {
            const previousDirection = tagDirections.get(id);
            if (previousDirection) {
              setInlineOpacity(
                previousDirection === "gain"
                  ? gainTagDirectionRefs.current.get(id)
                  : lossTagDirectionRefs.current.get(id),
                false,
              );
            }
            setInlineOpacity(
              moment.direction === "gain"
                ? gainTagDirectionRefs.current.get(id)
                : lossTagDirectionRefs.current.get(id),
              true,
            );
            tagDirections.set(id, moment.direction);
          }
          tagElement.style.transform = `translate3d(${localX.toFixed(2)}px, ${tagY.toFixed(2)}px, 0)`;
          const tagOpacity = String(car.opacity);
          if (tagElement.style.opacity !== tagOpacity) {
            tagElement.style.opacity = tagOpacity;
          }
          if (tetherElement) {
            const tetherTop = localY - tagLift + 17;
            const tetherLength = tagLift - 33;
            tetherElement.style.transform = `translate3d(${localX.toFixed(2)}px, ${tetherTop.toFixed(2)}px, 0) scaleY(${tetherLength})`;
            if (tetherElement.style.opacity !== tagOpacity) {
              tetherElement.style.opacity = tagOpacity;
            }
          }
        }
      });
    };

    paint(raceSim.getFrame());
    const unsubscribe = raceSim.subscribe(paint);
    return () => {
      unsubscribe();
      settleAnimations.forEach((animation) => animation.cancel());
    };
  }, [
    carRefs,
    contestTagBoxRefs,
    gainTagDirectionRefs,
    gainTagLabelRefs,
    lossTagDirectionRefs,
    lossTagLabelRefs,
    normalTagBoxRefs,
    normalTagLabelRefs,
    raceSim,
    rotationRefs,
    tagRefs,
    tetherRefs,
  ]);
}

function ThemeToggle({
  mode,
  onChange,
}: {
  mode: MonzaV2SkinProps["mode"];
  onChange: MonzaV2SkinProps["onModeChange"];
}) {
  const notte = mode === "notte";
  return (
    <Button
      type="button"
      radius="none"
      variant="light"
      disableRipple
      onPress={() => onChange(notte ? "giorno" : "notte")}
      aria-label={notte ? "Switch to giorno light mode" : "Switch to notte dark mode"}
      title={notte ? "Switch to giorno (light)" : "Switch to notte (dark)"}
      className={styles.themeToggle}
    >
      <span className={cx(styles.themeSegment, styles.daySegment)} aria-hidden="true">
        <span className={styles.dayLabel}>DAY</span>
        <svg viewBox="0 0 12 12" width="12" height="12">
          <circle cx="6" cy="6" r="2.6" fill="currentColor" />
          <path d="M6 .2v1.7M6 10.1v1.7M.2 6h1.7M10.1 6h1.7M1.9 1.9l1.2 1.2M8.9 8.9l1.2 1.2M8.9 3.1l1.2-1.2M1.9 10.1l1.2-1.2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </span>
      <span className={cx(styles.themeSegment, styles.nightSegment)} aria-hidden="true">
        <svg viewBox="0 0 12 12" width="12" height="12">
          <path d="M8.2 2.4a4.2 4.2 0 1 0 0 7.2 3.3 3.3 0 1 1 0-7.2Z" fill="currentColor" />
        </svg>
        <span className={styles.nightLabel}>NIGHT</span>
      </span>
    </Button>
  );
}

function CarGlyph({ color }: { color: string }) {
  return (
    <g style={{ color }}>
      <rect x="-18" y="-13.5" width="9.5" height="6.5" rx="2.4" className={styles.wheel} />
      <rect x="-18" y="7" width="9.5" height="6.5" rx="2.4" className={styles.wheel} />
      <rect x="7.5" y="-12.5" width="8" height="5.5" rx="2.2" className={styles.wheel} />
      <rect x="7.5" y="7" width="8" height="5.5" rx="2.2" className={styles.wheel} />
      <g className={styles.carShell}>
        <rect x="-22" y="-10" width="5" height="20" rx="1" fill="currentColor" />
        <rect x="-17" y="-4" width="27" height="8" rx="2" fill="currentColor" />
        <rect x="-13" y="-7.5" width="17" height="15" rx="3" fill="currentColor" />
        <path d="M 8,-4 L 20.5,-2 L 20.5,2 L 8,4 Z" fill="currentColor" />
        <rect x="19" y="-10.5" width="4" height="21" rx="1" fill="currentColor" />
      </g>
      <circle cx="-3" cy="0" r="2.7" className={styles.cockpit} />
    </g>
  );
}

function TagPositionLabels({
  driverId,
  isPlayer,
  labelRefs,
  visiblePosition,
  arrow = "",
}: {
  driverId: string;
  isPlayer: boolean;
  labelRefs: MutableRefObject<Map<string, HTMLSpanElement>>;
  visiblePosition: number | "dnf";
  arrow?: "▲" | "▼" | "";
}) {
  return (
    <>
      {RACE_POSITIONS.map((position) => (
        <span
          key={position}
          ref={(element) => {
            const key = keyedPosition(driverId, position);
            if (element) labelRefs.current.set(key, element);
            else labelRefs.current.delete(key);
          }}
          className={styles.tagLabel}
          style={{ opacity: visiblePosition === position ? 1 : 0 }}
        >
          {arrow}
          {isPlayer ? "P" : ""}
          {position}
        </span>
      ))}
      <span
        ref={(element) => {
          const key = keyedPosition(driverId, "dnf");
          if (element) labelRefs.current.set(key, element);
          else labelRefs.current.delete(key);
        }}
        className={styles.tagLabel}
        style={{ opacity: visiblePosition === "dnf" ? 1 : 0 }}
      >
        DNF
      </span>
    </>
  );
}

function CircuitMap({
  classification,
  playerPosition,
  tagsVisible,
  banner,
  showLights,
  lightsOnCount,
  isGo,
  racePhase,
  onSkipLap,
  raceSim,
}: {
  classification: readonly MonzaClassificationEntry[];
  playerPosition: number;
  tagsVisible: boolean;
  banner: MonzaBanner | null;
  showLights: boolean;
  lightsOnCount: number;
  isGo: boolean;
  racePhase: MonzaV2SkinProps["racePhase"];
  onSkipLap: MonzaV2SkinProps["onSkipLap"];
  raceSim: MonzaV2SkinProps["raceSim"];
}) {
  const carRefs = useRef(new Map<string, HTMLDivElement>());
  const rotationRefs = useRef(new Map<string, HTMLDivElement>());
  const tagRefs = useRef(new Map<string, HTMLDivElement>());
  const tetherRefs = useRef(new Map<string, HTMLDivElement>());
  const normalTagBoxRefs = useRef(new Map<string, HTMLDivElement>());
  const contestTagBoxRefs = useRef(new Map<string, HTMLDivElement>());
  const normalTagLabelRefs = useRef(new Map<string, HTMLSpanElement>());
  const gainTagLabelRefs = useRef(new Map<string, HTMLSpanElement>());
  const lossTagLabelRefs = useRef(new Map<string, HTMLSpanElement>());
  const gainTagDirectionRefs = useRef(new Map<string, HTMLSpanElement>());
  const lossTagDirectionRefs = useRef(new Map<string, HTMLSpanElement>());
  useRaceFrames(
    raceSim,
    carRefs,
    rotationRefs,
    tagRefs,
    tetherRefs,
    normalTagBoxRefs,
    contestTagBoxRefs,
    normalTagLabelRefs,
    gainTagLabelRefs,
    lossTagLabelRefs,
    gainTagDirectionRefs,
    lossTagDirectionRefs,
  );

  const sortedForPaint = useMemo(
    () =>
      [...classification].sort(
        (left, right) =>
          Number(Boolean(left.isPlayer)) - Number(Boolean(right.isPlayer)),
      ),
    [classification],
  );

  return (
    <div className={styles.map} aria-label="Live Monza circuit map">
      <svg viewBox="55 5 945 510" className={styles.trackSvg} aria-hidden="true">
        <path d={MONZA_PIT_LANE_PATH_D} className={styles.pitPath} />
        <text x="660" y="412" textAnchor="middle" className={styles.pitLaneLabel}>PIT LANE</text>
        <line x1="700" y1="482" x2="440" y2="482" className={styles.drsLine} />
        <line x1="258" y1="74" x2="452" y2="300" className={styles.drsLineFaint} />
        <path d={MONZA_MAIN_TRACK_PATH_D} className={styles.trackPath} />
        <path d={MONZA_MAIN_TRACK_PATH_D} className={styles.trackDash} />
        <line x1="737" y1="434" x2="737" y2="470" className={styles.startLine} />
        <line x1="744" y1="440" x2="744" y2="476" className={styles.startLine} />
        <g className={styles.cornerLabels}>
          <text x="395" y="503" textAnchor="middle">
            <tspan className={styles.dayCornerLabel}>RETTIFILO</tspan>
            <tspan className={styles.nightCornerLabel}>T1 / RETTIFILO</tspan>
          </text>
          <text x="162" y="206">ROGGIA</text>
          <text x="180" y="40" textAnchor="middle">LESMO</text>
          <text x="560" y="318">ASCARI</text>
          <text x="912" y="506" textAnchor="middle">PARABOLICA</text>
        </g>
      </svg>

      <div className={styles.raceOverlay} aria-hidden="true">
        <div className={cx(styles.tags, tagsVisible && styles.tagsVisible)}>
          {sortedForPaint.map((driver) => {
            const fallbackX = 740 - driver.position * 30;
            const fallbackY = driver.position % 2 === 0 ? 445 : 459;
            const tagY = fallbackY - (driver.isPlayer ? 53 : driver.position % 2 ? 54 : 82);
            const tetherTop = tagY + 17;
            const tetherLength =
              (driver.isPlayer ? 53 : driver.position % 2 ? 54 : 82) - 33;
            const initialTagPosition =
              driver.status === "dnf"
                ? "dnf"
                : driver.isPlayer
                  ? playerPosition
                  : driver.position;
            return (
              <div key={`tag-${driver.id}`}>
                <div
                  ref={(element) => {
                    if (element) tetherRefs.current.set(driver.id, element);
                    else tetherRefs.current.delete(driver.id);
                  }}
                  className={styles.tetherMotion}
                  style={{
                    transform: `translate3d(${fallbackX - 55}px, ${tetherTop - 5}px, 0) scaleY(${tetherLength})`,
                  }}
                />
                <div
                  ref={(element) => {
                    if (element) tagRefs.current.set(driver.id, element);
                    else tagRefs.current.delete(driver.id);
                  }}
                  className={styles.tagMotion}
                  style={{
                    transform: `translate3d(${fallbackX - 55}px, ${tagY - 5}px, 0)`,
                  }}
                >
                  <div
                    ref={(element) => {
                      if (element) normalTagBoxRefs.current.set(driver.id, element);
                      else normalTagBoxRefs.current.delete(driver.id);
                    }}
                    className={cx(
                      styles.tagBox,
                      styles.tagBoxNormal,
                      driver.isPlayer ? styles.playerTag : styles.rivalTag,
                      driver.isPlayer
                        ? styles.playerTagNormal
                        : styles.rivalTagNormal,
                    )}
                    style={{ opacity: 1 }}
                  >
                    <TagPositionLabels
                      driverId={driver.id}
                      isPlayer={Boolean(driver.isPlayer)}
                      labelRefs={normalTagLabelRefs}
                      visiblePosition={initialTagPosition}
                    />
                  </div>
                  <div
                    ref={(element) => {
                      if (element) contestTagBoxRefs.current.set(driver.id, element);
                      else contestTagBoxRefs.current.delete(driver.id);
                    }}
                    className={cx(
                      styles.tagBox,
                      styles.tagBoxContest,
                      driver.isPlayer ? styles.playerTag : styles.rivalTag,
                      driver.isPlayer
                        ? styles.playerTagContest
                        : styles.rivalTagContest,
                    )}
                    style={{ opacity: 0 }}
                  >
                    <span
                      ref={(element) => {
                        if (element) gainTagDirectionRefs.current.set(driver.id, element);
                        else gainTagDirectionRefs.current.delete(driver.id);
                      }}
                      className={styles.tagContestDirection}
                      style={{ opacity: 0 }}
                    >
                      <TagPositionLabels
                        driverId={driver.id}
                        isPlayer={Boolean(driver.isPlayer)}
                        labelRefs={gainTagLabelRefs}
                        visiblePosition={initialTagPosition}
                        arrow="▲"
                      />
                    </span>
                    <span
                      ref={(element) => {
                        if (element) lossTagDirectionRefs.current.set(driver.id, element);
                        else lossTagDirectionRefs.current.delete(driver.id);
                      }}
                      className={styles.tagContestDirection}
                      style={{ opacity: 0 }}
                    >
                      <TagPositionLabels
                        driverId={driver.id}
                        isPlayer={Boolean(driver.isPlayer)}
                        labelRefs={lossTagLabelRefs}
                        visiblePosition={initialTagPosition}
                        arrow="▼"
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedForPaint.map((driver) => {
          const fallbackX = 740 - driver.position * 30;
          const fallbackY = driver.position % 2 === 0 ? 445 : 459;
          return (
            <div
              key={driver.id}
              ref={(element) => {
                if (element) carRefs.current.set(driver.id, element);
                else carRefs.current.delete(driver.id);
              }}
              className={styles.carMotion}
              style={{
                transform: `translate3d(${fallbackX - 55}px, ${fallbackY - 5}px, 0)`,
              }}
            >
              {driver.isPlayer && (
                <div className={styles.playerRingMotion}>
                  <svg viewBox="-28 -28 56 56">
                    <rect
                      x="-26"
                      y="-26"
                      width="52"
                      height="52"
                      className={styles.playerRing}
                    />
                  </svg>
                </div>
              )}
              <div
                ref={(element) => {
                  if (element) rotationRefs.current.set(driver.id, element);
                  else rotationRefs.current.delete(driver.id);
                }}
                className={styles.carRotation}
                style={{ transform: "rotate(180deg)" }}
              >
                <svg viewBox="-26 -26 52 52" className={styles.carGlyphSvg}>
                  <g transform={`scale(${driver.isPlayer ? 1 : 0.9})`}>
                    <CarGlyph color={driver.color} />
                  </g>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {banner && (
        <div className={styles.bannerWrap} aria-live="polite">
          <div className={cx(styles.banner, styles[`banner_${banner.tone}`])}>
            <strong>{banner.text}</strong>
            {banner.sub && <span>{banner.sub}</span>}
          </div>
        </div>
      )}

      {showLights && (
        <div className={styles.lightsLayer} aria-live="assertive">
          <div className={styles.lightsHousing}>
            {[0, 1, 2, 3, 4].map((index) => (
              <span
                key={index}
                className={cx(styles.light, lightsOnCount > index && styles.lightOn)}
              />
            ))}
          </div>
          <span className={cx(styles.startHint, isGo && styles.startHintGo)}>
            <MicroText scale={0.5625} origin="center">
              {isGo ? "GO GO GO — TAP NOW" : "TAP ANYWHERE AT LIGHTS OUT"}
            </MicroText>
          </span>
        </div>
      )}

      {racePhase === "lap" && (
        <Button
          radius="none"
          variant="light"
          disableRipple
          onPress={onSkipLap}
          className={styles.skipLap}
        >
          <MicroText scale={0.65625} origin="center">
            SKIP »
          </MicroText>
        </Button>
      )}
    </div>
  );
}

function ClassificationStrip({
  entries,
  raceSim,
}: {
  entries: readonly MonzaClassificationEntry[];
  raceSim: MonzaV2SkinProps["raceSim"];
}) {
  const chipRefs = useRef(new Map<string, HTMLLIElement>());
  const chipFeedbackRefs = useRef(new Map<string, HTMLDivElement>());
  const classificationPositionRefs = useRef(
    new Map<string, HTMLSpanElement>(),
  );
  const gainArrowRefs = useRef(new Map<string, HTMLSpanElement>());
  const lossArrowRefs = useRef(new Map<string, HTMLSpanElement>());

  useEffect(() => {
    if (!raceSim) return;

    const previousPositions = new Map<string, number>();
    const visiblePositions = new Map<string, string>();
    const visibleDirections = new Map<string, "gain" | "loss">();
    const motionUntil = new Map<string, number>();
    const chipAnimations = new Map<string, Animation>();

    const paint = (frame: MonzaRaceFrame) => {
      const now = performance.now();
      frame.cars.forEach((car) => {
        if (typeof car.position !== "number") return;
        const id =
          car.code?.toLowerCase() ??
          BASE_DRIVERS[car.driverIndex]?.id ??
          String(car.driverIndex);
        const chip = chipRefs.current.get(id);
        const previous = previousPositions.get(id);

        if (!visibleDirections.has(id)) {
          const initialDirection =
            gainArrowRefs.current.get(id)?.style.opacity === "1"
              ? "gain"
              : lossArrowRefs.current.get(id)?.style.opacity === "1"
                ? "loss"
                : undefined;
          if (initialDirection) visibleDirections.set(id, initialDirection);
        }

        if (previous !== undefined && previous !== car.position) {
          const direction = car.position < previous ? "gain" : "loss";
          const previousDirection = visibleDirections.get(id);
          if (previousDirection) {
            setInlineOpacity(
              previousDirection === "gain"
                ? gainArrowRefs.current.get(id)
                : lossArrowRefs.current.get(id),
              false,
            );
          }
          setInlineOpacity(
            direction === "gain"
              ? gainArrowRefs.current.get(id)
              : lossArrowRefs.current.get(id),
            true,
          );
          visibleDirections.set(id, direction);
          motionUntil.set(id, now + 900);
          chipAnimations.get(id)?.cancel();
          const feedback = chipFeedbackRefs.current.get(id);
          if (feedback) {
            chipAnimations.set(
              id,
              feedback.animate(
                [
                  { transform: "translateY(0)" },
                  { offset: 0.42, transform: "translateY(-2px)" },
                  { transform: "translateY(0)" },
                ],
                { duration: 900, easing: "ease-out" },
              ),
            );
          }
        } else if (
          (motionUntil.get(id) ?? 0) <= now &&
          visibleDirections.has(id)
        ) {
          const direction = visibleDirections.get(id);
          setInlineOpacity(
            direction === "gain"
              ? gainArrowRefs.current.get(id)
              : lossArrowRefs.current.get(id),
            false,
          );
          visibleDirections.delete(id);
        }
        previousPositions.set(id, car.position);

        const nextPosition = String(car.position);
        let visiblePosition = visiblePositions.get(id);
        if (visiblePosition === undefined) {
          visiblePosition =
            [...RACE_POSITIONS, "dnf"].find(
              (position) =>
                classificationPositionRefs.current.get(
                  keyedPosition(id, position),
                )?.style.opacity === "1",
            )?.toString() ?? nextPosition;
          visiblePositions.set(id, visiblePosition);
        }
        if (visiblePosition !== nextPosition) {
          setInlineOpacity(
            classificationPositionRefs.current.get(
              keyedPosition(id, visiblePosition),
            ),
            false,
          );
          setInlineOpacity(
            classificationPositionRefs.current.get(
              keyedPosition(id, nextPosition),
            ),
            true,
          );
          visiblePositions.set(id, nextPosition);
          if (chip) {
            chip.style.transform = `translate3d(${(car.position - 1) * 37}px, 0, 0)`;
          }
        }
      });
    };

    paint(raceSim.getFrame());
    const unsubscribe = raceSim.subscribe(paint);
    return () => {
      unsubscribe();
      chipAnimations.forEach((animation) => animation.cancel());
    };
  }, [raceSim]);

  return (
    <section className={styles.classification} aria-label="Live classification">
      <p>LIVE CLASSIFICATION</p>
      <ol className={styles.classificationList}>
        {entries.map((entry) => {
          const delta = entry.delta ?? 0;
          return (
            <li
              key={entry.id}
              ref={(element) => {
                if (element) chipRefs.current.set(entry.id, element);
                else chipRefs.current.delete(entry.id);
              }}
              className={cx(
                styles.classificationChip,
                entry.isPlayer && styles.playerChip,
                entry.status === "dnf" && styles.dnfChip,
              )}
              style={
                {
                  "--driver-color": entry.color,
                  transform: `translate3d(${(entry.position - 1) * 37}px, 0, 0)`,
                } as CSSProperties
              }
              aria-label={`${entry.code}, ${entry.status === "dnf" ? "did not finish" : `position ${entry.position}`}`}
            >
              <div
                ref={(element) => {
                  if (element) chipFeedbackRefs.current.set(entry.id, element);
                  else chipFeedbackRefs.current.delete(entry.id);
                }}
                className={styles.classificationChipInner}
              >
                <span className={styles.chipPosition}>
                  <span className={styles.chipDelta} aria-hidden="true">
                    <span
                      ref={(element) => {
                        if (element) gainArrowRefs.current.set(entry.id, element);
                        else gainArrowRefs.current.delete(entry.id);
                      }}
                      className={styles.deltaUp}
                      style={{ opacity: delta > 0 ? 1 : 0 }}
                    >
                      ▲
                    </span>
                    <span
                      ref={(element) => {
                        if (element) lossArrowRefs.current.set(entry.id, element);
                        else lossArrowRefs.current.delete(entry.id);
                      }}
                      className={styles.deltaDown}
                      style={{ opacity: delta < 0 ? 1 : 0 }}
                    >
                      ▼
                    </span>
                  </span>
                  <MicroText scale={0.5625} origin="center">
                    <span className={styles.classificationPositionStack}>
                      {RACE_POSITIONS.map((position) => (
                        <span
                          key={position}
                          ref={(element) => {
                            const key = keyedPosition(entry.id, position);
                            if (element) {
                              classificationPositionRefs.current.set(key, element);
                            } else {
                              classificationPositionRefs.current.delete(key);
                            }
                          }}
                          className={styles.classificationPositionValue}
                          style={{
                            opacity:
                              entry.status !== "dnf" &&
                              entry.position === position
                                ? 1
                                : 0,
                          }}
                        >
                          P{position}
                        </span>
                      ))}
                      <span
                        ref={(element) => {
                          const key = keyedPosition(entry.id, "dnf");
                          if (element) {
                            classificationPositionRefs.current.set(key, element);
                          } else {
                            classificationPositionRefs.current.delete(key);
                          }
                        }}
                        className={styles.classificationPositionValue}
                        style={{ opacity: entry.status === "dnf" ? 1 : 0 }}
                      >
                        DNF
                      </span>
                    </span>
                  </MicroText>
                </span>
                <strong>
                  <MicroText scale={0.59375} origin="center">
                    {entry.code}
                  </MicroText>
                </strong>
                <span className={styles.driverSwatch} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function QuizPanel({
  state,
  mode,
  question,
  score,
  playerPosition,
  racePhase,
  onAnswer,
  manualRaceAdvance,
  onManualRaceAdvance,
}: {
  state: FlowState;
  mode: MonzaV2SkinProps["mode"];
  question: Question;
  score: number;
  playerPosition: number;
  racePhase: NonNullable<MonzaV2SkinProps["racePhase"]>;
  onAnswer: MonzaV2SkinProps["onRaceAnswer"];
  manualRaceAdvance: boolean;
  onManualRaceAdvance?: () => void;
}) {
  const selected = state.lapAnswers[state.currentLap] ?? null;
  const verdict =
    racePhase === "result" && selected !== null
      ? selected === question.answer
        ? "correct"
        : "wrong"
      : null;
  const radio = (mode === "notte" ? NIGHT_RADIOS : DAY_RADIOS)[Math.min(state.currentLap, 5)];
  const canPick = racePhase === "question" && selected === null;

  return (
    <div className={styles.quizPanel}>
      <div className={styles.questionMeta}>
        <span className={styles.eventChip}>
          <MicroText scale={0.5625}>{question.event.toUpperCase()}</MicroText>
        </span>
        <MicroText scale={0.625} origin="right center">
          Q {Math.min(state.currentLap + 1, 6)} / 6
        </MicroText>
      </div>
      <h2>{sentenceCase(question.prompt)}</h2>
      <div className={styles.options}>
        {question.options.map((option, index) => {
          const chosen = selected === index;
          const correct = verdict !== null && index === question.answer;
          const wrong = verdict === "wrong" && chosen;
          const dimmed = verdict !== null && !correct && !wrong;
          return (
            <Button
              key={`${state.currentLap}-${option}`}
              type="button"
              radius="none"
              variant="light"
              disableRipple
              onPress={() => onAnswer(index)}
              isDisabled={!canPick}
              aria-pressed={chosen}
              className={cx(
                styles.option,
                racePhase === "lap" && chosen && styles.optionChosen,
                correct && styles.optionCorrect,
                wrong && styles.optionWrong,
                dimmed && styles.optionDimmed,
              )}
            >
              {sentenceCase(option)}
            </Button>
          );
        })}
      </div>
      <div className={styles.feedbackSlot} aria-live="polite">
        {racePhase === "lap" && (
          <div className={styles.radioCard}>
            <strong>
              TEAM RADIO <span aria-hidden="true">▮</span>
            </strong>
            <p>{radio}</p>
          </div>
        )}
        {verdict && (
          <div className={styles.verdictCard}>
            <strong className={verdict === "correct" ? styles.goodText : styles.badText}>
              {verdict === "correct" ? "CORRECT" : "INCORRECT"}
            </strong>
            <p>{sentenceCase(question.fact)}</p>
            {manualRaceAdvance && onManualRaceAdvance && (
              <Button
                radius="none"
                variant="light"
                disableRipple
                onPress={onManualRaceAdvance}
                className={styles.inlineAdvance}
              >
                <MicroText scale={0.625} origin="center">
                  NEXT LAP →
                </MicroText>
              </Button>
            )}
          </div>
        )}
      </div>
      <p className={styles.debugLine}>
        <MicroText scale={0.5625}>
          SIM · {state.raceCurve} curve · {score}✓{" "}
          {state.lapAnswers.filter((answer) => answer !== null).length - score}✕ ·
          ledger P{playerPosition}
        </MicroText>
      </p>
    </div>
  );
}

function WarmupOverlay({
  state,
  locked,
  onPick,
  onNext,
  onSkip,
}: {
  state: FlowState;
  locked: boolean;
  onPick: MonzaV2SkinProps["onWarmupAnswer"];
  onNext: MonzaV2SkinProps["onWarmupNext"];
  onSkip: MonzaV2SkinProps["onWarmupSkip"];
}) {
  const stepIndex = Math.min(state.tutorialStep, 2);
  const warmup = WARMUPS[stepIndex];
  const selected = state.tutorialAnswers[stepIndex] ?? null;
  const reveal = selected !== null && !locked;
  const correct = selected === warmup.answer;

  return (
    <section className={styles.lowerOverlay} aria-label={`Formation warmup ${stepIndex + 1} of 3`}>
      <div className={styles.overlayMeta}>
        <span className={styles.eventChip}>
          <MicroText scale={0.5625}>FORMATION LAP</MicroText>
        </span>
        <MicroText scale={0.625}>W {stepIndex + 1} / 3</MicroText>
        <Button
          radius="none"
          variant="light"
          disableRipple
          isDisabled={locked}
          onPress={onSkip}
          className={styles.textButton}
        >
          <MicroText scale={0.625} origin="center">
            SKIP »
          </MicroText>
        </Button>
      </div>
      <h2>{warmup.prompt}</h2>
      <div className={styles.warmupOptions}>
        {warmup.options.map((option, index) => {
          const isPicked = selected === index;
          const isCorrect = reveal && index === warmup.answer;
          const isWrong = reveal && isPicked && !isCorrect;
          return (
            <Button
              key={option}
              radius="none"
              variant="light"
              disableRipple
              isDisabled={selected !== null}
              onPress={() => onPick(index)}
              aria-pressed={isPicked}
              className={cx(
                styles.option,
                locked && isPicked && styles.optionChosen,
                locked && !isPicked && styles.optionDimmed,
                isCorrect && styles.optionCorrect,
                isWrong && styles.optionWrong,
                reveal && !isCorrect && !isWrong && styles.optionDimmed,
              )}
            >
              {option}
            </Button>
          );
        })}
      </div>
      {reveal && (
        <>
          <div className={styles.warmupNote} aria-live="polite">
            <strong className={correct ? styles.goodText : styles.badText}>
              {correct ? "RIGHT CALL" : "NOT QUITE"}
            </strong>
            <p>{warmup.note}</p>
          </div>
          <Button
            radius="none"
            disableRipple
            onPress={onNext}
            className={styles.primaryButton}
          >
            {stepIndex < 2 ? "NEXT →" : "TO THE GRID →"}
          </Button>
        </>
      )}
    </section>
  );
}

function PitOverlay({
  state,
  elapsedMs,
  onBegin,
  onTyre,
  onContinue,
  requiresManualContinue,
}: {
  state: FlowState;
  elapsedMs: number | null;
  onBegin: MonzaV2SkinProps["onPitBegin"];
  onTyre: MonzaV2SkinProps["onPitTyre"];
  onContinue: MonzaV2SkinProps["onPitContinue"];
  requiresManualContinue: boolean;
}) {
  const running = state.pitStop.phase === "running";
  const done = state.pitStop.resultMs !== null;
  const idle = !running && !done;
  const resultMs = state.pitStop.resultMs;
  const band = pitBand(resultMs);
  const liveMs = running ? (elapsedMs ?? 0) : (resultMs ?? 0);
  const message =
    state.pitStop.step === 0
      ? "GO GO GO — FRONT LEFT FIRST."
      : `${TYRES[Math.min(state.pitStop.step, 3)]} NEXT.`;

  return (
    <section className={styles.lowerOverlay} aria-label="Pit stop challenge">
      <div className={styles.overlayMeta}>
        <span className={styles.pitChip}>
          <MicroText scale={0.5625}>PIT STOP CHALLENGE</MicroText>
        </span>
        <span className={styles.pitClock}>{(liveMs / 1000).toFixed(1)}s</span>
      </div>

      {idle && (
        <>
          <h2>Box this lap. Four tyres, in order, against the clock.</h2>
          <p className={styles.bodyCopy}>
            Front left → front right → rear left → rear right. A wrong corner costs
            300ms. Positions hold while you&apos;re stationary.
          </p>
          <Button radius="none" disableRipple onPress={onBegin} className={styles.primaryButton}>
            BEGIN THE STOP →
          </Button>
        </>
      )}

      {running && (
        <>
          <div className={styles.tyreGrid}>
            {TYRES.map((tyre, index) => {
              const complete = index < state.pitStop.step;
              const target = index === state.pitStop.step;
              return (
                <Button
                  key={tyre}
                  radius="none"
                  variant="light"
                  disableRipple
                  onPress={() => onTyre(index)}
                  className={cx(
                    styles.tyreButton,
                    complete && styles.tyreComplete,
                    target && styles.tyreTarget,
                  )}
                  aria-label={`${tyre}${target ? ", next tyre" : ""}`}
                >
                  <strong>{complete ? "✓" : index + 1}</strong>
                  <span>{tyre}</span>
                </Button>
              );
            })}
          </div>
          <p className={styles.pitMessage} aria-live="assertive">
            <MicroText scale={0.625}>{message}</MicroText>
            {state.pitStop.penaltyMs > 0 && (
              <MicroText
                key={state.pitStop.penaltyMs}
                scale={0.625}
                className={styles.pitPenaltyFlash}
              >
                WRONG CORNER — +300MS.
              </MicroText>
            )}
          </p>
        </>
      )}

      {done && (
        <>
          <p className={styles.eyebrow}>STATIONARY TIME</p>
          <p className={cx(styles.pitResult, styles[`tone_${band.tone}`])}>
            {((resultMs ?? 0) / 1000).toFixed(2)}s
          </p>
          <p className={cx(styles.resultBand, styles[`tone_${band.tone}`])}>
            <MicroText scale={0.5625}>{band.word}</MicroText>
          </p>
          <p className={styles.bodyCopy}>Box clear — rejoining the race.</p>
          {requiresManualContinue && (
            <Button
              radius="none"
              disableRipple
              onPress={onContinue}
              className={styles.inlineAdvance}
            >
              <MicroText scale={0.625} origin="center">
                REJOIN THE RACE →
              </MicroText>
            </Button>
          )}
        </>
      )}
    </section>
  );
}

function IntroOverlay({ onStart }: { onStart: MonzaV2SkinProps["onStartFormation"] }) {
  return (
    <section className={styles.introOverlay} aria-labelledby="monza-v2-title">
      <div className={styles.introCard}>
        <div className={styles.epigraph}>
          <span />
          <em>The Temple of Speed</em>
          <span />
        </div>
        <h1 id="monza-v2-title">MONZA</h1>
        <p className={styles.gpSubtitle}>
          <MicroText scale={0.59375} origin="center">
            ITALIAN GRAND PRIX
          </MicroText>
        </p>
        <svg viewBox="0 0 130 130" className={styles.stamp} aria-hidden="true">
          <defs>
            <path id="monza-stamp-top" d="M 24,65 A 41 41 0 0 1 106,65" />
            <path id="monza-stamp-bottom" d="M 24,65 A 41 41 0 0 0 106,65" />
          </defs>
          <g className={styles.stampGroup}>
            <circle cx="65" cy="65" r="53" />
            <circle cx="65" cy="65" r="48" />
            <text><textPath href="#monza-stamp-top" startOffset="50%" textAnchor="middle">AUTODROMO NAZIONALE</textPath></text>
            <text><textPath href="#monza-stamp-bottom" startOffset="50%" textAnchor="middle">MONZA · MCMXXII</textPath></text>
            <text x="65" y="55" textAnchor="middle" className={styles.stampSmall}>DAL</text>
            <text x="65" y="80" textAnchor="middle" className={styles.stampYear}>1922</text>
          </g>
        </svg>
        <p className={styles.introCopy}>
          6 questions, 6 laps, starting P10 of 10. Each answer plays a lap — the
          racing reveals the verdict. Perfect run wins. One mistake still makes the
          podium. Zero correct retires the car. First: the formation lap — three
          warm-up questions while the field files round — then five lights and your
          launch reaction.
        </p>
        <Button radius="none" disableRipple onPress={onStart} className={styles.primaryButton}>
          START FORMATION LAP
        </Button>
        <p className={styles.introFoot}>
          FASTEST LAP IN F1 HISTORY — SET HERE · VERSTAPPEN · 264.7 KM/H AVG · 2025
        </p>
      </div>
    </section>
  );
}

function JumpCard({ onRetry }: { onRetry: MonzaV2SkinProps["onRetryStart"] }) {
  return (
    <div className={styles.mapModal}>
      <div className={cx(styles.compactCard, styles.jumpCard)} role="alert">
        <h2>Jump start</h2>
        <p>
          <MicroText scale={0.5625} origin="center">
            LIGHTS WERE STILL ON — BACK TO THE GRID
          </MicroText>
        </p>
        <Button radius="none" disableRipple onPress={onRetry} className={styles.dangerButton}>
          RETRY THE START
        </Button>
      </div>
    </div>
  );
}

function ReactionCard({
  reactionMs,
  bestReactionMs,
  jumpStarts,
  onRetry,
  onRace,
}: {
  reactionMs: number;
  bestReactionMs: number | null;
  jumpStarts: number;
  onRetry: MonzaV2SkinProps["onRetryStart"];
  onRace: MonzaV2SkinProps["onBeginRace"];
}) {
  const rating = reactionBand(reactionMs);
  return (
    <div className={styles.mapModal}>
      <div className={styles.compactCard} aria-live="polite">
        <p className={styles.eyebrow}>REACTION TIME</p>
        <p className={cx(styles.reactionTime, styles[`tone_${rating.tone}`])}>
          {(reactionMs / 1000).toFixed(3)}s
        </p>
        <p className={cx(styles.resultBand, styles[`tone_${rating.tone}`])}>
          <MicroText scale={0.5625} origin="center">
            {rating.word}
          </MicroText>
        </p>
        <p className={styles.sessionBest}>
          SESSION BEST{" "}
          {bestReactionMs === null ? "—" : `${(bestReactionMs / 1000).toFixed(3)}S`}
          {jumpStarts > 0
            ? ` · ${jumpStarts} JUMP START${jumpStarts > 1 ? "S" : ""}`
            : ""}
        </p>
        <div className={styles.reactionActions}>
          <Button radius="none" variant="light" disableRipple onPress={onRetry} className={styles.secondaryButton}>
            <MicroText scale={0.625} origin="center">
              RETRY
            </MicroText>
          </Button>
          <Button radius="none" disableRipple onPress={onRace} className={styles.primaryButton}>
            AWAY WE GO »
          </Button>
        </div>
      </div>
    </div>
  );
}

function FinishReport({
  state,
  mode,
  score,
  position,
  dnf,
  onRestart,
}: {
  state: FlowState;
  mode: MonzaV2SkinProps["mode"];
  score: number;
  position: number;
  dnf: boolean;
  onRestart: MonzaV2SkinProps["onRestart"];
}) {
  const reactionMs = state.startDrill.resultMs;
  const reaction = reactionBand(reactionMs);
  const pit = pitBand(state.pitStop.resultMs);
  const scene: FinishScene = dnf
    ? "dnf"
    : position === 1
      ? "p1"
      : position <= 3
        ? "podium"
        : position <= 6
          ? "points"
          : "finished";
  const title = dnf
    ? "DNF — Retired"
    : position === 1
      ? "Race Winner"
      : position <= 3
        ? `Podium — P${position}`
        : position <= 6
          ? `In the Points — P${position}`
          : `Classified — P${position}`;
  const curve = state.raceCurve;

  return (
    <section className={styles.finishOverlay} aria-labelledby="monza-finish-title">
      <header>
        <span>
          <MicroText scale={0.59375}>CHEQUERED FLAG</MicroText>
        </span>
        <span>
          <MicroText scale={0.5625} origin="right center">
            MONZA {mode === "notte" ? "/" : "·"} RACE REPORT
          </MicroText>
        </span>
      </header>
      <div className={styles.finishArt}>
        <FinishIllustration mode={mode} scene={scene} position={position} />
      </div>
      <div className={styles.finishBody}>
        <div>
          <h1 id="monza-finish-title" className={dnf ? styles.badText : undefined}>{title}</h1>
          <p className={styles.finishSub}>
            <MicroText scale={0.5625}>
              {score} of 6 correct ·{" "}
              {curve === "defend" ? "defend-the-lead" : "snatch-at-the-line"}{" "}
              script
            </MicroText>
          </p>
        </div>
        <div className={styles.finishStats}>
          <div><strong>{score}/6</strong><span>CORRECT</span></div>
          <div><strong className={styles[`tone_${reaction.tone}`]}>{reactionMs ?? "—"}<small>ms</small></strong><span>REACTION</span></div>
          <div><strong className={styles[`tone_${pit.tone}`]}>{state.pitStop.resultMs === null ? "—" : `${(state.pitStop.resultMs / 1000).toFixed(2)}s`}</strong><span>PIT STOP</span></div>
          <div><strong>{dnf ? "DNF" : `P${position}`}</strong><span>FROM P10</span></div>
        </div>
        <div className={styles.lapChart}>
          <p>LAP CHART — SIX LAPS, SIX CALLS</p>
          <div>
            {[0, 1, 2, 3, 4, 5].map((lap) => {
              const answer = state.lapAnswers[lap];
              const complete = answer !== null;
              const correct = complete && answer === state.weekendQuestions[lap]?.answer;
              return (
                <span
                  key={lap}
                  className={complete ? (correct ? styles.lapCorrect : styles.lapWrong) : undefined}
                >
                  <strong>{complete ? (correct ? "✓" : "✕") : "·"}</strong>
                  <small>L{lap + 1}</small>
                </span>
              );
            })}
          </div>
        </div>
        <div className={styles.finishActions}>
          <p>
            BEST REACTION{" "}
            {state.bestReactionMs === null
              ? "—"
              : `${(state.bestReactionMs / 1000).toFixed(3)}S`}{" "}
            · {state.pitStop.resultMs === null
              ? "PIT SKIPPED"
              : state.pitStop.penaltyMs > 0
                ? `PIT +${state.pitStop.penaltyMs}MS PENALTY`
                : "PIT CLEAN"}{" "}
            · GRID P10
          </p>
          <Button radius="none" disableRipple onPress={onRestart} className={styles.primaryButton}>
            RUN ANOTHER GRAND PRIX
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MonzaV2Skin({
  state,
  mode,
  raceSim,
  racePhase: controlledRacePhase,
  classification: controlledClassification,
  playerPosition: controlledPlayerPosition,
  lapStartPosition,
  banner: controlledBanner,
  pitElapsedMs = null,
  jumpStartCount = 0,
  warmupLocked = false,
  launching = false,
  onModeChange,
  onSwitchToV1,
  onStartFormation,
  onWarmupAnswer,
  onWarmupNext,
  onWarmupSkip,
  onStartLights,
  onLaunchTap,
  onRetryStart,
  onBeginRace,
  onRaceAnswer,
  onSkipLap,
  onPitBegin,
  onPitTyre,
  onPitContinue,
  pitRequiresManualContinue = false,
  manualRaceAdvance = false,
  onManualRaceAdvance,
  onRestart,
  className,
  "aria-label": ariaLabel,
  ...sectionProps
}: MonzaV2SequenceBridgeProps) {
  const score = scoreFor(state);
  const finalPosition =
    state.finalPosition === null || state.finalPosition === "DNF"
      ? null
      : state.finalPosition;
  const dnf = state.finalPosition === "DNF";
  const playerPosition = Math.max(
    1,
    Math.min(
      10,
      controlledPlayerPosition ?? state.currentPosition ?? finalPosition ?? 10,
    ),
  );
  const classification = useMemo(
    () =>
      controlledClassification
        ? [...controlledClassification].sort((left, right) => left.position - right.position)
        : buildClassification(playerPosition, mode === "notte", dnf),
    [controlledClassification, dnf, mode, playerPosition],
  );
  const selected = state.lapAnswers[state.currentLap] ?? null;
  const presentationPhase = state.racePresentation.phase;
  const racePhase =
    controlledRacePhase ??
    (presentationPhase === "question" ||
    presentationPhase === "lap" ||
    presentationPhase === "result"
      ? presentationPhase
      : selected === null
        ? "question"
        : "result");
  const formationHolding = useFormationHolding(raceSim);
  const banner =
    controlledBanner ??
    state.racePresentation.banner ??
    defaultBanner(state, warmupLocked, formationHolding);
  const isFormationIntro =
    state.stage === "formation" && state.formationMode === "intro";
  const isWarmup =
    state.stage === "formation" && state.formationMode === "briefing";
  const isDrill = state.stage === "formation" && state.formationMode === "drill";
  const lightPhase = state.startDrill.phase;
  const showLights = isDrill && (lightPhase === "countdown" || lightPhase === "go");
  const isGo = lightPhase === "go";
  const isLightCapture = showLights;
  const showGridReady =
    isDrill &&
    lightPhase === "idle" &&
    state.startDrill.resultMs === null &&
    !launching;
  const showJump = isDrill && lightPhase === "early";
  const showReaction =
    isDrill &&
    lightPhase === "idle" &&
    state.startDrill.resultMs !== null &&
    !launching;
  const preRace = state.stage === "formation";
  const contentInactive = state.stage !== "race" || launching;
  const tagsVisible = !preRace && !launching;
  const question =
    state.weekendQuestions[state.currentLap] ??
    state.weekendQuestions[0];
  const positionDelta =
    lapStartPosition === undefined ? 0 : lapStartPosition - playerPosition;
  const lapLabel = isWarmup
    ? "FORM"
    : state.stage === "formation"
      ? "GRID"
      : state.stage === "pitstop"
        ? "PIT"
        : state.stage === "finish_intro" || state.stage === "finished"
          ? "FIN"
          : `LAP ${Math.min(state.currentLap + 1, 6)}/6`;
  const finishPosition = finalPosition ?? playerPosition;
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateScale = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const scale = Math.min(width / 390, height / 844, 430 / 390);
      root.style.setProperty("--v2-scale", String(scale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-mode={mode}
      data-stage={state.stage}
      data-grid-ready={
        showGridReady && typeof onStartLights === "function" ? "true" : undefined
      }
      className={cx(styles.root, className)}
      aria-label={ariaLabel ?? "Monza Formula 1 quiz grand prix"}
      {...sectionProps}
    >
      <header className={styles.header}>
        <div className={styles.masthead}>
          <strong>MONZA</strong>
          <span>ITALIAN GRAND PRIX</span>
          <em>
            <MicroText scale={0.75} className={styles.lapMicro}>
              {lapLabel}
            </MicroText>
          </em>
        </div>
        <div className={styles.headerTools}>
          <ThemeToggle mode={mode} onChange={onModeChange} />
          <span
            className={positionDelta >= 0 ? styles.goodText : styles.badText}
            aria-label={
              positionDelta === 0
                ? "No position change"
                : `${Math.abs(positionDelta)} position${Math.abs(positionDelta) === 1 ? "" : "s"} ${positionDelta > 0 ? "gained" : "lost"}`
            }
          >
            <MicroText scale={0.625} origin="right center">
              {positionDelta > 0
                ? `▲${positionDelta}`
                : positionDelta < 0
                  ? `▼${-positionDelta}`
                  : ""}
            </MicroText>
          </span>
          <strong className={cx(styles.positionBadge, dnf && styles.positionDnf)}>
            {dnf ? "DNF" : `P${playerPosition}`}
          </strong>
        </div>
      </header>

      <CircuitMap
        classification={classification}
        playerPosition={playerPosition}
        tagsVisible={tagsVisible}
        banner={banner}
        showLights={showLights}
        lightsOnCount={state.startDrill.lightsOnCount}
        isGo={isGo}
        racePhase={state.stage === "race" ? racePhase : undefined}
        onSkipLap={onSkipLap}
        raceSim={raceSim}
      />

      <ClassificationStrip entries={classification} raceSim={raceSim} />

      <div
        className={cx(styles.content, contentInactive && styles.contentMuted)}
        aria-hidden={contentInactive}
        inert={contentInactive}
      >
        {state.stage === "race" && question && (
          <QuizPanel
            state={state}
            mode={mode}
            question={question}
            score={score}
            playerPosition={playerPosition}
            racePhase={state.stage === "race" ? racePhase : "question"}
            onAnswer={onRaceAnswer}
            manualRaceAdvance={manualRaceAdvance}
            onManualRaceAdvance={onManualRaceAdvance}
          />
        )}
      </div>

      {isWarmup && (
        <WarmupOverlay
          state={state}
          locked={warmupLocked}
          onPick={onWarmupAnswer}
          onNext={onWarmupNext}
          onSkip={onWarmupSkip}
        />
      )}
      {state.stage === "pitstop" && (
        <PitOverlay
          state={state}
          elapsedMs={pitElapsedMs}
          onBegin={onPitBegin}
          onTyre={onPitTyre}
          onContinue={onPitContinue}
          requiresManualContinue={pitRequiresManualContinue}
        />
      )}
      {showJump && <JumpCard onRetry={onRetryStart} />}
      {showReaction && state.startDrill.resultMs !== null && (
        <ReactionCard
          reactionMs={state.startDrill.resultMs}
          bestReactionMs={state.bestReactionMs}
          jumpStarts={jumpStartCount}
          onRetry={onRetryStart}
          onRace={onBeginRace}
        />
      )}
      {isFormationIntro && <IntroOverlay onStart={onStartFormation} />}
      {state.stage === "finished" && (
        <FinishReport
          state={state}
          mode={mode}
          score={score}
          position={finishPosition}
          dnf={dnf}
          onRestart={onRestart}
        />
      )}

      {isLightCapture && (
        <Button
          type="button"
          radius="none"
          variant="light"
          disableRipple
          onPress={onLaunchTap}
          aria-label="Launch — tap at lights out"
          className={styles.launchTap}
        />
      )}

      <Button
        type="button"
        radius="none"
        variant="light"
        disableRipple
        isDisabled={isLightCapture}
        onPress={onSwitchToV1}
        aria-label="Switch to the original V1 skin"
        aria-hidden={isLightCapture}
        tabIndex={isLightCapture ? -1 : undefined}
        className={cx(styles.skinMark, isLightCapture && styles.skinMarkHidden)}
      >
        V2
      </Button>
    </section>
  );
}
