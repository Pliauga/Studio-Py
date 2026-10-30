<script lang="ts">
	import { telemetry } from '#lib/stores/telemetry.svelte.ts';

	type Props = {
		conceptId: string;
		codeSnippet: string;
		options: string[];
		correctIndex: number;
		rationale: string;
	};

	let { conceptId, codeSnippet, options, correctIndex, rationale }: Props = $props();

	let picked = $state<number | null>(null);
	let revealed = $state(false);

	const PY_KEYWORDS = new Set([
		'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
		'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
		'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
		'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
	]);
	const PY_CONSTANTS = new Set(['False', 'None', 'True']);
	const PY_BUILTINS = new Set([
		'print', 'len', 'range', 'int', 'float', 'str', 'list', 'dict', 'set',
		'tuple', 'sum', 'min', 'max', 'sorted', 'enumerate', 'zip', 'open', 'type',
		'isinstance', 'super'
	]);

	function escapeHtml(value: string): string {
		return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function tokenSpan(className: string, value: string): string {
		return `<span class="${className}">${escapeHtml(value)}</span>`;
	}

	// The snippet is a component prop, not an MDX code fence, so Prism never
	// sees it. Tokenizing here keeps the quiz code legible and highlighted.
	function highlightPython(source: string): string {
		let html = '';
		let index = 0;
		let previousWord = '';

		while (index < source.length) {
			const char = source[index];

			if (char === '#') {
				const end = source.indexOf('\n', index);
				const stop = end === -1 ? source.length : end;
				html += tokenSpan('tok-comment', source.slice(index, stop));
				index = stop;
				continue;
			}

			if (char === '"' || char === "'") {
				const triple = source.slice(index, index + 3) === char.repeat(3);
				let end = index + (triple ? 3 : 1);
				if (triple) {
					while (end < source.length && source.slice(end, end + 3) !== char.repeat(3)) {
						end += source[end] === '\\' ? 2 : 1;
					}
					end = Math.min(source.length, end + 3);
				} else {
					while (end < source.length) {
						if (source[end] === '\\') {
							end += 2;
							continue;
						}
						if (source[end] === char) {
							end += 1;
							break;
						}
						if (source[end] === '\n') break;
						end += 1;
					}
				}
				html += tokenSpan('tok-string', source.slice(index, end));
				index = end;
				continue;
			}

			if (/[0-9]/.test(char) && (index === 0 || !/[A-Za-z0-9_]/.test(source[index - 1]))) {
				let end = index + 1;
				while (end < source.length && /[0-9._]/.test(source[end])) end += 1;
				html += tokenSpan('tok-number', source.slice(index, end));
				index = end;
				continue;
			}

			if (/[A-Za-z_]/.test(char)) {
				let end = index + 1;
				while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
				const word = source.slice(index, end);
				let className = '';
				if (PY_CONSTANTS.has(word)) className = 'tok-boolean';
				else if (PY_KEYWORDS.has(word)) className = 'tok-keyword';
				else if (previousWord === 'class') className = 'tok-class-name';
				else if (previousWord === 'def') className = 'tok-function';
				else if (PY_BUILTINS.has(word)) className = 'tok-builtin';
				else if (/^\s*\(/.test(source.slice(end))) className = 'tok-function';
				html += className ? tokenSpan(className, word) : escapeHtml(word);
				previousWord = word;
				index = end;
				continue;
			}

			if ('()[]{}.,:;'.includes(char)) {
				html += tokenSpan('tok-punctuation', char);
				index += 1;
				continue;
			}

			if ('=+-*/%<>!&|^~'.includes(char)) {
				let end = index + 1;
				while (end < source.length && '=+-*/%<>!&|^~'.includes(source[end])) end += 1;
				html += tokenSpan('tok-operator', source.slice(index, end));
				index = end;
				continue;
			}

			html += escapeHtml(char);
			index += 1;
		}

		return html;
	}

	const highlightedSnippet = $derived(highlightPython(codeSnippet));

	const stats = $derived(telemetry.statsOf(conceptId));
	const isCorrect = $derived(picked !== null && picked === correctIndex);
	// The rationale is written in the lesson prose's dialect: `backticks` mark code.
	const rationaleParts = $derived(
		rationale
			.split(/(`[^`]+`)/g)
			.filter((part) => part.length > 0)
			.map((part) =>
				part.startsWith('`') && part.endsWith('`')
					? { text: part.slice(1, -1), code: true }
					: { text: part, code: false }
			)
	);

	function choose(index: number) {
		if (revealed) return;

		picked = index;
		revealed = true;
		telemetry.recordPrediction(conceptId, index === correctIndex, index);
	}

	function retry() {
		picked = null;
		revealed = false;
	}
</script>

<section class="predict" data-testid="predict-output" data-concept-id={conceptId}>
	<header class="head">
		<span class="eyebrow">Predict the output</span>
		<span class="score" data-testid="predict-score">
			{stats.correct}/{stats.attempts}
			<span class="score-label">correct</span>
		</span>
	</header>

	<pre class="snippet"><code class="snippet-code">{@html highlightedSnippet}</code></pre>

	<div class="options" role="group" aria-label="Answer choices">
		{#each options as option, index (index)}
			<button
				type="button"
				class="option"
				class:picked={revealed && picked === index}
				class:right={revealed && index === correctIndex}
				class:wrong={revealed && picked === index && index !== correctIndex}
				disabled={revealed}
				data-testid="predict-option"
				aria-pressed={revealed && picked === index}
				onclick={() => choose(index)}
			>
				<span class="marker" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
				<span class="option-text">{option}</span>
			</button>
		{/each}
	</div>

	{#if revealed}
		<div class="verdict" class:right={isCorrect} role="status" data-testid="predict-verdict">
			<span class="verdict-line">{isCorrect ? 'Correct.' : 'Not quite.'}</span>
			<span class="verdict-rationale">
				{#each rationaleParts as part, index (index)}{#if part.code}<code>{part.text}</code
					>{:else}{part.text}{/if}{/each}
			</span>
			<button type="button" class="again" onclick={retry}>Try again</button>
		</div>
	{/if}
</section>

<style>
	.predict {
		margin: 3.2rem 0;
		padding: clamp(14px, 2rem, 24px);
		border: 1px solid var(--color-ink);
		color: var(--color-ink);
		font-family: var(--font-mono);
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.6rem;
		margin-bottom: 1.6rem;
		padding-bottom: 1.2rem;
		border-bottom: 1px solid var(--color-ink);
	}

	.eyebrow {
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-ink);
	}

	.score {
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.score-label {
		margin-left: 0.4rem;
		font-size: 0.9rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.predict .snippet {
		margin: 0 0 1.6rem;
		padding: 1.4rem 1.6rem;
		overflow-x: auto;
		border: 1px solid var(--color-ink);
		background: var(--color-ink);
		color: var(--color-paper);
		font-family: var(--font-mono);
		font-size: 1.0625rem;
		line-height: 1.7;
		white-space: pre;
	}

	.predict .snippet .snippet-code {
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--color-paper) !important;
		font-family: inherit;
		font-size: inherit;
	}

	/*
	 * The snippet is a black panel in both themes, so its tokens always use the
	 * dark-mode palette.
	 */
	.predict .snippet :global(.tok-keyword) {
		color: #f1f1f1 !important;
		font-weight: 700;
	}

	.predict .snippet :global(.tok-boolean),
	.predict .snippet :global(.tok-builtin) {
		color: #40f51a !important;
	}

	.predict .snippet :global(.tok-function),
	.predict .snippet :global(.tok-class-name) {
		color: #f1f1f1 !important;
	}

	.predict .snippet :global(.tok-number) {
		color: #40f51a !important;
	}

	.predict .snippet :global(.tok-string) {
		color: #a3a2a7 !important;
	}

	.predict .snippet :global(.tok-comment) {
		color: #777777 !important;
		font-style: italic;
	}

	.predict .snippet :global(.tok-operator) {
		color: #f1f1f1 !important;
	}

	.predict .snippet :global(.tok-punctuation) {
		color: #a3a2a7 !important;
	}

	:global(html[data-theme='dark']) .predict .snippet {
		border-color: #f1f1f1;
		background: #000000;
		color: #f1f1f1;
	}

	:global(html[data-theme='dark']) .predict .snippet .snippet-code {
		color: #f1f1f1 !important;
	}

	.options {
		display: grid;
		min-width: 0;
		border-top: 1px solid var(--color-ink);
	}

	.option {
		display: flex;
		align-items: baseline;
		gap: 1.4rem;
		width: 100%;
		min-width: 0;
		padding: clamp(10px, 1.2rem, 16px) clamp(12px, 1.4rem, 18px);
		border: 0;
		border-bottom: 1px solid var(--color-ink);
		background: transparent;
		color: var(--color-ink);
		font: inherit;
		font-size: 1.0625rem;
		text-align: left;
		cursor: pointer;
		transition:
			background 160ms linear,
			color 160ms linear;
	}

	.option:disabled {
		cursor: default;
	}

	.option:not(:disabled):hover {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.option:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: -2px;
	}

	.marker {
		flex: none;
		width: 1.8rem;
		font-size: 1.1rem;
		color: inherit;
		opacity: 0.7;
	}

	.option-text {
		font-family: var(--font-mono);
		font-size: 1rem;
		line-height: 1.6;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.option.right {
		background: var(--color-ink);
		color: var(--color-paper);
		font-weight: 700;
	}

	.option.wrong {
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}

	.verdict {
		display: grid;
		gap: 0.8rem;
		justify-items: start;
		margin-top: 1.6rem;
		padding-top: 1.6rem;
		font-family: var(--font-body);
		font-size: 1.625rem;
		line-height: 1.35;
	}

	.verdict-line {
		font-family: var(--font-mono);
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-ink);
	}

	.verdict-rationale {
		color: var(--color-ink);
	}

	.predict .verdict-rationale :global(code) {
		padding: 0 0.3rem;
		border: 0;
		background: transparent;
		font-family: var(--font-mono);
		font-size: 0.82em;
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.again {
		margin-top: 0.4rem;
		padding: 0.7rem 1.1rem;
		border: 1px solid var(--color-ink);
		background: transparent;
		color: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 1.1rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background 160ms linear,
			color 160ms linear;
	}

	.again:hover {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	@media (max-width: 640px) {
		.predict {
			padding: 1.6rem;
		}

		.head {
			flex-wrap: wrap;
			gap: 0.6rem;
		}
	}
</style>
