// Solutions for week 5 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-05.mdx.

const solutions: Record<string, string> = {
	'w05-class-counter': `class Checker:
    over_limit_count = 0

    def check(self, value, limit):
        if value > limit:
            Checker.over_limit_count += 1

c = Checker()
c.check(120, 100)
c.check(87, 100)
c.check(150, 100)
print(Checker.over_limit_count)`,
	'w05-init-attribute': `class Record:
    def __init__(self, label, value, limit):
        self.label = label
        self.value = value
        self.limit = limit

r = Record('R-001', 87.0, 100.0)
print(r.label, r.value, r.limit)`,
	'w05-method-status': `class Record:
    def __init__(self, label, value, limit):
        self.label = label
        self.value = value
        self.limit = limit

    def percent(self):
        return (self.value / self.limit) * 100

    def status(self):
        p = self.percent()
        if p >= 100:
            return 'OVER LIMIT'
        elif p >= 90:
            return 'WARNING'
        return 'OK'

r_over = Record('R-001', 120.0, 100.0)
r_warn = Record('R-002', 95.0, 100.0)
r_ok = Record('R-003', 80.0, 100.0)
print(r_over.status(), '|', r_warn.status(), '|', r_ok.status())`,
	'w05-stack-push': `class Record:
    def __init__(self, label, value, limit):
        self.label = label
        self.value = value
        self.limit = limit

    def percent(self):
        return (self.value / self.limit) * 100

    def status(self):
        p = self.percent()
        if p >= 100:
            return 'OVER LIMIT'
        if p >= 90:
            return 'WARNING'
        return 'OK'

class Stack:
    def __init__(self):
        self.items = []

    def push(self, value):
        self.items.append(value)

    def pop(self):
        return self.items.pop()

records = [
    Record('R-001', 87.0, 100.0),
    Record('R-002', 95.0, 100.0),
    Record('R-003', 120.0, 100.0),
]
stack = Stack()

for record in records:
    status = record.status()
    stack.push(status)
    stack_push(status)

print(stack.items)
top = stack.pop()
stack_pop()
print(top)`
};

export default solutions;
