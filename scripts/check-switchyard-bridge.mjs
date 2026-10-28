import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const worker = readFileSync(new URL('../src/lib/pyexercise/pyodide.worker.ts', import.meta.url), 'utf8');
const match = worker.match(/const SCENE_PRELUDE = `([\s\S]*?)`;/);
assert.ok(match, 'SCENE_PRELUDE must remain extractable');

const harness = `
import sys as _sys
import types as _types
_events = []
_bridge = _types.ModuleType('_scene_bridge')
_bridge.emit = _events.append
_sys.modules['_scene_bridge'] = _bridge
${match[1]}

def _expect_raises(error, function, *args):
    try:
        function(*args)
    except error:
        return
    raise AssertionError(f'{function.__name__}{args!r} did not raise {error.__name__}')

start_switchyard()
launch_task('  srv   01  ', 0)
launch_task(2, 1)
pause_task('srv 01')
finish_task(2)
launch_task('x' * 30, 2)
_expect_raises(ValueError, launch_task, 'occupied', 2)
_expect_raises(ValueError, launch_task, 'x' * 24, 0)
_expect_raises(ValueError, launch_task, 'bad lane', 3)
_expect_raises(TypeError, launch_task, 'bool lane', False)
_expect_raises(TypeError, launch_task, True, 0)
_expect_raises(ValueError, launch_task, '   ', 0)
_expect_raises(ValueError, pause_task, 'missing')
_expect_raises(ValueError, finish_task, 'missing')
finish_task('srv 01')
print('__EVENTS__' + _json.dumps(_events))
`;

const run = spawnSync('python3', ['-'], {
	input: harness,
	encoding: 'utf8',
	timeout: 15000
});
assert.equal(run.status, 0, run.stderr || `python3 exited ${run.status}`);
const line = run.stdout.trim().split('\n').find((entry) => entry.startsWith('__EVENTS__'));
assert.ok(line, `missing event output: ${run.stdout}`);
const events = JSON.parse(line.slice('__EVENTS__'.length)).map((event) => JSON.parse(event));
assert.deepEqual(events, [
	{ type: 'async_start' },
	{ type: 'async_launch', id: 'srv 01', lane: 0 },
	{ type: 'async_launch', id: '2', lane: 1 },
	{ type: 'async_pause', id: 'srv 01' },
	{ type: 'async_finish', id: '2' },
	{ type: 'async_launch', id: 'x'.repeat(24), lane: 2 },
	{ type: 'async_finish', id: 'srv 01' }
]);

console.log('switchyard bridge: 7 ordered events; label, lane, duplicate, occupancy, and lifecycle checks passed');
