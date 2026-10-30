<script lang="ts">
	import { onMount } from 'svelte';
	import type SandboxComponent from '#lib/components/scene/Sandbox.svelte';
	import RegistrationMarks from '#lib/components/RegistrationMarks.svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';

	type SandboxHandle = {
		drop: () => void;
		reset: () => void;
	};

	type Props = {
		mode?: 'cube' | 'stack' | 'sort' | 'df' | 'conveyor' | 'switchyard';
		/** Optional script the reader can run against this scene. */
		code?: string;
		/** Overrides the auto-generated figure caption. */
		caption?: string;
	};

	let { mode = 'cube', code, caption }: Props = $props();

	const isStack = $derived(mode === 'stack');
	const isSort = $derived(mode === 'sort');
	const isDf = $derived(mode === 'df');
	const isConveyor = $derived(mode === 'conveyor');
	const isSwitchyard = $derived(mode === 'switchyard');
	const label = $derived(
		isStack
			? 'A dark metal stack container on a pale floor. Blocks drop in and are ejected as Python runs.'
			: isSort
				? 'A dark track of matte-black pillars on a pale floor. Pillars trade places and turn pale as Python sorts them.'
				: isDf
					? 'A floating grid of labelled data blocks on a pale floor. Filtered rows fall away as Python runs.'
					: isConveyor
						? 'A matte-black conveyor belt on a pale floor. Yielded items ride right and drop into a bin as Python streams them.'
						: isSwitchyard
							? 'Three parallel matte-black rail lanes on a pale floor. Labelled tasks run, pause, and finish as Python awaits them.'
							: 'A black cube hovering above a pale floor, casting a hard shadow.'
	);

	const hasScript = $derived(typeof code === 'string' && code.trim().length > 0);
	const autoCaption = $derived(
		isStack
			? 'Week 05 / Stack'
			: isSort
				? 'Week 04 / Sort'
				: isDf
					? 'Week 06 / Data sculpture'
					: isConveyor
						? 'Week 16 / Conveyor'
						: isSwitchyard
							? 'Week 16 / Async switchyard'
							: 'Week 03 / Scene bridge'
	);

	let Sandbox = $state<typeof SandboxComponent>();
	let sandbox = $state<SandboxHandle>();
	let failed = $state(false);
	let root: HTMLElement | undefined;

	/** A lesson's demo script starts from an empty stage, like a fresh notebook cell. */
	async function runScript() {
		if (!code) return;
		pythonRunner.clearScene();
		await pythonRunner.runCode(code);
	}

	function loadSandbox() {
		// Three and Rapier are heavy; only a lesson that shows the scene pays for them.
		import('#lib/components/scene/Sandbox.svelte')
			.then((module) => {
				Sandbox = module.default;
			})
			.catch((error: unknown) => {
				console.error('Sandbox failed to load', error);
				failed = true;
			});
	}

	// A previous lesson may have left Python cubes in the shared bridge.
	onMount(() => {
		pythonRunner.clearScene();

		if (!root || typeof IntersectionObserver === 'undefined') {
			loadSandbox();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				loadSandbox();
			},
			{ rootMargin: '300px 0px' }
		);
		observer.observe(root);
		return () => observer.disconnect();
	});
</script>

<figure class="sandbox-embed" bind:this={root}>
	<div class="frame" role="img" aria-label={label}>
		{#if Sandbox}
			<Sandbox {mode} bind:this={sandbox} />
		{:else if failed}
			<p class="fallback">Scene unavailable.</p>
		{/if}
		<RegistrationMarks />
	</div>

	{#if hasScript}
		<p class="run-state" role="status" aria-live="polite">
			{pythonRunner.isRunning
				? 'running…'
				: pythonRunner.error
					? pythonRunner.error.trim().split('\n').at(-1)
					: ''}
		</p>
	{/if}

	<figcaption>
		<span>{caption ?? autoCaption}</span>
		<span class="actions">
			{#if hasScript}
				<button
					type="button"
					onclick={runScript}
					disabled={pythonRunner.isRunning || !sandbox}>Run script</button
				>
			{/if}
			{#if !isStack && !isSort && !isDf && !isConveyor && !isSwitchyard}
				<button type="button" onclick={() => sandbox?.drop()} disabled={!sandbox}>Drop</button>
			{/if}
			<button type="button" onclick={() => sandbox?.reset()} disabled={!sandbox}>
				{isStack
					? 'Reset stack'
					: isSort
						? 'Reset track'
						: isDf
							? 'Reset grid'
							: isConveyor
								? 'Reset belt'
								: isSwitchyard
									? 'Reset switchyard'
									: 'Reset'}
			</button>
		</span>
	</figcaption>
</figure>

<style>
	.sandbox-embed {
		margin: 4.8rem 0;
	}

	.frame {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		min-height: 500px;
		border: 1px solid var(--color-ink);
	}

	.run-state {
		margin: 0.8rem 0 0;
		min-height: 1.6rem;
		font-family: var(--font-mono);
		font-size: 1.1rem;
		line-height: 1.4;
		letter-spacing: 0.08em;
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}

	.fallback {
		display: grid;
		height: 100%;
		margin: 0;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 1.2rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	figcaption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.6rem;
		margin-top: 1.2rem;
		font-family: var(--font-mono);
		font-size: 1.2rem;
		line-height: 1.4;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.actions {
		display: flex;
		gap: 0.8rem;
	}

	button {
		padding: 0.8rem 1.2rem;
		white-space: nowrap;
		border: 1px solid var(--color-ink);
		border-radius: 0;
		background: transparent;
		color: var(--color-ink);
		font: inherit;
		cursor: pointer;
		transition:
			background 140ms ease,
			color 140ms ease;
	}

	button:hover:not(:disabled),
	button:focus-visible {
		background: var(--color-snake);
		color: var(--color-ink);
	}

	button:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 560px) {
		figcaption {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
