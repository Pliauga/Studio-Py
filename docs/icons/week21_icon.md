# Week 21: Database Indexing and Caching — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 21 (`week-21`)
- **Lesson ID**: `week-21-database-indexing-and-transactions`
- **Title**: Database Indexing and Caching
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-21.mdx`

## 2. Narrative Context (The Hook)
Six months later, `ops.db` holds 2 million rows, dashboard refreshes take 4 seconds, and a partial crash left migrated hosts inconsistent. You add B-tree indexes, atomic `with conn:` transactions, `LEFT JOIN` queries, and a `TTLCache`.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Full Table Scans vs. B-Tree Indexes**: `CREATE INDEX IF NOT EXISTS idx_alerts_region ON alerts(region)` and verifying `SEARCH ... USING INDEX` instead of `SCAN` via `EXPLAIN QUERY PLAN`.
- **Waypoint 2: Atomic Transactions—All or Nothing**: Wrapping multi-statement updates (`transfer`) in `with conn:` so `sqlite3.IntegrityError` or `RuntimeError` rolls back every statement in the unit automatically.
- **Waypoint 3: Eliminating the N+1 Query Problem**: Replacing 1 + N looped `SELECT` queries with a single `SELECT h.name, COUNT(i.host_name) FROM hosts h LEFT JOIN incidents i ON ... GROUP BY h.name ORDER BY h.name`.
- **Waypoint 4: Time-To-Live (TTL) Caching for Hot Reads**: Implementing `TTLCache` using `time.monotonic()` expiration timestamps (`now + ttl_seconds`) and explicit cache eviction.

## 4. Key Traps & Edge Cases Covered
- Calling `conn.commit()` after each individual statement inside a multi-step transfer prevents rollback on a later error.
- Using an `INNER JOIN` instead of `LEFT JOIN` + `COUNT(i.host_name)` drops hosts that have `0` incidents.
- Wrapping indexed columns in SQL functions (`WHERE LOWER(hostname) = ...`) bypasses standard column indexes.

## 5. Interactive Exercises & Components
- `w21-explain-index` (`CREATE INDEX IF NOT EXISTS` verified by `EXPLAIN QUERY PLAN`)
- `w21-atomic-transfer` (atomic credit transfer inside `with conn:` catching `sqlite3.IntegrityError`)
- `w21-left-join-counts` (`LEFT JOIN` + `COUNT(i.host_name)` + `GROUP BY` + `ORDER BY`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week21_icon`)

### Strict Visual Rules Applied
- **Subject**: **Indexing** — A glowing branching tree (B-tree) structure.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week21_icon.svg`](./week21_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
..........KKKKKKKKKKKK..........
..........KAAAAAAAAAAK..........
..........KAWWWWWWWWAK..........
..........KAWWWWWWWWAK..........
..........KAWWWWWWWWAK..........
..........KAAAAAAAAAAK..........
..........KKKKKKKKKKKK..........
.......KKKKKKKKGGKKKKKKKK.......
.......KGGGGGGGGGGGGGGGGK.......
.......KGGGGGGGGGGGGGGGGK.......
....KKKKKKKKKKGGGGKKKKKKKKKK....
....KGGGGGGGGKKKKKKGGGGGGGGK....
....KGGGGGGGGK....KGGGGGGGGK....
....KGGGGGGGGK....KGGGGGGGGK....
....KGGGGGGGGK....KGGGGGGGGK....
....KGGGGGGGGK....KGGGGGGGGK....
....KKKKKKKKKK....KKKKKKKKKK....
...KKKKKKKKKKK....KKKKKKKKKKK...
...KGGGGGGGGGK....KGGGGGGGGGK...
...KGGGGGGGGGK....KGGGGGGGGGK...
.KKKKKKKGKKKKKKKKKKKKKKGKKKKKKK.
.KWWWWWKKKWWWWWKKWWWWWKKKWWWWWK.
.KWWWWWK.KWWWWWKKWWWWWK.KWWWWWK.
.KWWWWWK.KWWWWWKKWWWWWK.KWWWWWK.
.KWWWWWK.KWWWWWKKWWWWWK.KWWWWWK.
.KWWWWWK.KWWWWWKKWWWWWK.KWWWWWK.
.KKKKKKK.KKKKKKKKKKKKKK.KKKKKKK.
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="20" y="4" width="24" height="1" fill="#000000" />
  <rect x="20" y="5" width="24" height="1" fill="#000000" />
  <rect x="20" y="6" width="2" height="1" fill="#000000" />
  <rect x="22" y="6" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="6" width="2" height="1" fill="#000000" />
  <rect x="20" y="7" width="2" height="1" fill="#000000" />
  <rect x="22" y="7" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="7" width="2" height="1" fill="#000000" />
  <rect x="20" y="8" width="2" height="1" fill="#000000" />
  <rect x="22" y="8" width="2" height="1" fill="#FFB000" />
  <rect x="24" y="8" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="8" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="8" width="2" height="1" fill="#000000" />
  <rect x="20" y="9" width="2" height="1" fill="#000000" />
  <rect x="22" y="9" width="2" height="1" fill="#FFB000" />
  <rect x="24" y="9" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="9" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="9" width="2" height="1" fill="#000000" />
  <rect x="20" y="10" width="2" height="1" fill="#000000" />
  <rect x="22" y="10" width="2" height="1" fill="#FFB000" />
  <rect x="24" y="10" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="10" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="10" width="2" height="1" fill="#000000" />
  <rect x="20" y="11" width="2" height="1" fill="#000000" />
  <rect x="22" y="11" width="2" height="1" fill="#FFB000" />
  <rect x="24" y="11" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="11" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="11" width="2" height="1" fill="#000000" />
  <rect x="20" y="12" width="2" height="1" fill="#000000" />
  <rect x="22" y="12" width="2" height="1" fill="#FFB000" />
  <rect x="24" y="12" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="12" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="12" width="2" height="1" fill="#000000" />
  <rect x="20" y="13" width="2" height="1" fill="#000000" />
  <rect x="22" y="13" width="2" height="1" fill="#FFB000" />
  <rect x="24" y="13" width="16" height="1" fill="#F1F1F1" />
  <rect x="40" y="13" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="13" width="2" height="1" fill="#000000" />
  <rect x="20" y="14" width="2" height="1" fill="#000000" />
  <rect x="22" y="14" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="14" width="2" height="1" fill="#000000" />
  <rect x="20" y="15" width="2" height="1" fill="#000000" />
  <rect x="22" y="15" width="20" height="1" fill="#FFB000" />
  <rect x="42" y="15" width="2" height="1" fill="#000000" />
  <rect x="20" y="16" width="24" height="1" fill="#000000" />
  <rect x="20" y="17" width="24" height="1" fill="#000000" />
  <rect x="14" y="18" width="16" height="1" fill="#000000" />
  <rect x="30" y="18" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="18" width="16" height="1" fill="#000000" />
  <rect x="14" y="19" width="16" height="1" fill="#000000" />
  <rect x="30" y="19" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="19" width="16" height="1" fill="#000000" />
  <rect x="14" y="20" width="2" height="1" fill="#000000" />
  <rect x="16" y="20" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="20" width="2" height="1" fill="#000000" />
  <rect x="14" y="21" width="2" height="1" fill="#000000" />
  <rect x="16" y="21" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="21" width="2" height="1" fill="#000000" />
  <rect x="14" y="22" width="2" height="1" fill="#000000" />
  <rect x="16" y="22" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="22" width="2" height="1" fill="#000000" />
  <rect x="14" y="23" width="2" height="1" fill="#000000" />
  <rect x="16" y="23" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="20" height="1" fill="#000000" />
  <rect x="28" y="24" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="24" width="20" height="1" fill="#000000" />
  <rect x="8" y="25" width="20" height="1" fill="#000000" />
  <rect x="28" y="25" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="25" width="20" height="1" fill="#000000" />
  <rect x="8" y="26" width="2" height="1" fill="#000000" />
  <rect x="10" y="26" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="26" width="12" height="1" fill="#000000" />
  <rect x="38" y="26" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="2" height="1" fill="#000000" />
  <rect x="10" y="27" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="27" width="12" height="1" fill="#000000" />
  <rect x="38" y="27" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="2" height="1" fill="#000000" />
  <rect x="10" y="28" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="28" width="2" height="1" fill="#000000" />
  <rect x="36" y="28" width="2" height="1" fill="#000000" />
  <rect x="38" y="28" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="2" height="1" fill="#000000" />
  <rect x="10" y="29" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="29" width="2" height="1" fill="#000000" />
  <rect x="36" y="29" width="2" height="1" fill="#000000" />
  <rect x="38" y="29" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="2" height="1" fill="#000000" />
  <rect x="10" y="30" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="30" width="2" height="1" fill="#000000" />
  <rect x="36" y="30" width="2" height="1" fill="#000000" />
  <rect x="38" y="30" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="2" height="1" fill="#000000" />
  <rect x="10" y="31" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="31" width="2" height="1" fill="#000000" />
  <rect x="36" y="31" width="2" height="1" fill="#000000" />
  <rect x="38" y="31" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="2" height="1" fill="#000000" />
  <rect x="10" y="32" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="32" width="2" height="1" fill="#000000" />
  <rect x="36" y="32" width="2" height="1" fill="#000000" />
  <rect x="38" y="32" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="2" height="1" fill="#000000" />
  <rect x="10" y="33" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="33" width="2" height="1" fill="#000000" />
  <rect x="36" y="33" width="2" height="1" fill="#000000" />
  <rect x="38" y="33" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="2" height="1" fill="#000000" />
  <rect x="10" y="34" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="34" width="2" height="1" fill="#000000" />
  <rect x="36" y="34" width="2" height="1" fill="#000000" />
  <rect x="38" y="34" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="2" height="1" fill="#000000" />
  <rect x="10" y="35" width="16" height="1" fill="#33FF00" />
  <rect x="26" y="35" width="2" height="1" fill="#000000" />
  <rect x="36" y="35" width="2" height="1" fill="#000000" />
  <rect x="38" y="35" width="16" height="1" fill="#33FF00" />
  <rect x="54" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="20" height="1" fill="#000000" />
  <rect x="36" y="36" width="20" height="1" fill="#000000" />
  <rect x="8" y="37" width="20" height="1" fill="#000000" />
  <rect x="36" y="37" width="20" height="1" fill="#000000" />
  <rect x="6" y="38" width="22" height="1" fill="#000000" />
  <rect x="36" y="38" width="22" height="1" fill="#000000" />
  <rect x="6" y="39" width="22" height="1" fill="#000000" />
  <rect x="36" y="39" width="22" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="18" height="1" fill="#33FF00" />
  <rect x="26" y="40" width="2" height="1" fill="#000000" />
  <rect x="36" y="40" width="2" height="1" fill="#000000" />
  <rect x="38" y="40" width="18" height="1" fill="#33FF00" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="18" height="1" fill="#33FF00" />
  <rect x="26" y="41" width="2" height="1" fill="#000000" />
  <rect x="36" y="41" width="2" height="1" fill="#000000" />
  <rect x="38" y="41" width="18" height="1" fill="#33FF00" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="18" height="1" fill="#33FF00" />
  <rect x="26" y="42" width="2" height="1" fill="#000000" />
  <rect x="36" y="42" width="2" height="1" fill="#000000" />
  <rect x="38" y="42" width="18" height="1" fill="#33FF00" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="18" height="1" fill="#33FF00" />
  <rect x="26" y="43" width="2" height="1" fill="#000000" />
  <rect x="36" y="43" width="2" height="1" fill="#000000" />
  <rect x="38" y="43" width="18" height="1" fill="#33FF00" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="2" y="44" width="14" height="1" fill="#000000" />
  <rect x="16" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="44" width="28" height="1" fill="#000000" />
  <rect x="46" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="44" width="14" height="1" fill="#000000" />
  <rect x="2" y="45" width="14" height="1" fill="#000000" />
  <rect x="16" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="45" width="28" height="1" fill="#000000" />
  <rect x="46" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="45" width="14" height="1" fill="#000000" />
  <rect x="2" y="46" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="46" width="6" height="1" fill="#000000" />
  <rect x="20" y="46" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="46" width="4" height="1" fill="#000000" />
  <rect x="34" y="46" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="46" width="6" height="1" fill="#000000" />
  <rect x="50" y="46" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="46" width="2" height="1" fill="#000000" />
  <rect x="2" y="47" width="2" height="1" fill="#000000" />
  <rect x="4" y="47" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="47" width="6" height="1" fill="#000000" />
  <rect x="20" y="47" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="47" width="4" height="1" fill="#000000" />
  <rect x="34" y="47" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="47" width="6" height="1" fill="#000000" />
  <rect x="50" y="47" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="47" width="2" height="1" fill="#000000" />
  <rect x="2" y="48" width="2" height="1" fill="#000000" />
  <rect x="4" y="48" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="48" width="2" height="1" fill="#000000" />
  <rect x="18" y="48" width="2" height="1" fill="#000000" />
  <rect x="20" y="48" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="48" width="4" height="1" fill="#000000" />
  <rect x="34" y="48" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="48" width="2" height="1" fill="#000000" />
  <rect x="48" y="48" width="2" height="1" fill="#000000" />
  <rect x="50" y="48" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="48" width="2" height="1" fill="#000000" />
  <rect x="2" y="49" width="2" height="1" fill="#000000" />
  <rect x="4" y="49" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="49" width="2" height="1" fill="#000000" />
  <rect x="18" y="49" width="2" height="1" fill="#000000" />
  <rect x="20" y="49" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="49" width="4" height="1" fill="#000000" />
  <rect x="34" y="49" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="49" width="2" height="1" fill="#000000" />
  <rect x="48" y="49" width="2" height="1" fill="#000000" />
  <rect x="50" y="49" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="49" width="2" height="1" fill="#000000" />
  <rect x="2" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="50" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="50" width="2" height="1" fill="#000000" />
  <rect x="18" y="50" width="2" height="1" fill="#000000" />
  <rect x="20" y="50" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="50" width="4" height="1" fill="#000000" />
  <rect x="34" y="50" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="50" width="2" height="1" fill="#000000" />
  <rect x="48" y="50" width="2" height="1" fill="#000000" />
  <rect x="50" y="50" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="50" width="2" height="1" fill="#000000" />
  <rect x="2" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="51" width="2" height="1" fill="#000000" />
  <rect x="18" y="51" width="2" height="1" fill="#000000" />
  <rect x="20" y="51" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="51" width="4" height="1" fill="#000000" />
  <rect x="34" y="51" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="51" width="2" height="1" fill="#000000" />
  <rect x="48" y="51" width="2" height="1" fill="#000000" />
  <rect x="50" y="51" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="51" width="2" height="1" fill="#000000" />
  <rect x="2" y="52" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="52" width="2" height="1" fill="#000000" />
  <rect x="18" y="52" width="2" height="1" fill="#000000" />
  <rect x="20" y="52" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="52" width="4" height="1" fill="#000000" />
  <rect x="34" y="52" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="52" width="2" height="1" fill="#000000" />
  <rect x="48" y="52" width="2" height="1" fill="#000000" />
  <rect x="50" y="52" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="52" width="2" height="1" fill="#000000" />
  <rect x="2" y="53" width="2" height="1" fill="#000000" />
  <rect x="4" y="53" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="53" width="2" height="1" fill="#000000" />
  <rect x="18" y="53" width="2" height="1" fill="#000000" />
  <rect x="20" y="53" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="53" width="4" height="1" fill="#000000" />
  <rect x="34" y="53" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="53" width="2" height="1" fill="#000000" />
  <rect x="48" y="53" width="2" height="1" fill="#000000" />
  <rect x="50" y="53" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="53" width="2" height="1" fill="#000000" />
  <rect x="2" y="54" width="2" height="1" fill="#000000" />
  <rect x="4" y="54" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="54" width="2" height="1" fill="#000000" />
  <rect x="18" y="54" width="2" height="1" fill="#000000" />
  <rect x="20" y="54" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="54" width="4" height="1" fill="#000000" />
  <rect x="34" y="54" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="54" width="2" height="1" fill="#000000" />
  <rect x="48" y="54" width="2" height="1" fill="#000000" />
  <rect x="50" y="54" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="54" width="2" height="1" fill="#000000" />
  <rect x="2" y="55" width="2" height="1" fill="#000000" />
  <rect x="4" y="55" width="10" height="1" fill="#F1F1F1" />
  <rect x="14" y="55" width="2" height="1" fill="#000000" />
  <rect x="18" y="55" width="2" height="1" fill="#000000" />
  <rect x="20" y="55" width="10" height="1" fill="#F1F1F1" />
  <rect x="30" y="55" width="4" height="1" fill="#000000" />
  <rect x="34" y="55" width="10" height="1" fill="#F1F1F1" />
  <rect x="44" y="55" width="2" height="1" fill="#000000" />
  <rect x="48" y="55" width="2" height="1" fill="#000000" />
  <rect x="50" y="55" width="10" height="1" fill="#F1F1F1" />
  <rect x="60" y="55" width="2" height="1" fill="#000000" />
  <rect x="2" y="56" width="14" height="1" fill="#000000" />
  <rect x="18" y="56" width="28" height="1" fill="#000000" />
  <rect x="48" y="56" width="14" height="1" fill="#000000" />
  <rect x="2" y="57" width="14" height="1" fill="#000000" />
  <rect x="18" y="57" width="28" height="1" fill="#000000" />
  <rect x="48" y="57" width="14" height="1" fill="#000000" />
</svg>
```
