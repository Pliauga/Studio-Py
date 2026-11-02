# Week 11: The Rerun Mental Model — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 11 (`week-11`)
- **Lesson ID**: `week-11-streamlit-dashboard`
- **Title**: The Rerun Mental Model
- **Estimated Duration**: 18 minutes
- **Source File**: `src/content/lessons/week-11.mdx`

## 2. Narrative Context (The Hook)
One of the on-call rota members refuses to open a terminal at 3 AM. Before touching a UI widget library, you build its core state machine in plain Python: every interaction reruns the script top-to-bottom against a durable `state` dict.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Every interaction reruns the whole file**: Understanding top-to-bottom script reruns; why local variables reset on every click while a passed-in `state` dictionary persists (`if "scans" not in state:`).
- **Waypoint 2: Build the filter out of the data**: Deriving filter dropdown options dynamically from the dataset (`["all"] + sorted(set(regions))`) and slicing visible rows on each rerun.
- **Waypoint 3: A gate is an early return**: Protecting dashboard views with an early-return auth check (`if not state.get("logged_in", False): return ...`) paired with Week 9's `login_user` and forcing a rerun on login.
- **Waypoint 4: What survives a rerun, and what never should**: Caching slow queries in `state["fleet"]` across reruns while reading secrets (`OPS_API_KEY`) fresh from `os.environ` without ever storing secrets in `state`.

## 4. Key Traps & Edge Cases Covered
- Initializing `state["scans"] = 0` unconditionally on every rerun overwrites the counter before incrementing.
- Hardcoding filter dropdown options instead of computing `sorted(set(...))` from live data.
- Rendering protected content before checking the `logged_in` guard, or mutating cached state in place.
- Storing plaintext passwords or API keys inside `state` where session dumps can leak them.

## 5. Interactive Exercises & Components
- `w11-session-state-counter` (`if 'scans' not in state: state['scans'] = 0`)
- `w11-options-from-data` (`['all'] + sorted(set(regions))`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week11_icon`)

### Strict Visual Rules Applied
- **Subject**: **Rerun** — A circular refresh arrow (⟳) wrapping around a mini dashboard window.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week11_icon.svg`](./week11_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
...KKKKKKKKKKKKKKKKKKKKKKKKK....
...KAAAAAAAAAAAAAAAAAAAAAAAK....
...KAAAAAAAAAAAAAAAAAAAAAAAK....
...KAAAAAAAAAAAAAAAAAAAAAAAK....
...KAAAKKKKKKKKKKKKKKKKKAAAK....
...KAAAK...............KAAAK....
...KAAAK.KKKKKKKKKKKKK.KAAAK....
...KAAAK.KGGGGGGGGGGGKKKKKKKKK..
...KAAAK.KGGGGGGGGGGGKAAAAAAAK..
...KAAAK.KGGGGGGGGGGGKKAAAAAK...
...KAAAK.KKKKKKKKKKKKK.KAAAK....
...KAAAK.KWWWWWWWWWWWK.KKAKK....
...KAAAK.KWAAAAWWWWWWK...K......
...KAAAK.KWAAAAWGGGGWK..........
...KAAAK.KWAAAAWGGGGWK..........
...KAAAK.KWAAAAWGGGGWK..........
...KAAAK.KWAAAAWGGGGWK..........
...KAAAK.KWAAAAWGGGGWK..........
...KAAAK.KWWWWWWWWWWWK..........
...KAAAK.KKKKKKKKKKKKK..........
...KAAAK...............KKKKK....
...KAAAKKKKKKKKKKKKKKKKKAAAK....
...KAAAAAAAAAAAAAAAAAAAAAAAK....
...KAAAAAAAAAAAAAAAAAAAAAAAK....
...KAAAAAAAAAAAAAAAAAAAAAAAK....
...KKKKKKKKKKKKKKKKKKKKKKKKK....
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="6" y="6" width="50" height="1" fill="#000000" />
  <rect x="6" y="7" width="50" height="1" fill="#000000" />
  <rect x="6" y="8" width="2" height="1" fill="#000000" />
  <rect x="8" y="8" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="8" width="2" height="1" fill="#000000" />
  <rect x="6" y="9" width="2" height="1" fill="#000000" />
  <rect x="8" y="9" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="9" width="2" height="1" fill="#000000" />
  <rect x="6" y="10" width="2" height="1" fill="#000000" />
  <rect x="8" y="10" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="11" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#000000" />
  <rect x="8" y="14" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="14" width="34" height="1" fill="#000000" />
  <rect x="48" y="14" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#000000" />
  <rect x="8" y="15" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="15" width="34" height="1" fill="#000000" />
  <rect x="48" y="15" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="2" height="1" fill="#000000" />
  <rect x="8" y="16" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="16" width="2" height="1" fill="#000000" />
  <rect x="46" y="16" width="2" height="1" fill="#000000" />
  <rect x="48" y="16" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="2" height="1" fill="#000000" />
  <rect x="8" y="17" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="17" width="2" height="1" fill="#000000" />
  <rect x="46" y="17" width="2" height="1" fill="#000000" />
  <rect x="48" y="17" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="18" width="2" height="1" fill="#000000" />
  <rect x="18" y="18" width="26" height="1" fill="#000000" />
  <rect x="46" y="18" width="2" height="1" fill="#000000" />
  <rect x="48" y="18" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="19" width="2" height="1" fill="#000000" />
  <rect x="18" y="19" width="26" height="1" fill="#000000" />
  <rect x="46" y="19" width="2" height="1" fill="#000000" />
  <rect x="48" y="19" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="20" width="2" height="1" fill="#000000" />
  <rect x="18" y="20" width="2" height="1" fill="#000000" />
  <rect x="20" y="20" width="22" height="1" fill="#33FF00" />
  <rect x="42" y="20" width="18" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="21" width="2" height="1" fill="#000000" />
  <rect x="18" y="21" width="2" height="1" fill="#000000" />
  <rect x="20" y="21" width="22" height="1" fill="#33FF00" />
  <rect x="42" y="21" width="18" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="22" width="2" height="1" fill="#000000" />
  <rect x="18" y="22" width="2" height="1" fill="#000000" />
  <rect x="20" y="22" width="22" height="1" fill="#33FF00" />
  <rect x="42" y="22" width="2" height="1" fill="#000000" />
  <rect x="44" y="22" width="14" height="1" fill="#FFB000" />
  <rect x="58" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="23" width="2" height="1" fill="#000000" />
  <rect x="18" y="23" width="2" height="1" fill="#000000" />
  <rect x="20" y="23" width="22" height="1" fill="#33FF00" />
  <rect x="42" y="23" width="2" height="1" fill="#000000" />
  <rect x="44" y="23" width="14" height="1" fill="#FFB000" />
  <rect x="58" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="24" width="2" height="1" fill="#000000" />
  <rect x="18" y="24" width="2" height="1" fill="#000000" />
  <rect x="20" y="24" width="22" height="1" fill="#33FF00" />
  <rect x="42" y="24" width="4" height="1" fill="#000000" />
  <rect x="46" y="24" width="10" height="1" fill="#FFB000" />
  <rect x="56" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="25" width="2" height="1" fill="#000000" />
  <rect x="18" y="25" width="2" height="1" fill="#000000" />
  <rect x="20" y="25" width="22" height="1" fill="#33FF00" />
  <rect x="42" y="25" width="4" height="1" fill="#000000" />
  <rect x="46" y="25" width="10" height="1" fill="#FFB000" />
  <rect x="56" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="26" width="2" height="1" fill="#000000" />
  <rect x="18" y="26" width="26" height="1" fill="#000000" />
  <rect x="46" y="26" width="2" height="1" fill="#000000" />
  <rect x="48" y="26" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="27" width="2" height="1" fill="#000000" />
  <rect x="18" y="27" width="26" height="1" fill="#000000" />
  <rect x="46" y="27" width="2" height="1" fill="#000000" />
  <rect x="48" y="27" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="28" width="2" height="1" fill="#000000" />
  <rect x="18" y="28" width="2" height="1" fill="#000000" />
  <rect x="20" y="28" width="22" height="1" fill="#F1F1F1" />
  <rect x="42" y="28" width="2" height="1" fill="#000000" />
  <rect x="46" y="28" width="4" height="1" fill="#000000" />
  <rect x="50" y="28" width="2" height="1" fill="#FFB000" />
  <rect x="52" y="28" width="4" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="29" width="2" height="1" fill="#000000" />
  <rect x="18" y="29" width="2" height="1" fill="#000000" />
  <rect x="20" y="29" width="22" height="1" fill="#F1F1F1" />
  <rect x="42" y="29" width="2" height="1" fill="#000000" />
  <rect x="46" y="29" width="4" height="1" fill="#000000" />
  <rect x="50" y="29" width="2" height="1" fill="#FFB000" />
  <rect x="52" y="29" width="4" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="30" width="2" height="1" fill="#000000" />
  <rect x="18" y="30" width="2" height="1" fill="#000000" />
  <rect x="20" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="30" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="30" width="12" height="1" fill="#F1F1F1" />
  <rect x="42" y="30" width="2" height="1" fill="#000000" />
  <rect x="50" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="31" width="2" height="1" fill="#000000" />
  <rect x="18" y="31" width="2" height="1" fill="#000000" />
  <rect x="20" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="31" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="31" width="12" height="1" fill="#F1F1F1" />
  <rect x="42" y="31" width="2" height="1" fill="#000000" />
  <rect x="50" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="32" width="2" height="1" fill="#000000" />
  <rect x="18" y="32" width="2" height="1" fill="#000000" />
  <rect x="20" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="32" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="32" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="33" width="2" height="1" fill="#000000" />
  <rect x="18" y="33" width="2" height="1" fill="#000000" />
  <rect x="20" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="33" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="33" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="34" width="2" height="1" fill="#000000" />
  <rect x="18" y="34" width="2" height="1" fill="#000000" />
  <rect x="20" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="34" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="34" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="35" width="2" height="1" fill="#000000" />
  <rect x="18" y="35" width="2" height="1" fill="#000000" />
  <rect x="20" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="35" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="35" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="36" width="2" height="1" fill="#000000" />
  <rect x="18" y="36" width="2" height="1" fill="#000000" />
  <rect x="20" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="36" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="36" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="2" height="1" fill="#000000" />
  <rect x="8" y="37" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="37" width="2" height="1" fill="#000000" />
  <rect x="18" y="37" width="2" height="1" fill="#000000" />
  <rect x="20" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="37" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="37" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="38" width="2" height="1" fill="#000000" />
  <rect x="18" y="38" width="2" height="1" fill="#000000" />
  <rect x="20" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="38" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="38" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="39" width="2" height="1" fill="#000000" />
  <rect x="18" y="39" width="2" height="1" fill="#000000" />
  <rect x="20" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="39" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="39" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="40" width="2" height="1" fill="#000000" />
  <rect x="18" y="40" width="2" height="1" fill="#000000" />
  <rect x="20" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="40" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="40" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="41" width="2" height="1" fill="#000000" />
  <rect x="18" y="41" width="2" height="1" fill="#000000" />
  <rect x="20" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="22" y="41" width="8" height="1" fill="#FFB000" />
  <rect x="30" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="41" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="42" width="2" height="1" fill="#000000" />
  <rect x="18" y="42" width="2" height="1" fill="#000000" />
  <rect x="20" y="42" width="22" height="1" fill="#F1F1F1" />
  <rect x="42" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="43" width="2" height="1" fill="#000000" />
  <rect x="18" y="43" width="2" height="1" fill="#000000" />
  <rect x="20" y="43" width="22" height="1" fill="#F1F1F1" />
  <rect x="42" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="44" width="2" height="1" fill="#000000" />
  <rect x="18" y="44" width="26" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="45" width="2" height="1" fill="#000000" />
  <rect x="18" y="45" width="26" height="1" fill="#000000" />
  <rect x="6" y="46" width="2" height="1" fill="#000000" />
  <rect x="8" y="46" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="46" width="2" height="1" fill="#000000" />
  <rect x="46" y="46" width="10" height="1" fill="#000000" />
  <rect x="6" y="47" width="2" height="1" fill="#000000" />
  <rect x="8" y="47" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="47" width="2" height="1" fill="#000000" />
  <rect x="46" y="47" width="10" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="48" width="34" height="1" fill="#000000" />
  <rect x="48" y="48" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="49" width="34" height="1" fill="#000000" />
  <rect x="48" y="49" width="6" height="1" fill="#FFB000" />
  <rect x="54" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="2" height="1" fill="#000000" />
  <rect x="8" y="54" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="54" width="2" height="1" fill="#000000" />
  <rect x="6" y="55" width="2" height="1" fill="#000000" />
  <rect x="8" y="55" width="46" height="1" fill="#FFB000" />
  <rect x="54" y="55" width="2" height="1" fill="#000000" />
  <rect x="6" y="56" width="50" height="1" fill="#000000" />
  <rect x="6" y="57" width="50" height="1" fill="#000000" />
</svg>
```
