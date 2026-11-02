# Week 05: Classes and Objects — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 5 (`week-05`)
- **Lesson ID**: `week-05-classes-and-objects`
- **Title**: Classes and Objects
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-05.mdx`

## 2. Narrative Context (The Hook)
The on-call lead asks for `srv-07.status()`, exposing the flaw in plain dicts: data and the logic that judges it live in separate places. You unite state and behavior inside a `Record` class and model a fleet of objects.

## 3. Material Taught (Waypoints)
- **Waypoint 1: The Blueprint and the Instance**: `class Record:`, `__init__(self, label, value, limit)`, `self` instance binding, per-object state isolation, and attribute dot notation (`r1.label`).
- **Waypoint 2: Methods and the Key to Its Own Room**: Instance methods (`def percent(self):`, `def status(self):`), calling `self.percent()` internally, stateful methods (`Checker`), and 3D LIFO stack operations (`<SandboxEmbed mode="stack" />` with `Stack`, `stack_push`, `stack_pop`).
- **Waypoint 3: A List of Objects**: Building and iterating over a list of `Record` instances (`record.status()`) and upgrading `load_records` to return objects.
- **Waypoint 4: Count Is a Query, Not a Side Effect**: Writing pure query functions (`count_over(records)`) instead of mutating counters inside getters, and distinguishing class attributes (`Checker.over_limit_count`) from instance attributes (`self.over_limit_count`).

## 4. Key Traps & Edge Cases Covered
- Omitting `self` in method definitions raises `TypeError`; writing `value = value` instead of `self.value = value` discards the attribute.
- Accessing `records["label"]` on a list of objects raises `TypeError`; accessing an instance attribute on the class (`Record.label`) raises `AttributeError`.
- Writing `self.over_limit_count += 1` shadows a class attribute with an instance copy instead of updating `Checker.over_limit_count`.
- Incrementing counters inside a getter like `status()` silently corrupts counts when called twice.

## 5. Interactive Exercises & Components
- `w05-init-attribute` (fixing `self.limit = limit` in `Record.__init__`)
- `w05-method-status` (implementing 3-tier `Record.status(self)` via `self.percent()`)
- `w05-stack-push` (pushing/popping record statuses with `Stack` and 3D `stack_push`/`stack_pop`)
- `w05-class-counter` (incrementing `Checker.over_limit_count` on the class)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week5_icon`)

### Strict Visual Rules Applied
- **Subject**: **Classes** — An architectural blueprint scroll.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week5_icon.svg`](./week5_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
....KKKKKKKKKKKKKKKKKKKKKKKK....
..KKKKWWWWWWWWWWWWWWWWWWWWKKKK..
..KAAKWWWWWWWWWWWWWWWWWWWWKAAK..
..KAAKWWWWWWWWWWWWWWWWWWWWKAAK..
..KKKKWWWWWWWWWWWWWWWWWWWWKKKK..
....KKKKKKKKKKKKKKKKKKKKKKKK....
.....KKKKGKKKKKKKKKKKKGKKKK.....
.....KKKKGKKKKKKKKKKKKGKKKK.....
.....KKGGGGGGGGGGGGGGGGGGKK.....
.....KKKKGKKKKKKKKKKKKGKKKK.....
.....KKKKGKKGGGGGGGGKKGKKKK.....
.....KKKKGKKGKKKKKKGKKGKKKK.....
.....KKKKGKKGKAAAAKGKKGKKKK.....
.....KKKKGKKGKAAAAKGKKGKKKK.....
.....KKKKGKKGKAAAAKGKKGKKKK.....
.....KKKKGKKGKKKKKKGKKGKKKK.....
.....KKKKGKKGGGGGGGGKKGKKKK.....
.....KKKKGKKKKKKKKKKKKGKKKK.....
.....KKGGGGGGGGGGGGGGGGGGKK.....
.....KKKKGKKKKKKKKKKKKGKKKK.....
....KKKKKKKKKKKKKKKKKKKKKKKK....
..KKKKWWWWWWWWWWWWWWWWWWWWKKKK..
..KAAKWWWWWWWWWWWWWWWWWWWWKAAK..
..KAAKWWWWWWWWWWWWWWWWWWWWKAAK..
..KKKKWWWWWWWWWWWWWWWWWWWWKKKK..
....KKKKKKKKKKKKKKKKKKKKKKKK....
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="8" y="6" width="48" height="1" fill="#000000" />
  <rect x="8" y="7" width="48" height="1" fill="#000000" />
  <rect x="4" y="8" width="8" height="1" fill="#000000" />
  <rect x="12" y="8" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="8" width="8" height="1" fill="#000000" />
  <rect x="4" y="9" width="8" height="1" fill="#000000" />
  <rect x="12" y="9" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="9" width="8" height="1" fill="#000000" />
  <rect x="4" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="10" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="10" width="2" height="1" fill="#000000" />
  <rect x="12" y="10" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="10" width="2" height="1" fill="#000000" />
  <rect x="54" y="10" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="10" width="2" height="1" fill="#000000" />
  <rect x="4" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="11" width="2" height="1" fill="#000000" />
  <rect x="12" y="11" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="11" width="2" height="1" fill="#000000" />
  <rect x="54" y="11" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="11" width="2" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="12" width="2" height="1" fill="#000000" />
  <rect x="12" y="12" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="12" width="2" height="1" fill="#000000" />
  <rect x="54" y="12" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="13" width="2" height="1" fill="#000000" />
  <rect x="12" y="13" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="13" width="2" height="1" fill="#000000" />
  <rect x="54" y="13" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="8" height="1" fill="#000000" />
  <rect x="12" y="14" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="14" width="8" height="1" fill="#000000" />
  <rect x="4" y="15" width="8" height="1" fill="#000000" />
  <rect x="12" y="15" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="15" width="8" height="1" fill="#000000" />
  <rect x="8" y="16" width="48" height="1" fill="#000000" />
  <rect x="8" y="17" width="48" height="1" fill="#000000" />
  <rect x="10" y="18" width="8" height="1" fill="#000000" />
  <rect x="18" y="18" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="18" width="24" height="1" fill="#000000" />
  <rect x="44" y="18" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="18" width="8" height="1" fill="#000000" />
  <rect x="10" y="19" width="8" height="1" fill="#000000" />
  <rect x="18" y="19" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="19" width="24" height="1" fill="#000000" />
  <rect x="44" y="19" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="19" width="8" height="1" fill="#000000" />
  <rect x="10" y="20" width="8" height="1" fill="#000000" />
  <rect x="18" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="20" width="24" height="1" fill="#000000" />
  <rect x="44" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="20" width="8" height="1" fill="#000000" />
  <rect x="10" y="21" width="8" height="1" fill="#000000" />
  <rect x="18" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="21" width="24" height="1" fill="#000000" />
  <rect x="44" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="21" width="8" height="1" fill="#000000" />
  <rect x="10" y="22" width="4" height="1" fill="#000000" />
  <rect x="14" y="22" width="36" height="1" fill="#33FF00" />
  <rect x="50" y="22" width="4" height="1" fill="#000000" />
  <rect x="10" y="23" width="4" height="1" fill="#000000" />
  <rect x="14" y="23" width="36" height="1" fill="#33FF00" />
  <rect x="50" y="23" width="4" height="1" fill="#000000" />
  <rect x="10" y="24" width="8" height="1" fill="#000000" />
  <rect x="18" y="24" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="24" width="24" height="1" fill="#000000" />
  <rect x="44" y="24" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="24" width="8" height="1" fill="#000000" />
  <rect x="10" y="25" width="8" height="1" fill="#000000" />
  <rect x="18" y="25" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="25" width="24" height="1" fill="#000000" />
  <rect x="44" y="25" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="25" width="8" height="1" fill="#000000" />
  <rect x="10" y="26" width="8" height="1" fill="#000000" />
  <rect x="18" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="26" width="4" height="1" fill="#000000" />
  <rect x="24" y="26" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="26" width="4" height="1" fill="#000000" />
  <rect x="44" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="26" width="8" height="1" fill="#000000" />
  <rect x="10" y="27" width="8" height="1" fill="#000000" />
  <rect x="18" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="27" width="4" height="1" fill="#000000" />
  <rect x="24" y="27" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="27" width="4" height="1" fill="#000000" />
  <rect x="44" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="27" width="8" height="1" fill="#000000" />
  <rect x="10" y="28" width="8" height="1" fill="#000000" />
  <rect x="18" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="28" width="4" height="1" fill="#000000" />
  <rect x="24" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="28" width="12" height="1" fill="#000000" />
  <rect x="38" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="28" width="4" height="1" fill="#000000" />
  <rect x="44" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="28" width="8" height="1" fill="#000000" />
  <rect x="10" y="29" width="8" height="1" fill="#000000" />
  <rect x="18" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="29" width="4" height="1" fill="#000000" />
  <rect x="24" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="29" width="12" height="1" fill="#000000" />
  <rect x="38" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="29" width="4" height="1" fill="#000000" />
  <rect x="44" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="29" width="8" height="1" fill="#000000" />
  <rect x="10" y="30" width="8" height="1" fill="#000000" />
  <rect x="18" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="30" width="4" height="1" fill="#000000" />
  <rect x="24" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="30" width="2" height="1" fill="#000000" />
  <rect x="28" y="30" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="30" width="2" height="1" fill="#000000" />
  <rect x="38" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="30" width="4" height="1" fill="#000000" />
  <rect x="44" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="30" width="8" height="1" fill="#000000" />
  <rect x="10" y="31" width="8" height="1" fill="#000000" />
  <rect x="18" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="31" width="4" height="1" fill="#000000" />
  <rect x="24" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="31" width="2" height="1" fill="#000000" />
  <rect x="28" y="31" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="31" width="2" height="1" fill="#000000" />
  <rect x="38" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="31" width="4" height="1" fill="#000000" />
  <rect x="44" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="31" width="8" height="1" fill="#000000" />
  <rect x="10" y="32" width="8" height="1" fill="#000000" />
  <rect x="18" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="32" width="4" height="1" fill="#000000" />
  <rect x="24" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="32" width="2" height="1" fill="#000000" />
  <rect x="28" y="32" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="32" width="2" height="1" fill="#000000" />
  <rect x="38" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="32" width="4" height="1" fill="#000000" />
  <rect x="44" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="32" width="8" height="1" fill="#000000" />
  <rect x="10" y="33" width="8" height="1" fill="#000000" />
  <rect x="18" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="33" width="4" height="1" fill="#000000" />
  <rect x="24" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="33" width="2" height="1" fill="#000000" />
  <rect x="28" y="33" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="33" width="2" height="1" fill="#000000" />
  <rect x="38" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="33" width="4" height="1" fill="#000000" />
  <rect x="44" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="33" width="8" height="1" fill="#000000" />
  <rect x="10" y="34" width="8" height="1" fill="#000000" />
  <rect x="18" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="34" width="4" height="1" fill="#000000" />
  <rect x="24" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="34" width="2" height="1" fill="#000000" />
  <rect x="28" y="34" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="34" width="2" height="1" fill="#000000" />
  <rect x="38" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="34" width="4" height="1" fill="#000000" />
  <rect x="44" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="34" width="8" height="1" fill="#000000" />
  <rect x="10" y="35" width="8" height="1" fill="#000000" />
  <rect x="18" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="35" width="4" height="1" fill="#000000" />
  <rect x="24" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="35" width="2" height="1" fill="#000000" />
  <rect x="28" y="35" width="8" height="1" fill="#FFB000" />
  <rect x="36" y="35" width="2" height="1" fill="#000000" />
  <rect x="38" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="35" width="4" height="1" fill="#000000" />
  <rect x="44" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="35" width="8" height="1" fill="#000000" />
  <rect x="10" y="36" width="8" height="1" fill="#000000" />
  <rect x="18" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="36" width="4" height="1" fill="#000000" />
  <rect x="24" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="36" width="12" height="1" fill="#000000" />
  <rect x="38" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="36" width="4" height="1" fill="#000000" />
  <rect x="44" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="36" width="8" height="1" fill="#000000" />
  <rect x="10" y="37" width="8" height="1" fill="#000000" />
  <rect x="18" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="37" width="4" height="1" fill="#000000" />
  <rect x="24" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="37" width="12" height="1" fill="#000000" />
  <rect x="38" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="37" width="4" height="1" fill="#000000" />
  <rect x="44" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="37" width="8" height="1" fill="#000000" />
  <rect x="10" y="38" width="8" height="1" fill="#000000" />
  <rect x="18" y="38" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="38" width="4" height="1" fill="#000000" />
  <rect x="24" y="38" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="38" width="4" height="1" fill="#000000" />
  <rect x="44" y="38" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="38" width="8" height="1" fill="#000000" />
  <rect x="10" y="39" width="8" height="1" fill="#000000" />
  <rect x="18" y="39" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="39" width="4" height="1" fill="#000000" />
  <rect x="24" y="39" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="39" width="4" height="1" fill="#000000" />
  <rect x="44" y="39" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="39" width="8" height="1" fill="#000000" />
  <rect x="10" y="40" width="8" height="1" fill="#000000" />
  <rect x="18" y="40" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="40" width="24" height="1" fill="#000000" />
  <rect x="44" y="40" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="40" width="8" height="1" fill="#000000" />
  <rect x="10" y="41" width="8" height="1" fill="#000000" />
  <rect x="18" y="41" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="41" width="24" height="1" fill="#000000" />
  <rect x="44" y="41" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="41" width="8" height="1" fill="#000000" />
  <rect x="10" y="42" width="4" height="1" fill="#000000" />
  <rect x="14" y="42" width="36" height="1" fill="#33FF00" />
  <rect x="50" y="42" width="4" height="1" fill="#000000" />
  <rect x="10" y="43" width="4" height="1" fill="#000000" />
  <rect x="14" y="43" width="36" height="1" fill="#33FF00" />
  <rect x="50" y="43" width="4" height="1" fill="#000000" />
  <rect x="10" y="44" width="8" height="1" fill="#000000" />
  <rect x="18" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="44" width="24" height="1" fill="#000000" />
  <rect x="44" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="44" width="8" height="1" fill="#000000" />
  <rect x="10" y="45" width="8" height="1" fill="#000000" />
  <rect x="18" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="20" y="45" width="24" height="1" fill="#000000" />
  <rect x="44" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="46" y="45" width="8" height="1" fill="#000000" />
  <rect x="8" y="46" width="48" height="1" fill="#000000" />
  <rect x="8" y="47" width="48" height="1" fill="#000000" />
  <rect x="4" y="48" width="8" height="1" fill="#000000" />
  <rect x="12" y="48" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="48" width="8" height="1" fill="#000000" />
  <rect x="4" y="49" width="8" height="1" fill="#000000" />
  <rect x="12" y="49" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="49" width="8" height="1" fill="#000000" />
  <rect x="4" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="50" width="2" height="1" fill="#000000" />
  <rect x="12" y="50" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="50" width="2" height="1" fill="#000000" />
  <rect x="54" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="51" width="2" height="1" fill="#000000" />
  <rect x="12" y="51" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="51" width="2" height="1" fill="#000000" />
  <rect x="54" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="52" width="2" height="1" fill="#000000" />
  <rect x="12" y="52" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="52" width="2" height="1" fill="#000000" />
  <rect x="54" y="52" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="52" width="2" height="1" fill="#000000" />
  <rect x="4" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="4" height="1" fill="#FFB000" />
  <rect x="10" y="53" width="2" height="1" fill="#000000" />
  <rect x="12" y="53" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="53" width="2" height="1" fill="#000000" />
  <rect x="54" y="53" width="4" height="1" fill="#FFB000" />
  <rect x="58" y="53" width="2" height="1" fill="#000000" />
  <rect x="4" y="54" width="8" height="1" fill="#000000" />
  <rect x="12" y="54" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="54" width="8" height="1" fill="#000000" />
  <rect x="4" y="55" width="8" height="1" fill="#000000" />
  <rect x="12" y="55" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="55" width="8" height="1" fill="#000000" />
  <rect x="8" y="56" width="48" height="1" fill="#000000" />
  <rect x="8" y="57" width="48" height="1" fill="#000000" />
</svg>
```
