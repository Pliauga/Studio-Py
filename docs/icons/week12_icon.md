# Week 12: Calling an LLM API — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 12 (`week-12`)
- **Lesson ID**: `week-12-intelligence-and-deployment`
- **Title**: Calling an LLM API
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-12.mdx`

## 2. Narrative Context (The Hook)
To spare an operator from reading 40 rows at 3 AM, you add an optional LLM pass that summarizes the worst host—handling missing API keys gracefully, resending stateless conversation history, mocking network tests, and checking deployment files.

## 3. Material Taught (Waypoints)
- **Waypoint 1: A key can be optional, a crash cannot**: Reading `os.environ.get("OPENAI_API_KEY")` before constructing `OpenAI(api_key=..., timeout=10.0)` so missing optional keys return `None` without crashing the core dashboard.
- **Waypoint 2: The API remembers nothing you do not resend**: Stateless `messages` list (`system`, `user`, `assistant`), appending `{"role": "assistant", "content": reply}` to preserve conversation memory, and popping unanswered turns on `RateLimitError` / `AuthenticationError`.
- **Waypoint 3: Test the edge, fake the network**: `pytest` functions (`test_`), `assert`, `@pytest.mark.parametrize` on threshold boundaries (`49`, `50`, `99`, `100`), and mocking API clients with `unittest.mock.MagicMock`.
- **Waypoint 4: What the cloud needs, and what never leaves the laptop**: Pre-flight deployment checks for `requirements.txt` and `.gitignore` (`*.db`, `.env`, `__pycache__/`) before pushing to cloud hosting.

## 4. Key Traps & Edge Cases Covered
- Calling `OpenAI()` before checking if `OPENAI_API_KEY` is set raises `OpenAIError` and crashes optional features.
- Forgetting to append the `assistant` reply leaves the next API call with no memory of prior answers.
- Testing only comfortable middle values (`150`) instead of exact threshold boundaries (`49`, `50`, `99`, `100`), or calling the real paid API inside unit tests.
- Committing `.db` or `.env` files to git history before `.gitignore` is in place.

## 5. Interactive Exercises & Components
- `w12-resend-history` (appending `{'role': 'assistant', 'content': reply}` to `history`)
- `w12-threshold-edge` (fixing `>= limit` boundary and adding `assert status_of(99)` / `status_of(100)`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week12_icon`)

### Strict Visual Rules Applied
- **Subject**: **LLM/AI** — A glowing circuit brain inside a speech bubble.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week12_icon.svg`](./week12_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KWWKKKKKKKKKKKKKKKKKKKKKKWWK..
..KWWKKKKKKKKKKKKKKKKKKKKKKWWK..
..KWWKKKKKKKKKKKKKKKKKKKKKKWWK..
..KWWKKKKGGGGGGKKGGGGGGKKKKWWK..
..KWWKKKGKKKKKKGGKKKKKKGKKKWWK..
..KWWKKGKKAAKKKKKKKKAAKKGKKWWK..
..KWWKKGKGGGGKKKKKKGGGGKGKKWWK..
..KWWKKGKKKKAGGGGGGAKKKKGKKWWK..
..KWWKKGKGGGGKKKKKKGGGGKGKKWWK..
..KWWKKGKKAAKKKKKKKKAAKKGKKWWK..
..KWWKKKGKKKKKKGGKKKKKKGKKKWWK..
..KWWKKKKGGGGGGKKGGGGGGKKKKWWK..
..KWWKKKKKKKKKKKKKKKKKKKKKKWWK..
..KWWKKKKKKKKKKKKKKKKKKKKKKWWK..
..KWWKKKKKKKKKKKKKKKKKKKKKKWWK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..
..KKKKKWWWWKKKKKKKKKKKKKKKKKKK..
......KWWWKK....................
......KWWKK.....................
......KKKK......................
................................
................................
................................
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
  <rect x="6" y="10" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="10" width="2" height="1" fill="#000000" />
  <rect x="4" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="11" width="2" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="12" width="44" height="1" fill="#000000" />
  <rect x="54" y="12" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="13" width="44" height="1" fill="#000000" />
  <rect x="54" y="13" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="14" width="44" height="1" fill="#000000" />
  <rect x="54" y="14" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="15" width="44" height="1" fill="#000000" />
  <rect x="54" y="15" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="16" width="44" height="1" fill="#000000" />
  <rect x="54" y="16" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="16" width="2" height="1" fill="#000000" />
  <rect x="4" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="17" width="44" height="1" fill="#000000" />
  <rect x="54" y="17" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="17" width="2" height="1" fill="#000000" />
  <rect x="4" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="18" width="8" height="1" fill="#000000" />
  <rect x="18" y="18" width="12" height="1" fill="#33FF00" />
  <rect x="30" y="18" width="4" height="1" fill="#000000" />
  <rect x="34" y="18" width="12" height="1" fill="#33FF00" />
  <rect x="46" y="18" width="8" height="1" fill="#000000" />
  <rect x="54" y="18" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="18" width="2" height="1" fill="#000000" />
  <rect x="4" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="19" width="8" height="1" fill="#000000" />
  <rect x="18" y="19" width="12" height="1" fill="#33FF00" />
  <rect x="30" y="19" width="4" height="1" fill="#000000" />
  <rect x="34" y="19" width="12" height="1" fill="#33FF00" />
  <rect x="46" y="19" width="8" height="1" fill="#000000" />
  <rect x="54" y="19" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="19" width="2" height="1" fill="#000000" />
  <rect x="4" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="20" width="6" height="1" fill="#000000" />
  <rect x="16" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="20" width="12" height="1" fill="#000000" />
  <rect x="30" y="20" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="20" width="12" height="1" fill="#000000" />
  <rect x="46" y="20" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="20" width="6" height="1" fill="#000000" />
  <rect x="54" y="20" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="20" width="2" height="1" fill="#000000" />
  <rect x="4" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="21" width="6" height="1" fill="#000000" />
  <rect x="16" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="21" width="12" height="1" fill="#000000" />
  <rect x="30" y="21" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="21" width="12" height="1" fill="#000000" />
  <rect x="46" y="21" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="21" width="6" height="1" fill="#000000" />
  <rect x="54" y="21" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="21" width="2" height="1" fill="#000000" />
  <rect x="4" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="22" width="4" height="1" fill="#000000" />
  <rect x="14" y="22" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="22" width="4" height="1" fill="#000000" />
  <rect x="20" y="22" width="4" height="1" fill="#FFB000" />
  <rect x="24" y="22" width="16" height="1" fill="#000000" />
  <rect x="40" y="22" width="4" height="1" fill="#FFB000" />
  <rect x="44" y="22" width="4" height="1" fill="#000000" />
  <rect x="48" y="22" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="22" width="4" height="1" fill="#000000" />
  <rect x="54" y="22" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="22" width="2" height="1" fill="#000000" />
  <rect x="4" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="23" width="4" height="1" fill="#000000" />
  <rect x="14" y="23" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="23" width="4" height="1" fill="#000000" />
  <rect x="20" y="23" width="4" height="1" fill="#FFB000" />
  <rect x="24" y="23" width="16" height="1" fill="#000000" />
  <rect x="40" y="23" width="4" height="1" fill="#FFB000" />
  <rect x="44" y="23" width="4" height="1" fill="#000000" />
  <rect x="48" y="23" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="23" width="4" height="1" fill="#000000" />
  <rect x="54" y="23" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="23" width="2" height="1" fill="#000000" />
  <rect x="4" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="24" width="4" height="1" fill="#000000" />
  <rect x="14" y="24" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="24" width="2" height="1" fill="#000000" />
  <rect x="18" y="24" width="8" height="1" fill="#33FF00" />
  <rect x="26" y="24" width="12" height="1" fill="#000000" />
  <rect x="38" y="24" width="8" height="1" fill="#33FF00" />
  <rect x="46" y="24" width="2" height="1" fill="#000000" />
  <rect x="48" y="24" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="24" width="4" height="1" fill="#000000" />
  <rect x="54" y="24" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="24" width="2" height="1" fill="#000000" />
  <rect x="4" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="25" width="4" height="1" fill="#000000" />
  <rect x="14" y="25" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="25" width="2" height="1" fill="#000000" />
  <rect x="18" y="25" width="8" height="1" fill="#33FF00" />
  <rect x="26" y="25" width="12" height="1" fill="#000000" />
  <rect x="38" y="25" width="8" height="1" fill="#33FF00" />
  <rect x="46" y="25" width="2" height="1" fill="#000000" />
  <rect x="48" y="25" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="25" width="4" height="1" fill="#000000" />
  <rect x="54" y="25" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="25" width="2" height="1" fill="#000000" />
  <rect x="4" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="26" width="4" height="1" fill="#000000" />
  <rect x="14" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="26" width="8" height="1" fill="#000000" />
  <rect x="24" y="26" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="26" width="12" height="1" fill="#33FF00" />
  <rect x="38" y="26" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="26" width="8" height="1" fill="#000000" />
  <rect x="48" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="26" width="4" height="1" fill="#000000" />
  <rect x="54" y="26" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="26" width="2" height="1" fill="#000000" />
  <rect x="4" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="27" width="4" height="1" fill="#000000" />
  <rect x="14" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="27" width="8" height="1" fill="#000000" />
  <rect x="24" y="27" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="27" width="12" height="1" fill="#33FF00" />
  <rect x="38" y="27" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="27" width="8" height="1" fill="#000000" />
  <rect x="48" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="27" width="4" height="1" fill="#000000" />
  <rect x="54" y="27" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="27" width="2" height="1" fill="#000000" />
  <rect x="4" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="28" width="4" height="1" fill="#000000" />
  <rect x="14" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="28" width="2" height="1" fill="#000000" />
  <rect x="18" y="28" width="8" height="1" fill="#33FF00" />
  <rect x="26" y="28" width="12" height="1" fill="#000000" />
  <rect x="38" y="28" width="8" height="1" fill="#33FF00" />
  <rect x="46" y="28" width="2" height="1" fill="#000000" />
  <rect x="48" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="28" width="4" height="1" fill="#000000" />
  <rect x="54" y="28" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="28" width="2" height="1" fill="#000000" />
  <rect x="4" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="29" width="4" height="1" fill="#000000" />
  <rect x="14" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="29" width="2" height="1" fill="#000000" />
  <rect x="18" y="29" width="8" height="1" fill="#33FF00" />
  <rect x="26" y="29" width="12" height="1" fill="#000000" />
  <rect x="38" y="29" width="8" height="1" fill="#33FF00" />
  <rect x="46" y="29" width="2" height="1" fill="#000000" />
  <rect x="48" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="29" width="4" height="1" fill="#000000" />
  <rect x="54" y="29" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="29" width="2" height="1" fill="#000000" />
  <rect x="4" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="30" width="4" height="1" fill="#000000" />
  <rect x="14" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="30" width="4" height="1" fill="#000000" />
  <rect x="20" y="30" width="4" height="1" fill="#FFB000" />
  <rect x="24" y="30" width="16" height="1" fill="#000000" />
  <rect x="40" y="30" width="4" height="1" fill="#FFB000" />
  <rect x="44" y="30" width="4" height="1" fill="#000000" />
  <rect x="48" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="30" width="4" height="1" fill="#000000" />
  <rect x="54" y="30" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="30" width="2" height="1" fill="#000000" />
  <rect x="4" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="31" width="4" height="1" fill="#000000" />
  <rect x="14" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="16" y="31" width="4" height="1" fill="#000000" />
  <rect x="20" y="31" width="4" height="1" fill="#FFB000" />
  <rect x="24" y="31" width="16" height="1" fill="#000000" />
  <rect x="40" y="31" width="4" height="1" fill="#FFB000" />
  <rect x="44" y="31" width="4" height="1" fill="#000000" />
  <rect x="48" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="50" y="31" width="4" height="1" fill="#000000" />
  <rect x="54" y="31" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="31" width="2" height="1" fill="#000000" />
  <rect x="4" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="32" width="6" height="1" fill="#000000" />
  <rect x="16" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="32" width="12" height="1" fill="#000000" />
  <rect x="30" y="32" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="32" width="12" height="1" fill="#000000" />
  <rect x="46" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="32" width="6" height="1" fill="#000000" />
  <rect x="54" y="32" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="32" width="2" height="1" fill="#000000" />
  <rect x="4" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="33" width="6" height="1" fill="#000000" />
  <rect x="16" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="18" y="33" width="12" height="1" fill="#000000" />
  <rect x="30" y="33" width="4" height="1" fill="#33FF00" />
  <rect x="34" y="33" width="12" height="1" fill="#000000" />
  <rect x="46" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="48" y="33" width="6" height="1" fill="#000000" />
  <rect x="54" y="33" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="33" width="2" height="1" fill="#000000" />
  <rect x="4" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="34" width="8" height="1" fill="#000000" />
  <rect x="18" y="34" width="12" height="1" fill="#33FF00" />
  <rect x="30" y="34" width="4" height="1" fill="#000000" />
  <rect x="34" y="34" width="12" height="1" fill="#33FF00" />
  <rect x="46" y="34" width="8" height="1" fill="#000000" />
  <rect x="54" y="34" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="34" width="2" height="1" fill="#000000" />
  <rect x="4" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="35" width="8" height="1" fill="#000000" />
  <rect x="18" y="35" width="12" height="1" fill="#33FF00" />
  <rect x="30" y="35" width="4" height="1" fill="#000000" />
  <rect x="34" y="35" width="12" height="1" fill="#33FF00" />
  <rect x="46" y="35" width="8" height="1" fill="#000000" />
  <rect x="54" y="35" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="35" width="2" height="1" fill="#000000" />
  <rect x="4" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="36" width="44" height="1" fill="#000000" />
  <rect x="54" y="36" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="36" width="2" height="1" fill="#000000" />
  <rect x="4" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="37" width="44" height="1" fill="#000000" />
  <rect x="54" y="37" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="37" width="2" height="1" fill="#000000" />
  <rect x="4" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="38" width="44" height="1" fill="#000000" />
  <rect x="54" y="38" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="38" width="2" height="1" fill="#000000" />
  <rect x="4" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="39" width="44" height="1" fill="#000000" />
  <rect x="54" y="39" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="39" width="2" height="1" fill="#000000" />
  <rect x="4" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="40" width="44" height="1" fill="#000000" />
  <rect x="54" y="40" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="40" width="2" height="1" fill="#000000" />
  <rect x="4" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="41" width="44" height="1" fill="#000000" />
  <rect x="54" y="41" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="41" width="2" height="1" fill="#000000" />
  <rect x="4" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="42" width="2" height="1" fill="#000000" />
  <rect x="4" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="43" width="2" height="1" fill="#000000" />
  <rect x="4" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="44" width="2" height="1" fill="#000000" />
  <rect x="4" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="52" height="1" fill="#F1F1F1" />
  <rect x="58" y="45" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="10" height="1" fill="#000000" />
  <rect x="14" y="46" width="8" height="1" fill="#F1F1F1" />
  <rect x="22" y="46" width="38" height="1" fill="#000000" />
  <rect x="4" y="47" width="10" height="1" fill="#000000" />
  <rect x="14" y="47" width="8" height="1" fill="#F1F1F1" />
  <rect x="22" y="47" width="38" height="1" fill="#000000" />
  <rect x="12" y="48" width="2" height="1" fill="#000000" />
  <rect x="14" y="48" width="6" height="1" fill="#F1F1F1" />
  <rect x="20" y="48" width="4" height="1" fill="#000000" />
  <rect x="12" y="49" width="2" height="1" fill="#000000" />
  <rect x="14" y="49" width="6" height="1" fill="#F1F1F1" />
  <rect x="20" y="49" width="4" height="1" fill="#000000" />
  <rect x="12" y="50" width="2" height="1" fill="#000000" />
  <rect x="14" y="50" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="50" width="4" height="1" fill="#000000" />
  <rect x="12" y="51" width="2" height="1" fill="#000000" />
  <rect x="14" y="51" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="51" width="4" height="1" fill="#000000" />
  <rect x="12" y="52" width="8" height="1" fill="#000000" />
  <rect x="12" y="53" width="8" height="1" fill="#000000" />
</svg>
```
