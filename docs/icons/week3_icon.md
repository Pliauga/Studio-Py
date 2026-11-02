# Week 03: Functions and Modules — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 3 (`week-03`)
- **Lesson ID**: `week-03-functions-and-modules`
- **Title**: Functions and Modules
- **Estimated Duration**: 18 minutes
- **Source File**: `src/content/lessons/week-03.mdx`

## 2. Narrative Context (The Hook)
At 4 AM you are pasting the same disk threshold check into a third script. To stop threshold copies from drifting out of sync, you package the logic into a reusable function and import it as a module.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Define Once, Call Anywhere**: `def` function definitions, calling with `()`, parameters, returning values with `return` (vs. discarding them with `print()`), and documenting contracts with docstrings (`help()`).
- **Waypoint 2: Defaults and Named Arguments**: Positional vs. keyword arguments (`status_of(warning_at=90, percent=95)`), default parameter values, ordering rules, `*args` tuples, and `**kwargs` dicts.
- **Waypoint 3: The Wall Around a Function**: Local variable scope isolation (parameters and locals do not mutate caller variables), returning comma-separated tuples, and unpacking multiple return values.
- **Waypoint 4: Modules Are Wiring Someone Else Built**: `import math` vs. `from math import sqrt`, standard library vs. third-party packages, and protecting top-level test code with `if __name__ == "__main__":` (`<SandboxEmbed />`).

## 4. Key Traps & Edge Cases Covered
- Using `print()` instead of `return` causes the function to return `None` to the caller.
- Placing a required parameter after a default parameter, or a positional argument after a keyword argument, raises `SyntaxError`.
- Assuming `*args` is unpacked automatically rather than arriving as a single tuple.
- Leaving top-level debug prints outside `if __name__ == "__main__":` causes them to run on every `import`.

## 5. Interactive Exercises & Components
- `w03-return-not-print` (replacing `print()` with `return` inside `add_tax`)
- `w03-default-warning` (fixing default parameter `warning_at=90` in `status_of`)
- `w03-unpack-record` (tuple unpacking `difference, percent = check_record(87, 100)`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week3_icon`)

### Strict Visual Rules Applied
- **Subject**: **Functions** — A microchip with metallic pins and an @ symbol in the center.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week3_icon.svg`](./week3_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
........KKK..KKKKKK..KKK........
........KWK..KWKKWK..KWK........
........KWK..KWKKWK..KWK........
........KWK..KWKKWK..KWK........
......KKKKKKKKKKKKKKKKKKKK......
......KAAAAAAAAAAAAAAAAAAK......
..KKKKKAKKKKKKKKKKKKKKKKAKKKKK..
..KWWWKAKKKKKKKKKKKKKKKKAKWWWK..
..KKKKKAKKKKKKKKKKKKKKKKAKKKKK..
......KAKKKKGGGGGGGGKKKKAK......
......KAKKKGGGGGGGGGGKKKAK......
..KKKKKAKKGGKKKKKKKGGGKKAKKKKK..
..KWWWKAKKGGKGGGGGKGGGKKAKWWWK..
..KKKKKAKKGGKGAAAGGKGGKKAKKKKK..
..KKKKKAKKGGKGAAAGGKGGKKAKKKKK..
..KWWWKAKKGGKGGGGGGGGKKKAKWWWK..
..KKKKKAKKGGKKKKKKKKKKKKAKKKKK..
......KAKKKGGGGGGGGGKKKKAK......
......KAKKKKGGGGGGGGKKKKAK......
..KKKKKAKKKKKKKKKKKKKKKKAKKKKK..
..KWWWKAKKKKKKKKKKKKKKKKAKWWWK..
..KKKKKAKKKKKKKKKKKKKKKKAKKKKK..
......KAAAAAAAAAAAAAAAAAAK......
......KKKKKKKKKKKKKKKKKKKK......
........KWK..KWKKWK..KWK........
........KWK..KWKKWK..KWK........
........KWK..KWKKWK..KWK........
........KKK..KKKKKK..KKK........
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="16" y="4" width="6" height="1" fill="#000000" />
  <rect x="26" y="4" width="12" height="1" fill="#000000" />
  <rect x="42" y="4" width="6" height="1" fill="#000000" />
  <rect x="16" y="5" width="6" height="1" fill="#000000" />
  <rect x="26" y="5" width="12" height="1" fill="#000000" />
  <rect x="42" y="5" width="6" height="1" fill="#000000" />
  <rect x="16" y="6" width="2" height="1" fill="#000000" />
  <rect x="18" y="6" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="6" width="2" height="1" fill="#000000" />
  <rect x="26" y="6" width="2" height="1" fill="#000000" />
  <rect x="28" y="6" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="6" width="4" height="1" fill="#000000" />
  <rect x="34" y="6" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="6" width="2" height="1" fill="#000000" />
  <rect x="42" y="6" width="2" height="1" fill="#000000" />
  <rect x="44" y="6" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="6" width="2" height="1" fill="#000000" />
  <rect x="16" y="7" width="2" height="1" fill="#000000" />
  <rect x="18" y="7" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="7" width="2" height="1" fill="#000000" />
  <rect x="26" y="7" width="2" height="1" fill="#000000" />
  <rect x="28" y="7" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="7" width="4" height="1" fill="#000000" />
  <rect x="34" y="7" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="7" width="2" height="1" fill="#000000" />
  <rect x="42" y="7" width="2" height="1" fill="#000000" />
  <rect x="44" y="7" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="7" width="2" height="1" fill="#000000" />
  <rect x="16" y="8" width="2" height="1" fill="#000000" />
  <rect x="18" y="8" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="8" width="2" height="1" fill="#000000" />
  <rect x="26" y="8" width="2" height="1" fill="#000000" />
  <rect x="28" y="8" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="8" width="4" height="1" fill="#000000" />
  <rect x="34" y="8" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="8" width="2" height="1" fill="#000000" />
  <rect x="42" y="8" width="2" height="1" fill="#000000" />
  <rect x="44" y="8" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="8" width="2" height="1" fill="#000000" />
  <rect x="16" y="9" width="2" height="1" fill="#000000" />
  <rect x="18" y="9" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="9" width="2" height="1" fill="#000000" />
  <rect x="26" y="9" width="2" height="1" fill="#000000" />
  <rect x="28" y="9" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="9" width="4" height="1" fill="#000000" />
  <rect x="34" y="9" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="9" width="2" height="1" fill="#000000" />
  <rect x="42" y="9" width="2" height="1" fill="#000000" />
  <rect x="44" y="9" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="9" width="2" height="1" fill="#000000" />
  <rect x="16" y="10" width="2" height="1" fill="#000000" />
  <rect x="18" y="10" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="10" width="2" height="1" fill="#000000" />
  <rect x="26" y="10" width="2" height="1" fill="#000000" />
  <rect x="28" y="10" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="10" width="4" height="1" fill="#000000" />
  <rect x="34" y="10" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="10" width="2" height="1" fill="#000000" />
  <rect x="42" y="10" width="2" height="1" fill="#000000" />
  <rect x="44" y="10" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="10" width="2" height="1" fill="#000000" />
  <rect x="16" y="11" width="2" height="1" fill="#000000" />
  <rect x="18" y="11" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="11" width="2" height="1" fill="#000000" />
  <rect x="26" y="11" width="2" height="1" fill="#000000" />
  <rect x="28" y="11" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="11" width="4" height="1" fill="#000000" />
  <rect x="34" y="11" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="11" width="2" height="1" fill="#000000" />
  <rect x="42" y="11" width="2" height="1" fill="#000000" />
  <rect x="44" y="11" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="11" width="2" height="1" fill="#000000" />
  <rect x="12" y="12" width="40" height="1" fill="#000000" />
  <rect x="12" y="13" width="40" height="1" fill="#000000" />
  <rect x="12" y="14" width="2" height="1" fill="#000000" />
  <rect x="14" y="14" width="36" height="1" fill="#FFB000" />
  <rect x="50" y="14" width="2" height="1" fill="#000000" />
  <rect x="12" y="15" width="2" height="1" fill="#000000" />
  <rect x="14" y="15" width="36" height="1" fill="#FFB000" />
  <rect x="50" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="10" height="1" fill="#000000" />
  <rect x="14" y="16" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="16" width="32" height="1" fill="#000000" />
  <rect x="48" y="16" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="16" width="10" height="1" fill="#000000" />
  <rect x="4" y="17" width="10" height="1" fill="#000000" />
  <rect x="14" y="17" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="17" width="32" height="1" fill="#000000" />
  <rect x="48" y="17" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="17" width="10" height="1" fill="#000000" />
  <rect x="4" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="18" width="2" height="1" fill="#000000" />
  <rect x="14" y="18" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="18" width="32" height="1" fill="#000000" />
  <rect x="48" y="18" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="18" width="2" height="1" fill="#000000" />
  <rect x="52" y="18" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="18" width="2" height="1" fill="#000000" />
  <rect x="4" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="19" width="2" height="1" fill="#000000" />
  <rect x="14" y="19" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="19" width="32" height="1" fill="#000000" />
  <rect x="48" y="19" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="19" width="2" height="1" fill="#000000" />
  <rect x="52" y="19" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="19" width="2" height="1" fill="#000000" />
  <rect x="4" y="20" width="10" height="1" fill="#000000" />
  <rect x="14" y="20" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="20" width="32" height="1" fill="#000000" />
  <rect x="48" y="20" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="20" width="10" height="1" fill="#000000" />
  <rect x="4" y="21" width="10" height="1" fill="#000000" />
  <rect x="14" y="21" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="21" width="32" height="1" fill="#000000" />
  <rect x="48" y="21" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="21" width="10" height="1" fill="#000000" />
  <rect x="12" y="22" width="2" height="1" fill="#000000" />
  <rect x="14" y="22" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="22" width="8" height="1" fill="#000000" />
  <rect x="24" y="22" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="22" width="8" height="1" fill="#000000" />
  <rect x="48" y="22" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="22" width="2" height="1" fill="#000000" />
  <rect x="12" y="23" width="2" height="1" fill="#000000" />
  <rect x="14" y="23" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="23" width="8" height="1" fill="#000000" />
  <rect x="24" y="23" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="23" width="8" height="1" fill="#000000" />
  <rect x="48" y="23" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="23" width="2" height="1" fill="#000000" />
  <rect x="12" y="24" width="2" height="1" fill="#000000" />
  <rect x="14" y="24" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="24" width="6" height="1" fill="#000000" />
  <rect x="22" y="24" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="24" width="6" height="1" fill="#000000" />
  <rect x="48" y="24" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="24" width="2" height="1" fill="#000000" />
  <rect x="12" y="25" width="2" height="1" fill="#000000" />
  <rect x="14" y="25" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="25" width="6" height="1" fill="#000000" />
  <rect x="22" y="25" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="25" width="6" height="1" fill="#000000" />
  <rect x="48" y="25" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="25" width="2" height="1" fill="#000000" />
  <rect x="4" y="26" width="10" height="1" fill="#000000" />
  <rect x="14" y="26" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="26" width="4" height="1" fill="#000000" />
  <rect x="20" y="26" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="26" width="14" height="1" fill="#000000" />
  <rect x="38" y="26" width="6" height="1" fill="#33FF00" />
  <rect x="44" y="26" width="4" height="1" fill="#000000" />
  <rect x="48" y="26" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="26" width="10" height="1" fill="#000000" />
  <rect x="4" y="27" width="10" height="1" fill="#000000" />
  <rect x="14" y="27" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="27" width="4" height="1" fill="#000000" />
  <rect x="20" y="27" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="27" width="14" height="1" fill="#000000" />
  <rect x="38" y="27" width="6" height="1" fill="#33FF00" />
  <rect x="44" y="27" width="4" height="1" fill="#000000" />
  <rect x="48" y="27" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="27" width="10" height="1" fill="#000000" />
  <rect x="4" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="28" width="2" height="1" fill="#000000" />
  <rect x="14" y="28" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="28" width="4" height="1" fill="#000000" />
  <rect x="20" y="28" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="28" width="2" height="1" fill="#000000" />
  <rect x="26" y="28" width="10" height="1" fill="#33FF00" />
  <rect x="36" y="28" width="2" height="1" fill="#000000" />
  <rect x="38" y="28" width="6" height="1" fill="#33FF00" />
  <rect x="44" y="28" width="4" height="1" fill="#000000" />
  <rect x="48" y="28" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="28" width="2" height="1" fill="#000000" />
  <rect x="52" y="28" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="28" width="2" height="1" fill="#000000" />
  <rect x="4" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="29" width="2" height="1" fill="#000000" />
  <rect x="14" y="29" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="29" width="4" height="1" fill="#000000" />
  <rect x="20" y="29" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="29" width="2" height="1" fill="#000000" />
  <rect x="26" y="29" width="10" height="1" fill="#33FF00" />
  <rect x="36" y="29" width="2" height="1" fill="#000000" />
  <rect x="38" y="29" width="6" height="1" fill="#33FF00" />
  <rect x="44" y="29" width="4" height="1" fill="#000000" />
  <rect x="48" y="29" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="29" width="2" height="1" fill="#000000" />
  <rect x="52" y="29" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="29" width="2" height="1" fill="#000000" />
  <rect x="4" y="30" width="10" height="1" fill="#000000" />
  <rect x="14" y="30" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="30" width="4" height="1" fill="#000000" />
  <rect x="20" y="30" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="30" width="2" height="1" fill="#000000" />
  <rect x="26" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="30" width="6" height="1" fill="#FFB000" />
  <rect x="34" y="30" width="4" height="1" fill="#33FF00" />
  <rect x="38" y="30" width="2" height="1" fill="#000000" />
  <rect x="40" y="30" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="30" width="4" height="1" fill="#000000" />
  <rect x="48" y="30" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="30" width="10" height="1" fill="#000000" />
  <rect x="4" y="31" width="10" height="1" fill="#000000" />
  <rect x="14" y="31" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="31" width="4" height="1" fill="#000000" />
  <rect x="20" y="31" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="31" width="2" height="1" fill="#000000" />
  <rect x="26" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="31" width="6" height="1" fill="#FFB000" />
  <rect x="34" y="31" width="4" height="1" fill="#33FF00" />
  <rect x="38" y="31" width="2" height="1" fill="#000000" />
  <rect x="40" y="31" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="31" width="4" height="1" fill="#000000" />
  <rect x="48" y="31" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="31" width="10" height="1" fill="#000000" />
  <rect x="4" y="32" width="10" height="1" fill="#000000" />
  <rect x="14" y="32" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="32" width="4" height="1" fill="#000000" />
  <rect x="20" y="32" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="32" width="2" height="1" fill="#000000" />
  <rect x="26" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="32" width="6" height="1" fill="#FFB000" />
  <rect x="34" y="32" width="4" height="1" fill="#33FF00" />
  <rect x="38" y="32" width="2" height="1" fill="#000000" />
  <rect x="40" y="32" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="32" width="4" height="1" fill="#000000" />
  <rect x="48" y="32" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="32" width="10" height="1" fill="#000000" />
  <rect x="4" y="33" width="10" height="1" fill="#000000" />
  <rect x="14" y="33" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="33" width="4" height="1" fill="#000000" />
  <rect x="20" y="33" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="33" width="2" height="1" fill="#000000" />
  <rect x="26" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="33" width="6" height="1" fill="#FFB000" />
  <rect x="34" y="33" width="4" height="1" fill="#33FF00" />
  <rect x="38" y="33" width="2" height="1" fill="#000000" />
  <rect x="40" y="33" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="33" width="4" height="1" fill="#000000" />
  <rect x="48" y="33" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="33" width="10" height="1" fill="#000000" />
  <rect x="4" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="34" width="2" height="1" fill="#000000" />
  <rect x="14" y="34" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="34" width="4" height="1" fill="#000000" />
  <rect x="20" y="34" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="34" width="2" height="1" fill="#000000" />
  <rect x="26" y="34" width="16" height="1" fill="#33FF00" />
  <rect x="42" y="34" width="6" height="1" fill="#000000" />
  <rect x="48" y="34" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="34" width="2" height="1" fill="#000000" />
  <rect x="52" y="34" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="34" width="2" height="1" fill="#000000" />
  <rect x="4" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="35" width="2" height="1" fill="#000000" />
  <rect x="14" y="35" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="35" width="4" height="1" fill="#000000" />
  <rect x="20" y="35" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="35" width="2" height="1" fill="#000000" />
  <rect x="26" y="35" width="16" height="1" fill="#33FF00" />
  <rect x="42" y="35" width="6" height="1" fill="#000000" />
  <rect x="48" y="35" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="35" width="2" height="1" fill="#000000" />
  <rect x="52" y="35" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="35" width="2" height="1" fill="#000000" />
  <rect x="4" y="36" width="10" height="1" fill="#000000" />
  <rect x="14" y="36" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="36" width="4" height="1" fill="#000000" />
  <rect x="20" y="36" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="36" width="24" height="1" fill="#000000" />
  <rect x="48" y="36" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="36" width="10" height="1" fill="#000000" />
  <rect x="4" y="37" width="10" height="1" fill="#000000" />
  <rect x="14" y="37" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="37" width="4" height="1" fill="#000000" />
  <rect x="20" y="37" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="37" width="24" height="1" fill="#000000" />
  <rect x="48" y="37" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="37" width="10" height="1" fill="#000000" />
  <rect x="12" y="38" width="2" height="1" fill="#000000" />
  <rect x="14" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="38" width="6" height="1" fill="#000000" />
  <rect x="22" y="38" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="38" width="8" height="1" fill="#000000" />
  <rect x="48" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="38" width="2" height="1" fill="#000000" />
  <rect x="12" y="39" width="2" height="1" fill="#000000" />
  <rect x="14" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="39" width="6" height="1" fill="#000000" />
  <rect x="22" y="39" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="39" width="8" height="1" fill="#000000" />
  <rect x="48" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="39" width="2" height="1" fill="#000000" />
  <rect x="12" y="40" width="2" height="1" fill="#000000" />
  <rect x="14" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="40" width="8" height="1" fill="#000000" />
  <rect x="24" y="40" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="40" width="8" height="1" fill="#000000" />
  <rect x="48" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="40" width="2" height="1" fill="#000000" />
  <rect x="12" y="41" width="2" height="1" fill="#000000" />
  <rect x="14" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="41" width="8" height="1" fill="#000000" />
  <rect x="24" y="41" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="41" width="8" height="1" fill="#000000" />
  <rect x="48" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="41" width="2" height="1" fill="#000000" />
  <rect x="4" y="42" width="10" height="1" fill="#000000" />
  <rect x="14" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="42" width="32" height="1" fill="#000000" />
  <rect x="48" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="42" width="10" height="1" fill="#000000" />
  <rect x="4" y="43" width="10" height="1" fill="#000000" />
  <rect x="14" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="43" width="32" height="1" fill="#000000" />
  <rect x="48" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="43" width="10" height="1" fill="#000000" />
  <rect x="4" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="44" width="2" height="1" fill="#000000" />
  <rect x="14" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="44" width="32" height="1" fill="#000000" />
  <rect x="48" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="44" width="2" height="1" fill="#000000" />
  <rect x="52" y="44" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="44" width="2" height="1" fill="#000000" />
  <rect x="4" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="6" height="1" fill="#F1F1F1" />
  <rect x="12" y="45" width="2" height="1" fill="#000000" />
  <rect x="14" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="45" width="32" height="1" fill="#000000" />
  <rect x="48" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="45" width="2" height="1" fill="#000000" />
  <rect x="52" y="45" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="45" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="10" height="1" fill="#000000" />
  <rect x="14" y="46" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="46" width="32" height="1" fill="#000000" />
  <rect x="48" y="46" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="46" width="10" height="1" fill="#000000" />
  <rect x="4" y="47" width="10" height="1" fill="#000000" />
  <rect x="14" y="47" width="2" height="1" fill="#FFB000" />
  <rect x="16" y="47" width="32" height="1" fill="#000000" />
  <rect x="48" y="47" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="47" width="10" height="1" fill="#000000" />
  <rect x="12" y="48" width="2" height="1" fill="#000000" />
  <rect x="14" y="48" width="36" height="1" fill="#FFB000" />
  <rect x="50" y="48" width="2" height="1" fill="#000000" />
  <rect x="12" y="49" width="2" height="1" fill="#000000" />
  <rect x="14" y="49" width="36" height="1" fill="#FFB000" />
  <rect x="50" y="49" width="2" height="1" fill="#000000" />
  <rect x="12" y="50" width="40" height="1" fill="#000000" />
  <rect x="12" y="51" width="40" height="1" fill="#000000" />
  <rect x="16" y="52" width="2" height="1" fill="#000000" />
  <rect x="18" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="52" width="2" height="1" fill="#000000" />
  <rect x="26" y="52" width="2" height="1" fill="#000000" />
  <rect x="28" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="52" width="4" height="1" fill="#000000" />
  <rect x="34" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="52" width="2" height="1" fill="#000000" />
  <rect x="42" y="52" width="2" height="1" fill="#000000" />
  <rect x="44" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="52" width="2" height="1" fill="#000000" />
  <rect x="16" y="53" width="2" height="1" fill="#000000" />
  <rect x="18" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="53" width="2" height="1" fill="#000000" />
  <rect x="26" y="53" width="2" height="1" fill="#000000" />
  <rect x="28" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="53" width="4" height="1" fill="#000000" />
  <rect x="34" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="53" width="2" height="1" fill="#000000" />
  <rect x="42" y="53" width="2" height="1" fill="#000000" />
  <rect x="44" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="53" width="2" height="1" fill="#000000" />
  <rect x="16" y="54" width="2" height="1" fill="#000000" />
  <rect x="18" y="54" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="54" width="2" height="1" fill="#000000" />
  <rect x="26" y="54" width="2" height="1" fill="#000000" />
  <rect x="28" y="54" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="54" width="4" height="1" fill="#000000" />
  <rect x="34" y="54" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="54" width="2" height="1" fill="#000000" />
  <rect x="42" y="54" width="2" height="1" fill="#000000" />
  <rect x="44" y="54" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="54" width="2" height="1" fill="#000000" />
  <rect x="16" y="55" width="2" height="1" fill="#000000" />
  <rect x="18" y="55" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="55" width="2" height="1" fill="#000000" />
  <rect x="26" y="55" width="2" height="1" fill="#000000" />
  <rect x="28" y="55" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="55" width="4" height="1" fill="#000000" />
  <rect x="34" y="55" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="55" width="2" height="1" fill="#000000" />
  <rect x="42" y="55" width="2" height="1" fill="#000000" />
  <rect x="44" y="55" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="55" width="2" height="1" fill="#000000" />
  <rect x="16" y="56" width="2" height="1" fill="#000000" />
  <rect x="18" y="56" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="56" width="2" height="1" fill="#000000" />
  <rect x="26" y="56" width="2" height="1" fill="#000000" />
  <rect x="28" y="56" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="56" width="4" height="1" fill="#000000" />
  <rect x="34" y="56" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="56" width="2" height="1" fill="#000000" />
  <rect x="42" y="56" width="2" height="1" fill="#000000" />
  <rect x="44" y="56" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="56" width="2" height="1" fill="#000000" />
  <rect x="16" y="57" width="2" height="1" fill="#000000" />
  <rect x="18" y="57" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="57" width="2" height="1" fill="#000000" />
  <rect x="26" y="57" width="2" height="1" fill="#000000" />
  <rect x="28" y="57" width="2" height="1" fill="#F1F1F1" />
  <rect x="30" y="57" width="4" height="1" fill="#000000" />
  <rect x="34" y="57" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="57" width="2" height="1" fill="#000000" />
  <rect x="42" y="57" width="2" height="1" fill="#000000" />
  <rect x="44" y="57" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="57" width="2" height="1" fill="#000000" />
  <rect x="16" y="58" width="6" height="1" fill="#000000" />
  <rect x="26" y="58" width="12" height="1" fill="#000000" />
  <rect x="42" y="58" width="6" height="1" fill="#000000" />
  <rect x="16" y="59" width="6" height="1" fill="#000000" />
  <rect x="26" y="59" width="12" height="1" fill="#000000" />
  <rect x="42" y="59" width="6" height="1" fill="#000000" />
</svg>
```
