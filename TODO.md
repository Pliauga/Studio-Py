# Roadmap

Current build: the OFFMUTE brutalist rewrite is shipped — 24-week curriculum, Pyodide grading, dark mode, and the bento/portal navigation.

## Done

- [x] **Fix Dark Mode** — `data-theme` token swap with a pre-hydration boot script; CodeMirror restyles live through a `Compartment` reconfigure.
- [x] **Refactor Curriculum** — real FastAPI (Week 15), Streamlit (Week 11), and LLM API (Week 12) exercises; hidden grading checks in `checks.ts`.
- [x] **Enforce Bento Box + Portal Transition** — the dashboard ledger grid and the `onNavigate` card-to-lesson morph.

## Next

- [ ] **Build Sorting Race** (Week 4, 3D physics). The Week 4 sort scene is a pillar prototype only; the race format, comparator callbacks, and timing are not built.
- [ ] **Build Data Sculpture** (Week 6, 3D physics). Week 6 has no 3D embed yet.

## Verification

```bash
pnpm check          # svelte-check, 0 errors / 0 warnings
pnpm lint:pedagogy  # curriculum prose rules
pnpm lint:solutions # solution snippets match expected output
pnpm check:grading  # hidden-check coverage
```
