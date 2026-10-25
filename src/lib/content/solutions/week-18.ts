// Solutions for week 18 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-18.mdx.

const solutions: Record<string, string> = {
	'w18-basic-decorator': `import functools

def clamp_percent(func):
    """Decorator that preserves func metadata and caps its float return value at 100.0."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return min(func(*args, **kwargs), 100.0)
    return wrapper

@clamp_percent
def raw_pct(used: float, limit: float) -> float:
    return (used / limit) * 100

print(raw_pct(125, 100), raw_pct(80, 100))`,
	'w18-contextmanager-cleanup': `from contextlib import contextmanager

locks: set[str] = set()

@contextmanager
def host_lock(hostname: str):
    """Acquire \`hostname\` in \`locks\`, yield \`hostname\`, and guarantee removal from \`locks\` on exit."""
    locks.add(hostname)
    try:
        yield hostname
    finally:
        locks.remove(hostname)

try:
    with host_lock('srv-01'):
        raise ValueError('deploy failed')
except ValueError:
    pass
print('Remaining locks:', len(locks))`,
	'w18-lru-cache-hits': `from functools import lru_cache

runs = 0

@lru_cache
def parse_tag(raw: str) -> str:
    """Normalize \`raw\` tag (strip and lowercase) with memoization across repeated calls."""
    global runs
    runs += 1
    return raw.strip().lower()

for tag in ['EU', 'US', 'EU', 'EU', 'US']:
    parse_tag(tag)
print('runs:', runs)`,
	'w18-retry-counter': `import functools

def retry(attempts: int = 3):
    """Decorator factory that retries \`func\` up to \`attempts\` times on ConnectionError before re-raising."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exc = None
            for _ in range(attempts):
                try:
                    return func(*args, **kwargs)
                except ConnectionError as exc:
                    last_exc = exc
            raise last_exc
        return wrapper
    return decorator

tries = 0

@retry(attempts=3)
def fetch(host: str) -> str:
    global tries
    tries += 1
    if tries < 3:
        raise ConnectionError('link flap')
    return f'{host}:OK'

print(fetch('srv-07'), fetch.__name__, tries)`
};

export default solutions;
