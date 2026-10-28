/**
 * CDN edge cases for the cold-start ceiling, driven through the real app.
 *
 *   node .artifacts/edge-cdn.mjs block   -> jsDelivr unreachable: fast, recoverable error
 *   node .artifacts/edge-cdn.mjs stall   -> jsDelivr never answers: 30 s load ceiling
 *   node .artifacts/edge-cdn.mjs slow    -> jsDelivr slow but healthy: no false fire
 *
 * Requires a running preview of the app (BASE env, default http://127.0.0.1:4180).
 */
import { chromium } from 'playwright';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4180';
const mode = process.argv[2];

const PANDAS = 'import pandas as pd\nprint(pd.__version__)';
const LOAD_CEILING_MS = 30000;
const EXEC_TIMEOUT_MS = 4000;
const LOAD_TIMEOUT_MESSAGE = 'Python could not finish loading in time.';
const EXEC_TIMEOUT_MESSAGE = 'Execution timed out (possible infinite loop).';
const SKIP_NETWORK = [];

const log = (...parts) => console.log(...parts);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
	if (message.type() === 'error') consoleErrors.push(message.text());
});

const cdnSeen = [];
const heldRoutes = [];
let pendingRoutes = 0;

await context.route('**/*', async (route) => {
	const url = route.request().url();
	if (!url.includes('cdn.jsdelivr.net')) return route.continue();
	cdnSeen.push(url.split('/').pop());

	if (mode === 'block') return route.abort('connectionfailed');
	if (mode === 'slow') {
		await new Promise((resolve) => setTimeout(resolve, Number(process.env.SLOW_DELAY_MS ?? 7000)));
		return route.continue();
	}
	// stall: hold the request open; the worker's fetch never settles.
	pendingRoutes += 1;
	heldRoutes.push(route);
	return new Promise(() => {});
});

/** Click Run and wait for the runner to leave the running state with new output. */
async function runAndWait(code, timeoutMs) {
	await page.fill('[data-testid="code"]', code);
	const before = (await page.textContent('[data-testid="output"]')) ?? '';
	const startedAt = Date.now();
	await page.click('[data-testid="run"]');
	// Wait for the run to actually start, then for it to finish, so a fast run
	// cannot be sampled before Svelte flips the status.
	await page
		.waitForFunction(
			() => document.querySelector('[data-testid="status"]')?.textContent?.trim() === 'Running...',
			null,
			{ timeout: 10000 }
		)
		.catch(() => {});
	await page.waitForFunction(
		(previous) => {
			const status = document.querySelector('[data-testid="status"]')?.textContent?.trim();
			const output = document.querySelector('[data-testid="output"]')?.textContent ?? '';
			return status !== 'Running...' && output !== previous;
		},
		before,
		{ timeout: timeoutMs }
	);
	return { ms: Date.now() - startedAt };
}

await page.goto(`${BASE}/dev/worker-test`, { waitUntil: 'load' });
await page.waitForFunction(
	() => document.querySelector('[data-testid="status"]')?.textContent?.trim() === 'Ready',
	null,
	{ timeout: 90000 }
);
log(`warm-up: ${mode} — interpreter core booted from self-hosted /pyodide/`);
log(`cdn requests intercepted so far: ${cdnSeen.length}`);

const result = { mode, cdnRequests: cdnSeen.length };

if (mode === 'slow') {
	const { ms } = await runAndWait(PANDAS, LOAD_CEILING_MS + 20000);
	const output = await page.textContent('[data-testid="output"]');
	result.runMs = ms;
	result.output = output?.trim() ?? '';
	result.falseFired = /could not finish loading|did not finish starting/.test(result.output);
	result.ok = /^\d+\.\d+\.\d+/.test(result.output) && !result.falseFired;
	log(`slow-but-healthy pandas load: ${ms} ms, output=${JSON.stringify(result.output)}`);
}

if (mode === 'block') {
	const { ms } = await runAndWait(PANDAS, 20000);
	const output = await page.textContent('[data-testid="output"]');
	const runEnabled = await page.isEnabled('[data-testid="run"]');
	result.runMs = ms;
	result.output = output?.trim() ?? '';
	result.runEnabled = runEnabled;
	result.hung = ms >= LOAD_CEILING_MS;
	result.ok = !result.hung && runEnabled && result.output.length > 0;
	log(`blocked CDN: settled in ${ms} ms, run button re-enabled=${runEnabled}`);
	log(`output: ${JSON.stringify(result.output.slice(0, 300))}`);

	// Recoverable: unblock and run again.
	await context.unroute('**/*');
	const recovered = await runAndWait(PANDAS, 60000);
	const recoveredOutput = await page.textContent('[data-testid="output"]');
	result.recoveredMs = recovered.ms;
	result.recoveredOutput = recoveredOutput?.trim() ?? '';
	result.recovered = /^\d+\.\d+\.\d+/.test(result.recoveredOutput);
	log(`after unblocking: ${recovered.ms} ms -> ${JSON.stringify(result.recoveredOutput)}`);
}

if (mode === 'stall') {
	const { ms } = await runAndWait(PANDAS, LOAD_CEILING_MS + 15000);
	const output = await page.textContent('[data-testid="output"]');
	const statusText = await page.textContent('[data-testid="status"]');
	const runEnabled = await page.isEnabled('[data-testid="run"]');
	result.runMs = ms;
	result.output = output?.trim() ?? '';
	result.status = statusText?.trim() ?? '';
	result.runEnabled = runEnabled;
	result.pendingRoutes = pendingRoutes;
	result.saysLoading = result.output.includes(LOAD_TIMEOUT_MESSAGE);
	result.saysRunning = result.output.includes(EXEC_TIMEOUT_MESSAGE);
	result.hungForever = ms >= LOAD_CEILING_MS + 10000;
	result.ok =
		result.saysLoading && !result.saysRunning && !result.hungForever && runEnabled;
	log(`stalled CDN: settled in ${ms} ms (${pendingRoutes} requests left hanging)`);
	log(`status=${JSON.stringify(result.status)} runEnabled=${runEnabled}`);
	log(`output: ${JSON.stringify(result.output)}`);

	// Recoverable: release the held connections, then run again.
	for (const route of heldRoutes) await route.abort('timedout').catch(() => {});
	heldRoutes.length = 0;
	await context.unroute('**/*');
	const recovered = await runAndWait(PANDAS, 60000);
	const recoveredOutput = await page.textContent('[data-testid="output"]');
	result.recoveredMs = recovered.ms;
	result.recoveredOutput = recoveredOutput?.trim() ?? '';
	result.recovered = /^\d+\.\d+\.\d+/.test(result.recoveredOutput);
	log(`after releasing: ${recovered.ms} ms -> ${JSON.stringify(result.recoveredOutput)}`);
}

result.consoleErrors = consoleErrors;
log(`console errors: ${consoleErrors.length}`);
log(`RESULT ${JSON.stringify(result)}`);

await browser.close();
process.exit(result.ok ? 0 : 1);
