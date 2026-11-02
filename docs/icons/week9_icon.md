# Week 09: Hashing and Authentication — 8-Bit Icon & Lesson Reference

## 1. Lesson Metadata
- **Week**: 9 (`week-09`)
- **Lesson ID**: `week-09-hashing-and-auth`
- **Title**: Hashing and Authentication
- **Estimated Duration**: 22 minutes
- **Source File**: `src/content/lessons/week-09.mdx`

## 2. Narrative Context (The Hook)
The console now has users and a password file worth stealing. You make `users.txt` useless to attackers using one-way hashes, per-user cryptographic salts, slow PBKDF2 key derivation, constant-time checks, and env-var secrets.

## 3. Material Taught (Waypoints)
- **Waypoint 1: One Way, By Design**: One-way cryptographic digests (`hashlib.sha256(b"...").hexdigest()`), encoding strings to `bytes` (`.encode()`), the avalanche effect, and why password verification uses hashing rather than reversible encryption.
- **Waypoint 2: Why a Plain Hash Loses**: How pre-computed rainbow tables crack unsalted hashes instantly, and how unique per-user random salts defeat pre-computation.
- **Waypoint 3: Slow by Design: Salted Key Derivation**: `hashlib.pbkdf2_hmac("sha256", password_bytes, salt_bytes, 600_000)`, generating 16-byte salts with `secrets.token_bytes(16)`, verifying digests with `hmac.compare_digest()`, and Argon2id/bcrypt production guidance.
- **Waypoint 4: The Perimeter**: `register_user` and constant-time `login_user` (running PBKDF2 against `DUMMY_SALT`/`DUMMY_HASH` when a username is missing to prevent timing oracles), splitting `username,salt$hash` with `.split(",", 1)`, and requiring secrets via `os.environ.get()` (`require_env`).

## 4. Key Traps & Edge Cases Covered
- Passing a `str` instead of `bytes` (`.encode("utf-8")`) to `hashlib.sha256()` or `pbkdf2_hmac()` raises `TypeError`.
- Reusing a static salt or comparing digests with `==` instead of `hmac.compare_digest()`.
- Returning `False` immediately on an unknown username without running the slow hash leaks valid usernames via response latency.
- Hardcoding API keys in source code or returning a default fallback when a required secret env var is missing.

## 5. Interactive Exercises & Components
- `w09-hash-verify` (`hashlib.sha256(typed.encode())`)
- `w09-store-split` (`line.strip().split(',', 1)` preserving `$` in stored credential)
- `w09-env-read` (`require_env` raising `RuntimeError` when `OPS_API_KEY` is missing or empty)



---

## 6. Retro 1990s OS 8-Bit Icon Specification (`week9_icon`)

### Strict Visual Rules Applied
- **Subject**: **Hashing** — A heavy iron padlock next to a tilted salt shaker.
- **Grid Resolution**: `64x64` pixels (`32x32` chunky `2x2` logical pixel grid for crisp `32x32` downscaling)
- **Strict 4-Color Palette**:
  - Pure Black (`#000000`) — thick outlines & dark fills (`K`)
  - Off-White (`#F1F1F1`) — highlights & neutral surfaces (`W`)
  - Phosphor Green (`#33FF00`) — active signals & glowing elements (`G`)
  - Amber (`#FFB000`) — primary hardware/gold accents (`A`)
  - Transparent (`#00000000`) — background (`.`)
- **Style**: Flat, chunky, hard edges; zero anti-aliasing, zero gradients, zero 3D drop shadows.
- **Generated Vector Sprite**: [`week9_icon.svg`](./week9_icon.svg)

### 32x32 Chunky Logical Pixel Matrix (`1` cell = `2x2` pixels on `64x64` grid)
```text
................................
................................
................................
................................
...................KKKKKKKK.....
....KKKKKKKKKKKKK..KAAAAAAK.....
....KWWWWWWWWWWWK..KAAAAAAK.....
....KWKKKKKKKKKWK..KKKKKKKKKKK..
....KWK.......KWK..KKWWWWWWWWK..
....KWK.......KWK...KWWWWWWWWK..
....KWK.......KWK...KWWWWWWWWK..
....KWK.......KWK...KWGGGGGGWK..
....KWK.......KWK...KWGGGGGGWK..
....KWK.......KWK...KWGGGGGGWK..
..KKKKKKKKKKKKKKKKK.KWGGGGGGWK..
..KWWWWWWWWWWWWWWWK.KWGGGGGGWK..
..KAAAAAAAAAAAAAAAK.KWWWWWWWWK..
..KAAAAAKKKKKAAAAAK.KKKKKKKKKK..
..KAAAAAKKKKKAAAAAK.............
..KAAAAAKKKKKAAAAAKKKK..........
..KAAAAAKKKKKAAAAAKKGK..........
..KAAAAAKKKKKAAAAAKKKK.KKK......
..KAAAAAAKGKAAAAAAK....KWK......
..KAAAAAAKGKAAAAAAK....KKK......
..KAAAAAAKGKAAAAAAK.KKK.........
..KAAAAAAKKKAAAAAAK.KGK.........
..KAAAAAAAAAAAAAAAK.KKK.........
..KAAAAAAAAAAAAAAAK.............
..KKKKKKKKKKKKKKKKK.............
................................
................................
................................
```

### 64x64 Pixel-Art SVG (`shape-rendering="crispEdges"`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <rect x="38" y="8" width="16" height="1" fill="#000000" />
  <rect x="38" y="9" width="16" height="1" fill="#000000" />
  <rect x="8" y="10" width="26" height="1" fill="#000000" />
  <rect x="38" y="10" width="2" height="1" fill="#000000" />
  <rect x="40" y="10" width="12" height="1" fill="#FFB000" />
  <rect x="52" y="10" width="2" height="1" fill="#000000" />
  <rect x="8" y="11" width="26" height="1" fill="#000000" />
  <rect x="38" y="11" width="2" height="1" fill="#000000" />
  <rect x="40" y="11" width="12" height="1" fill="#FFB000" />
  <rect x="52" y="11" width="2" height="1" fill="#000000" />
  <rect x="8" y="12" width="2" height="1" fill="#000000" />
  <rect x="10" y="12" width="22" height="1" fill="#F1F1F1" />
  <rect x="32" y="12" width="2" height="1" fill="#000000" />
  <rect x="38" y="12" width="2" height="1" fill="#000000" />
  <rect x="40" y="12" width="12" height="1" fill="#FFB000" />
  <rect x="52" y="12" width="2" height="1" fill="#000000" />
  <rect x="8" y="13" width="2" height="1" fill="#000000" />
  <rect x="10" y="13" width="22" height="1" fill="#F1F1F1" />
  <rect x="32" y="13" width="2" height="1" fill="#000000" />
  <rect x="38" y="13" width="2" height="1" fill="#000000" />
  <rect x="40" y="13" width="12" height="1" fill="#FFB000" />
  <rect x="52" y="13" width="2" height="1" fill="#000000" />
  <rect x="8" y="14" width="2" height="1" fill="#000000" />
  <rect x="10" y="14" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="14" width="18" height="1" fill="#000000" />
  <rect x="30" y="14" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="14" width="2" height="1" fill="#000000" />
  <rect x="38" y="14" width="22" height="1" fill="#000000" />
  <rect x="8" y="15" width="2" height="1" fill="#000000" />
  <rect x="10" y="15" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="15" width="18" height="1" fill="#000000" />
  <rect x="30" y="15" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="15" width="2" height="1" fill="#000000" />
  <rect x="38" y="15" width="22" height="1" fill="#000000" />
  <rect x="8" y="16" width="2" height="1" fill="#000000" />
  <rect x="10" y="16" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="16" width="2" height="1" fill="#000000" />
  <rect x="28" y="16" width="2" height="1" fill="#000000" />
  <rect x="30" y="16" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="16" width="2" height="1" fill="#000000" />
  <rect x="38" y="16" width="4" height="1" fill="#000000" />
  <rect x="42" y="16" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="16" width="2" height="1" fill="#000000" />
  <rect x="8" y="17" width="2" height="1" fill="#000000" />
  <rect x="10" y="17" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="17" width="2" height="1" fill="#000000" />
  <rect x="28" y="17" width="2" height="1" fill="#000000" />
  <rect x="30" y="17" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="17" width="2" height="1" fill="#000000" />
  <rect x="38" y="17" width="4" height="1" fill="#000000" />
  <rect x="42" y="17" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="17" width="2" height="1" fill="#000000" />
  <rect x="8" y="18" width="2" height="1" fill="#000000" />
  <rect x="10" y="18" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="18" width="2" height="1" fill="#000000" />
  <rect x="28" y="18" width="2" height="1" fill="#000000" />
  <rect x="30" y="18" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="18" width="2" height="1" fill="#000000" />
  <rect x="40" y="18" width="2" height="1" fill="#000000" />
  <rect x="42" y="18" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="18" width="2" height="1" fill="#000000" />
  <rect x="8" y="19" width="2" height="1" fill="#000000" />
  <rect x="10" y="19" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="19" width="2" height="1" fill="#000000" />
  <rect x="28" y="19" width="2" height="1" fill="#000000" />
  <rect x="30" y="19" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="19" width="2" height="1" fill="#000000" />
  <rect x="40" y="19" width="2" height="1" fill="#000000" />
  <rect x="42" y="19" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="19" width="2" height="1" fill="#000000" />
  <rect x="8" y="20" width="2" height="1" fill="#000000" />
  <rect x="10" y="20" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="20" width="2" height="1" fill="#000000" />
  <rect x="28" y="20" width="2" height="1" fill="#000000" />
  <rect x="30" y="20" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="20" width="2" height="1" fill="#000000" />
  <rect x="40" y="20" width="2" height="1" fill="#000000" />
  <rect x="42" y="20" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="20" width="2" height="1" fill="#000000" />
  <rect x="8" y="21" width="2" height="1" fill="#000000" />
  <rect x="10" y="21" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="21" width="2" height="1" fill="#000000" />
  <rect x="28" y="21" width="2" height="1" fill="#000000" />
  <rect x="30" y="21" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="21" width="2" height="1" fill="#000000" />
  <rect x="40" y="21" width="2" height="1" fill="#000000" />
  <rect x="42" y="21" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="21" width="2" height="1" fill="#000000" />
  <rect x="8" y="22" width="2" height="1" fill="#000000" />
  <rect x="10" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="22" width="2" height="1" fill="#000000" />
  <rect x="28" y="22" width="2" height="1" fill="#000000" />
  <rect x="30" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="22" width="2" height="1" fill="#000000" />
  <rect x="40" y="22" width="2" height="1" fill="#000000" />
  <rect x="42" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="22" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="22" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="22" width="2" height="1" fill="#000000" />
  <rect x="8" y="23" width="2" height="1" fill="#000000" />
  <rect x="10" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="23" width="2" height="1" fill="#000000" />
  <rect x="28" y="23" width="2" height="1" fill="#000000" />
  <rect x="30" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="23" width="2" height="1" fill="#000000" />
  <rect x="40" y="23" width="2" height="1" fill="#000000" />
  <rect x="42" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="23" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="23" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="23" width="2" height="1" fill="#000000" />
  <rect x="8" y="24" width="2" height="1" fill="#000000" />
  <rect x="10" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="24" width="2" height="1" fill="#000000" />
  <rect x="28" y="24" width="2" height="1" fill="#000000" />
  <rect x="30" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="24" width="2" height="1" fill="#000000" />
  <rect x="40" y="24" width="2" height="1" fill="#000000" />
  <rect x="42" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="24" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="24" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="24" width="2" height="1" fill="#000000" />
  <rect x="8" y="25" width="2" height="1" fill="#000000" />
  <rect x="10" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="25" width="2" height="1" fill="#000000" />
  <rect x="28" y="25" width="2" height="1" fill="#000000" />
  <rect x="30" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="25" width="2" height="1" fill="#000000" />
  <rect x="40" y="25" width="2" height="1" fill="#000000" />
  <rect x="42" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="25" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="25" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="25" width="2" height="1" fill="#000000" />
  <rect x="8" y="26" width="2" height="1" fill="#000000" />
  <rect x="10" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="26" width="2" height="1" fill="#000000" />
  <rect x="28" y="26" width="2" height="1" fill="#000000" />
  <rect x="30" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="26" width="2" height="1" fill="#000000" />
  <rect x="40" y="26" width="2" height="1" fill="#000000" />
  <rect x="42" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="26" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="26" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="26" width="2" height="1" fill="#000000" />
  <rect x="8" y="27" width="2" height="1" fill="#000000" />
  <rect x="10" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="12" y="27" width="2" height="1" fill="#000000" />
  <rect x="28" y="27" width="2" height="1" fill="#000000" />
  <rect x="30" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="32" y="27" width="2" height="1" fill="#000000" />
  <rect x="40" y="27" width="2" height="1" fill="#000000" />
  <rect x="42" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="27" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="27" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="27" width="2" height="1" fill="#000000" />
  <rect x="4" y="28" width="34" height="1" fill="#000000" />
  <rect x="40" y="28" width="2" height="1" fill="#000000" />
  <rect x="42" y="28" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="28" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="28" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="28" width="2" height="1" fill="#000000" />
  <rect x="4" y="29" width="34" height="1" fill="#000000" />
  <rect x="40" y="29" width="2" height="1" fill="#000000" />
  <rect x="42" y="29" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="29" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="29" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="29" width="2" height="1" fill="#000000" />
  <rect x="4" y="30" width="2" height="1" fill="#000000" />
  <rect x="6" y="30" width="30" height="1" fill="#F1F1F1" />
  <rect x="36" y="30" width="2" height="1" fill="#000000" />
  <rect x="40" y="30" width="2" height="1" fill="#000000" />
  <rect x="42" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="30" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="30" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="30" width="2" height="1" fill="#000000" />
  <rect x="4" y="31" width="2" height="1" fill="#000000" />
  <rect x="6" y="31" width="30" height="1" fill="#F1F1F1" />
  <rect x="36" y="31" width="2" height="1" fill="#000000" />
  <rect x="40" y="31" width="2" height="1" fill="#000000" />
  <rect x="42" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="44" y="31" width="12" height="1" fill="#33FF00" />
  <rect x="56" y="31" width="2" height="1" fill="#F1F1F1" />
  <rect x="58" y="31" width="2" height="1" fill="#000000" />
  <rect x="4" y="32" width="2" height="1" fill="#000000" />
  <rect x="6" y="32" width="30" height="1" fill="#FFB000" />
  <rect x="36" y="32" width="2" height="1" fill="#000000" />
  <rect x="40" y="32" width="2" height="1" fill="#000000" />
  <rect x="42" y="32" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="32" width="2" height="1" fill="#000000" />
  <rect x="4" y="33" width="2" height="1" fill="#000000" />
  <rect x="6" y="33" width="30" height="1" fill="#FFB000" />
  <rect x="36" y="33" width="2" height="1" fill="#000000" />
  <rect x="40" y="33" width="2" height="1" fill="#000000" />
  <rect x="42" y="33" width="16" height="1" fill="#F1F1F1" />
  <rect x="58" y="33" width="2" height="1" fill="#000000" />
  <rect x="4" y="34" width="2" height="1" fill="#000000" />
  <rect x="6" y="34" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="34" width="10" height="1" fill="#000000" />
  <rect x="26" y="34" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="34" width="2" height="1" fill="#000000" />
  <rect x="40" y="34" width="20" height="1" fill="#000000" />
  <rect x="4" y="35" width="2" height="1" fill="#000000" />
  <rect x="6" y="35" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="35" width="10" height="1" fill="#000000" />
  <rect x="26" y="35" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="35" width="2" height="1" fill="#000000" />
  <rect x="40" y="35" width="20" height="1" fill="#000000" />
  <rect x="4" y="36" width="2" height="1" fill="#000000" />
  <rect x="6" y="36" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="36" width="10" height="1" fill="#000000" />
  <rect x="26" y="36" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="36" width="2" height="1" fill="#000000" />
  <rect x="4" y="37" width="2" height="1" fill="#000000" />
  <rect x="6" y="37" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="37" width="10" height="1" fill="#000000" />
  <rect x="26" y="37" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="37" width="2" height="1" fill="#000000" />
  <rect x="4" y="38" width="2" height="1" fill="#000000" />
  <rect x="6" y="38" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="38" width="10" height="1" fill="#000000" />
  <rect x="26" y="38" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="38" width="8" height="1" fill="#000000" />
  <rect x="4" y="39" width="2" height="1" fill="#000000" />
  <rect x="6" y="39" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="39" width="10" height="1" fill="#000000" />
  <rect x="26" y="39" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="39" width="8" height="1" fill="#000000" />
  <rect x="4" y="40" width="2" height="1" fill="#000000" />
  <rect x="6" y="40" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="40" width="10" height="1" fill="#000000" />
  <rect x="26" y="40" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="40" width="4" height="1" fill="#000000" />
  <rect x="40" y="40" width="2" height="1" fill="#33FF00" />
  <rect x="42" y="40" width="2" height="1" fill="#000000" />
  <rect x="4" y="41" width="2" height="1" fill="#000000" />
  <rect x="6" y="41" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="41" width="10" height="1" fill="#000000" />
  <rect x="26" y="41" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="41" width="4" height="1" fill="#000000" />
  <rect x="40" y="41" width="2" height="1" fill="#33FF00" />
  <rect x="42" y="41" width="2" height="1" fill="#000000" />
  <rect x="4" y="42" width="2" height="1" fill="#000000" />
  <rect x="6" y="42" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="42" width="10" height="1" fill="#000000" />
  <rect x="26" y="42" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="42" width="8" height="1" fill="#000000" />
  <rect x="46" y="42" width="6" height="1" fill="#000000" />
  <rect x="4" y="43" width="2" height="1" fill="#000000" />
  <rect x="6" y="43" width="10" height="1" fill="#FFB000" />
  <rect x="16" y="43" width="10" height="1" fill="#000000" />
  <rect x="26" y="43" width="10" height="1" fill="#FFB000" />
  <rect x="36" y="43" width="8" height="1" fill="#000000" />
  <rect x="46" y="43" width="6" height="1" fill="#000000" />
  <rect x="4" y="44" width="2" height="1" fill="#000000" />
  <rect x="6" y="44" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="44" width="2" height="1" fill="#000000" />
  <rect x="20" y="44" width="2" height="1" fill="#33FF00" />
  <rect x="22" y="44" width="2" height="1" fill="#000000" />
  <rect x="24" y="44" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="44" width="2" height="1" fill="#000000" />
  <rect x="46" y="44" width="2" height="1" fill="#000000" />
  <rect x="48" y="44" width="2" height="1" fill="#F1F1F1" />
  <rect x="50" y="44" width="2" height="1" fill="#000000" />
  <rect x="4" y="45" width="2" height="1" fill="#000000" />
  <rect x="6" y="45" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="45" width="2" height="1" fill="#000000" />
  <rect x="20" y="45" width="2" height="1" fill="#33FF00" />
  <rect x="22" y="45" width="2" height="1" fill="#000000" />
  <rect x="24" y="45" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="45" width="2" height="1" fill="#000000" />
  <rect x="46" y="45" width="2" height="1" fill="#000000" />
  <rect x="48" y="45" width="2" height="1" fill="#F1F1F1" />
  <rect x="50" y="45" width="2" height="1" fill="#000000" />
  <rect x="4" y="46" width="2" height="1" fill="#000000" />
  <rect x="6" y="46" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="46" width="2" height="1" fill="#000000" />
  <rect x="20" y="46" width="2" height="1" fill="#33FF00" />
  <rect x="22" y="46" width="2" height="1" fill="#000000" />
  <rect x="24" y="46" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="46" width="2" height="1" fill="#000000" />
  <rect x="46" y="46" width="6" height="1" fill="#000000" />
  <rect x="4" y="47" width="2" height="1" fill="#000000" />
  <rect x="6" y="47" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="47" width="2" height="1" fill="#000000" />
  <rect x="20" y="47" width="2" height="1" fill="#33FF00" />
  <rect x="22" y="47" width="2" height="1" fill="#000000" />
  <rect x="24" y="47" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="47" width="2" height="1" fill="#000000" />
  <rect x="46" y="47" width="6" height="1" fill="#000000" />
  <rect x="4" y="48" width="2" height="1" fill="#000000" />
  <rect x="6" y="48" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="48" width="2" height="1" fill="#000000" />
  <rect x="20" y="48" width="2" height="1" fill="#33FF00" />
  <rect x="22" y="48" width="2" height="1" fill="#000000" />
  <rect x="24" y="48" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="48" width="2" height="1" fill="#000000" />
  <rect x="40" y="48" width="6" height="1" fill="#000000" />
  <rect x="4" y="49" width="2" height="1" fill="#000000" />
  <rect x="6" y="49" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="49" width="2" height="1" fill="#000000" />
  <rect x="20" y="49" width="2" height="1" fill="#33FF00" />
  <rect x="22" y="49" width="2" height="1" fill="#000000" />
  <rect x="24" y="49" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="49" width="2" height="1" fill="#000000" />
  <rect x="40" y="49" width="6" height="1" fill="#000000" />
  <rect x="4" y="50" width="2" height="1" fill="#000000" />
  <rect x="6" y="50" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="50" width="6" height="1" fill="#000000" />
  <rect x="24" y="50" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="50" width="2" height="1" fill="#000000" />
  <rect x="40" y="50" width="2" height="1" fill="#000000" />
  <rect x="42" y="50" width="2" height="1" fill="#33FF00" />
  <rect x="44" y="50" width="2" height="1" fill="#000000" />
  <rect x="4" y="51" width="2" height="1" fill="#000000" />
  <rect x="6" y="51" width="12" height="1" fill="#FFB000" />
  <rect x="18" y="51" width="6" height="1" fill="#000000" />
  <rect x="24" y="51" width="12" height="1" fill="#FFB000" />
  <rect x="36" y="51" width="2" height="1" fill="#000000" />
  <rect x="40" y="51" width="2" height="1" fill="#000000" />
  <rect x="42" y="51" width="2" height="1" fill="#33FF00" />
  <rect x="44" y="51" width="2" height="1" fill="#000000" />
  <rect x="4" y="52" width="2" height="1" fill="#000000" />
  <rect x="6" y="52" width="30" height="1" fill="#FFB000" />
  <rect x="36" y="52" width="2" height="1" fill="#000000" />
  <rect x="40" y="52" width="6" height="1" fill="#000000" />
  <rect x="4" y="53" width="2" height="1" fill="#000000" />
  <rect x="6" y="53" width="30" height="1" fill="#FFB000" />
  <rect x="36" y="53" width="2" height="1" fill="#000000" />
  <rect x="40" y="53" width="6" height="1" fill="#000000" />
  <rect x="4" y="54" width="2" height="1" fill="#000000" />
  <rect x="6" y="54" width="30" height="1" fill="#FFB000" />
  <rect x="36" y="54" width="2" height="1" fill="#000000" />
  <rect x="4" y="55" width="2" height="1" fill="#000000" />
  <rect x="6" y="55" width="30" height="1" fill="#FFB000" />
  <rect x="36" y="55" width="2" height="1" fill="#000000" />
  <rect x="4" y="56" width="34" height="1" fill="#000000" />
  <rect x="4" y="57" width="34" height="1" fill="#000000" />
</svg>
```
