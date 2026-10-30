// The press jam: when a run succeeds, the halftone screen lurches off register
// along X and snaps home. `px` is CSS pixels of dot shift, by milliseconds since the run.
const KEYFRAMES: readonly (readonly [ms: number, px: number])[] = [
	[0, 0],
	[30, 3],
	[160, 3],
	[190, -1],
	[230, 0]
];

export const JAM_MS = 230;

export function misregistration(elapsedMs: number): number {
	if (!(elapsedMs > 0) || elapsedMs >= JAM_MS) return 0;

	for (let index = 1; index < KEYFRAMES.length; index++) {
		const [end, to] = KEYFRAMES[index];
		if (elapsedMs <= end) {
			const [start, from] = KEYFRAMES[index - 1];
			return from + (to - from) * ((elapsedMs - start) / (end - start));
		}
	}

	return 0;
}
