# Week 16: Async I/O and Concurrency — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 16 (`week-16`)
- **Lesson ID**: `week-16-async-io-and-concurrency`
- **Title**: Async I/O and Concurrency
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-16.mdx`

## 2. Narrative Context (The Hook)
Polling 200 hosts sequentially takes nearly a minute of idle network waiting. You switch to `asyncio` to fan out concurrent probes with `gather`, isolate slow/broken hosts with timeouts, and cap concurrency with `Semaphore`.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Waiting Concurrently vs. Waiting in Line**: Single-threaded event-loop concurrency, `async def` coroutine functions, `await`, `asyncio.sleep()`, and `asyncio.run()`.
- **Waypoint 2: Fan Out with `asyncio.gather`**: Running coroutines concurrently with `await asyncio.gather(*tasks)`, preserving input order, avoiding sequential `for ...: await` loops, and 3D switchyard visualization (`<SandboxEmbed mode="switchyard" />` with `start_switchyard`, `launch_task`, `pause_task`, `finish_task`).
- **Waypoint 3: Timeouts and Surviving Partial Failures**: Enforcing per-task deadlines with `asyncio.wait_for(coro, timeout=...)` and capturing failures without aborting sibling tasks via `asyncio.gather(*jobs, return_exceptions=True)`.
- **Waypoint 4: Rate Limiting with `asyncio.Semaphore`**: Capping simultaneous in-flight network requests with a shared `asyncio.Semaphore(limit)` and `async with sem:`.

## 4. Key Traps & Edge Cases Covered
- Awaiting inside a `for` loop (`for h in hosts: await check(h)`) executes sequentially instead of concurrently.
- Calling blocking `time.sleep()` or `requests.get()` inside `async def` freezes the entire event loop.
- Forgetting `await` produces a coroutine object that never executes (`RuntimeWarning: coroutine was never awaited`).
- Instantiating `asyncio.Semaphore` inside each worker instead of sharing one instance across all workers.

## 5. Interactive Exercises & Components
- `w16-await-coroutine` (`await fetch_status('srv-01')`)
- `w16-gather-order` (`await asyncio.gather(*(fetch_pct(h, p) for h, p in inputs))`)
- `w16-gather-wallclock` (proving concurrent `gather` beats sequential loop wallclock)
- `w16-scene-gather` (driving 3D switchyard lanes concurrently via `asyncio.gather`)
- `w16-return-exceptions` (`asyncio.gather(..., return_exceptions=True)` and filtering `not isinstance(r, Exception)`)
- `w16-semaphore-peak` (bounding peak concurrency to 2 with `async with sem:`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week16_icon`)

### Strict Visual Rules Applied
- **Subject**: **Async** — Three parallel glowing railway tracks merging into one.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week16_icon.svg`](./week16_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
..............KKKK..............
............KKGGGGKK............
...........KGGGGGGGGK...........
..........KGGGGGGGGGGK..........
..........KKKKKKKKKKKK..........
.............KGGGGK.............
.............KGGGGK.............
...........KKKGGGGKKK...........
..........KKGGGGGGWWKK..........
.........KKGGGGGGGWWWKK.........
........KKGGGGGGGGWWWWKK........
.......KKGGGGKKAAKKWWWWKK.......
......KKGGGGKKKAAKKKWWWWKK......
.....KKGGGGKKKKAAKKKKWWWWKK.....
...KKKGGGGKKKKKAAKKKKKWWWWKKK...
...KKGGGGKKK.KKAAKK.KKKWWWWKK...
...KKGGGKKK..KKAAKK..KKKWWWKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKKKKKK...KKKKKK...KKKKKKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKKKKKK...KKKKKK...KKKKKKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKKKKKK...KKKKKK...KKKKKKK...
...KKGGGKK...KKAAKK...KKWWWKK...
...KKKKKKK...KKKKKK...KKKKKKK...
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="28" y="4" width="8" height="1" fill="#000000" />
  <rect x="28" y="5" width="8" height="1" fill="#000000" />
  <rect x="24" y="6" width="4" height="1" fill="#000000" />
  <rect x="28" y="6" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="6" width="4" height="1" fill="#000000" />
  <rect x="24" y="7" width="4" height="1" fill="#000000" />
  <rect x="28" y="7" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="7" width="4" height="1" fill="#000000" />
  <rect x="22" y="8" width="2" height="1" fill="#000000" />
  <rect x="24" y="8" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="8" width="2" height="1" fill="#000000" />
  <rect x="22" y="9" width="2" height="1" fill="#000000" />
  <rect x="24" y="9" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="9" width="2" height="1" fill="#000000" />
  <rect x="20" y="10" width="2" height="1" fill="#000000" />
  <rect x="22" y="10" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="10" width="2" height="1" fill="#000000" />
  <rect x="20" y="11" width="2" height="1" fill="#000000" />
  <rect x="22" y="11" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="11" width="2" height="1" fill="#000000" />
  <rect x="20" y="12" width="24" height="1" fill="#000000" />
  <rect x="20" y="13" width="24" height="1" fill="#000000" />
  <rect x="26" y="14" width="2" height="1" fill="#000000" />
  <rect x="28" y="14" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="14" width="2" height="1" fill="#000000" />
  <rect x="26" y="15" width="2" height="1" fill="#000000" />
  <rect x="28" y="15" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="15" width="2" height="1" fill="#000000" />
  <rect x="26" y="16" width="2" height="1" fill="#000000" />
  <rect x="28" y="16" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="16" width="2" height="1" fill="#000000" />
  <rect x="26" y="17" width="2" height="1" fill="#000000" />
  <rect x="28" y="17" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="17" width="2" height="1" fill="#000000" />
  <rect x="22" y="18" width="6" height="1" fill="#000000" />
  <rect x="28" y="18" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="18" width="6" height="1" fill="#000000" />
  <rect x="22" y="19" width="6" height="1" fill="#000000" />
  <rect x="28" y="19" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="19" width="6" height="1" fill="#000000" />
  <rect x="20" y="20" width="4" height="1" fill="#000000" />
  <rect x="24" y="20" width="12" height="1" fill="#33FF00" />
  <rect x="36" y="20" width="4" height="1" fill="#F1F1F1" />
  <rect x="40" y="20" width="4" height="1" fill="#000000" />
  <rect x="20" y="21" width="4" height="1" fill="#000000" />
  <rect x="24" y="21" width="12" height="1" fill="#33FF00" />
  <rect x="36" y="21" width="4" height="1" fill="#F1F1F1" />
  <rect x="40" y="21" width="4" height="1" fill="#000000" />
  <rect x="18" y="22" width="4" height="1" fill="#000000" />
  <rect x="22" y="22" width="14" height="1" fill="#33FF00" />
  <rect x="36" y="22" width="6" height="1" fill="#F1F1F1" />
  <rect x="42" y="22" width="4" height="1" fill="#000000" />
  <rect x="18" y="23" width="4" height="1" fill="#000000" />
  <rect x="22" y="23" width="14" height="1" fill="#33FF00" />
  <rect x="36" y="23" width="6" height="1" fill="#F1F1F1" />
  <rect x="42" y="23" width="4" height="1" fill="#000000" />
  <rect x="16" y="24" width="4" height="1" fill="#000000" />
  <rect x="20" y="24" width="16" height="1" fill="#33FF00" />
  <rect x="36" y="24" width="8" height="1" fill="#F1F1F1" />
  <rect x="44" y="24" width="4" height="1" fill="#000000" />
  <rect x="16" y="25" width="4" height="1" fill="#000000" />
  <rect x="20" y="25" width="16" height="1" fill="#33FF00" />
  <rect x="36" y="25" width="8" height="1" fill="#F1F1F1" />
  <rect x="44" y="25" width="4" height="1" fill="#000000" />
  <rect x="14" y="26" width="4" height="1" fill="#000000" />
  <rect x="18" y="26" width="8" height="1" fill="#33FF00" />
  <rect x="26" y="26" width="4" height="1" fill="#000000" />
  <rect x="30" y="26" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="26" width="4" height="1" fill="#000000" />
  <rect x="38" y="26" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="26" width="4" height="1" fill="#000000" />
  <rect x="14" y="27" width="4" height="1" fill="#000000" />
  <rect x="18" y="27" width="8" height="1" fill="#33FF00" />
  <rect x="26" y="27" width="4" height="1" fill="#000000" />
  <rect x="30" y="27" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="27" width="4" height="1" fill="#000000" />
  <rect x="38" y="27" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="27" width="4" height="1" fill="#000000" />
  <rect x="12" y="28" width="4" height="1" fill="#000000" />
  <rect x="16" y="28" width="8" height="1" fill="#33FF00" />
  <rect x="24" y="28" width="6" height="1" fill="#000000" />
  <rect x="30" y="28" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="28" width="6" height="1" fill="#000000" />
  <rect x="40" y="28" width="8" height="1" fill="#F1F1F1" />
  <rect x="48" y="28" width="4" height="1" fill="#000000" />
  <rect x="12" y="29" width="4" height="1" fill="#000000" />
  <rect x="16" y="29" width="8" height="1" fill="#33FF00" />
  <rect x="24" y="29" width="6" height="1" fill="#000000" />
  <rect x="30" y="29" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="29" width="6" height="1" fill="#000000" />
  <rect x="40" y="29" width="8" height="1" fill="#F1F1F1" />
  <rect x="48" y="29" width="4" height="1" fill="#000000" />
  <rect x="10" y="30" width="4" height="1" fill="#000000" />
  <rect x="14" y="30" width="8" height="1" fill="#33FF00" />
  <rect x="22" y="30" width="8" height="1" fill="#000000" />
  <rect x="30" y="30" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="30" width="8" height="1" fill="#000000" />
  <rect x="42" y="30" width="8" height="1" fill="#F1F1F1" />
  <rect x="50" y="30" width="4" height="1" fill="#000000" />
  <rect x="10" y="31" width="4" height="1" fill="#000000" />
  <rect x="14" y="31" width="8" height="1" fill="#33FF00" />
  <rect x="22" y="31" width="8" height="1" fill="#000000" />
  <rect x="30" y="31" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="31" width="8" height="1" fill="#000000" />
  <rect x="42" y="31" width="8" height="1" fill="#F1F1F1" />
  <rect x="50" y="31" width="4" height="1" fill="#000000" />
  <rect x="6" y="32" width="6" height="1" fill="#000000" />
  <rect x="12" y="32" width="8" height="1" fill="#33FF00" />
  <rect x="20" y="32" width="10" height="1" fill="#000000" />
  <rect x="30" y="32" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="32" width="10" height="1" fill="#000000" />
  <rect x="44" y="32" width="8" height="1" fill="#F1F1F1" />
  <rect x="52" y="32" width="6" height="1" fill="#000000" />
  <rect x="6" y="33" width="6" height="1" fill="#000000" />
  <rect x="12" y="33" width="8" height="1" fill="#33FF00" />
  <rect x="20" y="33" width="10" height="1" fill="#000000" />
  <rect x="30" y="33" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="33" width="10" height="1" fill="#000000" />
  <rect x="44" y="33" width="8" height="1" fill="#F1F1F1" />
  <rect x="52" y="33" width="6" height="1" fill="#000000" />
  <rect x="6" y="34" width="4" height="1" fill="#000000" />
  <rect x="10" y="34" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="34" width="6" height="1" fill="#000000" />
  <rect x="26" y="34" width="4" height="1" fill="#000000" />
  <rect x="30" y="34" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="34" width="4" height="1" fill="#000000" />
  <rect x="40" y="34" width="6" height="1" fill="#000000" />
  <rect x="46" y="34" width="8" height="1" fill="#F1F1F1" />
  <rect x="54" y="34" width="4" height="1" fill="#000000" />
  <rect x="6" y="35" width="4" height="1" fill="#000000" />
  <rect x="10" y="35" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="35" width="6" height="1" fill="#000000" />
  <rect x="26" y="35" width="4" height="1" fill="#000000" />
  <rect x="30" y="35" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="35" width="4" height="1" fill="#000000" />
  <rect x="40" y="35" width="6" height="1" fill="#000000" />
  <rect x="46" y="35" width="8" height="1" fill="#F1F1F1" />
  <rect x="54" y="35" width="4" height="1" fill="#000000" />
  <rect x="6" y="36" width="4" height="1" fill="#000000" />
  <rect x="10" y="36" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="36" width="6" height="1" fill="#000000" />
  <rect x="26" y="36" width="4" height="1" fill="#000000" />
  <rect x="30" y="36" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="36" width="4" height="1" fill="#000000" />
  <rect x="42" y="36" width="6" height="1" fill="#000000" />
  <rect x="48" y="36" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="36" width="4" height="1" fill="#000000" />
  <rect x="6" y="37" width="4" height="1" fill="#000000" />
  <rect x="10" y="37" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="37" width="6" height="1" fill="#000000" />
  <rect x="26" y="37" width="4" height="1" fill="#000000" />
  <rect x="30" y="37" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="37" width="4" height="1" fill="#000000" />
  <rect x="42" y="37" width="6" height="1" fill="#000000" />
  <rect x="48" y="37" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="37" width="4" height="1" fill="#000000" />
  <rect x="6" y="38" width="4" height="1" fill="#000000" />
  <rect x="10" y="38" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="38" width="4" height="1" fill="#000000" />
  <rect x="26" y="38" width="4" height="1" fill="#000000" />
  <rect x="30" y="38" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="38" width="4" height="1" fill="#000000" />
  <rect x="44" y="38" width="4" height="1" fill="#000000" />
  <rect x="48" y="38" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="38" width="4" height="1" fill="#000000" />
  <rect x="6" y="39" width="4" height="1" fill="#000000" />
  <rect x="10" y="39" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="39" width="4" height="1" fill="#000000" />
  <rect x="26" y="39" width="4" height="1" fill="#000000" />
  <rect x="30" y="39" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="39" width="4" height="1" fill="#000000" />
  <rect x="44" y="39" width="4" height="1" fill="#000000" />
  <rect x="48" y="39" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="39" width="4" height="1" fill="#000000" />
  <rect x="6" y="40" width="14" height="1" fill="#000000" />
  <rect x="26" y="40" width="12" height="1" fill="#000000" />
  <rect x="44" y="40" width="14" height="1" fill="#000000" />
  <rect x="6" y="41" width="14" height="1" fill="#000000" />
  <rect x="26" y="41" width="12" height="1" fill="#000000" />
  <rect x="44" y="41" width="14" height="1" fill="#000000" />
  <rect x="6" y="42" width="4" height="1" fill="#000000" />
  <rect x="10" y="42" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="42" width="4" height="1" fill="#000000" />
  <rect x="26" y="42" width="4" height="1" fill="#000000" />
  <rect x="30" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="42" width="4" height="1" fill="#000000" />
  <rect x="44" y="42" width="4" height="1" fill="#000000" />
  <rect x="48" y="42" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="42" width="4" height="1" fill="#000000" />
  <rect x="6" y="43" width="4" height="1" fill="#000000" />
  <rect x="10" y="43" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="43" width="4" height="1" fill="#000000" />
  <rect x="26" y="43" width="4" height="1" fill="#000000" />
  <rect x="30" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="43" width="4" height="1" fill="#000000" />
  <rect x="44" y="43" width="4" height="1" fill="#000000" />
  <rect x="48" y="43" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="43" width="4" height="1" fill="#000000" />
  <rect x="6" y="44" width="4" height="1" fill="#000000" />
  <rect x="10" y="44" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="44" width="4" height="1" fill="#000000" />
  <rect x="26" y="44" width="4" height="1" fill="#000000" />
  <rect x="30" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="44" width="4" height="1" fill="#000000" />
  <rect x="44" y="44" width="4" height="1" fill="#000000" />
  <rect x="48" y="44" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="44" width="4" height="1" fill="#000000" />
  <rect x="6" y="45" width="4" height="1" fill="#000000" />
  <rect x="10" y="45" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="45" width="4" height="1" fill="#000000" />
  <rect x="26" y="45" width="4" height="1" fill="#000000" />
  <rect x="30" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="45" width="4" height="1" fill="#000000" />
  <rect x="44" y="45" width="4" height="1" fill="#000000" />
  <rect x="48" y="45" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="45" width="4" height="1" fill="#000000" />
  <rect x="6" y="46" width="4" height="1" fill="#000000" />
  <rect x="10" y="46" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="46" width="4" height="1" fill="#000000" />
  <rect x="26" y="46" width="4" height="1" fill="#000000" />
  <rect x="30" y="46" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="46" width="4" height="1" fill="#000000" />
  <rect x="44" y="46" width="4" height="1" fill="#000000" />
  <rect x="48" y="46" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="46" width="4" height="1" fill="#000000" />
  <rect x="6" y="47" width="4" height="1" fill="#000000" />
  <rect x="10" y="47" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="47" width="4" height="1" fill="#000000" />
  <rect x="26" y="47" width="4" height="1" fill="#000000" />
  <rect x="30" y="47" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="47" width="4" height="1" fill="#000000" />
  <rect x="44" y="47" width="4" height="1" fill="#000000" />
  <rect x="48" y="47" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="47" width="4" height="1" fill="#000000" />
  <rect x="6" y="48" width="14" height="1" fill="#000000" />
  <rect x="26" y="48" width="12" height="1" fill="#000000" />
  <rect x="44" y="48" width="14" height="1" fill="#000000" />
  <rect x="6" y="49" width="14" height="1" fill="#000000" />
  <rect x="26" y="49" width="12" height="1" fill="#000000" />
  <rect x="44" y="49" width="14" height="1" fill="#000000" />
  <rect x="6" y="50" width="4" height="1" fill="#000000" />
  <rect x="10" y="50" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="50" width="4" height="1" fill="#000000" />
  <rect x="26" y="50" width="4" height="1" fill="#000000" />
  <rect x="30" y="50" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="50" width="4" height="1" fill="#000000" />
  <rect x="44" y="50" width="4" height="1" fill="#000000" />
  <rect x="48" y="50" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="50" width="4" height="1" fill="#000000" />
  <rect x="6" y="51" width="4" height="1" fill="#000000" />
  <rect x="10" y="51" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="51" width="4" height="1" fill="#000000" />
  <rect x="26" y="51" width="4" height="1" fill="#000000" />
  <rect x="30" y="51" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="51" width="4" height="1" fill="#000000" />
  <rect x="44" y="51" width="4" height="1" fill="#000000" />
  <rect x="48" y="51" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="51" width="4" height="1" fill="#000000" />
  <rect x="6" y="52" width="4" height="1" fill="#000000" />
  <rect x="10" y="52" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="52" width="4" height="1" fill="#000000" />
  <rect x="26" y="52" width="4" height="1" fill="#000000" />
  <rect x="30" y="52" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="52" width="4" height="1" fill="#000000" />
  <rect x="44" y="52" width="4" height="1" fill="#000000" />
  <rect x="48" y="52" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="52" width="4" height="1" fill="#000000" />
  <rect x="6" y="53" width="4" height="1" fill="#000000" />
  <rect x="10" y="53" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="53" width="4" height="1" fill="#000000" />
  <rect x="26" y="53" width="4" height="1" fill="#000000" />
  <rect x="30" y="53" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="53" width="4" height="1" fill="#000000" />
  <rect x="44" y="53" width="4" height="1" fill="#000000" />
  <rect x="48" y="53" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="53" width="4" height="1" fill="#000000" />
  <rect x="6" y="54" width="14" height="1" fill="#000000" />
  <rect x="26" y="54" width="12" height="1" fill="#000000" />
  <rect x="44" y="54" width="14" height="1" fill="#000000" />
  <rect x="6" y="55" width="14" height="1" fill="#000000" />
  <rect x="26" y="55" width="12" height="1" fill="#000000" />
  <rect x="44" y="55" width="14" height="1" fill="#000000" />
  <rect x="6" y="56" width="4" height="1" fill="#000000" />
  <rect x="10" y="56" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="56" width="4" height="1" fill="#000000" />
  <rect x="26" y="56" width="4" height="1" fill="#000000" />
  <rect x="30" y="56" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="56" width="4" height="1" fill="#000000" />
  <rect x="44" y="56" width="4" height="1" fill="#000000" />
  <rect x="48" y="56" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="56" width="4" height="1" fill="#000000" />
  <rect x="6" y="57" width="4" height="1" fill="#000000" />
  <rect x="10" y="57" width="6" height="1" fill="#33FF00" />
  <rect x="16" y="57" width="4" height="1" fill="#000000" />
  <rect x="26" y="57" width="4" height="1" fill="#000000" />
  <rect x="30" y="57" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="57" width="4" height="1" fill="#000000" />
  <rect x="44" y="57" width="4" height="1" fill="#000000" />
  <rect x="48" y="57" width="6" height="1" fill="#F1F1F1" />
  <rect x="54" y="57" width="4" height="1" fill="#000000" />
  <rect x="6" y="58" width="14" height="1" fill="#000000" />
  <rect x="26" y="58" width="12" height="1" fill="#000000" />
  <rect x="44" y="58" width="14" height="1" fill="#000000" />
  <rect x="6" y="59" width="14" height="1" fill="#000000" />
  <rect x="26" y="59" width="12" height="1" fill="#000000" />
  <rect x="44" y="59" width="14" height="1" fill="#000000" />
</svg>
```
