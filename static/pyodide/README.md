# Pyodide runtime

Vendored from the [`pyodide`](https://www.npmjs.com/package/pyodide) npm package, version **314.0.7**
(Python 3.14.2, Pyodide ABI 2026.0).

The files copied here are the self-hosted interpreter core:

- `pyodide.mjs`
- `pyodide.asm.mjs`
- `pyodide.asm.wasm`
- `python_stdlib.zip`
- `pyodide-lock.json`

Only the interpreter core is self-hosted. Optional packages, including pandas and its
dependency closure, are loaded on demand from the matching official Pyodide CDN build
(`packageBaseUrl` in `src/lib/pyexercise/pyodide.worker.ts`). The lockfile here still
describes the exact wheels the CDN serves, so package resolution stays reproducible.

Pyodide is licensed under the [MPL-2.0](https://github.com/pyodide/pyodide/blob/main/LICENSE).