# Week 22: API Security and Rate Limiting — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 22 (`week-22`)
- **Lesson ID**: `week-22-api-security-and-rate-limiting`
- **Title**: API Security and Rate Limiting
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-22.mdx`

## 2. Narrative Context (The Hook)
Within 20 minutes of opening your API port, an attacker floods `/login` at 200 req/s and sends spoofed `POST /webhooks/alert` payloads. You harden the perimeter with `hmac.compare_digest`, timestamped HMAC-SHA256 webhook checks, token-bucket rate limiters, and path jails.

## 3. Material Taught (Waypoints)
- **Waypoint 1: Never Compare Secrets with `==`**: Why `==` leaks byte-by-byte timing differences, generating tokens via `secrets.token_urlsafe(32)`, and verifying Bearer tokens in constant time with `hmac.compare_digest()`.
- **Waypoint 2: Verifying Webhook Authenticity with HMAC-SHA256**: Signing exact raw `f"{timestamp}.{body}"` bytes with `hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()` and enforcing the replay window `0 <= now - timestamp <= max_skew`.
- **Waypoint 3: Token-Bucket Rate Limiting**: Implementing `TokenBucketLimiter(capacity, refill_per_sec)` that refills elapsed tokens up to `capacity`, deducts `1.0` per allowed call, and returns `False` (`429`) when `< 1.0`.
- **Waypoint 4: Path Traversal and Subprocess Boundaries**: Blocking `../../etc/passwd` traversal via `Path(base).resolve()` and `target.is_relative_to(root)`, and executing commands with `subprocess.run(["ping", ...], shell=False)`.

## 4. Key Traps & Edge Cases Covered
- Computing HMAC over `json.dumps(json.loads(body))` alters whitespace/key order and invalidates legitimate signatures.
- Verifying an HMAC signature without checking `0 <= now - timestamp <= max_skew` leaves the endpoint open to replay attacks.
- Checking `".." not in user_input` with naive string operations instead of `.resolve().is_relative_to(root)`.
- Passing `shell=True` to `subprocess.run()` with untrusted input enables command injection.

## 5. Interactive Exercises & Components
- `w22-constant-time-check` (`verify_bearer` using `.removeprefix('Bearer ')` and `hmac.compare_digest`)
- `w22-hmac-tamper` (`verify_webhook` checking `0 <= now - timestamp <= max_skew` and `hmac.compare_digest`)
- `w22-fixed-window-limiter` (`TokenBucketLimiter.allow` refilling and consuming `1.0` token)
- `w22-path-jail` (`Path(base).resolve()` and `target.is_relative_to(root)`)
- PredictOutput: `w22-predict-raw-body-hmac`



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week22_icon`)

### Strict Visual Rules Applied
- **Subject**: **Security** — A fortress gate with a bucket dripping gold tokens.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week22_icon.svg`](./week22_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
...........KKKKKKKKKK...........
...........KAAAAAAAAK...........
...........KAWWWWWWAK...........
..KKKKKKKK.KAWWWWWWAK.KKKKKKKK..
..KWWKKWWK.KAWWWWWWAK.KWWKKWWK..
..KWWKKWWK.KAAAAAAAAK.KWWKKWWK..
..KWWKKWWK.KAAAAAAAAK.KWWKKWWK..
..KKKKKKKK.KKKKKKKKKK.KKKKKKKK..
..KWWWWWWK....KKKK....KWWWWWWK..
..KWWWWWKKKKKKKAAKKKKKKKWWWWWK..
..KWWWWWKWWWWWKAAKWWWWWKWWWWWK..
..KWWWWWKWWWWWKKKKWWWWWKWWWWWK..
..KWWWWWKWWWWWWWWWWWWWWKWWWWWK..
..KWWWWWKWKKKKKKKKKKKKWKWWWWWK..
..KWWWWWKWKKKGKKKKGKKKWKWWWWWK..
..KWWWWWKWKKKGKAAKGKKKWKWWWWWK..
..KWWWWWKWKKKGKAAKGKKKWKWWWWWK..
..KWWWWWKWKKKGKKKKGKKKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KWWWWWKWKGGGGGGGGGGKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KWWWWWKWKGGGGGGGGGGKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KWWWWWKWKKKGKKGKGKKKWKWWWWWK..
..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="22" y="4" width="20" height="1" fill="#000000" />
  <rect x="22" y="5" width="20" height="1" fill="#000000" />
  <rect x="22" y="6" width="2" height="1" fill="#000000" />
  <rect x="24" y="6" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="6" width="2" height="1" fill="#000000" />
  <rect x="22" y="7" width="2" height="1" fill="#000000" />
  <rect x="24" y="7" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="7" width="2" height="1" fill="#000000" />
  <rect x="22" y="8" width="2" height="1" fill="#000000" />
  <rect x="24" y="8" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="8" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="8" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="8" width="2" height="1" fill="#000000" />
  <rect x="22" y="9" width="2" height="1" fill="#000000" />
  <rect x="24" y="9" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="9" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="9" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="9" width="2" height="1" fill="#000000" />
  <rect x="4" y="10" width="16" height="1" fill="#000000" />
  <rect x="22" y="10" width="2" height="1" fill="#000000" />
  <rect x="24" y="10" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="10" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="10" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="10" width="2" height="1" fill="#000000" />
  <rect x="44" y="10" width="16" height="1" fill="#000000" />
  <rect x="4" y="11" width="16" height="1" fill="#000000" />
  <rect x="22" y="11" width="2" height="1" fill="#000000" />
  <rect x="24" y="11" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="11" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="11" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="11" width="2" height="1" fill="#000000" />
  <rect x="44" y="11" width="16" height="1" fill="#000000" />
  <rect x="4" y="12" width="2" height="1" fill="#000000" />
  <rect x="6" y="12" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="12" width="4" height="1" fill="#000000" />
  <rect x="14" y="12" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="12" width="2" height="1" fill="#000000" />
  <rect x="22" y="12" width="2" height="1" fill="#000000" />
  <rect x="24" y="12" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="12" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="12" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="12" width="2" height="1" fill="#000000" />
  <rect x="44" y="12" width="2" height="1" fill="#000000" />
  <rect x="46" y="12" width="4" height="1" fill="#F1F1F1" />
  <rect x="50" y="12" width="4" height="1" fill="#000000" />
  <rect x="54" y="12" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="12" width="2" height="1" fill="#000000" />
  <rect x="4" y="13" width="2" height="1" fill="#000000" />
  <rect x="6" y="13" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="13" width="4" height="1" fill="#000000" />
  <rect x="14" y="13" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="13" width="2" height="1" fill="#000000" />
  <rect x="22" y="13" width="2" height="1" fill="#000000" />
  <rect x="24" y="13" width="2" height="1" fill="#FFB000" />
  <rect x="26" y="13" width="12" height="1" fill="#F1F1F1" />
  <rect x="38" y="13" width="2" height="1" fill="#FFB000" />
  <rect x="40" y="13" width="2" height="1" fill="#000000" />
  <rect x="44" y="13" width="2" height="1" fill="#000000" />
  <rect x="46" y="13" width="4" height="1" fill="#F1F1F1" />
  <rect x="50" y="13" width="4" height="1" fill="#000000" />
  <rect x="54" y="13" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="13" width="2" height="1" fill="#000000" />
  <rect x="4" y="14" width="2" height="1" fill="#000000" />
  <rect x="6" y="14" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="14" width="4" height="1" fill="#000000" />
  <rect x="14" y="14" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="14" width="2" height="1" fill="#000000" />
  <rect x="22" y="14" width="2" height="1" fill="#000000" />
  <rect x="24" y="14" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="14" width="2" height="1" fill="#000000" />
  <rect x="44" y="14" width="2" height="1" fill="#000000" />
  <rect x="46" y="14" width="4" height="1" fill="#F1F1F1" />
  <rect x="50" y="14" width="4" height="1" fill="#000000" />
  <rect x="54" y="14" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="14" width="2" height="1" fill="#000000" />
  <rect x="4" y="15" width="2" height="1" fill="#000000" />
  <rect x="6" y="15" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="15" width="4" height="1" fill="#000000" />
  <rect x="14" y="15" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="15" width="2" height="1" fill="#000000" />
  <rect x="22" y="15" width="2" height="1" fill="#000000" />
  <rect x="24" y="15" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="15" width="2" height="1" fill="#000000" />
  <rect x="44" y="15" width="2" height="1" fill="#000000" />
  <rect x="46" y="15" width="4" height="1" fill="#F1F1F1" />
  <rect x="50" y="15" width="4" height="1" fill="#000000" />
  <rect x="54" y="15" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="15" width="2" height="1" fill="#000000" />
  <rect x="4" y="16" width="2" height="1" fill="#000000" />
  <rect x="6" y="16" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="16" width="4" height="1" fill="#000000" />
  <rect x="14" y="16" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="16" width="2" height="1" fill="#000000" />
  <rect x="22" y="16" width="2" height="1" fill="#000000" />
  <rect x="24" y="16" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="16" width="2" height="1" fill="#000000" />
  <rect x="44" y="16" width="2" height="1" fill="#000000" />
  <rect x="46" y="16" width="4" height="1" fill="#F1F1F1" />
  <rect x="50" y="16" width="4" height="1" fill="#000000" />
  <rect x="54" y="16" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="16" width="2" height="1" fill="#000000" />
  <rect x="4" y="17" width="2" height="1" fill="#000000" />
  <rect x="6" y="17" width="4" height="1" fill="#F1F1F1" />
  <rect x="10" y="17" width="4" height="1" fill="#000000" />
  <rect x="14" y="17" width="4" height="1" fill="#F1F1F1" />
  <rect x="18" y="17" width="2" height="1" fill="#000000" />
  <rect x="22" y="17" width="2" height="1" fill="#000000" />
  <rect x="24" y="17" width="16" height="1" fill="#FFB000" />
  <rect x="40" y="17" width="2" height="1" fill="#000000" />
  <rect x="44" y="17" width="2" height="1" fill="#000000" />
  <rect x="46" y="17" width="4" height="1" fill="#F1F1F1" />
  <rect x="50" y="17" width="4" height="1" fill="#000000" />
  <rect x="54" y="17" width="4" height="1" fill="#F1F1F1" />
  <rect x="58" y="17" width="2" height="1" fill="#000000" />
  <rect x="4" y="18" width="16" height="1" fill="#000000" />
  <rect x="22" y="18" width="20" height="1" fill="#000000" />
  <rect x="44" y="18" width="16" height="1" fill="#000000" />
  <rect x="4" y="19" width="16" height="1" fill="#000000" />
  <rect x="22" y="19" width="20" height="1" fill="#000000" />
  <rect x="44" y="19" width="16" height="1" fill="#000000" />
  <rect x="4" y="20" width="2" height="1" fill="#000000" />
  <rect x="6" y="20" width="12" height="1" fill="#F1F1F1" />
  <rect x="18" y="20" width="2" height="1" fill="#000000" />
  <rect x="28" y="20" width="8" height="1" fill="#000000" />
  <rect x="44" y="20" width="2" height="1" fill="#000000" />
  <rect x="46" y="20" width="12" height="1" fill="#F1F1F1" />
  <rect x="58" y="20" width="2" height="1" fill="#000000" />
  <rect x="4" y="21" width="2" height="1" fill="#000000" />
  <rect x="6" y="21" width="12" height="1" fill="#F1F1F1" />
  <rect x="18" y="21" width="2" height="1" fill="#000000" />
  <rect x="28" y="21" width="8" height="1" fill="#000000" />
  <rect x="44" y="21" width="2" height="1" fill="#000000" />
  <rect x="46" y="21" width="12" height="1" fill="#F1F1F1" />
  <rect x="58" y="21" width="2" height="1" fill="#000000" />
  <rect x="4" y="22" width="2" height="1" fill="#000000" />
  <rect x="6" y="22" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="22" width="14" height="1" fill="#000000" />
  <rect x="30" y="22" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="22" width="14" height="1" fill="#000000" />
  <rect x="48" y="22" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="22" width="2" height="1" fill="#000000" />
  <rect x="4" y="23" width="2" height="1" fill="#000000" />
  <rect x="6" y="23" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="23" width="14" height="1" fill="#000000" />
  <rect x="30" y="23" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="23" width="14" height="1" fill="#000000" />
  <rect x="48" y="23" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="23" width="2" height="1" fill="#000000" />
  <rect x="4" y="24" width="2" height="1" fill="#000000" />
  <rect x="6" y="24" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="24" width="2" height="1" fill="#000000" />
  <rect x="18" y="24" width="10" height="1" fill="#F1F1F1" />
  <rect x="28" y="24" width="2" height="1" fill="#000000" />
  <rect x="30" y="24" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="24" width="2" height="1" fill="#000000" />
  <rect x="36" y="24" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="24" width="2" height="1" fill="#000000" />
  <rect x="48" y="24" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="24" width="2" height="1" fill="#000000" />
  <rect x="4" y="25" width="2" height="1" fill="#000000" />
  <rect x="6" y="25" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="25" width="2" height="1" fill="#000000" />
  <rect x="18" y="25" width="10" height="1" fill="#F1F1F1" />
  <rect x="28" y="25" width="2" height="1" fill="#000000" />
  <rect x="30" y="25" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="25" width="2" height="1" fill="#000000" />
  <rect x="36" y="25" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="25" width="2" height="1" fill="#000000" />
  <rect x="48" y="25" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="25" width="2" height="1" fill="#000000" />
  <rect x="4" y="26" width="2" height="1" fill="#000000" />
  <rect x="6" y="26" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="26" width="2" height="1" fill="#000000" />
  <rect x="18" y="26" width="10" height="1" fill="#F1F1F1" />
  <rect x="28" y="26" width="8" height="1" fill="#000000" />
  <rect x="36" y="26" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="26" width="2" height="1" fill="#000000" />
  <rect x="48" y="26" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="26" width="2" height="1" fill="#000000" />
  <rect x="4" y="27" width="2" height="1" fill="#000000" />
  <rect x="6" y="27" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="27" width="2" height="1" fill="#000000" />
  <rect x="18" y="27" width="10" height="1" fill="#F1F1F1" />
  <rect x="28" y="27" width="8" height="1" fill="#000000" />
  <rect x="36" y="27" width="10" height="1" fill="#F1F1F1" />
  <rect x="46" y="27" width="2" height="1" fill="#000000" />
  <rect x="48" y="27" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="27" width="2" height="1" fill="#000000" />
  <rect x="4" y="28" width="2" height="1" fill="#000000" />
  <rect x="6" y="28" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="28" width="2" height="1" fill="#000000" />
  <rect x="18" y="28" width="28" height="1" fill="#F1F1F1" />
  <rect x="46" y="28" width="2" height="1" fill="#000000" />
  <rect x="48" y="28" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="28" width="2" height="1" fill="#000000" />
  <rect x="4" y="29" width="2" height="1" fill="#000000" />
  <rect x="6" y="29" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="29" width="2" height="1" fill="#000000" />
  <rect x="18" y="29" width="28" height="1" fill="#F1F1F1" />
  <rect x="46" y="29" width="2" height="1" fill="#000000" />
  <rect x="48" y="29" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="29" width="2" height="1" fill="#000000" />
  <rect x="4" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="30" width="2" height="1" fill="#000000" />
  <rect x="18" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="30" width="24" height="1" fill="#000000" />
  <rect x="44" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="30" width="2" height="1" fill="#000000" />
  <rect x="48" y="30" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="30" width="2" height="1" fill="#000000" />
  <rect x="4" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="31" width="2" height="1" fill="#000000" />
  <rect x="18" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="31" width="24" height="1" fill="#000000" />
  <rect x="44" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="31" width="2" height="1" fill="#000000" />
  <rect x="48" y="31" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="31" width="2" height="1" fill="#000000" />
  <rect x="4" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="32" width="2" height="1" fill="#000000" />
  <rect x="18" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="32" width="6" height="1" fill="#000000" />
  <rect x="26" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="32" width="8" height="1" fill="#000000" />
  <rect x="36" y="32" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="32" width="6" height="1" fill="#000000" />
  <rect x="44" y="32" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="32" width="2" height="1" fill="#000000" />
  <rect x="48" y="32" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="32" width="2" height="1" fill="#000000" />
  <rect x="4" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="33" width="2" height="1" fill="#000000" />
  <rect x="18" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="33" width="6" height="1" fill="#000000" />
  <rect x="26" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="33" width="8" height="1" fill="#000000" />
  <rect x="36" y="33" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="33" width="6" height="1" fill="#000000" />
  <rect x="44" y="33" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="33" width="2" height="1" fill="#000000" />
  <rect x="48" y="33" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="33" width="2" height="1" fill="#000000" />
  <rect x="4" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="34" width="2" height="1" fill="#000000" />
  <rect x="18" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="34" width="6" height="1" fill="#000000" />
  <rect x="26" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="34" width="2" height="1" fill="#000000" />
  <rect x="30" y="34" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="34" width="2" height="1" fill="#000000" />
  <rect x="36" y="34" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="34" width="6" height="1" fill="#000000" />
  <rect x="44" y="34" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="34" width="2" height="1" fill="#000000" />
  <rect x="48" y="34" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="34" width="2" height="1" fill="#000000" />
  <rect x="4" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="35" width="2" height="1" fill="#000000" />
  <rect x="18" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="35" width="6" height="1" fill="#000000" />
  <rect x="26" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="35" width="2" height="1" fill="#000000" />
  <rect x="30" y="35" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="35" width="2" height="1" fill="#000000" />
  <rect x="36" y="35" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="35" width="6" height="1" fill="#000000" />
  <rect x="44" y="35" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="35" width="2" height="1" fill="#000000" />
  <rect x="48" y="35" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="35" width="2" height="1" fill="#000000" />
  <rect x="4" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="36" width="2" height="1" fill="#000000" />
  <rect x="18" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="36" width="6" height="1" fill="#000000" />
  <rect x="26" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="36" width="2" height="1" fill="#000000" />
  <rect x="30" y="36" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="36" width="2" height="1" fill="#000000" />
  <rect x="36" y="36" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="36" width="6" height="1" fill="#000000" />
  <rect x="44" y="36" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="36" width="2" height="1" fill="#000000" />
  <rect x="48" y="36" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="36" width="2" height="1" fill="#000000" />
  <rect x="4" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="37" width="2" height="1" fill="#000000" />
  <rect x="18" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="37" width="6" height="1" fill="#000000" />
  <rect x="26" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="37" width="2" height="1" fill="#000000" />
  <rect x="30" y="37" width="4" height="1" fill="#FFB000" />
  <rect x="34" y="37" width="2" height="1" fill="#000000" />
  <rect x="36" y="37" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="37" width="6" height="1" fill="#000000" />
  <rect x="44" y="37" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="37" width="2" height="1" fill="#000000" />
  <rect x="48" y="37" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="37" width="2" height="1" fill="#000000" />
  <rect x="4" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="38" width="2" height="1" fill="#000000" />
  <rect x="18" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="38" width="6" height="1" fill="#000000" />
  <rect x="26" y="38" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="38" width="8" height="1" fill="#000000" />
  <rect x="36" y="38" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="38" width="6" height="1" fill="#000000" />
  <rect x="44" y="38" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="38" width="2" height="1" fill="#000000" />
  <rect x="48" y="38" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="38" width="2" height="1" fill="#000000" />
  <rect x="4" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="39" width="2" height="1" fill="#000000" />
  <rect x="18" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="39" width="6" height="1" fill="#000000" />
  <rect x="26" y="39" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="39" width="8" height="1" fill="#000000" />
  <rect x="36" y="39" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="39" width="6" height="1" fill="#000000" />
  <rect x="44" y="39" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="39" width="2" height="1" fill="#000000" />
  <rect x="48" y="39" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="39" width="2" height="1" fill="#000000" />
  <rect x="4" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="40" width="2" height="1" fill="#000000" />
  <rect x="18" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="40" width="6" height="1" fill="#000000" />
  <rect x="26" y="40" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="40" width="4" height="1" fill="#000000" />
  <rect x="32" y="40" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="40" width="2" height="1" fill="#000000" />
  <rect x="36" y="40" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="40" width="6" height="1" fill="#000000" />
  <rect x="44" y="40" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="40" width="2" height="1" fill="#000000" />
  <rect x="48" y="40" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="40" width="2" height="1" fill="#000000" />
  <rect x="4" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="41" width="2" height="1" fill="#000000" />
  <rect x="18" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="41" width="6" height="1" fill="#000000" />
  <rect x="26" y="41" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="41" width="4" height="1" fill="#000000" />
  <rect x="32" y="41" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="41" width="2" height="1" fill="#000000" />
  <rect x="36" y="41" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="41" width="6" height="1" fill="#000000" />
  <rect x="44" y="41" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="41" width="2" height="1" fill="#000000" />
  <rect x="48" y="41" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="41" width="2" height="1" fill="#000000" />
  <rect x="4" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="42" width="2" height="1" fill="#000000" />
  <rect x="18" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="42" width="2" height="1" fill="#000000" />
  <rect x="22" y="42" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="42" width="2" height="1" fill="#000000" />
  <rect x="44" y="42" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="42" width="2" height="1" fill="#000000" />
  <rect x="48" y="42" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="42" width="2" height="1" fill="#000000" />
  <rect x="4" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="43" width="2" height="1" fill="#000000" />
  <rect x="18" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="43" width="2" height="1" fill="#000000" />
  <rect x="22" y="43" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="43" width="2" height="1" fill="#000000" />
  <rect x="44" y="43" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="43" width="2" height="1" fill="#000000" />
  <rect x="48" y="43" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="43" width="2" height="1" fill="#000000" />
  <rect x="4" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="44" width="2" height="1" fill="#000000" />
  <rect x="18" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="44" width="6" height="1" fill="#000000" />
  <rect x="26" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="44" width="4" height="1" fill="#000000" />
  <rect x="32" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="44" width="2" height="1" fill="#000000" />
  <rect x="36" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="44" width="6" height="1" fill="#000000" />
  <rect x="44" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="44" width="2" height="1" fill="#000000" />
  <rect x="48" y="44" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="44" width="2" height="1" fill="#000000" />
  <rect x="4" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="45" width="2" height="1" fill="#000000" />
  <rect x="18" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="45" width="6" height="1" fill="#000000" />
  <rect x="26" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="45" width="4" height="1" fill="#000000" />
  <rect x="32" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="45" width="2" height="1" fill="#000000" />
  <rect x="36" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="45" width="6" height="1" fill="#000000" />
  <rect x="44" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="45" width="2" height="1" fill="#000000" />
  <rect x="48" y="45" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="45" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="46" width="2" height="1" fill="#000000" />
  <rect x="18" y="46" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="46" width="6" height="1" fill="#000000" />
  <rect x="26" y="46" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="46" width="4" height="1" fill="#000000" />
  <rect x="32" y="46" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="46" width="2" height="1" fill="#000000" />
  <rect x="36" y="46" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="46" width="6" height="1" fill="#000000" />
  <rect x="44" y="46" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="46" width="2" height="1" fill="#000000" />
  <rect x="48" y="46" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="46" width="2" height="1" fill="#000000" />
  <rect x="4" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="47" width="2" height="1" fill="#000000" />
  <rect x="18" y="47" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="47" width="6" height="1" fill="#000000" />
  <rect x="26" y="47" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="47" width="4" height="1" fill="#000000" />
  <rect x="32" y="47" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="47" width="2" height="1" fill="#000000" />
  <rect x="36" y="47" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="47" width="6" height="1" fill="#000000" />
  <rect x="44" y="47" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="47" width="2" height="1" fill="#000000" />
  <rect x="48" y="47" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="47" width="2" height="1" fill="#000000" />
  <rect x="4" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="48" width="2" height="1" fill="#000000" />
  <rect x="18" y="48" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="48" width="6" height="1" fill="#000000" />
  <rect x="26" y="48" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="48" width="4" height="1" fill="#000000" />
  <rect x="32" y="48" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="48" width="2" height="1" fill="#000000" />
  <rect x="36" y="48" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="48" width="6" height="1" fill="#000000" />
  <rect x="44" y="48" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="48" width="2" height="1" fill="#000000" />
  <rect x="48" y="48" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="48" width="2" height="1" fill="#000000" />
  <rect x="4" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="49" width="2" height="1" fill="#000000" />
  <rect x="18" y="49" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="49" width="6" height="1" fill="#000000" />
  <rect x="26" y="49" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="49" width="4" height="1" fill="#000000" />
  <rect x="32" y="49" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="49" width="2" height="1" fill="#000000" />
  <rect x="36" y="49" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="49" width="6" height="1" fill="#000000" />
  <rect x="44" y="49" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="49" width="2" height="1" fill="#000000" />
  <rect x="48" y="49" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="49" width="2" height="1" fill="#000000" />
  <rect x="4" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="50" width="2" height="1" fill="#000000" />
  <rect x="18" y="50" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="50" width="2" height="1" fill="#000000" />
  <rect x="22" y="50" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="50" width="2" height="1" fill="#000000" />
  <rect x="44" y="50" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="50" width="2" height="1" fill="#000000" />
  <rect x="48" y="50" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="51" width="2" height="1" fill="#000000" />
  <rect x="18" y="51" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="51" width="2" height="1" fill="#000000" />
  <rect x="22" y="51" width="20" height="1" fill="#33FF00" />
  <rect x="42" y="51" width="2" height="1" fill="#000000" />
  <rect x="44" y="51" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="51" width="2" height="1" fill="#000000" />
  <rect x="48" y="51" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="52" width="2" height="1" fill="#000000" />
  <rect x="18" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="52" width="6" height="1" fill="#000000" />
  <rect x="26" y="52" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="52" width="4" height="1" fill="#000000" />
  <rect x="32" y="52" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="52" width="2" height="1" fill="#000000" />
  <rect x="36" y="52" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="52" width="6" height="1" fill="#000000" />
  <rect x="44" y="52" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="52" width="2" height="1" fill="#000000" />
  <rect x="48" y="52" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="52" width="2" height="1" fill="#000000" />
  <rect x="4" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="53" width="2" height="1" fill="#000000" />
  <rect x="18" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="53" width="6" height="1" fill="#000000" />
  <rect x="26" y="53" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="53" width="4" height="1" fill="#000000" />
  <rect x="32" y="53" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="53" width="2" height="1" fill="#000000" />
  <rect x="36" y="53" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="53" width="6" height="1" fill="#000000" />
  <rect x="44" y="53" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="53" width="2" height="1" fill="#000000" />
  <rect x="48" y="53" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="53" width="2" height="1" fill="#000000" />
  <rect x="4" y="54" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="54" width="2" height="1" fill="#000000" />
  <rect x="18" y="54" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="54" width="6" height="1" fill="#000000" />
  <rect x="26" y="54" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="54" width="4" height="1" fill="#000000" />
  <rect x="32" y="54" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="54" width="2" height="1" fill="#000000" />
  <rect x="36" y="54" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="54" width="6" height="1" fill="#000000" />
  <rect x="44" y="54" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="54" width="2" height="1" fill="#000000" />
  <rect x="48" y="54" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="54" width="2" height="1" fill="#000000" />
  <rect x="4" y="55" width="2" height="1" fill="#000000" />
  <rect x="6" y="55" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="55" width="2" height="1" fill="#000000" />
  <rect x="18" y="55" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="55" width="6" height="1" fill="#000000" />
  <rect x="26" y="55" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="55" width="4" height="1" fill="#000000" />
  <rect x="32" y="55" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="55" width="2" height="1" fill="#000000" />
  <rect x="36" y="55" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="55" width="6" height="1" fill="#000000" />
  <rect x="44" y="55" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="55" width="2" height="1" fill="#000000" />
  <rect x="48" y="55" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="55" width="2" height="1" fill="#000000" />
  <rect x="4" y="56" width="2" height="1" fill="#000000" />
  <rect x="6" y="56" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="56" width="2" height="1" fill="#000000" />
  <rect x="18" y="56" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="56" width="6" height="1" fill="#000000" />
  <rect x="26" y="56" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="56" width="4" height="1" fill="#000000" />
  <rect x="32" y="56" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="56" width="2" height="1" fill="#000000" />
  <rect x="36" y="56" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="56" width="6" height="1" fill="#000000" />
  <rect x="44" y="56" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="56" width="2" height="1" fill="#000000" />
  <rect x="48" y="56" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="56" width="2" height="1" fill="#000000" />
  <rect x="4" y="57" width="2" height="1" fill="#000000" />
  <rect x="6" y="57" width="10" height="1" fill="#F1F1F1" />
  <rect x="16" y="57" width="2" height="1" fill="#000000" />
  <rect x="18" y="57" width="2" height="1" fill="#F1F1F1" />
  <rect x="20" y="57" width="6" height="1" fill="#000000" />
  <rect x="26" y="57" width="2" height="1" fill="#33FF00" />
  <rect x="28" y="57" width="4" height="1" fill="#000000" />
  <rect x="32" y="57" width="2" height="1" fill="#33FF00" />
  <rect x="34" y="57" width="2" height="1" fill="#000000" />
  <rect x="36" y="57" width="2" height="1" fill="#33FF00" />
  <rect x="38" y="57" width="6" height="1" fill="#000000" />
  <rect x="44" y="57" width="2" height="1" fill="#F1F1F1" />
  <rect x="46" y="57" width="2" height="1" fill="#000000" />
  <rect x="48" y="57" width="10" height="1" fill="#F1F1F1" />
  <rect x="58" y="57" width="2" height="1" fill="#000000" />
  <rect x="4" y="58" width="56" height="1" fill="#000000" />
  <rect x="4" y="59" width="56" height="1" fill="#000000" />
</svg>
```
