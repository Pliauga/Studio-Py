# Week 13: CLI Tools and File Paths — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 13 (`week-13`)
- **Lesson ID**: `week-13-command-line-interfaces`
- **Title**: CLI Tools and File Paths
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-13.mdx`

## 2. Narrative Context (The Hook)
`cron` cannot click a dashboard button at 3:14 AM. You equip the fleet scanner with `pathlib.Path` object paths, `argparse` CLI flags, separated `stdout`/`stderr` streams, and Unix exit codes (`0` vs `1`).

## 3. Material Taught (Waypoints)
- **Waypoint 1: Paths Are Objects, Not Strings**: `pathlib.Path`, cross-OS `/` joining, `.name`, `.stem`, `.suffix`, `.parent`, `.exists()`, `.is_file()`, `.is_dir()`, `.read_text()`, and `.write_text()`.
- **Waypoint 2: Stop Editing the Script to Change the Input**: `argparse.ArgumentParser`, `.add_argument()` with `type=int` / `type=float` / `type=Path`, `default=`, and boolean flags via `action="store_true"`.
- **Waypoint 3: Exit Codes and the Two Output Streams**: Returning integer exit codes (`0` for OK, `1`/`2` for failure) from `main()`, and keeping diagnostic errors on `sys.stderr` (`file=sys.stderr`) separate from `sys.stdout` data.
- **Waypoint 4: Sweeping a Directory Tree Safely**: Walking directory trees deterministically with `sorted(Path.glob("*.csv"))` and `Path.rglob("*.csv")`.

## 4. Key Traps & Edge Cases Covered
- Using `type=bool` in `argparse` (`bool("False")` is `True`!); always use `action="store_true"` for boolean flags.
- Omitting `type=int` or `type=float` leaves numeric flags as `str`.
- Printing error messages to `stdout` corrupts downstream shell pipelines; returning Python `True`/`False` inverts Unix `0` (success) vs `1` (failure).
- Calling `parser.parse_args()` at module import top-level instead of inside `main()`.

## 5. Interactive Exercises & Components
- `w13-pathlib-parts` (`print(p.stem, p.suffix)`)
- `w13-argparse-flags` (`type=int` on `--limit` and `action='store_true'` on `--verbose`)
- `w13-exit-code-contract` (`return 1 if over else 0` from `main`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week13_icon`)

### Strict Visual Rules Applied
- **Subject**: **CLI** — A black terminal window with a green >_ prompt.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week13_icon.svg`](./week13_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
................................
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
..KWKKKKWWWWWWWWWWWWWWWWKKKKWK..
..KWKAAKWWWWWWWWWWWWWWWWKGGKWK..
..KWKAAKWWWWWWWWWWWWWWWWKGGKWK..
..KWKKKKWWWWWWWWWWWWWWWWKKKKWK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKGGGKKKKKKKKKKKKKKKKKKWK..
..KWKKKKGGGKKKKKKKKKKKKKKKKKWK..
..KWKKKKKGGGKKKKKKKKKKKKKKKKWK..
..KWKKKKKKGGGKKKKKKKKKKKKKKKWK..
..KWKKKKKGGGKKKKKKKKKKKKKKKKWK..
..KWKKKKGGGKKKKKKKKKKKKKKKKKWK..
..KWKKKGGGKKKGGGGGGKKKKKKKKKWK..
..KWKKKKKKKKKGGGGGGKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWKKKKKKKKKKKKKKKKKKKKKKKKWK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
................................
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="4" y="8" width="56" height="1" fill="#000000" />
  <rect x="4" y="9" width="56" height="1" fill="#000000" />
  <rect x="4" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="10" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="10" width="8" height="1" fill="#000000" />
  <rect x="16" y="10" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="10" width="8" height="1" fill="#000000" />
  <rect x="56" y="10" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="10" width="2" height="1" fill="#000000" />
  <rect x="4" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="11" width="8" height="1" fill="#000000" />
  <rect x="16" y="11" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="11" width="8" height="1" fill="#000000" />
  <rect x="56" y="11" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="11" width="2" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="12" width="2" height="1" fill="#000000" />
  <rect x="10" y="12" width="4" height="1" fill="#FFB000" />
  <rect x="14" y="12" width="2" height="1" fill="#000000" />
  <rect x="16" y="12" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="12" width="2" height="1" fill="#000000" />
  <rect x="50" y="12" width="4" height="1" fill="#33FF00" />
  <rect x="54" y="12" width="2" height="1" fill="#000000" />
  <rect x="56" y="12" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="13" width="2" height="1" fill="#000000" />
  <rect x="10" y="13" width="4" height="1" fill="#FFB000" />
  <rect x="14" y="13" width="2" height="1" fill="#000000" />
  <rect x="16" y="13" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="13" width="2" height="1" fill="#000000" />
  <rect x="50" y="13" width="4" height="1" fill="#33FF00" />
  <rect x="54" y="13" width="2" height="1" fill="#000000" />
  <rect x="56" y="13" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="14" width="2" height="1" fill="#000000" />
  <rect x="10" y="14" width="4" height="1" fill="#FFB000" />
  <rect x="14" y="14" width="2" height="1" fill="#000000" />
  <rect x="16" y="14" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="14" width="2" height="1" fill="#000000" />
  <rect x="50" y="14" width="4" height="1" fill="#33FF00" />
  <rect x="54" y="14" width="2" height="1" fill="#000000" />
  <rect x="56" y="14" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="15" width="2" height="1" fill="#000000" />
  <rect x="10" y="15" width="4" height="1" fill="#FFB000" />
  <rect x="14" y="15" width="2" height="1" fill="#000000" />
  <rect x="16" y="15" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="15" width="2" height="1" fill="#000000" />
  <rect x="50" y="15" width="4" height="1" fill="#33FF00" />
  <rect x="54" y="15" width="2" height="1" fill="#000000" />
  <rect x="56" y="15" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="16" width="8" height="1" fill="#000000" />
  <rect x="16" y="16" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="16" width="8" height="1" fill="#000000" />
  <rect x="56" y="16" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="16" width="2" height="1" fill="#000000" />
  <rect x="4" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="17" width="8" height="1" fill="#000000" />
  <rect x="16" y="17" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="17" width="8" height="1" fill="#000000" />
  <rect x="56" y="17" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="17" width="2" height="1" fill="#000000" />
  <rect x="4" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="18" width="2" height="1" fill="#000000" />
  <rect x="4" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="19" width="2" height="1" fill="#000000" />
  <rect x="4" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="20" width="48" height="1" fill="#000000" />
  <rect x="56" y="20" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="20" width="2" height="1" fill="#000000" />
  <rect x="4" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="21" width="48" height="1" fill="#000000" />
  <rect x="56" y="21" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="21" width="2" height="1" fill="#000000" />
  <rect x="4" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="22" width="48" height="1" fill="#000000" />
  <rect x="56" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="22" width="2" height="1" fill="#000000" />
  <rect x="4" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="23" width="48" height="1" fill="#000000" />
  <rect x="56" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="23" width="2" height="1" fill="#000000" />
  <rect x="4" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="24" width="48" height="1" fill="#000000" />
  <rect x="56" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="24" width="2" height="1" fill="#000000" />
  <rect x="4" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="25" width="48" height="1" fill="#000000" />
  <rect x="56" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="25" width="2" height="1" fill="#000000" />
  <rect x="4" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="26" width="6" height="1" fill="#000000" />
  <rect x="14" y="26" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="26" width="36" height="1" fill="#000000" />
  <rect x="56" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="26" width="2" height="1" fill="#000000" />
  <rect x="4" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="27" width="6" height="1" fill="#000000" />
  <rect x="14" y="27" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="27" width="36" height="1" fill="#000000" />
  <rect x="56" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="27" width="2" height="1" fill="#000000" />
  <rect x="4" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="28" width="8" height="1" fill="#000000" />
  <rect x="16" y="28" width="6" height="1" fill="#33FF00" />
  <rect x="22" y="28" width="34" height="1" fill="#000000" />
  <rect x="56" y="28" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="28" width="2" height="1" fill="#000000" />
  <rect x="4" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="29" width="8" height="1" fill="#000000" />
  <rect x="16" y="29" width="6" height="1" fill="#33FF00" />
  <rect x="22" y="29" width="34" height="1" fill="#000000" />
  <rect x="56" y="29" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="29" width="2" height="1" fill="#000000" />
  <rect x="4" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="30" width="10" height="1" fill="#000000" />
  <rect x="18" y="30" width="6" height="1" fill="#33FF00" />
  <rect x="24" y="30" width="32" height="1" fill="#000000" />
  <rect x="56" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="30" width="2" height="1" fill="#000000" />
  <rect x="4" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="31" width="10" height="1" fill="#000000" />
  <rect x="18" y="31" width="6" height="1" fill="#33FF00" />
  <rect x="24" y="31" width="32" height="1" fill="#000000" />
  <rect x="56" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="31" width="2" height="1" fill="#000000" />
  <rect x="4" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="32" width="12" height="1" fill="#000000" />
  <rect x="20" y="32" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="32" width="30" height="1" fill="#000000" />
  <rect x="56" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="32" width="2" height="1" fill="#000000" />
  <rect x="4" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="33" width="12" height="1" fill="#000000" />
  <rect x="20" y="33" width="6" height="1" fill="#33FF00" />
  <rect x="26" y="33" width="30" height="1" fill="#000000" />
  <rect x="56" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="33" width="2" height="1" fill="#000000" />
  <rect x="4" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="34" width="10" height="1" fill="#000000" />
  <rect x="18" y="34" width="6" height="1" fill="#33FF00" />
  <rect x="24" y="34" width="32" height="1" fill="#000000" />
  <rect x="56" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="34" width="2" height="1" fill="#000000" />
  <rect x="4" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="35" width="10" height="1" fill="#000000" />
  <rect x="18" y="35" width="6" height="1" fill="#33FF00" />
  <rect x="24" y="35" width="32" height="1" fill="#000000" />
  <rect x="56" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="35" width="2" height="1" fill="#000000" />
  <rect x="4" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="36" width="8" height="1" fill="#000000" />
  <rect x="16" y="36" width="6" height="1" fill="#33FF00" />
  <rect x="22" y="36" width="34" height="1" fill="#000000" />
  <rect x="56" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="36" width="2" height="1" fill="#000000" />
  <rect x="4" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="37" width="8" height="1" fill="#000000" />
  <rect x="16" y="37" width="6" height="1" fill="#33FF00" />
  <rect x="22" y="37" width="34" height="1" fill="#000000" />
  <rect x="56" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="37" width="2" height="1" fill="#000000" />
  <rect x="4" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="38" width="6" height="1" fill="#000000" />
  <rect x="14" y="38" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="38" width="6" height="1" fill="#000000" />
  <rect x="26" y="38" width="12" height="1" fill="#33FF00" />
  <rect x="38" y="38" width="18" height="1" fill="#000000" />
  <rect x="56" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="38" width="2" height="1" fill="#000000" />
  <rect x="4" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="39" width="6" height="1" fill="#000000" />
  <rect x="14" y="39" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="39" width="6" height="1" fill="#000000" />
  <rect x="26" y="39" width="12" height="1" fill="#33FF00" />
  <rect x="38" y="39" width="18" height="1" fill="#000000" />
  <rect x="56" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="39" width="2" height="1" fill="#000000" />
  <rect x="4" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="40" width="18" height="1" fill="#000000" />
  <rect x="26" y="40" width="12" height="1" fill="#33FF00" />
  <rect x="38" y="40" width="18" height="1" fill="#000000" />
  <rect x="56" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="40" width="2" height="1" fill="#000000" />
  <rect x="4" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="41" width="18" height="1" fill="#000000" />
  <rect x="26" y="41" width="12" height="1" fill="#33FF00" />
  <rect x="38" y="41" width="18" height="1" fill="#000000" />
  <rect x="56" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="41" width="2" height="1" fill="#000000" />
  <rect x="4" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="42" width="48" height="1" fill="#000000" />
  <rect x="56" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="42" width="2" height="1" fill="#000000" />
  <rect x="4" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="43" width="48" height="1" fill="#000000" />
  <rect x="56" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="43" width="2" height="1" fill="#000000" />
  <rect x="4" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="44" width="48" height="1" fill="#000000" />
  <rect x="56" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="44" width="2" height="1" fill="#000000" />
  <rect x="4" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="45" width="48" height="1" fill="#000000" />
  <rect x="56" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="45" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="46" width="48" height="1" fill="#000000" />
  <rect x="56" y="46" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="46" width="2" height="1" fill="#000000" />
  <rect x="4" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="47" width="48" height="1" fill="#000000" />
  <rect x="56" y="47" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="47" width="2" height="1" fill="#000000" />
  <rect x="4" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="48" width="48" height="1" fill="#000000" />
  <rect x="56" y="48" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="48" width="2" height="1" fill="#000000" />
  <rect x="4" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="49" width="48" height="1" fill="#000000" />
  <rect x="56" y="49" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="49" width="2" height="1" fill="#000000" />
  <rect x="4" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="50" width="48" height="1" fill="#000000" />
  <rect x="56" y="50" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="51" width="48" height="1" fill="#000000" />
  <rect x="56" y="51" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="52" width="2" height="1" fill="#000000" />
  <rect x="4" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="53" width="2" height="1" fill="#000000" />
  <rect x="4" y="54" width="56" height="1" fill="#000000" />
  <rect x="4" y="55" width="56" height="1" fill="#000000" />
</svg>
```
