<script lang="ts">
	import { onMount } from 'svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import { telemetry } from '#lib/stores/telemetry.svelte.ts';

	const CONCEPT_ID = 'worker-test';

	const samples = [
		{ label: 'pandas version', code: 'import pandas as pd\nprint(pd.__version__)' },
		{ label: 'exception', code: 'print(1/0)' }
	];

	let code = $state(samples[0].code);
	let bootError = $state('');

	const status = $derived(
		pythonRunner.isRunning ? 'Running…' : pythonRunner.isReady ? 'Ready' : 'Starting Python…'
	);
	const stats = $derived(telemetry.statsOf(CONCEPT_ID));

	onMount(() => {
		pythonRunner.warmUp().catch((error: unknown) => {
			bootError = error instanceof Error ? error.message : String(error);
		});
	});

	function record(isCorrect: boolean) {
		telemetry.recordPrediction(CONCEPT_ID, isCorrect);
	}
</script>

<svelte:head>
	<title>Worker test — Studio Py</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<header>
		<p class="kicker">Internal preview</p>
		<h1>Pyodide worker test</h1>
		<p class="lede">
			Drives <code>pythonRunner</code> against the shared worker and exercises <code>telemetry</code>.
			Reload to confirm telemetry survives in localStorage.
		</p>
	</header>

	<section class="panel">
		<div class="panel-head">
			<h2>Runner</h2>
			<span class="status" class:busy={pythonRunner.isRunning} data-testid="status">{status}</span>
		</div>

		<div class="samples">
			{#each samples as sample}
				<button type="button" onclick={() => (code = sample.code)}>{sample.label}</button>
			{/each}
		</div>

		<label class="field">
			<span>Code</span>
			<textarea bind:value={code} spellcheck="false" data-testid="code" rows="6"></textarea>
		</label>

		<button
			type="button"
			class="run"
			disabled={pythonRunner.isRunning}
			onclick={() => void pythonRunner.runCode(code)}
			data-testid="run">Run</button
		>

		{#if bootError}
			<p class="boot-error" data-testid="boot-error">{bootError}</p>
		{/if}

		<pre class="output" data-testid="output" aria-live="polite">{pythonRunner.output}</pre>
	</section>

	<section class="panel">
		<div class="panel-head">
			<h2>Telemetry</h2>
			<span class="status">concept <code>{CONCEPT_ID}</code></span>
		</div>

		<p class="counts" data-testid="telemetry-counts">
			attempts <b>{stats.attempts}</b> · correct <b>{stats.correct}</b>
		</p>

		<div class="samples">
			<button type="button" onclick={() => record(true)} data-testid="record-correct">Record correct</button>
			<button type="button" onclick={() => record(false)} data-testid="record-incorrect"
				>Record incorrect</button
			>
		</div>

		<pre class="output" data-testid="telemetry-json">{JSON.stringify(telemetry.concepts, null, 2)}</pre>
	</section>
</main>

<style>
	main {
		max-width: 88rem;
		margin: 0 auto;
		padding: 12rem 2.4rem;
		color: var(--color-ink);
		font-family: var(--font-mono);
	}

	header {
		margin-bottom: 3.2rem;
	}

	.kicker {
		margin: 0 0 1.4rem;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-ink);
	}

	h1 {
		margin: 0 0 1.6rem;
		font-family: var(--font-display);
		font-size: clamp(4.4rem, 8vw, 8.8rem);
		font-weight: 500;
		line-height: 0.95;
		letter-spacing: -0.02em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.lede {
		margin: 0;
		max-width: 62ch;
		font-family: var(--font-body);
		font-size: 2rem;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.panel {
		display: grid;
		gap: 1.4rem;
		margin-bottom: 2.4rem;
		padding: 2rem;
		border: 1px solid var(--color-ink);
	}

	.panel-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.6rem;
		padding-bottom: 1.2rem;
		border-bottom: 1px solid var(--color-ink);
	}

	.status {
		font-size: 1.1rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.status.busy {
		color: var(--color-ink);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.samples {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}

	button {
		padding: 0.8rem 1.2rem;
		border: 1px solid var(--color-ink);
		background: transparent;
		color: var(--color-ink);
		font: inherit;
		font-size: 1.2rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background 160ms linear,
			color 160ms linear;
	}

	button:hover:not(:disabled) {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	button:disabled {
		cursor: not-allowed;
		color: var(--color-muted);
		border-color: var(--color-muted);
	}

	.run {
		justify-self: start;
		padding: 0.9rem 2.2rem;
		background: var(--color-ink);
		color: var(--color-paper);
		font-weight: 700;
	}

	.run:hover:not(:disabled) {
		background: transparent;
		color: var(--color-ink);
	}

	.field {
		display: grid;
		gap: 0.6rem;
		font-size: 1.1rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	textarea {
		min-height: 15rem;
		padding: 1.2rem;
		border: 1px solid var(--color-ink);
		background: transparent;
		color: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 1.4rem;
		line-height: 1.6;
		resize: vertical;
	}

	textarea:focus {
		outline: 2px solid var(--color-ink);
		outline-offset: 1px;
	}

	.output {
		margin: 0;
		min-height: 5.6rem;
		max-height: 32rem;
		overflow: auto;
		padding: 1.2rem;
		border: 1px solid var(--color-ink);
		background: var(--color-ink);
		color: var(--color-paper);
		font-family: var(--font-mono);
		font-size: 1.3rem;
		line-height: 1.55;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.boot-error {
		margin: 0;
		font-size: 1.3rem;
		color: var(--color-ink);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.counts {
		margin: 0;
		font-size: 1.2rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.counts b {
		color: var(--color-ink);
	}

	code {
		font-family: inherit;
	}
</style>
