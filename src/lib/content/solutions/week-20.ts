// Solutions for week 20 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-20.mdx.

const solutions: Record<string, string> = {
	'w20-capped-backoff': `def backoff_seconds(attempt: int, base: float = 1.0, cap: float = 8.0) -> float:
    """Return exponential backoff delay for 1-indexed \`attempt\` starting at \`base\` and capped at \`cap\`."""
    return min(cap, base * (2 ** (attempt - 1)))

print([backoff_seconds(i) for i in range(1, 6)])`,
	'w20-dlq-routing': `def route_failures(items: list[dict], max_attempts: int = 3) -> tuple[list[str], list[str]]:
    """For invalid items, route ids with attempts >= max_attempts to dlq; otherwise increment attempts and route to retry_q."""
    retry_q: list[str] = []
    dlq: list[str] = []
    for item in items:
        if not item['valid']:
            if item['attempts'] >= max_attempts:
                dlq.append(item['id'])
            else:
                item['attempts'] += 1
                retry_q.append(item['id'])
    return retry_q, dlq

queue_items = [
    {'id': 'j1', 'attempts': 1, 'valid': True},
    {'id': 'j2', 'attempts': 3, 'valid': False},
    {'id': 'j3', 'attempts': 1, 'valid': False},
]
retry_ids, dlq_ids = route_failures(queue_items)
print(retry_ids, dlq_ids)`,
	'w20-fifo-queue': `import queue

def drain_queue(q: queue.Queue) -> list[str]:
    """Pull all items from \`q\` in FIFO order, mark each task done, and return them as a list."""
    items: list[str] = []
    while not q.empty():
        items.append(q.get())
        q.task_done()
    return items

q: queue.Queue[str] = queue.Queue()
for host in ['srv-01', 'srv-02', 'srv-03']:
    q.put(host)
print(drain_queue(q))`,
	'w20-idempotent-sql': `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE processed_jobs (job_id TEXT PRIMARY KEY, host TEXT)')

def run_job(job_id: str, host: str) -> bool:
    """Record (job_id, host) idempotently in processed_jobs; return True on first execution and False on duplicates."""
    cur = conn.execute('INSERT OR IGNORE INTO processed_jobs VALUES (?, ?)', (job_id, host))
    return cur.rowcount == 1

print(run_job('j-1', 'srv-01'), run_job('j-1', 'srv-01'))`
};

export default solutions;
