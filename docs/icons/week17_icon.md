# Week 17: Generators and Data Streams — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 17 (`week-17`)
- **Lesson ID**: `week-17-generators-and-streaming`
- **Title**: Generators and Data Streams
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-17.mdx`

## 2. Narrative Context (The Hook)
A rotated proxy log is 14 GB, and calling `readlines()` or building a list comprehension triggers `MemoryError`. You build constant-memory streaming pipelines with `yield`, generator expressions, `itertools`, and `.jsonl` parsers.

## 3. Material Taught (Waypoints)
- **Waypoint 1: `yield` Pauses Instead of Returning All at Once**: Generator functions using `yield`, lazy evaluation on `next()` / `for`, and keeping only a single item in RAM at a time.
- **Waypoint 2: Generator Expressions and Composable Stages**: Lazy generator expressions `(x for x in ...)` feeding `sum()`, `max()`, and `any()`; Unix-pipe stage composition; avoiding single-pass exhaustion.
- **Waypoint 3: Slicing, Batching, and Chaining with `itertools`**: `itertools.islice(stream, count)` on infinite/large iterators, `itertools.chain(a, b)`, and `itertools.batched(stream, n)`.
- **Waypoint 4: Streaming JSON Lines (`.jsonl`) Without Blowing RAM**: Streaming NDJSON / `.jsonl` files line-by-line with `json.loads(line)` inside a generator while keeping `yield` inside the `with open(...)` context.

## 4. Key Traps & Edge Cases Covered
- Iterating over the same generator variable twice (e.g., `sum(over)` then `max(over)`): the second pass sees an exhausted iterator (`[]`).
- Calling `len(gen)` or subscripting `gen[0]` on a generator raises `TypeError` (use `itertools.islice` or `next()`).
- Returning a generator over an open file after the `with open(...)` block has exited raises `ValueError: I/O operation on closed file`.
- Calling `json.load(f)` on a multi-line `.jsonl` file instead of `json.loads(line)` per line.

## 5. Interactive Exercises & Components
- `w17-yield-over-limit` (generator function with `yield host`)
- `w17-exhausted-generator` (computing `count` and `peak` with fresh generator expressions)
- `w17-islice-preview` (`list(itertools.islice(stream, count))` on `infinite_ids()`)
- `w17-jsonl-generator` (`json.loads(line)` lazily yielding failed hosts)
- PredictOutput: `w17-predict-exhausted-generator`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week17_icon`)

### Strict Visual Rules Applied
- **Subject**: **Generators** — An industrial hopper feeding a single block onto a conveyor belt.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week17_icon.svg`](./week17_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
.....KKKKKKKKKKKKKKKKKKKKKK.....
.....KAAAAAAAAAAAAAAAAAAAAK.....
.....KAAAAAAAAAAAAAAAAAAAAK.....
.....KAAAAAAAAAAAAAAAAAAAAK.....
.....KAAAAAAAAAAAAAAAAAAAAK.....
.....KAAAAAAAAAAAAAAAAAAAAK.....
.....KKKKKKKKKKKKKKKKKKKKKK.....
.........KAAAAAAAAAAAAK.........
.........KAAAAAAAAAAAAK.........
.........KAAAAAAAAAAAAK.........
.........KKKKKKKKKKKKKK.........
............KWWWWWWK............
............KWWWWWWK............
............KKKKKKKK............
.............KKKKKK.............
.............KGGGGK.............
.............KGGGGK.............
.............KGGGGK.............
.............KGGGGK.............
.............KKKKKK.............
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KWKKKKKWWWWKKKKKKWWWWKKKKKWK..
..KWKAAAKWWWWKAAAAKWWWWKAAAKWK..
..KWKKKKKWWWWKKKKKKWWWWKKKKKWK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="10" y="4" width="44" height="1" fill="#000000" />
  <rect x="10" y="5" width="44" height="1" fill="#000000" />
  <rect x="10" y="6" width="2" height="1" fill="#000000" />
  <rect x="12" y="6" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="6" width="2" height="1" fill="#000000" />
  <rect x="10" y="7" width="2" height="1" fill="#000000" />
  <rect x="12" y="7" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="7" width="2" height="1" fill="#000000" />
  <rect x="10" y="8" width="2" height="1" fill="#000000" />
  <rect x="12" y="8" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="8" width="2" height="1" fill="#000000" />
  <rect x="10" y="9" width="2" height="1" fill="#000000" />
  <rect x="12" y="9" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="9" width="2" height="1" fill="#000000" />
  <rect x="10" y="10" width="2" height="1" fill="#000000" />
  <rect x="12" y="10" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="10" width="2" height="1" fill="#000000" />
  <rect x="10" y="11" width="2" height="1" fill="#000000" />
  <rect x="12" y="11" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="11" width="2" height="1" fill="#000000" />
  <rect x="10" y="12" width="2" height="1" fill="#000000" />
  <rect x="12" y="12" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="12" width="2" height="1" fill="#000000" />
  <rect x="10" y="13" width="2" height="1" fill="#000000" />
  <rect x="12" y="13" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="13" width="2" height="1" fill="#000000" />
  <rect x="10" y="14" width="2" height="1" fill="#000000" />
  <rect x="12" y="14" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="14" width="2" height="1" fill="#000000" />
  <rect x="10" y="15" width="2" height="1" fill="#000000" />
  <rect x="12" y="15" width="40" height="1" fill="#FFB000" />
  <rect x="52" y="15" width="2" height="1" fill="#000000" />
  <rect x="10" y="16" width="44" height="1" fill="#000000" />
  <rect x="10" y="17" width="44" height="1" fill="#000000" />
  <rect x="18" y="18" width="2" height="1" fill="#000000" />
  <rect x="20" y="18" width="24" height="1" fill="#FFB000" />
  <rect x="44" y="18" width="2" height="1" fill="#000000" />
  <rect x="18" y="19" width="2" height="1" fill="#000000" />
  <rect x="20" y="19" width="24" height="1" fill="#FFB000" />
  <rect x="44" y="19" width="2" height="1" fill="#000000" />
  <rect x="18" y="20" width="2" height="1" fill="#000000" />
  <rect x="20" y="20" width="24" height="1" fill="#FFB000" />
  <rect x="44" y="20" width="2" height="1" fill="#000000" />
  <rect x="18" y="21" width="2" height="1" fill="#000000" />
  <rect x="20" y="21" width="24" height="1" fill="#FFB000" />
  <rect x="44" y="21" width="2" height="1" fill="#000000" />
  <rect x="18" y="22" width="2" height="1" fill="#000000" />
  <rect x="20" y="22" width="24" height="1" fill="#FFB000" />
  <rect x="44" y="22" width="2" height="1" fill="#000000" />
  <rect x="18" y="23" width="2" height="1" fill="#000000" />
  <rect x="20" y="23" width="24" height="1" fill="#FFB000" />
  <rect x="44" y="23" width="2" height="1" fill="#000000" />
  <rect x="18" y="24" width="28" height="1" fill="#000000" />
  <rect x="18" y="25" width="28" height="1" fill="#000000" />
  <rect x="24" y="26" width="2" height="1" fill="#000000" />
  <rect x="26" y="26" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="26" width="2" height="1" fill="#000000" />
  <rect x="24" y="27" width="2" height="1" fill="#000000" />
  <rect x="26" y="27" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="27" width="2" height="1" fill="#000000" />
  <rect x="24" y="28" width="2" height="1" fill="#000000" />
  <rect x="26" y="28" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="28" width="2" height="1" fill="#000000" />
  <rect x="24" y="29" width="2" height="1" fill="#000000" />
  <rect x="26" y="29" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="29" width="2" height="1" fill="#000000" />
  <rect x="24" y="30" width="16" height="1" fill="#000000" />
  <rect x="24" y="31" width="16" height="1" fill="#000000" />
  <rect x="26" y="32" width="12" height="1" fill="#000000" />
  <rect x="26" y="33" width="12" height="1" fill="#000000" />
  <rect x="26" y="34" width="2" height="1" fill="#000000" />
  <rect x="28" y="34" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="34" width="2" height="1" fill="#000000" />
  <rect x="26" y="35" width="2" height="1" fill="#000000" />
  <rect x="28" y="35" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="35" width="2" height="1" fill="#000000" />
  <rect x="26" y="36" width="2" height="1" fill="#000000" />
  <rect x="28" y="36" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="36" width="2" height="1" fill="#000000" />
  <rect x="26" y="37" width="2" height="1" fill="#000000" />
  <rect x="28" y="37" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="37" width="2" height="1" fill="#000000" />
  <rect x="26" y="38" width="2" height="1" fill="#000000" />
  <rect x="28" y="38" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="38" width="2" height="1" fill="#000000" />
  <rect x="26" y="39" width="2" height="1" fill="#000000" />
  <rect x="28" y="39" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="39" width="2" height="1" fill="#000000" />
  <rect x="26" y="40" width="2" height="1" fill="#000000" />
  <rect x="28" y="40" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="40" width="2" height="1" fill="#000000" />
  <rect x="26" y="41" width="2" height="1" fill="#000000" />
  <rect x="28" y="41" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="41" width="2" height="1" fill="#000000" />
  <rect x="26" y="42" width="12" height="1" fill="#000000" />
  <rect x="26" y="43" width="12" height="1" fill="#000000" />
  <rect x="4" y="44" width="56" height="1" fill="#000000" />
  <rect x="4" y="45" width="56" height="1" fill="#000000" />
  <rect x="4" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="46" width="2" height="1" fill="#000000" />
  <rect x="4" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="47" width="2" height="1" fill="#000000" />
  <rect x="4" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="48" width="10" height="1" fill="#000000" />
  <rect x="18" y="48" width="8" height="1" fill="#F1F1F1" />
  <rect x="26" y="48" width="12" height="1" fill="#000000" />
  <rect x="38" y="48" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="48" width="10" height="1" fill="#000000" />
  <rect x="56" y="48" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="48" width="2" height="1" fill="#000000" />
  <rect x="4" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="49" width="10" height="1" fill="#000000" />
  <rect x="18" y="49" width="8" height="1" fill="#F1F1F1" />
  <rect x="26" y="49" width="12" height="1" fill="#000000" />
  <rect x="38" y="49" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="49" width="10" height="1" fill="#000000" />
  <rect x="56" y="49" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="49" width="2" height="1" fill="#000000" />
  <rect x="4" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="50" width="2" height="1" fill="#000000" />
  <rect x="10" y="50" width="6" height="1" fill="#FFB000" />
  <rect x="16" y="50" width="2" height="1" fill="#000000" />
  <rect x="18" y="50" width="8" height="1" fill="#F1F1F1" />
  <rect x="26" y="50" width="2" height="1" fill="#000000" />
  <rect x="28" y="50" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="50" width="2" height="1" fill="#000000" />
  <rect x="38" y="50" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="50" width="2" height="1" fill="#000000" />
  <rect x="48" y="50" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="50" width="2" height="1" fill="#000000" />
  <rect x="56" y="50" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="51" width="2" height="1" fill="#000000" />
  <rect x="10" y="51" width="6" height="1" fill="#FFB000" />
  <rect x="16" y="51" width="2" height="1" fill="#000000" />
  <rect x="18" y="51" width="8" height="1" fill="#F1F1F1" />
  <rect x="26" y="51" width="2" height="1" fill="#000000" />
  <rect x="28" y="51" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="51" width="2" height="1" fill="#000000" />
  <rect x="38" y="51" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="51" width="2" height="1" fill="#000000" />
  <rect x="48" y="51" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="51" width="2" height="1" fill="#000000" />
  <rect x="56" y="51" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="52" width="10" height="1" fill="#000000" />
  <rect x="18" y="52" width="8" height="1" fill="#F1F1F1" />
  <rect x="26" y="52" width="12" height="1" fill="#000000" />
  <rect x="38" y="52" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="52" width="10" height="1" fill="#000000" />
  <rect x="56" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="52" width="2" height="1" fill="#000000" />
  <rect x="4" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="53" width="10" height="1" fill="#000000" />
  <rect x="18" y="53" width="8" height="1" fill="#F1F1F1" />
  <rect x="26" y="53" width="12" height="1" fill="#000000" />
  <rect x="38" y="53" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="53" width="10" height="1" fill="#000000" />
  <rect x="56" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="53" width="2" height="1" fill="#000000" />
  <rect x="4" y="54" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="54" width="2" height="1" fill="#000000" />
  <rect x="4" y="55" width="2" height="1" fill="#000000" />
  <rect x="6" y="55" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="55" width="2" height="1" fill="#000000" />
  <rect x="4" y="56" width="56" height="1" fill="#000000" />
  <rect x="4" y="57" width="56" height="1" fill="#000000" />
</svg>
```
