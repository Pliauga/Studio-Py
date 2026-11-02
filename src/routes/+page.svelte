<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { MODULES } from '#lib/content/lessons.ts';
	import { progress } from '#lib/stores/progress.svelte.ts';
	import { plate } from '#lib/stores/plate.svelte.ts';
	import LandingTerminal from '#lib/components/LandingTerminal.svelte';
	import type { Component } from 'svelte';
	import {
		CELL_PX,
		SNAKE_CELLS,
		activate,
		createLayers,
		dock,
		travel,
		type Cell
	} from '#lib/transition/snake-warp.ts';

	/** Where the emblem's snake head sits inside the poster, as fractions of the image. */
	const EMBLEM_HEAD = { x: 1051.5 / 1200, y: 814 / 1607 };
	/** Cards finish arriving this long after the dock starts; only then is the flag cleared. */
	const CARDS_MS = 420;

	let overlay = $state<HTMLDivElement | null>(null);
	let wakeCanvas = $state<HTMLCanvasElement | null>(null);
	let spriteCanvas = $state<HTMLCanvasElement | null>(null);
	let poster = $state<HTMLImageElement | null>(null);
	let entering = false;

	let HalftonePlate = $state.raw<Component<{ reduceMotion: boolean }> | null>(null);
	let reduceMotion = $state(false);

	const toCell = (px: number) => Math.round(px / CELL_PX);
	const pad = (n: number) => String(n).padStart(2, '0');

	/** Honest before hydration — a first-time visitor really is 0/24 — and live after it. */
	let completedCount = $state(0);

	/** The boot overlay is an after-paint flourish: it never gates the poster's HTML. */
	const BOOT_KEY = 'studio-py:booted';
	/** A long mechanical start-up: the log fills the screen, the operator draws, then the
	 *  shutter lifts. The cascade itself is timed entirely in CSS (`animation-delay`, keyed
	 *  on `--i`, so main-thread jank cannot strand it part-printed); these two only place
	 *  the lift and the fade that follows. */
	const BOOT_HOLD_MS = 3600;
	const BOOT_FADE_MS = 200;

	/** The system log. Counts and addresses are flavour: they describe a dying machine. */
	const BOOT_LOG = [
		'INITIALIZING STUDIO-PY OS v1.0...',
		'MOUNTING /dev/py0 ................ OK',
		'LOADING KERNEL ................... OK',
		'CHECKING KERNEL INTEGRITY ........ OK',
		'LINKING CPython RUNTIME .......... OK',
		'CALIBRATING PHOSPHOR MATRIX ...... OK',
		'LOADING MODULE_W01 ................ OK',
		'LOADING MODULE_W02 ................ OK',
		'PROBING INCIDENT BUS ............. 1 FAULT',
		'WARNING: SRV-07 DISK AT 96%',
		'WARNING: UNACKNOWLEDGED PAGE AT 03:14',
		'OPERATOR BADGE REQUIRED',
		'RENDERING OPERATOR ...'
	];

	/** The operator, drawn by the terminal itself: puffer jacket, deadpan, on shift.
	 *  The same glyph set as the lesson watermark, so the mascot is one character and not
	 *  two drawings that merely resemble each other. */
	const BOOT_ART = [
		"            _.-\"\"\"\"\"\"\"-._",
		"          .'    _   _    '.",
		"         /     (o) (o)     \\",
		"    ()  |         ^         |  ()",
		"    ||  |      .-----.      |  ||",
		"    ||   \\     '-___-'     /   ||",
		"    ||    '.             .'    ||",
		"    ||   __'-._________.-'__   ||",
		"    '|  /  |    |   |    |  \\  |'",
		"     '-/   |    |   |    |   \\-'",
		"      /    |____|   |____|    \\",
		"     /      /   |   |   \\      \\",
		"   [==][==][==][==][==][==][==]"
	];

	let booting = $state(false);
	let bootLeaving = $state(false);

	onMount(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		completedCount = MODULES.filter(
			(module) => progress.statusOf(module.slug) === 'completed'
		).length;

		// The halftone is a whole three.js scene. Hydrating it competes with the boot for
		// the main thread — it cost ~3.2s of jank and starved the boot's own timers — so it
		// waits for idle after the shutter has lifted. The poster is painted without it.
		const showHalftone = () => {
			const start = () =>
				void import('#lib/components/scene/HalftonePlate.svelte').then((module) => {
					HalftonePlate = module.default;
				});
			if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
			else setTimeout(start, 200);
		};

		// One boot per session, never under reduced motion, and never at the cost of a
		// poster the browser has already painted: the overlay mounts on top of it.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			showHalftone();
			return;
		}
		try {
			if (sessionStorage.getItem(BOOT_KEY)) {
				showHalftone();
				return;
			}
			sessionStorage.setItem(BOOT_KEY, '1');
		} catch {
			// Storage can be blocked; a visitor who blocks it sees the poster immediately.
			showHalftone();
			return;
		}

		booting = true;
		const endBoot = () => {
			booting = false;
			showHalftone();
		};
		// The lines paint from CSS animation-delay, so the sequence survives main-thread
		// jank. These timers only lift the shutter at 700ms and unmount one fade later.
		window.setTimeout(() => (bootLeaving = true), BOOT_HOLD_MS);
		window.setTimeout(endBoot, BOOT_HOLD_MS + BOOT_FADE_MS);
	});

	/** The red and yellow lights: the README leaves the desk and the index is behind it. */
	function close(): void {
		void goto('/dashboard');
	}

	async function enter(event: MouseEvent): Promise<void> {
		if (
			event instanceof MouseEvent &&
			(event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
		)
			return;
		event.preventDefault();
		if (entering) return;
		entering = true;

		const anchor = event.currentTarget instanceof HTMLAnchorElement ? event.currentTarget : null;
		const destination = anchor ? new URL(anchor.href).pathname : '/dashboard';
		const cover = overlay;
		const layers = cover && wakeCanvas && spriteCanvas ? createLayers(wakeCanvas, spriteCanvas) : null;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !cover || !poster || !layers) {
			await goto(destination);
			return;
		}

		const image = poster.getBoundingClientRect();
		const spawn: Cell = {
			x: Math.round((image.left + image.width * EMBLEM_HEAD.x) / CELL_PX - SNAKE_CELLS / 2),
			y: Math.round((image.top + image.height * EMBLEM_HEAD.y) / CELL_PX - SNAKE_CELLS / 2)
		};

		// Phases 1-2: the emblem wakes, then the snake zig-zags out and the poster dissolves.
		await activate(layers, spawn);
		const run = travel(layers, spawn);
		await run.done;

		// Phase 3: the route swap destroys this page, so the cover moves to <body>. While any
		// `data-warp` is set, the layout's page fade is off and the dashboard sits fully opaque.
		const root = document.documentElement;
		document.body.appendChild(cover);
		root.dataset.warp = 'cover';
		try {
			await goto(destination);
			const idle = document.querySelector<HTMLElement>('.snake-idle');
			if (!idle) {
				// Only the index carries the idle snake to dock into; every other destination
				// just ends the warp and lets the cover clear.
				root.dataset.warp = 'idle';
				window.setTimeout(() => delete root.dataset.warp, CARDS_MS);
				return;
			}
			const rect = idle.getBoundingClientRect();
			const target: Cell = {
				x: Math.min(Math.max(toCell(rect.left), 0), layers.cols - SNAKE_CELLS),
				y: Math.min(Math.max(toCell(rect.top), 0), layers.rows - SNAKE_CELLS)
			};

			root.dataset.warp = 'dock';
			await dock(layers, run.path[run.path.length - 1], target);

			// The idle snake takes over from the sprite on the exact grid cell it docked at.
			idle.style.transform = `translate(${target.x * CELL_PX - rect.left}px, ${target.y * CELL_PX - rect.top}px)`;
			root.dataset.warp = 'idle';
			window.setTimeout(() => delete root.dataset.warp, CARDS_MS);
		} catch (error) {
			delete root.dataset.warp;
			throw error;
		} finally {
			cover.remove();
		}
	}
</script>

<svelte:head>
	<title>Studio Py — a Python curriculum, run like an incident</title>
	<meta
		name="description"
		content="Twenty-four modules of small Python programs: variables, pandas, SQL, hashing, Streamlit and deployment."
	/>
	<link
		rel="preload"
		as="image"
		type="image/webp"
		href="/studio-py-poster-1200.webp"
		imagesrcset="/studio-py-poster-1200.webp 1200w, /studio-py-poster-2400.webp 2400w"
		imagesizes="(max-width: 900px) 100vw, 50vw"
		fetchpriority="high"
	/>
</svelte:head>

<!-- The landing is a document on the desktop: a README.md window resting on the
     work surface, with its own chrome, its own scroll box, and an action bar at its
     foot. The desktop, the menu bar and the dock belong to the layout. -->
<div class="desktop">
	<section class="mac-window" aria-labelledby="readme-title">
		<div class="mac-titlebar">
			<span class="mac-lights">
				<button type="button" class="light red" aria-label="Close — go to the desktop" title="Close" onclick={close}>
					<span class="mark" aria-hidden="true">×</span>
				</button>
				<button type="button" class="light yellow" aria-label="Minimise — go to the desktop" title="Minimise" onclick={close}>
					<span class="mark" aria-hidden="true">−</span>
				</button>
				<button type="button" class="light green" aria-label="Enter the desktop" title="Enter the desktop" onclick={close}>
					<span class="mark" aria-hidden="true">+</span>
				</button>
			</span>
			<h2 class="mac-filename" id="readme-title">
				<span class="mac-doc" aria-hidden="true">📄</span>
				README.md
			</h2>
		</div>

		<div class="mac-body" data-mac-scroll>
			<main class="hero">
				<figure class="plate">
					<div class="frame" data-plate-density={plate.density ?? undefined}>
						<div class="poster-cell">
							<img
								bind:this={poster}
								class="poster-image"
								src="/studio-py-poster-1200.webp"
								srcset="/studio-py-poster-1200.webp 1200w, /studio-py-poster-2400.webp 2400w"
								sizes="(max-width: 900px) 100vw, 50vw"
								alt="Studio Py poster featuring a developer in a blue puffer holding a pixel snake"
								width="1200"
								height="1607"
								fetchpriority="high"
							/>
						</div>
						{#if HalftonePlate}
							<div class="halftone" aria-hidden="true">
								<HalftonePlate {reduceMotion} />
							</div>
						{/if}
					</div>
					<figcaption class="plate-caption" aria-hidden="true">
						<span class="fig">FIG 0.1 — Operator{#if plate.density !== null}{' '}· ink {Math.round(plate.density * 100)}%{/if}</span>
						<span class="colophon">EDITION 01/25 · OFFSET · RISO GREEN · 1200 DPI · WEBASSEMBLY</span>
					</figcaption>
				</figure>

				<div class="readout">
					<h1 class="headline">Stop Learning.<br />Start Patching.</h1>
					<p class="standfirst">
						A psychological incident-response curriculum for Python. Every waypoint is a broken system.
						Read the traceback. Find the trap. Fix the file. No playgrounds. No excuses.
					</p>
					<dl class="facts">
						<div class="fact"><dt>Modules</dt><dd>24, one incident each</dd></div>
						<div class="fact"><dt>First run</dt><dd>16 minutes, in the browser</dd></div>
						<div class="fact"><dt>Setup</dt><dd>None — Python runs in the page</dd></div>
					</dl>
					<LandingTerminal onEnter={enter} />
					<p class="terminal-caption">
						{pad(completedCount)} / {pad(MODULES.length)} complete
					</p>
					<a class="full-index" href="/dashboard" onclick={enter}>&gt; [ ACCESS_FULL_INDEX ]</a>
				</div>
			</main>

			<!-- The machine boots, then hands off to the print. The shutter is the
			     window's own body rather than the viewport, so the desktop, the menu bar
			     and the dock stay put and the boot happens inside the document. Rendered
			     only after mount, so the poster behind it keeps the LCP. The lines are all
			     in the DOM and revealed by CSS delay, so jank cannot strand the sequence. -->
			{#if booting}
				<div class="boot" class:leaving={bootLeaving} aria-hidden="true">
					<div class="boot-log">
						{#each BOOT_LOG as line, index (index)}
							<p style={`--i: ${index}`}>&gt; {line}</p>
						{/each}
						<pre class="boot-art">{#each BOOT_ART as artLine, index (index)}<span
									style={`--i: ${index}`}
								>{artLine}{'\n'}</span
								>{/each}</pre>
						<p style={`--i: ${BOOT_LOG.length + BOOT_ART.length}`} class="boot-handoff">
							&gt; HANDOFF TO OPERATOR.<span class="boot-caret"></span>
						</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- The action bar: a document viewer's footer. Close leaves the README; Enter
		     takes the desktop over, through the snake warp. -->
		<div class="mac-footer">
			<button type="button" class="mac-btn" onclick={close}>[ Close ]</button>
			<a class="mac-btn primary" href="/dashboard" onclick={enter}>[ Enter the Desktop → ]</a>
		</div>
	</section>
</div>

<div class="transition-overlay" bind:this={overlay} aria-hidden="true">
	<canvas bind:this={wakeCanvas}></canvas>
	<canvas bind:this={spriteCanvas}></canvas>
</div>

<style>
	/* ---- the README window ------------------------------------------------------------
	   A document viewer resting on the desktop: an Aqua title bar, a body that scrolls
	   inside the frame, and an action bar at the foot. The window sits where a macOS
	   window would — clear of the menu bar above and the dock below. */
	.desktop {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: stretch;
		justify-content: center;
		padding: clamp(16px, 3vh, 40px) clamp(12px, 2.4vw, 40px)
			calc(var(--mac-dock-gutter) - var(--mac-menubar-h));
		box-sizing: border-box;
	}

	.mac-window {
		position: relative;
		display: flex;
		flex-direction: column;
		width: min(1280px, 100%);
		max-height: 100%;
		min-height: 0;
		border-radius: 12px;
		overflow: hidden;
		background: var(--color-paper);
		box-shadow: var(--mac-window-shadow);
	}

	.mac-titlebar {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		height: 38px;
		padding: 0 14px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.18);
		background: var(--mac-aqua);
		color: var(--mac-aqua-ink);
		font-family: var(--mac-ui);
		user-select: none;
	}

	.mac-filename {
		position: absolute;
		left: 50%;
		max-width: calc(100% - 11rem);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-family: var(--mac-ui);
		font-size: 13px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.01em;
		transform: translateX(-50%);
	}

	.mac-doc {
		font-size: 12px;
	}

	.mac-lights {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}

	/* The Aqua lights: 12px discs, the glyph revealed only on hover so the chrome
	   stays quiet until it is asked to do something. */
	.light {
		position: relative;
		display: grid;
		place-items: center;
		width: 12px;
		height: 12px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.35);
		cursor: pointer;
	}

	.light.red {
		background: #ff5f57;
	}

	.light.yellow {
		background: #febc2e;
	}

	.light.green {
		background: #28c840;
	}

	.light .mark {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--mac-ui);
		font-size: 9px;
		font-weight: 700;
		line-height: 1;
		color: rgba(0, 0, 0, 0.6);
		opacity: 0;
		pointer-events: none;
	}

	.mac-lights:hover .mark,
	.light:focus-visible .mark {
		opacity: 1;
	}

	.light:focus-visible {
		outline: 2px solid var(--mac-blue);
		outline-offset: 2px;
	}

	/* The document: the only scroll box on the page. The frame never moves. */
	.mac-body {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: clamp(20px, 3vw, 40px);
		background: var(--color-paper);
	}

	.mac-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		flex: none;
		padding: 12px clamp(14px, 2vw, 20px);
		border-top: 1px solid rgba(0, 0, 0, 0.14);
		background: rgba(0, 0, 0, 0.035);
		font-family: var(--mac-ui);
	}

	/* Aqua buttons are a hairline rim around a light vertical gradient, not a flat fill:
	   the sheen is what separates them from the footer rather than a black outline. */
	.mac-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding: 0 16px;
		border: 0;
		border-radius: 7px;
		background: linear-gradient(to bottom, #fdfdfd, #e4e4e4);
		box-shadow:
			inset 0 0 0 0.5px rgba(0, 0, 0, 0.2),
			0 1px 2px rgba(0, 0, 0, 0.1);
		font-family: var(--mac-ui);
		font-size: 13px;
		font-weight: 500;
		line-height: 1;
		color: var(--mac-aqua-ink);
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
	}

	.mac-btn:hover,
	.mac-btn:focus-visible {
		background: linear-gradient(to bottom, #f5f5f5, #dbdbdb);
	}

	.mac-btn:active {
		background: linear-gradient(to bottom, #d8d8d8, #e2e2e2);
	}

	.mac-btn.primary {
		background: linear-gradient(to bottom, #4ba3ff, var(--mac-blue));
		box-shadow:
			inset 0 0 0 0.5px rgba(0, 0, 0, 0.18),
			0 1px 2px rgba(0, 0, 0, 0.18);
		color: #ffffff;
	}

	.mac-btn.primary:hover,
	.mac-btn.primary:focus-visible {
		background: linear-gradient(to bottom, #429bfb, #2f8bee);
	}

	.mac-btn.primary:active {
		background: linear-gradient(to bottom, #2a80dc, #358fe8);
	}

	.mac-btn:focus-visible {
		outline: 2px solid var(--mac-blue);
		outline-offset: 2px;
	}

	.mac-btn.primary:focus-visible {
		outline-color: var(--mac-aqua-ink);
	}

	/* Flat print: the paper and typography carry the composition without a lighting effect. */
	.hero {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
		align-items: center;
		gap: clamp(24px, 4.5vw, 88px);
	}

	/* The figure is exactly as wide as the print, so the captions align to its left edge. */
	.plate {
		display: grid;
		justify-items: start;
		width: fit-content;
		max-width: 100%;
		gap: 14px;
		min-width: 0;
		margin: 0 auto;
	}

	/* Sized by CSS, never by the file: the plate cannot move when the poster lands. */
	.frame {
		/* The window body is the measure now, not the viewport: subtract the chrome
		   (menu bar, title bar, footer, dock gutter and the body's own padding) so the
		   print lands inside the document instead of overflowing it. */
		--frame-h: min(56vh, calc(100vh - 360px));
		position: relative;
		isolation: isolate;
		/* Width is computed from the height, not left to aspect-ratio: Safari resolves a
		   fit-content parent over an aspect-ratio child to zero, which collapses the plate. */
		width: calc(var(--frame-h) * 1200 / 1607);
		height: var(--frame-h);
		aspect-ratio: 1200 / 1607;
		min-width: 0;
		max-width: 100%;
		line-height: 0;
	}

	/* Newsprint grain over the print only. The poster stays pale in both themes, so
	   multiply is the blend that actually darkens it; screen/overlay would be invisible. */
	.frame::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n' x='0' y='0' width='100%25' height='100%25' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0.33 0.33 0.33 0 0.3 0.33 0.33 0.33 0 0.3 0.33 0.33 0.33 0 0.3 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
		background-size: 200px 200px;
		mix-blend-mode: multiply;
		opacity: 0.1;
		pointer-events: none;
	}

	/* The halftone screen is a WebGL canvas: one dot per cell, its radius the program's
	   answer. It is printed matter that the machine half re-inks, so it multiplies into
	   the poster like ink and stays off until a run has said something. */
	.halftone {
		position: absolute;
		inset: 1px;
		mix-blend-mode: multiply;
		pointer-events: none;
		z-index: 1;
	}

	/* The print fills the cell exactly, edge to edge. */
	.poster-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Dark mode is a print seen at night, not an inverted one: the poster keeps its
	   ink and loses luminance, so it stops glaring against the black page. */
	:global(html[data-theme='dark']) .poster-image {
		filter: brightness(0.78) contrast(1.04);
	}

	/* No border, outline, shadow or pseudo-element: the print is the only thing in
	   this column that paints. */
	.poster-cell {
		position: relative;
		width: 100%;
		height: 100%;
	}

	/* The plate is signed the way a proof is signed: mono, small, set under the print. The
	   zero-width trick keeps the text from widening the figure past the print. */
	.plate-caption {
		display: grid;
		gap: 4px;
		width: 0;
		min-width: 100%;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		line-height: 1.4;
		letter-spacing: 0.06em;
		text-align: left;
	}

	.fig {
		text-transform: uppercase;
		color: var(--color-ink);
	}

	.colophon {
		color: var(--color-muted);
	}

	.terminal-caption {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 10.5px;
		line-height: 1.4;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-tertiary);
	}

	.full-index {
		margin-top: -6px;
		font-family: var(--font-terminal);
		font-size: 12px;
		line-height: 1.4;
		letter-spacing: 0.12em;
		color: var(--color-ink);
		text-decoration: none;
	}

	.full-index:hover,
	.full-index:focus-visible {
		color: #33ff00;
		text-decoration: underline;
		text-underline-offset: 0.4em;
	}

	.readout {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: clamp(18px, 2.2vw, 28px);
		max-width: 52ch;
		min-width: 0;
	}

	/* The headline is set against the readout's own column, not the viewport: the window
	   only ever gives the text column ~42% of its width, so a vw-based size ran past the
	   body's right padding and bled out of the frame. */
	.headline {
		margin: 0;
		max-width: 100%;
		font-family: var(--font-display);
		font-size: clamp(2.6rem, 4.4vw, 3.9rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		overflow-wrap: break-word;
		color: #000000;
	}

	/* Black ink needs paper: on the dark theme the ink token carries the same job. */
	:global(html[data-theme='dark']) .headline {
		color: var(--color-ink);
	}

	.standfirst {
		margin: 0;
		max-width: 45ch;
		font-family: var(--font-display);
		font-size: clamp(0.95rem, 1.1vw, 1.05rem);
		line-height: 1.5;
		letter-spacing: -0.005em;
		color: var(--color-ink);
	}

	/* Three facts, set as a readout table: machine half, so mono and hairline rules. */
	.facts {
		display: grid;
		gap: 0;
		width: 100%;
		margin: 0;
		border-top: 1px solid rgba(127, 127, 127, 0.35);
	}

	.fact {
		display: grid;
		grid-template-columns: 8.5em minmax(0, 1fr);
		align-items: baseline;
		gap: 12px;
		padding: 9px 0;
		border-bottom: 1px solid rgba(127, 127, 127, 0.35);
	}

	.fact dt {
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.2;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-tertiary);
	}

	.fact dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: clamp(11px, 1.05vw, 12.5px);
		line-height: 1.35;
		letter-spacing: 0.02em;
	}

	.transition-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		overflow: hidden;
		background: transparent;
		pointer-events: none;
	}

	.transition-overlay canvas {
		position: absolute;
		top: 0;
		left: 0;
		image-rendering: pixelated;
	}

	/* ---- The boot ---------------------------------------------------------------------
	   A black shutter over the already-painted poster. It fades out, so the reveal is the
	   poster being uncovered rather than being drawn: one mechanical beat, then the print.
	   The shutter covers the window's body, not the screen — the desktop, the menu bar and
	   the dock stay visible while the machine starts. */
	.boot {
		position: absolute;
		inset: 0;
		z-index: 5;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: clamp(16px, 3vw, 40px);
		overflow: hidden;
		background: #000;
		color: #40f51a;
		font-family: var(--font-terminal);
		font-size: clamp(0.72rem, 1.5vw, 0.95rem);
		line-height: 1.5;
		letter-spacing: 0.04em;
		opacity: 1;
		transition: opacity 200ms linear;
		pointer-events: none;
	}

	.boot.leaving {
		opacity: 0;
	}

	/* The console column. It is bottom-anchored and clipped: lines enter at the bottom and
	   the block grows upward, the way a real boot log scrolls past. */
	.boot-log {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		width: min(100%, 62rem);
		max-height: 100%;
		justify-content: flex-end;
	}

	.boot p,
	.boot-art span {
		margin: 0;
		white-space: pre;
		opacity: 0;
		/* Each line lands in sequence. The whole cascade is CSS, so main-thread jank
		   cannot strand the sequence part-printed. */
		animation: boot-line 1ms steps(1, end) forwards;
		animation-delay: calc(var(--i) * 160ms);
	}

	/* The mascot sprays out faster than the log types, so the art still resolves as a
	   picture rather than crawling up one letter at a time. It starts once the log has
	   finished typing, so the two sequences never overlap. */
	.boot-art {
		margin: 0.5rem 0 0.4rem;
		font: inherit;
		font-size: 0.92em;
		line-height: 1.05;
		color: #33ff00;
		text-shadow:
			0 0 6px rgba(51, 255, 0, 0.7),
			0 0 18px rgba(51, 255, 0, 0.35);
	}

	.boot-art span {
		animation-delay: calc(2150ms + var(--i) * 65ms);
	}

	.boot-handoff {
		color: #e0ffe0;
		/* Pinned to the tail of the cascade rather than derived from the line count, so the
		   handoff always lands just before the shutter lifts. */
		animation-delay: 3000ms;
	}

	@keyframes boot-line {
		to {
			opacity: 1;
		}
	}

	.boot-caret {
		display: inline-block;
		width: 0.55em;
		height: 1em;
		margin-left: 0.35em;
		vertical-align: -0.12em;
		background: currentColor;
		animation: boot-caret 480ms steps(2, end) infinite;
	}

	@keyframes boot-caret {
		50% {
			opacity: 0;
		}
	}

	@media (max-width: 1199px) {
		.hero {
			grid-template-columns: minmax(0, 60fr) minmax(0, 40fr);
			gap: clamp(20px, 3vw, 56px);
		}

	}

	/* Poster first, then the readout — the correct read on a narrower window. */
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			align-content: start;
			gap: clamp(26px, 6vw, 34px);
		}

		.frame {
			--frame-h: min(34vh, 280px);
			margin-inline: auto;
		}

		.plate {
			gap: 20px;
		}

		.readout {
			max-width: 100%;
			gap: clamp(22px, 4vw, 26px);
		}

		.headline {
			font-size: clamp(2.4rem, 9vw, 3.6rem);
		}

		.standfirst {
			max-width: 45ch;
		}
	}

	@media (max-width: 640px) {
		.desktop {
			padding: 12px 8px calc(var(--mac-dock-gutter) - var(--mac-menubar-h));
		}

		.mac-window {
			border-radius: 10px;
		}

		.mac-footer {
			justify-content: stretch;
		}

		.mac-btn {
			flex: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* The terminal's own transitions are scoped to the component. */
		* {
			scroll-behavior: auto;
		}

		/* The overlay never mounts under reduced motion; this covers a mid-session
		   preference change while it is still on screen, where a suppressed animation
		   must not leave the lines invisible. */
		.boot p {
			opacity: 1;
			animation: none;
		}

		.boot-caret {
			animation: none;
		}
	}
</style>
