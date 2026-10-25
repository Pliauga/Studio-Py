// Reactive bridge onto the shared Pyodide worker in `src/lib/pyexercise/`.
// The worker owns the interpreter; this store owns the UI-facing state so
// components never hold a Worker reference themselves.
import { onSceneCommand, runPython, warmUpPython, type RunOutcome } from '#lib/pyexercise/runtime.ts';
import type { SequencedSceneBridgeCommand } from '#lib/pyexercise/sceneCommands.ts';

let boot: Promise<void> | null = null;

// Only the newest run may write state: a later `runCode` supersedes an earlier
// one whose result has not landed yet.
let runToken = 0;

function transcriptOf(outcome: RunOutcome): string {
	if (!outcome.error) return outcome.output;

	const printed = outcome.output && !outcome.output.endsWith('\n') ? `${outcome.output}\n` : outcome.output;
	return `${printed}${outcome.error}`;
}

class PythonRunner {
	isReady = $state(false);
	isRunning = $state(false);
	/** Id of the newest run; a consumer compares it to the id it started. */
	runId = $state(0);
	/** Whole transcript: what the terminal pane shows. */
	output = $state('');
	/** Printed output only, so a diff can compare it without the traceback. */
	stdout = $state('');
	/** Traceback text for the last run, or null. */
	error = $state<string | null>(null);
	/** True when the last run was killed by the watchdog rather than raising. */
	timedOut = $state(false);
	/**
	 * Scene commands emitted by Python, oldest first, each stamped with an
	 * increasing `seq`. A `clear` replaces the history, so it stays bounded and a
	 * sandbox that mounts late replays only what is still on stage.
	 */
	sceneCommands = $state<SequencedSceneBridgeCommand[]>([]);

	private commandSeq = 0;

	constructor() {
		onSceneCommand((command) => {
			const stamped = { ...command, seq: ++this.commandSeq };
			this.sceneCommands = command.type === 'clear' ? [stamped] : [...this.sceneCommands, stamped];
		});
	}

	/**
	 * Drop everything the previous lesson left on stage without booting Python.
	 * Mirrors the `clear_scene()` command so a lesson mount starts clean.
	 */
	clearScene(): void {
		this.sceneCommands = [{ type: 'clear', seq: ++this.commandSeq }];
	}

	/** Boot the interpreter (first call pays the download) or join the boot in flight. */
	warmUp(): Promise<void> {
		if (boot) return boot;

		boot = warmUpPython()
			.then(() => {
				this.isReady = true;
			})
			.catch((error: unknown) => {
				boot = null;
				throw error;
			});

		return boot;
	}

	/**
	 * Reset the transcript, then run `code`. Failures are reported in `output`, not thrown.
	 * Resolves with this run's outcome, or null when a later run superseded it — the
	 * shared state then belongs to that later run, so callers must not read it.
	 */
	async runCode(code: string, checks?: string | null): Promise<RunOutcome | null> {
		const token = ++runToken;
		this.runId = token;
		this.output = '';
		this.stdout = '';
		this.error = null;
		this.timedOut = false;
		this.isRunning = true;

		try {
			await this.warmUp();
			if (token !== runToken) return null;

			const outcome = await runPython(code, checks);
			if (token !== runToken) return null;

			this.stdout = outcome.output;
			this.error = outcome.error;
			this.timedOut = outcome.timedOut === true;
			this.output = transcriptOf(outcome);
			return outcome;
		} catch (error) {
			if (token !== runToken) return null;

			const message = error instanceof Error ? error.message : String(error);
			this.stdout = '';
			this.error = message;
			this.timedOut = false;
			this.output = message;
			return { output: '', error: message };
		} finally {
			if (token === runToken) this.isRunning = false;
		}
	}
}

export const pythonRunner = new PythonRunner();
