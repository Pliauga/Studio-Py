# Edge-Case Evidence — Pyodide backend

Reproduce every number below with the commands in each section. Browser runs use the
system Chrome through Playwright against `HOME=/tmp/dsh-preview-home pnpm dev --port 4180`
(`BASE` overrides the URL).

## 1. Cold-start ceiling

`src/lib/pyexercise/runtime.ts` defines three independent deadlines:

| constant | value | armed | fires when |
| --- | --- | --- | --- |
| `RUN_TIMEOUT_MS` (`runtime.ts:21`) | 4000 ms | when the worker posts `started` | user code is running |
| `LOAD_CEILING_MS` (`runtime.ts:29`) | 30000 ms | **synchronously, before the boot is requested** (`runtime.ts:271`) | anything before user code runs |
| `INIT_CEILING_MS` (`runtime.ts:32`) | 30000 ms | page-mount warm-up (`runtime.ts:251`) | the interpreter never starts |

The ceiling does not depend on `{ type: 'started' }`: `runPython` registers the run and
arms the timer first, then awaits the boot (`runtime.ts:261-271`). If the CDN stalls during
a cold load the worker never reports `started`, the timer still fires, and
`expire()` (`runtime.ts:188`) reads `startedRuns` (`runtime.ts:79`, `runtime.ts:166`) to
choose which message to return before terminating the worker:

- never reached user code → `LOAD_TIMEOUT_MESSAGE` (`runtime.ts:38`)
  `Python could not finish loading in time. Check your connection and press Run again.`
- reached user code → `TIMEOUT_MESSAGE` (`runtime.ts:34`)
  `Execution timed out (possible infinite loop). The environment has been reset.`
- standalone warm-up → `BOOT_TIMEOUT_MESSAGE` (`runtime.ts:42`)

### Simulated stalled CDN, no browser

`pnpm check:timeouts` (`scripts/check-timeouts.mjs`) replaces `globalThis.Worker` with a
fake that records target lifecycle, so a hung `init` or hung `result` is exact:

```
ok   cold-load stall settled in 30001 ms with a clean timeout
ok   the run after a kill boots a fresh worker and succeeds
ok   warm-up ceiling fired in 30002 ms
ok   infinite loop killed in 4025 ms
```

`evidence/check-timeouts.log`

### Blocked / stalled / slow jsDelivr, in the real app

`scripts/check-cdn-ceiling.mjs` routes the worker's package fetches
(`context.route` does intercept dedicated-worker requests) and drives
`/dev/worker-test`, which runs `import pandas as pd; print(pd.__version__)`.

| scenario | route handling | measured | result |
| --- | --- | --- | --- |
| blocked | `route.abort('connectionfailed')` | 10.9 s | `ModuleNotFoundError: No module named 'pandas'`, Run re-enabled; after unblocking the same page returns `3.0.2` |
| stalled | handler never resolves (5 fetches held) | 30.4 s | `Python could not finish loading in time…`, Run re-enabled; after releasing the fetches the same page returns `3.0.2` |
| slow but healthy | 18 s delay per fetch, then continue | 20.7 s | `3.0.2`, no timeout message — the ceiling does not false-fire |

`evidence/cdn-block.log`, `evidence/cdn-stall.log`, `evidence/cdn-slow.log`

A blocked CDN fails fast and surfaces Python's own `ModuleNotFoundError`; a stalled one is
caught by the 30 s ceiling. In both cases `isRunning` returns to `false`, so the Run button
is usable again without a reload.

## 2. Five `while True:` runs — orphaned workers

`scripts/check-orphan-workers.mjs` opens `/lesson/week-16-async-io-and-concurrency`
(five exercises), types `while True:\n    pass` into the first editor, runs it five times,
and measures Web Worker targets through CDP `Target.setDiscoverTargets` +
`Target.getTargets`. A worker is counted as live only after its teardown settles.

| kill | settled | message | live worker targets after teardown |
| --- | --- | --- | --- |
| 1 | 6092 ms | `Execution timed out (possible infinite loop)…` | 0 |
| 2 | 5209 ms | same | 0 |
| 3 | 5311 ms | same | 0 |
| 4 | 5260 ms | same | 0 |
| 5 | 5242 ms | same | 0 |

- targets created: **6**, destroyed: **5**, alive afterwards: **1** (the one in use)
- live workers after the 5th kill: **0**
- **orphaned workers: 0**
- sixth run (last exercise on the page, `print('sixth run ok')`): executed in 10030 ms and
  printed `sixth run ok`

`evidence/orphans.log`

The settle time exceeds 4 s because the deadline plus UI re-render is measured from the
click, including the click-to-worker latency; the deadline itself is verified at 4025 ms by
`check:timeouts`.

## 3. `w04-split-fields` — what changed?

The exercise was retargeted because the scaffold didn't require `float()`. Separately, the matcher was tightened to require brackets, closing the `w03-unpack-record` hole.

Before, `w04-split-fields` asked for `expectedOutput="R-001 87.0 100.0"` while its
untouched scaffold printed `R-001 87 100`. Under any numeric normalisation `87 == 87.0`,
so the scaffold passed without ever calling `float()`: the waypoint did not test casting.

The retarget changes the expected output and the reference solution together:

```diff
- expectedOutput="R-001 87.0 100.0"
+ expectedOutput="R-001 187.0"
```

and the reference solution sums the cast values, which is the only way to reach `187.0`:

```diff
- print(label, float(value), float(limit))
+ print(label, float(value) + float(limit))
```

The scaffold is unchanged (`print(label, value, limit)` still prints text), so the learner
must add the numbers as numbers.

Independently, the matcher was tightened, not relaxed. The first draft of
`comparableTokens` (`src/lib/pyexercise/format.ts:42`) replaced brackets with a space,
which made `(-13, 87.0)` token-identical to `-13 87.0` and let the un-unpacked
`w03-unpack-record` scaffold pass. Brackets are now significant:

```ts
.replace(/([[\](){}])/g, ' $1 ')
```

Post-change audit, enforced on every run:

- `pnpm lint:pedagogy` → `Checked 77 exercises across 96 waypoints: 0 violation(s) in 0 exercise(s).`
  (the linter fails any exercise whose scaffold already prints `expectedOutput` and any
  reference solution that does not)
- `pnpm lint:solutions` → `Checked 77 exercises against 77 snippets: 0 problem(s).`
- `pnpm check:grading` → `grading contract: 17/17 cases pass`

`evidence/pedagogy.log`, `evidence/solutions.log`, `evidence/grading.log`

## 4. Solution leakage into the rendered page

The solution corpus exists in one place, `src/lib/content/solutions/week-01.ts` …
`week-24.ts`, aggregated by `getSolution` (`src/lib/content/solutions/index.ts:59`). It has
exactly two consumers in the app, both inside the click handler:

- `src/lib/components/PyExercise.svelte:8` — the import
- `src/lib/components/PyExercise.svelte:244-247` — `handleShowSolution()` passes the string
  to `replaceCode()`, i.e. into the editor buffer, never into markup
- `src/lib/components/PyExercise.svelte:368` — `disabled={busy || solutionShown || !getSolution(id)}`

The MDX reader never sees the corpus. `src/lib/content/mdx.ts:14` injects only two import
lines into each lesson's `<script>` (`PyExercise`, `PredictOutput`); no lesson body is
rewritten, so prose cannot contain a solution that was not written in the MDX itself.

Measured in the browser (`scripts/check-solution-leakage.mjs`, all 24 lessons), after
waiting for every CodeMirror editor to hydrate:

- exercises rendered: 77
- exercises with a stored solution: 77
- solution-only lines matched in rendered text or HTML: **22** (19 text matches plus 3 HTML
  duplicates; 17 unique line strings across 9 exercises)
- sourced from the solution corpus: **0**
- every one is written verbatim in the lesson's own MDX prose, i.e. worked examples the
  curriculum already shows
- gating on `w16-gather-order`: absent before the click, present in the editor after it

An earlier scan waited a fixed 120 ms after `goto` and recorded 23 hits. Two of those
(`w01-fstring-report`, `w04-comprehension-filter`) were scaffold lines captured before
CodeMirror hydrated; the stable scan also sees one HTML duplicate the earlier run missed,
so 23 − 2 + 1 = 22. `pnpm audit:prose` reproduces the 19 genuine text matches statically.

`evidence/leak.log`

**Disclosure, not covered by the DOM test:** the corpus is bundled into the client because
the Show-solution button runs in the browser. `evidence/bundle.log` finds 61 of the 77
solution bodies verbatim in shipped chunks (`7.zEYOlm0N.js`, `CJnNv4WN.js`). A student can
read them from devtools; closing that requires serving solutions from an endpoint behind an
auth check, which is a product decision, not a rendering bug.

## 5. Pilot Watch 3a/3b — matcher re-grade and prose answer audit

### 5.1 3a: 77-exercise re-grade

`pnpm check:regrade` executes every canonical solution with the local `python3` and feeds
its stdout to `outputsMatch()` against the exercise's `expectedOutput`:

- 77/77 canonical solutions pass; all 77 are byte-identical after trim, so the exact-equality
  fast path is intact.
- 193/193 benign reformattings pass: trailing spaces, CRLF, whole numbers without `.0`,
  commas/pipes replaced by spaces, collapsed horizontal spacing. No formatting variant of a
  correct answer is rejected by the bracket-significant matcher.
- 0 execution failures. `w16-gather-wallclock` (wall-clock assertions) passes.

`evidence/regrade.log`

### 5.2 3b: prose audit

`pnpm audit:prose` reproduces the rendered hit set statically from the MDX and the TS corpus:

- 19 exercise-level solution-only line occurrences (17 unique strings) across 9 exercises.
  None equals or contains its exercise's `expectedOutput`; 0 answer-bearing.
- 0 `expectedOutput` strings stand alone as a prose line.
- 7 exercises do contain the exact `expectedOutput` somewhere inline (30 substring
  occurrences). Five are incidental; two are worked-example reveals:

| exercise | expected | where | verdict |
| --- | --- | --- | --- |
| `w02-elif-order` | `OVER LIMIT` | `week-02.mdx:37` option, `:47-55` corrected example for `percent = 105.0` | **review** — the worked example prints the exercise's answer for the same scenario |
| `w08-get-fallback` | `unknown` | `week-08.mdx:41`, `:55`, `:67` | **review** — worked examples print `data.get("repo_count", "unknown")`; the exercise expects `unknown` |
| `w05-class-counter` | `2` | metadata/prose | incidental |
| `w06-filter-percent` | `2` | metadata/prose | incidental |
| `w07-strip-normalise` | `srv-01` | sample hostname | incidental (data value, not the transform) |
| `w08-stringio-rows` | `2` | metadata/prose | incidental |
| `w09-hash-verify` | `True` | comments/docstrings | incidental |

Recommended MDX-only adjustments (not applied in this audit):

- `w02-elif-order`: change the worked example's `percent` from `105.0` to a value below 90
  (or change the exercise scenario), so the example no longer prints `OVER LIMIT` for the
  exact exercise input.
- `w08-get-fallback`: change the worked-example fallback token from `"unknown"` to another
  sentinel (e.g. `"missing"`), or change the exercise's `expectedOutput`, so the exercise's
  answer is not pre-printed.

No MDX was edited: Task C asks for flags, and `lint:pedagogy`/`lint:solutions` were already
green at certification.

`evidence/prose.log`

### 5.3 Reconciliation with the earlier 23-line claim

The earlier browser scan recorded 23 rendered hits with a fixed 120 ms wait. The stable scan
(`evidence/leak.log`) reports 22: 19 text matches + 3 HTML duplicates. The two extra lines in
the earlier record were scaffold lines captured pre-hydration (`w01-fstring-report`,
`w04-comprehension-filter`); the earlier record also missed one HTML duplicate, so
23 − 2 + 1 = 22. All 19 genuine text occurrences are the prose lines listed by
`pnpm audit:prose`; none is answer-bearing.

## Verification summary

| command | result |
| --- | --- |
| `pnpm check` | 0 errors, 0 warnings |
| `pnpm build` | exit 0 |
| `pnpm check:grading` | 17/17 |
| `pnpm check:regrade` | 77/77 canonical + 193/193 reformattings |
| `pnpm audit:prose` | 0 answer-bearing; 2 review flags |
| `pnpm check:timeouts` | 4/4 |
| `pnpm lint:pedagogy` | 0 violations |
| `pnpm lint:solutions` | 77/77 |

`evidence/check.log`, `evidence/build.log`
