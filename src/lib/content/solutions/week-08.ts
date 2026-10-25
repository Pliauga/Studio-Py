// Solutions for week 8 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-08.mdx.

const solutions: Record<string, string> = {
	'w08-get-fallback': `data = dict(login='python', public_repos=160)
repo_count = data.get('repo_count', 'unknown')
print(repo_count)`,
	'w08-regex-redact': `import re
text = 'Server IP: 192.168.0.10, DNS: 8.8.8.8'
redacted = re.sub(r'\\d+\\.\\d+\\.\\d+\\.\\d+', '[REDACTED]', text)
print(redacted)`,
	'w08-stringio-rows': `import pandas as pd
from io import StringIO
csv_text = 'name,used\\na,87\\nb,120'
df = pd.read_csv(StringIO(csv_text))
print(len(df))`
};

export default solutions;
