# Week 14: Dataclasses and Type Validation — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 14 (`week-14`)
- **Lesson ID**: `week-14-dataclasses-and-validation`
- **Title**: Dataclasses and Type Validation
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-14.mdx`

## 2. Narrative Context (The Hook)
Six scripts pass server records around as raw dicts with inconsistent keys (`"host"` vs `"hostname"`) and unvalidated strings. You declare strict `@dataclass` schemas with type hints and `__post_init__` guards.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Type Hints Document the Contract**: Variable, parameter, and return annotations (`hostname: str`, `used: float`, `-> str`, optional unions `str | None`).
- **Waypoint 2: Dataclasses Write the Boilerplate for You**: `@dataclass` and `@dataclass(frozen=True)` generating `__init__`, `__repr__`, and value-based `__eq__`; using `field(default_factory=list)` for mutable default fields.
- **Waypoint 3: Reject Bad Data at Construction Time**: Using `__post_init__(self)` to normalize strings (`.strip().lower()`) and raise `ValueError` when invariants fail (`limit_gb <= 0`, negative usage, blank hostname).
- **Waypoint 4: Schema Validation and Serialization for Untrusted JSON**: Boundary parsing (`from_raw` / `dataclasses.asdict()` / Pydantic `BaseModel` preview) and quarantining invalid batch records into an error counter without aborting the sweep.

## 4. Key Traps & Edge Cases Covered
- Using a mutable default `hosts: list[str] = []` on a dataclass raises `ValueError`; use `field(default_factory=list)`.
- Placing non-default fields after defaulted fields in a `@dataclass` definition.
- Mutating attributes on a `@dataclass(frozen=True)` instance raises `FrozenInstanceError`.
- Swallowing validation exceptions silently without incrementing a quarantine/error counter.

## 5. Interactive Exercises & Components
- `w14-type-contract` (handling `str | None` in `parse_percent`)
- `w14-default-factory` (`field(default_factory=list)` on `AlertBatch`)
- `w14-post-init-guard` (`__post_init__` normalization and `ValueError` on `limit_gb <= 0`)
- `w14-quarantine-batch` (separating valid `(host, pct)` rows from quarantined `errors` count)
- PredictOutput: `w14-predict-mutable-default`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week14_icon`)

### Strict Visual Rules Applied
- **Subject**: **Dataclasses** — A crystalline ID card passing through a laser scanner gate.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week14_icon.svg`](./week14_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
............KKKKKKKK............
............KAAAAAAK............
............KAAAAAAK............
............KAAAAAAK............
............KAAGGAAK............
............KKKGGKKK............
...KKKKKKKKKKKKGGKKKKKKKKKKKK...
...KWWWWWWWWWWKGGKWWWWWWWWWWK...
...KWWWWWWWWWWKGGKWWWWWWWWWWK...
...KWWKKKKKKKWKGGKWWWWWWWWWWK...
...KWWKAAAAAKWKGGKWKKKKKKKWWK...
...KWWKAAAAAKWKGGKWWWWWWWWWWK...
...KWWKAAAAAKWKGGKWWWWWWWWWWK...
...KWWKAAAAAKWKGGKWKKKKKKKWWK...
...KWWKAAAAAKWKGGKWWWWWWWWWWK...
...KWWKAAAAAKWKGGKWWWWWWWWWWK...
...KWWKAAAAAKWKGGKWKKKKKWWWWK...
...KWWKKKKKKKWKGGKWWWWWWWWWWK...
...KWWWWWWWWWWKGGKWWWWWWWWWWK...
...KWWWWWWWWWWKGGKWWWWWWWWWWK...
...KWWWWWWWWWWKGGKWWWWWWWWWWK...
...KKKKKKKKKKKKGGKKKKKKKKKKKK...
............KKKGGKKK............
............KAAGGAAK............
............KAAAAAAK............
............KAAAAAAK............
............KAAAAAAK............
............KKKKKKKK............
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="24" y="4" width="16" height="1" fill="#000000" />
  <rect x="24" y="5" width="16" height="1" fill="#000000" />
  <rect x="24" y="6" width="2" height="1" fill="#000000" />
  <rect x="26" y="6" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="6" width="2" height="1" fill="#000000" />
  <rect x="24" y="7" width="2" height="1" fill="#000000" />
  <rect x="26" y="7" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="7" width="2" height="1" fill="#000000" />
  <rect x="24" y="8" width="2" height="1" fill="#000000" />
  <rect x="26" y="8" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="8" width="2" height="1" fill="#000000" />
  <rect x="24" y="9" width="2" height="1" fill="#000000" />
  <rect x="26" y="9" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="9" width="2" height="1" fill="#000000" />
  <rect x="24" y="10" width="2" height="1" fill="#000000" />
  <rect x="26" y="10" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="10" width="2" height="1" fill="#000000" />
  <rect x="24" y="11" width="2" height="1" fill="#000000" />
  <rect x="26" y="11" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="11" width="2" height="1" fill="#000000" />
  <rect x="24" y="12" width="2" height="1" fill="#000000" />
  <rect x="26" y="12" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="12" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="12" width="4" height="1" fill="#FFB000" />
  <rect x="38" y="12" width="2" height="1" fill="#000000" />
  <rect x="24" y="13" width="2" height="1" fill="#000000" />
  <rect x="26" y="13" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="13" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="13" width="4" height="1" fill="#FFB000" />
  <rect x="38" y="13" width="2" height="1" fill="#000000" />
  <rect x="24" y="14" width="6" height="1" fill="#000000" />
  <rect x="30" y="14" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="14" width="6" height="1" fill="#000000" />
  <rect x="24" y="15" width="6" height="1" fill="#000000" />
  <rect x="30" y="15" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="15" width="6" height="1" fill="#000000" />
  <rect x="6" y="16" width="24" height="1" fill="#000000" />
  <rect x="30" y="16" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="16" width="24" height="1" fill="#000000" />
  <rect x="6" y="17" width="24" height="1" fill="#000000" />
  <rect x="30" y="17" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="17" width="24" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="18" width="2" height="1" fill="#000000" />
  <rect x="30" y="18" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="18" width="2" height="1" fill="#000000" />
  <rect x="36" y="18" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="19" width="2" height="1" fill="#000000" />
  <rect x="30" y="19" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="19" width="2" height="1" fill="#000000" />
  <rect x="36" y="19" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="20" width="2" height="1" fill="#000000" />
  <rect x="30" y="20" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="20" width="2" height="1" fill="#000000" />
  <rect x="36" y="20" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="21" width="2" height="1" fill="#000000" />
  <rect x="30" y="21" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="21" width="2" height="1" fill="#000000" />
  <rect x="36" y="21" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="22" width="14" height="1" fill="#000000" />
  <rect x="26" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="22" width="2" height="1" fill="#000000" />
  <rect x="30" y="22" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="22" width="2" height="1" fill="#000000" />
  <rect x="36" y="22" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="23" width="14" height="1" fill="#000000" />
  <rect x="26" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="23" width="2" height="1" fill="#000000" />
  <rect x="30" y="23" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="23" width="2" height="1" fill="#000000" />
  <rect x="36" y="23" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="24" width="2" height="1" fill="#000000" />
  <rect x="14" y="24" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="24" width="2" height="1" fill="#000000" />
  <rect x="26" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="24" width="2" height="1" fill="#000000" />
  <rect x="30" y="24" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="24" width="2" height="1" fill="#000000" />
  <rect x="36" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="24" width="14" height="1" fill="#000000" />
  <rect x="52" y="24" width="4" height="1" fill="#F1F1F1" />
  <rect x="56" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="25" width="2" height="1" fill="#000000" />
  <rect x="14" y="25" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="25" width="2" height="1" fill="#000000" />
  <rect x="26" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="25" width="2" height="1" fill="#000000" />
  <rect x="30" y="25" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="25" width="2" height="1" fill="#000000" />
  <rect x="36" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="25" width="14" height="1" fill="#000000" />
  <rect x="52" y="25" width="4" height="1" fill="#F1F1F1" />
  <rect x="56" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="26" width="2" height="1" fill="#000000" />
  <rect x="14" y="26" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="26" width="2" height="1" fill="#000000" />
  <rect x="26" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="26" width="2" height="1" fill="#000000" />
  <rect x="30" y="26" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="26" width="2" height="1" fill="#000000" />
  <rect x="36" y="26" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="27" width="2" height="1" fill="#000000" />
  <rect x="14" y="27" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="27" width="2" height="1" fill="#000000" />
  <rect x="26" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="27" width="2" height="1" fill="#000000" />
  <rect x="30" y="27" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="27" width="2" height="1" fill="#000000" />
  <rect x="36" y="27" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="28" width="2" height="1" fill="#000000" />
  <rect x="14" y="28" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="28" width="2" height="1" fill="#000000" />
  <rect x="26" y="28" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="28" width="2" height="1" fill="#000000" />
  <rect x="30" y="28" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="28" width="2" height="1" fill="#000000" />
  <rect x="36" y="28" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="29" width="2" height="1" fill="#000000" />
  <rect x="14" y="29" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="29" width="2" height="1" fill="#000000" />
  <rect x="26" y="29" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="29" width="2" height="1" fill="#000000" />
  <rect x="30" y="29" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="29" width="2" height="1" fill="#000000" />
  <rect x="36" y="29" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="30" width="2" height="1" fill="#000000" />
  <rect x="14" y="30" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="30" width="2" height="1" fill="#000000" />
  <rect x="26" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="30" width="2" height="1" fill="#000000" />
  <rect x="30" y="30" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="30" width="2" height="1" fill="#000000" />
  <rect x="36" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="30" width="14" height="1" fill="#000000" />
  <rect x="52" y="30" width="4" height="1" fill="#F1F1F1" />
  <rect x="56" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="31" width="2" height="1" fill="#000000" />
  <rect x="14" y="31" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="31" width="2" height="1" fill="#000000" />
  <rect x="26" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="31" width="2" height="1" fill="#000000" />
  <rect x="30" y="31" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="31" width="2" height="1" fill="#000000" />
  <rect x="36" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="31" width="14" height="1" fill="#000000" />
  <rect x="52" y="31" width="4" height="1" fill="#F1F1F1" />
  <rect x="56" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="32" width="2" height="1" fill="#000000" />
  <rect x="14" y="32" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="32" width="2" height="1" fill="#000000" />
  <rect x="26" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="32" width="2" height="1" fill="#000000" />
  <rect x="30" y="32" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="32" width="2" height="1" fill="#000000" />
  <rect x="36" y="32" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="33" width="2" height="1" fill="#000000" />
  <rect x="14" y="33" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="33" width="2" height="1" fill="#000000" />
  <rect x="26" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="33" width="2" height="1" fill="#000000" />
  <rect x="30" y="33" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="33" width="2" height="1" fill="#000000" />
  <rect x="36" y="33" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="34" width="2" height="1" fill="#000000" />
  <rect x="14" y="34" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="34" width="2" height="1" fill="#000000" />
  <rect x="26" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="34" width="2" height="1" fill="#000000" />
  <rect x="30" y="34" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="34" width="2" height="1" fill="#000000" />
  <rect x="36" y="34" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="35" width="2" height="1" fill="#000000" />
  <rect x="14" y="35" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="35" width="2" height="1" fill="#000000" />
  <rect x="26" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="35" width="2" height="1" fill="#000000" />
  <rect x="30" y="35" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="35" width="2" height="1" fill="#000000" />
  <rect x="36" y="35" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="36" width="2" height="1" fill="#000000" />
  <rect x="14" y="36" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="36" width="2" height="1" fill="#000000" />
  <rect x="26" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="36" width="2" height="1" fill="#000000" />
  <rect x="30" y="36" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="36" width="2" height="1" fill="#000000" />
  <rect x="36" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="36" width="10" height="1" fill="#000000" />
  <rect x="48" y="36" width="8" height="1" fill="#F1F1F1" />
  <rect x="56" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="2" height="1" fill="#000000" />
  <rect x="8" y="37" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="37" width="2" height="1" fill="#000000" />
  <rect x="14" y="37" width="10" height="1" fill="#FFB000" />
  <rect x="24" y="37" width="2" height="1" fill="#000000" />
  <rect x="26" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="37" width="2" height="1" fill="#000000" />
  <rect x="30" y="37" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="37" width="2" height="1" fill="#000000" />
  <rect x="36" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="37" width="10" height="1" fill="#000000" />
  <rect x="48" y="37" width="8" height="1" fill="#F1F1F1" />
  <rect x="56" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="38" width="14" height="1" fill="#000000" />
  <rect x="26" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="38" width="2" height="1" fill="#000000" />
  <rect x="30" y="38" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="38" width="2" height="1" fill="#000000" />
  <rect x="36" y="38" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="4" height="1" fill="#F1F1F1" />
  <rect x="12" y="39" width="14" height="1" fill="#000000" />
  <rect x="26" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="28" y="39" width="2" height="1" fill="#000000" />
  <rect x="30" y="39" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="39" width="2" height="1" fill="#000000" />
  <rect x="36" y="39" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="40" width="2" height="1" fill="#000000" />
  <rect x="30" y="40" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="40" width="2" height="1" fill="#000000" />
  <rect x="36" y="40" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="41" width="2" height="1" fill="#000000" />
  <rect x="30" y="41" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="41" width="2" height="1" fill="#000000" />
  <rect x="36" y="41" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="42" width="2" height="1" fill="#000000" />
  <rect x="30" y="42" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="42" width="2" height="1" fill="#000000" />
  <rect x="36" y="42" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="43" width="2" height="1" fill="#000000" />
  <rect x="30" y="43" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="43" width="2" height="1" fill="#000000" />
  <rect x="36" y="43" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="44" width="2" height="1" fill="#000000" />
  <rect x="30" y="44" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="44" width="2" height="1" fill="#000000" />
  <rect x="36" y="44" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="20" height="1" fill="#F1F1F1" />
  <rect x="28" y="45" width="2" height="1" fill="#000000" />
  <rect x="30" y="45" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="45" width="2" height="1" fill="#000000" />
  <rect x="36" y="45" width="20" height="1" fill="#F1F1F1" />
  <rect x="56" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="24" height="1" fill="#000000" />
  <rect x="30" y="46" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="46" width="24" height="1" fill="#000000" />
  <rect x="6" y="47" width="24" height="1" fill="#000000" />
  <rect x="30" y="47" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="47" width="24" height="1" fill="#000000" />
  <rect x="24" y="48" width="6" height="1" fill="#000000" />
  <rect x="30" y="48" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="48" width="6" height="1" fill="#000000" />
  <rect x="24" y="49" width="6" height="1" fill="#000000" />
  <rect x="30" y="49" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="49" width="6" height="1" fill="#000000" />
  <rect x="24" y="50" width="2" height="1" fill="#000000" />
  <rect x="26" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="50" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="38" y="50" width="2" height="1" fill="#000000" />
  <rect x="24" y="51" width="2" height="1" fill="#000000" />
  <rect x="26" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="51" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="38" y="51" width="2" height="1" fill="#000000" />
  <rect x="24" y="52" width="2" height="1" fill="#000000" />
  <rect x="26" y="52" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="52" width="2" height="1" fill="#000000" />
  <rect x="24" y="53" width="2" height="1" fill="#000000" />
  <rect x="26" y="53" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="53" width="2" height="1" fill="#000000" />
  <rect x="24" y="54" width="2" height="1" fill="#000000" />
  <rect x="26" y="54" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="54" width="2" height="1" fill="#000000" />
  <rect x="24" y="55" width="2" height="1" fill="#000000" />
  <rect x="26" y="55" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="55" width="2" height="1" fill="#000000" />
  <rect x="24" y="56" width="2" height="1" fill="#000000" />
  <rect x="26" y="56" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="56" width="2" height="1" fill="#000000" />
  <rect x="24" y="57" width="2" height="1" fill="#000000" />
  <rect x="26" y="57" width="12" height="1" fill="#FFB000" />
  <rect x="38" y="57" width="2" height="1" fill="#000000" />
  <rect x="24" y="58" width="16" height="1" fill="#000000" />
  <rect x="24" y="59" width="16" height="1" fill="#000000" />
</svg>
```
