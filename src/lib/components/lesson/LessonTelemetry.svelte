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
	<div class="aqua-inset-well well">
		<div class="aqua-header-badge badge">
			<span>{kind === 'hook' ? 'SYS TELEMETRY // STANDBY' : 'DIAGNOSTIC SUMMARY // DEBRIEF'}</span>
			{#if kind === 'hook'}
				<span class="live"><i aria-hidden="true"></i>PYODIDE 3.14</span>
			{:else}
				<span class="live">[{pad(passed)}]/{pad(exercises)}</span>
			{/if}
		</div>

		<table class="aqua-table readout">
			<caption class="sr-only">{kind === 'hook' ? 'System telemetry readout' : 'Diagnostic summary readout'}</caption>
			<tbody>
				{#if kind === 'hook'}
					<tr><th scope="row">Incident ID</th><td>PLT-{plate}</td></tr>
					<tr><th scope="row">Target</th><td>srv-07.status()</td></tr>
					<tr><th scope="row">Waypoints</th><td>{pad(exercises)} exercises</td></tr>
					<tr>
						<th scope="row">Runtime state</th>
						<td>Awaiting operator scroll <span aria-hidden="true">↓</span></td>
					</tr>
				{:else}
					<tr>
						<th scope="row">Waypoints passed</th>
						<td aria-live="polite">[{pad(passed)}]/[{pad(exercises)}]</td>
					</tr>
					<tr><th scope="row">Status</th><td>Ready for sign-off <span aria-hidden="true">↓</span></td></tr>
					<tr><th scope="row">Next</th><td>Use MARK AS COMPLETE below</td></tr>
				{/if}
			</tbody>
		</table>
	</div>
</section>

<style>
	.telemetry {
		box-sizing: border-box;
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		gap: 24px;
		min-height: 100%;
		padding: 14px 16px;
		font-family: var(--font-mono);
		color: var(--color-ink);
	}

	/* The well is the recess; the badge caps it and the table sits inside with no gutter,
	   so the two read as one instrument rather than a card with a heading. */
	.well {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.badge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 5px 10px;
		font-family: var(--font-pixel);
		font-size: 1.05rem;
		line-height: 1.2;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		white-space: nowrap;
	}

	.live i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-snake);
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55);
	}

	/* The brutalism stays in the type: the pixel face carries every cell, so the zebra
	   stripes read as a terminal printout rather than a web table. The lesson's own
	   `.prose table` rule is two classes deep, so this one is too. */
	.telemetry .readout {
		font-family: var(--font-pixel);
		font-size: 1.1rem;
		line-height: 1.25;
		letter-spacing: 0.03em;
		color: var(--color-ink);
	}

	.telemetry .readout th,
	.telemetry .readout td {
		padding: 4px 10px;
		font-family: var(--font-pixel);
		font-size: 1.1rem;
		vertical-align: baseline;
	}

	.telemetry .readout th {
		width: 41%;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.telemetry .readout td {
		overflow-wrap: anywhere;
		text-transform: uppercase;
	}

	/* The row hover of `.aqua-table` turns the row Aqua blue; the pixel face has to keep
	   its contrast there, which the shared rule already forces on `td`. */
	.telemetry .readout tr:hover th {
		color: #ffffff;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 520px) {
		.telemetry {
			padding: 16px 14px;
		}

		.readout th {
			width: 46%;
		}
	}
</style>
