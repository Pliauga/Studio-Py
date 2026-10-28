import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5271';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = fileURLToPath(new URL('../.artifacts/switchyard/', import.meta.url));
const LESSON = `${BASE}/lesson/week-16-async-io-and-concurrency`;
const EXERCISE = '[data-exercise-id="w16-scene-gather"]';
const SANDBOX = '[data-mode="switchyard"]';
mkdirSync(OUT, { recursive: true });

const CODE = `import asyncio

HOSTS = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0)]

async def run_host(host: str, lane: int) -> str:
    launch_task(host, lane)
    await asyncio.sleep(0.25 + lane * 0.1)
    pause_task(host)
    await asyncio.sleep(0.25)
    finish_task(host)
    return host

async def main() -> list[str]:
    start_switchyard()
    return list(await asyncio.gather(*(run_host(host, lane) for lane, (host, _pct) in enumerate(HOSTS))))

print(asyncio.run(main()))`;

const PERF_CODE = `import asyncio

async def batch(base):
    for lane in range(3):
        launch_task(f'task-{base + lane:02d}', lane)
    await asyncio.sleep(0.18)
    for lane in range(3):
        finish_task(f'task-{base + lane:02d}')

async def main():
    start_switchyard()
    for base in range(0, 48, 3):
        await batch(base)
    print('dispatched 48')

asyncio.run(main())`;

const browser = await chromium.launch({
	executablePath: CHROME,
	headless: false,
	args: ['--window-position=40,40', '--window-size=1500,1000']
});
const report = { normal: {}, reduced: {}, performance: {}, errors: [] };
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

async function openLesson(reducedMotion) {
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 2,
		reducedMotion: reducedMotion ? 'reduce' : 'no-preference'
	});
	const page = await context.newPage();
	const errors = [];
	page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
	page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
	await page.goto(LESSON, { waitUntil: 'domcontentloaded' });
	const card = page.locator(EXERCISE);
	await card.waitFor({ timeout: 60000 });
	await page.locator(`${SANDBOX} canvas`).waitFor({ timeout: 60000 });
	await page.evaluate(() => document.fonts.ready);
	return { context, page, card, errors };
}

async function enterCode(card, code) {
	const editor = card.locator('.cm-content');
	await editor.click();
	await editor.page().keyboard.press('ControlOrMeta+a');
	await editor.page().keyboard.press('Delete');
	await editor.page().keyboard.insertText(code);
}

async function runAndWait(card, page) {
	await card.getByTestId('run').click();
	await page.waitForFunction(
		() => {
			const el = document.querySelector('[data-mode="switchyard"]');
			return el?.getAttribute('data-async-running') === '0' &&
				el?.getAttribute('data-async-paused') === '0' &&
				el?.getAttribute('data-async-finished') === '3';
		},
		undefined,
		{ timeout: 120000 }
	);
}

async function capture(page, name) {
	const frame = await page.locator('.sandbox-embed .frame').screenshot({ animations: 'disabled' });
	writeFileSync(`${OUT}/${name}.png`, frame);
	const image = await page.locator(`${SANDBOX} canvas`).screenshot({
		animations: 'disabled',
		style: '.motion-label { visibility: hidden !important; }'
	});
	writeFileSync(`${OUT}/${name}-canvas.png`, image);
	return sha(image);
}

try {
	const normal = await openLesson(false);
	await enterCode(normal.card, CODE);
	await normal.card.getByTestId('run').click();
	await normal.page.waitForFunction(
		() => {
			const el = document.querySelector('[data-mode="switchyard"]');
			return el?.getAttribute('data-async-running') === '2' &&
				el?.getAttribute('data-async-paused') === '1';
		},
		undefined,
		{ timeout: 120000 }
	);
	const movingHash = await capture(normal.page, 'switchyard-moving');
	await normal.page.waitForFunction(
		() => document.querySelector('[data-mode="switchyard"]')?.getAttribute('data-async-finished') === '3',
		undefined,
		{ timeout: 30000 }
	);
	await normal.card.getByTestId('passed-badge').waitFor({ timeout: 30000 });
	const settledHash = await capture(normal.page, 'switchyard-settled');
	const normalData = await normal.page.locator(SANDBOX).evaluate((el) => ({ ...el.dataset }));
	assert.equal(normalData.asyncRunning, '0');
	assert.equal(normalData.asyncPaused, '0');
	assert.equal(normalData.asyncFinished, '3');
	assert.match(normalData.asyncSnapshot, /srv-01:0:finished/);
	assert.match(normalData.asyncSnapshot, /srv-02:1:finished/);
	assert.match(normalData.asyncSnapshot, /srv-03:2:finished/);
	assert.deepEqual(normal.errors, []);
	report.normal = { movingHash, settledHash, data: normalData, errors: normal.errors };

	for (const tag of ['a', 'b']) {
		const reduced = await openLesson(true);
		await enterCode(reduced.card, CODE);
		await runAndWait(reduced.card, reduced.page);
		await reduced.page.waitForTimeout(400);
		const hash = await capture(reduced.page, `reduced-${tag}`);
		await reduced.page.waitForTimeout(500);
		const laterHash = await capture(reduced.page, `reduced-${tag}-later`);
		assert.equal(laterHash, hash, `reduced ${tag} changed after settling`);
		const data = await reduced.page.locator(SANDBOX).evaluate((el) => ({ ...el.dataset }));
		const media = await reduced.page.evaluate(() => ({
			reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
			label: document.querySelector('.motion-label')?.textContent?.trim() ?? null
		}));
		assert.equal(data.reducedMotion, 'true');
		assert.equal(media.reduce, true);
		assert.equal(media.label, 'Reduced motion · static frame');
		assert.deepEqual(reduced.errors, []);
		report.reduced[tag] = { hash, laterHash, data, media, errors: reduced.errors };
		await reduced.context.close();
	}
	assert.equal(report.reduced.a.hash, report.reduced.b.hash, 'independent reduced-motion frames differ');

	await normal.page.bringToFront();
	async function instrument() {
		await normal.page.evaluate(() => {
			window.__switchyardSamples = [];
			window.__switchyardLong = [];
			const tick = (time) => {
				window.__switchyardSamples.push(time);
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
			try {
				new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						window.__switchyardLong.push({ start: entry.startTime, duration: entry.duration });
					}
				}).observe({ type: 'longtask', buffered: false });
			} catch {}
		});
	}

	async function perfRun() {
		await normal.page.locator('.sandbox-embed').getByRole('button', { name: 'Reset switchyard' }).click();
		await normal.page.waitForFunction(
			() => document.querySelector('[data-mode="switchyard"]')?.getAttribute('data-async-snapshot') === '',
			undefined,
			{ timeout: 30000 }
		);
		await normal.card.getByTestId('run').click();
		await normal.page.waitForFunction(
			() => {
				const el = document.querySelector('[data-mode="switchyard"]');
				return el?.getAttribute('data-async-finished') === '3' &&
					el?.getAttribute('data-async-snapshot')?.includes('task-45') &&
					el?.getAttribute('data-async-snapshot')?.includes('task-47');
			},
			undefined,
			{ timeout: 120000 }
		);
	}

	await enterCode(normal.card, PERF_CODE);
	await perfRun();
	await normal.page.waitForTimeout(300);
	await instrument();
	await perfRun();
	await normal.page.waitForTimeout(200);
	const perf = await normal.page.evaluate(() => ({
		samples: window.__switchyardSamples,
		longTasks: window.__switchyardLong,
		data: { ...document.querySelector('[data-mode="switchyard"]').dataset },
		canvas: (() => {
			const canvas = document.querySelector('[data-mode="switchyard"] canvas');
			return canvas ? { css: [canvas.clientWidth, canvas.clientHeight], backing: [canvas.width, canvas.height], dpr: devicePixelRatio } : null;
		})()
	}));
	const deltas = perf.samples.slice(1).map((time, index) => time - perf.samples[index]);
	const sorted = [...deltas].sort((a, b) => a - b);
	const quantile = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
	const span = perf.samples.at(-1) - perf.samples[0];
	const stats = {
		tasksPerRun: 48,
		frames: perf.samples.length,
		seconds: +(span / 1000).toFixed(3),
		fps: +((perf.samples.length - 1) / (span / 1000)).toFixed(2),
		medianMs: +quantile(0.5).toFixed(2),
		p95Ms: +quantile(0.95).toFixed(2),
		p99Ms: +quantile(0.99).toFixed(2),
		maxMs: +Math.max(...deltas).toFixed(2),
		over33Ms: deltas.filter((delta) => delta > 33).length,
		longTasks: perf.longTasks
	};
	assert.ok(stats.fps >= 60, `switchyard performance ${stats.fps}fps is below 60fps`);
	assert.deepEqual(normal.errors, []);
	report.performance = { stats, data: perf.data, canvas: perf.canvas };
	report.errors = [...normal.errors];
	writeFileSync(
		`${OUT}/performance.json`,
		JSON.stringify(
			{
				...stats,
				browser: browser.version(),
				sampleTimesMs: perf.samples,
				frameTimesMs: deltas,
				data: perf.data,
				canvas: perf.canvas
			},
			null,
			2
		)
	);
	writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
	await normal.context.close();
} finally {
	await browser.close();
}
