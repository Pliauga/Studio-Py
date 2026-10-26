<script lang="ts">
	// The landing's live proof: a real Python interpreter boots in a worker and
	// runs whatever is in the editor. Nothing is fetched until `[ run ]`.
	import { onMount } from 'svelte';
	import type { EditorView } from 'codemirror';
	import type { BootStage } from '#lib/pyexercise/runtime.ts';
	import { densityFromRun, faultLine } from '#lib/pyexercise/terminal.ts';
	import { plate } from '#lib/stores/plate.svelte.ts';

	type Props = {
		/** The portal transition, owned by the landing page. */
		onEnter: (event: MouseEvent) => void;
	};

	let { onEnter }: Props = $props();

	const PROGRAM = `disk = {"used_gb": 91, "total_gb": 100}
free = disk["total_gb"] - disk["used_gb"]
print(f"{free} GB free")`;

	type Phase = 'idle' | 'booting' | 'done' | 'error';

	let phase = $state<Phase>('idle');
	let code = $state(PROGRAM);
	let lines = $state<string[]>(['> waiting for input.']);
	let progress = $state('');
	let output = $state<string | null>(null);
	let failed = $state(false);
	let host = $state<HTMLDivElement | null>(null);
	let editorMounted = $state(false);
	let view: EditorView | undefined;

	const mb = (bytes?: number) => (bytes ? `${(bytes / 1_048_576).toFixed(1)} MB` : '');

	const busy = $derived(phase === 'booting');

	let activating = false;

	// The source block is the painted terminal. CodeMirror is only imported and
	// mounted when the reader actually asks to edit, so it never becomes the LCP
	// element after hydration.
	async function activateEditor() {
		if (editorMounted || activating) return;
		activating = true;
		const { mountLandingEditor } = await import('#lib/pyexercise/landing-editor.ts');
		if (!host) {
			activating = false;
			return;
		}
		view = mountLandingEditor(host, code, (next) => {
			code = next;
			reset();
		});
		editorMounted = true;
		activating = false;
		requestAnimationFrame(() => view?.focus());
	}

	onMount(() => () => {
		view?.destroy();
		view = undefined;
	});

	function reset() {
		if (phase === 'booting') return;
		phase = 'idle';
		output = null;
		failed = false;
		progress = '';
		lines = ['> waiting for input.'];
	}

	function push(line: string) {
		lines = [...lines, line];
	}

	function handleStage(stage: BootStage) {
		if (stage.stage === 'fetch-start') {
			if (stage.file === 'pyodide.asm.wasm') push(`> fetching interpreter · ${mb(stage.total)}`);
			else if (stage.file === 'python_stdlib.zip') push(`> unpacking stdlib · ${mb(stage.total)}`);
			return;
		}

		if (stage.stage === 'fetch-progress') {
			progress = `  ${mb(stage.loaded)} / ${mb(stage.total)}`;
			return;
		}

		if (stage.stage === 'fetch-done') {
			progress = '';
			if (stage.file === 'pyodide.asm.wasm') push('> allocating memory');
			return;
		}

		if (stage.stage === 'ready') {
			progress = '';
			push('> ready.');
		}
	}

	async function run() {
		if (busy) return;

		phase = 'booting';
		output = null;
		failed = false;
		progress = '';
		lines = ['> spawning worker'];

		const { runPython, onBootStage } = await import('#lib/pyexercise/runtime.ts');
		const unsubscribe = onBootStage(handleStage);

		try {
			const outcome = await runPython(code);
			unsubscribe();

			if (outcome.error) {
				failed = true;
				phase = 'error';
				output = faultLine(outcome.error);
				return;
			}

			phase = 'done';
			output = outcome.output.trim() || '(the program printed nothing)';
			// The print half answers the machine half: the poster inks to what the program said.
			const density = densityFromRun(code, outcome.output);
			if (density !== null) plate.set(density);
		} catch (error) {
			unsubscribe();
			phase = 'error';
			failed = true;
			output = faultLine(error instanceof Error ? error.message : String(error));
		} finally {
			progress = '';
		}
	}
</script>

<section class="terminal" aria-labelledby="terminal-title">
	<div class="bar">
		<span class="mark" class:live={busy} aria-hidden="true"></span>
		<span class="bar-title" id="terminal-title">python · in your browser</span>
		<span class="bar-state"
			>{busy ? 'running' : phase === 'done' ? 'done' : phase === 'error' ? 'error' : 'ready'}</span
		>
	</div>

	<div class="code-wrap">
		<pre class="code" class:replaced={editorMounted} aria-label="Python program">{PROGRAM}</pre>
		{#if !editorMounted}
			<button
				type="button"
				class="code-activate"
				aria-label="Edit Python program"
				onclick={activateEditor}
			></button>
		{/if}
	</div>
	<div class="editor" class:visible={editorMounted} bind:this={host}></div>

	<div class="log" role="log" aria-live="polite" aria-label="Interpreter log">
		{#each lines as line}<span class="line">{line}</span>{/each}
		{#if progress}<span class="line progress" aria-hidden="true">{progress}</span>{/if}
	</div>

	{#if output !== null}
		<pre
			class="output"
			class:failed
			role={failed ? 'alert' : undefined}
			aria-live={failed ? undefined : 'polite'}
			data-testid="terminal-output">{#if failed}<span class="fault">[ ERROR ]</span> {/if}{output}</pre>
	{/if}

	<div class="actions">
		<button type="button" class="run" onclick={run} disabled={busy}>
			<span aria-hidden="true">[</span> run <span aria-hidden="true">]</span>
		</button>
		<a class="index" href="/dashboard" onclick={onEnter}>
			enter the index <span aria-hidden="true">→</span>
		</a>
	</div>
</section>

<style>
	.terminal {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 100%;
		border: 1px solid var(--color-ink);
		background: #000000;
		color: #f1f1f1;
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 0.7em;
		padding: 9px 14px;
		border-bottom: 1px solid rgba(241, 241, 241, 0.22);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.mark {
		width: 6px;
		height: 6px;
		background: #6a6a6a;
	}

	.mark.live {
		background: var(--color-snake);
		animation: pulse 1.1s steps(2, end) infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.25;
		}
	}

	.bar-title {
		color: rgba(241, 241, 241, 0.72);
	}

	.bar-state {
		margin-left: auto;
		color: rgba(241, 241, 241, 0.62);
	}

	/* The source block is the editor's stand-in, so it must occupy the editor's exact
	   box: same face, same measure, same leading, same padding. `pre` carries a UA
	   `font-family: monospace`, which is why the unstyled block did not even look like
	   Courier Prime. Nothing here may drift from landing-editor.ts's chrome. */
	.code-wrap {
		position: relative;
	}

	.code-activate {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: text;
	}

	.code-activate:focus-visible {
		outline: 2px solid var(--color-snake);
		outline-offset: -2px;
	}

	.code {
		box-sizing: border-box;
		height: 98px;
		margin: 0;
		padding: 14px 14px 0;
		overflow: hidden;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.85;
		letter-spacing: 0.02em;
		white-space: pre;
		color: #f1f1f1;
	}

	.output {
		margin: 0;
		padding: 12px 14px;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.85;
		white-space: pre;
		overflow-x: auto;
	}

	.code.replaced {
		display: none;
	}

	.editor {
		display: none;
		height: 98px;
	}

	.editor.visible {
		display: block;
	}

	.editor :global(.cm-editor) {
		height: 98px;
	}

	.editor:focus-within {
		outline: 2px solid var(--color-snake);
		outline-offset: 2px;
	}

	.log {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-height: 5.6em;
		padding: 10px 14px 12px;
		border-top: 1px solid rgba(241, 241, 241, 0.22);
		font-size: 11.5px;
		line-height: 1.6;
		letter-spacing: 0.06em;
		color: rgba(241, 241, 241, 0.76);
	}

	.log .line {
		display: block;
	}

	.log .progress {
		color: rgba(241, 241, 241, 0.4);
	}

	.output {
		border-top: 1px solid rgba(241, 241, 241, 0.22);
		color: #f1f1f1;
	}

	/* A system fault, not a browser crash: one line, tagged, set in the fault colour. */
	.output.failed {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		border-left: 2px solid #e48c74;
		padding-left: 12px;
		color: #e48c74;
	}

	.output.failed::before {
		content: '> ';
	}

	.output .fault {
		padding: 0 0.5em;
		background: #e48c74;
		color: #000000;
		letter-spacing: 0.08em;
	}

	.actions {
		display: flex;
		align-items: baseline;
		gap: 18px;
		padding: 11px 14px;
		border-top: 1px solid rgba(241, 241, 241, 0.22);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.run {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: inherit;
		background: none;
		border: 0;
		padding: 4px 0;
		cursor: pointer;
	}

	.run:hover,
	.run:focus-visible {
		color: var(--color-snake);
	}

	.run:disabled {
		cursor: progress;
		opacity: 0.7;
	}

	.index {
		color: rgba(241, 241, 241, 0.8);
		text-decoration: none;
	}

	.index:hover,
	.index:focus-visible {
		color: #f1f1f1;
		text-decoration: underline;
	}

	@media (prefers-reduced-motion: reduce) {
		.mark.live {
			animation: none;
		}
	}
</style>
