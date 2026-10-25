// Solutions for week 17 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-17.mdx.

const solutions: Record<string, string> = {
	'w17-exhausted-generator': `def count_and_peak(readings: list[float], limit: float = 100.0) -> tuple[int, float]:
    """Return (count, max_reading) for readings >= limit using generator expressions without exhausting a single generator twice."""
    count = sum(1 for r in readings if r >= limit)
    peak = max((r for r in readings if r >= limit), default=0.0)
    return count, peak

readings = [85.0, 102.0, 110.0, 90.0]
print(*count_and_peak(readings))`,
	'w17-islice-preview': `import itertools

def infinite_ids(start: int = 1):
    n = start
    while True:
        yield f'INC-{n:03d}'
        n += 1

def take_ids(stream, count: int) -> list[str]:
    """Return a list of the first \`count\` items from \`stream\` without exhausting an infinite iterator."""
    return list(itertools.islice(stream, count))

print(take_ids(infinite_ids(), 3))`,
	'w17-jsonl-generator': `import json

lines = [
    '{"host": "srv-01", "ok": true}',
    '{"host": "srv-02", "ok": false}',
    '{"host": "srv-03", "ok": false}',
]

def failed_hosts(raw_lines: list[str]):
    """Parse each JSON line and lazily yield the 'host' value when 'ok' is False."""
    for line in raw_lines:
        row = json.loads(line)
        if not row['ok']:
            yield row['host']

print(list(failed_hosts(lines)))`,
	'w17-yield-over-limit': `def over_limit_hosts(records: list[tuple[str, float]], limit: float = 100.0):
    """Lazily yield each host from (host, pct) records where pct >= limit."""
    for host, pct in records:
        if pct >= limit:
            yield host

data = [('srv-01', 85.0), ('srv-02', 104.0), ('srv-03', 110.0)]
print(list(over_limit_hosts(data)))`
};

export default solutions;
