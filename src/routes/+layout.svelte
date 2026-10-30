<script lang="ts">
	import { flushSync, onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AsciiSnake from '#lib/components/AsciiSnake.svelte';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { readEase, readMs } from '#lib/motion/timing.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	type Theme = 'light' | 'dark';
	const STORAGE_KEY = 'studio-py:theme';
	const DARK_QUERY = '(prefers-color-scheme: dark)';

	let theme = $state<Theme>('light');

	function storedTheme(): Theme | null {
		try {
			const value = localStorage.getItem(STORAGE_KEY);
			return value === 'dark' || value === 'light' ? value : null;
		} catch {
			return null;
		}
	}

	function applyTheme(next: Theme, persist: boolean): void {
		theme = next;
		document.documentElement.dataset.theme = next;
		syncThemeColor(next);
		if (!persist) return;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* Storage can be blocked; the choice still applies for this visit. */
		}
	}

	onMount(() => {
		const media = window.matchMedia(DARK_QUERY);
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
		syncThemeColor(theme);

		// System-first: the OS decides until the visitor makes a choice, and keeps
		// deciding if they change it mid-session.
		const followSystem = (event: MediaQueryListEvent | MediaQueryList): void => {
			if (storedTheme()) return;
			applyTheme(event.matches ? 'dark' : 'light', false);
		};
		media.addEventListener('change', followSystem);
		return () => media.removeEventListener('change', followSystem);
	});

	function syncThemeColor(next: Theme): void {
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', next === 'dark' ? '#000000' : '#f1f1f1');
	}

	/** The portal reads the motion tokens from app.css, so the site has one clock. */
	function portalTiming() {
		const style = getComputedStyle(document.documentElement);
		const ms = (token: string, fallback: number) => readMs(style, token, fallback);
		const curve = (token: string, fallback: string) => readEase(style, token, fallback);

		return {
			open: ms('--duration-3', 320),
			/** Fully covered and still: the route swaps only after this beat. */
			hold: ms('--duration-1', 120),
			easeSnap: curve('--ease-snap', 'cubic-bezier(0.85, 0, 0.15, 1)'),
			easeStandard: curve('--ease-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)')
		};
	}

	let portalRoot = $state<HTMLDivElement | null>(null);
	let shutterEl = $state<HTMLDivElement | null>(null);
	let leavesEl = $state<HTMLDivElement | null>(null);
	let topLeaf = $state<HTMLDivElement | null>(null);
	let bottomLeaf = $state<HTMLDivElement | null>(null);
	let topCopy = $state<HTMLDivElement | null>(null);
	let bottomCopy = $state<HTMLDivElement | null>(null);
	let portalStep: 'idle' | 'opening' | 'closing' = 'idle';
	let portalPlate = $state('Studio Py');
	let portalWeek = $state('');
	let portalTitle = $state('Index');

	const pad = (value: number): string => String(value).padStart(2, '0');

	/** The shutter is a printed plate, not a clone: it states what is behind it. */
	function gather(card: HTMLElement): void {
		const raw = card.dataset.week;
		const week = raw === undefined ? Number.NaN : Number(raw);
		portalPlate = Number.isFinite(week) ? `Plate ${pad(week + 2)}` : 'Studio Py';
		portalWeek = Number.isFinite(week) ? `W${pad(week)}` : '';
		portalTitle = card.querySelector('h2')?.textContent?.trim() ?? 'Index';
	}

	/** Holds the route until the shutter has actually closed, so the plate opens over the
	 *  card the visitor clicked instead of being starved by the next route's render. */
	function recallCard(event: MouseEvent): void {
		const target = event.target instanceof Element ? event.target.closest('[data-portal]') : null;
		if (!(target instanceof HTMLAnchorElement)) return;
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const href = target.getAttribute('href');
		if (!href || !href.startsWith('/')) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (portalStep !== 'idle') {
			event.preventDefault();
			return;
		}
		event.preventDefault();
		void travel(target, href);
	}

	async function travel(card: HTMLAnchorElement, href: string): Promise<void> {
		await openPortal(card);
		await goto(href);
	}

	function resetPortal(): void {
		const root = portalRoot;
		const shutter = shutterEl;
		root?.getAnimations().forEach((animation) => animation.cancel());
		shutter?.getAnimations().forEach((animation) => animation.cancel());
		leavesEl?.getAnimations().forEach((animation) => animation.cancel());
		topLeaf?.getAnimations().forEach((animation) => animation.cancel());
		bottomLeaf?.getAnimations().forEach((animation) => animation.cancel());
		topCopy?.getAnimations().forEach((animation) => animation.cancel());
		bottomCopy?.getAnimations().forEach((animation) => animation.cancel());
		delete document.documentElement.dataset.portalOpen;
		if (root) root.style.display = '';
		if (shutter) {
			shutter.style.display = '';
			shutter.style.transform = '';
		}
		if (leavesEl) leavesEl.style.display = '';
		for (const leaf of [topLeaf, bottomLeaf]) {
			if (leaf) leaf.style.transform = '';
		}
		for (const copy of [topCopy, bottomCopy]) {
			if (copy) copy.style.opacity = '';
		}
		portalStep = 'idle';
	}

	/** Floods an ink plate from the card rect. The plate is a solid layer scaled from
	 *  the card, so it composites instead of repainting; the type is revealed only
	 *  after the plate is full, when there is nothing left to distort. */
	function openPortal(card: HTMLElement): Promise<void> | null {
		const root = portalRoot;
		const shutter = shutterEl;
		if (!root || !shutter) return null;

		const timing = portalTiming();
		const rect = card.getBoundingClientRect();
		if (rect.width < 8 || rect.height < 8) return null;

		gather(card);
		flushSync();

		const sx = rect.width / window.innerWidth;
		const sy = rect.height / window.innerHeight;
		const start = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;

		shutter.style.transform = start;
		// Set the display imperatively: Svelte strips CSS it cannot see applied,
		// so a class added only at runtime would never paint.
		// The plate covers the head anyway, so the head stands down for the portal's duration.
		document.documentElement.dataset.portalOpen = 'on';
		root.style.display = 'block';
		portalStep = 'opening';

		// One beat of stillness, then full bleed on the snap curve.
		const cover = shutter.animate(
			[
				{ transform: start, offset: 0 },
				{ transform: start, offset: Math.min(0.5, 40 / timing.open) },
				{ transform: 'translate(0px, 0px) scale(1, 1)' }
			],
			{ duration: timing.open, easing: timing.easeSnap, fill: 'forwards' }
		);

		// If the navigation is cancelled the shutter must not stay up.
		window.setTimeout(() => closePortal(), timing.open + timing.hold + 1800);

		return cover.finished.then(
			() => {
				// Both plates are solid ink at this instant: swap them in the same task
				// so the eye never sees a seam, then let the type arrive on the plate.
				shutter.style.display = 'none';
				if (leavesEl) leavesEl.style.display = 'block';
				for (const copy of [topCopy, bottomCopy]) {
					copy?.animate([{ opacity: 0 }, { opacity: 1 }], {
						duration: timing.hold,
						easing: timing.easeStandard,
						fill: 'forwards'
					});
				}
				return new Promise<void>((resolve) => window.setTimeout(resolve, timing.hold));
			},
			() => undefined
		);
	}

	/** Two leaves part from the centre seam, so the next route is revealed mechanically. */
	function closePortal(): void {
		if (portalStep !== 'opening') return;
		portalStep = 'closing';
		const timing = portalTiming();
		[topLeaf, bottomLeaf].forEach((leaf, index) => {
			leaf?.animate(
				[
					{ transform: 'translateY(0)' },
					{ transform: `translateY(${index === 0 ? -100 : 100}%)` }
				],
				{ duration: timing.open, easing: timing.easeSnap, fill: 'forwards' }
			);
		});
		window.setTimeout(resetPortal, timing.open + 60);
	}

	onMount(() => {
		document.addEventListener('click', recallCard, true);
		return () => document.removeEventListener('click', recallCard, true);
	});

	// First paint must not fade. A composited opacity animation holds the hero's
	// text out of the first contentful paint — about a second under 4x CPU throttle,
	// which is the lesson route's entire LCP budget. Route changes still fade.
	let routed = $state(false);

	beforeNavigate((navigation) => {
		if (navigation.from) routed = true;
	});

	afterNavigate(() => {
		closePortal();
	});

	let progressBar = $state<HTMLDivElement | null>(null);

	function updateProgress(): void {
		if (!progressBar) return;
		const scrollable = document.documentElement.scrollHeight - window.innerHeight;
		const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
		progressBar.style.transform = `scaleX(${ratio})`;
	}

	onMount(() => {
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress);
		updateProgress();
		return () => {
			window.removeEventListener('scroll', updateProgress);
			window.removeEventListener('resize', updateProgress);
		};
	});

	afterNavigate(updateProgress);

	type ViewTransitionDocument = Document & {
		startViewTransition?: (callback: () => Promise<void> | void) => { finished: Promise<void> };
	};

	// Route changes here are client-side, so the `@view-transition` rule in the head — a
	// cross-document rule — never fires on its own. Handing the navigation to
	// startViewTransition is what makes one CSS definition cover both kinds of move.
	onNavigate((navigation) => {
		const doc = document as ViewTransitionDocument;
		if (typeof doc.startViewTransition !== 'function') return;
		// The ink portal already owns this navigation: it covers the viewport before `goto`
		// and parts over the new page after it. A view transition paints its snapshots above
		// that, so the two would double-expose the same 220ms. The portal wins because it is
		// the longer, page-specific move; the transition takes every other route change.
		if (document.documentElement.dataset.portalOpen) return;
		return new Promise<void>((resolve) => {
			doc.startViewTransition?.(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	/** Three quick presses on the wordmark open the hidden cabinet; a single press still goes home. */
	const SNAKE_CLICKS = 3;
	const SNAKE_WINDOW_MS = 600;
	let snakeOpen = $state(false);
	let wordmarkClicks = 0;
	let wordmarkTimer: ReturnType<typeof setTimeout> | undefined;

	function pressWordmark(event: MouseEvent): void {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
		event.preventDefault();
		clearTimeout(wordmarkTimer);
		wordmarkClicks += 1;
		if (wordmarkClicks >= SNAKE_CLICKS) {
			wordmarkClicks = 0;
			snakeOpen = true;
			return;
		}
		wordmarkTimer = setTimeout(() => {
			wordmarkClicks = 0;
			void goto('/');
		}, SNAKE_WINDOW_MS);
	}

	$effect(() => {
		if (snakeOpen) document.documentElement.dataset.snake = 'open';
		else delete document.documentElement.dataset.snake;
	});

	function toggleTheme(): void {
		applyTheme(theme === 'dark' ? 'light' : 'dark', true);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f1f1f1" />
	<!-- Cross-document moves (a reload, a shared link) animate with the same CSS the
	     client-side moves below are wrapped in. -->
	<style>
		@view-transition {
			navigation: auto;
		}
	</style>
</svelte:head>

<header class="site-head">
	<a class="wordmark" href="/" onclick={pressWordmark}>Studio Py</a>
	{#if page.url.pathname.startsWith('/lesson/')}
		<a class="back" href="/dashboard">← Index</a>
	{:else if page.url.pathname === '/'}
		<a class="back" href="/dashboard">-- INDEX</a>
	{/if}
	<button
		class="mode"
		type="button"
		onclick={toggleTheme}
		aria-pressed={theme === 'dark'}
	>
		<span class="box" aria-hidden="true"></span>
		Dark
	</button>
</header>

<!-- Sibling of the header and `.page`, so the page fade never touches it. -->
<div class="progress" aria-hidden="true"><div class="progress-fill" bind:this={progressBar}></div></div>

{#key page.url.pathname}
	<div class="page" class:routed inert={snakeOpen} style="view-transition-name: page-transition;">
		{@render children()}
	</div>
{/key}

{#if snakeOpen}
	<AsciiSnake onclose={() => (snakeOpen = false)} />
{/if}

<!-- Portal: an ink plate floods from the clicked card, holds, then parts at its
     centre seam. The plate is page-sized from the start, so nothing reflows. -->
<div class="portal" bind:this={portalRoot} aria-hidden="true">
	<div class="shutter" bind:this={shutterEl}></div>
	<div class="leaves" bind:this={leavesEl}>
		<div class="leaf top" bind:this={topLeaf}>
			<div class="copy top-copy" bind:this={topCopy}>
				<span class="shutter-mark tl"></span>
				<span class="shutter-mark tr"></span>
				<span class="shutter-meta">{portalPlate}</span>
				<span class="shutter-meta">Opening</span>
			</div>
		</div>
		<div class="leaf bottom" bind:this={bottomLeaf}>
			<div class="copy bottom-copy" bind:this={bottomCopy}>
				<span class="shutter-mark bl"></span>
				<span class="shutter-mark br"></span>
				<h2 class="shutter-title">{portalTitle}</h2>
				<span class="shutter-week">{portalWeek}</span>
			</div>
		</div>
	</div>
</div>

<style>
	:global(html[data-portal-open]) .site-head,
	:global(html[data-portal-open]) .progress {
		visibility: hidden;
	}

	/* A structural beam of the grid: solid paper, one ink rule, above everything but the
	   portal. Content slides under it; nothing shows through. */
	:global(:root) {
		--head-h: 64px;
	}

	/* The cabinet pauses the page: scroll locks, every animation holds, nothing is clickable. */
	:global(html[data-snake]) {
		overflow: hidden;
	}

	:global(html[data-snake]) .page :global(*),
	:global(html[data-snake]) .page :global(*::before),
	:global(html[data-snake]) .page :global(*::after) {
		animation-play-state: paused !important;
	}

	:global(html[data-snake]) .site-head {
		pointer-events: none;
	}

	.site-head {
		position: fixed;
		inset: 0 0 auto;
		z-index: 100;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: clamp(12px, 2vw, 32px);
		height: var(--head-h);
		padding: 0 clamp(16px, 4vw, 64px);
		border-bottom: 1px solid var(--color-ink);
		background: var(--color-paper);
		color: var(--color-ink);
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: clamp(17px, 2vw, 28px);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.back {
		font-family: var(--font-mono);
		font-size: clamp(11px, 1.1vw, 13px);
		line-height: 1;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.back:hover,
	.back:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.4em;
	}

	.mode {
		/* A 24px hit area that does not move the type: the padding is cancelled
		   by an equal negative margin, so the label sits where it always sat. */
		display: inline-flex;
		align-items: center;
		min-height: 24px;
		margin: -6px -6px -6px auto;
		padding: 0 6px;
		border: 0;
		background: none;
		font-family: var(--font-mono);
		font-size: clamp(11px, 1.1vw, 13px);
		line-height: 1;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		cursor: pointer;
		touch-action: manipulation;
	}

	/* The box is the state: `[ ]` dark off, `[x]` dark on. It is keyed off the theme the
	   inline script has already written, so the header is correct at first paint. */
	.box {
		margin-right: 0.6em;
		letter-spacing: 0;
	}

	.box::before {
		content: '[ ]';
	}

	:global(html[data-theme='dark']) .box::before {
		content: '[x]';
	}

	.mode:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 4px;
	}

	.progress {
		position: fixed;
		inset: calc(var(--head-h) - 1px) 0 auto;
		z-index: 101;
		height: 3px;
		pointer-events: none;
	}

	.progress-fill {
		width: 100%;
		height: 100%;
		background: var(--color-snake);
		transform: scaleX(0);
		transform-origin: left;
		/* Scroll-follow, not a state change: linear and short so it tracks the thumb. */
		transition: transform 50ms linear;
	}


	.page.routed {
		animation: page-in var(--duration-2) var(--ease-standard) both;
	}

	.portal {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: none;
		pointer-events: none;
		overflow: hidden;
	}

	.shutter {
		position: absolute;
		inset: 0;
		background: var(--color-ink);
		transform-origin: 0 0;
		will-change: transform;
	}

	.leaves {
		position: absolute;
		inset: 0;
		display: none;
		color: var(--color-paper);
	}

	.leaf {
		position: absolute;
		left: 0;
		width: 100%;
		height: 50%;
		overflow: hidden;
		background: var(--color-ink);
		will-change: transform;
	}

	.leaf.top {
		top: 0;
		border-bottom: 1px solid color-mix(in srgb, var(--color-paper) 38%, transparent);
	}

	.leaf.bottom {
		bottom: 0;
	}

	.copy {
		position: absolute;
		inset: 0;
		opacity: 0;
	}

	.top-copy {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		padding: 0 clamp(18px, 4vw, 64px) clamp(14px, 2vh, 22px);
	}

	.bottom-copy {
		padding: clamp(14px, 2vh, 22px) clamp(18px, 4vw, 64px) 0;
	}

	.shutter-meta,
	.shutter-week {
		font-family: var(--font-mono);
		font-size: clamp(10px, 1vw, 12px);
		line-height: 1;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.72;
	}

	.shutter-title {
		margin: 0;
		max-width: 18ch;
		font-family: var(--font-display);
		font-size: clamp(30px, 5.2vw, 76px);
		font-weight: 400;
		line-height: 0.94;
		letter-spacing: -0.035em;
	}

	.shutter-week {
		position: absolute;
		top: clamp(14px, 2vh, 22px);
		right: clamp(18px, 4vw, 64px);
	}

	.shutter-mark {
		position: absolute;
		width: 18px;
		height: 18px;
		opacity: 0.5;
		background:
			linear-gradient(var(--color-paper), var(--color-paper)) center / 100% 1px no-repeat,
			linear-gradient(var(--color-paper), var(--color-paper)) center / 1px 100% no-repeat;
	}

	.tl {
		top: 22px;
		left: 22px;
	}

	.tr {
		top: 22px;
		right: 22px;
	}

	.bl {
		bottom: 22px;
		left: 22px;
	}

	.br {
		bottom: 22px;
		right: 22px;
	}

	/* The header is a sibling of `.page`, so the page fade never dims the beam. */
	@keyframes page-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page,
		.page.routed {
			animation: none;
			opacity: 1;
		}

		.portal {
			display: none;
		}
	}

	@media (max-width: 520px) {
		:global(:root) {
			--head-h: 56px;
		}

		.site-head {
			padding: 0 16px;
		}
	}
</style>
