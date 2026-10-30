<script lang="ts">
	import { onMount } from 'svelte';
	import type SandboxComponent from '#lib/components/scene/Sandbox.svelte';
	import RegistrationMarks from '#lib/components/RegistrationMarks.svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';

	type SandboxHandle = {
		drop: () => void;
		reset: () => void;
	};

	let Sandbox = $state<typeof SandboxComponent>();
	let sandbox = $state<SandboxHandle>();
	let dropped = $state(false);

	const SAMPLE =
		'spawn_object(position=(0, 8, 0), shape="sphere", size=(1.5, 1.5, 1.5))\ndrop_cube()';
	let code = $state(SAMPLE);
	const running = $derived(pythonRunner.isRunning);
	const error = $derived(pythonRunner.error);

	// Three and Rapier are heavy: keep them out of the route's initial chunk.
	onMount(() => {
		import('#lib/components/scene/Sandbox.svelte')
			.then((module) => {
				Sandbox = module.default;
			})
			.catch((error: unknown) => {
				console.error('Sandbox failed to load', error);
			});
	});

	function drop() {
		sandbox?.drop();
		dropped = true;
	}

	function runPython() {
		void pythonRunner.runCode(code);
	}

	function reset() {
		sandbox?.reset();
		dropped = false;
	}
</script>

<svelte:head>
	<title>Sandbox test — Studio Py</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<header>
		<p class="kicker">Internal preview / 3D</p>
		<h1>Threlte / Rapier sandbox</h1>
		<p class="lede">
			A framed Threlte canvas for the 3D physics sandbox. One hard light, no ambient fill, no
			post-processing. Drop the cube to switch its rigid body from kinematic to dynamic.
		</p>
	</header>

	<div class="stage">
		{#if Sandbox}
			<Sandbox bind:this={sandbox} />
		{/if}
		<RegistrationMarks />
	</div>

	<textarea bind:value={code} rows="3" spellcheck="false" aria-label="Python code"></textarea>

	<div class="controls">
		<button type="button" onclick={runPython} disabled={running}>
			{running ? 'Running...' : 'Run Python'}
		</button>
		<button type="button" onclick={drop} disabled={dropped}>Drop cube</button>
		<button type="button" onclick={reset} disabled={!dropped}>Reset</button>
	</div>

	{#if error}
		<pre class="trace" aria-live="polite">{error}</pre>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: clamp(16px, 2.4rem, 32px);
		min-height: 100svh;
		margin: 0 auto;
		max-width: 1100px;
		padding: clamp(88px, 11vh, 140px) clamp(24px, 5vw, 44px) clamp(32px, 4vh, 56px);
		color: var(--color-ink);
	}

	.kicker {
		margin: 0 0 0.8rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.6;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	h1 {
		margin: 0 0 1.2rem;
		font-size: clamp(32px, 3.2rem, 56px);
	}

	.lede {
		margin: 0;
		max-width: 58ch;
		font-size: 1.625rem;
		line-height: 1.35;
		color: var(--color-ink);
		text-wrap: pretty;
	}

	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		min-height: 500px;
		border: 1px solid var(--color-ink);
	}

	textarea {
		width: 100%;
		padding: clamp(10px, 1rem, 14px) clamp(12px, 1.4rem, 18px);
		border: 1px solid var(--color-ink);
		border-radius: 0;
		background: transparent;
		color: var(--color-ink);
		font: 16px/1.5 var(--font-mono);
		resize: vertical;
	}

	textarea:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}

	.trace {
		margin: 0;
		padding: clamp(10px, 1rem, 14px) clamp(12px, 1.4rem, 18px);
		border: 1px solid var(--color-ink);
		font: 1.3rem/1.6 var(--font-mono);
		white-space: pre-wrap;
		overflow: auto;
		max-height: 18rem;
	}

	button {
		padding: clamp(10px, 1.1rem, 15px) clamp(12px, 1.8rem, 20px);
		border: 1px solid var(--color-ink);
		border-radius: 0;
		background: transparent;
		color: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
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
</style>
