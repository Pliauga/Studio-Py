# Week 01: Variables, Types, and Output — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 1 (`week-01`)
- **Lesson ID**: `week-01-variables-types-and-output`
- **Title**: Variables, Types, and Output
- **Estimated Duration**: 16 minutes
- **Source File**: `src/content/lessons/week-01.mdx`

## 2. Narrative Context (The Hook)
At 2:47 AM, primary storage node `srv-07` is filling up fast. Instead of doing percentage math from a monitor sticky note on a phone calculator, you write a Python script that holds disk capacity and usage numbers, converts types explicitly, computes percentages, and prints a clean status line.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Print What You Mean, Name What You Keep**: `print()` output, variable assignment (`=`), top-to-bottom execution, `NameError` on undefined/misspelled names, variable reassignment, and `snake_case` naming rules (`srv_07` vs `srv-07`).
- **Waypoint 2: Every Value Has a Type**: Distinguishing `str`, `int`, and `float` with `type()`; operator overloading (`+` and `*` on numbers vs. string concatenation/repetition); `TypeError` and `ValueError`; explicit conversion with `int()`, `float()`, and `str()`.
- **Waypoint 3: Arithmetic That Does Not Surprise You**: Standard operators (`+`, `-`, `*`, `/` always returning `float`), floor division (`//`), modulo (`%`), exponentiation (`**`), and controlling evaluation order with parentheses for delta/percentage calculations.
- **Waypoint 4: One Clean Line with f-strings**: String interpolation with `f"{...}"` and floating-point format specifiers (`:.1f`, `:.2f`) to produce clean one-line operational reports.

## 4. Key Traps & Edge Cases Covered
- `"190" + "10"` concatenates to `"19010"` without raising an error.
- `"190" + 10` raises `TypeError`; `int("87.5")` raises `ValueError` (parse with `float()` first).
- Quoting a variable name (`print("hostname")`) prints the literal word instead of its value.
- Omitting the leading `f` on an f-string prints literal `{hostname}` braces.
- Using `^` performs bitwise XOR instead of exponentiation (`**`); dividing by `0` raises `ZeroDivisionError`.

## 5. Interactive Exercises & Components
- `w01-assign-and-print` (variable reassignment and `print`)
- `w01-cast-before-math` (`float()` conversion before `+`)
- `w01-delta-percentage` (parentheses for `(current_used - start_used) / limit * 100`)
- `w01-fstring-report` (f-string with `:.1f` formatting)
- PredictOutput: `w01-predict-string-concat`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week1_icon`)

### Strict Visual Rules Applied
- **Subject**: **Variables** — A cardboard box with a question mark ? stamped on the side.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week1_icon.svg`](./week1_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
................................
................................
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
..KAAAAAAAAAAAAKKAAAAAAAAAAAAK..
..KAAAAAAAAAAAAKKAAAAAAAAAAAAK..
..KAAAAAAAAAAAAKKAAAAAAAAAAAAK..
..KAAAAAAAAAAAAKKAAAAAAAAAAAAK..
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
....KWWWWWWWWWWWWWWWWWWWWWWK....
....KAAAAAAAAAAAAAAAAAAAAAAK....
....KAAAAAAAAAAAAAAAAAAAAAAK....
....KAAAAAAAAKKKKKKAAAAAAAAK....
....KAAAAAAAKWWWWWWKAAAAAAAK....
....KAAAAAAKWWKKKKWWKAAAAAAK....
....KAAAAAAKKKKAAKWWKAAAAAAK....
....KAAAAAAAAAAKKWWKAAAAAAAK....
....KAAAAAAAAAKWWWWKAAAAAAAK....
....KAAAAAAAAAKWWKKAAAAAAAAK....
....KAAAAAAAAAKKKKAAAAAAAAAK....
....KAAAAAAAAAKGGKAAAAAAAAAK....
....KAAAAAAAAAKGGKAAAAAAAAAK....
....KAAAAAAAAAKKKKAAAAAAAAAK....
....KAAAAAAAAAAAAAAAAAAAAAAK....
....KAAAAAAAAAAAAAAAAAAAAAAK....
....KAAAAAAAAAAAAAAAAAAAAAAK....
....KKKKKKKKKKKKKKKKKKKKKKKK....
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="4" y="10" width="56" height="1" fill="#000000" />
  <rect x="4" y="11" width="56" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="12" width="4" height="1" fill="#000000" />
  <rect x="34" y="12" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="13" width="4" height="1" fill="#000000" />
  <rect x="34" y="13" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="14" width="4" height="1" fill="#000000" />
  <rect x="34" y="14" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="15" width="4" height="1" fill="#000000" />
  <rect x="34" y="15" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="16" width="4" height="1" fill="#000000" />
  <rect x="34" y="16" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="16" width="2" height="1" fill="#000000" />
  <rect x="4" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="17" width="4" height="1" fill="#000000" />
  <rect x="34" y="17" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="17" width="2" height="1" fill="#000000" />
  <rect x="4" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="18" width="4" height="1" fill="#000000" />
  <rect x="34" y="18" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="18" width="2" height="1" fill="#000000" />
  <rect x="4" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="24" height="1" fill="#FFB000" />
  <rect x="30" y="19" width="4" height="1" fill="#000000" />
  <rect x="34" y="19" width="24" height="1" fill="#FFB000" />
  <rect x="58" y="19" width="2" height="1" fill="#000000" />
  <rect x="4" y="20" width="56" height="1" fill="#000000" />
  <rect x="4" y="21" width="56" height="1" fill="#000000" />
  <rect x="8" y="22" width="2" height="1" fill="#000000" />
  <rect x="10" y="22" width="44" height="1" fill="#F1F1F1" />
  <rect x="54" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="2" height="1" fill="#000000" />
  <rect x="10" y="23" width="44" height="1" fill="#F1F1F1" />
  <rect x="54" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="2" height="1" fill="#000000" />
  <rect x="10" y="24" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="2" height="1" fill="#000000" />
  <rect x="10" y="25" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="2" height="1" fill="#000000" />
  <rect x="10" y="26" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="2" height="1" fill="#000000" />
  <rect x="10" y="27" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="2" height="1" fill="#000000" />
  <rect x="10" y="28" width="16" height="1" fill="#FFB000" />
  <rect x="26" y="28" width="12" height="1" fill="#000000" />
  <rect x="38" y="28" width="16" height="1" fill="#FFB000" />
  <rect x="54" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="2" height="1" fill="#000000" />
  <rect x="10" y="29" width="16" height="1" fill="#FFB000" />
  <rect x="26" y="29" width="12" height="1" fill="#000000" />
  <rect x="38" y="29" width="16" height="1" fill="#FFB000" />
  <rect x="54" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="2" height="1" fill="#000000" />
  <rect x="10" y="30" width="14" height="1" fill="#FFB000" />
  <rect x="24" y="30" width="2" height="1" fill="#000000" />
  <rect x="26" y="30" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="30" width="2" height="1" fill="#000000" />
  <rect x="40" y="30" width="14" height="1" fill="#FFB000" />
  <rect x="54" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="2" height="1" fill="#000000" />
  <rect x="10" y="31" width="14" height="1" fill="#FFB000" />
  <rect x="24" y="31" width="2" height="1" fill="#000000" />
  <rect x="26" y="31" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="31" width="2" height="1" fill="#000000" />
  <rect x="40" y="31" width="14" height="1" fill="#FFB000" />
  <rect x="54" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="2" height="1" fill="#000000" />
  <rect x="10" y="32" width="12" height="1" fill="#FFB000" />
  <rect x="22" y="32" width="2" height="1" fill="#000000" />
  <rect x="24" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="28" y="32" width="8" height="1" fill="#000000" />
  <rect x="36" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="40" y="32" width="2" height="1" fill="#000000" />
  <rect x="42" y="32" width="12" height="1" fill="#FFB000" />
  <rect x="54" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="2" height="1" fill="#000000" />
  <rect x="10" y="33" width="12" height="1" fill="#FFB000" />
  <rect x="22" y="33" width="2" height="1" fill="#000000" />
  <rect x="24" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="28" y="33" width="8" height="1" fill="#000000" />
  <rect x="36" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="40" y="33" width="2" height="1" fill="#000000" />
  <rect x="42" y="33" width="12" height="1" fill="#FFB000" />
  <rect x="54" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="2" height="1" fill="#000000" />
  <rect x="10" y="34" width="12" height="1" fill="#FFB000" />
  <rect x="22" y="34" width="8" height="1" fill="#000000" />
  <rect x="30" y="34" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="34" width="2" height="1" fill="#000000" />
  <rect x="36" y="34" width="4" height="1" fill="#F1F1F1" />
  <rect x="40" y="34" width="2" height="1" fill="#000000" />
  <rect x="42" y="34" width="12" height="1" fill="#FFB000" />
  <rect x="54" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="2" height="1" fill="#000000" />
  <rect x="10" y="35" width="12" height="1" fill="#FFB000" />
  <rect x="22" y="35" width="8" height="1" fill="#000000" />
  <rect x="30" y="35" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="35" width="2" height="1" fill="#000000" />
  <rect x="36" y="35" width="4" height="1" fill="#F1F1F1" />
  <rect x="40" y="35" width="2" height="1" fill="#000000" />
  <rect x="42" y="35" width="12" height="1" fill="#FFB000" />
  <rect x="54" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="2" height="1" fill="#000000" />
  <rect x="10" y="36" width="20" height="1" fill="#FFB000" />
  <rect x="30" y="36" width="4" height="1" fill="#000000" />
  <rect x="34" y="36" width="4" height="1" fill="#F1F1F1" />
  <rect x="38" y="36" width="2" height="1" fill="#000000" />
  <rect x="40" y="36" width="14" height="1" fill="#FFB000" />
  <rect x="54" y="36" width="2" height="1" fill="#000000" />
  <rect x="8" y="37" width="2" height="1" fill="#000000" />
  <rect x="10" y="37" width="20" height="1" fill="#FFB000" />
  <rect x="30" y="37" width="4" height="1" fill="#000000" />
  <rect x="34" y="37" width="4" height="1" fill="#F1F1F1" />
  <rect x="38" y="37" width="2" height="1" fill="#000000" />
  <rect x="40" y="37" width="14" height="1" fill="#FFB000" />
  <rect x="54" y="37" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="2" height="1" fill="#000000" />
  <rect x="10" y="38" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="38" width="2" height="1" fill="#000000" />
  <rect x="30" y="38" width="8" height="1" fill="#F1F1F1" />
  <rect x="38" y="38" width="2" height="1" fill="#000000" />
  <rect x="40" y="38" width="14" height="1" fill="#FFB000" />
  <rect x="54" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="2" height="1" fill="#000000" />
  <rect x="10" y="39" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="39" width="2" height="1" fill="#000000" />
  <rect x="30" y="39" width="8" height="1" fill="#F1F1F1" />
  <rect x="38" y="39" width="2" height="1" fill="#000000" />
  <rect x="40" y="39" width="14" height="1" fill="#FFB000" />
  <rect x="54" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="2" height="1" fill="#000000" />
  <rect x="10" y="40" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="40" width="2" height="1" fill="#000000" />
  <rect x="30" y="40" width="4" height="1" fill="#F1F1F1" />
  <rect x="34" y="40" width="4" height="1" fill="#000000" />
  <rect x="38" y="40" width="16" height="1" fill="#FFB000" />
  <rect x="54" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="2" height="1" fill="#000000" />
  <rect x="10" y="41" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="41" width="2" height="1" fill="#000000" />
  <rect x="30" y="41" width="4" height="1" fill="#F1F1F1" />
  <rect x="34" y="41" width="4" height="1" fill="#000000" />
  <rect x="38" y="41" width="16" height="1" fill="#FFB000" />
  <rect x="54" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="2" height="1" fill="#000000" />
  <rect x="10" y="42" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="42" width="8" height="1" fill="#000000" />
  <rect x="36" y="42" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="2" height="1" fill="#000000" />
  <rect x="10" y="43" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="43" width="8" height="1" fill="#000000" />
  <rect x="36" y="43" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="2" height="1" fill="#000000" />
  <rect x="10" y="44" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="44" width="2" height="1" fill="#000000" />
  <rect x="30" y="44" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="44" width="2" height="1" fill="#000000" />
  <rect x="36" y="44" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="2" height="1" fill="#000000" />
  <rect x="10" y="45" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="45" width="2" height="1" fill="#000000" />
  <rect x="30" y="45" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="45" width="2" height="1" fill="#000000" />
  <rect x="36" y="45" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="46" width="2" height="1" fill="#000000" />
  <rect x="10" y="46" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="46" width="2" height="1" fill="#000000" />
  <rect x="30" y="46" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="46" width="2" height="1" fill="#000000" />
  <rect x="36" y="46" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="46" width="2" height="1" fill="#000000" />
  <rect x="8" y="47" width="2" height="1" fill="#000000" />
  <rect x="10" y="47" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="47" width="2" height="1" fill="#000000" />
  <rect x="30" y="47" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="47" width="2" height="1" fill="#000000" />
  <rect x="36" y="47" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="47" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="2" height="1" fill="#000000" />
  <rect x="10" y="48" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="48" width="8" height="1" fill="#000000" />
  <rect x="36" y="48" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="2" height="1" fill="#000000" />
  <rect x="10" y="49" width="18" height="1" fill="#FFB000" />
  <rect x="28" y="49" width="8" height="1" fill="#000000" />
  <rect x="36" y="49" width="18" height="1" fill="#FFB000" />
  <rect x="54" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="2" height="1" fill="#000000" />
  <rect x="10" y="50" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="2" height="1" fill="#000000" />
  <rect x="10" y="51" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="2" height="1" fill="#000000" />
  <rect x="10" y="52" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="2" height="1" fill="#000000" />
  <rect x="10" y="53" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="54" width="2" height="1" fill="#000000" />
  <rect x="10" y="54" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="54" width="2" height="1" fill="#000000" />
  <rect x="8" y="55" width="2" height="1" fill="#000000" />
  <rect x="10" y="55" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="55" width="2" height="1" fill="#000000" />
  <rect x="8" y="56" width="48" height="1" fill="#000000" />
  <rect x="8" y="57" width="48" height="1" fill="#000000" />
</svg>
```
