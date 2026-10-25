// Solutions for week 10 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-10.mdx.

const solutions: Record<string, string> = {
	'w10-one-item-tuple': `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE devices (name TEXT, ip TEXT)')
conn.execute('INSERT INTO devices VALUES (?, ?)', ('AP-Lobby', '10.0.0.10'))

name = 'AP-Lobby'
sql = 'SELECT ip FROM devices WHERE name = ?'
params = (name,)
print(conn.execute(sql, params).fetchall())`,
	'w10-parameterise-the-filter': `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute('CREATE TABLE devices (name TEXT, ip TEXT)')
conn.executemany('INSERT INTO devices VALUES (?, ?)', [('AP-Lobby', '10.0.0.10'), ('Core-Router', '10.0.0.1')])

hostile_name = "AP-Lobby' OR '1'='1"
rows = conn.execute('SELECT ip FROM devices WHERE name = ?', (hostile_name,)).fetchall()
print(rows)`
};

export default solutions;
