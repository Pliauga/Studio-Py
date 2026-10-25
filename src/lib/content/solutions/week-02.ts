// Solutions for week 2 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-02.mdx.

const solutions: Record<string, string> = {
	'w02-compare-disk-percent': `pct_warn = 95.0
pct_over = 105.0
is_warn_1 = (pct_warn >= 90) and (pct_warn < 100)
is_warn_2 = (pct_over >= 90) and (pct_over < 100)
print(is_warn_1, is_warn_2)`,
	'w02-elif-order': `percent = 105.0
if percent >= 100:
    status = 'OVER LIMIT'
elif percent >= 90:
    status = 'WARNING'
else:
    status = 'OK'
print(status)`,
	'w02-range-total': `total = 0
for i in range(1, 6):
    total += i
print(total)`
};

export default solutions;
