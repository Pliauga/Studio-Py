# Week 18: Decorators and Context Managers — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 18 (`week-18`)
- **Lesson ID**: `week-18-decorators-and-context-managers`
- **Title**: Decorators and Context Managers
- **Estimated Duration**: 20 minutes
- **Source File**: `src/content/lessons/week-18.mdx`

## 2. Narrative Context (The Hook)
Twenty ops functions are cluttered with copy-pasted retry loops, timing logs, and lockfile teardown. You extract cross-cutting behavior into `@decorator` wrappers, `@retry(attempts=3)` factories, `@contextmanager` blocks, and `@lru_cache`.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Functions Are Objects You Can Wrap**: Higher-order functions, `@decorator` syntax, `wrapper(*args, **kwargs)`, and preserving `__name__`/docstrings with `@functools.wraps(func)`.
- **Waypoint 2: Decorators That Take Arguments (Retries)**: Three-layer decorator factories (`def retry(attempts=3): def decorator(func): def wrapper(*args, **kwargs): ...`), catching transient `ConnectionError`s, and re-raising on final failure.
- **Waypoint 3: Custom Context Managers with `@contextmanager`**: Using `@contextlib.contextmanager` with setup before `yield` and guaranteed teardown inside a `try: yield ... finally:` block.
- **Waypoint 4: Memoization with `functools.lru_cache`**: Caching pure function outputs in `O(1)` lookup time with `@functools.lru_cache`, `.cache_info()`, and `.cache_clear()`.

## 4. Key Traps & Edge Cases Covered
- Omitting `@functools.wraps(func)` replaces the decorated function's `__name__` with `"wrapper"`.
- Forgetting `return func(*args, **kwargs)` inside `wrapper` silently discards the wrapped function's return value.
- Omitting `try: ... finally:` around `yield` in a `@contextmanager` skips cleanup whenever the `with` body raises an exception.
- Catching bare `Exception` in `@retry` retries permanent programming bugs (`NameError`, `ValueError`) instead of transient I/O errors.

## 5. Interactive Exercises & Components
- `w18-basic-decorator` (`@clamp_percent` with `@functools.wraps` and `min(..., 100.0)`)
- `w18-retry-counter` (`@retry(attempts=3)` decorator factory catching `ConnectionError`)
- `w18-contextmanager-cleanup` (`@contextmanager` `host_lock` with `try: yield ... finally: locks.remove(...)`)
- `w18-lru-cache-hits` (`@lru_cache` memoizing `parse_tag`)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week18_icon`)

### Strict Visual Rules Applied
- **Subject**: **Decorators** — A golden @ symbol wrapping around a glowing orb.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week18_icon.svg`](./week18_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
....KKKKKKKKKKKKKKKKKKKKKKKK....
...KKAAAAAAAAAAAAAAAAAAAAAAKK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAAAAAAAAAAAAAAAAAAAAAAAAK...
...KAAAKKKKKKKKKKKKKKKKKKAAAK...
...KAAAKKKKKKKKKKKKKKKKKKAAAK...
...KAAAKKKKKKKKKKKKKKKKKKAAAK...
...KAAAKKKKKKKKKKKKKKKKKKAAAK...
...KAAAKKKKGGGGGGGGGKKKKKKKKK...
...KAAAKKKKGWWWWGGGGKAAAAAAAK...
...KAAAKKKKGWWWWGGGGKAAAAAAAK...
...KAAAKKKKGWWWWGGGGKAAAAAAAK...
...KAAAKKKKGWWWWGGGGKAAAAAAAK...
...KAAAKKKKGGGGGGGGGKAAAAAAAK...
...KAAAKKKKGGGGGGGGGKAAAAAAAK...
...KAAAKKKKGGGGGGGGGKAAAAAAAK...
...KAAAKKKKGGGGGKKKKKKKKKKKKK...
...KAAAKKKKGGGGGKAAAAAAAAAAAK...
...KAAAKKKKKKKKKKAAAAAAAAAAAK...
...KAAAKKKKKKKKKKAAAAAAAAAAAK...
...KAAAKKKKKKKKKKKKKKKKK........
...KAAAKKKKKKKKKKKKKKKKKK.......
...KAAAAAAAAAAAAAAAAAAAA........
...KAAAAAAAAAAAAAAAAAAAA........
...KKAAAAAAAAAAAAAAAAAAA........
....KKKKKKKKKKKKKKKKKKKK........
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="8" y="6" width="48" height="1" fill="#000000" />
  <rect x="8" y="7" width="48" height="1" fill="#000000" />
  <rect x="6" y="8" width="4" height="1" fill="#000000" />
  <rect x="10" y="8" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="8" width="4" height="1" fill="#000000" />
  <rect x="6" y="9" width="4" height="1" fill="#000000" />
  <rect x="10" y="9" width="44" height="1" fill="#FFB000" />
  <rect x="54" y="9" width="4" height="1" fill="#000000" />
  <rect x="6" y="10" width="2" height="1" fill="#000000" />
  <rect x="8" y="10" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="10" width="2" height="1" fill="#000000" />
  <rect x="6" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="11" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="11" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="48" height="1" fill="#FFB000" />
  <rect x="56" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="2" height="1" fill="#000000" />
  <rect x="8" y="14" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="14" width="36" height="1" fill="#000000" />
  <rect x="50" y="14" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="2" height="1" fill="#000000" />
  <rect x="8" y="15" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="15" width="36" height="1" fill="#000000" />
  <rect x="50" y="15" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="2" height="1" fill="#000000" />
  <rect x="8" y="16" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="16" width="36" height="1" fill="#000000" />
  <rect x="50" y="16" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="2" height="1" fill="#000000" />
  <rect x="8" y="17" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="17" width="36" height="1" fill="#000000" />
  <rect x="50" y="17" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="18" width="36" height="1" fill="#000000" />
  <rect x="50" y="18" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="18" width="2" height="1" fill="#000000" />
  <rect x="6" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="19" width="36" height="1" fill="#000000" />
  <rect x="50" y="19" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="19" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="20" width="36" height="1" fill="#000000" />
  <rect x="50" y="20" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="21" width="36" height="1" fill="#000000" />
  <rect x="50" y="21" width="6" height="1" fill="#FFB000" />
  <rect x="56" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="22" width="8" height="1" fill="#000000" />
  <rect x="22" y="22" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="22" width="18" height="1" fill="#000000" />
  <rect x="6" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="23" width="8" height="1" fill="#000000" />
  <rect x="22" y="23" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="23" width="18" height="1" fill="#000000" />
  <rect x="6" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="24" width="8" height="1" fill="#000000" />
  <rect x="22" y="24" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="24" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="24" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="24" width="2" height="1" fill="#000000" />
  <rect x="42" y="24" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="25" width="8" height="1" fill="#000000" />
  <rect x="22" y="25" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="25" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="25" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="25" width="2" height="1" fill="#000000" />
  <rect x="42" y="25" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="26" width="8" height="1" fill="#000000" />
  <rect x="22" y="26" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="26" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="26" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="26" width="2" height="1" fill="#000000" />
  <rect x="42" y="26" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="27" width="8" height="1" fill="#000000" />
  <rect x="22" y="27" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="27" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="27" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="27" width="2" height="1" fill="#000000" />
  <rect x="42" y="27" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="2" height="1" fill="#000000" />
  <rect x="8" y="28" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="28" width="8" height="1" fill="#000000" />
  <rect x="22" y="28" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="28" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="28" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="28" width="2" height="1" fill="#000000" />
  <rect x="42" y="28" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="2" height="1" fill="#000000" />
  <rect x="8" y="29" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="29" width="8" height="1" fill="#000000" />
  <rect x="22" y="29" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="29" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="29" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="29" width="2" height="1" fill="#000000" />
  <rect x="42" y="29" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="2" height="1" fill="#000000" />
  <rect x="8" y="30" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="30" width="8" height="1" fill="#000000" />
  <rect x="22" y="30" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="30" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="30" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="30" width="2" height="1" fill="#000000" />
  <rect x="42" y="30" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="2" height="1" fill="#000000" />
  <rect x="8" y="31" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="31" width="8" height="1" fill="#000000" />
  <rect x="22" y="31" width="2" height="1" fill="#33FF00" />
  <rect x="24" y="31" width="8" height="1" fill="#F1F1F1" />
  <rect x="32" y="31" width="8" height="1" fill="#33FF00" />
  <rect x="40" y="31" width="2" height="1" fill="#000000" />
  <rect x="42" y="31" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="2" height="1" fill="#000000" />
  <rect x="8" y="32" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="32" width="8" height="1" fill="#000000" />
  <rect x="22" y="32" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="32" width="2" height="1" fill="#000000" />
  <rect x="42" y="32" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="2" height="1" fill="#000000" />
  <rect x="8" y="33" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="33" width="8" height="1" fill="#000000" />
  <rect x="22" y="33" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="33" width="2" height="1" fill="#000000" />
  <rect x="42" y="33" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="2" height="1" fill="#000000" />
  <rect x="8" y="34" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="34" width="8" height="1" fill="#000000" />
  <rect x="22" y="34" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="34" width="2" height="1" fill="#000000" />
  <rect x="42" y="34" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="2" height="1" fill="#000000" />
  <rect x="8" y="35" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="35" width="8" height="1" fill="#000000" />
  <rect x="22" y="35" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="35" width="2" height="1" fill="#000000" />
  <rect x="42" y="35" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="2" height="1" fill="#000000" />
  <rect x="8" y="36" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="36" width="8" height="1" fill="#000000" />
  <rect x="22" y="36" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="36" width="2" height="1" fill="#000000" />
  <rect x="42" y="36" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="2" height="1" fill="#000000" />
  <rect x="8" y="37" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="37" width="8" height="1" fill="#000000" />
  <rect x="22" y="37" width="18" height="1" fill="#33FF00" />
  <rect x="40" y="37" width="2" height="1" fill="#000000" />
  <rect x="42" y="37" width="14" height="1" fill="#FFB000" />
  <rect x="56" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="2" height="1" fill="#000000" />
  <rect x="8" y="38" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="38" width="8" height="1" fill="#000000" />
  <rect x="22" y="38" width="10" height="1" fill="#33FF00" />
  <rect x="32" y="38" width="26" height="1" fill="#000000" />
  <rect x="6" y="39" width="2" height="1" fill="#000000" />
  <rect x="8" y="39" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="39" width="8" height="1" fill="#000000" />
  <rect x="22" y="39" width="10" height="1" fill="#33FF00" />
  <rect x="32" y="39" width="26" height="1" fill="#000000" />
  <rect x="6" y="40" width="2" height="1" fill="#000000" />
  <rect x="8" y="40" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="40" width="8" height="1" fill="#000000" />
  <rect x="22" y="40" width="10" height="1" fill="#33FF00" />
  <rect x="32" y="40" width="2" height="1" fill="#000000" />
  <rect x="34" y="40" width="22" height="1" fill="#FFB000" />
  <rect x="56" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="2" height="1" fill="#000000" />
  <rect x="8" y="41" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="41" width="8" height="1" fill="#000000" />
  <rect x="22" y="41" width="10" height="1" fill="#33FF00" />
  <rect x="32" y="41" width="2" height="1" fill="#000000" />
  <rect x="34" y="41" width="22" height="1" fill="#FFB000" />
  <rect x="56" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="2" height="1" fill="#000000" />
  <rect x="8" y="42" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="42" width="20" height="1" fill="#000000" />
  <rect x="34" y="42" width="22" height="1" fill="#FFB000" />
  <rect x="56" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="2" height="1" fill="#000000" />
  <rect x="8" y="43" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="43" width="20" height="1" fill="#000000" />
  <rect x="34" y="43" width="22" height="1" fill="#FFB000" />
  <rect x="56" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="2" height="1" fill="#000000" />
  <rect x="8" y="44" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="44" width="20" height="1" fill="#000000" />
  <rect x="34" y="44" width="22" height="1" fill="#FFB000" />
  <rect x="56" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="2" height="1" fill="#000000" />
  <rect x="8" y="45" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="45" width="20" height="1" fill="#000000" />
  <rect x="34" y="45" width="22" height="1" fill="#FFB000" />
  <rect x="56" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="2" height="1" fill="#000000" />
  <rect x="8" y="46" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="46" width="34" height="1" fill="#000000" />
  <rect x="6" y="47" width="2" height="1" fill="#000000" />
  <rect x="8" y="47" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="47" width="34" height="1" fill="#000000" />
  <rect x="6" y="48" width="2" height="1" fill="#000000" />
  <rect x="8" y="48" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="48" width="36" height="1" fill="#000000" />
  <rect x="6" y="49" width="2" height="1" fill="#000000" />
  <rect x="8" y="49" width="6" height="1" fill="#FFB000" />
  <rect x="14" y="49" width="36" height="1" fill="#000000" />
  <rect x="6" y="50" width="2" height="1" fill="#000000" />
  <rect x="8" y="50" width="40" height="1" fill="#FFB000" />
  <rect x="6" y="51" width="2" height="1" fill="#000000" />
  <rect x="8" y="51" width="40" height="1" fill="#FFB000" />
  <rect x="6" y="52" width="2" height="1" fill="#000000" />
  <rect x="8" y="52" width="40" height="1" fill="#FFB000" />
  <rect x="6" y="53" width="2" height="1" fill="#000000" />
  <rect x="8" y="53" width="40" height="1" fill="#FFB000" />
  <rect x="6" y="54" width="4" height="1" fill="#000000" />
  <rect x="10" y="54" width="38" height="1" fill="#FFB000" />
  <rect x="6" y="55" width="4" height="1" fill="#000000" />
  <rect x="10" y="55" width="38" height="1" fill="#FFB000" />
  <rect x="8" y="56" width="40" height="1" fill="#000000" />
  <rect x="8" y="57" width="40" height="1" fill="#000000" />
</svg>
```
