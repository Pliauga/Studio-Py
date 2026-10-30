<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	type Props = {
		kind: 'hook' | 'debrief';
		exercises: number;
	};

	let { kind, exercises }: Props = $props();

	const pad = (n: number) => String(n).padStart(2, '0');
	const plate = $derived(pad((page.data.module?.week ?? 0) + 2));

	let root = $state<HTMLElement | null>(null);
	let passed = $state(0);

	// An exercise marks itself `is-passed` on its own root; the readout counts those in
	// the lesson body, so it needs no store and no change to the exercise component.
	onMount(() => {
		const article = root?.closest('article');
		if (!article) return;

		const count = () => (passed = article.querySelectorAll('[data-testid="pyexercise"].is-passed').length);
		count();

		const observer = new MutationObserver(count);
		observer.observe(article, { attributes: true, attributeFilter: ['class'], subtree: true });
		return () => observer.disconnect();
	});
</script>

<section class="telemetry" bind:this={root} aria-label={kind === 'hook' ? 'System telemetry' : 'Diagnostic summary'}>
	{#if kind === 'hook'}
		<header class="bar">
			<span>SYS TELEMETRY // STANDBY</span>
			<span class="live"><i aria-hidden="true"></i>PYODIDE 3.14</span>
		</header>
		<dl class="grid">
			<div class="cell"><dt>Incident ID</dt><dd>PLT-{plate}</dd></div>
			<div class="cell"><dt>Target</dt><dd>srv-07.status()</dd></div>
			<div class="cell"><dt>Waypoints</dt><dd>{pad(exercises)} exercises</dd></div>
			<div class="cell"><dt>Runtime state</dt><dd>Awaiting operator scroll <span aria-hidden="true">↓</span></dd></div>
		</dl>
	{:else}
		<header class="bar">
			<span>DIAGNOSTIC SUMMARY // DEBRIEF</span>
		</header>
		<dl class="grid">
			<div class="cell" aria-live="polite">
				<dt>Waypoints passed</dt>
				<dd>[{pad(passed)}]/[{pad(exercises)}]</dd>
			</div>
			<div class="cell">
				<dt>Status</dt>
				<dd>Ready for sign-off <span aria-hidden="true">↓</span></dd>
			</div>
			<div class="cell wide"><dt>Next</dt><dd>Use MARK AS COMPLETE below</dd></div>
		</dl>
	{/if}
</section>

<style>
	.telemetry {
		box-sizing: border-box;
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		justify-content: space-between;
		gap: 24px;
		min-height: 100%;
		padding: 20px 24px;
		border: 1px solid var(--color-ink);
		font-family: var(--font-mono);
		color: var(--color-ink);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		font-size: 0.8rem;
		line-height: 1.2;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.live i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-snake);
		box-shadow: 0 0 0 1px var(--color-ink);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin: 0;
		border-top: 1px solid var(--divider);
		border-left: 1px solid var(--divider);
		--divider: color-mix(in srgb, var(--color-ink) 8%, transparent);
	}

	.cell {
		display: grid;
		gap: 8px;
		min-width: 0;
		padding: 14px 16px;
		border-right: 1px solid var(--divider);
		border-bottom: 1px solid var(--divider);
	}

	.cell.wide {
		grid-column: 1 / -1;
	}

	dt {
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	dd {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.3;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	@media (max-width: 520px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
