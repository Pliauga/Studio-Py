<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { MODULES } from '#lib/content/lessons.ts';
	import { progress } from '#lib/stores/progress.svelte.ts';
	import { plate } from '#lib/stores/plate.svelte.ts';
	import LandingTerminal from '#lib/components/LandingTerminal.svelte';
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

	const toCell = (px: number) => Math.round(px / CELL_PX);
	const pad = (n: number) => String(n).padStart(2, '0');

	/** Honest before hydration — a first-time visitor really is 0/25 — and live after it. */
	let completedCount = $state(0);

	onMount(() => {
		completedCount = MODULES.filter(
			(module) => progress.statusOf(module.slug) === 'completed'
		).length;
	});

	async function enter(event: MouseEvent): Promise<void> {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		if (entering) return;
		entering = true;

		const cover = overlay;
		const layers = cover && wakeCanvas && spriteCanvas ? createLayers(wakeCanvas, spriteCanvas) : null;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !cover || !poster || !layers) {
			await goto('/dashboard');
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
			await goto('/dashboard');
			const idle = document.querySelector<HTMLElement>('.snake-idle');
			const rect = idle?.getBoundingClientRect();
			const target: Cell = rect
				? {
						x: Math.min(Math.max(toCell(rect.left), 0), layers.cols - SNAKE_CELLS),
						y: Math.min(Math.max(toCell(rect.top), 0), layers.rows - SNAKE_CELLS)
					}
				: { x: 0, y: 0 };

			root.dataset.warp = 'dock';
			await dock(layers, run.path[run.path.length - 1], target);

			// The idle snake takes over from the sprite on the exact grid cell it docked at.
			if (idle && rect) {
				idle.style.transform = `translate(${target.x * CELL_PX - rect.left}px, ${target.y * CELL_PX - rect.top}px)`;
			}
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
	<link rel="preload" href="/studio-py-poster.webp" as="image" type="image/webp" fetchpriority="high" />
</svelte:head>

<main class="hero">
	<figure class="plate">
		<div
			class="frame"
			class:inked={plate.density !== null}
			style:--plate-density={plate.density ?? 0}
			data-plate-density={plate.density ?? undefined}
		>
			<img
				bind:this={poster}
				class="poster-img"
				src="/studio-py-poster.webp"
				alt="Poster for Studio Py — a Python curriculum run like an incident: 25 modules over 24 weeks."
				width="1200"
				height="1607"
				fetchpriority="high"
			/>
			<span class="reg tl" aria-hidden="true"></span>
			<span class="reg tr" aria-hidden="true"></span>
			<span class="reg bl" aria-hidden="true"></span>
			<span class="reg br" aria-hidden="true"></span>
		</div>
		<figcaption class="plate-caption" aria-hidden="true">
			Studio-Py.pages.dev — 25 modules / 24 weeks{#if plate.density !== null}{' '}· ink {Math.round(plate.density * 100)}%{/if}
		</figcaption>
	</figure>

	<div class="readout">
		<h1 class="headline">A Python curriculum,<br />run like an incident.</h1>
		<p class="standfirst">
			For developers who have shipped software and never written Python. Every module hands you a
			broken system and one file to fix it with.
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
	</div>
</main>

<div class="transition-overlay" bind:this={overlay} aria-hidden="true">
	<canvas bind:this={wakeCanvas}></canvas>
	<canvas bind:this={spriteCanvas}></canvas>
</div>

<style>
	/* The seam: a printed plate on the left, a machine readout on the right. The lamp keeps
	   the centre lifted off the page and falls back to the theme paper, so the route
	   background stays seamless in both themes. */
	.hero {
		--lamp: #f8f8f8;
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
		align-items: center;
		gap: clamp(24px, 4.5vw, 88px);
		min-height: 100svh;
		padding: clamp(84px, 9vh, 132px) clamp(20px, 4vw, 64px) clamp(40px, 6vh, 72px);
		background: radial-gradient(ellipse 65% 60% at 50% 46%, var(--lamp) 0%, var(--color-paper) 100%);
	}

	:global(html[data-theme='dark']) .hero {
		--lamp: #1a1a1a;
	}

	.plate {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		min-width: 0;
		margin: 0;
	}

	/* Sized by CSS, never by the file: the plate cannot move when the poster lands. */
	.frame {
		position: relative;
		isolation: isolate;
		height: min(76svh, calc(100svh - 250px));
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

	/* The halftone screen: one dot per cell, its radius the program's answer. It is
	   printed matter that the machine half re-inks, so it multiplies into the poster
	   like ink and stays off until a run has said something. */
	@property --plate-density {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	.frame::before {
		content: '';
		position: absolute;
		inset: 1px;
		background-image: radial-gradient(
			circle at 50% 50%,
			#000000 calc(var(--plate-density) * 2.7px),
			transparent calc(var(--plate-density) * 2.7px + 0.6px)
		);
		background-size: 6px 6px;
		mix-blend-mode: multiply;
		opacity: 0;
		pointer-events: none;
		transition:
			--plate-density var(--duration-4) var(--ease-standard),
			opacity var(--duration-3) var(--ease-standard);
	}

	.frame.inked::before {
		opacity: calc(0.3 + var(--plate-density) * 0.5);
	}

	/* Registration crosshairs centred on the four corners of the frame. */
	.reg {
		position: absolute;
		width: 15px;
		height: 15px;
		pointer-events: none;
	}

	.reg::before,
	.reg::after {
		content: '';
		position: absolute;
		background: var(--color-ink);
	}

	.reg::before {
		top: 7px;
		left: 0;
		width: 15px;
		height: 1px;
	}

	.reg::after {
		top: 0;
		left: 7px;
		width: 1px;
		height: 15px;
	}

	.tl {
		top: -8px;
		left: -8px;
	}

	.tr {
		top: -8px;
		right: -8px;
	}

	.bl {
		bottom: -8px;
		left: -8px;
	}

	.br {
		bottom: -8px;
		right: -8px;
	}

	.poster-img {
		display: block;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		object-fit: contain;
		border: 1px solid var(--color-ink);
	}

	/* Dark mode is a print seen at night, not an inverted one: the poster keeps its
	   ink and loses luminance, so it stops glaring against the black page. */
	:global(html[data-theme='dark']) .poster-img {
		border-color: rgba(241, 241, 241, 0.24);
		filter: brightness(0.78) contrast(1.04);
	}

	/* The plate is still signed, the way a proof is signed: mono, small, set under the print. */
	.plate-caption {
		max-width: 100%;
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.2;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		text-align: center;
		color: var(--color-tertiary);
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
		font-family: var(--font-body);
		font-size: clamp(2.1rem, 3.4vw, 3.5rem);
		font-weight: 400;
		line-height: 0.98;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.standfirst {
		margin: 0;
		max-width: 38ch;
		font-family: var(--font-display);
		font-size: clamp(0.95rem, 1.1vw, 1.05rem);
		line-height: 1.55;
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

		.headline {
			font-size: clamp(1.9rem, 3.6vw, 2.8rem);
		}
	}

	/* Poster first, then the readout — the correct read on a phone. */
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			align-content: center;
			gap: 18px;
			padding: 78px 20px 30px;
		}

		.frame {
			height: min(37svh, 320px);
			margin-inline: auto;
		}

		.plate-caption {
			font-size: 10px;
			letter-spacing: 0.14em;
		}

		.readout {
			max-width: 100%;
		}

		.headline {
			font-size: clamp(1.85rem, 7vw, 2.5rem);
		}

		.standfirst {
			max-width: 52ch;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* The terminal's own transitions are scoped to the component. */
		* {
			scroll-behavior: auto;
		}

		.frame::before {
			transition: none;
		}
	}
</style>
