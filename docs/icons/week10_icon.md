# Week 10: SQL and Databases — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 10 (`week-10`)
- **Lesson ID**: `week-10-sql-and-databases`
- **Title**: SQL and Databases
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-10.mdx`

## 2. Narrative Context (The Hook)
The flat incident log has reached 40,000 lines and `grep` is no longer enough. You migrate the fleet into `ops.db` with `sqlite3`, declare a strict table schema, and use `?` placeholders to block SQL injection.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Write the shape down before the data**: Relational tables, rows, columns, and schemas; `sqlite3.connect(":memory:")`; `with conn:` transaction commits/rollbacks; `CREATE TABLE IF NOT EXISTS` with `INTEGER PRIMARY KEY` and `NOT NULL`.
- **Waypoint 2: Values travel beside the statement**: `cursor.execute(sql, params)` using `?` placeholders, single-element tuples `(val,)`, `executemany()`, and retrieving rows as tuples with `fetchall()`.
- **Waypoint 3: WHERE decides which rows pay**: Targeted `UPDATE ... SET ... WHERE ...` and `DELETE FROM ... WHERE ...` statements, and the danger of omitting `WHERE`.
- **Waypoint 4: A quote is not a feature**: How string interpolation (`f"SELECT ... WHERE name = '{hostile}'"`) enables `' OR '1'='1` SQL injection, and how `?` parameter binding treats hostile input strictly as data.

## 4. Key Traps & Edge Cases Covered
- Passing `(name)` instead of a 1-tuple `(name,)` to `conn.execute(sql, params)`.
- Running `UPDATE` or `DELETE FROM` without a `WHERE` clause silently mutates or wipes every row in the table.
- Quoting the placeholder (`VALUES ('?')`) inserts a literal question mark instead of binding the parameter.
- Using f-strings to build SQL queries with user input allows silent SQL injection.

## 5. Interactive Exercises & Components
- `w10-one-item-tuple` (`params = (name,)` with trailing comma)
- `w10-parameterise-the-filter` (replacing f-string query with `?` and `(hostile_name,)`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week10_icon`)

### Strict Visual Rules Applied
- **Subject**: **SQL** — A silver database cylinder protected by a small shield.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week10_icon.svg`](./week10_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
....KKKKKKKKKKKKKKKKKKK.........
....KGGGGGGGGGGGGGGGGGK.........
....KGGGGGGGGGGGGGGGGGK.........
....KGGGGGGGGGGGGGGGGGK.........
....KKKKKKKKKKKKKKKKKKK.........
....KWWWWWWWWWWWWWWWWWK.........
....KWWGGGWWWWWWWWWWWWK.........
....KWWGGGWWWWWWWWWWWWK.........
....KWWGGGWWWWWWWWWWWWK.........
....KWWWWWWWWWWWWWWWWWK.........
....KKKKKKKKKKKKKKKKKKK.........
....KKKKKKKKKKKKKKKKKKK.........
....KWWWWWWWWWWWWWWWWWK.........
....KWWGGGWWWWWWWWWWWWK.........
....KWWGGGWWWWWWWWWWWWK.........
....KWWGGGWWWWWWWKKKKKKKKKKKK...
....KWWWWWWWWWWWWKAAAAAAAAAAK...
....KKKKKKKKKKKKKKAAWWWWWWAAK...
....KKKKKKKKKKKKKKAAWGGGGWAAK...
....KWWWWWWWWWWWWKAAWGGGGWAAK...
....KWWGGGWWWWWWWKAAWWWWWWAAK...
....KWWGGGWWWWWWWWKAAAAAAAAK....
....KWWGGGWWWWWWWWWKAAAAAAK.....
....KWWWWWWWWWWWWWWWKAAAAK......
....KKKKKKKKKKKKKKKKKKKKK.......
................................
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="8" y="6" width="38" height="1" fill="#000000" />
  <rect x="8" y="7" width="38" height="1" fill="#000000" />
  <rect x="8" y="8" width="2" height="1" fill="#000000" />
  <rect x="10" y="8" width="34" height="1" fill="#33FF00" />
  <rect x="44" y="8" width="2" height="1" fill="#000000" />
  <rect x="8" y="9" width="2" height="1" fill="#000000" />
  <rect x="10" y="9" width="34" height="1" fill="#33FF00" />
  <rect x="44" y="9" width="2" height="1" fill="#000000" />
  <rect x="8" y="10" width="2" height="1" fill="#000000" />
  <rect x="10" y="10" width="34" height="1" fill="#33FF00" />
  <rect x="44" y="10" width="2" height="1" fill="#000000" />
  <rect x="8" y="11" width="2" height="1" fill="#000000" />
  <rect x="10" y="11" width="34" height="1" fill="#33FF00" />
  <rect x="44" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="2" height="1" fill="#000000" />
  <rect x="10" y="12" width="34" height="1" fill="#33FF00" />
  <rect x="44" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="2" height="1" fill="#000000" />
  <rect x="10" y="13" width="34" height="1" fill="#33FF00" />
  <rect x="44" y="13" width="2" height="1" fill="#000000" />
  <rect x="8" y="14" width="38" height="1" fill="#000000" />
  <rect x="8" y="15" width="38" height="1" fill="#000000" />
  <rect x="8" y="16" width="2" height="1" fill="#000000" />
  <rect x="10" y="16" width="34" height="1" fill="#F1F1F1" />
  <rect x="44" y="16" width="2" height="1" fill="#000000" />
  <rect x="8" y="17" width="2" height="1" fill="#000000" />
  <rect x="10" y="17" width="34" height="1" fill="#F1F1F1" />
  <rect x="44" y="17" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="2" height="1" fill="#000000" />
  <rect x="10" y="18" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="18" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="18" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="2" height="1" fill="#000000" />
  <rect x="10" y="19" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="19" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="19" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="2" height="1" fill="#000000" />
  <rect x="10" y="20" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="20" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="20" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="2" height="1" fill="#000000" />
  <rect x="10" y="21" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="21" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="21" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="2" height="1" fill="#000000" />
  <rect x="10" y="22" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="22" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="22" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="2" height="1" fill="#000000" />
  <rect x="10" y="23" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="23" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="23" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="2" height="1" fill="#000000" />
  <rect x="10" y="24" width="34" height="1" fill="#F1F1F1" />
  <rect x="44" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="2" height="1" fill="#000000" />
  <rect x="10" y="25" width="34" height="1" fill="#F1F1F1" />
  <rect x="44" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="38" height="1" fill="#000000" />
  <rect x="8" y="27" width="38" height="1" fill="#000000" />
  <rect x="8" y="28" width="38" height="1" fill="#000000" />
  <rect x="8" y="29" width="38" height="1" fill="#000000" />
  <rect x="8" y="30" width="2" height="1" fill="#000000" />
  <rect x="10" y="30" width="34" height="1" fill="#F1F1F1" />
  <rect x="44" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="2" height="1" fill="#000000" />
  <rect x="10" y="31" width="34" height="1" fill="#F1F1F1" />
  <rect x="44" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="2" height="1" fill="#000000" />
  <rect x="10" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="32" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="32" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="2" height="1" fill="#000000" />
  <rect x="10" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="33" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="33" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="2" height="1" fill="#000000" />
  <rect x="10" y="34" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="34" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="34" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="2" height="1" fill="#000000" />
  <rect x="10" y="35" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="35" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="35" width="24" height="1" fill="#F1F1F1" />
  <rect x="44" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="2" height="1" fill="#000000" />
  <rect x="10" y="36" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="36" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="36" width="14" height="1" fill="#F1F1F1" />
  <rect x="34" y="36" width="24" height="1" fill="#000000" />
  <rect x="8" y="37" width="2" height="1" fill="#000000" />
  <rect x="10" y="37" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="37" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="37" width="14" height="1" fill="#F1F1F1" />
  <rect x="34" y="37" width="24" height="1" fill="#000000" />
  <rect x="8" y="38" width="2" height="1" fill="#000000" />
  <rect x="10" y="38" width="24" height="1" fill="#F1F1F1" />
  <rect x="34" y="38" width="2" height="1" fill="#000000" />
  <rect x="36" y="38" width="20" height="1" fill="#FFB000" />
  <rect x="56" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="2" height="1" fill="#000000" />
  <rect x="10" y="39" width="24" height="1" fill="#F1F1F1" />
  <rect x="34" y="39" width="2" height="1" fill="#000000" />
  <rect x="36" y="39" width="20" height="1" fill="#FFB000" />
  <rect x="56" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="28" height="1" fill="#000000" />
  <rect x="36" y="40" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="40" width="12" height="1" fill="#F1F1F1" />
  <rect x="52" y="40" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="28" height="1" fill="#000000" />
  <rect x="36" y="41" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="41" width="12" height="1" fill="#F1F1F1" />
  <rect x="52" y="41" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="28" height="1" fill="#000000" />
  <rect x="36" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="42" width="8" height="1" fill="#33FF00" />
  <rect x="50" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="28" height="1" fill="#000000" />
  <rect x="36" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="43" width="8" height="1" fill="#33FF00" />
  <rect x="50" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="2" height="1" fill="#000000" />
  <rect x="10" y="44" width="24" height="1" fill="#F1F1F1" />
  <rect x="34" y="44" width="2" height="1" fill="#000000" />
  <rect x="36" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="44" width="8" height="1" fill="#33FF00" />
  <rect x="50" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="2" height="1" fill="#000000" />
  <rect x="10" y="45" width="24" height="1" fill="#F1F1F1" />
  <rect x="34" y="45" width="2" height="1" fill="#000000" />
  <rect x="36" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="42" y="45" width="8" height="1" fill="#33FF00" />
  <rect x="50" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="52" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="46" width="2" height="1" fill="#000000" />
  <rect x="10" y="46" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="46" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="46" width="14" height="1" fill="#F1F1F1" />
  <rect x="34" y="46" width="2" height="1" fill="#000000" />
  <rect x="36" y="46" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="46" width="12" height="1" fill="#F1F1F1" />
  <rect x="52" y="46" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="46" width="2" height="1" fill="#000000" />
  <rect x="8" y="47" width="2" height="1" fill="#000000" />
  <rect x="10" y="47" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="47" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="47" width="14" height="1" fill="#F1F1F1" />
  <rect x="34" y="47" width="2" height="1" fill="#000000" />
  <rect x="36" y="47" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="47" width="12" height="1" fill="#F1F1F1" />
  <rect x="52" y="47" width="4" height="1" fill="#FFB000" />
  <rect x="56" y="47" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="2" height="1" fill="#000000" />
  <rect x="10" y="48" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="48" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="48" width="16" height="1" fill="#F1F1F1" />
  <rect x="36" y="48" width="2" height="1" fill="#000000" />
  <rect x="38" y="48" width="16" height="1" fill="#FFB000" />
  <rect x="54" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="2" height="1" fill="#000000" />
  <rect x="10" y="49" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="49" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="49" width="16" height="1" fill="#F1F1F1" />
  <rect x="36" y="49" width="2" height="1" fill="#000000" />
  <rect x="38" y="49" width="16" height="1" fill="#FFB000" />
  <rect x="54" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="2" height="1" fill="#000000" />
  <rect x="10" y="50" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="50" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="50" width="18" height="1" fill="#F1F1F1" />
  <rect x="38" y="50" width="2" height="1" fill="#000000" />
  <rect x="40" y="50" width="12" height="1" fill="#FFB000" />
  <rect x="52" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="2" height="1" fill="#000000" />
  <rect x="10" y="51" width="4" height="1" fill="#F1F1F1" />
  <rect x="14" y="51" width="6" height="1" fill="#33FF00" />
  <rect x="20" y="51" width="18" height="1" fill="#F1F1F1" />
  <rect x="38" y="51" width="2" height="1" fill="#000000" />
  <rect x="40" y="51" width="12" height="1" fill="#FFB000" />
  <rect x="52" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="2" height="1" fill="#000000" />
  <rect x="10" y="52" width="30" height="1" fill="#F1F1F1" />
  <rect x="40" y="52" width="2" height="1" fill="#000000" />
  <rect x="42" y="52" width="8" height="1" fill="#FFB000" />
  <rect x="50" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="2" height="1" fill="#000000" />
  <rect x="10" y="53" width="30" height="1" fill="#F1F1F1" />
  <rect x="40" y="53" width="2" height="1" fill="#000000" />
  <rect x="42" y="53" width="8" height="1" fill="#FFB000" />
  <rect x="50" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="54" width="42" height="1" fill="#000000" />
  <rect x="8" y="55" width="42" height="1" fill="#000000" />
</svg>
```
