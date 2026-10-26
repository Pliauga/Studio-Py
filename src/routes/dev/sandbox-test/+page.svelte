<script lang="ts">
	import Sandbox from '#lib/components/scene/Sandbox.svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';

	type SandboxHandle = {
		drop: () => void;
		reset: () => void;
	};

	let sandbox = $state<SandboxHandle>();
	let dropped = $state(false);

	const SAMPLE = 'spawn_cube(position=(0, 8, 0), color="#000000", size=1.5)\ndrop_cube()';
	let code = $state(SAMPLE);
	const running = $derived(pythonRunner.isRunning);

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
			A borderless Threlte canvas for the 3D physics sandbox. One hard light, no ambient fill, no
			post-processing. Drop the cube to switch its rigid body from kinematic to dynamic.
		</p>
	</header>

	<div class="stage">
		<Sandbox bind:this={sandbox} />
	</div>

	<textarea bind:value={code} rows="3" spellcheck="false" aria-label="Python code"></textarea>

	<div class="controls">
		<button type="button" onclick={runPython} disabled={running}>
			{running ? 'Running...' : 'Run Python'}
		</button>
		<button type="button" onclick={drop} disabled={dropped}>Drop cube</button>
		<button type="button" onclick={reset} disabled={!dropped}>Reset</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: clamp(16px, 2.4rem, 32px);
		height: 100svh;
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
		flex: 1;
		min-height: 320px;
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
		background: var(--color-ink);
		color: var(--color-paper);
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
