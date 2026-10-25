// Solutions for week 3 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-03.mdx.

const solutions: Record<string, string> = {
	'w03-default-warning': `def status_of(percent, warning_at=90):
    if percent >= 100:
        return 'OVER LIMIT'
    elif percent >= warning_at:
        return 'WARNING'
    return 'OK'

print(status_of(95))
print(status_of(95, 96))`,
	'w03-return-not-print': `def add_tax(price):
    return price * 1.2

total = add_tax(100)
print(total)`,
	'w03-unpack-record': `def check_record(value, limit):
    difference = value - limit
    percent = (value / limit) * 100
    return difference, percent

difference, percent = check_record(87, 100)
print(difference, percent)`
};

export default solutions;
