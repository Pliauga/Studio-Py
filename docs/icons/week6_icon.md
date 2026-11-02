# Week 06: Data Wrangling with Pandas — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 6 (`week-06`)
- **Lesson ID**: `week-06-pandas`
- **Title**: Data Wrangling with Pandas
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-06.mdx`

## 2. Narrative Context (The Hook)
The incident export has grown to 3,000 rows of `servers.csv` and nested loops take 40 seconds. You hand the entire table to `pandas` for vectorized column math, boolean mask filtering, and regional grouping.

## 3. Material Taught (Waypoints)
- **Waypoint 1: One Column, One Table**: `pd.Series` and `pd.DataFrame`, `pd.read_csv()`, whole-column vectorized arithmetic, index persistence, inspecting `.dtypes`, and converting `object` columns via `.astype(float)`.
- **Waypoint 2: Pointing at Rows**: Positional `.iloc[]` vs. label-based `.loc[]`, multi-column selection, boolean masks with `&` and `|`, and 3D DataFrame row filtering (`<SandboxEmbed mode="df" />` with `visualize_dataframe`, `filter_rows`).
- **Waypoint 3: One Number Per Group**: `.groupby("region")` paired with `.mean()`, `.agg(["mean", "max", "min"])`, `.size()`, `.value_counts()`, `.sort_values(ascending=False)`, and `.reset_index(drop=True)`.
- **Waypoint 4: Apply, Then Ship It**: `lambda` expressions, running functions down a Series with `.apply(classify)`, `.describe()`, and exporting clean reports via `.to_csv(path, index=False)`.

## 4. Key Traps & Edge Cases Covered
- Quoted numeric strings load as `object` dtype and must be cast with `.astype(float)` before division.
- Using Python `and`/`or` or omitting parentheses in boolean masks raises `ValueError`; use `(cond1) & (cond2)`.
- After filtering or sorting, original index labels stay attached, so `.loc[0]` can fail while `.iloc[0]` gets the first remaining row.
- Calling `.groupby()` without an aggregation method (`.mean()`, `.size()`) returns an uncomputed groupby object.

## 5. Interactive Exercises & Components
- `w06-dtype-arithmetic` (`.astype(float)` before column percentage math)
- `w06-filter-percent` (applying boolean mask `servers[over]`)
- `w06-scene-filter` (filtering DataFrame rows and syncing 3D scene via `filter_rows`)
- `w06-apply-classify` (`servers['percent'].apply(classify)`)
- PredictOutput: `w06-predict-object-column`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week6_icon`)

### Strict Visual Rules Applied
- **Subject**: **Pandas (Data)** — A spreadsheet grid with a few cells highlighted in green.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week6_icon.svg`](./week6_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KAAAAAAAKAAAAAAAAKAAAAAAAK...
...KAAAAAAAKAAAAAAAAKAAAAAAAK...
...KAAAAAAAKAAAAAAAAKAAAAAAAK...
...KAAAAAAAKAAAAAAAAKAAAAAAAK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KGGGGGGGKWWWWWWWWKGGGGGGGK...
...KGGGGGGGKWWWWWWWWKGGGGGGGK...
...KGGGGGGGKWWWWWWWWKGGGGGGGK...
...KGGGGGGGKWWWWWWWWKGGGGGGGK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KWWWWWWWKGGGGGGGGKWWWWWWWK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KWWWWWWWKWWWWWWWWKGGGGGGGK...
...KWWWWWWWKWWWWWWWWKGGGGGGGK...
...KWWWWWWWKWWWWWWWWKGGGGGGGK...
...KWWWWWWWKWWWWWWWWKGGGGGGGK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="6" y="6" width="52" height="1" fill="#000000" />
  <rect x="6" y="7" width="52" height="1" fill="#000000" />
  <rect x="6" y="8" width="2" height="1" fill="#000000" />
  <rect x="8" y="8" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="8" width="2" height="1" fill="#000000" />
  <rect x="24" y="8" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="8" width="2" height="1" fill="#000000" />
  <rect x="42" y="8" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="8" width="2" height="1" fill="#000000" />
  <rect x="6" y="9" width="2" height="1" fill="#000000" />
  <rect x="8" y="9" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="9" width="2" height="1" fill="#000000" />
  <rect x="24" y="9" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="9" width="2" height="1" fill="#000000" />
  <rect x="42" y="9" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="9" width="2" height="1" fill="#000000" />
  <rect x="6" y="10" width="2" height="1" fill="#000000" />
  <rect x="8" y="10" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="10" width="2" height="1" fill="#000000" />
  <rect x="24" y="10" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="10" width="2" height="1" fill="#000000" />
  <rect x="42" y="10" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="11" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="11" width="2" height="1" fill="#000000" />
  <rect x="24" y="11" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="11" width="2" height="1" fill="#000000" />
  <rect x="42" y="11" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="12" width="2" height="1" fill="#000000" />
  <rect x="24" y="12" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="12" width="2" height="1" fill="#000000" />
  <rect x="42" y="12" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="13" width="2" height="1" fill="#000000" />
  <rect x="24" y="13" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="13" width="2" height="1" fill="#000000" />
  <rect x="42" y="13" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#000000" />
  <rect x="8" y="14" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="14" width="2" height="1" fill="#000000" />
  <rect x="24" y="14" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="14" width="2" height="1" fill="#000000" />
  <rect x="42" y="14" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#000000" />
  <rect x="8" y="15" width="14" height="1" fill="#FFB000" />
  <rect x="22" y="15" width="2" height="1" fill="#000000" />
  <rect x="24" y="15" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="15" width="2" height="1" fill="#000000" />
  <rect x="42" y="15" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="52" height="1" fill="#000000" />
  <rect x="6" y="17" width="52" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="18" width="2" height="1" fill="#000000" />
  <rect x="24" y="18" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="18" width="2" height="1" fill="#000000" />
  <rect x="42" y="18" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="19" width="2" height="1" fill="#000000" />
  <rect x="24" y="19" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="19" width="2" height="1" fill="#000000" />
  <rect x="42" y="19" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="20" width="2" height="1" fill="#000000" />
  <rect x="24" y="20" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="20" width="2" height="1" fill="#000000" />
  <rect x="42" y="20" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="21" width="2" height="1" fill="#000000" />
  <rect x="24" y="21" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="21" width="2" height="1" fill="#000000" />
  <rect x="42" y="21" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="22" width="2" height="1" fill="#000000" />
  <rect x="24" y="22" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="22" width="2" height="1" fill="#000000" />
  <rect x="42" y="22" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="23" width="2" height="1" fill="#000000" />
  <rect x="24" y="23" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="23" width="2" height="1" fill="#000000" />
  <rect x="42" y="23" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="24" width="2" height="1" fill="#000000" />
  <rect x="24" y="24" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="24" width="2" height="1" fill="#000000" />
  <rect x="42" y="24" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="25" width="2" height="1" fill="#000000" />
  <rect x="24" y="25" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="25" width="2" height="1" fill="#000000" />
  <rect x="42" y="25" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="52" height="1" fill="#000000" />
  <rect x="6" y="27" width="52" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="28" width="2" height="1" fill="#000000" />
  <rect x="24" y="28" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="28" width="2" height="1" fill="#000000" />
  <rect x="42" y="28" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="29" width="2" height="1" fill="#000000" />
  <rect x="24" y="29" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="29" width="2" height="1" fill="#000000" />
  <rect x="42" y="29" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="30" width="2" height="1" fill="#000000" />
  <rect x="24" y="30" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="30" width="2" height="1" fill="#000000" />
  <rect x="42" y="30" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="31" width="2" height="1" fill="#000000" />
  <rect x="24" y="31" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="31" width="2" height="1" fill="#000000" />
  <rect x="42" y="31" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="32" width="2" height="1" fill="#000000" />
  <rect x="24" y="32" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="32" width="2" height="1" fill="#000000" />
  <rect x="42" y="32" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="33" width="2" height="1" fill="#000000" />
  <rect x="24" y="33" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="33" width="2" height="1" fill="#000000" />
  <rect x="42" y="33" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="34" width="2" height="1" fill="#000000" />
  <rect x="24" y="34" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="34" width="2" height="1" fill="#000000" />
  <rect x="42" y="34" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="14" height="1" fill="#33FF00" />
  <rect x="22" y="35" width="2" height="1" fill="#000000" />
  <rect x="24" y="35" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="35" width="2" height="1" fill="#000000" />
  <rect x="42" y="35" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="52" height="1" fill="#000000" />
  <rect x="6" y="37" width="52" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="38" width="2" height="1" fill="#000000" />
  <rect x="24" y="38" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="38" width="2" height="1" fill="#000000" />
  <rect x="42" y="38" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="39" width="2" height="1" fill="#000000" />
  <rect x="24" y="39" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="39" width="2" height="1" fill="#000000" />
  <rect x="42" y="39" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="40" width="2" height="1" fill="#000000" />
  <rect x="24" y="40" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="40" width="2" height="1" fill="#000000" />
  <rect x="42" y="40" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="41" width="2" height="1" fill="#000000" />
  <rect x="24" y="41" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="41" width="2" height="1" fill="#000000" />
  <rect x="42" y="41" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="42" width="2" height="1" fill="#000000" />
  <rect x="24" y="42" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="42" width="2" height="1" fill="#000000" />
  <rect x="42" y="42" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="43" width="2" height="1" fill="#000000" />
  <rect x="24" y="43" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="43" width="2" height="1" fill="#000000" />
  <rect x="42" y="43" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="44" width="2" height="1" fill="#000000" />
  <rect x="24" y="44" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="44" width="2" height="1" fill="#000000" />
  <rect x="42" y="44" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="45" width="2" height="1" fill="#000000" />
  <rect x="24" y="45" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="45" width="2" height="1" fill="#000000" />
  <rect x="42" y="45" width="14" height="1" fill="#F1F1F1" />
  <rect x="56" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="52" height="1" fill="#000000" />
  <rect x="6" y="47" width="52" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="48" width="2" height="1" fill="#000000" />
  <rect x="24" y="48" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="48" width="2" height="1" fill="#000000" />
  <rect x="42" y="48" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="49" width="2" height="1" fill="#000000" />
  <rect x="24" y="49" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="49" width="2" height="1" fill="#000000" />
  <rect x="42" y="49" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="50" width="2" height="1" fill="#000000" />
  <rect x="24" y="50" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="50" width="2" height="1" fill="#000000" />
  <rect x="42" y="50" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="51" width="2" height="1" fill="#000000" />
  <rect x="24" y="51" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="51" width="2" height="1" fill="#000000" />
  <rect x="42" y="51" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="52" width="2" height="1" fill="#000000" />
  <rect x="24" y="52" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="52" width="2" height="1" fill="#000000" />
  <rect x="42" y="52" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="53" width="2" height="1" fill="#000000" />
  <rect x="24" y="53" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="53" width="2" height="1" fill="#000000" />
  <rect x="42" y="53" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="2" height="1" fill="#000000" />
  <rect x="8" y="54" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="54" width="2" height="1" fill="#000000" />
  <rect x="24" y="54" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="54" width="2" height="1" fill="#000000" />
  <rect x="42" y="54" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="54" width="2" height="1" fill="#000000" />
  <rect x="6" y="55" width="2" height="1" fill="#000000" />
  <rect x="8" y="55" width="14" height="1" fill="#F1F1F1" />
  <rect x="22" y="55" width="2" height="1" fill="#000000" />
  <rect x="24" y="55" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="55" width="2" height="1" fill="#000000" />
  <rect x="42" y="55" width="14" height="1" fill="#33FF00" />
  <rect x="56" y="55" width="2" height="1" fill="#000000" />
  <rect x="6" y="56" width="52" height="1" fill="#000000" />
  <rect x="6" y="57" width="52" height="1" fill="#000000" />
</svg>
```
