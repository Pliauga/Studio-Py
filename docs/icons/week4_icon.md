# Week 04: Lists, Dictionaries, and Files — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 4 (`week-04`)
- **Lesson ID**: `week-04-lists-dictionaries-and-files`
- **Title**: Lists, Dictionaries, and Files
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-04.mdx`

## 2. Narrative Context (The Hook)
An incident export drops `records.txt` containing hundreds of `label,value,limit` lines. You need all rows in memory, addressable by field name rather than column guesswork, sorted cleanly, and resilient to missing files at 4 AM.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Position, Slices, and What Can Change**: Zero-based and negative indexing (`[-1]`), slicing (`[start:stop]`), list mutability (`.append()`, `.remove()`) vs. immutable strings/tuples, and filtered list comprehensions (`[v for v in values if v >= 40]`).
- **Waypoint 2: Lookup by Name**: Dictionaries (`{"label": "R-001"}`), avoiding `KeyError` with `.get(key, default)`, iterating with `.items()`, pairing lists via `dict(zip(keys, values))`, and deduplicating with `set()`.
- **Waypoint 3: Files, and Files That Are Not There**: `with open(path, mode) as f:` automatic handle closing, `"r"` / `"w"` / `"a"` modes, `.strip().split(",")`, catching `FileNotFoundError` with `try`/`except`, and 3D array sorting (`<SandboxEmbed mode="sort" />` with `visualize_array`, `swap_elements`, `mark_sorted`).
- **Waypoint 4: A List of Dicts**: Loading CSV-formatted lines into a list of dictionaries (`load_records`) and visualizing linked nodes in 3D (`spawn_object`, `drop_cube`).

## 4. Key Traps & Edge Cases Covered
- Direct indexing `record["missing"]` raises `KeyError`; iterating `for x in record:` yields keys only, not `(key, value)` pairs.
- `{}` creates an empty `dict`, not an empty `set()` (`set()` is required for `.add()`).
- Opening a file with `"w"` truncates existing contents immediately.
- Every field from `.split(",")` is a `str` (with trailing `\n` if `.strip()` was omitted) and must be cast before math or numeric sorting.

## 5. Interactive Exercises & Components
- `w04-comprehension-filter` (filtered list comprehension `[v for v in values if v >= 40]`)
- `w04-dict-get-default` (`record.get('status', 'unknown')`)
- `w04-split-fields` (`.split(',')` and `float()` casting)
- `w04-bubble-sort` (bubble sort driving 3D `swap_elements` and `mark_sorted`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week4_icon`)

### Strict Visual Rules Applied
- **Subject**: **Lists & Files** — An open manila folder with a brass key resting inside.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week4_icon.svg`](./week4_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
................................
...KKKKKKKKKKK..................
...KAAAAAAAAAK..................
...KAAAAAAAAAK..................
...KAAAAAAAAAK..................
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAKKKKKKKKKKKKKKKKKKKKKKAK...
...KAKWWWWWWWWWWWWWWWWWWWWKAK...
...KAKWWWWWWWWWWWWWWWWWWWWKAK...
...KAKWKKKKKKKKWWWWWWWWWWWKAK...
...KAKWKAAAAAAKWWWWWWWWWWWKAK...
...KAKWKAKKKKAKKKKKKKKKKKWKAK...
...KAKWKAKWWKAKAAAAAAAAAKWKAK...
...KAKWKAKWWKAKAAAAAAAAAKWKAK...
...KAKWKAKKKKAKKKKKKKKKKKWKAK...
...KAKWKAAAAAAKWWWWKAKKAKWKAK...
...KAKWKKKKKKKKWWWWKAKKAKWKAK...
...KAKWWWWWWWWWWWWWKKKKKKWKAK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAAGGGGGGAAAAAAAAAAAAAAAAK...
...KAAGGGGGGAAAAAAAAAAAAAAAAK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
................................
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="6" y="8" width="22" height="1" fill="#000000" />
  <rect x="6" y="9" width="22" height="1" fill="#000000" />
  <rect x="6" y="10" width="2" height="1" fill="#000000" />
  <rect x="8" y="10" width="18" height="1" fill="#FFB000" />
  <rect x="26" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="11" width="18" height="1" fill="#FFB000" />
  <rect x="26" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="18" height="1" fill="#FFB000" />
  <rect x="26" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="18" height="1" fill="#FFB000" />
  <rect x="26" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#000000" />
  <rect x="8" y="14" width="18" height="1" fill="#FFB000" />
  <rect x="26" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#000000" />
  <rect x="8" y="15" width="18" height="1" fill="#FFB000" />
  <rect x="26" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="52" height="1" fill="#000000" />
  <rect x="6" y="17" width="52" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="20" width="44" height="1" fill="#000000" />
  <rect x="54" y="20" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="21" width="44" height="1" fill="#000000" />
  <rect x="54" y="21" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="22" width="2" height="1" fill="#000000" />
  <rect x="12" y="22" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="22" width="2" height="1" fill="#000000" />
  <rect x="54" y="22" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="23" width="2" height="1" fill="#000000" />
  <rect x="12" y="23" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="23" width="2" height="1" fill="#000000" />
  <rect x="54" y="23" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="24" width="2" height="1" fill="#000000" />
  <rect x="12" y="24" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="24" width="2" height="1" fill="#000000" />
  <rect x="54" y="24" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="25" width="2" height="1" fill="#000000" />
  <rect x="12" y="25" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="25" width="2" height="1" fill="#000000" />
  <rect x="54" y="25" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="26" width="2" height="1" fill="#000000" />
  <rect x="12" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="26" width="16" height="1" fill="#000000" />
  <rect x="30" y="26" width="22" height="1" fill="#F1F1F1" />
  <rect x="52" y="26" width="2" height="1" fill="#000000" />
  <rect x="54" y="26" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="27" width="2" height="1" fill="#000000" />
  <rect x="12" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="27" width="16" height="1" fill="#000000" />
  <rect x="30" y="27" width="22" height="1" fill="#F1F1F1" />
  <rect x="52" y="27" width="2" height="1" fill="#000000" />
  <rect x="54" y="27" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="28" width="2" height="1" fill="#000000" />
  <rect x="12" y="28" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="28" width="2" height="1" fill="#000000" />
  <rect x="16" y="28" width="12" height="1" fill="#FFB000" />
  <rect x="28" y="28" width="2" height="1" fill="#000000" />
  <rect x="30" y="28" width="22" height="1" fill="#F1F1F1" />
  <rect x="52" y="28" width="2" height="1" fill="#000000" />
  <rect x="54" y="28" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="29" width="2" height="1" fill="#000000" />
  <rect x="12" y="29" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="29" width="2" height="1" fill="#000000" />
  <rect x="16" y="29" width="12" height="1" fill="#FFB000" />
  <rect x="28" y="29" width="2" height="1" fill="#000000" />
  <rect x="30" y="29" width="22" height="1" fill="#F1F1F1" />
  <rect x="52" y="29" width="2" height="1" fill="#000000" />
  <rect x="54" y="29" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="30" width="2" height="1" fill="#000000" />
  <rect x="12" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="30" width="2" height="1" fill="#000000" />
  <rect x="16" y="30" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="30" width="8" height="1" fill="#000000" />
  <rect x="26" y="30" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="30" width="22" height="1" fill="#000000" />
  <rect x="50" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="30" width="2" height="1" fill="#000000" />
  <rect x="54" y="30" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="31" width="2" height="1" fill="#000000" />
  <rect x="12" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="31" width="2" height="1" fill="#000000" />
  <rect x="16" y="31" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="31" width="8" height="1" fill="#000000" />
  <rect x="26" y="31" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="31" width="22" height="1" fill="#000000" />
  <rect x="50" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="31" width="2" height="1" fill="#000000" />
  <rect x="54" y="31" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="32" width="2" height="1" fill="#000000" />
  <rect x="12" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="32" width="2" height="1" fill="#000000" />
  <rect x="16" y="32" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="32" width="2" height="1" fill="#000000" />
  <rect x="20" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="24" y="32" width="2" height="1" fill="#000000" />
  <rect x="26" y="32" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="32" width="2" height="1" fill="#000000" />
  <rect x="30" y="32" width="18" height="1" fill="#FFB000" />
  <rect x="48" y="32" width="2" height="1" fill="#000000" />
  <rect x="50" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="32" width="2" height="1" fill="#000000" />
  <rect x="54" y="32" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="33" width="2" height="1" fill="#000000" />
  <rect x="12" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="33" width="2" height="1" fill="#000000" />
  <rect x="16" y="33" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="33" width="2" height="1" fill="#000000" />
  <rect x="20" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="24" y="33" width="2" height="1" fill="#000000" />
  <rect x="26" y="33" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="33" width="2" height="1" fill="#000000" />
  <rect x="30" y="33" width="18" height="1" fill="#FFB000" />
  <rect x="48" y="33" width="2" height="1" fill="#000000" />
  <rect x="50" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="33" width="2" height="1" fill="#000000" />
  <rect x="54" y="33" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="34" width="2" height="1" fill="#000000" />
  <rect x="12" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="34" width="2" height="1" fill="#000000" />
  <rect x="16" y="34" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="34" width="2" height="1" fill="#000000" />
  <rect x="20" y="34" width="4" height="1" fill="#F1F1F1" />
  <rect x="24" y="34" width="2" height="1" fill="#000000" />
  <rect x="26" y="34" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="34" width="2" height="1" fill="#000000" />
  <rect x="30" y="34" width="18" height="1" fill="#FFB000" />
  <rect x="48" y="34" width="2" height="1" fill="#000000" />
  <rect x="50" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="34" width="2" height="1" fill="#000000" />
  <rect x="54" y="34" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="35" width="2" height="1" fill="#000000" />
  <rect x="12" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="35" width="2" height="1" fill="#000000" />
  <rect x="16" y="35" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="35" width="2" height="1" fill="#000000" />
  <rect x="20" y="35" width="4" height="1" fill="#F1F1F1" />
  <rect x="24" y="35" width="2" height="1" fill="#000000" />
  <rect x="26" y="35" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="35" width="2" height="1" fill="#000000" />
  <rect x="30" y="35" width="18" height="1" fill="#FFB000" />
  <rect x="48" y="35" width="2" height="1" fill="#000000" />
  <rect x="50" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="35" width="2" height="1" fill="#000000" />
  <rect x="54" y="35" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="36" width="2" height="1" fill="#000000" />
  <rect x="12" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="36" width="2" height="1" fill="#000000" />
  <rect x="16" y="36" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="36" width="8" height="1" fill="#000000" />
  <rect x="26" y="36" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="36" width="22" height="1" fill="#000000" />
  <rect x="50" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="36" width="2" height="1" fill="#000000" />
  <rect x="54" y="36" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="2" height="1" fill="#000000" />
  <rect x="8" y="37" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="37" width="2" height="1" fill="#000000" />
  <rect x="12" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="37" width="2" height="1" fill="#000000" />
  <rect x="16" y="37" width="2" height="1" fill="#FFB000" />
  <rect x="18" y="37" width="8" height="1" fill="#000000" />
  <rect x="26" y="37" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="37" width="22" height="1" fill="#000000" />
  <rect x="50" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="37" width="2" height="1" fill="#000000" />
  <rect x="54" y="37" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="38" width="2" height="1" fill="#000000" />
  <rect x="12" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="38" width="2" height="1" fill="#000000" />
  <rect x="16" y="38" width="12" height="1" fill="#FFB000" />
  <rect x="28" y="38" width="2" height="1" fill="#000000" />
  <rect x="30" y="38" width="8" height="1" fill="#F1F1F1" />
  <rect x="38" y="38" width="2" height="1" fill="#000000" />
  <rect x="40" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="38" width="4" height="1" fill="#000000" />
  <rect x="46" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="48" y="38" width="2" height="1" fill="#000000" />
  <rect x="50" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="38" width="2" height="1" fill="#000000" />
  <rect x="54" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="39" width="2" height="1" fill="#000000" />
  <rect x="12" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="39" width="2" height="1" fill="#000000" />
  <rect x="16" y="39" width="12" height="1" fill="#FFB000" />
  <rect x="28" y="39" width="2" height="1" fill="#000000" />
  <rect x="30" y="39" width="8" height="1" fill="#F1F1F1" />
  <rect x="38" y="39" width="2" height="1" fill="#000000" />
  <rect x="40" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="39" width="4" height="1" fill="#000000" />
  <rect x="46" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="48" y="39" width="2" height="1" fill="#000000" />
  <rect x="50" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="39" width="2" height="1" fill="#000000" />
  <rect x="54" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="40" width="2" height="1" fill="#000000" />
  <rect x="12" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="40" width="16" height="1" fill="#000000" />
  <rect x="30" y="40" width="8" height="1" fill="#F1F1F1" />
  <rect x="38" y="40" width="2" height="1" fill="#000000" />
  <rect x="40" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="40" width="4" height="1" fill="#000000" />
  <rect x="46" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="48" y="40" width="2" height="1" fill="#000000" />
  <rect x="50" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="40" width="2" height="1" fill="#000000" />
  <rect x="54" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="41" width="2" height="1" fill="#000000" />
  <rect x="12" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="14" y="41" width="16" height="1" fill="#000000" />
  <rect x="30" y="41" width="8" height="1" fill="#F1F1F1" />
  <rect x="38" y="41" width="2" height="1" fill="#000000" />
  <rect x="40" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="41" width="4" height="1" fill="#000000" />
  <rect x="46" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="48" y="41" width="2" height="1" fill="#000000" />
  <rect x="50" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="41" width="2" height="1" fill="#000000" />
  <rect x="54" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="42" width="2" height="1" fill="#000000" />
  <rect x="12" y="42" width="26" height="1" fill="#F1F1F1" />
  <rect x="38" y="42" width="12" height="1" fill="#000000" />
  <rect x="50" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="42" width="2" height="1" fill="#000000" />
  <rect x="54" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="10" y="43" width="2" height="1" fill="#000000" />
  <rect x="12" y="43" width="26" height="1" fill="#F1F1F1" />
  <rect x="38" y="43" width="12" height="1" fill="#000000" />
  <rect x="50" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="43" width="2" height="1" fill="#000000" />
  <rect x="54" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="52" height="1" fill="#000000" />
  <rect x="6" y="45" width="52" height="1" fill="#000000" />
  <rect x="6" y="46" width="2" height="1" fill="#000000" />
  <rect x="8" y="46" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="2" height="1" fill="#000000" />
  <rect x="8" y="47" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="48" width="12" height="1" fill="#33FF00" />
  <rect x="24" y="48" width="32" height="1" fill="#FFB000" />
  <rect x="56" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="49" width="12" height="1" fill="#33FF00" />
  <rect x="24" y="49" width="32" height="1" fill="#FFB000" />
  <rect x="56" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="50" width="12" height="1" fill="#33FF00" />
  <rect x="24" y="50" width="32" height="1" fill="#FFB000" />
  <rect x="56" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="51" width="12" height="1" fill="#33FF00" />
  <rect x="24" y="51" width="32" height="1" fill="#FFB000" />
  <rect x="56" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="52" height="1" fill="#000000" />
  <rect x="6" y="55" width="52" height="1" fill="#000000" />
</svg>
```
