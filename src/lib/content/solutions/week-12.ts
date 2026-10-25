// Solutions for week 12 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-12.mdx.

const solutions: Record<string, string> = {
	'w12-resend-history': `history = [{'role': 'system', 'content': 'You are a concise ops assistant.'}]
def turn(user_text, reply):
    history.append({'role': 'user', 'content': user_text})
    history.append({'role': 'assistant', 'content': reply})
turn('2+2?', '4')
print(len(history), [m['role'] for m in history])`,
	'w12-threshold-edge': `def status_of(n, warning_at=50, limit=100):
    if n >= limit:
        return 'OVER LIMIT'
    return 'WARNING' if n >= warning_at else 'OK'

def test_status_boundaries():
    assert status_of(49) == 'OK'
    assert status_of(50) == 'WARNING'
    assert status_of(99) == 'WARNING'
    assert status_of(100) == 'OVER LIMIT'

test_status_boundaries()
print(status_of(49), status_of(50), status_of(99), status_of(100))`
};

export default solutions;
