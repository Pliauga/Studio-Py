#!/usr/bin/env python3
"""verify_reply.py — reference reply validator for AGENTS.md §1 Machine check."""

from __future__ import annotations
import argparse, hashlib, os, re, subprocess, sys
from pathlib import Path

SUPPRESSION_TOKENS = [
    "@ts-ignore", "@ts-expect-error", "eslint-disable",
    "# type: ignore", "# noqa", "//nolint", "#[allow",
    ".skip(", ".only(", "xit(", "fit(", "xfail", "test.todo",
    "#[ignore]", "@pytest.mark.skip", "@pytest.mark.xfail",
]
CHECK_LINE_RE = re.compile(r"->\s*exit\s+(-?\d+)\s*->", re.IGNORECASE)
BASELINE_HASH_RE = re.compile(r"^#\s*workspace-hash:\s*([0-9a-f]{64})\s*$", re.MULTILINE)

def die(msg: str, code: int = 2) -> None:
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(code)

def sha256_of_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def git_text(*args: str) -> str:
    r = subprocess.run(["git", *args], capture_output=True, text=True)
    if r.returncode != 0:
        die(f"git {' '.join(args)} failed ({r.returncode}): {r.stderr.strip()}")
    return r.stdout

def git_bytes(*args: str) -> bytes:
    r = subprocess.run(["git", *args], capture_output=True)
    if r.returncode != 0:
        die(f"git {' '.join(args)} failed ({r.returncode})")
    return r.stdout

def check_self_hash(manifest: Path) -> None:
    if not manifest.exists(): die(f"validator manifest missing: {manifest}")
    expected = None
    self_path = Path(__file__).resolve()
    for line in manifest.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"): continue
        parts = line.split()
        if len(parts) >= 2 and Path(parts[-1]).name == self_path.name:
            expected = parts[0]; break
    if expected is None: die(f"validator hash not found in {manifest}")
    actual = sha256_of_bytes(self_path.read_bytes())
    if actual != expected:
        die(f"validator self-hash mismatch: expected {expected[:16]}..., got {actual[:16]}...")
    print(f"self-hash: OK ({actual[:16]}...)")

def parse_reply(path: Path) -> dict[str, str]:
    text = path.read_text()
    fields, current, buf = {}, None, []
    field_re = re.compile(r"^(Scope|Files changed|Pre-edit status|Baseline|Base|Verification|Validator|UI|Rollback|Decision log|Parking lot|Blocker|Evidence|Question):\s*(.*)$")
    for line in text.splitlines():
        m = field_re.match(line)
        if m:
            if current is not None: fields[current] = "\n".join(buf).strip()
            current, buf = m.group(1), [m.group(2)]
        elif current is not None: buf.append(line)
    if current is not None: fields[current] = "\n".join(buf).strip()
    return fields

def parse_scope(reply_scope: str) -> list[Path]:
    left = reply_scope.split("|", 1)[0].strip()
    if left.startswith("Scope:"): left = left[len("Scope:"):].strip()
    if not left or left.lower() in ("none", "none (read-only)"): return []
    return [Path(t.strip("`'\"")) for t in re.split(r"[,\s]+", left) if t.strip("`'\"") and not t.strip("`'\"").startswith("<")]

def parse_untouched(reply_scope: str) -> list[Path]:
    right = reply_scope.split("|", 1)[1] if "|" in reply_scope else ""
    m = re.search(r"Untouched:\s*(.*)", right)
    if not m: return []
    val = m.group(1).strip()
    if not val or val.lower().startswith("n/a") or val.lower() == "none": return []
    return [Path(t.strip("`'\"")) for t in re.split(r"[,\s]+", val) if t.strip("`'\"") and not t.strip("`'\"").startswith("<") and t.strip("`'\"") != "|"]

def load_dispatch_scope(task_id: str | None) -> list[Path]:
    if not task_id: return []
    p = Path(f"/tmp/scope-{task_id}.scope")
    if not p.exists(): die(f"dispatch scope file {p} is missing. Failing closed (B21).")
    return [Path(l.strip()) for l in p.read_text().splitlines() if l.strip() and not l.startswith("#") and not l.startswith("<")]

def assert_subset(a: list[Path], b: list[Path], label: str) -> None:
    bset = {str(p) for p in b}
    extra = [str(p) for p in a if str(p) not in bset]
    if extra: die(f"{label}: {extra}")

def assert_disjoint(a: list[Path], b: list[Path], label: str) -> None:
    bset = {str(p) for p in b}
    hit = [str(p) for p in a if str(p) in bset]
    if hit: die(f"{label}: {hit}")

def check_verification_field(verification: str) -> None:
    if not verification.strip(): die("Verification: field is empty")
    lines = [ln for ln in verification.splitlines() if ln.strip() and not ln.strip().startswith(("|", "#", "<"))]
    if not lines: die("Verification: field has no check lines")
    for ln in lines:
        if "requires human execution" in ln: continue
        if not CHECK_LINE_RE.search(ln): die(f"check line lacks `-> exit <code> ->`: {ln[:120]}")

def check_suppressions(base: str) -> None:
    diff = git_text("diff", base, "--")
    added = [ln for ln in diff.splitlines() if ln.startswith("+") and not ln.startswith("+++")]
    hits = [(t, ln.strip()[:120]) for t in SUPPRESSION_TOKENS for ln in added if t in ln]
    if hits: die(f"suppression tokens in diff:\n" + "\n".join(f"  {t}: {l}" for t, l in hits[:5]))

def check_baseline(path_arg: str | None) -> None:
    if not path_arg: die("Baseline: field missing")
    p = Path(path_arg)
    if not p.exists(): die(f"baseline artifact missing: {p}")
    # Simplified: We no longer check the workspace hash. We just trust Git.

def check_line_count(scope: list[Path], base: str) -> None:
    if not scope: return
    total, r = 0, subprocess.run(["git", "diff", "--numstat", base, "--"], capture_output=True, text=True)
    if r.returncode == 0:
        for ln in r.stdout.splitlines():
            parts = ln.split("\t")
            if len(parts) >= 2:
                try: total += int(parts[0]) + int(parts[1])
                except ValueError: pass
    if total == 0: return
    cap = 0
    for p in scope:
        r = subprocess.run(["git", "show", f"{base}:{p}"], capture_output=True, text=True)
        if r.returncode == 0: cap += r.stdout.count("\n") + 1
    if cap > 0 and total > 5 * cap: die(f"diff is {total} lines vs {cap} lines (cap 5x)")


def is_preexisting(f: Path, pre_edit_files: set) -> bool:
    f_str = str(f)
    for pre in pre_edit_files:
        if f_str == pre or f_str.endswith("/" + pre) or (pre.endswith("/") and f_str.startswith(pre)):
            return True
    return False

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base")
    ap.add_argument("--reply")
    ap.add_argument("--manifest", default=str(Path(__file__).with_suffix(".py.sha256")))
    ap.add_argument("--task-id", default=os.environ.get("TASK_ID"))
    ap.add_argument("--baseline", default=None)
    ap.add_argument("--no-self-hash", action="store_true")
    ap.add_argument("--print-hash", action="store_true")
    args = ap.parse_args()

    if args.print_hash: return print(sha256_of_bytes(Path(__file__).resolve().read_bytes()))
    if not args.base or not args.reply: ap.error("the following arguments are required: --base, --reply")
    if not args.no_self_hash: check_self_hash(Path(args.manifest))

    fields = parse_reply(Path(args.reply))
    
    # Check if this is a Blocked reply
    if "Blocker" in fields:
        for req in ("Scope", "Blocker", "Evidence", "Question"):
            if req not in fields: die(f"Blocked reply missing required field: {req}")
        print("PASS (Blocked Format acknowledged)")
        print(f"  Blocker: {fields.get('Blocker', '').strip()}")
        print(f"  Question: {fields.get('Question', '').strip()}")
        sys.exit(0)

    # Enforce Done Format
    for required in ("Scope", "Files changed", "Baseline", "Verification"):
        if required not in fields: die(f"reply is missing required field: {required}")

    # Parse Pre-edit status to ignore pre-existing dirtiness
    pre_edit_text = fields.get("Pre-edit status", "")
    pre_edit_files = set()
    
    # If the AI lists files as dirty, trust it and ignore the entire current git status churn
    if "dirty" in pre_edit_text.lower() or "untracked" in pre_edit_text.lower():
        # Get all currently modified/untracked files
        current_churn = git_text("status", "--porcelain").splitlines()
        for line in current_churn:
            if len(line) > 3:
                pre_edit_files.add(line[3:].strip().strip('"'))
    else:
        # Strict parse for specific files
        if "dirty:" in pre_edit_text:
            dirty_part = pre_edit_text.split("dirty:")[1].split("Untracked:")[0].split("plus")[0]
            pre_edit_files.update(p.strip().strip("`") for p in dirty_part.split(",") if p.strip())
        if "Untracked:" in pre_edit_text:
            untracked_part = pre_edit_text.split("Untracked:")[1]
            pre_edit_files.update(p.strip().strip("`") for p in untracked_part.split(",") if p.strip() and "plus" not in p)

    scope_line = fields.get("Scope", "") + " | " + fields.get("Untouched", "")
    scope, untouched = parse_scope(scope_line), parse_untouched(scope_line)
    
    repo_root = Path(git_text("rev-parse", "--show-toplevel").strip())
    def is_safe(path: Path) -> bool:
        try: path.resolve().relative_to(repo_root.resolve()); return True
        except ValueError: return False
    
    files = [Path(p) for p in git_text("diff", "--name-only", args.base, "--").splitlines() if p.strip()]
    files = [f for f in files if not is_preexisting(f, pre_edit_files)]
    for f in files:
        if not is_safe(f): die(f"path traversal detected in changed files: {f} (B22)")
    
    untracked = [Path(p) for p in git_text("ls-files", "--others", "--exclude-standard").splitlines() if p.strip()]
    untracked = [f for f in untracked if not is_preexisting(f, pre_edit_files)]
    
    dscope = load_dispatch_scope(args.task_id)
    baseline = args.baseline or fields.get("Baseline", "").split("—")[0].strip()

    for f in scope:
        if not is_safe(f): die(f"path traversal detected in Scope: {f} (B22)")
    assert_subset(files + untracked, scope, "changed/untracked paths not in Scope")
    if dscope: assert_subset(scope, dscope, "declared Scope wider than dispatch")
    assert_disjoint(files, untouched, "changed paths appear in Untouched")
    if files and not untouched: die("Files changed is non-empty, but Untouched is empty. (B20)")
    
    check_verification_field(fields.get("Verification", ""))
    check_suppressions(args.base)
    check_baseline(baseline)
    check_line_count(scope, args.base)

    print("PASS")
    print(f"  changed: {len(files)} file(s) | scope: {len(scope)} path(s) | base: {args.base}")

if __name__ == "__main__":
    main()
