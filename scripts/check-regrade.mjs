/**
 * Pilot Watch 3a: re-grade every canonical solution through the browser matcher.
 *
 * The matcher now treats brackets as significant (`format.ts:45`), so a real
 * solution that prints a tuple where the exercise wants an unpacked pair must
 * fail. This guards the other direction: no correct solution may fail because
 * of spacing, number formatting, or separators.
 *
 * Each solution is executed with the local `python3` and its stdout is fed to
 * `outputsMatch()` with the exercise's `expectedOutput`. Run with
 * `node --experimental-strip-types scripts/check-regrade.mjs`.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { outputsMatch } from '../src/lib/pyexercise/format.ts';

const LESSON_DIR = 'src/content/lessons';
const SOLUTION_DIR = 'src/lib/content/solutions';
const ATTR_RE = /([a-zA-Z][\w-]*)="([^"]*)"/g;
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

function decodeHtml(value) {
	return value
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
		.replace(/&([a-z]+);/gi, (entity, name) => ENTITIES[name.toLowerCase()] ?? entity);
}

function readExercises() {
	const exercises = new Map();
	for (const file of readdirSync(LESSON_DIR).filter((name) => /^week-\d+\.mdx$/.test(name)).sort()) {
		for (const line of readFileSync(`${LESSON_DIR}/${file}`, 'utf8').split('\n')) {
			if (!line.includes('<PyExercise')) continue;
			const attrs = Object.fromEntries([...line.matchAll(ATTR_RE)].map((match) => [match[1], match[2]]));
			if (!attrs.id) continue;
			exercises.set(attrs.id, decodeHtml(attrs.expectedOutput ?? '').trim());
		}
	}
	return exercises;
}

async function readSolutions() {
	const solutions = new Map();
	for (const file of readdirSync(SOLUTION_DIR).filter((name) => /^week-\d+\.ts$/.test(name)).sort()) {
		const module = await import(pathToFileURL(`${SOLUTION_DIR}/${file}`).href);
		for (const [id, code] of Object.entries(module.default)) solutions.set(id, code);
	}
	return solutions;
}

/**
 * The browser prelude injects the 3D scene API into every run. CPython does
 * not, so scene-driven canonical solutions need the same no-ops the linters
 * use; each call only emits a postMessage command in the real runtime.
 */
const SCENE_API_STUBS = `def stack_push(value): pass
def stack_pop(): pass
def visualize_array(values): pass
def swap_elements(i, j): pass
def mark_sorted(index): pass
def visualize_dataframe(rows): pass
def filter_rows(keep): pass
def clear_dataframe(): pass
def start_conveyor(): pass
def yield_item(label): pass
def stop_conveyor(): pass
def start_switchyard(): pass
def launch_task(task_id, lane_index): pass
def pause_task(task_id): pass
def finish_task(task_id): pass
`;

function runPython(code) {
	return spawnSync('python3', ['-'], {
		input: SCENE_API_STUBS + code,
		encoding: 'utf8',
		timeout: 15000,
		maxBuffer: 1024 * 1024
	});
}

/**
 * Benign reformattings of a correct answer. They exercise the token path in
 * `outputsMatch()`; a byte-identical canonical answer alone would only prove
 * the fast path still works.
 */
function formattingVariants(output) {
	const variants = new Map();
	const add = (label, value) => {
		if (value !== output) variants.set(label, value);
	};

	add('trailing spaces', output.split('\n').map((line) => `${line}  `).join('\n'));
	add('crlf line endings', output.replace(/\n/g, '\r\n'));
	add(
		'whole numbers without .0',
		output.replace(/(^|[\s([{,;|])(-?\d+)\.0(?=[\s)\]},;|]|$)/gm, (_, prefix, digits) => `${prefix}${digits}`)
	);
	add('commas replaced by spaces', output.replace(/,/g, ' '));
	add('pipes replaced by spaces', output.replace(/\|/g, ' '));
	add('collapsed horizontal spacing', output.replace(/[ \t]+/g, ' '));

	return [...variants];
}

const exercises = readExercises();
const solutions = await readSolutions();
const failures = [];
let exactMatches = 0;
let variantsChecked = 0;
let variantFailures = 0;

for (const [id, expected] of exercises) {
	const code = solutions.get(id);
	if (!code) {
		failures.push({ id, reason: 'no canonical solution' });
		continue;
	}

	const run = runPython(code);
	if (run.error) {
		failures.push({ id, reason: `could not run python3: ${run.error.message}` });
		continue;
	}
	if (run.status !== 0) {
		failures.push({ id, reason: `solution exited ${run.status}`, stderr: run.stderr.trim() });
		continue;
	}

	const actual = run.stdout;
	if (!outputsMatch(actual, expected)) {
		failures.push({
			id,
			reason: 'outputsMatch() rejected the canonical stdout',
			actual: actual.trimEnd(),
			expected
		});
		continue;
	}
	if (actual.trim() === expected) exactMatches += 1;

	for (const [label, variant] of formattingVariants(actual)) {
		variantsChecked += 1;
		if (!outputsMatch(variant, expected)) {
			variantFailures += 1;
			failures.push({ id, reason: `benign reformatting rejected: ${label}`, actual: variant, expected });
		}
	}
}

for (const failure of failures) {
	console.error(`FAIL  ${failure.id}: ${failure.reason}`);
	if (failure.actual !== undefined) {
		console.error(`      actual   ${JSON.stringify(failure.actual)}`);
		console.error(`      expected ${JSON.stringify(failure.expected)}`);
	}
	if (failure.stderr) console.error(`      stderr   ${JSON.stringify(failure.stderr)}`);
}

const total = exercises.size;
const passed = total - failures.length;
const orphanSolutions = [...solutions.keys()].filter((id) => !exercises.has(id));

for (const id of orphanSolutions) console.error(`FAIL  ${id}: canonical solution has no <PyExercise>`);

console.log(
	failures.length === 0 && solutions.size === total && orphanSolutions.length === 0
		? `re-grade: ${passed}/${total} canonical solutions pass outputsMatch(); ` +
				`${exactMatches}/${total} are already byte-identical after trim; ` +
				`${variantsChecked - variantFailures}/${variantsChecked} benign reformattings still pass`
		: `re-grade: ${passed}/${total} passed, ${failures.length} matcher/execution failure(s), ` +
				`${solutions.size} solutions for ${total} exercises`
);

process.exit(failures.length === 0 && solutions.size === total && orphanSolutions.length === 0 ? 0 : 1);
