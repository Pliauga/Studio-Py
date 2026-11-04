<script lang="ts">
	import { flushSync, onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AsciiSnake from '#lib/components/AsciiSnake.svelte';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { readEase, readMs } from '#lib/motion/timing.ts';
	import { MODULES } from '#lib/content/lessons.ts';
	import { openWindows } from '#lib/stores/os.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	type Theme = 'light' | 'dark';
	const STORAGE_KEY = 'studio-py:theme';

	let theme = $state<Theme>('light');

	function applyTheme(next: Theme): void {
		theme = next;
		document.documentElement.dataset.theme = next;
		syncThemeColor(next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* Storage can be blocked; the choice still applies for this visit. */
		}
	}

	// `data-theme` is the single source of truth: app.html writes it before first
	// paint, so mount only has to read it back for the toggle's label.
	onMount(() => {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
		syncThemeColor(theme);
	});

	function syncThemeColor(next: Theme): void {
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', next === 'dark' ? '#07284f' : '#175497');
	}

	// The menu bar clock is the machine's, not the page's: client-only, because the
	// server cannot know the reader's timezone and a guessed value would flash wrong.
	let clock = $state('');
	let moment = $state<Date | null>(null);

	onMount(() => {
		const tick = () => {
			const now = new Date();
			moment = now;
			clock = now.toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
		};
		tick();
		const id = window.setInterval(tick, 1000);
		return () => window.clearInterval(id);
	});

	const weekdayAndDate = $derived(
		moment
			? moment.toLocaleDateString('en-GB', {
					weekday: 'short',
					day: 'numeric',
					month: 'short'
				})
			: ''
	);

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
	let portalStart = $state<DOMRect | null>(null);

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
		portalStart = target.getBoundingClientRect();
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
	}

	function openPortal(card: HTMLElement): Promise<void> {
		const root = portalRoot;
		const shutter = shutterEl;
		const rect = portalStart ?? card.getBoundingClientRect();
		if (!root || !shutter) return Promise.resolve();

		const timing = portalTiming();
		gather(card);
		flushSync();

		const sx = rect.width / window.innerWidth;
		const sy = rect.height / window.innerHeight;
		const start = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;

		shutter.style.transform = start;
		// Set the display imperatively: Svelte strips CSS it cannot see applied,
		// so a class added only at runtime would never paint.
		// The plate covers the chrome anyway, so the chrome stands down for the portal.
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

	/**
	 * The route fade exists for browsers that cannot cross-fade a navigation themselves.
	 * Where `startViewTransition` is available the transition does that job properly, and
	 * the two together are a bug: the browser snapshots the incoming page while it is still
	 * mid-fade, so the first frame of the new view is `opacity: 0` — a flash to whatever is
	 * underneath. The flag is therefore raised only for the fallback path.
	 */
	function fadeRouteChanges(): boolean {
		const doc = document as ViewTransitionDocument;
		return (
			typeof doc.startViewTransition !== 'function' ||
			document.documentElement.dataset.portalOpen !== undefined
		);
	}

	beforeNavigate((navigation) => {
		if (navigation.from) routed = fadeRouteChanges();
	});

	afterNavigate(() => {
		closePortal();
	});

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
		// The transition cross-fades the old page into the new one itself. The route's own
		// `page-in` fade would run underneath it and the browser would snapshot the new page
		// mid-fade — at `opacity: 0` on the first frame, which is the white flash. Stand the
		// route fade down whenever a transition is going to paint; `beforeNavigate` raises
		// this flag again for the next move.
		routed = false;
		return new Promise<void>((resolve) => {
			doc.startViewTransition?.(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	/** Three quick presses on the menu-bar mark open the hidden cabinet; a single press
	 *  still goes home. */
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
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	}

	/** The lesson the dock believes is open, if any: the dock is the window manager. */
	const lessonOpen = $derived(
		openWindows.currentLesson
			? MODULES.find((entry) => entry.slug === openWindows.currentLesson)
			: undefined
	);

	const onDashboard = $derived(page.url.pathname.startsWith('/dashboard'));
	const onLanding = $derived(page.url.pathname === '/');
	const onLesson = $derived(page.url.pathname.startsWith('/lesson/'));

	/* Dock magnification: icons swell with the pointer's proximity, on a squared
	   falloff, and lift as they grow. Only a mouse drives it, and never under reduced
	   motion; CSS transitions on `.dock-icon` smooth the steps between pointer events. */
	const DOCK_MAX_SCALE = 1.5;
	const DOCK_SPREAD = 120;
	const DOCK_LIFT = -12;

	let dockEl = $state<HTMLElement | null>(null);
	$effect(() => {
		const dock = dockEl;
		if (!dock) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		const icons = () => dock.querySelectorAll<HTMLElement>('.dock-icon');
		const settle = () => {
			for (const icon of icons()) {
				icon.style.removeProperty('--scale');
				icon.style.removeProperty('--ty');
			}
		};
		const magnify = (event: PointerEvent) => {
			if (reduced.matches || event.pointerType !== 'mouse') {
				settle();
				return;
			}
			for (const icon of icons()) {
				const box = icon.getBoundingClientRect();
				const distance = Math.abs(event.clientX - (box.left + box.width / 2));
				const t = Math.max(0, 1 - distance / DOCK_SPREAD);
				const swell = t * t;
				icon.style.setProperty('--scale', String(1 + (DOCK_MAX_SCALE - 1) * swell));
				icon.style.setProperty('--ty', `${DOCK_LIFT * swell}px`);
			}
		};
		dock.addEventListener('pointermove', magnify);
		dock.addEventListener('pointerleave', settle);
		return () => {
			dock.removeEventListener('pointermove', magnify);
			dock.removeEventListener('pointerleave', settle);
		};
	});

	/* The dock bounces once when a lesson window opens: the class is set, then
	   cleared after the 0.4s keyframe so a later open can replay it. */
	let lessonBouncing = $state(false);
	let bounceTimer: ReturnType<typeof setTimeout> | undefined;
	let previousLesson: string | undefined;
	$effect(() => {
		const current = openWindows.currentLesson;
		if (current && current !== previousLesson) {
			lessonBouncing = true;
			clearTimeout(bounceTimer);
			bounceTimer = setTimeout(() => (lessonBouncing = false), 400);
		}
		previousLesson = current ?? undefined;
	});
	$effect(() => () => clearTimeout(bounceTimer));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#175497" />
	<!-- Cross-document moves (a reload, a shared link) animate with the same CSS the
	     client-side moves below are wrapped in. -->
	<style>
		@view-transition {
			navigation: auto;
		}
	</style>
</svelte:head>

<!--
	THE DESKTOP

	One continuous Aqua work surface. The grid and the blue swirl are the desktop; the
	menu bar is pinned to its top edge and the dock to its bottom edge. Both are
	siblings of the route content, so neither remounts when a route changes — a
	window opening over the desktop never takes the desktop with it.
-->
<div class="mac-desktop">

	<header class="mac-menubar">
		<a class="menubar-mark" href="/" onclick={pressWordmark} aria-label="Studio Py — go to the README">
			🐍
		</a>
		<span class="menubar-app">Studio Py</span>

		<nav class="menubar-menus" aria-label="Application menus">
			<a class="menubar-item" href="/">File</a>
			<a class="menubar-item" href="/dashboard">Edit</a>
			<a class="menubar-item" href="/dashboard">Incident</a>
			<span class="menubar-item is-static" aria-hidden="true">View</span>
			<span class="menubar-item is-static" aria-hidden="true">Help</span>
		</nav>

		<div class="menubar-status">
			<button
				class="menubar-item theme-toggle"
				type="button"
				onclick={toggleTheme}
				aria-pressed={theme === 'dark'}
				aria-label="Toggle dark mode"
			>
				<span class="toggle-dot" aria-hidden="true"></span>
				{theme === 'dark' ? 'Dark' : 'Light'}
			</button>
			<span class="menubar-clock">
				{#if weekdayAndDate}<span class="menubar-date">{weekdayAndDate}</span>{/if}
				<span class="menubar-time">{clock || '--:--:--'}</span>
			</span>
		</div>
	</header>

	{#key page.url.pathname}
		<div
			class="page desktop-page"
			class:routed
			inert={snakeOpen}
			style="view-transition-name: page-transition;"
		>
			{@render children()}
		</div>
	{/key}

	<!-- The dock: the desktop's own window manager. The folder is the index, the
	     terminal is the lesson the reader has open. It floats over the work surface
	     and never unmounts, so a closing window leaves the dock behind. -->
	<nav class="mac-dock aqua-dock-shelf" aria-label="Dock" bind:this={dockEl}>
		<a
			class="dock-icon"
			class:running={onDashboard}
			href="/dashboard"
			aria-label="Dashboard — the module index"
			data-tip="Finder"
			title="Dashboard"
		>
			<img
				class="dock-glyph"
				src="/icons/icons_v2/ui/aqua_ui_01_finder.svg"
				alt=""
				width="48"
				height="48"
				draggable="false"
			/>
			<span class="dock-dot" aria-hidden="true"></span>
		</a>

		<a
			class="dock-icon"
			class:running={onLanding}
			href="/"
			aria-label="README — about Studio Py"
			data-tip="Studio Py"
			title="README.md"
		>
			<img
				class="dock-glyph"
				src="/icons/icons_v2/ui/aqua_ui_09_pydoc.svg"
				alt=""
				width="48"
				height="48"
				draggable="false"
			/>
			<span class="dock-dot" aria-hidden="true"></span>
		</a>

		{#if lessonOpen}
			<span class="dock-divider" aria-hidden="true"></span>
			<a
				class="dock-icon"
				class:running={onLesson}
				class:minimized={openWindows.isMinimized}
				class:bounce={lessonBouncing}
				href={`/lesson/${lessonOpen.slug}`}
				aria-label={`Lesson window — ${lessonOpen.title}`}
				data-tip="Terminal"
				title={lessonOpen.title}
			>
				<img
					class="dock-glyph"
					src="/icons/icons_v2/ui/aqua_ui_04_terminal.svg"
					alt=""
					width="48"
					height="48"
					draggable="false"
				/>
				<span class="dock-dot" aria-hidden="true"></span>
			</a>
		{/if}

		<span class="dock-divider" aria-hidden="true"></span>
		<button
			class="dock-icon"
			class:running={theme === 'dark'}
			type="button"
			onclick={toggleTheme}
			aria-pressed={theme === 'dark'}
			aria-label="Settings — toggle dark mode"
			data-tip="Settings"
			title={theme === 'dark' ? 'Settings — dark mode on' : 'Settings — dark mode off'}
		>
			<img
				class="dock-glyph"
				src="/icons/icons_v2/ui/aqua_ui_05_settings.svg"
				alt=""
				width="48"
				height="48"
				draggable="false"
			/>
			<span class="dock-dot" aria-hidden="true"></span>
		</button>
	</nav>
</div>

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
	:global(html[data-portal-open]) .mac-menubar,
	:global(html[data-portal-open]) .mac-dock {
		visibility: hidden;
	}

	/* The cabinet pauses the page: every animation holds, nothing is clickable. */
	:global(html[data-snake]) .mac-menubar,
	:global(html[data-snake]) .mac-dock {
		pointer-events: none;
	}

	:global(html[data-snake]) .desktop-page :global(*),
	:global(html[data-snake]) .desktop-page :global(*::before),
	:global(html[data-snake]) .desktop-page :global(*::after) {
		animation-play-state: paused !important;
	}

	/* The desktop itself. It is the viewport: no scroll, no chrome of its own, and
	   every route draws on top of it rather than replacing it. The Tiger swirl is four
	   radial highlights over a diagonal blue ramp; the grid is a `::before` so the
	   wallpaper and the ruling are one surface and neither needs an extra element. */
	.mac-desktop {
		position: relative;
		isolation: isolate;
		display: block;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background:
			radial-gradient(circle at 50% 120%, rgba(26, 175, 255, 0.45) 0%, transparent 60%),
			radial-gradient(circle at 15% 15%, rgba(135, 219, 255, 0.4) 0%, transparent 45%),
			radial-gradient(circle at 85% 30%, rgba(0, 110, 220, 0.5) 0%, transparent 50%),
			linear-gradient(135deg, #093769 0%, #175497 28%, #1f72b7 52%, #13467f 78%, #07284f 100%);
		background-size: cover;
		background-attachment: fixed;
	}

	/* The subtle brutalist grid overlay. */
	.mac-desktop::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 20px 20px;
		pointer-events: none;
	}

	/* ---- the menu bar ---------------------------------------------------------------- */

	.mac-menubar {
		position: absolute;
		inset: 0 0 auto;
		z-index: 200;
		display: flex;
		align-items: center;
		gap: 4px;
		height: var(--mac-menubar-h);
		padding: 0 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.16);
		background: var(--mac-menubar-bg);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		backdrop-filter: blur(20px) saturate(180%);
		font-family: var(--mac-ui);
		font-size: 12px;
		line-height: 1;
		color: var(--mac-aqua-ink);
		user-select: none;
	}

	.menubar-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 100%;
		font-size: 13px;
		line-height: 1;
		text-decoration: none;
	}

	.menubar-app {
		margin-right: 6px;
		font-weight: 600;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}

	.menubar-menus {
		display: flex;
		align-items: center;
		gap: 2px;
		min-width: 0;
	}

	.menubar-item {
		display: inline-flex;
		align-items: center;
		height: 18px;
		padding: 0 8px;
		border: 0;
		border-radius: 4px;
		background: none;
		font: inherit;
		color: inherit;
		text-decoration: none;
		white-space: nowrap;
		cursor: default;
	}

	a.menubar-item,
	button.menubar-item {
		cursor: pointer;
	}

	a.menubar-item:hover,
	a.menubar-item:focus-visible,
	button.menubar-item:hover,
	button.menubar-item:focus-visible {
		background: rgba(0, 0, 0, 0.08);
	}

	.menubar-item.is-static {
		opacity: 0.55;
	}

	.menubar-status {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-left: auto;
		flex: none;
	}

	.theme-toggle {
		gap: 5px;
		font-size: 11.5px;
		letter-spacing: 0.01em;
	}

	.toggle-dot {
		display: block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.45);
		background: #f1f1f1;
	}

	:global(html[data-theme='dark']) .toggle-dot {
		background: #1d1d1f;
	}

	.menubar-clock {
		display: inline-flex;
		align-items: baseline;
		gap: 6px;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.01em;
	}

	.menubar-date {
		opacity: 0.62;
	}

	.menubar-time {
		font-weight: 500;
	}

	/* ---- the route surface ----------------------------------------------------------- */

	/* The route content is a layer on the desktop, not the document: it fills the
	   screen below the menu bar and never grows past it. Each route decides where its
	   own window sits inside this box. */
	.desktop-page {
		position: absolute;
		inset: var(--mac-menubar-h) 0 0;
		z-index: 1;
		overflow: hidden;
	}

	.desktop-page.routed {
		animation: page-in var(--duration-2) var(--ease-standard) both;
	}

	@keyframes page-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ---- the dock -------------------------------------------------------------------- */

	.mac-dock.aqua-dock-shelf {
		position: absolute;
		inset: auto auto 10px 50%;
		z-index: 150;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 12px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.2);
		-webkit-backdrop-filter: blur(30px) saturate(160%);
		backdrop-filter: blur(30px) saturate(160%);
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.35),
			0 10px 30px rgba(0, 0, 0, 0.28);
		transform: translateX(-50%);
	}

	.dock-icon {
		position: relative;
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		padding: 0;
		border: 0;
		border-radius: 12px;
		background: none;
		cursor: pointer;
		text-decoration: none;
		transform: translateY(var(--ty, 0px)) scale(var(--scale, 1));
		transition: transform var(--duration-2) var(--ease-standard);
	}

	.dock-glyph {
		display: block;
		width: 48px;
		height: 48px;
		image-rendering: pixelated;
		-webkit-user-drag: none;
		/* The glyph owns the tile: the plate keeps its own palette, so the tile behind it
		   stays glass and the icon is the only coloured thing. */
		filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
	}

	.dock-icon:focus-visible {
		outline: 2px solid var(--mac-blue);
		outline-offset: 2px;
		transform: translateY(-6px) scale(1.1);
	}

	/* One hop when a lesson window opens. */
	.dock-icon.bounce {
		animation: dock-bounce 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes dock-bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-20px);
		}
	}

	/* Hover label: a recessed well with a pointer, pass-through so it never eats a click. */
	.dock-icon::after {
		content: attr(data-tip);
		position: absolute;
		bottom: calc(100% + 12px);
		left: 50%;
		padding: 3px 8px;
		border: 1px solid #8e9092;
		border-radius: 4px;
		background: var(--aqua-well);
		box-shadow:
			inset 1px 1px 3px rgba(0, 0, 0, 0.28),
			0 1px 0 rgba(255, 255, 255, 0.8);
		color: var(--color-ink, #1a1a1a);
		font-family: var(--font-mono, monospace);
		font-size: 12px;
		line-height: 1.2;
		white-space: nowrap;
		opacity: 0;
		transform: translate(-50%, 4px) scale(calc(1 / var(--scale, 1)));
		transform-origin: 50% 100%;
		pointer-events: none;
		transition:
			opacity var(--duration-2) var(--ease-standard),
			transform var(--duration-2) var(--ease-standard);
	}

	.dock-icon::before {
		content: '';
		position: absolute;
		bottom: calc(100% + 7px);
		left: 50%;
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 5px solid #8e9092;
		opacity: 0;
		transform: translateX(-50%);
		pointer-events: none;
		transition: opacity var(--duration-2) var(--ease-standard);
	}

	@media (hover: hover) {
		.dock-icon:hover::after,
		.dock-icon:focus-visible::after {
			opacity: 1;
			transform: translate(-50%, 0) scale(calc(1 / var(--scale, 1)));
		}

		.dock-icon:hover::before,
		.dock-icon:focus-visible::before {
			opacity: 1;
		}
	}

	/* The running indicator: a window this app owns is on screen. */
	.dock-dot {
		position: absolute;
		bottom: -3px;
		left: 50%;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.55);
		opacity: 0;
		transform: translateX(-50%);
	}

	.dock-icon.running .dock-dot {
		opacity: 1;
	}

	/* A minimised window keeps its dock tile but reads as recessed. */
	.dock-icon.minimized .dock-glyph {
		opacity: 0.5;
		filter: none;
	}

	.dock-icon.minimized .dock-dot {
		background: transparent;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.55);
	}

	.dock-divider {
		width: 1px;
		height: 30px;
		background: rgba(0, 0, 0, 0.18);
	}

	/* ---- the ink portal -------------------------------------------------------------- */

	.portal {
		position: fixed;
		inset: 0;
		z-index: 300;
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

	@media (prefers-reduced-motion: reduce) {
		.desktop-page,
		.desktop-page.routed {
			animation: none;
			opacity: 1;
		}

		.portal {
			display: none;
		}

		.dock-icon {
			transition: none;
		}

		.dock-icon.bounce {
			animation: none;
		}
	}

	@media (max-width: 640px) {
		.menubar-app {
			display: none;
		}

		.menubar-date {
			display: none;
		}

		.mac-menubar {
			padding: 0 8px;
		}

		.mac-dock {
			bottom: 8px;
			gap: 6px;
			padding: 5px 9px;
		}

		.dock-icon {
			width: 40px;
			height: 40px;
		}

		.dock-glyph {
			width: 40px;
			height: 40px;
		}
	}
</style>
