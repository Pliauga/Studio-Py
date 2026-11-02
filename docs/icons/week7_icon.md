# Week 07: String Manipulation — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 7 (`week-07`)
- **Lesson ID**: `week-07-strings-and-text`
- **Title**: String Manipulation
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-07.mdx`

## 2. Narrative Context (The Hook)
Four thousand auth log lines spell the same server as `" SRV-01 "`, `"Srv-01"`, and `"srv_01_east"`. Before counting anything, you build a string-cleaning pipeline to strip, normalize, split, and parse every line.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Case and Whitespace**: Case-sensitive equality, `.lower()`, `.upper()`, `.title()`, string immutability, trimming with `.strip()`, `.lstrip()`, `.rstrip()`, and chaining `.strip().lower()`.
- **Waypoint 2: Asking What Text Contains**: `in` membership vs. `.find()` index lookup (where `-1` means not found and `0` is a match at index 0), `.replace()`, `.startswith()`, `.endswith()`, and `.count()`.
- **Waypoint 3: Split, Then Put It Back Together**: `.split()` on ragged whitespace, `.split(",", 1)` with `maxsplit=1`, `" | ".join(parts)`, and f-string column width specifiers (`:<10`, `:>6.1f`).
- **Waypoint 4: The Whole Pipeline**: Combining `.strip()`, `.split(",", 1)`, and `key=value` splitting inside `parse_line(raw_line)` to turn messy status lines into clean dicts.

## 4. Key Traps & Edge Cases Covered
- Calling `.strip()` or `.lower()` without reassigning the result does nothing because strings are immutable.
- Writing `if line.find(x):` treats `-1` (not found) as truthy and `0` (match at start) as falsy; use `in` or `!= -1`.
- Splitting `"srv-01,used=87,total=100"` without `maxsplit=1` when extracting only the leading hostname.
- Calling string methods like `.strip()` after converting a value to `float` raises `AttributeError`.

## 5. Interactive Exercises & Components
- `w07-strip-normalise` (`raw.strip().lower()`)
- `w07-maxsplit-record` (`record.split(',', 1)`)
- `w07-pipeline-first-steps` (cleaning `hostname_part.strip().lower()` after `split(',', 1)`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week7_icon`)

### Strict Visual Rules Applied
- **Subject**: **Strings** — A pair of scissors cutting a piece of white string.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week7_icon.svg`](./week7_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
......................KKKKK.....
......................KWWWK.....
......................KWWWK.....
..KKKKKKKKKK..........KWWWK.....
..KAAAAAAAAK..........KWWWK.....
..KAKKKKKKAK..........KWWWK.....
..KAK....KAKKK........KWWWK.....
..KAK....KAKWKKK......KWWWK.....
..KAK....KAKWWWKKK....KWWWK.....
..KAKKKKKKAKWWWWWKKK..KWWWK.....
..KAAAAAAAAKWWWWWWWKKKKWWWK.....
..KKKKKKKKKKKKWWWWWWWKKKKKK.....
.............KKKKWWWWWWK...GGG..
.............KGGKKWWWWWK...GGG..
.............KGGKKWWWWWK...GGG..
.............KKKKWWWWWWK...GGG..
..KKKKKKKKKKKKWWWWWWWKKKKKK.....
..KAAAAAAAAKWWWWWWWKKKKWWWK.....
..KAKKKKKKAKWWWWWKKK..KWWWK.....
..KAK....KAKWWWKKK....KWWWK.....
..KAK....KAKWKKK......KWWWK.....
..KAK....KAKKK........KWWWK.....
..KAKKKKKKAK..........KWWWK.....
..KAAAAAAAAK..........KWWWK.....
..KKKKKKKKKK..........KWWWK.....
......................KWWWK.....
......................KWWWK.....
......................KKKKK.....
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="44" y="4" width="10" height="1" fill="#000000" />
  <rect x="44" y="5" width="10" height="1" fill="#000000" />
  <rect x="44" y="6" width="2" height="1" fill="#000000" />
  <rect x="46" y="6" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="6" width="2" height="1" fill="#000000" />
  <rect x="44" y="7" width="2" height="1" fill="#000000" />
  <rect x="46" y="7" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="7" width="2" height="1" fill="#000000" />
  <rect x="44" y="8" width="2" height="1" fill="#000000" />
  <rect x="46" y="8" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="8" width="2" height="1" fill="#000000" />
  <rect x="44" y="9" width="2" height="1" fill="#000000" />
  <rect x="46" y="9" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="9" width="2" height="1" fill="#000000" />
  <rect x="4" y="10" width="20" height="1" fill="#000000" />
  <rect x="44" y="10" width="2" height="1" fill="#000000" />
  <rect x="46" y="10" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="10" width="2" height="1" fill="#000000" />
  <rect x="4" y="11" width="20" height="1" fill="#000000" />
  <rect x="44" y="11" width="2" height="1" fill="#000000" />
  <rect x="46" y="11" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="11" width="2" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="12" width="2" height="1" fill="#000000" />
  <rect x="44" y="12" width="2" height="1" fill="#000000" />
  <rect x="46" y="12" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="13" width="2" height="1" fill="#000000" />
  <rect x="44" y="13" width="2" height="1" fill="#000000" />
  <rect x="46" y="13" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="14" width="12" height="1" fill="#000000" />
  <rect x="20" y="14" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="14" width="2" height="1" fill="#000000" />
  <rect x="44" y="14" width="2" height="1" fill="#000000" />
  <rect x="46" y="14" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="15" width="12" height="1" fill="#000000" />
  <rect x="20" y="15" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="15" width="2" height="1" fill="#000000" />
  <rect x="44" y="15" width="2" height="1" fill="#000000" />
  <rect x="46" y="15" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="16" width="2" height="1" fill="#000000" />
  <rect x="18" y="16" width="2" height="1" fill="#000000" />
  <rect x="20" y="16" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="16" width="6" height="1" fill="#000000" />
  <rect x="44" y="16" width="2" height="1" fill="#000000" />
  <rect x="46" y="16" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="16" width="2" height="1" fill="#000000" />
  <rect x="4" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="17" width="2" height="1" fill="#000000" />
  <rect x="18" y="17" width="2" height="1" fill="#000000" />
  <rect x="20" y="17" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="17" width="6" height="1" fill="#000000" />
  <rect x="44" y="17" width="2" height="1" fill="#000000" />
  <rect x="46" y="17" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="17" width="2" height="1" fill="#000000" />
  <rect x="4" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="18" width="2" height="1" fill="#000000" />
  <rect x="18" y="18" width="2" height="1" fill="#000000" />
  <rect x="20" y="18" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="18" width="2" height="1" fill="#000000" />
  <rect x="24" y="18" width="2" height="1" fill="#F1F1F1" />
  <rect x="26" y="18" width="6" height="1" fill="#000000" />
  <rect x="44" y="18" width="2" height="1" fill="#000000" />
  <rect x="46" y="18" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="18" width="2" height="1" fill="#000000" />
  <rect x="4" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="19" width="2" height="1" fill="#000000" />
  <rect x="18" y="19" width="2" height="1" fill="#000000" />
  <rect x="20" y="19" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="19" width="2" height="1" fill="#000000" />
  <rect x="24" y="19" width="2" height="1" fill="#F1F1F1" />
  <rect x="26" y="19" width="6" height="1" fill="#000000" />
  <rect x="44" y="19" width="2" height="1" fill="#000000" />
  <rect x="46" y="19" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="19" width="2" height="1" fill="#000000" />
  <rect x="4" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="20" width="2" height="1" fill="#000000" />
  <rect x="18" y="20" width="2" height="1" fill="#000000" />
  <rect x="20" y="20" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="20" width="2" height="1" fill="#000000" />
  <rect x="24" y="20" width="6" height="1" fill="#F1F1F1" />
  <rect x="30" y="20" width="6" height="1" fill="#000000" />
  <rect x="44" y="20" width="2" height="1" fill="#000000" />
  <rect x="46" y="20" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="20" width="2" height="1" fill="#000000" />
  <rect x="4" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="21" width="2" height="1" fill="#000000" />
  <rect x="18" y="21" width="2" height="1" fill="#000000" />
  <rect x="20" y="21" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="21" width="2" height="1" fill="#000000" />
  <rect x="24" y="21" width="6" height="1" fill="#F1F1F1" />
  <rect x="30" y="21" width="6" height="1" fill="#000000" />
  <rect x="44" y="21" width="2" height="1" fill="#000000" />
  <rect x="46" y="21" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="21" width="2" height="1" fill="#000000" />
  <rect x="4" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="22" width="12" height="1" fill="#000000" />
  <rect x="20" y="22" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="22" width="2" height="1" fill="#000000" />
  <rect x="24" y="22" width="10" height="1" fill="#F1F1F1" />
  <rect x="34" y="22" width="6" height="1" fill="#000000" />
  <rect x="44" y="22" width="2" height="1" fill="#000000" />
  <rect x="46" y="22" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="22" width="2" height="1" fill="#000000" />
  <rect x="4" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="23" width="12" height="1" fill="#000000" />
  <rect x="20" y="23" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="23" width="2" height="1" fill="#000000" />
  <rect x="24" y="23" width="10" height="1" fill="#F1F1F1" />
  <rect x="34" y="23" width="6" height="1" fill="#000000" />
  <rect x="44" y="23" width="2" height="1" fill="#000000" />
  <rect x="46" y="23" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="23" width="2" height="1" fill="#000000" />
  <rect x="4" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="24" width="2" height="1" fill="#000000" />
  <rect x="24" y="24" width="14" height="1" fill="#F1F1F1" />
  <rect x="38" y="24" width="8" height="1" fill="#000000" />
  <rect x="46" y="24" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="24" width="2" height="1" fill="#000000" />
  <rect x="4" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="25" width="2" height="1" fill="#000000" />
  <rect x="24" y="25" width="14" height="1" fill="#F1F1F1" />
  <rect x="38" y="25" width="8" height="1" fill="#000000" />
  <rect x="46" y="25" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="25" width="2" height="1" fill="#000000" />
  <rect x="4" y="26" width="24" height="1" fill="#000000" />
  <rect x="28" y="26" width="14" height="1" fill="#F1F1F1" />
  <rect x="42" y="26" width="12" height="1" fill="#000000" />
  <rect x="4" y="27" width="24" height="1" fill="#000000" />
  <rect x="28" y="27" width="14" height="1" fill="#F1F1F1" />
  <rect x="42" y="27" width="12" height="1" fill="#000000" />
  <rect x="26" y="28" width="8" height="1" fill="#000000" />
  <rect x="34" y="28" width="12" height="1" fill="#F1F1F1" />
  <rect x="46" y="28" width="2" height="1" fill="#000000" />
  <rect x="54" y="28" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="29" width="8" height="1" fill="#000000" />
  <rect x="34" y="29" width="12" height="1" fill="#F1F1F1" />
  <rect x="46" y="29" width="2" height="1" fill="#000000" />
  <rect x="54" y="29" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="30" width="2" height="1" fill="#000000" />
  <rect x="28" y="30" width="4" height="1" fill="#33FF00" />
  <rect x="32" y="30" width="4" height="1" fill="#000000" />
  <rect x="36" y="30" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="30" width="2" height="1" fill="#000000" />
  <rect x="54" y="30" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="31" width="2" height="1" fill="#000000" />
  <rect x="28" y="31" width="4" height="1" fill="#33FF00" />
  <rect x="32" y="31" width="4" height="1" fill="#000000" />
  <rect x="36" y="31" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="31" width="2" height="1" fill="#000000" />
  <rect x="54" y="31" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="32" width="2" height="1" fill="#000000" />
  <rect x="28" y="32" width="4" height="1" fill="#33FF00" />
  <rect x="32" y="32" width="4" height="1" fill="#000000" />
  <rect x="36" y="32" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="32" width="2" height="1" fill="#000000" />
  <rect x="54" y="32" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="33" width="2" height="1" fill="#000000" />
  <rect x="28" y="33" width="4" height="1" fill="#33FF00" />
  <rect x="32" y="33" width="4" height="1" fill="#000000" />
  <rect x="36" y="33" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="33" width="2" height="1" fill="#000000" />
  <rect x="54" y="33" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="34" width="8" height="1" fill="#000000" />
  <rect x="34" y="34" width="12" height="1" fill="#F1F1F1" />
  <rect x="46" y="34" width="2" height="1" fill="#000000" />
  <rect x="54" y="34" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="35" width="8" height="1" fill="#000000" />
  <rect x="34" y="35" width="12" height="1" fill="#F1F1F1" />
  <rect x="46" y="35" width="2" height="1" fill="#000000" />
  <rect x="54" y="35" width="6" height="1" fill="#33FF00" />
  <rect x="4" y="36" width="24" height="1" fill="#000000" />
  <rect x="28" y="36" width="14" height="1" fill="#F1F1F1" />
  <rect x="42" y="36" width="12" height="1" fill="#000000" />
  <rect x="4" y="37" width="24" height="1" fill="#000000" />
  <rect x="28" y="37" width="14" height="1" fill="#F1F1F1" />
  <rect x="42" y="37" width="12" height="1" fill="#000000" />
  <rect x="4" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="38" width="2" height="1" fill="#000000" />
  <rect x="24" y="38" width="14" height="1" fill="#F1F1F1" />
  <rect x="38" y="38" width="8" height="1" fill="#000000" />
  <rect x="46" y="38" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="38" width="2" height="1" fill="#000000" />
  <rect x="4" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="39" width="2" height="1" fill="#000000" />
  <rect x="24" y="39" width="14" height="1" fill="#F1F1F1" />
  <rect x="38" y="39" width="8" height="1" fill="#000000" />
  <rect x="46" y="39" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="39" width="2" height="1" fill="#000000" />
  <rect x="4" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="40" width="12" height="1" fill="#000000" />
  <rect x="20" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="40" width="2" height="1" fill="#000000" />
  <rect x="24" y="40" width="10" height="1" fill="#F1F1F1" />
  <rect x="34" y="40" width="6" height="1" fill="#000000" />
  <rect x="44" y="40" width="2" height="1" fill="#000000" />
  <rect x="46" y="40" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="40" width="2" height="1" fill="#000000" />
  <rect x="4" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="41" width="12" height="1" fill="#000000" />
  <rect x="20" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="41" width="2" height="1" fill="#000000" />
  <rect x="24" y="41" width="10" height="1" fill="#F1F1F1" />
  <rect x="34" y="41" width="6" height="1" fill="#000000" />
  <rect x="44" y="41" width="2" height="1" fill="#000000" />
  <rect x="46" y="41" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="41" width="2" height="1" fill="#000000" />
  <rect x="4" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="42" width="2" height="1" fill="#000000" />
  <rect x="18" y="42" width="2" height="1" fill="#000000" />
  <rect x="20" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="42" width="2" height="1" fill="#000000" />
  <rect x="24" y="42" width="6" height="1" fill="#F1F1F1" />
  <rect x="30" y="42" width="6" height="1" fill="#000000" />
  <rect x="44" y="42" width="2" height="1" fill="#000000" />
  <rect x="46" y="42" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="42" width="2" height="1" fill="#000000" />
  <rect x="4" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="43" width="2" height="1" fill="#000000" />
  <rect x="18" y="43" width="2" height="1" fill="#000000" />
  <rect x="20" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="43" width="2" height="1" fill="#000000" />
  <rect x="24" y="43" width="6" height="1" fill="#F1F1F1" />
  <rect x="30" y="43" width="6" height="1" fill="#000000" />
  <rect x="44" y="43" width="2" height="1" fill="#000000" />
  <rect x="46" y="43" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="43" width="2" height="1" fill="#000000" />
  <rect x="4" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="44" width="2" height="1" fill="#000000" />
  <rect x="18" y="44" width="2" height="1" fill="#000000" />
  <rect x="20" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="44" width="2" height="1" fill="#000000" />
  <rect x="24" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="26" y="44" width="6" height="1" fill="#000000" />
  <rect x="44" y="44" width="2" height="1" fill="#000000" />
  <rect x="46" y="44" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="44" width="2" height="1" fill="#000000" />
  <rect x="4" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="45" width="2" height="1" fill="#000000" />
  <rect x="18" y="45" width="2" height="1" fill="#000000" />
  <rect x="20" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="45" width="2" height="1" fill="#000000" />
  <rect x="24" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="26" y="45" width="6" height="1" fill="#000000" />
  <rect x="44" y="45" width="2" height="1" fill="#000000" />
  <rect x="46" y="45" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="45" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="46" width="2" height="1" fill="#000000" />
  <rect x="18" y="46" width="2" height="1" fill="#000000" />
  <rect x="20" y="46" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="46" width="6" height="1" fill="#000000" />
  <rect x="44" y="46" width="2" height="1" fill="#000000" />
  <rect x="46" y="46" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="46" width="2" height="1" fill="#000000" />
  <rect x="4" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="47" width="2" height="1" fill="#000000" />
  <rect x="18" y="47" width="2" height="1" fill="#000000" />
  <rect x="20" y="47" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="47" width="6" height="1" fill="#000000" />
  <rect x="44" y="47" width="2" height="1" fill="#000000" />
  <rect x="46" y="47" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="47" width="2" height="1" fill="#000000" />
  <rect x="4" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="48" width="12" height="1" fill="#000000" />
  <rect x="20" y="48" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="48" width="2" height="1" fill="#000000" />
  <rect x="44" y="48" width="2" height="1" fill="#000000" />
  <rect x="46" y="48" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="48" width="2" height="1" fill="#000000" />
  <rect x="4" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#FFB000" />
  <rect x="8" y="49" width="12" height="1" fill="#000000" />
  <rect x="20" y="49" width="2" height="1" fill="#FFB000" />
  <rect x="22" y="49" width="2" height="1" fill="#000000" />
  <rect x="44" y="49" width="2" height="1" fill="#000000" />
  <rect x="46" y="49" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="49" width="2" height="1" fill="#000000" />
  <rect x="4" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="50" width="2" height="1" fill="#000000" />
  <rect x="44" y="50" width="2" height="1" fill="#000000" />
  <rect x="46" y="50" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="16" height="1" fill="#FFB000" />
  <rect x="22" y="51" width="2" height="1" fill="#000000" />
  <rect x="44" y="51" width="2" height="1" fill="#000000" />
  <rect x="46" y="51" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="20" height="1" fill="#000000" />
  <rect x="44" y="52" width="2" height="1" fill="#000000" />
  <rect x="46" y="52" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="52" width="2" height="1" fill="#000000" />
  <rect x="4" y="53" width="20" height="1" fill="#000000" />
  <rect x="44" y="53" width="2" height="1" fill="#000000" />
  <rect x="46" y="53" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="53" width="2" height="1" fill="#000000" />
  <rect x="44" y="54" width="2" height="1" fill="#000000" />
  <rect x="46" y="54" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="54" width="2" height="1" fill="#000000" />
  <rect x="44" y="55" width="2" height="1" fill="#000000" />
  <rect x="46" y="55" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="55" width="2" height="1" fill="#000000" />
  <rect x="44" y="56" width="2" height="1" fill="#000000" />
  <rect x="46" y="56" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="56" width="2" height="1" fill="#000000" />
  <rect x="44" y="57" width="2" height="1" fill="#000000" />
  <rect x="46" y="57" width="6" height="1" fill="#F1F1F1" />
  <rect x="52" y="57" width="2" height="1" fill="#000000" />
  <rect x="44" y="58" width="10" height="1" fill="#000000" />
  <rect x="44" y="59" width="10" height="1" fill="#000000" />
</svg>
```
