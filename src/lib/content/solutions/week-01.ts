// Solutions for week 1 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-01.mdx.

const solutions: Record<string, string> = {
	'w01-assign-and-print': `hostname = 'srv-07'
used_gb = 180
used_gb = 190
print(hostname, used_gb)`,
	'w01-cast-before-math': `raw_used = '87.5'
bonus = 12.5
total = float(raw_used) + bonus
print(total)`,
	'w01-delta-percentage': `start_used = 120
current_used = 170
limit = 200
growth_pct = ((current_used - start_used) / limit) * 100
print(growth_pct)`,
	'w01-fstring-report': `hostname = 'srv-07'
used = 190
limit = 200
percent = (used / limit) * 100
print(f'{hostname}: {percent:.1f}% used')`
};

export default solutions;
