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
			<div class="signoff">
				<button class="complete" class:on={status === 'completed'} onclick={toggleComplete}>
					{status === 'completed' ? 'Completed' : 'Mark as complete'}
				</button>
				<span class="stamp">{STATUS_LABEL[status]}</span>
			</div>

			<nav class="pager" aria-label="Module navigation">
				{#if previous}
					<a href={`/lesson/${previous.slug}`}>
						<span class="dir">← Week {pad(previous.week)}</span>
						<span class="pager-title">{previous.title}</span>
					</a>
				{:else}
					<span></span>
				{/if}
				{#if next}
					<a class="right" href={`/lesson/${next.slug}`}>
						<span class="dir">Week {pad(next.week)} →</span>
						<span class="pager-title">{next.title}</span>
					</a>
				{/if}
			</nav>
		</footer>
	</div>
</main>

<style>
	/* The back link lives in the fixed header, so the page starts below it. */
	.reader {
		padding: calc(clamp(16px, 3.5vw, 48px) + clamp(17px, 2vw, 28px) + 32px)
			clamp(24px, 5vw, 72px) 16px;
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
		place-items: center;
		min-height: 34svh;
		padding: 40px 0 32px;
		border-bottom: 1px solid var(--color-ink);
		text-align: center;
	}

	.hero-inner,
	.prose :global(.pin-inner) {
		position: relative;
		z-index: 1;
		--display: clamp(48px, 7.2vw, 106px);
		width: 100%;
	}

	.hero-inner[data-size='l'],
	.prose :global(.pin-inner[data-size='l']) {
		--display: clamp(42px, 5.7vw, 84px);
	}

	.hero-inner[data-size='m'],
	.prose :global(.pin-inner[data-size='m']) {
		--display: clamp(36px, 4.6vw, 64px);
	}

	.hero-inner[data-size='s'],
	.prose :global(.pin-inner[data-size='s']) {
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
		margin: 0 auto;
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
		margin: 24px auto 0;
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

	.prose :global(.pin) {
		height: auto;
	}

	.prose :global(.pin-inner) {
		position: static;
		display: block;
		height: auto;
		margin: 32px auto 12px;
		padding: 0;
		text-align: center;
	}

	.prose :global(h2) {
		max-width: min(20ch, 100%);
		margin: 0 auto;
		font-family: var(--font-display);
		font-size: var(--display);
		font-weight: 500;
		line-height: 0.84;
		letter-spacing: -0.045em;
		text-transform: uppercase;
		overflow-wrap: break-word;
		hyphens: auto;
		text-wrap: balance;
	}

	.prose :global(.chapter-body) {
		max-width: 78ch;
		margin: 0 auto 24px;
	}

	.prose :global(.chapter-body:has(.scene-split-layout)) {
		max-width: 1200px;
	}

	.prose :global(.scene-split-layout) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	.prose :global(.scene-col),
	.prose :global(.code-col) {
		min-width: 0;
	}

	.prose :global(.scene-col) {
		position: sticky;
		top: 100px;
	}

	.prose :global(.scene-split-layout .sandbox-embed) {
		margin: 0;
	}

	@media (max-width: 1024px) {
		.prose :global(.scene-split-layout) {
			grid-template-columns: 1fr;
		}

		.prose :global(.scene-col) {
			position: static;
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
	   destroy Python indentation, so the block keeps its own `overflow-x`. */
	.prose :global(pre) {
		margin: 0 0 10px;
		padding: 12px;
		overflow-x: auto;
		border: 1px solid var(--color-ink);
		background: transparent;
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
		font-size: 0.875rem;
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
		color: var(--color-ink) !important;
	}

	.prose :global(pre code span.token.punctuation) {
		color: var(--color-muted) !important;
	}

	.prose :global(pre:not(.snippet) code) {
		color: var(--color-ink) !important;
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

	.foot {
		max-width: 78ch;
		margin: 0 auto;
		padding-top: 20px;
		border-top: 1px solid var(--color-ink);
	}

	.signoff {
		display: flex;
		align-items: center;
		justify-content: space-between;
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
		display: flex;
		justify-content: space-between;
		gap: 3.2rem;
		margin-top: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--color-muted);
	}

	.pager a {
		display: grid;
		gap: 0.8rem;
		max-width: 24ch;
		color: inherit;
		text-decoration: none;
	}

	.pager .right {
		justify-items: end;
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

		.signoff {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.6rem;
		}

		.pager {
			flex-direction: column;
			gap: 2.8rem;
		}

		.pager .right {
			justify-items: start;
			text-align: left;
		}
	}
</style>
