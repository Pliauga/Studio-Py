<script lang="ts">
	import { onMount } from 'svelte';
	import InkStamp from '#lib/components/InkStamp.svelte';
	import RegistrationMarks from '#lib/components/RegistrationMarks.svelte';
	import SnakeSpine from '#lib/components/SnakeSpine.svelte';
	import { trackWaypoints } from '#lib/motion/trail.ts';
	import { MODULES } from '#lib/content/lessons.ts';
	import { lessonComponent } from '#lib/content/lessonModules.ts';
	import { sizeTier } from '#lib/content/chapters.ts';
	import { progress, STATUS_LABEL } from '#lib/stores/progress.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const module = $derived(data.module);
	// A static import would put every lesson in each keep-alive chunk; this
	// map is keyed so a visit compiles only its own MDX.
	const Lesson = $derived(lessonComponent(module.slug));

	const index = $derived(MODULES.findIndex((entry) => entry.slug === module.slug));
	const previous = $derived(index > 0 ? MODULES[index - 1] : undefined);
	const next = $derived(index < MODULES.length - 1 ? MODULES[index + 1] : undefined);
	const status = $derived(progress.statusOf(module.slug));
	const headingId = $derived(`week-${module.week}-lesson`);

	const pad = (n: number) => String(n).padStart(2, '0');

	let trail = $state<HTMLDivElement | null>(null);
	let article = $state<HTMLElement | null>(null);
	/** Where the snake's head rests along the article: the waypoint the reader is on. */
	let waypoint = $state(0);

	// Reading the article is what marks a lesson opened; `complete()` is the
	// only explicit act, so the dashboard never overstates progress.
	onMount(() => {
		if (progress.statusOf(module.slug) === 'not-started') progress.set(module.slug, 'in-progress');
		if (!trail || !article) return;
		return trackWaypoints(trail, article, (percent) => (waypoint = percent));
	});

	function toggleComplete(): void {
		progress.set(module.slug, status === 'completed' ? 'not-started' : 'completed');
	}
</script>

<svelte:head>
	<title>{module.title} — Studio Py</title>
	<meta name="description" content={module.summary} />
</svelte:head>

<main class="reader">
	<div class="sheet">
		<RegistrationMarks />

		<header class="hero">
			<span
				class="hero-mark"
				style={`background-image: url(/marks/w${pad(module.week)}.webp)`}
				aria-hidden="true"
			></span>
			<div class="hero-inner" data-size={sizeTier(module.title.length)}>
				<p class="stamp">
					<span class="plate">Plate {pad(module.week + 2)}</span>
					<span class="sep">—</span>
					Week {pad(module.week)} · {module.estimatedMinutes} min · {STATUS_LABEL[status]}
				</p>
				<h1 id={headingId} aria-label={module.title}>{module.title}</h1>
				<p class="lede">{module.summary}</p>
			</div>
			{#if status === 'completed'}
				<span class="hero-stamp"><InkStamp size="lg" /></span>
			{/if}
		</header>

		<div class="trail" bind:this={trail}>
			<SnakeSpine percent={waypoint} />
			<article class="prose" bind:this={article}>
				{#if Lesson}
					<Lesson />
				{/if}
			</article>
		</div>

		<footer class="foot">
			<span class="plus tl" aria-hidden="true"></span>
			<span class="plus tr" aria-hidden="true"></span>
			<span class="plus bl" aria-hidden="true"></span>
			<span class="plus br" aria-hidden="true"></span>

			<div class="signoff">
				<span class="signoff-label">Module sign-off // Plate {pad(module.week + 2)}</span>
				<div class="signoff-act">
					<button class="complete" class:on={status === 'completed'} onclick={toggleComplete}>
						{status === 'completed' ? 'Completed' : 'Mark as complete'}
					</button>
					<span class="stamp">{STATUS_LABEL[status]}</span>
				</div>
			</div>

			<nav class="pager" aria-label="Module navigation">
				{#if previous}
					<a class="cell" href={`/lesson/${previous.slug}`}>
						<span class="dir">← Week {pad(previous.week)}</span>
						<span class="pager-title">{previous.title}</span>
					</a>
				{:else}
					<span class="cell"></span>
				{/if}
				{#if next}
					<a class="cell right" href={`/lesson/${next.slug}`}>
						<span class="dir">Week {pad(next.week)} →</span>
						<span class="pager-title">{next.title}</span>
					</a>
				{:else}
					<span class="cell"></span>
				{/if}
			</nav>
		</footer>
	</div>
</main>

<style>
	/* The back link lives in the fixed header, so the page starts below it. */
	.reader {
		padding: 80px clamp(24px, 5vw, 72px) 16px;
	}

	.sheet {
		position: relative;
	}

	/* The snake lives in the left margin and runs the article's length. */
	.trail {
		position: relative;
	}

	.hero {
		position: relative;
		overflow: hidden;
		display: grid;
		align-items: end;
		min-height: 28svh;
		padding: 40px 0 32px;
		border-bottom: 1px solid var(--color-ink);
		text-align: left;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		--display: clamp(48px, 7.2vw, 106px);
		width: 100%;
	}

	.hero-inner[data-size='l'] {
		--display: clamp(42px, 5.7vw, 84px);
	}

	.hero-inner[data-size='m'] {
		--display: clamp(36px, 4.6vw, 64px);
	}

	.hero-inner[data-size='s'] {
		--display: clamp(30px, 3.4vw, 46px);
	}

	.hero-mark {
		position: absolute;
		z-index: 0;
		top: 50%;
		right: clamp(-56px, -3vw, -18px);
		width: clamp(210px, 30vw, 430px);
		aspect-ratio: 1;
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		opacity: 0.065;
		transform: translateY(-50%) rotate(6deg);
		pointer-events: none;
		user-select: none;
		display: block;
		object-fit: contain;
	}

	@media (max-width: 640px) {
		.hero-mark {
			display: none;
		}
	}

	.hero-stamp {
		position: absolute;
		z-index: 2;
		top: clamp(10px, 2vw, 22px);
		right: 0;
		color: var(--color-ink);
	}

	.stamp {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 1.2rem;
		line-height: 1.6;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.hero .stamp {
		margin-bottom: 24px;
	}

	.plate {
		color: var(--color-ink);
		font-weight: 700;
	}

	.hero .sep {
		padding: 0 0.3em;
		color: var(--color-muted);
	}

	:global(html[data-theme='dark']) .hero-mark {
		filter: invert(1);
		opacity: 0.11;
	}

	h1 {
		max-width: min(15ch, 100%);
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--display);
		font-weight: 500;
		line-height: 0.86;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		overflow-wrap: break-word;
		hyphens: auto;
		text-wrap: balance;
	}

	.lede {
		max-width: 54ch;
		margin: 24px 0 0;
		font-family: var(--font-body);
		font-size: 1.5rem;
		line-height: 1.5;
		text-wrap: pretty;
		color: var(--color-muted);
	}

	/* The article is bare paper. No panels, no cards: the type is the layout. */
	.prose {
		font-family: var(--font-body);
		font-size: 1em;
		line-height: 1.42;
		color: var(--color-ink);
	}

	/* The split-pane console. A chapter with an exercise, prediction or scene is a split: the
	   field-guide column on the left, the console pinned on the right, and one hairline down
	   the seam. A narrative-only chapter is `wide` and takes the full measure. */
	.prose :global(.chapter) {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas:
			'pin'
			'body';
		padding-bottom: 40px;
		border-bottom: 1px solid var(--color-ink);
	}

	.prose :global(.chapter.split) {
		grid-template-columns: minmax(350px, 5fr) minmax(0, 7fr);
		align-items: start;
		grid-template-areas:
			'pin slot'
			'body slot';
		grid-template-rows: auto 1fr;
	}

	.prose :global(.chapter.split .pin),
	.prose :global(.chapter.split .chapter-body) {
		padding-right: clamp(20px, 2.4vw, 36px);
	}

	.prose :global(.chapter.split .console-slot) {
		padding-left: clamp(20px, 2.4vw, 36px);
	}

	/* The seam, with a registration cross where it meets the row dividers: always at the
	   chapter's foot, and at its head when the chapter above is not itself a split. */
	.prose :global(.chapter .spine) {
		position: absolute;
		top: 0;
		bottom: 0;
		left: max(41.6667%, 350px);
		width: 1px;
		background: color-mix(in srgb, var(--color-ink) 15%, transparent);
		pointer-events: none;
	}

	.prose :global(.chapter .spine::before),
	.prose :global(.chapter .spine::after) {
		content: '';
		position: absolute;
		left: -11px;
		width: 23px;
		height: 23px;
		color: var(--color-ink);
		background:
			linear-gradient(to right, currentColor 0 9px, transparent 9px 14px, currentColor 14px 100%)
				center / 23px 1px no-repeat,
			linear-gradient(to bottom, currentColor 0 9px, transparent 9px 14px, currentColor 14px 100%)
				center / 1px 23px no-repeat;
	}

	.prose :global(.chapter .spine::after) {
		bottom: -12px;
	}

	.prose :global(.chapter .spine::before) {
		top: -12px;
		display: none;
	}

	.prose :global(.chapter.split:not(.split + .split) .spine::before) {
		display: block;
	}

	.prose :global(.pin) {
		grid-area: pin;
		height: auto;
	}

	.prose :global(.pin-inner) {
		position: static;
		display: block;
		height: auto;
		margin: 32px 0 12px;
		padding: 0;
		text-align: left;
	}

	.prose :global(h2) {
		max-width: none;
		margin: 0;
		padding-top: 10px;
		border-top: 4px solid var(--color-ink);
		font-family: var(--font-display);
		font-size: clamp(30px, 3.6vw, 56px);
		font-weight: 500;
		line-height: 0.92;
		letter-spacing: -0.04em;
		text-align: left;
		text-transform: uppercase;
		overflow-wrap: break-word;
		hyphens: auto;
		text-wrap: balance;
	}

	.prose :global(.chapter-body) {
		grid-area: body;
		margin: 0 0 24px;
		text-align: left;
	}

	.prose :global(.chapter.split .chapter-body) {
		max-width: 68ch;
	}

	/* Full-width text still keeps a readable measure for running copy. */
	.prose :global(.chapter.wide .chapter-body > :is(p, ul, ol, blockquote)) {
		max-width: 100ch;
	}

	.prose :global(.console-slot) {
		grid-area: slot;
		position: sticky;
		top: 100px;
		align-self: start;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 24px;
		height: calc(100vh - 120px);
		max-height: calc(100vh - 120px);
		min-width: 0;
		margin-top: 32px;
		padding-block: 0 12px;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	/* The telemetry readout is part of the page, not a tool: it sits beside the text at the
	   text's own height instead of pinning. */
	.prose :global(.console-slot.telemetry) {
		position: static;
		height: auto;
		align-self: stretch;
		overflow: visible;
	}

	.prose :global(.console-slot > *) {
		flex: 0 0 auto;
	}

	.prose :global(.console-slot > .exercise:only-child) {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
	}

	.prose :global(.console-slot > .exercise:only-child .console-wrapper) {
		flex: 1 1 auto;
	}

	.prose :global(.console-slot .sandbox-embed),
	.prose :global(.console-slot .predict) {
		margin: 0;
	}

	/* The wrapper dissolves so the sandbox and its editor become direct children of the
	   scrolling console, which is what lets the sandbox pin. */
	.prose :global(.console-slot .scene-split-layout) {
		display: contents;
	}

	.prose :global(.console-slot .scene-col),
	.prose :global(.console-slot .code-col) {
		min-width: 0;
	}

	/* The sandbox stays pinned at the top of the console while the editor and terminal
	   scroll beneath it. */
	.prose :global(.console-slot .scene-col) {
		position: sticky;
		top: 0;
		z-index: 2;
		background: var(--color-paper);
	}

	.prose :global(.console-slot .sandbox-embed .frame) {
		min-height: 0;
	}

	@media (max-width: 900px) {
		.prose :global(.chapter.split) {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: none;
			grid-template-areas:
				'pin'
				'body'
				'slot';
		}

		.prose :global(.chapter.split .pin),
		.prose :global(.chapter.split .chapter-body),
		.prose :global(.chapter.split .console-slot) {
			padding-inline: 0;
		}

		.prose :global(.console-slot) {
			position: static;
			height: auto;
			max-height: none;
			margin-top: 0;
			overflow: visible;
		}

		.prose :global(.console-slot .scene-col) {
			position: static;
		}

		.prose :global(.chapter .spine) {
			display: none;
		}
	}

	.prose :global(h3) {
		margin: 28px 0 10px;
		padding-top: 10px;
		border-top: 1px solid var(--color-ink);
		font-family: var(--font-mono);
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.8rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.prose :global(p) {
		margin: 0 0 12px;
		text-align: left;
		text-wrap: pretty;
	}

	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 16px;
		padding-left: 28px;
	}

	.prose :global(li) {
		margin-bottom: 6px;
		text-align: left;
	}

	.prose :global(li::marker) {
		font-family: var(--font-mono);
		font-size: 0.8em;
	}

	.prose :global(strong) {
		font-weight: 700;
	}

	.prose :global(em) {
		font-style: italic;
	}

	.prose :global(a) {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.25em;
		text-decoration-thickness: 1px;
	}

	.prose :global(a:hover),
	.prose :global(a:focus-visible) {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.prose :global(code) {
		padding: 0.1rem 0.3rem;
		border: 0;
		border-radius: 0;
		background: var(--code-inline-bg);
		font-family: var(--font-mono);
		font-size: 1em;
	}

	/* The exercise id is a label, not an inline code span. */
	.prose :global(.exercise .id) {
		background: transparent;
	}

	/* A long line scrolls inside the block, never the page: `pre-wrap` would
	   destroy Python indentation, so the block keeps its own `overflow-x`.

	   A static block is a terminal printout stamped onto the page, in BOTH themes: the
	   surface is the machine's black and the token tones are the ones the live editor
	   uses on black, so light mode gets the same vibrant syntax rather than ink on paper.
	   The syntax variables are re-declared here, on the block itself, which is why the
	   tones below pick them up in light mode where `:root` still carries the paper set. */
	.prose :global(pre) {
		--code-ink: #f1f1f1;
		--syntax-keyword: #f1f1f1;
		--syntax-function: #f1f1f1;
		--syntax-builtin: #40f51a;
		--syntax-number: #40f51a;
		--syntax-string: #a3a2a7;
		--syntax-comment: #777777;
		margin: 0 0 10px;
		padding: 1.5rem;
		overflow-x: auto;
		border: 1px solid var(--color-ink);
		background: #000000;
		color: var(--code-ink);
		line-height: 1.7;
	}

	.prose :global(p code),
	.prose :global(li code),
	.prose :global(td code) {
		overflow-wrap: anywhere;
	}

	.prose :global(pre code) {
		display: block;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	/* Editorial syntax: ink colours carry the distinction. The selectors are
	   intentionally deeper than Prism's own `.token` rules and !important so a
	   global code colour cannot flatten every token. */
	.prose :global(pre code span.token.comment),
	.prose :global(pre code span.token.prolog),
	.prose :global(pre code span.token.doctype) {
		color: var(--syntax-comment) !important;
		font-style: italic !important;
	}

	.prose :global(pre code span.token.keyword) {
		color: var(--syntax-keyword) !important;
		font-weight: 700 !important;
	}

	.prose :global(pre code span.token.boolean),
	.prose :global(pre code span.token.builtin) {
		color: var(--syntax-builtin) !important;
	}

	.prose :global(pre code span.token.function),
	.prose :global(pre code span.token.class-name) {
		color: var(--syntax-function) !important;
	}

	.prose :global(pre code span.token.number) {
		color: var(--syntax-number) !important;
	}

	.prose :global(pre code span.token.string),
	.prose :global(pre code span.token.char),
	.prose :global(pre code span.token.triple-quoted-string) {
		color: var(--syntax-string) !important;
	}

	.prose :global(pre code span.token.operator) {
		color: var(--code-ink) !important;
	}

	.prose :global(pre code span.token.punctuation) {
		color: var(--code-ink) !important;
	}

	.prose :global(pre:not(.snippet) code) {
		color: var(--code-ink) !important;
	}

	.prose :global(blockquote) {
		margin: 0 0 24px;
		padding: 0 0 0 2rem;
		border-left: 2px solid var(--color-ink);
	}

	.prose :global(table) {
		width: 100%;
		margin: 0 0 24px;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 1.25rem;
		line-height: 1.5;
	}

	.prose :global(th),
	.prose :global(td) {
		padding: 1rem 1.2rem 1rem 0;
		border-bottom: 1px solid var(--color-muted);
		text-align: left;
		vertical-align: top;
	}

	.prose :global(th) {
		border-bottom-color: var(--color-ink);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.prose :global(hr) {
		margin: 40px 0;
		border: 0;
		border-top: 1px solid var(--color-ink);
	}

	.prose :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 0 0 24px;
		filter: grayscale(1);
	}

	/* The footer is the last row of the sheet's grid: the same full width as the chapters
	   above, ruled top and bottom, with the pager split on the same 5/7 seam. */
	.foot {
		position: relative;
		margin-top: 0;
		border-bottom: 1px solid var(--color-ink);
	}

	.foot .plus {
		position: absolute;
		z-index: 1;
		width: 23px;
		height: 23px;
		color: var(--color-ink);
		background:
			linear-gradient(to right, currentColor 0 9px, transparent 9px 14px, currentColor 14px 100%)
				center / 23px 1px no-repeat,
			linear-gradient(to bottom, currentColor 0 9px, transparent 9px 14px, currentColor 14px 100%)
				center / 1px 23px no-repeat;
		pointer-events: none;
	}

	.foot .tl {
		top: -12px;
		left: -12px;
	}

	.foot .tr {
		top: -12px;
		right: -12px;
	}

	.foot .bl {
		bottom: -12px;
		left: -12px;
	}

	.foot .br {
		right: -12px;
		bottom: -12px;
	}

	.signoff {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 16px 0;
		border-bottom: 1px solid var(--color-ink);
	}

	.signoff-label {
		font-family: var(--font-mono);
		font-size: 1.2rem;
		line-height: 1.4;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.signoff-act {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.complete {
		padding: 1.4rem 2rem;
		border: 1px solid var(--color-ink);
		background: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 1.2rem;
		line-height: 1;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-paper);
		cursor: pointer;
		transition:
			background 200ms ease,
			color 200ms ease;
	}

	.complete:hover,
	.complete:focus-visible {
		background: var(--color-paper);
		color: var(--color-ink);
	}

	.complete.on {
		background: transparent;
		color: var(--color-ink);
	}

	.complete.on:hover,
	.complete.on:focus-visible {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.complete:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 3px;
	}

	.pager {
		display: grid;
		grid-template-columns: minmax(350px, 5fr) minmax(0, 7fr);
	}

	.pager .cell {
		display: grid;
		align-content: start;
		gap: 0.8rem;
		padding: 20px 0;
		color: inherit;
		text-decoration: none;
	}

	.pager .cell:first-child {
		padding-right: clamp(20px, 2.4vw, 36px);
	}

	.pager .right {
		justify-items: end;
		padding-left: clamp(20px, 2.4vw, 36px);
		border-left: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent);
		text-align: right;
	}

	.dir {
		font-family: var(--font-mono);
		font-size: 1.1rem;
		line-height: 1;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.pager-title {
		font-family: var(--font-body);
		font-size: 1.8rem;
		line-height: 2.3rem;
	}

	.pager a:hover .pager-title,
	.pager a:focus-visible .pager-title {
		text-decoration: underline;
		text-underline-offset: 0.25em;
	}

	@media (max-width: 700px) {
		.hero {
			min-height: 42svh;
			padding: 40px 0 32px;
		}

		.lede {
			font-size: 1.4rem;
			line-height: 1.45;
		}

		.prose :global(.chapter-body) {
			max-width: none;
		}

		.signoff,
		.signoff-act {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.6rem;
		}

		.pager {
			grid-template-columns: minmax(0, 1fr);
		}

		.pager .cell:first-child {
			padding-right: 0;
		}

		.pager .right {
			justify-items: start;
			padding-left: 0;
			border-top: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent);
			border-left: 0;
			text-align: left;
		}
	}
</style>
