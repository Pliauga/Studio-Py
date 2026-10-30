// Regression guard for the live surfaces: what a run does to the poster, what a
// failed run shows, and where the lesson snake rests. Run with
// `node --experimental-strip-types scripts/check-live.mjs`.
import { readFileSync } from 'node:fs';
import { densityFromRun, faultLine } from '../src/lib/pyexercise/terminal.ts';
import { headOffset } from '../src/lib/motion/trail.ts';
import { JAM_MS, misregistration } from '../src/lib/motion/misregistration.ts';
import { LINE_PITCH, layoutForme } from '../src/lib/motion/letterpress.ts';

const DISK = (used, total = 100) => `disk = {"used_gb": ${used}, "total_gb": ${total}}`;

const TRACEBACK = [
	'Traceback (most recent call last):',
	'  File "/lib/python314.zip/_pyodide/_base.py", line 599, in eval_code_async',
	'    await CodeRunner(',
	'  File "<exec>", line 1, in <module>',
	'ZeroDivisionError: division by zero'
].join('\n');

const SYNTAX = [
	'Traceback (most recent call last):',
	'  File "<exec>", line 1',
	'    print(',
	'         ^',
	"SyntaxError: '(' was never closed"
].join('\n');

const approx = (a, b) => a !== null && Math.abs(a - b) < 1e-9;

/** [label, actual, expected] */
const CASES = [
	['91 used -> 0.91', approx(densityFromRun(DISK(91), '9 GB free'), 0.91), true],
	['10 used -> 0.10', approx(densityFromRun(DISK(10), '90 GB free'), 0.1), true],
	['total_gb is read from the code', approx(densityFromRun(DISK(91, 200), '109 GB free'), 0.455), true],
	['missing total falls back to 100', approx(densityFromRun('print("9 GB free")', '9 GB free'), 0.91), true],
	['overfull disk clamps to 1', densityFromRun(DISK(105), '-5 GB free'), 1],
	['unrelated output leaves the plate alone', densityFromRun(DISK(91), 'hello'), null],
	['zero total is rejected', densityFromRun(DISK(0, 0), '0 GB free'), null],

	['traceback -> final line', faultLine(TRACEBACK), 'ZeroDivisionError: division by zero'],
	['syntax error keeps its message', faultLine(SYNTAX), "SyntaxError: '(' was never closed"],
	['multi-line message stays whole', faultLine('Traceback (most recent call last):\nValueError: bad\nvalue'), 'ValueError: bad value'],
	['runtime message passes through', faultLine('Execution timed out (possible infinite loop).'), 'Execution timed out (possible infinite loop).'],
	['empty error is still a fault', faultLine('  \n'), 'Unknown fault'],
	['no frame leaks into the fault', faultLine(TRACEBACK).includes('File'), false]
];

// Waypoint sections: two with exercises, one prose-only, in a 1000px trail.
const section = (top, exercises = 0, passed = 0) => ({ top, exercises, passed });
const SECTIONS = [section(0), section(200, 1, 0), section(500, 2, 0), section(800)];
const withPassed = (...passed) => SECTIONS.map((s, i) => ({ ...s, passed: passed[i] ?? 0 }));

CASES.push(
	['nothing reached: head at the top', headOffset(SECTIONS, 1000, -50), 0],
	['hook read: head steps to the first waypoint', headOffset(SECTIONS, 1000, 250), 200],
	['unsolved exercise holds the head', headOffset(SECTIONS, 1000, 900), 200],
	['passing it releases the head to the next heading', headOffset(withPassed(0, 1), 1000, 250), 500],
	['half-solved section still holds', headOffset(withPassed(0, 1, 1), 1000, 900), 500],
	['all passed, last section unread: head waits at it', headOffset(withPassed(0, 1, 2), 1000, 700), 800],
	['all passed and read to the end: head at the end', headOffset(withPassed(0, 1, 2), 1000, 1000), 1000],
	['no sections: head stays at the top', headOffset([], 1000, 500), 0]
);

const SWEEP = Array.from({ length: JAM_MS + 1 }, (_, ms) => misregistration(ms));

// The forme is measured off the very font the hero ships, so the guard fails if
// either the typeface or the layout drifts away from the other.
const METRICS = JSON.parse(
	readFileSync(new URL('../static/fonts/inter-black.typeface.json', import.meta.url), 'utf8')
);
const advance = (char) => METRICS.glyphs[char].ha / METRICS.resolution;
const measure = (text) =>
	Array.from(text).reduce((total, char) => total + advance(char), 0);

const FORME = layoutForme(['Stop Learning.', 'Start Patching.'], METRICS);
const STACKED = layoutForme(['Stop', 'Learning.', 'Start', 'Patching.'], METRICS);
const ROW0 = FORME.letters.filter((letter) => letter.row === 0);
const ROW1 = FORME.letters.filter((letter) => letter.row === 1);
/** Ink bounds of a laid-out line: proportional type has no fixed cell. */
const span = (row) => [
	row[0].x - advance(row[0].char) / 2,
	row.at(-1).x + advance(row.at(-1).char) / 2
];

CASES.push(
	['press at rest before the run', misregistration(0), 0],
	['a run that has not happened shifts nothing', misregistration(-40), 0],
	['jam holds three pixels off register', misregistration(100), 3],
	['the snap passes through the middle', approx(misregistration(175), 1), true],
	['the screen is home after the jam', misregistration(JAM_MS), 0],
	['stays home long after', misregistration(5000), 0],
	['never leaves the press window', SWEEP.every((px) => px <= 3 && px >= -1), true],
	['non-finite time is treated as at rest', misregistration(Number.NaN), 0],

	['spaces are not blocks: 13 + 14 glyphs', FORME.letters.length, 27],
	['first block is the S of Stop', FORME.letters[0].char, 'S'],
	['second line starts on a new row', ROW1[0].row, 1],
	['line one is centred on the bed', approx(span(ROW0)[0], -measure('Stop Learning.') / 2), true],
	['line one ends where its measure ends', approx(span(ROW0)[1], measure('Stop Learning.') / 2), true],
	['line two is centred on the bed', approx(span(ROW1)[0], -measure('Start Patching.') / 2), true],
	['line one sits behind line two', approx(ROW1[0].z - ROW0[0].z, LINE_PITCH), true],
	['widest line sets the forme width', approx(FORME.width, measure('Start Patching.')), true],
	['the forme is as deep as its lines', approx(FORME.depth, 2 * LINE_PITCH), true],
	['block ids are unique', new Set(FORME.letters.map((l) => l.id)).size, 27],

	['a phone formes the headline as four lines', STACKED.letters.length, 27],
	['the longest word sets the stacked width', approx(STACKED.width, measure('Patching.')), true],
	['stacking narrows the forme', STACKED.width < FORME.width, true],
	['stacked lines stay one pitch apart', approx(STACKED.depth, 4 * LINE_PITCH), true]
);

let failures = 0;
for (const [label, actual, expected] of CASES) {
	if (actual !== expected) {
		failures += 1;
		console.error(`FAIL  ${label}: got ${JSON.stringify(actual)} wanted ${JSON.stringify(expected)}`);
	}
}

console.log(
	failures === 0
		? `live surfaces: ${CASES.length}/${CASES.length} cases pass`
		: `live surfaces: ${failures} of ${CASES.length} cases failed`
);

process.exit(failures === 0 ? 0 : 1);
