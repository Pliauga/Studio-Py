// The hero's type forme: one block per glyph, set on the typeface's own advances.
// Units are ems of that typeface; `x`/`z` are the block centres on the press bed.

/** Baseline-to-baseline distance. Inter set tight for display: solid, not airy. */
export const LINE_PITCH = 0.92;

/** The slice of a three.js typeface (`Font.data`) the layout needs: advance per glyph, in font units. */
export type Metrics = { glyphs: Record<string, { ha: number }>; resolution: number };

export type Letter = {
	id: string;
	char: string;
	row: number;
	col: number;
	/** Centre of the block on the bed, em. */
	x: number;
	/** Front-to-back centre of the block on the bed, em. */
	z: number;
	/** Side bearing to side bearing, em: the width of this sort. */
	advance: number;
};

export type Forme = {
	letters: Letter[];
	/** Width of the widest line, em. */
	width: number;
	/** Height of all lines, em. */
	depth: number;
};

/** Advance width of one character, em. Throws rather than silently setting a box. */
export function advanceOf(metrics: Metrics, char: string): number {
	const glyph = metrics.glyphs[char];
	if (!glyph) throw new Error(`letterpress: no glyph for "${char}"`);
	return glyph.ha / metrics.resolution;
}

export function layoutForme(lines: readonly string[], metrics: Metrics): Forme {
	const letters: Letter[] = [];
	let longest = 0;

	lines.forEach((line, row) => {
		// Code points, not UTF-16 units: an astral glyph must stay one block.
		const chars = Array.from(line);
		const advances = chars.map((char) => advanceOf(metrics, char));
		const total = advances.reduce((sum, advance) => sum + advance, 0);
		longest = Math.max(longest, total);

		// Centre each line on its own measure, then walk the cursor across it.
		let cursor = -total / 2;
		chars.forEach((char, col) => {
			const advance = advances[col];
			// A blank sets the measure but is not a sort on the press bed.
			if (char !== ' ') {
				letters.push({
					id: `${row}:${col}`,
					char,
					row,
					col,
					x: cursor + advance / 2,
					z: (row - (lines.length - 1) / 2) * LINE_PITCH,
					advance
				});
			}
			cursor += advance;
		});
	});

	return { letters, width: longest, depth: lines.length * LINE_PITCH };
}
