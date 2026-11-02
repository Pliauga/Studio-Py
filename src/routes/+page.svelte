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
		// The overlay lives inside `.page`, whose view-transition-name makes it a stacking
		// context, so a fixed z-index cannot outrank the header. Stand the chrome down for
		// the boot instead — the same mechanism the portal uses.
		document.documentElement.dataset.boot = 'on';
		const endBoot = () => {
			booting = false;
			delete document.documentElement.dataset.boot;
			showHalftone();
		};
		// The lines paint from CSS animation-delay, so the sequence survives main-thread
		// jank. These timers only lift the shutter at 700ms and unmount one fade later.
		window.setTimeout(() => (bootLeaving = true), BOOT_HOLD_MS);
		window.setTimeout(endBoot, BOOT_HOLD_MS + BOOT_FADE_MS);

		// Leaving mid-boot must not strand the header hidden on the next page.
		return () => delete document.documentElement.dataset.boot;
	});

	async function enter(event: MouseEvent): Promise<void> {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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

<div class="transition-overlay" bind:this={overlay} aria-hidden="true">
	<canvas bind:this={wakeCanvas}></canvas>
	<canvas bind:this={spriteCanvas}></canvas>
</div>

<!-- The machine boots, then hands off to the print. Rendered only after mount, so the
     poster behind it is already painted and keeps the LCP. The lines are all in the DOM
     and revealed by CSS delay, so jank cannot strand the sequence part-printed. -->
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

<style>
	/* Flat print: the paper and typography carry the composition without a lighting effect. */
	.hero {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
		align-items: center;
		gap: clamp(24px, 4.5vw, 88px);
		min-height: 100svh;
		padding: clamp(84px, 9vh, 132px) clamp(20px, 4vw, 64px) clamp(40px, 6vh, 72px);
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
		--frame-h: min(76svh, calc(100svh - 280px));
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

	.headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(4rem, 8vw, 8rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
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
	   poster being uncovered rather than being drawn: one mechanical beat, then the print. */
	/* The boot is a full-screen shutter, so the fixed header and the progress rule stand
	   down for its duration — `.page` is a stacking context, so nothing inside it can
	   outrank them by z-index. */
	:global(html[data-boot]) :global(.site-head),
	:global(html[data-boot]) :global(.progress) {
		visibility: hidden;
	}

	.boot {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: clamp(20px, 6vw, 72px);
		overflow: hidden;
		background: #000;
		color: #40f51a;
		font-family: var(--font-terminal);
		font-size: clamp(0.8rem, 1.9vw, 1rem);
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

	/* Poster first, then the readout — the correct read on a phone. */
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			align-content: center;
			gap: clamp(26px, 6vw, 34px);
			padding: 78px 20px 40px;
		}

		.frame {
			--frame-h: min(37svh, 320px);
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
			font-size: clamp(3.5rem, 12vw, 6rem);
		}

		.standfirst {
			max-width: 45ch;
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
