# Studio Py

<p align="center">
  <img src="static/studio-py-poster.webp" alt="Studio Py Poster" width="400" />
  <br />
  <sub>25 modules · 24 weeks · runs in your browser</sub>
</p>

A browser-based Python curriculum. 25 modules of runnable code for developers who have shipped software but never written Python.

## Features

- **Live Pyodide terminal.** Editable code runs on click.
- **Reactive print.** Terminal output updates halftone density on the poster.
- **Stateful index.** Filters persist to the URL. Cumulative `T+` time per module.
- **8-bit snake spine.** Progress indicator rendered from sliced pixel sprites.
- **3D sandboxes.** Data structure visualizers built with Threlte + Rapier.

## Stack

- **Framework:** SvelteKit 5 (Runes), SSR
- **Runtime:** Pyodide (WASM) in a Web Worker
- **3D:** Three.js via Threlte + Rapier Physics
- **Styling:** Vanilla CSS, custom motion tokens
- **Deployment:** Cloudflare Pages

## Local dev

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

Verify the pipeline:

```bash
pnpm check
pnpm check:grading
pnpm check:live
```

## Structure

```
src/routes/          — landing, dashboard, lesson
src/lib/components/  — UI, 3D scenes, spine, stamps
src/lib/content/     — curriculum, solutions, marks
src/lib/pyexercise/  — Pyodide worker, runtime, editor
scripts/             — plate generator, validation
static/marks/        — 25 generated module plates
static/snake/        — 8-bit spine sprites
```

## License

MIT
