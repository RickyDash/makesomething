"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useMemo, useState } from "react";

type SkipOption = {
  id: string;
  label: string;
  icon: string;
  iconClassName?: string;
  variant: "flat" | "bordered" | "light";
  className: string;
  description: string;
  tone: string;
};

type SkipHighlightVariant = {
  id: string;
  label: string;
  className: string;
  description: string;
  intensity: string;
};

const skipOptions: readonly SkipOption[] = [
  {
    id: "skip-01",
    label: "Option 01",
    icon: "⏭",
    variant: "flat",
    className: "bg-zinc-800 text-zinc-200 border border-zinc-700",
    description: "quiet neutral fill, simple presence",
    tone: "quiet neutral",
  },
  {
    id: "skip-02",
    label: "Option 02",
    icon: "»",
    variant: "flat",
    className: "bg-zinc-900/90 text-zinc-300 border border-zinc-700",
    description: "darker low-emphasis treatment",
    tone: "low contrast",
  },
  {
    id: "skip-03",
    label: "Option 03",
    icon: "»|",
    variant: "bordered",
    className: "border-zinc-600 bg-zinc-900/80 text-zinc-300",
    description: "outlined, clearly secondary",
    tone: "outlined",
  },
  {
    id: "skip-04",
    label: "Option 04",
    icon: "▷|",
    variant: "flat",
    className: "bg-slate-800 text-slate-200 border border-slate-600",
    description: "cool slate variant, muted intent",
    tone: "slate muted",
  },
  {
    id: "skip-05",
    label: "Option 05",
    icon: "↷",
    variant: "light",
    className: "bg-zinc-900 text-zinc-300 border border-zinc-700/80",
    description: "light variant with restrained border",
    tone: "soft light",
  },
  {
    id: "skip-06",
    label: "Option 06",
    icon: "↪",
    variant: "bordered",
    className: "border-zinc-600 bg-zinc-950 text-zinc-300",
    description: "minimal outlined, very non-cta",
    tone: "minimal",
  },
  {
    id: "skip-07",
    label: "Option 07",
    icon: "⤼",
    variant: "flat",
    className: "bg-zinc-800/80 text-zinc-300 border border-dashed border-zinc-600",
    description: "dashed border reads optional",
    tone: "optional",
  },
  {
    id: "skip-08",
    label: "Option 08",
    icon: "⇢",
    variant: "light",
    className: "bg-zinc-900 text-zinc-200 border border-zinc-600/80",
    description: "clean light style, compact contrast",
    tone: "clean muted",
  },
  {
    id: "skip-09",
    label: "Option 09",
    icon: "⋙",
    iconClassName: "-translate-y-[2px]",
    variant: "flat",
    className: "bg-stone-800 text-stone-200 border border-stone-600",
    description: "warm neutral low-energy option",
    tone: "warm neutral",
  },
  {
    id: "skip-10",
    label: "Option 10",
    icon: "➤",
    variant: "bordered",
    className: "border-zinc-700 bg-zinc-900 text-zinc-200",
    description: "structured outline with subtle fill",
    tone: "structured",
  },
  {
    id: "skip-11",
    label: "Option 11",
    icon: "⏩",
    variant: "flat",
    className: "bg-zinc-900 text-zinc-200 border border-zinc-600/90",
    description: "compact dense dark button",
    tone: "dense dark",
  },
  {
    id: "skip-12",
    label: "Option 12",
    icon: "⤴",
    variant: "light",
    className: "bg-zinc-800/90 text-zinc-200 border border-zinc-700/90",
    description: "softly elevated but restrained",
    tone: "soft raised",
  },
  {
    id: "skip-13",
    label: "Option 13",
    icon: "⤿",
    variant: "flat",
    className: "bg-slate-900 text-slate-200 border border-slate-700",
    description: "deep slate, low urgency",
    tone: "deep slate",
  },
  {
    id: "skip-14",
    label: "Option 14",
    icon: "↠",
    variant: "bordered",
    className: "border-zinc-700 bg-zinc-900/95 text-zinc-300",
    description: "outline-first, very secondary",
    tone: "outline first",
  },
  {
    id: "skip-15",
    label: "Option 15",
    icon: "⟫",
    variant: "flat",
    className: "bg-zinc-800 text-zinc-200 border border-zinc-700",
    description: "balanced neutral with clean symbol",
    tone: "balanced",
  },
  {
    id: "skip-16",
    label: "Option 16",
    icon: "⤳",
    variant: "bordered",
    className: "border-red-900/50 bg-zinc-900 text-zinc-200",
    description: "muted alert edge, still secondary",
    tone: "muted danger edge",
  },
];

const skipHighlightVariants: readonly SkipHighlightVariant[] = [
  {
    id: "hl-01",
    label: "Matte 01",
    className:
      "border border-transparent bg-zinc-900 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
    description: "most muted, no bright edge",
    intensity: "very low",
  },
  {
    id: "hl-02",
    label: "Matte 02",
    className:
      "border border-transparent bg-stone-900 text-stone-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
    description: "warm matte, subtle separation only",
    intensity: "very low",
  },
  {
    id: "hl-03",
    label: "Quiet 03",
    className: "border border-zinc-700 bg-zinc-800 text-zinc-200 shadow-none",
    description: "clean neutral, low emphasis",
    intensity: "low",
  },
  {
    id: "hl-04",
    label: "Quiet 04",
    className: "border border-stone-600 bg-stone-800 text-stone-200 shadow-none",
    description: "current option 09 baseline",
    intensity: "low",
  },
  {
    id: "hl-05",
    label: "Quiet 05",
    className: "border border-zinc-600 bg-zinc-800 text-zinc-100 shadow-none",
    description: "slightly brighter text only",
    intensity: "low-mid",
  },
  {
    id: "hl-06",
    label: "Soft Edge 06",
    className: "border border-stone-500/80 bg-stone-800 text-stone-100 shadow-none",
    description: "lighter edge without glow",
    intensity: "low-mid",
  },
  {
    id: "hl-07",
    label: "Soft Edge 07",
    className: "border border-zinc-500/80 bg-zinc-800 text-zinc-100 shadow-sm",
    description: "tiny elevation, still muted",
    intensity: "mid",
  },
  {
    id: "hl-08",
    label: "Soft Edge 08",
    className: "border border-stone-500 bg-stone-700 text-stone-100 shadow-sm",
    description: "warmer and a bit more visible",
    intensity: "mid",
  },
  {
    id: "hl-09",
    label: "Edge Lit 09",
    className: "border border-stone-400/90 bg-stone-700 text-stone-100 shadow-sm",
    description: "clear edge contrast, no external glow",
    intensity: "mid-high",
  },
  {
    id: "hl-10",
    label: "Edge Lit 10",
    className: "border border-zinc-400/90 bg-zinc-700 text-zinc-100 shadow-sm",
    description: "higher readability with subtle lift",
    intensity: "mid-high",
  },
  {
    id: "hl-11",
    label: "Bright 11",
    className: "border border-stone-300/90 bg-stone-700 text-white shadow-md",
    description: "noticeable highlight, closer to CTA",
    intensity: "high",
  },
  {
    id: "hl-12",
    label: "Bright 12",
    className: "border border-zinc-300/90 bg-zinc-700 text-white shadow-md",
    description: "strongest visibility in this set",
    intensity: "high",
  },
];

const option09 = skipOptions.find((option) => option.id === "skip-09") ?? skipOptions[0];

export default function SkipButtonLabPage() {
  const [selectedSkipOptionId, setSelectedSkipOptionId] = useState(skipOptions[0]?.id ?? "skip-01");
  const [previousSkipOptionId, setPreviousSkipOptionId] = useState<string | null>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState(skipHighlightVariants[3]?.id ?? "hl-04");
  const [previousHighlightId, setPreviousHighlightId] = useState<string | null>(null);

  const selectedOption = useMemo(
    () => skipOptions.find((option) => option.id === selectedSkipOptionId) ?? skipOptions[0],
    [selectedSkipOptionId],
  );
  const previousOption = useMemo(
    () => skipOptions.find((option) => option.id === previousSkipOptionId) ?? null,
    [previousSkipOptionId],
  );
  const selectedHighlightVariant = useMemo(
    () => skipHighlightVariants.find((variant) => variant.id === selectedHighlightId) ?? skipHighlightVariants[0],
    [selectedHighlightId],
  );
  const previousHighlightVariant = useMemo(
    () => skipHighlightVariants.find((variant) => variant.id === previousHighlightId) ?? null,
    [previousHighlightId],
  );

  const selectOption = (optionId: string) => {
    if (optionId === selectedSkipOptionId) return;
    setPreviousSkipOptionId(selectedSkipOptionId);
    setSelectedSkipOptionId(optionId);
  };

  const selectHighlightVariant = (variantId: string) => {
    if (variantId === selectedHighlightId) return;
    setPreviousHighlightId(selectedHighlightId);
    setSelectedHighlightId(variantId);
  };

  const renderSkipButton = (option: SkipOption, extraClassName = "") => (
    <Button
      variant={option.variant}
      className={`min-w-[128px] justify-center lowercase font-semibold tracking-wide ${option.className} ${extraClassName}`}
    >
      <span>skip</span>
      <span className={`ml-1.5 text-base leading-none ${option.iconClassName ?? ""}`}>{option.icon}</span>
    </Button>
  );

  const renderHighlightSkipButton = (variant: SkipHighlightVariant, extraClassName = "") => (
    <Button
      variant="flat"
      className={`min-w-[128px] justify-center lowercase font-semibold tracking-wide ${variant.className} ${extraClassName}`}
    >
      <span>skip</span>
      <span className={`ml-1.5 text-base leading-none ${option09.iconClassName ?? ""}`}>{option09.icon}</span>
    </Button>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#d4d4d8_0%,_#fafafa_36%,_#f4f4f5_100%)] px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <Card className="sticky top-3 z-20 border border-zinc-900/10 bg-zinc-950 text-white">
          <CardBody className="gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">skip button lab</p>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold">
                  secondary skip style preview
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip variant="flat" className="border border-zinc-600 bg-zinc-800 text-zinc-100">
                  current: {selectedOption.label}
                </Chip>
                <Chip variant="flat" className="border border-zinc-700 bg-zinc-900 text-zinc-300">
                  previous: {previousOption ? previousOption.label : "none yet"}
                </Chip>
              </div>
            </div>

            <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
              preview symbol-only skip buttons that read as optional and separate from progression actions.
              this page is lab-only and does not change your quiz yet.
            </p>

            <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">quick compare</p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">current</span>
                  {renderSkipButton(selectedOption)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">previous</span>
                  {previousOption ? (
                    renderSkipButton(previousOption)
                  ) : (
                    <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-[family-name:var(--font-manrope)] text-sm text-zinc-400">
                      select another option to compare
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border border-zinc-900/15 bg-zinc-950 text-white">
            <CardBody className="gap-4 p-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">option grid</p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                  16 skip button options
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {skipOptions.map((option) => {
                  const isSelected = option.id === selectedOption.id;

                  return (
                    <Card
                      key={option.id}
                      className={`border ${isSelected ? "border-zinc-300/50 bg-zinc-900 text-white" : "border-zinc-700/70 bg-zinc-900/70 text-zinc-100"}`}
                    >
                      <CardBody className="gap-3 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                            {option.label}
                          </p>
                          {isSelected && (
                            <Chip variant="flat" className="border border-zinc-500 bg-zinc-800 text-zinc-100">
                              selected
                            </Chip>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {renderSkipButton(option, "min-w-[104px]")}
                        </div>

                        <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                          {option.description}
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                          tone: {option.tone}
                        </p>

                        <div className="pt-1">
                          <Button
                            color="danger"
                            className="font-semibold"
                            onPress={() => selectOption(option.id)}
                          >
                            select this
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card className="border border-zinc-900/15 bg-zinc-950 text-white">
            <CardBody className="gap-4 p-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">in-context preview</p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                  selected skip in flow
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    formation briefing
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="flat" className="bg-zinc-800 text-zinc-100">
                      &lt;- previous
                    </Button>
                    <Button color="danger" className="font-semibold">
                      next weave -&gt;
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">{renderSkipButton(selectedOption)}</div>
                </div>

                <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                    starting-lights sequence
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="flat" className="bg-zinc-800 text-zinc-100">
                      &lt;- previous
                    </Button>
                    <Button color="warning" className="font-semibold">
                      initiate starting-lights sequence -&gt;
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">{renderSkipButton(selectedOption)}</div>
                </div>

                <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">pit stop</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="flat" className="bg-zinc-800 text-zinc-100">
                      &lt;- previous
                    </Button>
                    <Button color="warning" className="font-semibold">
                      begin pit stop -&gt;
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">{renderSkipButton(selectedOption)}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="border border-zinc-900/15 bg-zinc-950 text-white">
          <CardBody className="gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  highlight intensity tuning
                </p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                  option 09 brightness variants
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip variant="flat" className="border border-zinc-600 bg-zinc-800 text-zinc-100">
                  current: {selectedHighlightVariant.label}
                </Chip>
                <Chip variant="flat" className="border border-zinc-700 bg-zinc-900 text-zinc-300">
                  previous: {previousHighlightVariant ? previousHighlightVariant.label : "none yet"}
                </Chip>
              </div>
            </div>

            <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
              this section only changes how highlighted option 09 looks, from matte to brighter treatments.
            </p>

            <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                current vs previous intensity
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">current</span>
                  {renderHighlightSkipButton(selectedHighlightVariant)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">previous</span>
                  {previousHighlightVariant ? (
                    renderHighlightSkipButton(previousHighlightVariant)
                  ) : (
                    <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-[family-name:var(--font-manrope)] text-sm text-zinc-400">
                      select another intensity to compare
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {skipHighlightVariants.map((variant) => {
                  const isSelected = variant.id === selectedHighlightVariant.id;
                  return (
                    <Card
                      key={variant.id}
                      className={`border ${isSelected ? "border-zinc-300/50 bg-zinc-900 text-white" : "border-zinc-700/70 bg-zinc-900/70 text-zinc-100"}`}
                    >
                      <CardBody className="gap-3 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                            {variant.label}
                          </p>
                          {isSelected && (
                            <Chip variant="flat" className="border border-zinc-500 bg-zinc-800 text-zinc-100">
                              selected
                            </Chip>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {renderHighlightSkipButton(variant, "min-w-[104px]")}
                        </div>

                        <p className="font-[family-name:var(--font-manrope)] text-sm text-zinc-300">
                          {variant.description}
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                          intensity: {variant.intensity}
                        </p>

                        <div className="pt-1">
                          <Button
                            color="danger"
                            className="font-semibold"
                            onPress={() => selectHighlightVariant(variant.id)}
                          >
                            select this
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>

              <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                  in-flow intensity preview
                </p>

                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/80 p-2.5">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      formation briefing
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="flat" className="bg-zinc-800 text-zinc-100">
                        &lt;- previous
                      </Button>
                      <Button color="danger" className="font-semibold">
                        next weave -&gt;
                      </Button>
                      {renderHighlightSkipButton(selectedHighlightVariant)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/80 p-2.5">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      starting-lights sequence
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="flat" className="bg-zinc-800 text-zinc-100">
                        &lt;- previous
                      </Button>
                      <Button color="warning" className="font-semibold">
                        initiate starting-lights sequence -&gt;
                      </Button>
                      {renderHighlightSkipButton(selectedHighlightVariant)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/80 p-2.5">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">pit stop</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="flat" className="bg-zinc-800 text-zinc-100">
                        &lt;- previous
                      </Button>
                      <Button color="warning" className="font-semibold">
                        begin pit stop -&gt;
                      </Button>
                      {renderHighlightSkipButton(selectedHighlightVariant)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
