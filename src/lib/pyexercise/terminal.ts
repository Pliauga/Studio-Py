// Pure readers for the landing terminal: what a run means for the poster, and
// what a failed run is allowed to show. No DOM, so `check:live` can run them.

const FREE = /(-?\d+(?:\.\d+)?)\s*GB free/i;
const TOTAL = /["']total_gb["']\s*:\s*(\d+(?:\.\d+)?)/;
/** The landing program's own disk size, used when the reader has deleted the line. */
const DEFAULT_TOTAL_GB = 100;

/**
 * How full the disk is, 0 to 1, read from the program's `N GB free` output.
 * `null` when the run printed something else: the plate keeps what it had.
 */
export function densityFromRun(code: string, output: string): number | null {
	const free = FREE.exec(output);
	if (!free) return null;

	const total = Number(TOTAL.exec(code)?.[1] ?? DEFAULT_TOTAL_GB);
	if (!(total > 0)) return null;

	return Math.min(1, Math.max(0, (total - Number(free[1])) / total));
}

/** A line that opens with an exception name, `ZeroDivisionError: ...`, flush left. */
const FAULT = /^[A-Za-z_][\w.]*(?:Error|Exception|Interrupt|Exit|Warning|Iteration)(?::|$)/;

/**
 * The one line of a traceback a reader needs. Pyodide hands back the whole
 * traceback, frames and internals included; the fault is its last unindented
 * line, plus any continuation lines of a multi-line message.
 */
export function faultLine(error: string): string {
	const lines = error
		.split('\n')
		.map((line) => line.trimEnd())
		.filter((line) => line.trim() !== '');
	if (lines.length === 0) return 'Unknown fault';

	for (let index = lines.length - 1; index >= 0; index--) {
		if (FAULT.test(lines[index])) {
			return lines
				.slice(index)
				.map((line) => line.trim())
				.join(' ');
		}
	}

	return lines[lines.length - 1].trim();
}
