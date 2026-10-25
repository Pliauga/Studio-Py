// Solutions for week 4 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-04.mdx.

const solutions: Record<string, string> = {
	'w04-comprehension-filter': `values = [10, 20, 30, 40, 50]
big_values = [v for v in values if v >= 40]
print(big_values)`,
	'w04-dict-get-default': `record = {'label': 'R-001', 'value': 87.0, 'limit': 100.0}
print(record.get('status', 'unknown'))`,
	'w04-split-fields': `line = 'R-001,87,100'
label, value, limit = line.split(',')
print(label, float(value) + float(limit))`,
	'w04-bubble-sort': `line = '87,45,120,63,92'
values = [float(value) for value in line.split(',')]
visualize_array(values)

for i in range(len(values) - 1):
    for j in range(len(values) - 1 - i):
        if values[j] > values[j + 1]:
            values[j], values[j + 1] = values[j + 1], values[j]
            swap_elements(j, j + 1)
    mark_sorted(len(values) - 1 - i)
mark_sorted(0)

print([int(value) for value in values])`
};

export default solutions;
