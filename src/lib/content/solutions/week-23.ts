// Solutions for week 23 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-23.mdx.

const solutions: Record<string, string> = {
	'w23-assert-raises': `def require_positive(limit: float) -> float:
    if limit <= 0:
        raise ValueError('limit must be > 0')
    return limit

def check_raises_value_error(fn, arg: float) -> bool:
    """Call fn(arg); return True only if it raised ValueError, and False if it returned normally."""
    try:
        fn(arg)
        return False
    except ValueError:
        return True

print(check_raises_value_error(require_positive, -5), check_raises_value_error(require_positive, 10))`,
	'w23-fake-gateway': `class FakeStore:
    """In-memory fake repository that validates inputs and stores host percentages."""

    def __init__(self) -> None:
        self.rows: dict[str, float] = {}

    def save(self, host: str, pct: float) -> None:
        """Raise ValueError if host is empty or pct < 0; otherwise store pct under host."""
        if not host or pct < 0:
            raise ValueError('invalid host or pct')
        self.rows[host] = pct

    def get(self, host: str) -> float | None:
        """Return the stored percentage for host, or None if missing."""
        return self.rows.get(host)

store = FakeStore()
store.save('srv-07', 98.5)
try:
    store.save('', -1.0)
    rejected = False
except ValueError:
    rejected = True
print(store.get('srv-07'), store.get('missing'), rejected)`,
	'w23-isolated-fixture': `def make_store() -> dict[str, float]:
    return {'srv-01': 85.0}

def test_one(store: dict[str, float]) -> int:
    store['srv-02'] = 102.0
    return len(store)

def test_two(store: dict[str, float]) -> int:
    return len(store)

def run_isolated_suite() -> tuple[int, int]:
    """Run test_one and test_two against isolated store fixtures and return both lengths."""
    return test_one(make_store()), test_two(make_store())

print(*run_isolated_suite())`
};

export default solutions;
