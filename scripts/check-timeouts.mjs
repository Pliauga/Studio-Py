#!/usr/bin/env node
/**
 * Proves every deadline in `src/lib/pyexercise/runtime.ts` fires, with a fake
 * Worker standing in for Pyodide so a stalled CDN can be simulated exactly: a
 * worker that accepts `init` and never answers is what a hung wheel download
 * looks like from the main thread.
 *
 * The two 30 s ceilings run concurrently with the 4 s execution deadline, so
 * the check takes about half a minute.
 */
import assert from 'node:assert/strict';

const MODULE = new URL('../src/lib/pyexercise/runtime.ts', import.meta.url).href;

/** Scenario applied to the next constructed worker. Callers set it immediately before triggering a boot. */
let nextScenario = 'healthy';
const created = [];

class FakeWorker extends EventTarget {
	constructor() {
		super();
		this.scenario = nextScenario;
		this.terminated = false;
		this.index = created.length;
		created.push(this);
	}

	postMessage(message) {
		if (this.terminated) return;

		if (message.type === 'init') {
			if (this.scenario === 'silent') return;
			setTimeout(() => this.emit({ type: 'ready', id: message.id }), 5);
			return;
		}

		if (message.type === 'run') {
			if (this.scenario === 'silent') return;
			if (this.scenario === 'exec-stall') {
				setTimeout(() => this.emit({ type: 'started', id: message.id }), 5);
				return;
			}
			setTimeout(() => this.emit({ type: 'started', id: message.id }), 2);
			setTimeout(
				() => this.emit({ type: 'result', id: message.id, output: '7\n', error: null }),
				10
			);
		}
	}

	emit(data) {
		if (this.terminated) return;
		this.dispatchEvent(new MessageEvent('message', { data }));
	}

	terminate() {
		this.terminated = true;
	}
}

globalThis.Worker = FakeWorker;

function elapsed (started) {
	return Date.now() - started;
}

function assertAt (name, ms, expected, tolerance = 1500) {
	assert.ok(
		ms >= expected - tolerance && ms <= expected + tolerance,
		`${name}: deadline fired at ${ms} ms, expected ~${expected} ms`
	);
}

const runStall = await import(`${MODULE}?run-stall`);
const bootStall = await import(`${MODULE}?boot-stall`);
const execStall = await import(`${MODULE}?exec-stall`);

// 1. Cold load stalls: `init` is accepted and never answered, so no `started`
//    ever arrives. The outer ceiling must still settle the run.
nextScenario = 'silent';
const runAt = Date.now();
const runStallOutcome = runStall.runPython('import pandas as pd').then((value) => ({
	value,
	ms: Date.now() - runAt
}));

// 2. Standalone warm-up stalls (page mount, no run pending).
nextScenario = 'silent';
const bootStallWorkerIndex = created.length;
const bootAt = Date.now();
const bootStallOutcome = bootStall.warmUpPython().then(
	() => ({ ok: true, ms: Date.now() - bootAt }),
	(error) => ({ ok: false, error, ms: Date.now() - bootAt })
);

// 3. User code hangs after `started`: the short execution deadline must fire.
nextScenario = 'exec-stall';
const execAt = Date.now();
const execStallOutcome = execStall.runPython('while True: pass').then((value) => ({
	value,
	ms: Date.now() - execAt
}));

const runStallSettled = await runStallOutcome;
const outcome = runStallSettled.value;
assert.equal(outcome.timedOut, true, 'run-stall: timedOut is true');
assert.equal(outcome.error, runStall.LOAD_TIMEOUT_MESSAGE, 'run-stall: message');
assert.equal(created[0].terminated, true, 'run-stall: worker terminated');
assertAt('run-stall', runStallSettled.ms, runStall.LOAD_CEILING_MS);
console.log(`ok   cold-load stall settled in ${runStallSettled.ms} ms with a clean timeout`);

// 4. The reset must leave the runtime usable rather than latched.
nextScenario = 'healthy';
const recoveryIndex = created.length;
const recovered = await runStall.runPython('print(7)');
assert.equal(recovered.output, '7\n', 'run-stall: recovery output');
assert.equal(recovered.error, null, 'run-stall: recovery error');
assert.equal(created.length, recoveryIndex + 1, 'run-stall: a fresh worker booted');
assert.equal(created[recoveryIndex].terminated, false, 'run-stall: the new worker is alive');
console.log('ok   the run after a kill boots a fresh worker and succeeds');

const boot = await bootStallOutcome;
assert.equal(boot.ok, false, 'boot-stall: warmUp must reject');
assert.equal(boot.error.message, bootStall.BOOT_TIMEOUT_MESSAGE, 'boot-stall: message');
assert.equal(created[bootStallWorkerIndex].terminated, true, 'boot-stall: worker terminated');
assertAt('boot-stall', boot.ms, bootStall.INIT_CEILING_MS);
console.log(`ok   warm-up ceiling fired in ${boot.ms} ms`);

const execStallSettled = await execStallOutcome;
const exec = execStallSettled.value;
assert.equal(exec.timedOut, true, 'exec-stall: timedOut is true');
assert.equal(exec.error, execStall.TIMEOUT_MESSAGE, 'exec-stall: message');
assertAt('exec-stall', execStallSettled.ms, execStall.RUN_TIMEOUT_MS);
console.log(`ok   infinite loop killed in ${execStallSettled.ms} ms`);

console.log('\nAll deadlines fire and the runtime recovers.');
