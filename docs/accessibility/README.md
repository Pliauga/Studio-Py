# Accessibility evidence — fluid type, contrast, motion

Captured 2026-10-26 against `http://127.0.0.1:5200` with Playwright/Chrome
(viewport device scale factor 1). Raw computed values are in
[`measurements.json`](./measurements.json).

## 1. Root type structure

There is no `html { font-size }` rule. The browser default is left alone; the
fluid scale lives on `body` with rem floor and ceiling:

```css
/* src/app.css */
body {
  font-size: clamp(1rem, 0.5vw + 0.6rem, 1.6rem);
  line-height: 1.45;
}
```

`1rem` and `1.6rem` both follow the user's browser default, so the floor and
ceiling scale with a user preference; only the middle term is viewport-based.

| Browser default | Viewport | Root | Body / prose | Horizontal overflow |
| --- | --- | --- | --- | --- |
| 16 px | 1440 × 1000 | 16 px | **16.8 px** | none |
| 16 px | 390 × 844 | 16 px | **16 px** | none |
| 20 px | 1440 × 1000 | 20 px | **20 px** | none |
| 20 px | 390 × 844 | 20 px | **20 px** | none |
| 32 px (200% of 16) | 1440 × 1000 | 32 px | **32 px** | none |
| 32 px (200% of 16) | 390 × 844 | 32 px | **32 px** | none |

The 32 px case is the browser's default font size set to 32 px (not Ctrl+zoom).
All 24 combinations (4 routes × 2 widths × 3 defaults) report
`scrollWidth === clientWidth`; see `overflowMatrix` in `measurements.json`.
Screenshots: [`lesson-1440-font32.png`](./lesson-1440-font32.png),
[`lesson-390-font32.png`](./lesson-390-font32.png),
[`dashboard-390-font20.png`](./dashboard-390-font20.png).

## 2. Lesson scroll height

Method: viewport 1440 px wide, load
`/lesson/week-01-variables-types-and-output` with default 16 px browser font,
wait for `document.fonts.ready`, then read
`document.documentElement.scrollHeight / innerHeight`. Baseline method quoted by
the reviewer is 11.9 svh; the exact baseline viewport height is not part of that
number, so both common heights are reported:

| Viewport | scrollHeight | svh |
| --- | --- | --- |
| 1440 × 900 | 7838 px | **8.71** |
| 1440 × 1000 | 7838 px | **7.84** |

No text was reduced to reach this: body/prose is 16.8 px at 1440 (larger than
the 15.2 px baseline) and display headings were clamped to fixed px ranges, not
shrunk. The improvement comes from the shorter hero, tighter chapter rhythm,
20ch heading measure and 78ch body measure.

## 3. Contrast

WCAG 2.x sRGB ratios, computed from the token values actually used:

| Token | On `#f1f1f1` paper | On `#000000` |
| --- | --- | --- |
| Light `--color-tertiary` `#5a595e` | **6.15:1** (used) | 3.03:1 (not used) |
| Dark `--color-tertiary` `#a3a2a7` | 2.24:1 (not used) | **8.28:1** (used) |

The theme-aware pairing passes 4.5:1 in both modes: light tertiary on paper
6.15:1, dark tertiary on black 8.28:1. A single gray cannot pass on both
backgrounds — `#8a898e` is 3.07:1 on paper, and any gray dark enough for paper
fails on black — so the token swaps with the theme. The footer and hover panels
use `--color-paper` text on `--color-ink`, not the tertiary token.

## 4. Reduced motion

With `prefers-reduced-motion: reduce`:

```json
{
  "pageAnimation": "none",
  "pageTransition": "0s",
  "pageOpacity": "1",
  "scrollBehavior": "auto",
  "headerTransition": "0s"
}
```

The global kill switch is in `src/app.css` (`animation`, `animation-delay`,
`transition`, `scroll-behavior` forced off for `*`, `*::before`, `*::after`);
`src/routes/+layout.svelte` also explicitly disables `.page`'s fade. The title
scramble and floating-letter effects were already removed from the DOM layer in
the OFFMUTE pivot, so there is nothing left to disable there.

## 5. Header during a route transition

[`header-transition-sandbox.png`](./header-transition-sandbox.png) shows the
fixed difference-blended header over `/dev/sandbox-test` while the page wrapper
is mid-fade. To make the 250 ms fade observable in a still, CDP
`Animation.setPlaybackRate` was set to `0.1` (10× slow motion) for the capture;
the animation itself is unchanged at 250 ms.

Measured at capture:

```json
{
  "opacityDuring": "0.260331",
  "headerOutsidePage": true,
  "headerBlend": "difference",
  "sandboxCanvasPresent": true
}
```

The header is a sibling of `.page`, not a descendant, so the wrapper's opacity
does not affect it. Full values in `measurements.json`.

## 6. Attestations

- `pnpm lint:pedagogy` → `Checked 77 exercises across 96 waypoints: 0 violation(s) in 0 exercise(s).` (exit 0)
- `rg '\$lib/' src` → no matches; all internal imports use `#lib/`.
- Svelte 5 runes only: no `svelte/store` imports, no `export let`; components use
  `$state`, `$derived`, `$props`, `$effect`.
- `metadata.id` routing untouched: no `.mdx` or lesson metadata file changed;
  the diff is CSS/layout only.
- `pnpm check` → 0 errors, 0 warnings.
- `pnpm build` → success (`@sveltejs/adapter-cloudflare` done). The pre-existing
  chunk-size warning for the Pyodide bundle is unchanged.
