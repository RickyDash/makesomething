# Marker Border Color Revert Guide

To revert all marker borders back from `border-zinc-400`, restore these values:

## getBandMarkerClass (lines ~87-89)
```
green: "border-emerald-200 bg-emerald-400"
yellow: "border-amber-200 bg-amber-400"
red: "border-red-200 bg-red-500"
```

## raceMiniBorderColors (lines ~150-157)
```
"border-red-200",
"border-orange-200",
"border-amber-200",
"border-yellow-200",
"border-stone-200",
"border-zinc-200",
```

## Tutorial mini markers answered border (line ~1128)
```
tutorialState === "unanswered" ? "border-zinc-500" : "border-zinc-400";
```
(this one was already border-zinc-400, no change needed)

## Formation large diamond active (line ~1176)
```
"border-zinc-400 bg-zinc-100"
```
(already border-zinc-400, no change needed)

## Chequered flag large diamond active (line ~1210)
```
chequeredActive ? "border-zinc-400 bg-zinc-100" : "border-zinc-500 bg-zinc-900"
```
(already border-zinc-400, no change needed)
