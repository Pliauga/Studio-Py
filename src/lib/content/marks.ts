export const MARK_COUNT = 25;
const COLS = 5;
const ROWS = Math.ceil(MARK_COUNT / COLS);

/**
 * The SVG masters in `static/marks` are halftone plates with turbulence filters.
 * `scripts/render-marks.mjs` composites them into one atlas: 25 unique SVGs would
 * make the browser run every filter on first paint, and 25 unique bitmaps would
 * still decode 25 times. One bitmap, cropped per card, keeps the index still.
 */
export function markStyle(week: number): string {
	const col = week % COLS;
	const row = Math.floor(week / COLS);
	const x = (col / (COLS - 1)) * 100;
	const y = (row / (ROWS - 1)) * 100;
	return [
		'background-image:url(/marks/sheet.webp)',
		`background-size:${COLS * 100}% ${ROWS * 100}%`,
		`background-position:${x}% ${y}%`,
		'background-repeat:no-repeat'
	].join(';');
}
