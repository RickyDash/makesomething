# Marker Border Color Revert Guide

To revert the marker border palette and finish-marker styling in `app/page.tsx`, restore these values/structures:

## `getBandMarkerClass`
```
green: "border-emerald-200 bg-emerald-400"
yellow: "border-amber-200 bg-amber-400"
red: "border-red-200 bg-red-500"
```

## `raceMiniBorderColors`
```
"border-red-200",
"border-orange-200",
"border-amber-200",
"border-yellow-200",
"border-stone-200",
"border-zinc-200",
```

## Tutorial mini markers
```
tutorialState === "unanswered" ? "border-zinc-500" : "border-zinc-400";
```

## Formation large diamond marker
```
"border-zinc-400 bg-zinc-100"
```

## Chequered flag finish marker

The current finish marker is no longer a single flat diamond. It is made of:

- a finish-position wrapper `div`
- a rotated `button` with `chequeredMarkerFillStyle`
- border state controlled by `chequeredActive ? "border-zinc-300" : "border-zinc-500"`
- overlay tint controlled by `chequeredActive ? "bg-white/8" : "bg-zinc-950/28"`
- a centered DNF-only `❌` overlay controlled by `isDnfFinish`

To revert that finish marker to the old flat diamond, replace the wrapper/button stack with:

```
chequeredActive ? "border-zinc-400 bg-zinc-100" : "border-zinc-500 bg-zinc-900"
```

In practice that means:

- remove the `chequeredMarkerFillStyle` fill span
- remove the overlay tint span
- remove the DNF `❌` overlay from the progress-bar finish marker
- restore a single absolute finish-marker button that carries both the border and background classes directly
