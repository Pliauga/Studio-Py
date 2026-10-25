#!/usr/bin/env python3
"""Verify the learner-facing "Show solution" corpus.

`src/lib/content/solutions/` is the code a student sees when they press Show
solution. The pedagogy linter verifies the author's copy in its own
`REFERENCE_SOLUTIONS`; nothing checked the app's copy, so it drifted to 47
missing and 6 wrong snippets.

This script treats the MDX as the source of truth: every `<PyExercise>` id must
have a snippet, no snippet may be orphaned, and every snippet must run and
reproduce its exercise's `expectedOutput`.
"""

from __future__ import annotations

import html
import io
import re
import sys
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent.parent.parent
SOLUTIONS_DIR = PROJECT_ROOT / "src" / "lib" / "content" / "solutions"

ATTR_RE = re.compile(r'([a-zA-Z][\w-]*)="([^"]*)"')
# `'w01-assign-and-print': `code`,` — the corpus format written by
# scripts/sync-solutions or by hand.
ENTRY_RE = re.compile(r"'([\w-]+)':\s*`((?:[^`\\]|\\.)*)`", re.S)


def unescape_ts(body: str) -> str:
    """Undo the template-literal escaping the TS files use."""
    return body.replace("\\${", "${").replace("\\`", "`").replace("\\\\", "\\")


def load_exercises() -> dict[str, str]:
    exercises: dict[str, str] = {}
    for path in sorted(ROOT.glob("week-*.mdx")):
        for line in path.read_text(encoding="utf-8").splitlines():
            if "<PyExercise" not in line:
                continue
            attrs = dict(ATTR_RE.findall(line))
            if "id" not in attrs:
                continue
            exercises[attrs["id"]] = html.unescape(attrs.get("expectedOutput", "")).strip()
    return exercises


def load_solutions() -> dict[str, tuple[str, Path]]:
    solutions: dict[str, tuple[str, Path]] = {}
    for path in sorted(SOLUTIONS_DIR.glob("week-*.ts")):
        for match in ENTRY_RE.finditer(path.read_text(encoding="utf-8")):
            solutions[match.group(1)] = (unescape_ts(match.group(2)), path)
    return solutions


SCENE_API_STUBS = {
    "stack_push": lambda value: None,
    "stack_pop": lambda: None,
    "visualize_array": lambda values: None,
    "swap_elements": lambda i, j: None,
    "mark_sorted": lambda index: None,
    "visualize_dataframe": lambda rows: None,
    "filter_rows": lambda keep: None,
    "clear_dataframe": lambda: None,
    "start_conveyor": lambda: None,
    "yield_item": lambda label: None,
    "stop_conveyor": lambda: None,
    "start_switchyard": lambda: None,
    "launch_task": lambda task_id, lane_index: None,
    "pause_task": lambda task_id: None,
    "finish_task": lambda task_id: None,
}


def run_snippet(code: str) -> tuple[bool, str, str]:
    out, err = io.StringIO(), io.StringIO()
    try:
        with redirect_stdout(out), redirect_stderr(err):
            exec(compile(code, "<solution>", "exec"), {"__name__": "__main__", **SCENE_API_STUBS})
    except BaseException as exc:  # noqa: BLE001 - a snippet may raise anything
        return False, out.getvalue(), f"{type(exc).__name__}: {exc}"
    return True, out.getvalue(), err.getvalue()


def main() -> int:
    exercises = load_exercises()
    solutions = load_solutions()
    problems: list[str] = []

    for exercise_id, expected in exercises.items():
        if exercise_id not in solutions:
            problems.append(f"{exercise_id}: no snippet in {SOLUTIONS_DIR.name}/")

    for exercise_id, (_, path) in sorted(solutions.items()):
        if exercise_id not in exercises:
            problems.append(f"{exercise_id}: snippet in {path.name} matches no <PyExercise>")

    for exercise_id, expected in sorted(exercises.items()):
        entry = solutions.get(exercise_id)
        if not entry:
            continue
        code, path = entry
        ok, stdout, error = run_snippet(code)
        if not ok:
            problems.append(f"{exercise_id}: {path.name} snippet raised {error}")
        elif stdout.strip() != expected:
            problems.append(
                f"{exercise_id}: {path.name} prints {stdout.strip()!r}, "
                f"expectedOutput is {expected!r}"
            )

    for problem in problems:
        print(f"  {problem}")

    print(
        f"Checked {len(exercises)} exercises against {len(solutions)} snippets: "
        f"{len(problems)} problem(s)."
    )
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
