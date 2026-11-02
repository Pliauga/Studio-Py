# Week 24: Architecture and Deployment — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 24 (`week-24`)
- **Lesson ID**: `week-24-packaging-and-architecture`
- **Title**: Architecture and Deployment
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-24.mdx`

## 2. Narrative Context (The Hook)
After 24 weeks of building scanners, APIs, queues, and security guards, your scripts only run if the terminal is in the right directory. You structure a layered Python package (`domain.py`, `storage.py`, `cli.py`), declare `pyproject.toml` entrypoints, load 12-factor env config, and wire the CI release gate.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Separate Domain Logic from Infrastructure**: Three-layer architecture with inward-pointing dependencies: pure `domain.py` dataclasses/rules (`HostReading`, `Reading`), `storage.py` / `adapters.py` I/O, and thin `cli.py` / `api.py` entrypoints.
- **Waypoint 2: `pyproject.toml` and Installable Entrypoints**: Declaring `[build-system]`, `[project]` metadata and bounded dependencies, and `[project.scripts]` CLI commands (`ops-scan = "ops_console.cli:main"`), parsed with standard-library `tomllib.loads()`.
- **Waypoint 3: Twelve-Factor Configuration and Graceful Shutdown**: Loading validated startup `Settings` from environment variables (`load_port` enforcing `1 <= port <= 65535`, required secrets) and handling `SIGTERM`/`SIGINT` cleanly.
- **Waypoint 4: The End-to-End Release Gate**: Running `ruff check .`, `mypy`/`pyright`, and `pytest` in CI, culminating in a full capstone `ingest_batch` pipeline.

## 4. Key Traps & Edge Cases Covered
- Circular imports between `api.py` and `storage.py` (prevented by keeping shared dataclasses in `domain.py`).
- Naming a local file `logging.py`, `json.py`, `random.py`, or `sqlite3.py`, which shadows the Python standard library.
- Leaving dependencies unpinned in `pyproject.toml` or accepting out-of-range ports (`<= 0` or `> 65535`).

## 5. Interactive Exercises & Components
- `w24-domain-separation` (`over_limit_hosts` over `@dataclass(frozen=True) class Reading`)
- `w24-entrypoint-parse` (`tomllib.loads` extracting `(package_name, script_target)` from `[project.scripts]`)
- `w24-settings-loader` (`load_port` validating `1 <= port <= 65535` from `env` dict)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week24_icon`)

### Strict Visual Rules Applied
- **Subject**: **Architecture** — An isometric shipping crate cut open to reveal three stacked internal layers.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week24_icon.svg`](./week24_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
.......KKKKKKKKKKKKKKKKKK.......
......KAAAAAAAAAAAAAAAAAAK......
.....KWWWWWWWWWWWWWWWWWWWWK.....
....KAAAAAAAAAAAAAAAAAAAAAAK....
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKWWWWWWWWWWWWWWWWKKAAK...
...KAAKKWWWWWWWWWWWWWWWWKKAAK...
...KAAKKWWWWWWWWWWWWWWWWKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKGGGGGGGGGGGGGGGGKKAAK...
...KAAKKGGGGGGGGGGGGGGGGKKAAK...
...KAAKKGGGGGGGGGGGGGGGGKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKAAAAAAAAAAAAAAAAKKAAK...
...KAAKKAAAAAAAAAAAAAAAAKKAAK...
...KAAKKAAAAAAAAAAAAAAAAKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAKKKKKKKKKKKKKKKKKKKKAAK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KKKKKKKKKKKKKKKKKKKKKKKKKK...
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="14" y="6" width="36" height="1" fill="#000000" />
  <rect x="14" y="7" width="36" height="1" fill="#000000" />
  <rect x="12" y="8" width="2" height="1" fill="#000000" />
  <rect x="14" y="8" width="36" height="1" fill="#FFB000" />
  <rect x="50" y="8" width="2" height="1" fill="#000000" />
  <rect x="12" y="9" width="2" height="1" fill="#000000" />
  <rect x="14" y="9" width="36" height="1" fill="#FFB000" />
  <rect x="50" y="9" width="2" height="1" fill="#000000" />
  <rect x="10" y="10" width="2" height="1" fill="#000000" />
  <rect x="12" y="10" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="10" width="2" height="1" fill="#000000" />
  <rect x="10" y="11" width="2" height="1" fill="#000000" />
  <rect x="12" y="11" width="40" height="1" fill="#F1F1F1" />
  <rect x="52" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="2" height="1" fill="#000000" />
  <rect x="10" y="12" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="2" height="1" fill="#000000" />
  <rect x="10" y="13" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="52" height="1" fill="#000000" />
  <rect x="6" y="15" width="52" height="1" fill="#000000" />
  <rect x="6" y="16" width="2" height="1" fill="#000000" />
  <rect x="8" y="16" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="2" height="1" fill="#000000" />
  <rect x="8" y="17" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="20" width="40" height="1" fill="#000000" />
  <rect x="52" y="20" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="21" width="40" height="1" fill="#000000" />
  <rect x="52" y="21" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="22" width="40" height="1" fill="#000000" />
  <rect x="52" y="22" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="23" width="40" height="1" fill="#000000" />
  <rect x="52" y="23" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="24" width="4" height="1" fill="#000000" />
  <rect x="16" y="24" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="24" width="4" height="1" fill="#000000" />
  <rect x="52" y="24" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="25" width="4" height="1" fill="#000000" />
  <rect x="16" y="25" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="25" width="4" height="1" fill="#000000" />
  <rect x="52" y="25" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="26" width="4" height="1" fill="#000000" />
  <rect x="16" y="26" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="26" width="4" height="1" fill="#000000" />
  <rect x="52" y="26" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="27" width="4" height="1" fill="#000000" />
  <rect x="16" y="27" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="27" width="4" height="1" fill="#000000" />
  <rect x="52" y="27" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="28" width="4" height="1" fill="#000000" />
  <rect x="16" y="28" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="28" width="4" height="1" fill="#000000" />
  <rect x="52" y="28" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="29" width="4" height="1" fill="#000000" />
  <rect x="16" y="29" width="32" height="1" fill="#F1F1F1" />
  <rect x="48" y="29" width="4" height="1" fill="#000000" />
  <rect x="52" y="29" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="30" width="40" height="1" fill="#000000" />
  <rect x="52" y="30" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="31" width="40" height="1" fill="#000000" />
  <rect x="52" y="31" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="32" width="40" height="1" fill="#000000" />
  <rect x="52" y="32" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="33" width="40" height="1" fill="#000000" />
  <rect x="52" y="33" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="34" width="4" height="1" fill="#000000" />
  <rect x="16" y="34" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="34" width="4" height="1" fill="#000000" />
  <rect x="52" y="34" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="35" width="4" height="1" fill="#000000" />
  <rect x="16" y="35" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="35" width="4" height="1" fill="#000000" />
  <rect x="52" y="35" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="36" width="4" height="1" fill="#000000" />
  <rect x="16" y="36" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="36" width="4" height="1" fill="#000000" />
  <rect x="52" y="36" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="2" height="1" fill="#000000" />
  <rect x="8" y="37" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="37" width="4" height="1" fill="#000000" />
  <rect x="16" y="37" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="37" width="4" height="1" fill="#000000" />
  <rect x="52" y="37" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="38" width="4" height="1" fill="#000000" />
  <rect x="16" y="38" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="38" width="4" height="1" fill="#000000" />
  <rect x="52" y="38" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="39" width="4" height="1" fill="#000000" />
  <rect x="16" y="39" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="39" width="4" height="1" fill="#000000" />
  <rect x="52" y="39" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="40" width="40" height="1" fill="#000000" />
  <rect x="52" y="40" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="41" width="40" height="1" fill="#000000" />
  <rect x="52" y="41" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="42" width="40" height="1" fill="#000000" />
  <rect x="52" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="43" width="40" height="1" fill="#000000" />
  <rect x="52" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="44" width="4" height="1" fill="#000000" />
  <rect x="16" y="44" width="32" height="1" fill="#FFB000" />
  <rect x="48" y="44" width="4" height="1" fill="#000000" />
  <rect x="52" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="45" width="4" height="1" fill="#000000" />
  <rect x="16" y="45" width="32" height="1" fill="#FFB000" />
  <rect x="48" y="45" width="4" height="1" fill="#000000" />
  <rect x="52" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="2" height="1" fill="#000000" />
  <rect x="8" y="46" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="46" width="4" height="1" fill="#000000" />
  <rect x="16" y="46" width="32" height="1" fill="#FFB000" />
  <rect x="48" y="46" width="4" height="1" fill="#000000" />
  <rect x="52" y="46" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="2" height="1" fill="#000000" />
  <rect x="8" y="47" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="47" width="4" height="1" fill="#000000" />
  <rect x="16" y="47" width="32" height="1" fill="#FFB000" />
  <rect x="48" y="47" width="4" height="1" fill="#000000" />
  <rect x="52" y="47" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="48" width="4" height="1" fill="#000000" />
  <rect x="16" y="48" width="32" height="1" fill="#FFB000" />
  <rect x="48" y="48" width="4" height="1" fill="#000000" />
  <rect x="52" y="48" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="49" width="4" height="1" fill="#000000" />
  <rect x="16" y="49" width="32" height="1" fill="#FFB000" />
  <rect x="48" y="49" width="4" height="1" fill="#000000" />
  <rect x="52" y="49" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="50" width="40" height="1" fill="#000000" />
  <rect x="52" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="51" width="40" height="1" fill="#000000" />
  <rect x="52" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="52" width="40" height="1" fill="#000000" />
  <rect x="52" y="52" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="4" height="1" fill="#FFB000" />
  <rect x="12" y="53" width="40" height="1" fill="#000000" />
  <rect x="52" y="53" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="2" height="1" fill="#000000" />
  <rect x="8" y="54" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="54" width="2" height="1" fill="#000000" />
  <rect x="6" y="55" width="2" height="1" fill="#000000" />
  <rect x="8" y="55" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="55" width="2" height="1" fill="#000000" />
  <rect x="6" y="56" width="2" height="1" fill="#000000" />
  <rect x="8" y="56" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="56" width="2" height="1" fill="#000000" />
  <rect x="6" y="57" width="2" height="1" fill="#000000" />
  <rect x="8" y="57" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="57" width="2" height="1" fill="#000000" />
  <rect x="6" y="58" width="52" height="1" fill="#000000" />
  <rect x="6" y="59" width="52" height="1" fill="#000000" />
</svg>
```
