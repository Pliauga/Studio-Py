// Browser-side proxy for the shared Pyodide worker. The interpreter itself
// boots inside `pyodide.worker.ts`, where `packageBaseUrl` points optional
// packages (pandas, numpy, …) at the official Pyodide CDN.
import type { SceneBridgeCommand } from './sceneCommands';

export type RunOutcome = {
	output: string;
	error: string | null;
	/** True when the worker was killed for exceeding `RUN_TIMEOUT_MS`. */
	timedOut?: boolean;
	/** True when stdout matched but the exercise's hidden assertions failed. */
	checkFailed?: boolean;
};

/**
 * Hard ceiling on executing user code. Pyodide shares the worker's single
 * thread, so an interpreter stuck in `while True:` cannot be interrupted from
 * JS — the only exit is terminating the worker and booting a fresh one.
 *
 * This deadline starts when the worker reports `started`, so the one-off
 * pandas/numpy wheel download on a cold cache cannot be mistaken for a loop.
 */
export const RUN_TIMEOUT_MS = 4000;

/**
 * Hard ceiling on a whole run, armed before the interpreter is asked to boot.
 * It covers queueing, interpreter boot, package streaming and execution, and it
 * fires whether or not `started` ever arrives — a stalled CDN during a cold
 * load produces no signal, so the outer deadline must not depend on one.
 */
export const LOAD_CEILING_MS = 30000;

/** Hard ceiling on a boot that is not part of a run (page mount warm-up). */
export const INIT_CEILING_MS = 30000;

export const TIMEOUT_MESSAGE =
	'Execution timed out (possible infinite loop). The environment has been reset.';

/** The run hit the outer ceiling before user code started: the load stalled. */
export const LOAD_TIMEOUT_MESSAGE =
	'Python could not finish loading in time. Check your connection and press Run again.';

/** The interpreter never finished booting. */
export const BOOT_TIMEOUT_MESSAGE =
	'Python did not finish starting. Check your connection and press Run again.';

/** Returned to runs that were queued behind a run that had to be killed. */
export const RESET_MESSAGE =
	'The Python environment was reset before this run started. Press Run again.';

type InitWaiter = {
	resolve: () => void;
	reject: (error: Error) => void;
};

type RunWaiter = {
	resolve: (outcome: RunOutcome) => void;
	reject: (error: Error) => void;
};

/** Boot milestones, forwarded from the worker so a UI can narrate the download. */
export type BootStage = {
	stage: 'fetch-start' | 'fetch-progress' | 'fetch-done' | 'ready';
	file?: string;
	loaded?: number;
	total?: number;
};

type WorkerRequest =
	| { type: 'init'; id: number; progress?: boolean }
	| { type: 'run'; id: number; code: string; checks?: string | null };

type WorkerMessage =
	| { type: 'ready'; id: number }
	| { type: 'init-error'; id: number; error: string }
	| { type: 'started'; id: number }
	| { type: 'result'; id: number; output: string; error: string | null; checkFailed?: boolean }
	| { type: 'command'; command: SceneBridgeCommand }
	| ({ type: 'stage'; id: number } & BootStage);

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let messageSeq = 0;
const initWaiters = new Map<number, InitWaiter>();
const runWaiters = new Map<number, RunWaiter>();
const commandListeners = new Set<(command: SceneBridgeCommand) => void>();
const stageListeners = new Set<(stage: BootStage) => void>();
/** Deadline per in-flight run, cleared when the worker answers. */
const runTimers = new Map<number, ReturnType<typeof setTimeout>>();
/** Runs the worker has confirmed reached user code, so expiry wording is honest. */
const startedRuns = new Set<number>();

/** Subscribe to scene commands emitted by Python (`spawn_cube`, `drop_cube`, `clear_scene`). */
export function onSceneCommand(listener: (command: SceneBridgeCommand) => void): () => void {
	commandListeners.add(listener);
	return () => commandListeners.delete(listener);
}

/** Subscribe to interpreter boot milestones (asset fetches, ready). */
export function onBootStage(listener: (stage: BootStage) => void): () => void {
	stageListeners.add(listener);
	return () => stageListeners.delete(listener);
}

function toError(value: unknown): Error {
	return value instanceof Error ? value : new Error(String(value));
}

function getWorker(): Worker {
	if (worker) return worker;

	if (typeof Worker === 'undefined') {
		throw new Error('Python exercises need a browser with Web Worker support.');
	}

	const created = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
		type: 'module',
		name: 'pyodide'
	});

	created.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
		handleMessage(event.data);
	});

	created.addEventListener('error', (event) => {
		shutdown(new Error(event.message || 'The Python runtime crashed.'));
	});

	created.addEventListener('messageerror', () => {
		shutdown(new Error('The Python runtime sent an unreadable message.'));
	});

	worker = created;
	return created;
}

function shutdown(error: Error) {
	for (const timer of runTimers.values()) clearTimeout(timer);
	runTimers.clear();
	startedRuns.clear();

	worker?.terminate();
	worker = null;
	readyPromise = null;

	for (const waiter of initWaiters.values()) waiter.reject(error);
	initWaiters.clear();

	for (const waiter of runWaiters.values()) waiter.reject(error);
	runWaiters.clear();
}

function handleMessage(message: WorkerMessage) {
	if (!message || typeof message !== 'object') return;

	if (message.type === 'ready') {
		initWaiters.get(message.id)?.resolve();
		initWaiters.delete(message.id);
		return;
	}

	if (message.type === 'init-error') {
		worker?.terminate();
		worker = null;
		readyPromise = null;

		const error = new Error(message.error);
		initWaiters.get(message.id)?.reject(error);
		initWaiters.delete(message.id);
		return;
	}

	if (message.type === 'stage') {
		const { type: _type, id: _id, ...stage } = message;
		for (const listener of stageListeners) listener(stage);
		return;
	}

	if (message.type === 'command') {
		for (const listener of commandListeners) listener(message.command);
		return;
	}

	if (message.type === 'started') {
		// User code is about to run: swap the outer load ceiling for the shorter
		// execution deadline so wheel downloads are never called a hang.
		const timer = runTimers.get(message.id);
		if (timer) clearTimeout(timer);
		if (runWaiters.has(message.id)) {
			startedRuns.add(message.id);
			runTimers.set(message.id, setTimeout(() => expire(message.id), RUN_TIMEOUT_MS));
		}
		return;
	}

	if (message.type === 'result') {
		const timer = runTimers.get(message.id);
		if (timer) clearTimeout(timer);
		runTimers.delete(message.id);
		startedRuns.delete(message.id);

		runWaiters.get(message.id)?.resolve({
			output: message.output,
			error: message.error,
			checkFailed: message.checkFailed === true
		});
		runWaiters.delete(message.id);
	}
}

/**
 * The run overran its deadline: terminate the worker and hand the caller a
 * result. `shutdown` runs first so a wedged thread stops burning CPU before the
 * caller re-renders.
 */
function expire(id: number): void {
	const waiter = runWaiters.get(id);
	if (!waiter) return;

	const reachedUserCode = startedRuns.has(id);

	runWaiters.delete(id);
	runTimers.delete(id);
	startedRuns.delete(id);

	// Runs still queued behind this one are reset, not timed out, so they get
	// the reset wording rather than inheriting this message.
	shutdown(new Error(RESET_MESSAGE));
	waiter.resolve({
		output: '',
		error: reachedUserCode ? TIMEOUT_MESSAGE : LOAD_TIMEOUT_MESSAGE,
		timedOut: true
	});
}

/** Settle a run that never made it to the worker, e.g. its boot failed. */
function failRun(id: number, error: Error): void {
	const timer = runTimers.get(id);
	if (timer) clearTimeout(timer);
	runTimers.delete(id);
	startedRuns.delete(id);

	const waiter = runWaiters.get(id);
	runWaiters.delete(id);
	waiter?.reject(error);
}

/**
 * Start (or join) the single Pyodide worker shared by every exercise on the
 * page. The first exercise to mount pays the ~10 MB download.
 *
 * The boot itself is untimed: callers own the deadline, so a run can bound
 * boot+execute with one clock instead of racing two. `warmUpPython` adds the
 * standalone deadline for page-mount warm-ups that nothing else bounds.
 */
function bootWorker(): Promise<void> {
	if (readyPromise) return readyPromise;

	let created: Worker;
	try {
		created = getWorker();
	} catch (error) {
		return Promise.reject(toError(error));
	}

	const id = ++messageSeq;
	readyPromise = new Promise<void>((resolve, reject) => {
		initWaiters.set(id, { resolve, reject });
		created.postMessage({ type: 'init', id, progress: true } satisfies WorkerRequest);
	}).catch((error) => {
		readyPromise = null;
		throw error;
	});

	return readyPromise;
}

/** Boot the interpreter with a ceiling, for warm-ups that are not part of a run. */
export function warmUpPython(): Promise<void> {
	const boot = bootWorker();
	const timer = setTimeout(() => {
		if (readyPromise === boot) shutdown(new Error(BOOT_TIMEOUT_MESSAGE));
	}, INIT_CEILING_MS);

	return boot.finally(() => clearTimeout(timer));
}

/** Execute code in the warm worker and resolve with captured stdout or a traceback. */
export async function runPython(code: string, checks?: string | null): Promise<RunOutcome> {
	const id = ++messageSeq;

	/**
	 * Armed before the interpreter is asked to boot. A stalled CDN on a cold
	 * cache never reports `started`, so this ceiling — not the execution
	 * deadline — is what keeps the UI from hanging forever.
	 */
	const outcome = new Promise<RunOutcome>((resolve, reject) => {
		runWaiters.set(id, { resolve, reject });
		runTimers.set(id, setTimeout(() => expire(id), LOAD_CEILING_MS));
	});

	try {
		await bootWorker();
	} catch (error) {
		failRun(id, toError(error));
		return outcome;
	}

	// The ceiling may have fired while the interpreter was still booting.
	if (!runWaiters.has(id)) return outcome;

	const active = worker;
	if (!active) {
		failRun(id, new Error('The Python runtime is not available.'));
		return outcome;
	}

	active.postMessage({ type: 'run', id, code, checks: checks ?? null } satisfies WorkerRequest);
	return outcome;
}
