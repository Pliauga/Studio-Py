// The hero's type forme: one block per glyph, set on a monospaced grid. Units are
// ems of the typeface; `x`/`z` are the block centres on the press bed.

/** Courier Prime's advance width, 1228 / 2048 em. */
export const CELL_W = 1228 / 2048;
/** Distance between baselines. */
export const LINE_PITCH = 1;

export type Letter = { id: string; char: string; row: number; col: number; x: number; z: number };

export type Forme = {
	letters: Letter[];
	/** Width of the widest line, em. */
	width: number;
	/** Height of all lines, em. */
	depth: number;
};

export function layoutForme(lines: readonly string[]): Forme {
	const letters: Letter[] = [];
	let longest = 0;

	lines.forEach((line, row) => {
		longest = Math.max(longest, line.length);
		for (let col = 0; col < line.length; col++) {
			const char = line[col];
			if (char === ' ') continue;
			letters.push({
				id: `${row}:${col}`,
				char,
				row,
				col,
				x: (col - (line.length - 1) / 2) * CELL_W,
				z: (row - (lines.length - 1) / 2) * LINE_PITCH
			});
		}
	});

	return { letters, width: longest * CELL_W, depth: lines.length * LINE_PITCH };
}
