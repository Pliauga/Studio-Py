/**
 * Pilot Watch 3b: does lesson prose leak an exercise's expectedOutput?
 *
 * Two questions, deliberately kept separate:
 *   1. Do the solution-only lines that appear in MDX prose contain the answer?
 *      (`check-solution-leakage.mjs` reported 22 rendered hits; this audit
 *      explains every one of them statically.)
 *   2. Does the exact expectedOutput string occur anywhere in lesson prose,
 *      even when it is not part of a copied solution line?
 *
 * Run with `node --experimental-strip-types scripts/check-prose-answers.mjs`.
 * Exit 1 only for an answer-bearing match: a prose line that equals or contains
 * the expectedOutput, or an expectedOutput that stands alone as a prose line.
 * Inline token collisions (e.g. the character "2") are reported as flags for a
 * human to judge, not as automated failures.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

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
	const exercises = [];
	for (const file of readdirSync(LESSON_DIR).filter((name) => /^week-\d+\.mdx$/.test(name)).sort()) {
		const lines = readFileSync(`${LESSON_DIR}/${file}`, 'utf8').split('\n');
		for (let index = 0; index < lines.length; index += 1) {
			if (!lines[index].includes('<PyExercise')) continue;
			const attrs = Object.fromEntries(
				[...lines[index].matchAll(ATTR_RE)].map((match) => [match[1], decodeHtml(match[2])])
			);
			if (!attrs.id) continue;
			exercises.push({
				id: attrs.id,
				file,
				line: index + 1,
				expected: decodeHtml(attrs.expectedOutput ?? '').trim(),
				initialCode: decodeHtml(attrs.initialCode ?? '')
			});
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

function proseOf(file) {
	return readFileSync(`${LESSON_DIR}/${file}`, 'utf8')
		.split('\n')
		.map((text, index) => ({ number: index + 1, text }))
		.filter((line) => !line.text.includes('<PyExercise'));
}

const exercises = readExercises();
const solutions = await readSolutions();
const distinctiveHits = [];
const answerLeaks = [];
const exactExpectedHits = [];

for (const exercise of exercises) {
	const prose = proseOf(exercise.file);
	const proseText = prose.map((line) => line.text).join('\n');
	const solution = solutions.get(exercise.id);
	if (!solution) {
		console.error(`FAIL  ${exercise.id}: no canonical solution`);
		process.exitCode = 1;
		continue;
	}

	const distinctive = [
		...new Set(
			solution
				.split('\n')
				.map((line) => line.trim())
				.filter(
					(line) =>
						line.length >= 20 && !line.startsWith('#') && !exercise.initialCode.includes(line)
				)
		)
	];

	for (const line of distinctive) {
		const occurrences = prose.filter((candidate) => candidate.text.includes(line));
		if (occurrences.length === 0) continue;

		const answerBearing = line === exercise.expected || line.includes(exercise.expected);
		const hit = {
			id: exercise.id,
			file: exercise.file,
			exerciseLine: exercise.line,
			line,
			answerBearing,
			occurrences: occurrences.map((candidate) => ({
				line: candidate.number,
				text: candidate.text.trim()
			}))
		};
		distinctiveHits.push(hit);
		if (answerBearing) answerLeaks.push(hit);
	}

	if (exercise.expected && proseText.includes(exercise.expected)) {
		const occurrences = prose
			.filter((line) => line.text.includes(exercise.expected))
			.slice(0, 5)
			.map((line) => ({ line: line.number, text: line.text.trim() }));
		const standalone = prose.some((line) => line.text.trim() === exercise.expected);
		exactExpectedHits.push({
			id: exercise.id,
			file: exercise.file,
			exerciseLine: exercise.line,
			expected: exercise.expected,
			standalone,
			occurrences
		});
		if (standalone) answerLeaks.push({ id: exercise.id, standalone: true, expected: exercise.expected });
	}
}

const exercisesWithDistinctiveHits = new Set(distinctiveHits.map((hit) => hit.id)).size;
const distinctiveOccurrences = distinctiveHits.length;
const uniqueDistinctiveLines = new Set(distinctiveHits.map((hit) => hit.line)).size;
const exercisesWithExpectedInProse = new Set(exactExpectedHits.map((hit) => hit.id)).size;

console.log('Pilot Watch 3b — lesson prose audit');
console.log(`exercises: ${exercises.length}   solutions: ${solutions.size}`);
console.log(
	`solution-only lines present in prose: ${distinctiveOccurrences} exercise-level occurrence(s), ` +
		`${uniqueDistinctiveLines} unique line string(s), across ${exercisesWithDistinctiveHits} exercise(s)`
);
console.log(`...of those, answer-bearing: ${answerLeaks.filter((hit) => !hit.standalone).length}`);
console.log(
	`exact expectedOutput found in prose: ${exercisesWithExpectedInProse} exercise(s), ` +
		`${exactExpectedHits.reduce((sum, hit) => sum + hit.occurrences.length, 0)} occurrence(s)`
);
console.log(`standalone expectedOutput lines: ${exactExpectedHits.filter((hit) => hit.standalone).length}`);

if (distinctiveHits.length > 0) {
	console.log('\nSolution-only lines in prose (the 22 rendered hits reconcile to these):');
	for (const hit of distinctiveHits) {
		const verdict = hit.answerBearing ? 'LEAK' : 'prose';
		const first = hit.occurrences[0];
		console.log(
			`  [${verdict}] ${hit.id} (${hit.file}:${first.line}) ` +
				`${JSON.stringify(hit.line)}`
		);
	}
}

if (exactExpectedHits.length > 0) {
	console.log('\nExact expectedOutput strings in prose (inline flags, not line-level leaks):');
	for (const hit of exactExpectedHits) {
		const context = hit.occurrences
			.map((occurrence) => `${hit.file}:${occurrence.line} ${JSON.stringify(occurrence.text)}`)
			.join(' | ');
		const verdict = hit.standalone ? 'LEAK' : 'flag';
		console.log(`  [${verdict}] ${hit.id} expected=${JSON.stringify(hit.expected)} -> ${context}`);
	}
}

const result = {
	exercises: exercises.length,
	solutions: solutions.size,
	distinctiveOccurrences,
	uniqueDistinctiveLines,
	exercisesWithDistinctiveHits,
	answerBearingDistinctiveLines: answerLeaks.filter((hit) => !hit.standalone).length,
	exercisesWithExpectedInProse,
	expectedOccurrences: exactExpectedHits.reduce((sum, hit) => sum + hit.occurrences.length, 0),
	standaloneExpectedLines: exactExpectedHits.filter((hit) => hit.standalone).length,
	reviewFlags: exactExpectedHits.map((hit) => ({
		id: hit.id,
		expected: hit.expected,
		standalone: hit.standalone,
		proseLines: hit.occurrences.map((occurrence) => occurrence.line)
	}))
};

console.log(`\nRESULT ${JSON.stringify(result)}`);
if (answerLeaks.length > 0) {
	console.error(`prose-answers: ${answerLeaks.length} answer-bearing match(es) — revise the MDX or the exercise`);
	process.exitCode = 1;
} else {
	console.log('prose-answers: 0 answer-bearing matches; inline expectedOutput occurrences need human review only');
}
