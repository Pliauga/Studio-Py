// Solutions for week 13 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-13.mdx.

const solutions: Record<string, string> = {
	'w13-argparse-flags': `import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int, default=100)
parser.add_argument('--verbose', action='store_true', default=False)
args = parser.parse_args(['--limit', '90', '--verbose'])
print(type(args.limit).__name__, args.limit, args.verbose)`,
	'w13-exit-code-contract': `def main(percents):
    over = [p for p in percents if p >= 100]
    for p in over:
        print(f'ALERT: {p}%')
    return 1 if over else 0

print('code:', main([85, 102, 91]))
print('code:', main([70, 88]))`,
	'w13-pathlib-parts': `from pathlib import Path
p = Path('/var/log/ops/srv-07.log')
print(p.stem, p.suffix)`
};

export default solutions;
