// Solutions for week 11 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-11.mdx.

const solutions: Record<string, string> = {
	'w11-options-from-data': `regions = ['eu', 'us', 'eu', 'apac']
options = ['all'] + sorted(set(regions))
print(options)`,
	'w11-session-state-counter': `state = {}

def run_once(state, clicked):
    if 'scans' not in state:
        state['scans'] = 0
    if clicked:
        state['scans'] += 1

for clicked in (False, True, True, True):
    run_once(state, clicked)
print('Total:', state['scans'])`
};

export default solutions;
