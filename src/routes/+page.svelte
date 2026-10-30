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

	/** Honest before hydration — a first-time visitor really is 0/25 — and live after it. */
	let completedCount = $state(0);

	onMount(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		void import('#lib/components/scene/HalftonePlate.svelte').then((module) => {
			HalftonePlate = module.default;
		});

		completedCount = MODULES.filter(
			(module) => progress.statusOf(module.slug) === 'completed'
		).length;

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
		content="Twenty-five modules over twenty-four weeks of small Python programs: variables, pandas, SQL, hashing, Streamlit and deployment."
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
			<div class="fact"><dt>Modules</dt><dd>25 over 24 weeks</dd></div>
			<div class="fact"><dt>First run</dt><dd>12 minutes, in the browser</dd></div>
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
	}
</style>
