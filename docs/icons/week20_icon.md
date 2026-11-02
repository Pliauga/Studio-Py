# Week 20: Task Queues and Workers — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 20 (`week-20`)
- **Lesson ID**: `week-20-background-queues-and-workers`
- **Title**: Task Queues and Workers
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-20.mdx`

## 2. Narrative Context (The Hook)
Calling a slow 4-second webhook inline inside `POST /readings` blocks every monitoring agent. You decouple producers from consumers with a FIFO `queue.Queue`, enforce SQLite idempotency, route poison pills to a DLQ, and apply capped exponential backoff.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Decouple Producers from Consumers**: `queue.Queue(maxsize=...)`, `.put()`, `.get()`, `.task_done()`, FIFO ordering, and backpressure (`queue.Full`).
- **Waypoint 2: At-Least-Once Delivery Requires Idempotency**: Deduplicating repeated job deliveries using a shared SQLite `processed_jobs` table (`INSERT OR IGNORE INTO processed_jobs VALUES (?, ?)` and checking `cur.rowcount == 1`).
- **Waypoint 3: Poison Pills and the Dead-Letter Queue (DLQ)**: Tracking `attempts` per message and routing jobs with `attempts >= max_attempts` to a `dlq` while incrementing and re-queueing transient failures in `retry_q`.
- **Waypoint 4: Exponential Backoff with Jitter**: Preventing thundering-herd retry storms via capped exponential backoff (`min(cap, base * (2 ** (attempt - 1)))`) plus random jitter.

## 4. Key Traps & Edge Cases Covered
- Tracking completed job IDs in a per-process Python `set()` fails when multiple worker processes run concurrently; use a shared database `PRIMARY KEY` / `UNIQUE` constraint.
- Re-queueing a malformed poison job forever without a `max_attempts` cap blocks the entire queue.
- Computing `base * (2 ** (attempt - 1))` without `min(cap, ...)` leads to multi-day sleep delays.

## 5. Interactive Exercises & Components
- `w20-fifo-queue` (`q.get()` and `q.task_done()` draining in FIFO order)
- `w20-idempotent-sql` (`INSERT OR IGNORE` returning `cur.rowcount == 1`)
- `w20-dlq-routing` (routing invalid items between `retry_q` and `dlq` based on `max_attempts`)
- `w20-capped-backoff` (`min(cap, base * (2 ** (attempt - 1)))`)
- PredictOutput: `w20-predict-inmemory-idempotency`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week20_icon`)

### Strict Visual Rules Applied
- **Subject**: **Queues** — A horizontal pipe with a skull-stamped box falling into a trapdoor.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week20_icon.svg`](./week20_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KGGGGGGGGGGGGGGGGGGGGGGGGGGK..
..KWKKKKKKWWWWWWWWWWWWWWWWWWWK..
..KWKGGGGKWWWWWWWWWWWWWWWWWWWK..
..KWKGGGGKWWWWWWWWWWWWWWWWWWWK..
..KWKGGGGKWWWWWWWWWWWWWWWWWWWK..
..KWKGGGGKWWWWWWWWWWWWWWWWWWWK..
..KWKKKKKKWWKKKKKKKKKKKKWWWWWK..
..KWWWWWWWKKKKKKKKKKKKKKKKWWWK..
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
.......KAAAKKKKKKKKKKKKKKK......
.......KAAAKKKKKKKKKKKKKKK......
.......KAAAKKAAAAAAAAAAKKK......
.......KAAAKKAAAAAAAAAAKKK......
.......KAAAKKAAKWWWKAAAKKK......
.......KKKKKKAKWWWWWKAAKKK......
..........KKKAKWKWKWKAAKKK......
..........KKKAKWWWWWKAAKKK......
..........KKKAAKWKWKAAAKKK......
..........KKKAAKKKKKAAAKKK......
..........KKKAAAAAAAAAAKKK......
..........KKKAAAAAAAAAAKKK......
..........KKKAAAAAAAAAAKKK......
..........KKKKKKKKKKKKKKKK......
..........KKKKKKKKKKKKKKKK......
..........KKKKKKKKKKKKKKKK......
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="4" y="6" width="56" height="1" fill="#000000" />
  <rect x="4" y="7" width="56" height="1" fill="#000000" />
  <rect x="4" y="8" width="2" height="1" fill="#000000" />
  <rect x="6" y="8" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="8" width="2" height="1" fill="#000000" />
  <rect x="4" y="9" width="2" height="1" fill="#000000" />
  <rect x="6" y="9" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="9" width="2" height="1" fill="#000000" />
  <rect x="4" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="10" width="52" height="1" fill="#33FF00" />
  <rect x="58" y="10" width="2" height="1" fill="#000000" />
  <rect x="4" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="52" height="1" fill="#33FF00" />
  <rect x="58" y="11" width="2" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="12" width="12" height="1" fill="#000000" />
  <rect x="20" y="12" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="13" width="12" height="1" fill="#000000" />
  <rect x="20" y="13" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="14" width="2" height="1" fill="#000000" />
  <rect x="10" y="14" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="14" width="2" height="1" fill="#000000" />
  <rect x="20" y="14" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="15" width="2" height="1" fill="#000000" />
  <rect x="10" y="15" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="15" width="2" height="1" fill="#000000" />
  <rect x="20" y="15" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="16" width="2" height="1" fill="#000000" />
  <rect x="10" y="16" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="16" width="2" height="1" fill="#000000" />
  <rect x="20" y="16" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="16" width="2" height="1" fill="#000000" />
  <rect x="4" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="17" width="2" height="1" fill="#000000" />
  <rect x="10" y="17" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="17" width="2" height="1" fill="#000000" />
  <rect x="20" y="17" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="17" width="2" height="1" fill="#000000" />
  <rect x="4" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="18" width="2" height="1" fill="#000000" />
  <rect x="10" y="18" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="18" width="2" height="1" fill="#000000" />
  <rect x="20" y="18" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="18" width="2" height="1" fill="#000000" />
  <rect x="4" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="19" width="2" height="1" fill="#000000" />
  <rect x="10" y="19" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="19" width="2" height="1" fill="#000000" />
  <rect x="20" y="19" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="19" width="2" height="1" fill="#000000" />
  <rect x="4" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="20" width="2" height="1" fill="#000000" />
  <rect x="10" y="20" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="20" width="2" height="1" fill="#000000" />
  <rect x="20" y="20" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="20" width="2" height="1" fill="#000000" />
  <rect x="4" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="21" width="2" height="1" fill="#000000" />
  <rect x="10" y="21" width="8" height="1" fill="#33FF00" />
  <rect x="18" y="21" width="2" height="1" fill="#000000" />
  <rect x="20" y="21" width="38" height="1" fill="#F1F1F1" />
  <rect x="58" y="21" width="2" height="1" fill="#000000" />
  <rect x="4" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="22" width="12" height="1" fill="#000000" />
  <rect x="20" y="22" width="4" height="1" fill="#F1F1F1" />
  <rect x="24" y="22" width="24" height="1" fill="#000000" />
  <rect x="48" y="22" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="22" width="2" height="1" fill="#000000" />
  <rect x="4" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="8" y="23" width="12" height="1" fill="#000000" />
  <rect x="20" y="23" width="4" height="1" fill="#F1F1F1" />
  <rect x="24" y="23" width="24" height="1" fill="#000000" />
  <rect x="48" y="23" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="23" width="2" height="1" fill="#000000" />
  <rect x="4" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="14" height="1" fill="#F1F1F1" />
  <rect x="20" y="24" width="32" height="1" fill="#000000" />
  <rect x="52" y="24" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="24" width="2" height="1" fill="#000000" />
  <rect x="4" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="14" height="1" fill="#F1F1F1" />
  <rect x="20" y="25" width="32" height="1" fill="#000000" />
  <rect x="52" y="25" width="6" height="1" fill="#F1F1F1" />
  <rect x="58" y="25" width="2" height="1" fill="#000000" />
  <rect x="4" y="26" width="56" height="1" fill="#000000" />
  <rect x="4" y="27" width="56" height="1" fill="#000000" />
  <rect x="14" y="28" width="2" height="1" fill="#000000" />
  <rect x="16" y="28" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="28" width="30" height="1" fill="#000000" />
  <rect x="14" y="29" width="2" height="1" fill="#000000" />
  <rect x="16" y="29" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="29" width="30" height="1" fill="#000000" />
  <rect x="14" y="30" width="2" height="1" fill="#000000" />
  <rect x="16" y="30" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="30" width="30" height="1" fill="#000000" />
  <rect x="14" y="31" width="2" height="1" fill="#000000" />
  <rect x="16" y="31" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="31" width="30" height="1" fill="#000000" />
  <rect x="14" y="32" width="2" height="1" fill="#000000" />
  <rect x="16" y="32" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="32" width="4" height="1" fill="#000000" />
  <rect x="26" y="32" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="32" width="6" height="1" fill="#000000" />
  <rect x="14" y="33" width="2" height="1" fill="#000000" />
  <rect x="16" y="33" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="33" width="4" height="1" fill="#000000" />
  <rect x="26" y="33" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="33" width="6" height="1" fill="#000000" />
  <rect x="14" y="34" width="2" height="1" fill="#000000" />
  <rect x="16" y="34" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="34" width="4" height="1" fill="#000000" />
  <rect x="26" y="34" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="34" width="6" height="1" fill="#000000" />
  <rect x="14" y="35" width="2" height="1" fill="#000000" />
  <rect x="16" y="35" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="35" width="4" height="1" fill="#000000" />
  <rect x="26" y="35" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="35" width="6" height="1" fill="#000000" />
  <rect x="14" y="36" width="2" height="1" fill="#000000" />
  <rect x="16" y="36" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="36" width="4" height="1" fill="#000000" />
  <rect x="26" y="36" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="36" width="2" height="1" fill="#000000" />
  <rect x="32" y="36" width="6" height="1" fill="#F1F1F1" />
  <rect x="38" y="36" width="2" height="1" fill="#000000" />
  <rect x="40" y="36" width="6" height="1" fill="#FFB000" />
  <rect x="46" y="36" width="6" height="1" fill="#000000" />
  <rect x="14" y="37" width="2" height="1" fill="#000000" />
  <rect x="16" y="37" width="6" height="1" fill="#FFB000" />
  <rect x="22" y="37" width="4" height="1" fill="#000000" />
  <rect x="26" y="37" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="37" width="2" height="1" fill="#000000" />
  <rect x="32" y="37" width="6" height="1" fill="#F1F1F1" />
  <rect x="38" y="37" width="2" height="1" fill="#000000" />
  <rect x="40" y="37" width="6" height="1" fill="#FFB000" />
  <rect x="46" y="37" width="6" height="1" fill="#000000" />
  <rect x="14" y="38" width="12" height="1" fill="#000000" />
  <rect x="26" y="38" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="38" width="2" height="1" fill="#000000" />
  <rect x="30" y="38" width="10" height="1" fill="#F1F1F1" />
  <rect x="40" y="38" width="2" height="1" fill="#000000" />
  <rect x="42" y="38" width="4" height="1" fill="#FFB000" />
  <rect x="46" y="38" width="6" height="1" fill="#000000" />
  <rect x="14" y="39" width="12" height="1" fill="#000000" />
  <rect x="26" y="39" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="39" width="2" height="1" fill="#000000" />
  <rect x="30" y="39" width="10" height="1" fill="#F1F1F1" />
  <rect x="40" y="39" width="2" height="1" fill="#000000" />
  <rect x="42" y="39" width="4" height="1" fill="#FFB000" />
  <rect x="46" y="39" width="6" height="1" fill="#000000" />
  <rect x="20" y="40" width="6" height="1" fill="#000000" />
  <rect x="26" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="40" width="2" height="1" fill="#000000" />
  <rect x="30" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="40" width="2" height="1" fill="#000000" />
  <rect x="34" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="40" width="2" height="1" fill="#000000" />
  <rect x="38" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="40" y="40" width="2" height="1" fill="#000000" />
  <rect x="42" y="40" width="4" height="1" fill="#FFB000" />
  <rect x="46" y="40" width="6" height="1" fill="#000000" />
  <rect x="20" y="41" width="6" height="1" fill="#000000" />
  <rect x="26" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="41" width="2" height="1" fill="#000000" />
  <rect x="30" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="41" width="2" height="1" fill="#000000" />
  <rect x="34" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="36" y="41" width="2" height="1" fill="#000000" />
  <rect x="38" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="40" y="41" width="2" height="1" fill="#000000" />
  <rect x="42" y="41" width="4" height="1" fill="#FFB000" />
  <rect x="46" y="41" width="6" height="1" fill="#000000" />
  <rect x="20" y="42" width="6" height="1" fill="#000000" />
  <rect x="26" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="42" width="2" height="1" fill="#000000" />
  <rect x="30" y="42" width="10" height="1" fill="#F1F1F1" />
  <rect x="40" y="42" width="2" height="1" fill="#000000" />
  <rect x="42" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="46" y="42" width="6" height="1" fill="#000000" />
  <rect x="20" y="43" width="6" height="1" fill="#000000" />
  <rect x="26" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="28" y="43" width="2" height="1" fill="#000000" />
  <rect x="30" y="43" width="10" height="1" fill="#F1F1F1" />
  <rect x="40" y="43" width="2" height="1" fill="#000000" />
  <rect x="42" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="46" y="43" width="6" height="1" fill="#000000" />
  <rect x="20" y="44" width="6" height="1" fill="#000000" />
  <rect x="26" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="44" width="2" height="1" fill="#000000" />
  <rect x="32" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="34" y="44" width="2" height="1" fill="#000000" />
  <rect x="36" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="44" width="2" height="1" fill="#000000" />
  <rect x="40" y="44" width="6" height="1" fill="#FFB000" />
  <rect x="46" y="44" width="6" height="1" fill="#000000" />
  <rect x="20" y="45" width="6" height="1" fill="#000000" />
  <rect x="26" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="45" width="2" height="1" fill="#000000" />
  <rect x="32" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="34" y="45" width="2" height="1" fill="#000000" />
  <rect x="36" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="38" y="45" width="2" height="1" fill="#000000" />
  <rect x="40" y="45" width="6" height="1" fill="#FFB000" />
  <rect x="46" y="45" width="6" height="1" fill="#000000" />
  <rect x="20" y="46" width="6" height="1" fill="#000000" />
  <rect x="26" y="46" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="46" width="10" height="1" fill="#000000" />
  <rect x="40" y="46" width="6" height="1" fill="#FFB000" />
  <rect x="46" y="46" width="6" height="1" fill="#000000" />
  <rect x="20" y="47" width="6" height="1" fill="#000000" />
  <rect x="26" y="47" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="47" width="10" height="1" fill="#000000" />
  <rect x="40" y="47" width="6" height="1" fill="#FFB000" />
  <rect x="46" y="47" width="6" height="1" fill="#000000" />
  <rect x="20" y="48" width="6" height="1" fill="#000000" />
  <rect x="26" y="48" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="48" width="6" height="1" fill="#000000" />
  <rect x="20" y="49" width="6" height="1" fill="#000000" />
  <rect x="26" y="49" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="49" width="6" height="1" fill="#000000" />
  <rect x="20" y="50" width="6" height="1" fill="#000000" />
  <rect x="26" y="50" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="50" width="6" height="1" fill="#000000" />
  <rect x="20" y="51" width="6" height="1" fill="#000000" />
  <rect x="26" y="51" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="51" width="6" height="1" fill="#000000" />
  <rect x="20" y="52" width="6" height="1" fill="#000000" />
  <rect x="26" y="52" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="52" width="6" height="1" fill="#000000" />
  <rect x="20" y="53" width="6" height="1" fill="#000000" />
  <rect x="26" y="53" width="20" height="1" fill="#FFB000" />
  <rect x="46" y="53" width="6" height="1" fill="#000000" />
  <rect x="20" y="54" width="32" height="1" fill="#000000" />
  <rect x="20" y="55" width="32" height="1" fill="#000000" />
  <rect x="20" y="56" width="32" height="1" fill="#000000" />
  <rect x="20" y="57" width="32" height="1" fill="#000000" />
  <rect x="20" y="58" width="32" height="1" fill="#000000" />
  <rect x="20" y="59" width="32" height="1" fill="#000000" />
</svg>
```
