/**
 * Solution-leakage proof: walk every lesson route and assert that no line which
 * exists only in a stored reference solution (i.e. a line absent from that
 * exercise's own scaffold) appears anywhere in the rendered DOM.
 *
 *   node scripts/check-solution-leakage.mjs
 *
 * Requires a running preview of the app (BASE env, default http://127.0.0.1:4180).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4180';

/** Parse the app's solution corpus straight from `src/lib/content/solutions/week-NN.ts`. */
function readSolutions() {
	const dir = 'src/lib/content/solutions';
	const found = {};
	for (const file of readdirSync(dir).filter((name) => /^week-\d+\.ts$/.test(name))) {
		const source = readFileSync(`${dir}/${file}`, 'utf8');
		for (const match of source.matchAll(/\n\t'([^']+)':\s*`((?:[^`\\]|\\.)*)`/g)) {
			found[match[1]] = match[2].replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\\\\/g, '\\');
		}
	}
	return found;
}

const solutions = readSolutions();
const slugs = [...readFileSync('src/lib/content/lessons.ts', 'utf8').matchAll(/slug: '([^']+)'/g)].map(
	(match) => match[1]
);

/** Lesson prose also shows worked examples, so a hit only matters if the MDX never wrote that line. */
function mdxFor(slug) {
	const week = slug.slice(5, 7);
	return readFileSync(`src/content/lessons/week-${week}.mdx`, 'utf8');
}

/** Longest non-comment line of a solution that the scaffold does not already contain. */
function distinctiveLines(id, scaffold) {
	return solutions[id]
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length >= 20 && !line.startsWith('#') && !scaffold.includes(line));
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
	if (message.type() === 'error') consoleErrors.push(message.text());
});

/**
 * CodeMirror mounts after the route's first paint. Cloning the DOM at a fixed
 * 120ms used to catch the scaffold before hydration, which made scaffold lines
 * look solution-only. Wait for every exercise to have a populated editor.
 */
async function waitForEditors(scope = '[data-testid="pyexercise"]') {
	await page.waitForFunction((selector) => {
		const exercises = [...document.querySelectorAll(selector)];
		if (exercises.length === 0) return true;
		return exercises.every((exercise) => {
			const content = exercise.querySelector('.cm-content');
			return content !== null && (content.textContent ?? '').trim().length > 0;
		});
	}, scope, { timeout: 5000 });
}

const leaked = [];
const checked = [];
let exercisesSeen = 0;

for (const slug of slugs) {
	await page.goto(`${BASE}/lesson/${slug}`, { waitUntil: 'load' });
	await waitForEditors();

	const pageState = await page.evaluate(() => {
		const exercises = [...document.querySelectorAll('[data-testid="pyexercise"]')].map((node) => ({
			id: node.getAttribute('data-exercise-id') ?? '',
			scaffold: node.querySelector('.cm-content')?.textContent ?? ''
		}));
		// Editor contents are the scaffold, not a leak: compare against the page
		// with every code editor removed.
		const clone = document.body.cloneNode(true);
		clone.querySelectorAll('.cm-editor').forEach((node) => node.remove());
		return {
			exercises,
			text: clone.innerText,
			html: clone.innerHTML
		};
	});

	exercisesSeen += pageState.exercises.length;

	for (const exercise of pageState.exercises) {
		if (!(exercise.id in solutions)) continue;
		const lines = distinctiveLines(exercise.id, exercise.scaffold);
		if (lines.length === 0) continue;
		checked.push(exercise.id);
		for (const line of lines) {
			const inProse = mdxFor(slug).includes(line);
			if (pageState.text.includes(line)) {
				leaked.push({ slug, id: exercise.id, where: 'text', line, inProse });
			}
			if (pageState.html.includes(line)) {
				leaked.push({ slug, id: exercise.id, where: 'html', line, inProse });
			}
		}
	}
}

// Gating: the solution text must appear only after an explicit click.
const target = 'w16-gather-order';
await page.goto(`${BASE}/lesson/week-16-async-io-and-concurrency`, { waitUntil: 'load' });
await waitForEditors();
const scope = page.locator(`[data-testid="pyexercise"][data-exercise-id="${target}"]`);
const beforeClick = await scope.locator('.cm-content').innerText();
const gateProbe = distinctiveLines(target, beforeClick).sort((a, b) => b.length - a.length)[0];
await scope.locator('[data-testid="show-solution"]').click();
await page
	.waitForFunction(
		({ selector, probe }) => {
			const content = document.querySelector(`${selector} .cm-content`);
			return content !== null && (content.textContent ?? '').includes(probe);
		},
		{ selector: `[data-testid="pyexercise"][data-exercise-id="${target}"]`, probe: gateProbe },
		{ timeout: 5000 }
	)
	.catch(() => {});
const afterClick = await scope.locator('.cm-content').innerText();

const result = {
	lessonsScanned: slugs.length,
	exercisesSeen,
	exercisesWithDistinctiveSolutionLines: checked.length,
	solutionsInCorpus: Object.keys(solutions).length,
	leakedCount: leaked.length,
	leakedFromProse: leaked.filter((hit) => hit.inProse).length,
	leakedFromCorpus: leaked.filter((hit) => !hit.inProse),
	leaked,
	gating: {
		id: target,
		probe: gateProbe,
		hiddenBeforeClick: !beforeClick.includes(gateProbe),
		visibleAfterClick: afterClick.includes(gateProbe)
	},
	consoleErrors: consoleErrors.length
};

console.log(`lessons scanned: ${slugs.length}`);
console.log(`exercises rendered: ${exercisesSeen}`);
console.log(
	`exercises with solution-only line(s) checked: ${checked.length} of ${Object.keys(solutions).length}`
);
console.log(`solution-shaped lines found in rendered text/html: ${leaked.length}`);
console.log(`  of those, written in the lesson prose itself: ${result.leakedFromProse}`);
console.log(`  sourced from the solution corpus: ${result.leakedFromCorpus.length}`);
console.log(
	`gating (${target}): hidden before click=${result.gating.hiddenBeforeClick}, shown after click=${result.gating.visibleAfterClick}`
);
console.log(`console errors: ${consoleErrors.length}`);
console.log(`RESULT ${JSON.stringify(result)}`);

await browser.close();
const ok =
	result.leakedFromCorpus.length === 0 &&
	result.gating.hiddenBeforeClick &&
	result.gating.visibleAfterClick &&
	consoleErrors.length === 0;
process.exit(ok ? 0 : 1);
