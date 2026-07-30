# Monza V2 responsive design QA

## Evidence

- Source visual truth: `design-handoff/monza-v2-reference.html`
- Source screenshot: `output/playwright/v2-responsive/reference-390x844.png`
- Implementation screenshot: `output/playwright/v2-responsive/giorno-390x844.png`
- Responsive screenshot: `output/playwright/v2-responsive/giorno-320x568.png`
- Notte screenshot: `output/playwright/v2-responsive/notte-390x844.png`
- Formation screenshot: `output/playwright/v2-responsive/notte-formation-390x844.png`
- Side-by-side comparison: `output/playwright/v2-responsive/reference-vs-implementation-390x844.png`
- Viewport: 390 × 844 CSS px for the reference comparison; 320 × 568 CSS px for the short-screen check
- Pixel dimensions: both reference and implementation comparison captures are 390 × 844 at device scale factor 1; no density normalization was required
- State: V2 formation intro in giorno for the reference comparison, plus notte intro and notte formation-warmup responsive checks

## Full-view comparison

The 390 × 844 source and implementation were captured at the same viewport and combined into one 780 × 844 side-by-side image. The implementation preserves the reference card width, overlay placement, header/map/classification structure, color system, typography hierarchy, copy, border weight, and yellow offset shadow. The card differs by only a few pixels vertically, with no material change to composition or hierarchy.

The 320 × 568 implementation fills the available width instead of uniformly shrinking the full 390 × 844 canvas. Its intro card fits without document scrolling, and the shorter layout retains readable copy, the complete CTA, footer copy, and V2 mark.

## Focused-region comparison

A separate crop was not needed: the 1:1 side-by-side comparison keeps the masthead, theme control, title, stamp, body copy, CTA, and footer readable at native density. The additional full-size notte and formation captures verify theme geometry and map/classification alignment.

## Required fidelity surfaces

- Fonts and typography: the existing Bodoni Moda, Libre Franklin, Courier Prime, Space Grotesk, and IBM Plex Mono assignments remain unchanged. Display hierarchy, weights, wrapping, tracking, and microcopy scaling match the reference at 390 × 844 and remain legible at 320 × 568.
- Spacing and layout rhythm: the implementation matches the reference’s 24px intro-card inset at 390px, while short screens use scoped vertical compaction instead of whole-screen scaling. Giorno and notte share identical geometry.
- Colors and visual tokens: existing giorno/notte tokens, dim overlay, red/gold accents, borders, and shadows are unchanged.
- Image quality and asset fidelity: no illustration or track asset was replaced. The reference SVG paths, car geometry, tags, and outcome artwork remain in use.
- Copy and content: all V1 and V2 copy remains unchanged.

## Findings

- No actionable P0, P1, or P2 differences remain.
- The original defect was a P1 responsive mismatch: height-based whole-screen scaling reduced the 390px app to roughly 82% width in mobile Safari. It was fixed by removing global scaling, making the shell fluid, and adapting only vertical section sizes on short screens.

## Comparison history

1. Before: the user-provided iPhone captures showed a narrow, uniformly scaled V2 canvas with large side gutters and document scrolling beneath Safari chrome.
2. Fix: the fixed 390 × 844 transform was replaced with a full-width 320–430px layout, stable viewport locking, adaptive vertical sections, responsive map scaling, and proportional classification spacing.
3. After: the 390 × 844 implementation aligns with the reference side by side; the 320 × 568 implementation fills the viewport and fits its opening flow without page scroll. Notte preserves the same frame, and the formation map remains aligned.

## Browser verification

- Primary interactions tested: clean-load V2 giorno, giorno-to-notte switch, formation start, and responsive layout at 320 × 568, 360 × 800, 390 × 844, and 430 × 932.
- Scroll lock tested by programmatic scroll attempts at every viewport.
- Browser console and page errors checked by the responsive Playwright suite.

## Implementation checklist

- [x] Remove height-limited whole-screen scaling
- [x] Fill the mobile viewport width from 320–430px
- [x] Lock document scrolling in V2
- [x] Preserve V1 behavior when switching skins
- [x] Adapt track cars and classification to container width
- [x] Verify giorno, notte, and short-screen layouts

final result: passed
