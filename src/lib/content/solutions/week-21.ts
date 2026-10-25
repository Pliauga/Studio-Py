// Solutions for week 21 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-21.mdx.

const solutions: Record<string, string> = {
	'w21-atomic-transfer': `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE quotas (team TEXT PRIMARY KEY, credits INTEGER CHECK(credits >= 0))')
conn.executemany('INSERT INTO quotas VALUES (?, ?)', [('ops', 10), ('dev', 5)])
conn.commit()

def transfer(conn: sqlite3.Connection, src: str, dst: str, amount: int) -> None:
    """Atomically add \`amount\` credits to \`dst\` and deduct \`amount\` from \`src\`, rolling back both on IntegrityError."""
    try:
        with conn:
            conn.execute('UPDATE quotas SET credits = credits + ? WHERE team = ?', (amount, dst))
            conn.execute('UPDATE quotas SET credits = credits - ? WHERE team = ?', (amount, src))
    except sqlite3.IntegrityError:
        pass

transfer(conn, 'ops', 'dev', 50)
print(conn.execute('SELECT team, credits FROM quotas ORDER BY team').fetchall())`,
	'w21-explain-index': `import sqlite3

def ensure_region_index(conn: sqlite3.Connection) -> None:
    """Create a B-tree index on alerts(region) so region lookups avoid a full table scan."""
    conn.execute('CREATE INDEX IF NOT EXISTS idx_alerts_region ON alerts(region)')

conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE alerts (id INTEGER PRIMARY KEY, region TEXT, host TEXT)')
ensure_region_index(conn)
plan = conn.execute('EXPLAIN QUERY PLAN SELECT host FROM alerts WHERE region = ?', ('eu',)).fetchall()
print('INDEX' in plan[0][-1])`,
	'w21-left-join-counts': `import sqlite3

def incident_counts_by_host(conn: sqlite3.Connection) -> list[tuple[str, int]]:
    """Return (host_name, incident_count) for every host in \`hosts\`, including hosts with 0 incidents, ordered by name."""
    sql = '''
    SELECT h.name, COUNT(i.host_name)
    FROM hosts h
    LEFT JOIN incidents i ON i.host_name = h.name
    GROUP BY h.name
    ORDER BY h.name
    '''
    return conn.execute(sql).fetchall()

conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE hosts (name TEXT PRIMARY KEY)')
conn.execute('CREATE TABLE incidents (host_name TEXT)')
conn.executemany('INSERT INTO hosts VALUES (?)', [('srv-01',), ('srv-02',)])
conn.executemany('INSERT INTO incidents VALUES (?)', [('srv-01',), ('srv-01',)])
print(incident_counts_by_host(conn))`
};

export default solutions;
