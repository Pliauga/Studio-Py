/**
 * Orphaned-worker measurement: run `while True:` five times on one lesson page
 * and count Web Worker targets with Chrome DevTools Protocol — both the live
 * target list and every targetCreated/targetDestroyed event.
 *
 *   node .artifacts/edge-orphans.mjs
 *
 * Requires a running preview of the app (BASE env, default http://127.0.0.1:4180).
 */
import { chromium } from 'playwright';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4180';
const LESSON = `${BASE}/lesson/week-16-async-io-and-concurrency`;
const RUN_TIMEOUT_MS = 4000;
const IS_WORKER = (type) => type === 'worker' || type === 'shared_worker';

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const cdp = await browser.newBrowserCDPSession();

const started = Date.now();
const events = [];
cdp.on('Target.targetCreated', (event) => {
	if (IS_WORKER(event.targetInfo.type)) events.push({ at: Date.now() - started, kind: 'created', id: event.targetInfo.targetId });
});
cdp.on('Target.targetDestroyed', (event) => {
	events.push({ at: Date.now() - started, kind: 'destroyed', id: event.targetId });
});
await cdp.send('Target.setDiscoverTargets', { discover: true });

const consoleErrors = [];
page.on('console', (message) => {
	if (message.type() === 'error') consoleErrors.push(message.text());
});

async function workerTargets() {
	const { targetInfos } = await cdp.send('Target.getTargets');
	return targetInfos.filter((target) => IS_WORKER(target.type));
}

/** Wait until the live worker count settles on `expected` (teardown is async). */
async function waitForWorkerCount(expected, timeoutMs = 15000) {
	const deadline = Date.now() + timeoutMs;
	let list = await workerTargets();
	while (list.length !== expected && Date.now() < deadline) {
		await page.waitForTimeout(200);
		list = await workerTargets();
	}
	return list;
}

const box = page.locator('[data-testid="pyexercise"]');
await page.goto(LESSON, { waitUntil: 'load' });
const total = await box.count();

async function replaceCode(scope, code) {
	await scope.locator('.cm-content').click();
	await page.keyboard.press('Meta+A');
	await page.keyboard.insertText(code);
}

async function runExercise(scope, timeoutMs) {
	const at = Date.now();
	await scope.locator('[data-testid="run"]').click();
	await page
		.waitForFunction(
			() => document.querySelector('[data-testid="status"]')?.textContent?.includes('Running'),
			null,
			{ timeout: 10000 }
		)
		.catch(() => {});
	await page.waitForFunction(
		() => !document.querySelector('[data-testid="status"]')?.textContent?.includes('Running'),
		null,
		{ timeout: timeoutMs }
	);
	return Date.now() - at;
}

const first = box.nth(0);
const warm = await waitForWorkerCount(1);
console.log(`exercises on page: ${total}`);
console.log(`warm-up: ${warm.length} worker target alive`);

const kills = [];
for (let attempt = 1; attempt <= 5; attempt += 1) {
	await replaceCode(first, 'while True:\n    pass\n');
	const ms = await runExercise(first, RUN_TIMEOUT_MS + 15000);
	const status = (await first.locator('[data-testid="status"]').textContent())?.trim() ?? '';
	const after = await waitForWorkerCount(0);
	const traceback = (await first.locator('[data-testid="traceback"]').textContent())?.trim() ?? '';
	kills.push({
		attempt,
		ms,
		stopped: status.includes('Stopped'),
		workersAlive: after.length,
		message: traceback
	});
	console.log(
		`kill ${attempt}: settled ${ms} ms, live workers after teardown=${after.length}, message=${JSON.stringify(traceback)}`
	);
}

const aliveAfterKills = (await waitForWorkerCount(0)).length;
const createdAfterKills = events.filter((event) => event.kind === 'created').length;
const destroyedAfterKills = events.filter((event) => event.kind === 'destroyed').length;

// Sixth run: the last exercise on the page must still execute Python.
const sixth = box.nth(total - 1);
await replaceCode(sixth, "print('sixth run ok')");
const sixthMs = await runExercise(sixth, 60000);
const sixthOutput = (await sixth.locator('[data-testid="output"]').textContent())?.trim() ?? '';
const aliveAtEnd = await waitForWorkerCount(1);
await page.waitForTimeout(750);
const created = events.filter((event) => event.kind === 'created').length;
const destroyed = events.filter((event) => event.kind === 'destroyed').length;

const result = {
	exercises: total,
	kills,
	workerTargetsCreatedAfterKills: createdAfterKills,
	workerTargetsDestroyedAfterKills: destroyedAfterKills,
	workerTargetsCreated: created,
	workerTargetsDestroyed: destroyed,
	aliveAfterKills,
	sixthRunMs: sixthMs,
	sixthOutput,
	aliveAtEnd: aliveAtEnd.length,
	orphans: aliveAtEnd.length - 1,
	everyKillStopped: kills.every((kill) => kill.stopped),
	everyKillLeftNoneAlive: kills.every((kill) => kill.workersAlive === 0),
	sixthRan: sixthOutput.includes('sixth run ok'),
	consoleErrors
};

console.log(`worker targets: created=${created}, destroyed=${destroyed}, alive=${aliveAtEnd.length}`);
console.log(`live workers after the 5th kill: ${aliveAfterKills}`);
console.log(`sixth run: ${sixthMs} ms -> ${JSON.stringify(sixthOutput.split('\n').pop())}`);
console.log(`orphaned workers (alive beyond the one in use): ${aliveAtEnd.length - 1}`);
console.log(`console errors: ${consoleErrors.length}`);
console.log(`RESULT ${JSON.stringify(result)}`);

await browser.close();
const ok =
	result.everyKillStopped &&
	result.everyKillLeftNoneAlive &&
	aliveAfterKills === 0 &&
	result.aliveAtEnd === 1 &&
	result.orphans === 0 &&
	result.sixthRan &&
	consoleErrors.length === 0;
process.exit(ok ? 0 : 1);
