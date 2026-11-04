<script lang="ts">
	import { onMount } from 'svelte';
	import InkStamp from '#lib/components/InkStamp.svelte';
	import SnakeSpine from '#lib/components/SnakeSpine.svelte';
	import { trackWaypoints } from '#lib/motion/trail.ts';
	import { trackWindowFocus } from '#lib/motion/windowFocus.ts';
	import { MODULES } from '#lib/content/lessons.ts';
	import { lessonComponent } from '#lib/content/lessonModules.ts';
	import { sizeTier } from '#lib/content/chapters.ts';
	import { progress, STATUS_LABEL } from '#lib/stores/progress.svelte.ts';
	import { openWindows } from '#lib/stores/os.svelte.ts';
	import { goto } from '$app/navigation';
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

	/** The window's file name: the lesson as an application in the OS façade. macOS
	 *  extensions, not Windows ones — this desktop is Aqua, and `.app` is what a lesson
	 *  bundle would be called here. */
	const filename = $derived(
		`W${pad(module.week)}_${module.title
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, '_')
			.replace(/^_|_$/g, '')}.app`
	);

	let trail = $state<HTMLDivElement | null>(null);
	let article = $state<HTMLElement | null>(null);
	let scroller = $state<HTMLDivElement | null>(null);
	/** Where the snake's head rests along the article: the waypoint the reader is on. */
	let waypoint = $state(0);
	/** The green light's state: the window covers the whole desktop when true. */
	let maximized = $state(false);

	// Opening the window registers it with the desktop, so the taskbar can carry its tab
	// while it is minimised.
	$effect(() => {
		openWindows.currentLesson = module.slug;
		openWindows.isMinimized = false;
	});

	/** The window exit in flight. `open` means the window is on screen. Maximising is a
	    separate flag rather than a fourth state: a maximised window still has to be able to
	    close, and folding it into one union would snap it back to its frame the instant the
	    exit started, so the scale-down would play from the wrong geometry. */
	let windowState = $state<'open' | 'closing' | 'minimizing'>('open');

	let windowEl = $state<HTMLDivElement | null>(null);
	let bumping = $state(false);
	const WINDOW_ID = 'lesson';
	const FOCUS_BUMP_MS = 200;
	const active = $derived(openWindows.activeWindowId === WINDOW_ID);

	$effect(() => {
		if (!windowEl) return;
		let bumpTimer: ReturnType<typeof setTimeout> | undefined;
		const stop = trackWindowFocus(WINDOW_ID, windowEl, () => {
			if (!exitsAnimated()) return;
			bumping = true;
			clearTimeout(bumpTimer);
			bumpTimer = setTimeout(() => (bumping = false), FOCUS_BUMP_MS);
		});
		return () => {
			clearTimeout(bumpTimer);
			stop();
		};
	});

	/** The genie aims at the lesson's Dock tile: the offsets run from the window's foot
	    to the tile's centre, and the stylesheet narrows the window along them. */
	function aimAtDock(): void {
		if (!windowEl) return;
		const frame = windowEl.getBoundingClientRect();
		const tile = document.querySelector<HTMLElement>('.dock-icon[data-tip="Terminal"]');
		const target = tile?.getBoundingClientRect();
		const dx = target ? target.left + target.width / 2 - (frame.left + frame.width / 2) : 0;
		const dy = target ? target.top + target.height / 2 - frame.bottom : window.innerHeight / 2;
		windowEl.style.setProperty('--genie-x', `${dx}px`);
		windowEl.style.setProperty('--genie-y', `${dy}px`);
	}

	/** Reduced motion goes straight to the desktop instead of waiting out a transition. */
	function exitsAnimated(): boolean {
		return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/** Play the exit, then route. Routing first would cut the animation off, which is
	    the whole complaint this fixes: the window must be seen to leave. */
	function leave(kind: 'closing' | 'minimizing', after: () => void, before: () => void): void {
		if (windowState !== 'open') return;
		if (!exitsAnimated()) {
			before();
			after();
			return;
		}
		if (kind === 'minimizing') aimAtDock();
		windowState = kind;
		window.setTimeout(
			() => {
				before();
				after();
			},
			kind === 'closing' ? CLOSE_MS : MINIMIZE_MS
		);
	}

	/** The red light's exit, and the yellow light's drop toward the Dock. Each is stated
	    once and read by the stylesheet as the matching transition duration. */
	const CLOSE_MS = 300;
	const MINIMIZE_MS = 400;

	/** The red light: the window shrinks away, and the desktop forgets it. */
	function closeWindow(): void {
		leave(
			'closing',
			() => void goto('/dashboard'),
			() => {
				openWindows.currentLesson = null;
				openWindows.isMinimized = false;
			}
		);
	}

	/** The yellow light: the window drops toward the Dock but keeps its taskbar tab. */
	function minimizeWindow(): void {
		leave(
			'minimizing',
			() => void goto('/dashboard'),
			() => {
				openWindows.isMinimized = true;
			}
		);
	}

	/** The green light: the window either fills the desktop or returns to its frame. */
	function toggleMaximize(): void {
		if (windowState !== 'open') return;
		maximized = !maximized;
	}

	const traffic = [
		{ tone: 'red', cls: 'aqua-close', mark: '×', label: 'Close window', act: closeWindow },
		{ tone: 'yellow', cls: 'aqua-minimize', mark: '-', label: 'Minimise window', act: minimizeWindow },
		{ tone: 'green', cls: 'aqua-zoom', mark: '+', label: 'Maximise window', act: toggleMaximize }
	] as const;

	/** The toolbar's pane filter. The lesson arrives from the content pipeline as one
	    document — chapters are `split` when they carry a console and `wide` when they do
	    not — so this is a view over that document, not a second layout: `data-pane` on the
	    scroll box decides which wells are shown, and the stylesheet does the rest. */
	const panes = [
		{ id: 'all', label: 'All Panes' },
		{ id: 'narrative', label: 'Narrative' },
		{ id: 'telemetry', label: 'Telemetry' },
		{ id: 'terminal', label: 'Terminal' }
	] as const;

	let activePane = $state<string>('all');

	// Reading the article is what marks a lesson opened; `complete()` is the
	// only explicit act, so the dashboard never overstates progress.
	onMount(() => {
		if (progress.statusOf(module.slug) === 'not-started') progress.set(module.slug, 'in-progress');

		const stopTrail =
			trail && article
				? trackWaypoints(trail, article, scroller, (percent) => (waypoint = percent))
				: undefined;
		return () => stopTrail?.();
	});

	function toggleComplete(): void {
		progress.set(module.slug, status === 'completed' ? 'not-started' : 'completed');
	}
</script>

<svelte:head>
	<title>{module.title} — Studio Py</title>
	<meta name="description" content={module.summary} />
</svelte:head>

<div class="desktop" class:maximized>
	<div
		class="os-window"
		class:maximized
		class:inactive={!active}
		class:bump={bumping}
		class:closing={windowState === 'closing'}
		class:minimizing={windowState === 'minimizing'}
		bind:this={windowEl}
	>
		<div class="crt-scan on" aria-hidden="true"></div>
		<div class="title-bar aqua-pinstripes">
			<span class="aqua-traffic-group traffic">
				{#each traffic as light (light.tone)}
					<button
						type="button"
						class="aqua-traffic-light {light.cls}"
						aria-label={light.label}
						aria-pressed={light.tone === 'green' ? maximized : undefined}
						title={light.label}
						onclick={light.act}
					>
						<span aria-hidden="true">{light.mark}</span>
					</button>
				{/each}
			</span>
			<span class="window-name">{filename}</span>
			<span class="incident-badge">ACTIVE INCIDENT: PLT-{pad(module.week + 2)}</span>
		</div>

		<div class="window-toolbar aqua-pinstripes">
			<div class="aqua-segmented-group panes" role="group" aria-label="Filter panes">
				{#each panes as pane (pane.label)}
					<button
						type="button"
						class="aqua-segmented-btn"
						class:active={activePane === pane.id}
						aria-pressed={activePane === pane.id}
						onclick={() => (activePane = pane.id)}
					>
						{pane.label}
					</button>
				{/each}
			</div>
		</div>
		<div class="window-content" data-pane={activePane} data-mac-scroll bind:this={scroller}>
			<main class="reader">
				<div class="sheet">
		<header class="hero">
			<div class="hero-inner" data-size={sizeTier(module.title.length)}>
				<p class="stamp">
					<span class="plate">Plate {pad(module.week + 2)}</span>
					<span class="sep">—</span>
					Week {pad(module.week)} · {module.estimatedMinutes} min · {STATUS_LABEL[status]}
				</p>
				<h1 id={headingId} aria-label={module.title} data-text={module.title}>{module.title}</h1>
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
				<span class="signoff-label">Module sign-off // Plate {pad(module.week + 2)}</span>
				<div class="signoff-act">
					<button class="complete" class:on={status === 'completed'} onclick={toggleComplete}>
						{status === 'completed' ? '[ > SIGN_OFF_RECORDED ]' : '[ > INITIATE_SIGN_OFF ]'}
					</button>
					<span class="stamp">{STATUS_LABEL[status]}</span>
				</div>
			</div>

			<nav class="pager" aria-label="Module navigation">
				{#if previous}
					<a class="cell" href={`/lesson/${previous.slug}`}>
						<span class="dir">[ &lt; RETURN_TO_WAYPOINT_{pad(previous.week)} ]</span>
						<span class="pager-title">{previous.title}</span>
					</a>
				{:else}
					<span class="cell"></span>
				{/if}
				{#if next}
					<a class="cell right" href={`/lesson/${next.slug}`}>
						<span class="dir">[ &gt; ADVANCE_TO_WAYPOINT_{pad(next.week)} ]</span>
						<span class="pager-title">{next.title}</span>
					</a>
				{:else}
					<span class="cell"></span>
				{/if}
			</nav>
		</footer>
	</div>
			</main>
		</div>
	</div>
</div>

<style>
	/* ---- The 8-bit skin ---------------------------------------------------------------
	   The desktop keeps its macOS layout; only the window's interior wears the skin. Soft
	   CRT bloom is gone in favour of hard pixel shadows, Alabaster paper, stepped Aqua gel
	   bars and a black line around everything that used to glow. */

	/* 1. The window's reading palette. The page-wide `data-theme` decides the paper and
	   the ink; this block only declares what the 8-bit skin adds on top — a monospaced
	   reading face and a hard-edged editor well that stays dark in both themes. */
	:global(:root) {
		--color-line-faint: rgba(0, 0, 0, 0.18);
		--code-inline-bg: #dcebff;

		/* The 8-bit skin's own surfaces. The trap card, the editor well and the SYSTEM.LOG
		   gel bars are lit objects that keep their finish in both themes; everything here
		   is a surface the window's paper decides, so it flips with `data-theme`. */
		--skin-card: #f8f7f2;
		--skin-zebra-1: #f4f6f9;
		--skin-zebra-2: #e6eaf0;
		--skin-edge: #000000;
		--skin-shadow: #000000;
		--skin-button-bg: #f1f1f1;
		--skin-button-ink: #000000;
		--skin-accent: #33ff00;

		/* The window is still a terminal, so its reading face stays monospaced even
		   though the paper under it is light. */
		--font-body: 'Share Tech Mono', 'Courier Prime', 'Courier Prime Fallback', ui-monospace, Menlo, monospace;
		--font-mono: 'Share Tech Mono', 'Courier Prime', 'Courier Prime Fallback', ui-monospace, Menlo, monospace;

		/* Keep CodeMirror & static <pre> blocks in high-contrast 8-bit dark mode */
		--editor-surface: #0a0e17;
		--editor-ink: #f1f1f1;
		--syntax-keyword: #ffb000;
		--syntax-builtin: #33ff00;
		--syntax-string: #66c2ff;
		--syntax-function: #f1f1f1;
		--syntax-number: #33ff00;
		--syntax-comment: #6c7a89;
	}

	:global(:root[data-theme='dark']) {
		--color-line-faint: rgba(241, 241, 241, 0.2);
		--code-inline-bg: #1c2432;

		/* Dark keeps the same hard-edged grammar, but the card sits one step above the
		   paper so the black border and the hard shadow still describe a solid object. */
		--skin-card: #232323;
		--skin-zebra-1: #1f1f1f;
		--skin-zebra-2: #262626;
		--skin-edge: #4a4a4a;
		--skin-shadow: #000000;
		--skin-button-bg: #2a2a2a;
		--skin-button-ink: #f1f1f1;
		--skin-accent: #33ff00;
	}

	/* ---- The desktop ------------------------------------------------------------------
	   The lesson is an application floating over the OS desktop. The desktop itself — the
	   yellow, the grid, the menu bar and the dock — belongs to the layout and never
	   unmounts, so this route is only the window that sits on it. */
	.desktop {
		position: absolute;
		inset: 0;
	}

	/* The raster belongs to the window's screen, not the desktop. */
	.crt-scan {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0 2px,
			rgba(0, 0, 0, 0.15) 2px 4px
		);
		background-size: 100% 8px;
		opacity: 0;
		pointer-events: none;
	}

	/* 2. Replaces CRT scanlines with subtle Mac OS Aqua horizontal pinstripes. */
	.crt-scan.on {
		opacity: 0.35;
		animation: none;
		background: repeating-linear-gradient(
			0deg,
			transparent 0 2px,
			rgba(0, 51, 153, 0.04) 2px 4px
		);
	}

	/* The application window: a real macOS frame floating on the desktop. The chrome is
	   Aqua; only the interior wears the 8-bit skin. */
	.os-window {
		position: absolute;
		top: 5vh;
		left: 50%;
		z-index: 3;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 1200px;
		max-width: 92vw;
		height: calc(100% - var(--mac-dock-gutter) - 5vh);
		border-radius: 12px;
		overflow: hidden;
		background: var(--mac-window-bg);
		/* A hairline edge plus a deep soft drop: the window sits above the desktop
		   rather than being drawn onto it. */
		box-shadow: var(--mac-window-shadow);
		--base-x: -50%;
		transform: translateX(var(--base-x));
		/* A window that is maximised or minimised leaves its frame behind a transform,
		   so the move is animated rather than snapped. */
		transition:
			width var(--duration-3) var(--ease-standard),
			height var(--duration-3) var(--ease-standard),
			top var(--duration-3) var(--ease-standard),
			left var(--duration-3) var(--ease-standard),
			border-radius var(--duration-3) var(--ease-standard),
			box-shadow var(--duration-3) var(--ease-standard),
			opacity var(--duration-3) var(--ease-standard),
			transform var(--duration-3) var(--ease-standard);
	}

	/* The title bar: Aqua pinstripes under the traffic lights and the centred file name.
	   The stripe pair comes from `.aqua-pinstripes`, so only the frame is declared here. */
	.title-bar {
		position: relative;
		/* Above the raster: the screen belongs below the chrome. */
		z-index: 4;
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		height: 30px;
		padding: 0 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.22);
		color: var(--mac-aqua-ink);
		font-family: var(--mac-ui);
		user-select: none;
		isolation: isolate;
	}

	/* Focus is a blue wash over the pinstripe, faded rather than swapped: a gradient
	   cannot be transitioned, an opacity can. The inactive bar is the bare grey stripe. */
	.title-bar::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(to bottom, rgba(120, 180, 255, 0.5), rgba(59, 153, 252, 0.22));
		opacity: 1;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	.os-window.inactive .title-bar::before {
		opacity: 0;
	}

	.os-window.inactive .title-bar :global(.aqua-traffic-light) {
		filter: grayscale(1);
	}

	.os-window.inactive .window-name {
		opacity: 0.55;
	}

	.traffic {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}

	/* The lights are buttons, so they drop the form chrome; the disc in the shared Aqua
	   class is the hit area, and its glyph arrives on hover of the group. */
	.traffic :global(.aqua-traffic-light) {
		padding: 0;
		border-width: 1px;
		border-style: solid;
		font-family: var(--mac-ui);
	}

	.traffic :global(.aqua-traffic-light:focus-visible) {
		outline: 2px solid var(--mac-blue);
		outline-offset: 2px;
	}

	/* The incident pill is the window's state, not decoration: it is the same plate number
	   the hero and the footer carry, so the three read as one document. */
	.incident-badge {
		flex: none;
		margin-left: auto;
		padding: 2px 9px;
		border: 1px solid #6b98c4;
		border-radius: 9999px;
		background: linear-gradient(to bottom, #dbe9f6 0%, #a6cbf0 49%, #8ab9e6 51%, #b0d3f7 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
		font-family: var(--font-pixel);
		font-size: 13px;
		line-height: 1.15;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--aqua-badge-ink);
		white-space: nowrap;
	}

	/* The toolbar is the second tier: the Aqua controls sit on the same pinstripe as the
	   title bar, divided by a hairline rather than by a change of surface. */
	.window-toolbar {
		position: relative;
		z-index: 4;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		flex: none;
		min-height: 34px;
		padding: 4px 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.22);
		font-family: var(--mac-ui);
		user-select: none;
	}

	/* Sized here rather than in the shared class: the segmented buttons are 11px type with
	   2px of vertical padding, which is right for a menubar but too small for a toolbar. */
	.panes :global(.aqua-segmented-btn) {
		padding: 3px 12px;
		font-size: 11.5px;
		white-space: nowrap;
	}

	.panes :global(.aqua-segmented-btn:focus-visible) {
		outline: 2px solid var(--mac-blue);
		outline-offset: 1px;
	}

	/* Maximised, the window fills the screen below the menu bar — but not behind the Dock:
	   a maximised macOS window ends at the Dock's top edge, not at the bottom of the glass.
	   `.desktop` already begins at the menubar's foot and is the full remaining height, so
	   `height: 100% - gutter` is the visible frame, and it matches the rest position the
	   window returns to (the same gutter is what places its foot there now). */
	.os-window.maximized {
		top: 0;
		left: 0;
		width: 100vw;
		max-width: 100vw;
		height: calc(100% - var(--mac-dock-gutter));
		border-radius: 0;
		/* A maximised window still sits on the desktop, so it keeps a shallower drop
		   rather than losing its elevation entirely. */
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
		--base-x: 0px;
		transform: none;
	}

	/* Coming to the front: a 2% swell that settles. */
	.os-window.bump {
		animation: focus-bump 200ms ease-out;
	}

	@keyframes focus-bump {
		0%,
		100% {
			transform: translateX(var(--base-x)) scale(1);
		}
		50% {
			transform: translateX(var(--base-x)) scale(1.02);
		}
	}

	/* The red light: a document shrinks in place as it is put away. The duration is
	   restated here rather than inherited, because the exit has to be over before the route
	   swaps — the base transition also animates geometry the exit does not touch. */
	.os-window.closing {
		transform: translateX(-50%) scale(0.85);
		opacity: 0;
		pointer-events: none;
		transition:
			transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 300ms ease-out;
	}

	/* The yellow light: the Genie. The window pinches toward the foot of its frame while
	   it is carried onto the Dock tile (`--genie-x/y`, measured at click time), so it
	   narrows into the Dock rather than merely shrinking. */
	.os-window.minimizing {
		transform-origin: 50% 100%;
		pointer-events: none;
		animation: genie 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes genie {
		0% {
			transform: translateX(var(--base-x)) translate(0, 0) scale(1, 1);
			clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
			opacity: 1;
		}
		55% {
			transform: translateX(var(--base-x)) translate(calc(var(--genie-x) * 0.35), calc(var(--genie-y) * 0.35))
				scale(0.7, 0.8);
			clip-path: polygon(0 0, 100% 0, 62% 100%, 38% 100%);
			opacity: 1;
		}
		100% {
			transform: translateX(var(--base-x)) translate(var(--genie-x), var(--genie-y)) scale(0.08, 0.04);
			clip-path: polygon(0 0, 100% 0, 52% 100%, 48% 100%);
			opacity: 0;
		}
	}

	/* Both exit variants have to compose with the base `translateX(-50%)` that centres
	   the window, so they restate it rather than replacing it. A maximised window has
	   already dropped that offset (`transform: none`), so its exits are the bare moves. */
	.os-window.maximized.closing {
		transform: scale(0.85);
	}


	/* The name is centred in the bar itself. The badge on the right is allowed to be wider
	   than the light cluster on the left, so the offset is measured against the badge. */
	.window-name {
		position: absolute;
		left: 50%;
		max-width: calc(100% - 18rem);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-family: var(--mac-ui);
		font-size: 12.5px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.01em;
		transform: translateX(-50%);
	}

	/* The pane the lesson scrolls inside. `overscroll-behavior` keeps the wheel from
	   chaining out to the desktop once the lesson hits its end. */
	.window-content {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 2rem;
	}

	@media (max-width: 900px) {
		/* Under 900px the window keeps its frame but reclaims the vertical breathing room,
		   so a phone does not spend a fifth of the screen on empty desktop. */
		.os-window {
			height: calc(100% - var(--mac-dock-gutter));
			top: 0;
		}

		.window-content {
			padding: 1.1rem 0.6rem;
		}

		.window-name {
			max-width: calc(100% - 13rem);
			font-size: 11.5px;
		}

		/* The toolbar keeps the pane filter but shrinks it: four pills at full size would
		   scroll instead of fitting a phone's bar. */
		.panes :global(.aqua-segmented-btn) {
			padding: 3px 8px;
			font-size: 10.5px;
		}

		.incident-badge {
			font-size: 11px;
			padding: 2px 7px;
		}
	}

	@media (max-width: 560px) {
		/* Below a phone's width the four pills still overflow a single line, so the toolbar
		   wraps rather than clipping the last one. */
		.window-toolbar {
			flex-wrap: wrap;
			row-gap: 6px;
			padding: 5px 10px;
		}

		.panes :global(.aqua-segmented-btn) {
			padding: 3px 6px;
			font-size: 10px;
		}

		.incident-badge {
			font-size: 10px;
		}
	}

	@media (max-width: 640px) {
		/* On a phone the window is the app: a floating 12px frame around a 359px screen
		   wastes the gutter on nothing. It fills the route surface outright. */
		.os-window {
			top: 0;
			left: 0;
			width: 100vw;
			max-width: 100vw;
			height: 100%;
			border-radius: 0;
			box-shadow: none;
			transform: none;
		}

		/* Centring is a function of spare width, and a phone has none: the badge and the
		   lights together eat more than the bar. The name takes what is left and truncates. */
		.window-name {
			position: static;
			flex: 1 1 auto;
			min-width: 0;
			max-width: none;
			transform: none;
			text-align: left;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.os-window {
			transition: none;
		}

		.os-window.bump,
		.os-window.minimizing {
			animation: none;
		}

		.title-bar::before {
			transition: none;
		}
	}

	/* ---- The machine half, re-skinned ------------------------------------------------
	   Reading text and code stay still and dark on paper; the hard pixel shadows belong to
	   headers and frames. */

	/* 5. Kill blurry CRT bloom; use crisp 8-bit hard pixel shadows. */
	.reader .prose {
		color: var(--color-ink);
		line-height: 1.6;
		text-shadow: none;
	}

	.reader h1,
	.reader .prose :global(h2),
	.reader .prose :global(h3) {
		font-family: var(--font-pixel);
		font-weight: 400;
		letter-spacing: 0;
		color: var(--color-ink);
		text-shadow: 3px 3px 0px #0066ff; /* Hard Aqua blue pixel offset shadow */
	}

	.reader h1 {
		font-size: calc(var(--display) * 1.3);
		line-height: 0.85;
		color: var(--color-ink);
		text-shadow: 4px 4px 0px #33ff00; /* Hero title gets phosphor green hard shadow */
	}

	.reader h1::after {
		display: none; /* Remove blur(12px) duplicate */
	}

	.reader .prose :global(h2) {
		font-size: clamp(40px, 4.6vw, 72px);
		line-height: 0.9;
	}

	.reader .stamp,
	.reader .signoff-label,
	.reader .dir,
	.reader .prose :global(.trap .trap-head) {
		font-family: var(--font-pixel);
		font-size: 1.5rem;
		letter-spacing: 0.1em;
	}

	/* Controls: 8-bit buttons, pressed by inverting to ink on green. */
	.reader .complete {
		border: 2px solid var(--skin-edge);
		background: var(--skin-button-bg);
		font-family: var(--font-pixel);
		font-size: 1.7rem;
		color: var(--skin-button-ink);
		text-shadow: none;
		box-shadow: 4px 4px 0px var(--skin-shadow);
	}

	.reader .complete:hover,
	.reader .complete:focus-visible,
	.reader .complete.on {
		background: var(--skin-accent);
		color: #000000;
		text-shadow: none;
	}

	.reader .complete.on:hover,
	.reader .complete.on:focus-visible {
		background: var(--skin-button-bg);
		color: var(--skin-button-ink);
		text-shadow: none;
	}

	.reader .pager .dir {
		color: var(--color-ink);
		text-shadow: 2px 2px 0px #66c2ff;
	}

	/* The instrument panel: each sub-system is an Alabaster card edged in ink and lifted
	   by a hard shadow. */
	.reader .prose :global(.chapter.split) {
		column-gap: 2rem;
	}

	/* 6. Chapter cards: Alabaster paper in light, one step above the paper in dark. */
	.reader .prose :global(.chapter)::before {
		content: '';
		grid-area: 1 / 1 / 3 / 2;
		align-self: stretch;
		justify-self: stretch;
		z-index: 0;
		background: var(--skin-card);
		outline: none;
		border: 2px solid var(--skin-edge);
		border-radius: 0;
		box-shadow: 4px 4px 0px var(--skin-shadow);
	}

	.reader .prose :global(.chapter .pin),
	.reader .prose :global(.chapter .chapter-body) {
		position: relative;
		z-index: 1;
		padding: 0 20px;
	}

	/* On a phone the chapter well and the window both inset the text, and the compound
	   indent pushed the prose down to 32 characters a line. The well keeps a token inset
	   so the panel still reads; the window supplies the rest. */
	@media (max-width: 900px) {
		.reader .prose :global(.chapter .pin),
		.reader .prose :global(.chapter .chapter-body) {
			padding: 0 10px;
		}
	}

	.reader .prose :global(.chapter .chapter-body) {
		align-self: stretch;
		margin-bottom: 0;
		padding-bottom: 20px;
	}

	.reader .prose :global(.chapter .pin-inner) {
		margin: 0 0 12px;
	}

	.reader .prose :global(.chapter .console-slot) {
		box-sizing: border-box;
		margin-top: 0;
		padding: 0 20px 20px;
		overflow-y: auto;
		background: repeating-linear-gradient(
			0deg,
			var(--skin-zebra-1) 0px,
			var(--skin-zebra-1) 2px,
			var(--skin-zebra-2) 2px,
			var(--skin-zebra-2) 4px
		);
		outline: none;
		border: 2px solid var(--skin-edge);
		border-radius: 0;
		box-shadow: 4px 4px 0px var(--skin-shadow);
	}

	/* Stepped 8-bit Aqua blue gel header bars for SYSTEM.LOG. The content literal, the
	   margins and the type are the panel's own; only the finish is new. */
	.reader .prose :global(.chapter .pin)::before,
	.reader .prose :global(.chapter .console-slot)::before {
		content: '> SYSTEM.LOG: NARRATIVE';
		display: block;
		margin: 0 -20px 20px;
		padding: 0.35rem 20px;
		font-family: var(--font-pixel);
		font-size: 1.25rem;
		line-height: 1.2;
		letter-spacing: 0.1em;

		border-radius: 0;
		border-bottom: 2px solid #000000;
		/* The Aqua header badge: four stops so the bar has a lit top lip, a horizon at
		   the middle and a darker foot, which is what reads as a raised metal strip.
		   The VT323 type and the hard 2px edge keep the brutalist core. */
		background: var(--aqua-header-badge-gradient);
		box-shadow: inset 0 1px 0 var(--aqua-header-badge-lip);
		color: var(--aqua-badge-ink);
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
	}

	.reader .prose :global(.chapter .console-slot)::before {
		content: '> SYSTEM.LOG: EXECUTION';
		position: sticky;
		top: 0;
		z-index: 5;
		flex: 0 0 auto;
		margin-bottom: 0;
	}

	/* The telemetry slot does not print the SYSTEM.LOG strip: its own Aqua header badge is
	   the title, and two bars stacked would read as two panels. The brutalist frame and
	   pinstripe stay, so the Aqua well reads as an instrument mounted in the black panel. */
	.reader .prose :global(.chapter .console-slot.telemetry)::before {
		content: none;
	}

	.reader .prose :global(.chapter .console-slot.telemetry) {
		padding: 14px;
	}

	/* Both instrument panels are wells cut into the paper rather than cards laid on top of
	   it: the shadow is inset, so the surface reads as recessed and the Aqua header badge
	   above it reads as the strip of metal in the opening. */
	.reader .prose :global(.chapter .console-slot),
	.reader .prose :global(.chapter .pin-inner) {
		border: 1px solid var(--aqua-well-edge);
		border-radius: 4px;
		box-shadow:
			inset 1px 1px 3px rgba(0, 0, 0, 0.28),
			0 1px 0 rgba(255, 255, 255, 0.8);
	}

	/* The narrative well keeps the paper's own colour so running copy stays legible; only
	   the frame is recessed. */
	.reader .prose :global(.chapter .pin-inner) {
		padding: 14px 16px;
		background: var(--aqua-well);
	}

	.reader .prose :global(.console-slot > .exercise:only-child) {
		margin-top: 0;
	}

	.reader .prose :global(.console-slot .scene-col) {
		background: #0a0e17;
	}

	.reader .prose :global(.chapter .spine) {
		display: none;
	}

	/* 7. Recessed dark 8-bit code editor well inside the Aqua card. */
	.reader .prose :global(.editor-wrapper),
	.reader .prose :global(.console-slot .sandbox-embed .frame) {
		position: relative;
		background: #0a0e17;
		border: 2px solid #000000;
		box-shadow: 4px 4px 0px #000000;
	}

	.reader .prose :global(.editor-wrapper)::after,
	.reader .prose :global(.console-slot .sandbox-embed .frame)::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 3;
		box-shadow: inset 3px 3px 0px rgba(0, 0, 0, 0.85);
		pointer-events: none;
	}

	/* No narrow-screen override: a fixed vw padding here would fall back inside the aperture
	   on phones, which is exactly the clipping the recessed frame causes. */

	/* 8. Brutalist system warning / trap box. */
	.prose :global(.trap) {
		max-width: 100ch;
		margin: 28px 0 16px;
		border: 2px solid #000000;
		border-top: 0;
		background: #fff8e6;
		box-shadow: 4px 4px 0px #000000;
	}

	/* Black and amber hazard stripe on the top edge only; the body stays a plain tint. */
	.prose :global(.trap)::before {
		content: '';
		display: block;
		height: 6px;
		margin: 0 -2px;
		background: repeating-linear-gradient(135deg, #ffb000 0 10px, #0a0a0a 10px 20px);
	}

	/* The trap is a paper card with its own ink, so it keeps black text in both themes
	   rather than inheriting the window's. */
	.prose :global(.trap) {
		color: #000000;
	}

	.prose :global(.trap .trap-head) {
		margin: 0;
		padding: 0.6rem 1.2rem;
		font-weight: 700;
		line-height: 1.6;
		text-transform: uppercase;

		border-bottom: 2px solid #000000;
		background: #ffb000;
		color: #000000;
	}

	.prose :global(.trap h3),
	.prose :global(.trap li) {
		color: inherit;
	}

	.prose :global(.trap h3) {
		margin: 16px 1.2rem 8px;
		padding-top: 0;
		border-top: 0;
	}

	.prose :global(.trap ul) {
		margin: 0 1.2rem 16px;
		padding-left: 24px;
	}

	/* `.window-content` already supplies the padding, so the reader must not add a second
	   inset on top of it: doing both cost ~110px of measure at 1440px and left the prose at
	   42 characters a line, below the 45–75ch reading range. */
	/* The reader is the paper the window shows. It owns the surface rather than letting
	   the window's own fill show through, so the lesson reads the same in light and in
	   dark no matter how much content a given week happens to have. */
	.reader {
		background: var(--color-paper);
		color: var(--color-ink);
		padding: 0 0 16px;
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

	/* An exercise slot is the IDE, and an IDE is a column with three bands: a fixed
	   header, an editor that takes the remaining height and scrolls its own text, and a
	   terminal pinned to a fixed height at the foot. Without the height cap the editor
	   grows to fit its content, which pushes the terminal below the fold and makes the
	   page scroll as one long sheet. */
	.prose :global(.chapter .console-slot:has(> .exercise)) {
		display: flex;
		flex-direction: column;
		/* The column is measured from the window, not the viewport: the lesson scrolls
		   inside `.window-content`, so the usable height is the viewport less the menu
		   bar, the window's 5vh offset, its two chrome bars, the content padding and the
		   dock gutter. 158px is the sum of the fixed chrome (30px title bar, 34px toolbar,
		   two 32px content paddings, both 1px borders). */
		height: calc(100dvh - var(--mac-dock-gutter) - 5vh - 158px);
		max-height: calc(100dvh - var(--mac-dock-gutter) - 5vh - 158px);
		overflow: hidden;
	}

	.prose :global(.console-slot > .exercise:only-child) {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* The identity bar keeps its natural height; only the editor flexes. */
	.prose :global(.console-slot .exercise > .head) {
		flex: 0 0 auto;
	}

	/* The code editor: the band that absorbs the spare height, scrolling its own text
	   rather than stretching the column. The floor keeps enough code visible to work in
	   when the window is short; `min-height: 0` alone lets flex shrink it to nothing. */
	.prose :global(.console-slot .exercise > .editor-wrapper) {
		flex: 1 1 auto;
		min-height: 130px;
		overflow-y: auto;
	}

	/* The terminal: a fixed band, so it is always on screen and always the same size. */
	.prose :global(.console-slot .exercise > .console-wrapper) {
		flex: 0 0 auto;
		height: 200px;
		overflow-y: auto;
	}

	/* Inside the IDE column the bands stack tightly: the sheet margins that suit a print
	   page waste vertical room the editor needs. */
	.prose :global(.console-slot .exercise > .shadow-wrapper) {
		margin-block: 10px;
	}

	.prose :global(.console-slot .exercise > .console-wrapper) {
		margin-block: 0 10px;
	}

	/* A short viewport cannot give the terminal 200px and the editor a usable band, so
	   the terminal gives ground first. */
	@media (max-height: 820px) {
		.prose :global(.console-slot .exercise > .console-wrapper) {
			height: 150px;
		}
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

	   A static block is a terminal printout stamped onto the 8-bit page, in BOTH themes:
	   the surface is the editor well's `#0a0e17` and the token tones are the ones the
	   live editor uses there, so the printed block and the live one read as the same
	   machine. The syntax variables are re-declared here, on the block itself, which is
	   why the tones below pick them up where `:root` still carries the paper set. */
	.prose :global(pre) {
		--code-ink: #f1f1f1;
		--syntax-keyword: #ffb000;
		--syntax-function: #f1f1f1;
		--syntax-builtin: #33ff00;
		--syntax-number: #33ff00;
		--syntax-string: #66c2ff;
		--syntax-comment: #6c7a89;
		margin: 0 0 10px;
		padding: 1.5rem;
		overflow-x: auto;
		border: 2px solid #000000;
		background: #0a0e17;
		box-shadow: 4px 4px 0px #000000;
		color: var(--code-ink);
		line-height: 1.7;
	}

	.prose :global(p code),
	.prose :global(li code),
	.prose :global(td code) {
		overflow-wrap: anywhere;
	}

	/* The prediction panel is a printout in both themes — its token colours are the
	   on-black palette — but it takes its surface from `--color-ink` and its bare text from
	   `--color-paper`, which the palette now sets to alabaster. Pinning the panel back to
	   the editor well's surface and ink inside the window is what makes it readable. */
	.reader .prose :global(.predict .snippet) {
		background: #0a0e17;
		color: #f1f1f1;
	}

	.reader .prose :global(.predict .snippet .snippet-code) {
		color: #f1f1f1 !important;
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

	/* The recessed frame leaves far less room inside the tube than the window suggests, so the
	   pager's 350px first column stops fitting beside the second one well before 700px. */
	@media (max-width: 900px) {
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

		/* The sign-off switch is set in the pixel face, which is far wider per character than
		   the mono face; at phone widths its own padding would push it under the moulding. */
		.signoff-act,
		.complete {
			max-width: 100%;
		}

		.complete {
			padding: 1.2rem clamp(0.6rem, 3vw, 2rem);
			font-size: 1.4rem;
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

	/* ---- the pane filter --------------------------------------------------------------
	   The segmented control in the toolbar is a view over one document, not a second
	   layout. `All Panes` is the pipeline's own output untouched; the other three narrow
	   the same grid by hiding what they do not name, so no chapter is reflowed and no
	   content is rebuilt. A chapter whose console is hidden becomes single-column at full
	   measure, which is the same treatment the `wide` chapters already get. */

	/* Narrative only: the consoles go, the field-guide column takes the whole chapter. */
	.window-content[data-pane='narrative'] :global(.chapter.split) {
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas:
			'pin'
			'body';
	}

	.window-content[data-pane='narrative'] :global(.chapter .console-slot) {
		display: none;
	}

	/* Narrative alone has lost its seam, so the spine has nothing left to divide. */
	.window-content[data-pane='narrative'] :global(.chapter .spine) {
		display: none;
	}

	/* Telemetry only: the exercise consoles go, the readouts stay. A chapter with neither
	   — plain narrative — is not part of the view and drops out entirely. */
	.window-content[data-pane='telemetry'] :global(.console-slot:not(.telemetry)) {
		display: none;
	}

	.window-content[data-pane='telemetry'] :global(.chapter:not(:has(.telemetry))) {
		display: none;
	}

	/* The row a telemetry chapter keeps `pin` and `body` in, with the slot beside them. */
	.window-content[data-pane='telemetry'] :global(.chapter.split:has(.telemetry)) {
		grid-template-columns: minmax(350px, 5fr) minmax(0, 7fr);
		grid-template-areas:
			'pin slot'
			'body slot';
	}

	/* Terminal only: the readouts go and the exercise consoles stay. */
	.window-content[data-pane='terminal'] :global(.console-slot.telemetry) {
		display: none;
	}

</style>
