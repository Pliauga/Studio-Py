# Week 08: Web APIs and JSON — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 8 (`week-08`)
- **Lesson ID**: `week-08-pulling-real-data`
- **Title**: Web APIs and JSON
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-08.mdx`

## 2. Narrative Context (The Hook)
The fleet inventory now lives on a remote web server and incident metadata sits behind a JSON API. You fetch live responses with timeouts, handle missing keys, stream CSV text via `StringIO`, and redact IPs with regex.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Ask, Then Read the Answer**: `requests.get(url, timeout=10)`, checking `response.status_code` (`200`, `4xx`, `5xx`), deserializing with `response.json()` and `json.loads()`.
- **Waypoint 2: Be Specific, and Be Impatient**: Passing query parameters via `params={...}`, enforcing `timeout=10` to prevent indefinite hangs, and reading optional JSON fields safely with `data.get(key, default)`.
- **Waypoint 3: A File, Not a Page**: Fetching `raw.githubusercontent.com` byte URLs instead of HTML `blob` pages, and wrapping `response.text` in `io.StringIO` for `pd.read_csv()`.
- **Waypoint 4: Find by Shape, Then Bundle It**: Matching patterns with `re.search()`, `re.findall()`, and `re.sub()`; named capture groups `(?P<name>...)`; redacting IPv4 addresses; bundling state in `RecordSource`.

## 4. Key Traps & Edge Cases Covered
- Omitting `timeout=` on `requests.get()` lets a unresponsive server hang the process forever.
- Subscripting `response["login"]` directly raises `TypeError`; call `response.json()` first.
- Passing `response.text` directly to `pd.read_csv()` without `StringIO(response.text)`.
- Fetching a GitHub `blob` URL returns HTML (`<!DOCTYPE html>`) instead of raw CSV data.

## 5. Interactive Exercises & Components
- `w08-get-fallback` (`data.get('repo_count', 'unknown')`)
- `w08-stringio-rows` (`pd.read_csv(StringIO(csv_text))`)
- `w08-regex-redact` (`re.sub(r'\d+\.\d+\.\d+\.\d+', '[REDACTED]', text)`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week8_icon`)

### Strict Visual Rules Applied
- **Subject**: **APIs** — A wireframe globe with a network cable plugged into the bottom.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week8_icon.svg`](./week8_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
............KKKGGKKK............
..........KKGGGGGGGGKK..........
.........KGGKKGGGGKKGGK.........
........KGGKKGKGGKGKKGGK........
.......KGGKKKGKGGKGKKKGGK.......
.......KGGGGGGGGGGGGGGGGK.......
......KGKKKKGKKGGKKGKKKKGK......
......KGKKKKGKKGGKKGKKKKGK......
......KGKKKKGKKGGKKGKKKKGK......
......GGGGGGGGGGGGGGGGGGGG......
......KGKKKGKKKGGKKKGKKKGK......
......KGKKKKGKKGGKKGKKKKGK......
......KGKKKKGKKGGKKGKKKKGK......
......KGGGGGGGGGGGGGGGGGGK......
.......KGKKKKGKGGKGKKKKGK.......
.......KGGKKKGKGGKGKKKGGK.......
........KGGKKGKGGKGKKGGK........
.........KGGKKGGGGKKGGK.........
..........KKKKKKKKKKKK..........
...........KAWWWWWWAK...........
...........KAAAAAAAAK...........
...........KAAAAAAAAK...........
...........KAAAAAAAAK...........
...........KKKKKKKKKK...........
.............KWWWWK.............
.............KWWWWK.............
.............KWWWWK.............
.............KKKKKK.............
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="24" y="6" width="6" height="1" fill="#000000" />
  <rect x="30" y="6" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="6" width="6" height="1" fill="#000000" />
  <rect x="24" y="7" width="6" height="1" fill="#000000" />
  <rect x="30" y="7" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="7" width="6" height="1" fill="#000000" />
  <rect x="20" y="8" width="4" height="1" fill="#000000" />
  <rect x="24" y="8" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="8" width="4" height="1" fill="#000000" />
  <rect x="20" y="9" width="4" height="1" fill="#000000" />
  <rect x="24" y="9" width="16" height="1" fill="#33FF00" />
  <rect x="40" y="9" width="4" height="1" fill="#000000" />
  <rect x="18" y="10" width="2" height="1" fill="#000000" />
  <rect x="20" y="10" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="10" width="4" height="1" fill="#000000" />
  <rect x="28" y="10" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="10" width="4" height="1" fill="#000000" />
  <rect x="40" y="10" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="10" width="2" height="1" fill="#000000" />
  <rect x="18" y="11" width="2" height="1" fill="#000000" />
  <rect x="20" y="11" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="11" width="4" height="1" fill="#000000" />
  <rect x="28" y="11" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="11" width="4" height="1" fill="#000000" />
  <rect x="40" y="11" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="11" width="2" height="1" fill="#000000" />
  <rect x="16" y="12" width="2" height="1" fill="#000000" />
  <rect x="18" y="12" width="4" height="1" fill="#33FF00" />
  <rect x="22" y="12" width="4" height="1" fill="#000000" />
  <rect x="26" y="12" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="12" width="2" height="1" fill="#000000" />
  <rect x="30" y="12" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="12" width="2" height="1" fill="#000000" />
  <rect x="36" y="12" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="12" width="4" height="1" fill="#000000" />
  <rect x="42" y="12" width="4" height="1" fill="#33FF00" />
  <rect x="46" y="12" width="2" height="1" fill="#000000" />
  <rect x="16" y="13" width="2" height="1" fill="#000000" />
  <rect x="18" y="13" width="4" height="1" fill="#33FF00" />
  <rect x="22" y="13" width="4" height="1" fill="#000000" />
  <rect x="26" y="13" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="13" width="2" height="1" fill="#000000" />
  <rect x="30" y="13" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="13" width="2" height="1" fill="#000000" />
  <rect x="36" y="13" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="13" width="4" height="1" fill="#000000" />
  <rect x="42" y="13" width="4" height="1" fill="#33FF00" />
  <rect x="46" y="13" width="2" height="1" fill="#000000" />
  <rect x="14" y="14" width="2" height="1" fill="#000000" />
  <rect x="16" y="14" width="4" height="1" fill="#33FF00" />
  <rect x="20" y="14" width="6" height="1" fill="#000000" />
  <rect x="26" y="14" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="14" width="2" height="1" fill="#000000" />
  <rect x="30" y="14" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="14" width="2" height="1" fill="#000000" />
  <rect x="36" y="14" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="14" width="6" height="1" fill="#000000" />
  <rect x="44" y="14" width="4" height="1" fill="#33FF00" />
  <rect x="48" y="14" width="2" height="1" fill="#000000" />
  <rect x="14" y="15" width="2" height="1" fill="#000000" />
  <rect x="16" y="15" width="4" height="1" fill="#33FF00" />
  <rect x="20" y="15" width="6" height="1" fill="#000000" />
  <rect x="26" y="15" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="15" width="2" height="1" fill="#000000" />
  <rect x="30" y="15" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="15" width="2" height="1" fill="#000000" />
  <rect x="36" y="15" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="15" width="6" height="1" fill="#000000" />
  <rect x="44" y="15" width="4" height="1" fill="#33FF00" />
  <rect x="48" y="15" width="2" height="1" fill="#000000" />
  <rect x="14" y="16" width="2" height="1" fill="#000000" />
  <rect x="16" y="16" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="16" width="2" height="1" fill="#000000" />
  <rect x="14" y="17" width="2" height="1" fill="#000000" />
  <rect x="16" y="17" width="32" height="1" fill="#33FF00" />
  <rect x="48" y="17" width="2" height="1" fill="#000000" />
  <rect x="12" y="18" width="2" height="1" fill="#000000" />
  <rect x="14" y="18" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="18" width="8" height="1" fill="#000000" />
  <rect x="24" y="18" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="18" width="4" height="1" fill="#000000" />
  <rect x="30" y="18" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="18" width="4" height="1" fill="#000000" />
  <rect x="38" y="18" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="18" width="8" height="1" fill="#000000" />
  <rect x="48" y="18" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="18" width="2" height="1" fill="#000000" />
  <rect x="12" y="19" width="2" height="1" fill="#000000" />
  <rect x="14" y="19" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="19" width="8" height="1" fill="#000000" />
  <rect x="24" y="19" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="19" width="4" height="1" fill="#000000" />
  <rect x="30" y="19" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="19" width="4" height="1" fill="#000000" />
  <rect x="38" y="19" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="19" width="8" height="1" fill="#000000" />
  <rect x="48" y="19" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="19" width="2" height="1" fill="#000000" />
  <rect x="12" y="20" width="2" height="1" fill="#000000" />
  <rect x="14" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="20" width="8" height="1" fill="#000000" />
  <rect x="24" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="20" width="4" height="1" fill="#000000" />
  <rect x="30" y="20" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="20" width="4" height="1" fill="#000000" />
  <rect x="38" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="20" width="8" height="1" fill="#000000" />
  <rect x="48" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="20" width="2" height="1" fill="#000000" />
  <rect x="12" y="21" width="2" height="1" fill="#000000" />
  <rect x="14" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="21" width="8" height="1" fill="#000000" />
  <rect x="24" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="21" width="4" height="1" fill="#000000" />
  <rect x="30" y="21" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="21" width="4" height="1" fill="#000000" />
  <rect x="38" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="21" width="8" height="1" fill="#000000" />
  <rect x="48" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="21" width="2" height="1" fill="#000000" />
  <rect x="12" y="22" width="2" height="1" fill="#000000" />
  <rect x="14" y="22" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="22" width="8" height="1" fill="#000000" />
  <rect x="24" y="22" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="22" width="4" height="1" fill="#000000" />
  <rect x="30" y="22" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="22" width="4" height="1" fill="#000000" />
  <rect x="38" y="22" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="22" width="8" height="1" fill="#000000" />
  <rect x="48" y="22" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="22" width="2" height="1" fill="#000000" />
  <rect x="12" y="23" width="2" height="1" fill="#000000" />
  <rect x="14" y="23" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="23" width="8" height="1" fill="#000000" />
  <rect x="24" y="23" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="23" width="4" height="1" fill="#000000" />
  <rect x="30" y="23" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="23" width="4" height="1" fill="#000000" />
  <rect x="38" y="23" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="23" width="8" height="1" fill="#000000" />
  <rect x="48" y="23" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="23" width="2" height="1" fill="#000000" />
  <rect x="12" y="24" width="40" height="1" fill="#33FF00" />
  <rect x="12" y="25" width="40" height="1" fill="#33FF00" />
  <rect x="12" y="26" width="2" height="1" fill="#000000" />
  <rect x="14" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="26" width="6" height="1" fill="#000000" />
  <rect x="22" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="26" width="6" height="1" fill="#000000" />
  <rect x="30" y="26" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="26" width="6" height="1" fill="#000000" />
  <rect x="40" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="42" y="26" width="6" height="1" fill="#000000" />
  <rect x="48" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="26" width="2" height="1" fill="#000000" />
  <rect x="12" y="27" width="2" height="1" fill="#000000" />
  <rect x="14" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="27" width="6" height="1" fill="#000000" />
  <rect x="22" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="27" width="6" height="1" fill="#000000" />
  <rect x="30" y="27" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="27" width="6" height="1" fill="#000000" />
  <rect x="40" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="42" y="27" width="6" height="1" fill="#000000" />
  <rect x="48" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="27" width="2" height="1" fill="#000000" />
  <rect x="12" y="28" width="2" height="1" fill="#000000" />
  <rect x="14" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="28" width="8" height="1" fill="#000000" />
  <rect x="24" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="28" width="4" height="1" fill="#000000" />
  <rect x="30" y="28" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="28" width="4" height="1" fill="#000000" />
  <rect x="38" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="28" width="8" height="1" fill="#000000" />
  <rect x="48" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="28" width="2" height="1" fill="#000000" />
  <rect x="12" y="29" width="2" height="1" fill="#000000" />
  <rect x="14" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="29" width="8" height="1" fill="#000000" />
  <rect x="24" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="29" width="4" height="1" fill="#000000" />
  <rect x="30" y="29" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="29" width="4" height="1" fill="#000000" />
  <rect x="38" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="29" width="8" height="1" fill="#000000" />
  <rect x="48" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="29" width="2" height="1" fill="#000000" />
  <rect x="12" y="30" width="2" height="1" fill="#000000" />
  <rect x="14" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="30" width="8" height="1" fill="#000000" />
  <rect x="24" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="30" width="4" height="1" fill="#000000" />
  <rect x="30" y="30" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="30" width="4" height="1" fill="#000000" />
  <rect x="38" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="30" width="8" height="1" fill="#000000" />
  <rect x="48" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="30" width="2" height="1" fill="#000000" />
  <rect x="12" y="31" width="2" height="1" fill="#000000" />
  <rect x="14" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="31" width="8" height="1" fill="#000000" />
  <rect x="24" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="26" y="31" width="4" height="1" fill="#000000" />
  <rect x="30" y="31" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="31" width="4" height="1" fill="#000000" />
  <rect x="38" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="40" y="31" width="8" height="1" fill="#000000" />
  <rect x="48" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="31" width="2" height="1" fill="#000000" />
  <rect x="12" y="32" width="2" height="1" fill="#000000" />
  <rect x="14" y="32" width="36" height="1" fill="#33FF00" />
  <rect x="50" y="32" width="2" height="1" fill="#000000" />
  <rect x="12" y="33" width="2" height="1" fill="#000000" />
  <rect x="14" y="33" width="36" height="1" fill="#33FF00" />
  <rect x="50" y="33" width="2" height="1" fill="#000000" />
  <rect x="14" y="34" width="2" height="1" fill="#000000" />
  <rect x="16" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="34" width="8" height="1" fill="#000000" />
  <rect x="26" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="34" width="2" height="1" fill="#000000" />
  <rect x="30" y="34" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="34" width="2" height="1" fill="#000000" />
  <rect x="36" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="34" width="8" height="1" fill="#000000" />
  <rect x="46" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="34" width="2" height="1" fill="#000000" />
  <rect x="14" y="35" width="2" height="1" fill="#000000" />
  <rect x="16" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="35" width="8" height="1" fill="#000000" />
  <rect x="26" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="35" width="2" height="1" fill="#000000" />
  <rect x="30" y="35" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="35" width="2" height="1" fill="#000000" />
  <rect x="36" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="35" width="8" height="1" fill="#000000" />
  <rect x="46" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="35" width="2" height="1" fill="#000000" />
  <rect x="14" y="36" width="2" height="1" fill="#000000" />
  <rect x="16" y="36" width="4" height="1" fill="#33FF00" />
  <rect x="20" y="36" width="6" height="1" fill="#000000" />
  <rect x="26" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="36" width="2" height="1" fill="#000000" />
  <rect x="30" y="36" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="36" width="2" height="1" fill="#000000" />
  <rect x="36" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="36" width="6" height="1" fill="#000000" />
  <rect x="44" y="36" width="4" height="1" fill="#33FF00" />
  <rect x="48" y="36" width="2" height="1" fill="#000000" />
  <rect x="14" y="37" width="2" height="1" fill="#000000" />
  <rect x="16" y="37" width="4" height="1" fill="#33FF00" />
  <rect x="20" y="37" width="6" height="1" fill="#000000" />
  <rect x="26" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="37" width="2" height="1" fill="#000000" />
  <rect x="30" y="37" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="37" width="2" height="1" fill="#000000" />
  <rect x="36" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="37" width="6" height="1" fill="#000000" />
  <rect x="44" y="37" width="4" height="1" fill="#33FF00" />
  <rect x="48" y="37" width="2" height="1" fill="#000000" />
  <rect x="16" y="38" width="2" height="1" fill="#000000" />
  <rect x="18" y="38" width="4" height="1" fill="#33FF00" />
  <rect x="22" y="38" width="4" height="1" fill="#000000" />
  <rect x="26" y="38" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="38" width="2" height="1" fill="#000000" />
  <rect x="30" y="38" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="38" width="2" height="1" fill="#000000" />
  <rect x="36" y="38" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="38" width="4" height="1" fill="#000000" />
  <rect x="42" y="38" width="4" height="1" fill="#33FF00" />
  <rect x="46" y="38" width="2" height="1" fill="#000000" />
  <rect x="16" y="39" width="2" height="1" fill="#000000" />
  <rect x="18" y="39" width="4" height="1" fill="#33FF00" />
  <rect x="22" y="39" width="4" height="1" fill="#000000" />
  <rect x="26" y="39" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="39" width="2" height="1" fill="#000000" />
  <rect x="30" y="39" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="39" width="2" height="1" fill="#000000" />
  <rect x="36" y="39" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="39" width="4" height="1" fill="#000000" />
  <rect x="42" y="39" width="4" height="1" fill="#33FF00" />
  <rect x="46" y="39" width="2" height="1" fill="#000000" />
  <rect x="18" y="40" width="2" height="1" fill="#000000" />
  <rect x="20" y="40" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="40" width="4" height="1" fill="#000000" />
  <rect x="28" y="40" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="40" width="4" height="1" fill="#000000" />
  <rect x="40" y="40" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="40" width="2" height="1" fill="#000000" />
  <rect x="18" y="41" width="2" height="1" fill="#000000" />
  <rect x="20" y="41" width="4" height="1" fill="#33FF00" />
  <rect x="24" y="41" width="4" height="1" fill="#000000" />
  <rect x="28" y="41" width="8" height="1" fill="#33FF00" />
  <rect x="36" y="41" width="4" height="1" fill="#000000" />
  <rect x="40" y="41" width="4" height="1" fill="#33FF00" />
  <rect x="44" y="41" width="2" height="1" fill="#000000" />
  <rect x="20" y="42" width="24" height="1" fill="#000000" />
  <rect x="20" y="43" width="24" height="1" fill="#000000" />
  <rect x="22" y="44" width="2" height="1" fill="#000000" />
  <rect x="24" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="44" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="44" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="44" width="2" height="1" fill="#000000" />
  <rect x="22" y="45" width="2" height="1" fill="#000000" />
  <rect x="24" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="45" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="45" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="45" width="2" height="1" fill="#000000" />
  <rect x="22" y="46" width="2" height="1" fill="#000000" />
  <rect x="24" y="46" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="46" width="2" height="1" fill="#000000" />
  <rect x="22" y="47" width="2" height="1" fill="#000000" />
  <rect x="24" y="47" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="47" width="2" height="1" fill="#000000" />
  <rect x="22" y="48" width="2" height="1" fill="#000000" />
  <rect x="24" y="48" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="48" width="2" height="1" fill="#000000" />
  <rect x="22" y="49" width="2" height="1" fill="#000000" />
  <rect x="24" y="49" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="49" width="2" height="1" fill="#000000" />
  <rect x="22" y="50" width="2" height="1" fill="#000000" />
  <rect x="24" y="50" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="50" width="2" height="1" fill="#000000" />
  <rect x="22" y="51" width="2" height="1" fill="#000000" />
  <rect x="24" y="51" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="51" width="2" height="1" fill="#000000" />
  <rect x="22" y="52" width="20" height="1" fill="#000000" />
  <rect x="22" y="53" width="20" height="1" fill="#000000" />
  <rect x="26" y="54" width="2" height="1" fill="#000000" />
  <rect x="28" y="54" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="54" width="2" height="1" fill="#000000" />
  <rect x="26" y="55" width="2" height="1" fill="#000000" />
  <rect x="28" y="55" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="55" width="2" height="1" fill="#000000" />
  <rect x="26" y="56" width="2" height="1" fill="#000000" />
  <rect x="28" y="56" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="56" width="2" height="1" fill="#000000" />
  <rect x="26" y="57" width="2" height="1" fill="#000000" />
  <rect x="28" y="57" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="57" width="2" height="1" fill="#000000" />
  <rect x="26" y="58" width="2" height="1" fill="#000000" />
  <rect x="28" y="58" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="58" width="2" height="1" fill="#000000" />
  <rect x="26" y="59" width="2" height="1" fill="#000000" />
  <rect x="28" y="59" width="8" height="1" fill="#F1F1F1" />
  <rect x="36" y="59" width="2" height="1" fill="#000000" />
  <rect x="26" y="60" width="12" height="1" fill="#000000" />
  <rect x="26" y="61" width="12" height="1" fill="#000000" />
</svg>
```
