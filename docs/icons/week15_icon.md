# Week 15: REST APIs with FastAPI — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 15 (`week-15`)
- **Lesson ID**: `week-15-rest-apis-with-fastapi`
- **Title**: REST APIs with FastAPI
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-15.mdx`

## 2. Narrative Context (The Hook)
Twenty monitoring agents across three regions need to push disk readings and query troubled hosts over HTTP without touching `ops.db` directly. You build a self-documenting FastAPI service with Pydantic validation and in-memory tests.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Routes, Verbs, and Path Parameters**: `FastAPI()`, `@app.get("/hosts/{hostname}")`, path parameter extraction, automatic JSON serialization, raising `HTTPException(status_code=404)`, and `/docs` OpenAPI generation.
- **Waypoint 2: Query Parameters and Validated Request Bodies**: Optional query parameters (`region: str | None = None, min_pct: float = 0.0`) and validated `POST` bodies using Pydantic `BaseModel` and `Field(ge=0, gt=0)`.
- **Waypoint 3: Status Codes that Tell the Truth**: Semantic HTTP codes (`200 OK`, `201 Created` via `@app.post(..., status_code=201)`, `401`, `404`, `422 Unprocessable Entity`).
- **Waypoint 4: Testing Endpoints Without Opening a Port**: In-memory ASGI testing with `TestClient` / `httpx.AsyncClient(transport=ASGITransport(app=app))` and database dependency injection via `Depends(get_db)`.

## 4. Key Traps & Edge Cases Covered
- Returning `HTTPException(...)` instead of raising it sends a `200 OK` response containing the exception object.
- Using `404` instead of `422` for validation failures, or returning `200` instead of `201` on resource creation.
- Letting an unhandled `KeyError` escape a route handler as a `500 Internal Server Error` instead of raising a `404` `HTTPException`.
- Hardcoding `sqlite3.connect("ops.db")` inside routes instead of injecting `Depends(get_db)`.

## 5. Interactive Exercises & Components
- `w15-route-lookup` (`@app.get('/hosts/{hostname}')` raising `404` `HTTPException` when missing)
- `w15-query-filter` (filtering host rows by `min_pct` and optional `region`)
- `w15-http-status-dispatch` (`@app.post('/readings', status_code=201)` raising `422` on blank hostname)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week15_icon`)

### Strict Visual Rules Applied
- **Subject**: **FastAPI** — A bright lightning bolt (⚡).
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week15_icon.svg`](./week15_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
................................
................................
...............KKKKKKKKKK.......
..............KAAAAAAAAAAK......
.............KAAWWWWWWWWAK......
............KAAWWWWWWWWK........
...........KAAWWWWWWAK..........
..........KAAWWWWWWK............
.........KAAWWWWWWK.............
........KAAWWWWWWKKKKKKKKKK.....
.......KAAAAAAAAAAAAAAAAAAK.....
......KWWWWWWWWWWWWWWAAAAK......
.....KKKKKKKKKKKKKAAWWWWK.......
................KAAWWWWK........
...............KAAWWWWK.........
..............KAAWWWWK..........
.............KAAWWWWK...........
............KAAWWWAK............
...........KAAWWWAK.............
..........KAAWWAK...............
.........KAAAAK.................
........KGGGK...................
........KKKK....................
................................
................................
................................
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="30" y="10" width="20" height="1" fill="#000000" />
  <rect x="30" y="11" width="20" height="1" fill="#000000" />
  <rect x="28" y="12" width="2" height="1" fill="#000000" />
  <rect x="30" y="12" width="20" height="1" fill="#FFB000" />
  <rect x="50" y="12" width="2" height="1" fill="#000000" />
  <rect x="28" y="13" width="2" height="1" fill="#000000" />
  <rect x="30" y="13" width="20" height="1" fill="#FFB000" />
  <rect x="50" y="13" width="2" height="1" fill="#000000" />
  <rect x="26" y="14" width="2" height="1" fill="#000000" />
  <rect x="28" y="14" width="4" height="1" fill="#FFB000" />
  <rect x="32" y="14" width="16" height="1" fill="#F1F1F1" />
  <rect x="48" y="14" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="14" width="2" height="1" fill="#000000" />
  <rect x="26" y="15" width="2" height="1" fill="#000000" />
  <rect x="28" y="15" width="4" height="1" fill="#FFB000" />
  <rect x="32" y="15" width="16" height="1" fill="#F1F1F1" />
  <rect x="48" y="15" width="2" height="1" fill="#FFB000" />
  <rect x="50" y="15" width="2" height="1" fill="#000000" />
  <rect x="24" y="16" width="2" height="1" fill="#000000" />
  <rect x="26" y="16" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="16" width="16" height="1" fill="#F1F1F1" />
  <rect x="46" y="16" width="2" height="1" fill="#000000" />
  <rect x="24" y="17" width="2" height="1" fill="#000000" />
  <rect x="26" y="17" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="17" width="16" height="1" fill="#F1F1F1" />
  <rect x="46" y="17" width="2" height="1" fill="#000000" />
  <rect x="22" y="18" width="2" height="1" fill="#000000" />
  <rect x="24" y="18" width="4" height="1" fill="#FFB000" />
  <rect x="28" y="18" width="12" height="1" fill="#F1F1F1" />
  <rect x="40" y="18" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="18" width="2" height="1" fill="#000000" />
  <rect x="22" y="19" width="2" height="1" fill="#000000" />
  <rect x="24" y="19" width="4" height="1" fill="#FFB000" />
  <rect x="28" y="19" width="12" height="1" fill="#F1F1F1" />
  <rect x="40" y="19" width="2" height="1" fill="#FFB000" />
  <rect x="42" y="19" width="2" height="1" fill="#000000" />
  <rect x="20" y="20" width="2" height="1" fill="#000000" />
  <rect x="22" y="20" width="4" height="1" fill="#FFB000" />
  <rect x="26" y="20" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="20" width="2" height="1" fill="#000000" />
  <rect x="20" y="21" width="2" height="1" fill="#000000" />
  <rect x="22" y="21" width="4" height="1" fill="#FFB000" />
  <rect x="26" y="21" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="21" width="2" height="1" fill="#000000" />
  <rect x="18" y="22" width="2" height="1" fill="#000000" />
  <rect x="20" y="22" width="4" height="1" fill="#FFB000" />
  <rect x="24" y="22" width="12" height="1" fill="#F1F1F1" />
  <rect x="36" y="22" width="2" height="1" fill="#000000" />
  <rect x="18" y="23" width="2" height="1" fill="#000000" />
  <rect x="20" y="23" width="4" height="1" fill="#FFB000" />
  <rect x="24" y="23" width="12" height="1" fill="#F1F1F1" />
  <rect x="36" y="23" width="2" height="1" fill="#000000" />
  <rect x="16" y="24" width="2" height="1" fill="#000000" />
  <rect x="18" y="24" width="4" height="1" fill="#FFB000" />
  <rect x="22" y="24" width="12" height="1" fill="#F1F1F1" />
  <rect x="34" y="24" width="20" height="1" fill="#000000" />
  <rect x="16" y="25" width="2" height="1" fill="#000000" />
  <rect x="18" y="25" width="4" height="1" fill="#FFB000" />
  <rect x="22" y="25" width="12" height="1" fill="#F1F1F1" />
  <rect x="34" y="25" width="20" height="1" fill="#000000" />
  <rect x="14" y="26" width="2" height="1" fill="#000000" />
  <rect x="16" y="26" width="36" height="1" fill="#FFB000" />
  <rect x="52" y="26" width="2" height="1" fill="#000000" />
  <rect x="14" y="27" width="2" height="1" fill="#000000" />
  <rect x="16" y="27" width="36" height="1" fill="#FFB000" />
  <rect x="52" y="27" width="2" height="1" fill="#000000" />
  <rect x="12" y="28" width="2" height="1" fill="#000000" />
  <rect x="14" y="28" width="28" height="1" fill="#F1F1F1" />
  <rect x="42" y="28" width="8" height="1" fill="#FFB000" />
  <rect x="50" y="28" width="2" height="1" fill="#000000" />
  <rect x="12" y="29" width="2" height="1" fill="#000000" />
  <rect x="14" y="29" width="28" height="1" fill="#F1F1F1" />
  <rect x="42" y="29" width="8" height="1" fill="#FFB000" />
  <rect x="50" y="29" width="2" height="1" fill="#000000" />
  <rect x="10" y="30" width="26" height="1" fill="#000000" />
  <rect x="36" y="30" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="30" width="8" height="1" fill="#F1F1F1" />
  <rect x="48" y="30" width="2" height="1" fill="#000000" />
  <rect x="10" y="31" width="26" height="1" fill="#000000" />
  <rect x="36" y="31" width="4" height="1" fill="#FFB000" />
  <rect x="40" y="31" width="8" height="1" fill="#F1F1F1" />
  <rect x="48" y="31" width="2" height="1" fill="#000000" />
  <rect x="32" y="32" width="2" height="1" fill="#000000" />
  <rect x="34" y="32" width="4" height="1" fill="#FFB000" />
  <rect x="38" y="32" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="32" width="2" height="1" fill="#000000" />
  <rect x="32" y="33" width="2" height="1" fill="#000000" />
  <rect x="34" y="33" width="4" height="1" fill="#FFB000" />
  <rect x="38" y="33" width="8" height="1" fill="#F1F1F1" />
  <rect x="46" y="33" width="2" height="1" fill="#000000" />
  <rect x="30" y="34" width="2" height="1" fill="#000000" />
  <rect x="32" y="34" width="4" height="1" fill="#FFB000" />
  <rect x="36" y="34" width="8" height="1" fill="#F1F1F1" />
  <rect x="44" y="34" width="2" height="1" fill="#000000" />
  <rect x="30" y="35" width="2" height="1" fill="#000000" />
  <rect x="32" y="35" width="4" height="1" fill="#FFB000" />
  <rect x="36" y="35" width="8" height="1" fill="#F1F1F1" />
  <rect x="44" y="35" width="2" height="1" fill="#000000" />
  <rect x="28" y="36" width="2" height="1" fill="#000000" />
  <rect x="30" y="36" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="36" width="8" height="1" fill="#F1F1F1" />
  <rect x="42" y="36" width="2" height="1" fill="#000000" />
  <rect x="28" y="37" width="2" height="1" fill="#000000" />
  <rect x="30" y="37" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="37" width="8" height="1" fill="#F1F1F1" />
  <rect x="42" y="37" width="2" height="1" fill="#000000" />
  <rect x="26" y="38" width="2" height="1" fill="#000000" />
  <rect x="28" y="38" width="4" height="1" fill="#FFB000" />
  <rect x="32" y="38" width="8" height="1" fill="#F1F1F1" />
  <rect x="40" y="38" width="2" height="1" fill="#000000" />
  <rect x="26" y="39" width="2" height="1" fill="#000000" />
  <rect x="28" y="39" width="4" height="1" fill="#FFB000" />
  <rect x="32" y="39" width="8" height="1" fill="#F1F1F1" />
  <rect x="40" y="39" width="2" height="1" fill="#000000" />
  <rect x="24" y="40" width="2" height="1" fill="#000000" />
  <rect x="26" y="40" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="40" width="6" height="1" fill="#F1F1F1" />
  <rect x="36" y="40" width="2" height="1" fill="#FFB000" />
  <rect x="38" y="40" width="2" height="1" fill="#000000" />
  <rect x="24" y="41" width="2" height="1" fill="#000000" />
  <rect x="26" y="41" width="4" height="1" fill="#FFB000" />
  <rect x="30" y="41" width="6" height="1" fill="#F1F1F1" />
  <rect x="36" y="41" width="2" height="1" fill="#FFB000" />
  <rect x="38" y="41" width="2" height="1" fill="#000000" />
  <rect x="22" y="42" width="2" height="1" fill="#000000" />
  <rect x="24" y="42" width="4" height="1" fill="#FFB000" />
  <rect x="28" y="42" width="6" height="1" fill="#F1F1F1" />
  <rect x="34" y="42" width="2" height="1" fill="#FFB000" />
  <rect x="36" y="42" width="2" height="1" fill="#000000" />
  <rect x="22" y="43" width="2" height="1" fill="#000000" />
  <rect x="24" y="43" width="4" height="1" fill="#FFB000" />
  <rect x="28" y="43" width="6" height="1" fill="#F1F1F1" />
  <rect x="34" y="43" width="2" height="1" fill="#FFB000" />
  <rect x="36" y="43" width="2" height="1" fill="#000000" />
  <rect x="20" y="44" width="2" height="1" fill="#000000" />
  <rect x="22" y="44" width="4" height="1" fill="#FFB000" />
  <rect x="26" y="44" width="4" height="1" fill="#F1F1F1" />
  <rect x="30" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="32" y="44" width="2" height="1" fill="#000000" />
  <rect x="20" y="45" width="2" height="1" fill="#000000" />
  <rect x="22" y="45" width="4" height="1" fill="#FFB000" />
  <rect x="26" y="45" width="4" height="1" fill="#F1F1F1" />
  <rect x="30" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="32" y="45" width="2" height="1" fill="#000000" />
  <rect x="18" y="46" width="2" height="1" fill="#000000" />
  <rect x="20" y="46" width="8" height="1" fill="#FFB000" />
  <rect x="28" y="46" width="2" height="1" fill="#000000" />
  <rect x="18" y="47" width="2" height="1" fill="#000000" />
  <rect x="20" y="47" width="8" height="1" fill="#FFB000" />
  <rect x="28" y="47" width="2" height="1" fill="#000000" />
  <rect x="16" y="48" width="2" height="1" fill="#000000" />
  <rect x="18" y="48" width="6" height="1" fill="#33FF00" />
  <rect x="24" y="48" width="2" height="1" fill="#000000" />
  <rect x="16" y="49" width="2" height="1" fill="#000000" />
  <rect x="18" y="49" width="6" height="1" fill="#33FF00" />
  <rect x="24" y="49" width="2" height="1" fill="#000000" />
  <rect x="16" y="50" width="8" height="1" fill="#000000" />
  <rect x="16" y="51" width="8" height="1" fill="#000000" />
</svg>
```
