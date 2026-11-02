# Week 02: Conditionals and Loops — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 2 (`week-02`)
- **Lesson ID**: `week-02-decisions-and-loops`
- **Title**: Conditionals and Loops
- **Estimated Duration**: 18 minutes
- **Source File**: `src/content/lessons/week-02.mdx`

## 2. Narrative Context (The Hook)
At 3:14 AM, `srv-07` sits at 95% disk. Instead of watching a progress bar manually, you build a script that decides when a metric crosses a warning or critical threshold and loops across every host until the list is done.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Comparisons Are Just Values**: Six comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`) producing `bool` values (`True`, `False`); storing booleans in variables; combining conditions with parenthesized `and`, `or`, `not`.
- **Waypoint 2: The First True Branch Wins**: `if`, `elif`, and `else` control flow; ordering specific conditions (`percent >= 100`) before broader ones (`percent >= 90`); 4-space indentation as block syntax.
- **Waypoint 3: Loops That Wait**: `while` loops driven by a changing condition; avoiding silent infinite loops; `while True:` with reachable `break` and `continue` statements.
- **Waypoint 4: Counting What You Already Know**: `for` loops with `range(stop)` and `range(start, stop, step)`; off-by-one stop exclusion; pairing positions and values with `enumerate(..., start=1)`.

## 4. Key Traps & Edge Cases Covered
- Using `=` (assignment) instead of `==` (comparison) inside `if` or `while` raises `SyntaxError`.
- `"20" == 20` evaluates to `False` because strings and numbers never compare equal.
- Placing `if percent >= 90:` above `elif percent >= 100:` shadows the over-limit branch forever.
- Missing colons (`SyntaxError`) or wrong indentation (`IndentationError` / unindented lines running unconditionally).
- Forgetting to update the condition variable in a `while` loop causes an infinite hang.

## 5. Interactive Exercises & Components
- `w02-compare-disk-percent` (compound boolean comparison with `>= 90` and `< 100`)
- `w02-elif-order` (reordering `if`/`elif`/`else` threshold branches)
- `w02-range-total` (fixing off-by-one stop bound in `range(1, 6)`)
- PredictOutput: `w02-predict-branch-order`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week2_icon`)

### Strict Visual Rules Applied
- **Subject**: **Conditionals** — A railroad switch track splitting into three paths (one green, one amber, one red/off-white).
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week2_icon.svg`](./week2_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
.............KKKKKK.............
.............KAAAAK.............
.KKKKK.......KAAAAK.......KKKKK.
.KGGGKK......KAAAAK......KKWWWK.
.KGGGGKK....KKKKKKKK....KKWWWWK.
.KGGGGGKK....KAAAAK....KKWWWWWK.
.KKGGGGGKK...KAAAAK...KKWWWWWKK.
..KKGGGGGKK..KAAAAK..KKWWWWWKK..
...KKGGGGGKKKKKKKKKKKKWWWWWKK...
....KKGGGGGKKKAAAAKKKWWWWWKK....
.....KKGGGGGKKAAAAKKWWWWWKK.....
......KKGGGGGKAAAAKWWWWWKK......
.......KKGGGGGAAAAWWWWWKK.......
........KKKKKKKKKKKKKKKK........
.........KKAAAAAAAAAAKK.........
..........KAAAAAAAAAAK..........
..........KAAAAAAAAAAK..........
..........KKKKKKKKKKKK..........
............KKWWWWKK............
............KKWWWWKK............
...........KKKKKKKKKK...........
............KKWWWWKK............
............KKWWWWKK............
...........KKKKKKKKKK...........
............KKWWWWKK............
............KKWWWWKK............
...........KKKKKKKKKK...........
............KKKKKKKK............
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="26" y="4" width="12" height="1" fill="#000000" />
  <rect x="26" y="5" width="12" height="1" fill="#000000" />
  <rect x="26" y="6" width="2" height="1" fill="#000000" />
  <rect x="28" y="6" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="6" width="2" height="1" fill="#000000" />
  <rect x="26" y="7" width="2" height="1" fill="#000000" />
  <rect x="28" y="7" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="7" width="2" height="1" fill="#000000" />
  <rect x="2" y="8" width="10" height="1" fill="#000000" />
  <rect x="26" y="8" width="2" height="1" fill="#000000" />
  <rect x="28" y="8" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="8" width="2" height="1" fill="#000000" />
  <rect x="52" y="8" width="10" height="1" fill="#000000" />
  <rect x="2" y="9" width="10" height="1" fill="#000000" />
  <rect x="26" y="9" width="2" height="1" fill="#000000" />
  <rect x="28" y="9" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="9" width="2" height="1" fill="#000000" />
  <rect x="52" y="9" width="10" height="1" fill="#000000" />
  <rect x="2" y="10" width="2" height="1" fill="#000000" />
  <rect x="4" y="10" width="6" height="1" fill="#33FF00" />
  <rect x="10" y="10" width="4" height="1" fill="#000000" />
  <rect x="26" y="10" width="2" height="1" fill="#000000" />
  <rect x="28" y="10" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="10" width="2" height="1" fill="#000000" />
  <rect x="50" y="10" width="4" height="1" fill="#000000" />
  <rect x="54" y="10" width="6" height="1" fill="#F1F1F1" />
  <rect x="60" y="10" width="2" height="1" fill="#000000" />
  <rect x="2" y="11" width="2" height="1" fill="#000000" />
  <rect x="4" y="11" width="6" height="1" fill="#33FF00" />
  <rect x="10" y="11" width="4" height="1" fill="#000000" />
  <rect x="26" y="11" width="2" height="1" fill="#000000" />
  <rect x="28" y="11" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="11" width="2" height="1" fill="#000000" />
  <rect x="50" y="11" width="4" height="1" fill="#000000" />
  <rect x="54" y="11" width="6" height="1" fill="#F1F1F1" />
  <rect x="60" y="11" width="2" height="1" fill="#000000" />
  <rect x="2" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="12" width="8" height="1" fill="#33FF00" />
  <rect x="12" y="12" width="4" height="1" fill="#000000" />
  <rect x="24" y="12" width="16" height="1" fill="#000000" />
  <rect x="48" y="12" width="4" height="1" fill="#000000" />
  <rect x="52" y="12" width="8" height="1" fill="#F1F1F1" />
  <rect x="60" y="12" width="2" height="1" fill="#000000" />
  <rect x="2" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="8" height="1" fill="#33FF00" />
  <rect x="12" y="13" width="4" height="1" fill="#000000" />
  <rect x="24" y="13" width="16" height="1" fill="#000000" />
  <rect x="48" y="13" width="4" height="1" fill="#000000" />
  <rect x="52" y="13" width="8" height="1" fill="#F1F1F1" />
  <rect x="60" y="13" width="2" height="1" fill="#000000" />
  <rect x="2" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="10" height="1" fill="#33FF00" />
  <rect x="14" y="14" width="4" height="1" fill="#000000" />
  <rect x="26" y="14" width="2" height="1" fill="#000000" />
  <rect x="28" y="14" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="14" width="2" height="1" fill="#000000" />
  <rect x="46" y="14" width="4" height="1" fill="#000000" />
  <rect x="50" y="14" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="14" width="2" height="1" fill="#000000" />
  <rect x="2" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="10" height="1" fill="#33FF00" />
  <rect x="14" y="15" width="4" height="1" fill="#000000" />
  <rect x="26" y="15" width="2" height="1" fill="#000000" />
  <rect x="28" y="15" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="15" width="2" height="1" fill="#000000" />
  <rect x="46" y="15" width="4" height="1" fill="#000000" />
  <rect x="50" y="15" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="15" width="2" height="1" fill="#000000" />
  <rect x="2" y="16" width="4" height="1" fill="#000000" />
  <rect x="6" y="16" width="10" height="1" fill="#33FF00" />
  <rect x="16" y="16" width="4" height="1" fill="#000000" />
  <rect x="26" y="16" width="2" height="1" fill="#000000" />
  <rect x="28" y="16" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="16" width="2" height="1" fill="#000000" />
  <rect x="44" y="16" width="4" height="1" fill="#000000" />
  <rect x="48" y="16" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="16" width="4" height="1" fill="#000000" />
  <rect x="2" y="17" width="4" height="1" fill="#000000" />
  <rect x="6" y="17" width="10" height="1" fill="#33FF00" />
  <rect x="16" y="17" width="4" height="1" fill="#000000" />
  <rect x="26" y="17" width="2" height="1" fill="#000000" />
  <rect x="28" y="17" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="17" width="2" height="1" fill="#000000" />
  <rect x="44" y="17" width="4" height="1" fill="#000000" />
  <rect x="48" y="17" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="17" width="4" height="1" fill="#000000" />
  <rect x="4" y="18" width="4" height="1" fill="#000000" />
  <rect x="8" y="18" width="10" height="1" fill="#33FF00" />
  <rect x="18" y="18" width="4" height="1" fill="#000000" />
  <rect x="26" y="18" width="2" height="1" fill="#000000" />
  <rect x="28" y="18" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="18" width="2" height="1" fill="#000000" />
  <rect x="42" y="18" width="4" height="1" fill="#000000" />
  <rect x="46" y="18" width="10" height="1" fill="#F1F1F1" />
  <rect x="56" y="18" width="4" height="1" fill="#000000" />
  <rect x="4" y="19" width="4" height="1" fill="#000000" />
  <rect x="8" y="19" width="10" height="1" fill="#33FF00" />
  <rect x="18" y="19" width="4" height="1" fill="#000000" />
  <rect x="26" y="19" width="2" height="1" fill="#000000" />
  <rect x="28" y="19" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="19" width="2" height="1" fill="#000000" />
  <rect x="42" y="19" width="4" height="1" fill="#000000" />
  <rect x="46" y="19" width="10" height="1" fill="#F1F1F1" />
  <rect x="56" y="19" width="4" height="1" fill="#000000" />
  <rect x="6" y="20" width="4" height="1" fill="#000000" />
  <rect x="10" y="20" width="10" height="1" fill="#33FF00" />
  <rect x="20" y="20" width="24" height="1" fill="#000000" />
  <rect x="44" y="20" width="10" height="1" fill="#F1F1F1" />
  <rect x="54" y="20" width="4" height="1" fill="#000000" />
  <rect x="6" y="21" width="4" height="1" fill="#000000" />
  <rect x="10" y="21" width="10" height="1" fill="#33FF00" />
  <rect x="20" y="21" width="24" height="1" fill="#000000" />
  <rect x="44" y="21" width="10" height="1" fill="#F1F1F1" />
  <rect x="54" y="21" width="4" height="1" fill="#000000" />
  <rect x="8" y="22" width="4" height="1" fill="#000000" />
  <rect x="12" y="22" width="10" height="1" fill="#33FF00" />
  <rect x="22" y="22" width="6" height="1" fill="#000000" />
  <rect x="28" y="22" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="22" width="6" height="1" fill="#000000" />
  <rect x="42" y="22" width="10" height="1" fill="#F1F1F1" />
  <rect x="52" y="22" width="4" height="1" fill="#000000" />
  <rect x="8" y="23" width="4" height="1" fill="#000000" />
  <rect x="12" y="23" width="10" height="1" fill="#33FF00" />
  <rect x="22" y="23" width="6" height="1" fill="#000000" />
  <rect x="28" y="23" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="23" width="6" height="1" fill="#000000" />
  <rect x="42" y="23" width="10" height="1" fill="#F1F1F1" />
  <rect x="52" y="23" width="4" height="1" fill="#000000" />
  <rect x="10" y="24" width="4" height="1" fill="#000000" />
  <rect x="14" y="24" width="10" height="1" fill="#33FF00" />
  <rect x="24" y="24" width="4" height="1" fill="#000000" />
  <rect x="28" y="24" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="24" width="4" height="1" fill="#000000" />
  <rect x="40" y="24" width="10" height="1" fill="#F1F1F1" />
  <rect x="50" y="24" width="4" height="1" fill="#000000" />
  <rect x="10" y="25" width="4" height="1" fill="#000000" />
  <rect x="14" y="25" width="10" height="1" fill="#33FF00" />
  <rect x="24" y="25" width="4" height="1" fill="#000000" />
  <rect x="28" y="25" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="25" width="4" height="1" fill="#000000" />
  <rect x="40" y="25" width="10" height="1" fill="#F1F1F1" />
  <rect x="50" y="25" width="4" height="1" fill="#000000" />
  <rect x="12" y="26" width="4" height="1" fill="#000000" />
  <rect x="16" y="26" width="10" height="1" fill="#33FF00" />
  <rect x="26" y="26" width="2" height="1" fill="#000000" />
  <rect x="28" y="26" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="26" width="2" height="1" fill="#000000" />
  <rect x="38" y="26" width="10" height="1" fill="#F1F1F1" />
  <rect x="48" y="26" width="4" height="1" fill="#000000" />
  <rect x="12" y="27" width="4" height="1" fill="#000000" />
  <rect x="16" y="27" width="10" height="1" fill="#33FF00" />
  <rect x="26" y="27" width="2" height="1" fill="#000000" />
  <rect x="28" y="27" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="27" width="2" height="1" fill="#000000" />
  <rect x="38" y="27" width="10" height="1" fill="#F1F1F1" />
  <rect x="48" y="27" width="4" height="1" fill="#000000" />
  <rect x="14" y="28" width="4" height="1" fill="#000000" />
  <rect x="18" y="28" width="10" height="1" fill="#33FF00" />
  <rect x="28" y="28" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="28" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="28" width="4" height="1" fill="#000000" />
  <rect x="14" y="29" width="4" height="1" fill="#000000" />
  <rect x="18" y="29" width="10" height="1" fill="#33FF00" />
  <rect x="28" y="29" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="29" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="29" width="4" height="1" fill="#000000" />
  <rect x="16" y="30" width="32" height="1" fill="#000000" />
  <rect x="16" y="31" width="32" height="1" fill="#000000" />
  <rect x="18" y="32" width="4" height="1" fill="#000000" />
  <rect x="22" y="32" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="32" width="4" height="1" fill="#000000" />
  <rect x="18" y="33" width="4" height="1" fill="#000000" />
  <rect x="22" y="33" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="33" width="4" height="1" fill="#000000" />
  <rect x="20" y="34" width="2" height="1" fill="#000000" />
  <rect x="22" y="34" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="34" width="2" height="1" fill="#000000" />
  <rect x="20" y="35" width="2" height="1" fill="#000000" />
  <rect x="22" y="35" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="35" width="2" height="1" fill="#000000" />
  <rect x="20" y="36" width="2" height="1" fill="#000000" />
  <rect x="22" y="36" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="36" width="2" height="1" fill="#000000" />
  <rect x="20" y="37" width="2" height="1" fill="#000000" />
  <rect x="22" y="37" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="37" width="2" height="1" fill="#000000" />
  <rect x="20" y="38" width="24" height="1" fill="#000000" />
  <rect x="20" y="39" width="24" height="1" fill="#000000" />
  <rect x="24" y="40" width="4" height="1" fill="#000000" />
  <rect x="28" y="40" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="40" width="4" height="1" fill="#000000" />
  <rect x="24" y="41" width="4" height="1" fill="#000000" />
  <rect x="28" y="41" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="41" width="4" height="1" fill="#000000" />
  <rect x="24" y="42" width="4" height="1" fill="#000000" />
  <rect x="28" y="42" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="42" width="4" height="1" fill="#000000" />
  <rect x="24" y="43" width="4" height="1" fill="#000000" />
  <rect x="28" y="43" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="43" width="4" height="1" fill="#000000" />
  <rect x="22" y="44" width="20" height="1" fill="#000000" />
  <rect x="22" y="45" width="20" height="1" fill="#000000" />
  <rect x="24" y="46" width="4" height="1" fill="#000000" />
  <rect x="28" y="46" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="46" width="4" height="1" fill="#000000" />
  <rect x="24" y="47" width="4" height="1" fill="#000000" />
  <rect x="28" y="47" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="47" width="4" height="1" fill="#000000" />
  <rect x="24" y="48" width="4" height="1" fill="#000000" />
  <rect x="28" y="48" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="48" width="4" height="1" fill="#000000" />
  <rect x="24" y="49" width="4" height="1" fill="#000000" />
  <rect x="28" y="49" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="49" width="4" height="1" fill="#000000" />
  <rect x="22" y="50" width="20" height="1" fill="#000000" />
  <rect x="22" y="51" width="20" height="1" fill="#000000" />
  <rect x="24" y="52" width="4" height="1" fill="#000000" />
  <rect x="28" y="52" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="52" width="4" height="1" fill="#000000" />
  <rect x="24" y="53" width="4" height="1" fill="#000000" />
  <rect x="28" y="53" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="53" width="4" height="1" fill="#000000" />
  <rect x="24" y="54" width="4" height="1" fill="#000000" />
  <rect x="28" y="54" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="54" width="4" height="1" fill="#000000" />
  <rect x="24" y="55" width="4" height="1" fill="#000000" />
  <rect x="28" y="55" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="55" width="4" height="1" fill="#000000" />
  <rect x="22" y="56" width="20" height="1" fill="#000000" />
  <rect x="22" y="57" width="20" height="1" fill="#000000" />
  <rect x="24" y="58" width="16" height="1" fill="#000000" />
  <rect x="24" y="59" width="16" height="1" fill="#000000" />
</svg>
```
