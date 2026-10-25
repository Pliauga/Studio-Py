// Solutions for week 7 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-07.mdx.

const solutions: Record<string, string> = {
	'w07-maxsplit-record': `record = 'srv-01,used=87,total=100'
hostname, rest = record.split(',', 1)
print(hostname, '|', rest)`,
	'w07-pipeline-first-steps': `raw_line = '  Srv-01 , used=87 , total=100  '
line = raw_line.strip()
hostname_part, rest = line.split(',', 1)
print(hostname_part.strip().lower(), '|', rest)`,
	'w07-strip-normalise': `raw = '  SRV-01  '
clean = raw.strip().lower()
print(clean)`
};

export default solutions;
