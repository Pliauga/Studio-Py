import type { PyodideInterface } from 'pyodide';
import type { PyProxy } from 'pyodide/ffi';
import type { SceneBridgeCommand } from './sceneCommands';

type WorkerRequest =
	| { type: 'init'; id: number; progress?: boolean }
	| { type: 'run'; id: number; code: string; checks?: string | null };

type WorkerResponse =
	| { type: 'ready'; id: number }
	| { type: 'init-error'; id: number; error: string }
	| { type: 'started'; id: number }
	| { type: 'result'; id: number; output: string; error: string | null; checkFailed?: boolean }
	| { type: 'command'; command: SceneBridgeCommand }
	| { type: 'stage'; id: number; stage: string; file?: string; loaded?: number; total?: number };

type WorkerScope = {
	onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
	postMessage: (message: WorkerResponse) => void;
};

const scope = self as unknown as WorkerScope;
const PYODIDE_PATH = '/pyodide/';

let runtime: Promise<PyodideInterface> | null = null;
/** Init message the boot milestones are reported against, when a UI asked for them. */
let bootReporterId: number | null = null;
let stdout = '';
let runQueue: Promise<unknown> = Promise.resolve();

// The scene API every run can call. Each call validates its arguments and hands
// one JSON object to `_scene_bridge.emit`, which posts it to the main thread.
const SCENE_PRELUDE = `
import json as _json
import math as _math
import re as _re
from _scene_bridge import emit as _emit

_HEX_COLOR = _re.compile(r"^#[0-9a-fA-F]{6}$")
_STACK_EVENTS = []

_SHAPES = ("box", "sphere", "cylinder", "node", "snake")

def _spawn_axes(position, where):
    try:
        axes = tuple(float(v) for v in position)
    except (TypeError, ValueError):
        raise ValueError(f"{where}: position must be three numbers, e.g. (0, 10, 0)") from None
    if len(axes) != 3 or not all(_math.isfinite(v) for v in axes):
        raise ValueError(f"{where}: position must be three finite numbers")
    return axes

def _spawn_size(size, where):
    if isinstance(size, (int, float)):
        size = (size, size, size)
    try:
        dims = tuple(float(v) for v in size)
    except (TypeError, ValueError):
        raise ValueError(f"{where}: size must be a number or three numbers, e.g. (1.5, 1.5, 1.5)") from None
    if len(dims) != 3 or not all(_math.isfinite(v) and v > 0 for v in dims):
        raise ValueError(f"{where}: size must be three positive finite numbers")
    return dims

def spawn_object(position=(0, 10, 0), shape="box", size=(1.5, 1.5, 1.5), color="#000000"):
    """Drops a primitive from the drafting table: box, sphere, cylinder, node or snake."""
    x, y, z = _spawn_axes(position, "spawn_object")
    if not isinstance(shape, str) or shape not in _SHAPES:
        raise ValueError(f"spawn_object: shape must be one of {', '.join(_SHAPES)}")
    if not isinstance(color, str) or not _HEX_COLOR.match(color):
        raise ValueError('color must be a hex string like "#000000"')
    size = _spawn_size(size, "spawn_object")
    if y < 0:
        _emit(_json.dumps({"type": "phantom", "position": [x, y, z], "size": max(size)}))
        raise ValueError(f"spawn_object: y={y:g} is below the drafting table; y must be >= 0")
    _emit(_json.dumps({"type": "spawn", "position": [x, y, z], "shape": shape, "color": color, "size": list(size)}))

def spawn_cube(position=(0, 10, 0), color="#000000", size=1.0):
    spawn_object(position=position, shape="box", size=size, color=color)

def drop_cube():
    _emit(_json.dumps({"type": "drop"}))

def stack_push(value):
    text = " ".join(str(value).split())[:32]
    _STACK_EVENTS.append("push")
    _emit(_json.dumps({"type": "stack_push", "value": text}))

def stack_pop():
    _STACK_EVENTS.append("pop")
    _emit(_json.dumps({"type": "stack_pop"}))

_SORT_SIZE = 0
_MAX_SORT_VALUES = 12

def visualize_array(values):
    global _SORT_SIZE
    try:
        items = list(values)
    except TypeError:
        raise TypeError("values must be a list of numbers") from None
    if not items:
        raise ValueError("visualize_array needs at least one value")
    if len(items) > _MAX_SORT_VALUES:
        raise ValueError(f"visualize_array supports at most {_MAX_SORT_VALUES} values")
    numbers = []
    for item in items:
        if isinstance(item, bool):
            raise TypeError("values must be numbers, not booleans")
        try:
            number = float(item)
        except (TypeError, ValueError):
            raise TypeError("values must be a list of numbers") from None
        if not _math.isfinite(number):
            raise ValueError("values must be finite numbers")
        numbers.append(int(number) if number.is_integer() else number)
    _SORT_SIZE = len(numbers)
    _emit(_json.dumps({"type": "sort_init", "values": numbers}))

def swap_elements(i, j):
    if not isinstance(i, int) or isinstance(i, bool) or not isinstance(j, int) or isinstance(j, bool):
        raise TypeError("indices must be integers")
    if not (0 <= i < _SORT_SIZE and 0 <= j < _SORT_SIZE):
        raise IndexError("index out of range for the visualized array")
    _emit(_json.dumps({"type": "sort_swap", "i": i, "j": j}))

def mark_sorted(index):
    if not isinstance(index, int) or isinstance(index, bool):
        raise TypeError("index must be an integer")
    if not (0 <= index < _SORT_SIZE):
        raise IndexError("index out of range for the visualized array")
    _emit(_json.dumps({"type": "sort_mark", "index": index}))

def clear_scene():
    _emit(_json.dumps({"type": "clear"}))

_DF_ROWS = 0
_MAX_DF_ROWS = 30
_DF_LABEL_CHARS = 18

def _df_label(row, key):
    try:
        value = row[key]
    except (KeyError, TypeError):
        raise ValueError("each row needs a 'host' and a 'status' key") from None
    text = " ".join(str(value).split())
    if not text:
        raise ValueError(f"row '{key}' must not be empty")
    return text[:_DF_LABEL_CHARS]

def visualize_dataframe(rows):
    global _DF_ROWS
    if rows is None or isinstance(rows, (str, bytes, dict)):
        raise TypeError("rows must be a list of dicts like {'host': 'srv-01', 'status': 'OK'}")
    try:
        items = list(rows)
    except TypeError:
        raise TypeError("rows must be a list of dicts like {'host': 'srv-01', 'status': 'OK'}") from None
    if not items:
        raise ValueError("visualize_dataframe needs at least one row")
    if len(items) > _MAX_DF_ROWS:
        raise ValueError(f"visualize_dataframe supports at most {_MAX_DF_ROWS} rows")
    clean = []
    for row in items:
        if not isinstance(row, dict):
            raise TypeError("each row must be a dict with 'host' and 'status' keys")
        clean.append({"host": _df_label(row, "host"), "status": _df_label(row, "status")})
    _DF_ROWS = len(clean)
    _emit(_json.dumps({"type": "df_init", "rows": clean}))

def filter_rows(keep_indices):
    if _DF_ROWS == 0:
        raise ValueError("call visualize_dataframe before filter_rows")
    if keep_indices is None or isinstance(keep_indices, (str, bytes, dict)):
        raise TypeError("keep_indices must be a list of row numbers")
    try:
        items = list(keep_indices)
    except TypeError:
        raise TypeError("keep_indices must be a list of row numbers") from None
    keep = []
    for item in items:
        if isinstance(item, bool):
            raise TypeError("keep_indices must be a list of integers, not booleans")
        try:
            index = int(item.__index__())
        except (AttributeError, TypeError, ValueError):
            raise TypeError("keep_indices must be a list of integers") from None
        if not 0 <= index < _DF_ROWS:
            raise IndexError("row index out of range for the visualized dataframe")
        if index not in keep:
            keep.append(index)
    _emit(_json.dumps({"type": "df_filter", "keep": keep}))

def clear_dataframe():
    global _DF_ROWS
    _DF_ROWS = 0
    _emit(_json.dumps({"type": "df_clear"}))

_CONVEYOR_ACTIVE = False
_CONVEYOR_YIELDED = 0
_MAX_CONVEYOR_ITEMS = 48
_CONVEYOR_LABEL_CHARS = 18

def start_conveyor():
    global _CONVEYOR_ACTIVE, _CONVEYOR_YIELDED
    _CONVEYOR_ACTIVE = True
    _CONVEYOR_YIELDED = 0
    _emit(_json.dumps({"type": "conveyor_start"}))

def yield_item(label):
    global _CONVEYOR_YIELDED
    if not _CONVEYOR_ACTIVE:
        raise ValueError("call start_conveyor before yield_item")
    if isinstance(label, bytes):
        label = label.decode("utf-8", "replace")
    if not isinstance(label, str):
        raise TypeError("yield_item label must be a string")
    text = " ".join(label.split())[:_CONVEYOR_LABEL_CHARS]
    if not text:
        raise ValueError("yield_item label must not be empty")
    if _CONVEYOR_YIELDED >= _MAX_CONVEYOR_ITEMS:
        raise ValueError(f"yield_item supports at most {_MAX_CONVEYOR_ITEMS} items per run")
    _CONVEYOR_YIELDED += 1
    _emit(_json.dumps({"type": "conveyor_yield", "label": text}))

def stop_conveyor():
    global _CONVEYOR_ACTIVE
    _CONVEYOR_ACTIVE = False
    _emit(_json.dumps({"type": "conveyor_stop"}))

_ASYNC_ACTIVE = False
_ASYNC_TASKS = {}
_ASYNC_LANES = {}
_ASYNC_LABEL_CHARS = 24

def start_switchyard():
    global _ASYNC_ACTIVE, _ASYNC_TASKS, _ASYNC_LANES
    _ASYNC_ACTIVE = True
    _ASYNC_TASKS = {}
    _ASYNC_LANES = {}
    _emit(_json.dumps({"type": "async_start"}))

def _async_task_id(task_id):
    if isinstance(task_id, bool) or not isinstance(task_id, (str, int)):
        raise TypeError("task_id must be a string or integer")
    text = " ".join(str(task_id).split())[:_ASYNC_LABEL_CHARS]
    if not text:
        raise ValueError("task_id must not be empty")
    return text

def launch_task(task_id, lane_index):
    if not _ASYNC_ACTIVE:
        raise ValueError("call start_switchyard before launch_task")
    if not isinstance(lane_index, int) or isinstance(lane_index, bool):
        raise TypeError("lane_index must be an integer")
    if not 0 <= lane_index < 3:
        raise ValueError("lane_index must be 0, 1, or 2")
    task = _async_task_id(task_id)
    if task in _ASYNC_TASKS:
        raise ValueError(f"task {task!r} is already active")
    if lane_index in _ASYNC_LANES:
        raise ValueError(f"lane {lane_index} already has an active task")
    _ASYNC_TASKS[task] = lane_index
    _ASYNC_LANES[lane_index] = task
    _emit(_json.dumps({"type": "async_launch", "id": task, "lane": lane_index}))

def pause_task(task_id):
    task = _async_task_id(task_id)
    if task not in _ASYNC_TASKS:
        raise ValueError(f"task {task!r} is not active")
    _emit(_json.dumps({"type": "async_pause", "id": task}))

def finish_task(task_id):
    task = _async_task_id(task_id)
    if task not in _ASYNC_TASKS:
        raise ValueError(f"task {task!r} is not active")
    lane = _ASYNC_TASKS.pop(task)
    del _ASYNC_LANES[lane]
    _emit(_json.dumps({"type": "async_finish", "id": task}))
`;

function describe(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	return message.replace(/^PythonError:\s*/, '').trim() || 'Unknown Python error';
}

function postStage(stage: string, detail: { file?: string; loaded?: number; total?: number } = {}) {
	if (bootReporterId === null) return;
	scope.postMessage({ type: 'stage', id: bootReporterId, stage, ...detail });
}

/**
 * Wrap `fetch` for the duration of the boot so the UI can narrate real asset
 * transfers instead of an indeterminate spinner. Only the interpreter's own
 * files are counted, and the wrapper is removed as soon as boot settles.
 */
function installBootReporter(): () => void {
	if (typeof ReadableStream === 'undefined') return () => {};

	const original = globalThis.fetch;
	const counted = async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
		const file = url.split('/').pop() ?? url;

		if (!/\.(wasm|zip|mjs)$/.test(file)) return original(input, init);

		const response = await original(input, init);
		const total = Number(response.headers.get('content-length') ?? 0) || 0;
		if (!response.body) return response;

		postStage('fetch-start', { file, total });

		const reader = response.body.getReader();
		let loaded = 0;
		let lastPost = 0;

		const stream = new ReadableStream<Uint8Array>({
			async pull(controller) {
				const { done, value } = await reader.read();
				if (done) {
					controller.close();
					postStage('fetch-done', { file, loaded });
					return;
				}
				loaded += value.byteLength;
				const now = Date.now();
				if (now - lastPost > 150) {
					lastPost = now;
					postStage('fetch-progress', { file, loaded, total });
				}
				controller.enqueue(value);
			},
			cancel(reason) {
				void reader.cancel(reason);
			}
		});

		return new Response(stream, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers
		});
	};

	(globalThis as { fetch: typeof fetch }).fetch = counted as typeof fetch;

	return () => {
		(globalThis as { fetch: typeof fetch }).fetch = original;
	};
}

function boot(): Promise<PyodideInterface> {
	const indexURL = new URL(PYODIDE_PATH, globalThis.location.origin).href;

	return (async () => {
		const pyodideModule = (await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`)) as typeof import('pyodide');

		const restoreReporter = installBootReporter();
		let py: PyodideInterface;
		try {
			py = await pyodideModule.loadPyodide({
				indexURL,
				// The core runtime is self-hosted in /pyodide. Optional packages
				// (pandas, numpy, ...) stream from the matching official CDN build.
				packageBaseUrl: `https://cdn.jsdelivr.net/pyodide/v${pyodideModule.version}/full/`
			});
		} finally {
			restoreReporter();
		}

		postStage('ready');

		py.registerJsModule('_scene_bridge', {
			emit: (json: string) =>
				scope.postMessage({ type: 'command', command: JSON.parse(json) as SceneBridgeCommand })
		});

		py.setStdout({
			batched: (chunk: string) => {
				if (!chunk) return;
				stdout += chunk;
				if (!chunk.endsWith('\n')) stdout += '\n';
			}
		});

		// Warnings are diagnostics, not exercise results.
		py.setStderr({ batched: (chunk: string) => console.warn('[python]', chunk) });

		return py;
	})();
}

function ensureRuntime(): Promise<PyodideInterface> {
	if (!runtime) {
		runtime = boot().catch((error) => {
			runtime = null;
			throw error;
		});
	}
	return runtime;
}

/**
 * Pyodide has a single interpreter and stdout buffer, so runs must not
 * interleave when two exercise cards are submitted at once.
 */
function enqueueRun(
	id: number,
	code: string,
	checks?: string | null
): Promise<{ output: string; error: string | null; checkFailed?: boolean }> {
	const task = runQueue.then(() => execute(id, code, checks));
	runQueue = task.then(
		() => undefined,
		() => undefined
	);
	return task;
}

async function execute(
	id: number,
	code: string,
	checks?: string | null
): Promise<{ output: string; error: string | null; checkFailed?: boolean }> {
	const py = await ensureRuntime();

	try {
		await py.loadPackagesFromImports(code);
	} catch (error) {
		return { output: stdout, error: describe(error) };
	}

	// Every run gets a fresh namespace so a previous exercise cannot leak a
	// variable into the next one.
	let namespace: PyProxy | undefined;
	stdout = '';

	// Tell the bridge the clock starts now: package streaming is done and the
	// next statement is user code.
	scope.postMessage({ type: 'started', id });

	try {
		namespace = py.globals.get('dict')() as PyProxy;
		py.runPython(SCENE_PRELUDE, { globals: namespace });
		await py.runPythonAsync(code, { globals: namespace });
		if (checks) {
			try {
				await py.runPythonAsync(checks, { globals: namespace });
			} catch {
				return { output: stdout, error: null, checkFailed: true };
			}
		}
		return { output: stdout, error: null };
	} catch (error) {
		return { output: stdout, error: describe(error) };
	} finally {
		namespace?.destroy();
	}
}

scope.onmessage = (event: MessageEvent<WorkerRequest>) => {
	const request = event.data;

	if (request.type === 'init') {
		bootReporterId = request.progress ? request.id : null;
		ensureRuntime()
			.then(() => scope.postMessage({ type: 'ready', id: request.id }))
			.catch((error) =>
				scope.postMessage({ type: 'init-error', id: request.id, error: describe(error) })
			);
		return;
	}

	if (request.type === 'run') {
		enqueueRun(request.id, request.code, request.checks)
			.then((result) => scope.postMessage({ type: 'result', id: request.id, ...result }))
			.catch((error) =>
				scope.postMessage({
					type: 'result',
					id: request.id,
					output: '',
					error: describe(error)
				})
			);
	}
};