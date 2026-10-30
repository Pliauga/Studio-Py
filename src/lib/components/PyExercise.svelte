<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { EditorView } from 'codemirror';
	import type { Compartment, Extension } from '@codemirror/state';
	import { getSolution } from '#lib/content/solutions/index.ts';
	import { decodeSource, normalizeOutput, outputsMatch } from '#lib/pyexercise/format.ts';
	import { getChecks } from '#lib/pyexercise/checks.ts';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';

	type Props = {
		id: string;
		initialCode?: string;
		expectedOutput?: string;
	};

	let { id, initialCode = '', expectedOutput = '' }: Props = $props();

	const startingCode = untrack(() => decodeSource(initialCode));
	const expected = untrack(() => decodeSource(expectedOutput));

	type Phase = 'idle' | 'running' | 'passed' | 'failed' | 'error';
	type RuntimeStatus = 'loading' | 'ready' | 'error';

	let code = $state(startingCode);
	let phase = $state<Phase>('idle');
	let runtimeStatus = $state<RuntimeStatus>('loading');
	let output = $state('');
	let errorText = $state('');
	let bootError = $state('');
	let solutionShown = $state(false);
	let timedOut = $state(false);
	let checkFailed = $state(false);
	let editorHost: HTMLDivElement | undefined;
	let root: HTMLElement | undefined;
	let view: EditorView | undefined;
	let runToken = 0;
	let unmounted = false;

	const statusKind = $derived(
		phase === 'passed'
			? 'passed'
			: phase === 'failed'
				? 'failed'
				: phase === 'error'
					? 'error'
					: phase === 'running'
						? 'running'
						: 'idle'
	);

	const statusText = $derived(
		phase === 'passed'
			? 'Passed'
			: phase === 'failed'
				? checkFailed
					? 'Output matched, but the hidden checks failed.'
					: 'Not quite — check the output.'
				: phase === 'error'
					? timedOut
						? 'Stopped — the environment was reset.'
						: 'Runtime error'
					: phase === 'running'
						? 'Running...'
						: runtimeStatus === 'loading'
							? 'Starting Python...'
							: runtimeStatus === 'error'
								? 'Python failed to load'
								: 'Awaiting run'
	);

	const showReset = $derived(code !== startingCode || solutionShown);
	const busy = $derived(phase === 'running');

	/**
	 * The page theme lives on `<html data-theme>` and is toggled outside this
	 * component, so the editor swaps through a compartment instead of a prop.
	 */
	let themeCompartment: Compartment | undefined;
	let themeFactory: ((theme: 'light' | 'dark') => Extension) | undefined;
	let activeTheme: 'light' | 'dark' = 'light';

	/** A lesson's CRT switch outranks the site theme: the terminal is dark, the print page light. */
	function pageTheme(): 'light' | 'dark' {
		const root = document.documentElement;
		if (root.dataset.crt) return root.dataset.crt === 'on' ? 'dark' : 'light';
		return root.dataset.theme === 'dark' ? 'dark' : 'light';
	}

	function themeExtensions(theme: 'light' | 'dark'): Extension {
		return themeFactory ? themeFactory(theme) : [];
	}

	function replaceCode(next: string) {
		code = next;

		if (view) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: next }
			});
			view.focus();
		}
	}

	function clearResult() {
		phase = 'idle';
		output = '';
		errorText = '';
		checkFailed = false;
	}

	async function handleRun() {
		if (busy) return;

		if (view) code = view.state.doc.toString();

		const token = ++runToken;
		output = '';
		errorText = '';
		timedOut = false;
		checkFailed = false;
		phase = 'running';

		if (runtimeStatus !== 'ready') {
			runtimeStatus = 'loading';
			bootError = '';
		}

		try {
			const outcome = await pythonRunner.runCode(code, getChecks(id));
			if (token !== runToken || unmounted || !outcome) return;

			runtimeStatus = 'ready';
			output = normalizeOutput(outcome.output);
			timedOut = outcome.timedOut === true;

			if (outcome.error) {
				errorText = outcome.error;
				phase = 'error';
				return;
			}

			if (outcome.checkFailed) {
				checkFailed = true;
				phase = 'failed';
				return;
			}

			phase = outputsMatch(output, expected) ? 'passed' : 'failed';
		} catch (error) {
			if (token !== runToken || unmounted) return;

			runtimeStatus = 'error';
			bootError = error instanceof Error ? error.message : String(error);
			errorText = bootError;
			phase = 'error';
		}
	}

	function handleReset() {
		if (busy) return;
		replaceCode(startingCode);
		solutionShown = false;
		clearResult();
	}

	function handleShowSolution() {
		if (busy) return;

		const solution = getSolution(id);
		if (!solution) return;

		replaceCode(solution);
		solutionShown = true;
		clearResult();
	}

	function handleEditorKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			void handleRun();
		}
	}

	onMount(() => {
		unmounted = false;
		activeTheme = pageTheme();

		let disposed = false;
		let editorObserver: IntersectionObserver | undefined;

		// CodeMirror is a large module graph. Import it only when the exercise is
		// approaching the viewport, so the lesson's text has the network to itself.
		const mountEditor = async () => {
			if (disposed || view || !editorHost) return;
			const [cm, state, language, langPython, theme] = await Promise.all([
				import('codemirror'),
				import('@codemirror/state'),
				import('@codemirror/language'),
				import('@codemirror/lang-python'),
				import('#lib/pyexercise/editor.ts')
			]);
			if (disposed || view || !editorHost) return;
			themeFactory = theme.editorTheme;
			themeCompartment = new state.Compartment();
			view = new cm.EditorView({
				doc: startingCode,
				extensions: [
					cm.basicSetup,
					langPython.python(),
					themeCompartment.of(themeExtensions(activeTheme)),
					cm.EditorView.lineWrapping,
					cm.EditorView.contentAttributes.of({ 'aria-label': 'Python code editor' }),
					language.indentUnit.of('    '),
					state.EditorState.tabSize.of(4),
					cm.EditorView.updateListener.of((update) => {
						if (!update.docChanged) return;
						code = update.state.doc.toString();
						// Editing during a run abandons that run: its output describes the
						// old code, not what is on screen now.
						if (phase === 'running') runToken++;
						if (phase === 'running' || phase === 'passed' || phase === 'failed' || phase === 'error') {
							clearResult();
						}
					})
				],
				parent: editorHost
			});

			editorHost.addEventListener('keydown', handleEditorKeydown, true);
		};

		if (!root || typeof IntersectionObserver === 'undefined') {
			void mountEditor();
		} else {
			editorObserver = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					editorObserver?.disconnect();
					void mountEditor();
				},
				{ rootMargin: '480px 0px' }
			);
			editorObserver.observe(root);
		}

		const themeObserver = new MutationObserver(() => {
			const next = pageTheme();
			if (next === activeTheme) return;
			activeTheme = next;
			if (!themeCompartment) return;
			view?.dispatch({ effects: themeCompartment.reconfigure(themeExtensions(next)) });
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-crt']
		});

		// The interpreter is a 12 MB download. Hold it until the exercise is
		// actually approaching the viewport, so the lesson's text can paint first.
		const boot = () => {
			pythonRunner
				.warmUp()
				.then(() => {
					if (!unmounted) runtimeStatus = 'ready';
				})
				.catch((error: unknown) => {
					if (unmounted) return;
					runtimeStatus = 'error';
					bootError = error instanceof Error ? error.message : String(error);
				});
		};

		let bootObserver: IntersectionObserver | undefined;
		if (!root || typeof IntersectionObserver === 'undefined') {
			boot();
		} else {
			bootObserver = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					bootObserver?.disconnect();
					boot();
				},
				{ rootMargin: '360px 0px' }
			);
			bootObserver.observe(root);
		}

		return () => {
			disposed = true;
			unmounted = true;
			runToken++;
			editorObserver?.disconnect();
			bootObserver?.disconnect();
			themeObserver.disconnect();
			editorHost?.removeEventListener('keydown', handleEditorKeydown, true);
			view?.destroy();
			view = undefined;
		};
	});
</script>

<section
	bind:this={root}
	class="exercise"
	class:is-passed={phase === 'passed'}
	class:is-failed={phase === 'failed' || phase === 'error'}
	class:is-running={busy}
	class:is-loading={runtimeStatus === 'loading'}
	data-testid="pyexercise"
	data-exercise-id={id}
	aria-label={`Exercise ${id}`}
	aria-busy={runtimeStatus === 'loading'}
>
	<span class="progress" aria-hidden="true"></span>

	<header class="head">
		<div class="identity">
			<span class="eyebrow">Exercise</span>
			<code class="id">{id}</code>
		</div>

		<div class="signals">
			{#if runtimeStatus === 'loading'}
				<span class="skeleton-chip" aria-label="Preparing Python" role="status"></span>
			{:else}
				<span class="runtime" class:ready={runtimeStatus === 'ready'} class:error={runtimeStatus === 'error'}>
					<span class="runtime-dot" aria-hidden="true"></span>
					{runtimeStatus === 'ready' ? 'Python ready' : 'Python offline'}
				</span>
			{/if}

			{#if phase === 'passed'}
				<span class="pass-badge" data-testid="passed-badge">
					<span class="check" aria-hidden="true">
						<svg viewBox="0 0 12 12" focusable="false">
							<path d="M2.4 6.2 4.8 8.6 9.7 3.4" />
						</svg>
					</span>
					<span>Passed</span>
				</span>
			{/if}
		</div>
	</header>

	<div class="shadow-wrapper editor-wrapper">
		<div class="frame">
		<div class="editor" bind:this={editorHost}></div>

		<div class="toolbar">
			<span class="shortcut"><kbd>Ctrl</kbd><span>/</span><kbd>⌘</kbd><span>+</span><kbd>Enter</kbd></span>

			<div class="actions">
				{#if showReset}
					<button type="button" class="ghost" onclick={handleReset} disabled={busy}>Reset</button>
				{/if}

				<button
					type="button"
					class="ghost"
					onclick={handleShowSolution}
					disabled={busy || solutionShown || !getSolution(id)}
					data-testid="show-solution"
				>
					{solutionShown ? 'Solution shown' : 'Show solution'}
				</button>

				<button
					type="button"
					class="run"
					class:running={busy}
					onclick={handleRun}
					disabled={busy || runtimeStatus === 'loading'}
					data-testid="run"
				>
					{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
					{busy ? 'Running' : 'Run'}
				</button>
			</div>
		</div>
		</div>
	</div>

	<div class="shadow-wrapper console-wrapper">
		<div class="console">
		<div class="console-bar" aria-hidden="true">
			<span class="console-title">ops console</span>
			<span class="console-path">~/studio-py/exercises/{id}</span>
		</div>

		<div class="status {statusKind}" aria-live="polite" data-testid="status">
			<span class="prompt" aria-hidden="true">&gt;</span>
			{#if runtimeStatus === 'loading'}
				<div class="boot">
					<span class="boot-label">[ LOADING PYTHON ]</span>
					<span class="boot-track" aria-hidden="true">
						<span class="boot-fill"></span>
					</span>
				</div>
			{:else}
				<span class="status-dot" aria-hidden="true"></span>
				<span>{statusText}</span>
			{/if}
		</div>

		{#if runtimeStatus === 'error' && bootError}
			<p class="boot-error">{bootError}</p>
		{/if}

		{#if phase === 'failed' || phase === 'error'}
			<div class="result" aria-live="polite">
				<div class="compare">
					<div class="compare-column">
						<div class="result-head"><span>Expected</span></div>
						<pre class="diff expected"><span class="sign" aria-hidden="true">+</span><span class="diff-text">{expected || '(no output)'}</span></pre>
					</div>
					<div class="compare-column">
						<div class="result-head">
							<span>Your output</span>
							{#if !output}<span class="result-note">No output captured</span>{/if}
						</div>
						<pre class="diff stdout" data-testid="output"><span class="sign" aria-hidden="true">−</span><span class="diff-text">{output || '(no output)'}</span></pre>
					</div>
				</div>

				{#if errorText}
					<div class="result-head traceback-head"><span>Traceback</span></div>
					<pre class="traceback" data-testid="traceback">{errorText}</pre>
				{/if}
			</div>
		{/if}
		</div>
	</div>
</section>

<style>
	.exercise {
		position: relative;
		isolation: isolate;
		/* The editor and console cast hard shadows outside their own boxes. */
		overflow: visible;
		border: 1px solid var(--color-ink);
		background: transparent;
		color: var(--color-ink);
		font-family: var(--font-mono);
	}

	.exercise.is-passed {
		border-width: 2px;
	}

	/* Indeterminate boot bar: a solid block, not a gradient sheen. */
	.progress {
		position: absolute;
		inset: 0 0 auto 0;
		z-index: 2;
		height: 2px;
		overflow: hidden;
		opacity: 0;
		transition: opacity 200ms ease;
		pointer-events: none;
	}

	.is-loading .progress {
		opacity: 1;
	}

	.progress::after {
		content: '';
		position: absolute;
		inset: 0;
		width: 32%;
		background: var(--color-ink);
		animation: progress-slide 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.8rem;
		padding: 1.5rem 1.8rem;
		border-bottom: 1px solid var(--color-ink);
	}

	.identity {
		display: flex;
		align-items: center;
		gap: 1.2rem;
		min-width: 0;
	}

	.head {
		flex-wrap: wrap;
		row-gap: 0.8rem;
	}

	.eyebrow {
		flex: none;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.exercise .id {
		overflow: hidden;
		min-width: 0;
		padding: 0;
		border: 0;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		line-height: 1.4;
		color: var(--color-muted);
		overflow-wrap: anywhere;
		white-space: normal;
	}

	.signals {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.9rem;
		flex: none;
	}

	.runtime {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
		white-space: nowrap;
	}

	.runtime-dot {
		width: 0.6rem;
		height: 0.6rem;
		border: 1px solid currentColor;
	}

	.runtime.ready {
		color: var(--color-ink);
	}

	.runtime.ready .runtime-dot {
		background: var(--color-ink);
	}

	.runtime.error {
		color: var(--color-ink);
		text-decoration: underline;
		text-underline-offset: 0.3em;
	}

	.pass-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.4rem 0.8rem 0.4rem 0.5rem;
		background: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-paper);
		white-space: nowrap;
	}

	.check {
		display: grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border: 1px solid currentColor;
	}

	.check svg {
		width: 0.9rem;
		height: 0.9rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.shadow-wrapper {
		margin: 1rem 1.2rem 0;
		overflow: visible;
		border: 1px solid var(--color-ink);
		background: var(--color-paper);
		box-shadow: 6px 6px 0px var(--color-ink);
		transition: box-shadow 80ms linear;
	}

	/* Focus lifts the sheet: the hard shadow steps out toward the reader. */
	.editor-wrapper:has(.frame:focus-within) {
		box-shadow: 10px 10px 0px var(--color-ink);
	}

	.console-wrapper {
		margin: 1rem 1.2rem 1.2rem;
		background: var(--color-ink);
	}

	.shadow-wrapper .frame,
	.shadow-wrapper .console {
		margin: 0;
		border: 0;
		box-shadow: none;
		background: transparent;
	}

	.frame {
		overflow: visible;
	}

	.frame:focus-within {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	.editor {
		font-family: var(--font-mono);
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.2rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--color-ink);
	}

	.shortcut {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	kbd {
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--color-ink);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.7rem;
		padding: 0.7rem 1.2rem;
		border: 1px solid var(--color-ink);
		background: transparent;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	button:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 3px;
	}

	button:disabled {
		cursor: default;
		opacity: 0.45;
	}

	.ghost:hover:not(:disabled) {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.run {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.run:hover:not(:disabled),
	.run:focus-visible {
		background: transparent;
		color: var(--color-ink);
	}

	.run.running {
		opacity: 1;
	}

	.spinner {
		width: 1.1rem;
		height: 1.1rem;
		border: 1px solid currentColor;
		border-right-color: transparent;
		animation: spin 0.7s linear infinite;
	}

	/* The console is the one inverted surface: an instrument report, not a
	   second sheet of paper. */
	.console {
		overflow: visible;
		background: var(--color-ink);
		color: var(--color-paper);
		-webkit-font-smoothing: antialiased;
	}

	.console-bar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.2rem;
		padding: 0.7rem 1.4rem;
		border-bottom: 1px solid currentColor;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0.68;
	}

	.console-path {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		min-height: 1.8rem;
		padding: clamp(10px, 1.2rem, 16px) clamp(12px, 1.4rem, 18px);
		font-family: var(--font-mono);
		font-size: 1rem;
		line-height: 1.5;
	}

	.prompt {
		flex: none;
		opacity: 0.6;
		user-select: none;
	}

	.status-dot {
		flex: none;
		width: 0.6rem;
		height: 0.6rem;
		border: 1px solid currentColor;
		background: transparent;
	}

	.status.running .status-dot {
		animation: breathe 1.1s ease-in-out infinite;
	}

	.status.passed {
		font-weight: 700;
	}

	.status.passed .status-dot {
		background: currentColor;
	}

	.status.failed .status-dot,
	.status.error .status-dot {
		border-style: dashed;
	}

	.skeleton-chip {
		display: block;
		width: 8.2rem;
		height: 1rem;
		background: currentColor;
		opacity: 0.22;
		animation: breathe 1.2s ease-in-out infinite;
	}

	/* Stark boot block: black ground, a green bar that fills in hard 5% steps over 2s. */
	.boot {
		display: grid;
		flex: 1;
		gap: 0.8rem;
		box-sizing: border-box;
		max-width: 28rem;
		padding: 1rem 1.2rem;
		border: 1px solid var(--color-ink);
		background: #000000;
		color: #f1f1f1;
	}

	.boot-label {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1;
		letter-spacing: 0.12em;
	}

	.boot-track {
		display: block;
		height: 0.8rem;
		border: 1px solid #555555;
	}

	.boot-fill {
		display: block;
		height: 100%;
		background: var(--color-snake);
		transform: scaleX(0);
		transform-origin: left;
		animation: boot-fill 2s steps(20, end) forwards;
	}

	@keyframes boot-fill {
		to {
			transform: scaleX(1);
		}
	}

	.boot-error {
		margin: 0 1.4rem 1.2rem;
		padding: 1rem 1.2rem;
		border: 1px dashed currentColor;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		line-height: 1.55;
		overflow-wrap: anywhere;
	}

	.result {
		padding: 0 1.4rem 1.4rem;
		animation: result-in 240ms ease both;
	}

	.compare {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.compare-column {
		min-width: 0;
	}

	.result-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.2rem;
		margin-bottom: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.75;
	}

	.result-note {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 400;
		letter-spacing: 0;
		text-transform: none;
		opacity: 0.75;
	}

	/* The lesson's global `.prose pre` rule out-specifies plain scoped selectors,
	   so the console restates the reset it owns. */
	.exercise .console pre {
		position: static;
		margin: 0;
		overflow: auto;
		border: 0;
		background: transparent;
		background-image: none;
		padding: 1rem 1.2rem;
		font-family: var(--font-mono);
		font-size: 1rem;
		line-height: 1.65;
		letter-spacing: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.exercise .console .diff {
		display: flex;
		gap: 1rem;
		max-height: 19rem;
		border: 1px solid currentColor;
	}

	.exercise .console .diff .sign {
		flex: none;
		width: 1rem;
		font-weight: 700;
		user-select: none;
	}

	.exercise .console .diff-text {
		min-width: 0;
		flex: 1;
	}

	.exercise .console .expected {
		border-style: solid;
	}

	.exercise .console .stdout {
		border-style: dashed;
	}

	.traceback-head {
		margin-top: 1.2rem;
	}

	.exercise .console .traceback {
		max-height: 24rem;
		border: 1px dashed currentColor;
	}

	@keyframes progress-slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(320%);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes breathe {
		50% {
			opacity: 0.3;
		}
	}

	@keyframes result-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.compare {
			grid-template-columns: 1fr;
		}

		.head {
			flex-wrap: wrap;
			gap: 1rem;
			padding: 1.4rem 1.5rem;
		}

		.identity {
			gap: 0.9rem;
		}

		.id {
			font-size: 1.2rem;
		}

		.signals {
			margin-left: auto;
		}

		.editor-wrapper {
			margin: 1.2rem 1.2rem 0;
		}

		.console-wrapper {
			margin: 1rem 1.2rem 1.2rem;
		}

		.toolbar {
			padding: 0.9rem 1rem;
		}

		.shortcut {
			display: none;
		}

		.actions {
			width: 100%;
			justify-content: flex-end;
			gap: 0.8rem;
		}

		button {
			padding: 1rem 1.5rem;
		}

		.run {
			padding: 1rem 2.2rem;
		}

		.status {
			padding: 1.1rem 1.3rem;
		}

		.console-bar {
			padding: 0.6rem 1.3rem;
		}

		.console-path {
			display: none;
		}

		.result {
			padding: 0 1.3rem 1.3rem;
		}
	}
</style>
