<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import { NoToneMapping, PCFShadowMap } from 'three';
	import Monitor from '#lib/components/scene/Monitor.svelte';
	import InkStamp from '#lib/components/InkStamp.svelte';
	import RegistrationMarks from '#lib/components/RegistrationMarks.svelte';
	import SnakeSpine from '#lib/components/SnakeSpine.svelte';
	import { trackWaypoints } from '#lib/motion/trail.ts';
	import { MODULES } from '#lib/content/lessons.ts';
	import { lessonComponent } from '#lib/content/lessonModules.ts';
	import { sizeTier } from '#lib/content/chapters.ts';
	import AsciiOperator from '#lib/components/AsciiOperator.svelte';
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
	/** The machine half is the default; the print half is one switch away. */
	let crtMode = $state(true);
	/** Set only by the switch, so the scanlines flicker out on a toggle and not on first paint. */
	let flickering = $state(false);
	/** The 3D bezel is client-only; the CSS frame stands in for it on the server. */
	let mounted = $state(false);
	const CRT_STORAGE_KEY = 'studio-py:crt-mode';

	function toggleCrt(): void {
		crtMode = !crtMode;
		flickering = !crtMode;
		try {
			localStorage.setItem(CRT_STORAGE_KEY, String(crtMode));
		} catch {
			/* Storage can be blocked; the hardware switch still works for this visit. */
		}
	}

	// Reading the article is what marks a lesson opened; `complete()` is the
	// only explicit act, so the dashboard never overstates progress.
	onMount(() => {
		mounted = true;
		try {
			crtMode = localStorage.getItem(CRT_STORAGE_KEY) !== 'false';
		} catch {
			/* Storage can be blocked; the machine default applies. */
		}
		if (progress.statusOf(module.slug) === 'not-started') progress.set(module.slug, 'in-progress');

		const stopTrail = trail && article ? trackWaypoints(trail, article, (percent) => (waypoint = percent)) : undefined;
		return () => {
			stopTrail?.();
			delete document.documentElement.dataset.crt;
		};
	});

	// The mode lives on `<html>` so the header, the body paper, the editor and the sandbox
	// all read one switch; the inline script in app.html sets it before first paint.
	$effect(() => {
		document.documentElement.dataset.crt = crtMode ? 'on' : 'off';
	});

	function toggleComplete(): void {
		progress.set(module.slug, status === 'completed' ? 'not-started' : 'completed');
	}
</script>

<svelte:head>
	<title>{module.title} — Studio Py</title>
	<meta name="description" content={module.summary} />
</svelte:head>

<div
	class="crt-scan"
	class:on={crtMode}
	class:flicker={flickering}
	onanimationend={() => (flickering = false)}
	aria-hidden="true"
></div>

{#if crtMode}
	<div class="screen-bg" aria-hidden="true"></div>
	<div class="bezel-layer" aria-hidden="true">
		{#if mounted}
			<Canvas renderMode="on-demand" toneMapping={NoToneMapping} shadows={PCFShadowMap} dpr={[1, 2]}>
				<World autoStart={false} gravity={[0, 0, 0]}>
					<Monitor />
				</World>
			</Canvas>
		{/if}
	</div>
	<div class="glass-layer" aria-hidden="true"></div>
{/if}

<div class="lesson-content" class:crt={crtMode}>
{#if crtMode}
	<AsciiOperator />
{/if}
<main class="reader" class:crt={crtMode}>
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
				<button
					class="crt-switch"
					type="button"
					role="switch"
					aria-checked={crtMode}
					aria-label="CRT mode"
					onclick={toggleCrt}
				>
					<span class="crt-label">CRT MODE:</span>
					<span class="pos" class:active={crtMode}>[ ON ]</span>
					<span class="pos" class:active={!crtMode}>[ OFF ]</span>
				</button>
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
			<span class="plus tl" aria-hidden="true"></span>
			<span class="plus tr" aria-hidden="true"></span>
			<span class="plus bl" aria-hidden="true"></span>
			<span class="plus br" aria-hidden="true"></span>

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

<style>
	/* ---- The machine half ------------------------------------------------------------
	   The mode is a switch on <html>, so the header, body paper, editor and sandbox all
	   read the same palette. ON is a 1970s mainframe terminal; OFF is the printed page. */
	:global(:root[data-crt='on'][data-theme]) {
		color-scheme: dark;
		--color-paper: #0a0a0a;
		--color-ink: #e0e0e0;
		--color-tertiary: #a8a8a8;
		--color-muted: var(--color-tertiary);
		--color-line-faint: rgba(224, 224, 224, 0.16);
		--code-inline-bg: #1c1c1c;
		--syntax-keyword: #e0e0e0;
		--syntax-builtin: #33ff00;
		--syntax-string: #a8a8a8;
		--syntax-function: #e0e0e0;
		--syntax-number: #33ff00;
		--syntax-comment: #777777;
	}

	:global(:root[data-crt='off'][data-theme]) {
		color-scheme: light;
		--color-paper: #f1f1f1;
		--color-ink: #000000;
		--color-tertiary: #5a595e;
		--color-muted: var(--color-tertiary);
		--color-line-faint: rgba(0, 0, 0, 0.14);
		--code-inline-bg: #e5e5e5;
		--syntax-keyword: #000000;
		--syntax-builtin: #005c8c;
		--syntax-string: #005c8c;
		--syntax-function: #000000;
		--syntax-number: #005c8c;
		--syntax-comment: #828282;
	}

	/* A monitor warming up or cooling down: paper, ink and scanlines move together. */
	:global(html[data-crt] body),
	:global(html[data-crt] .site-head),
	.reader,
	.sheet {
		transition: all 0.2s ease-out;
	}

	/* The scanlines are the screen's own life: a fixed raster that drifts slowly. */
	.crt-scan {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0 2px,
			rgba(0, 0, 0, 0.15) 2px 4px
		);
		background-size: 100% 8px;
		opacity: 0;
		pointer-events: none;
		transition: all 0.2s ease-out;
	}

	.crt-scan.on {
		opacity: 1;
		animation: scan-drift 6s linear infinite;
	}

	/* Switching off is a tube losing power, not a fade: a few hard flickers, then dark. */
	.crt-scan.flicker {
		animation: crt-flicker 360ms steps(1, end) forwards;
	}

	@keyframes scan-drift {
		to {
			background-position: 0 8px;
		}
	}

	@keyframes crt-flicker {
		0% {
			opacity: 1;
		}
		20% {
			opacity: 0.25;
		}
		40% {
			opacity: 0.9;
		}
		60% {
			opacity: 0.1;
		}
		80% {
			opacity: 0.5;
		}
		100% {
			opacity: 0;
		}
	}

	/* ---- The chassis ------------------------------------------------------------------
	   The monitor is permanent chrome fixed to the viewport; the lesson scrolls natively
	   beneath it, so the sticky console and the window scroll stay on the fast path. The
	   screen tint sits behind the text, the glass over it, the 3D bezel over both, and
	   below the site header. */
	.screen-bg,
	.bezel-layer,
	.glass-layer {
		--bezel-w: clamp(24px, 5vw, 72px);
		position: fixed;
		inset: var(--head-h) 0 0;
		pointer-events: none;
	}

	.screen-bg {
		z-index: 0;
		background: radial-gradient(ellipse at center, #0b2c18 0%, #02100a 60%, #0a0a0a 100%);
	}

	/* The gradient frame is the server-rendered stand-in until the 3D bezel mounts. */
	.bezel-layer :global(div),
	.bezel-layer :global(canvas) {
		background: transparent;
	}

	.bezel-layer {
		z-index: 2;
		box-shadow: inset 0 0 0 var(--bezel-w) #2e2d28;
	}

	/* The glass fills the screen hole, above the bezel, so its outer glow lands on the lip:
	   the text appears to light the plastic around it. */
	.glass-layer {
		inset: calc(var(--head-h) + var(--bezel-w)) var(--bezel-w) var(--bezel-w);
		z-index: 3;
		border-radius: 6% / 8%;
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.4) 0px,
			rgba(0, 0, 0, 0.4) 1px,
			transparent 1px,
			transparent 3px
		);
		box-shadow:
			inset 0 0 150px rgba(0, 0, 0, 1),
			0 0 40px rgba(51, 255, 0, 0.1);
		backdrop-filter: brightness(1.05);
	}

	/* The vignette darkens the corners; the glare is a fluorescent reflection. */
	.glass-layer::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.7) 100%);
	}

	.glass-layer::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
	}

	.lesson-content {
		position: relative;
		z-index: 1;
	}

	.lesson-content.crt {
		padding: 12vh 10vw;
	}

	.reader {
		position: relative;
		z-index: 1;
	}

	.reader.crt {
		padding: 0;
	}

	/* ---- The phosphor ----------------------------------------------------------------
	   Bloom and fringing belong to headers and controls. Reading text and code stay
	   still, soft and unglowing so a lesson can be read for fifteen minutes. */
	:global(:root[data-crt='on'][data-theme]) {
		--font-body: 'Share Tech Mono', 'Courier Prime', 'Courier Prime Fallback', ui-monospace, Menlo, monospace;
		--font-mono: 'Share Tech Mono', 'Courier Prime', 'Courier Prime Fallback', ui-monospace, Menlo, monospace;
		--editor-surface: #051a05;
		--editor-ink: #e0ffe0;
		--syntax-keyword: #e0ffe0;
		--syntax-function: #e0ffe0;
		--syntax-string: #9be89b;
		--syntax-comment: #5f9a5f;
	}

	/* Reading text and code: pale phosphor white, a tight crisp glow, no bloom, no fringing.
	   Pure green is kept for headers, frames and bloom. */
	.reader.crt .prose {
		color: #e0ffe0;
		line-height: 1.55;
		text-shadow: 0 0 2px rgba(51, 255, 0, 0.4);
	}

	/* Headers: a white-hot core with a tight halo; the wide bloom is a blurred green copy
	   behind it, read from `data-text`, so the light bleeds without softening a glyph. */
	.reader.crt h1,
	.reader.crt .prose :global(h2) {
		position: relative;
		isolation: isolate;
		z-index: 1;
		font-family: var(--font-pixel);
		font-weight: 400;
		letter-spacing: 0;
		color: #e6ffe6;
		text-shadow:
			0 0 2px #a3ffa3,
			0 0 4px #00ff00;
	}

	.reader.crt h1::after,
	.reader.crt .prose :global(h2)::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: -1;
		color: #00ff00;
		filter: blur(8px);
		opacity: 0.8;
		mix-blend-mode: screen;
		pointer-events: none;
		user-select: none;
	}

	.reader.crt .prose :global(h2)::after {
		top: 10px;
	}

	.reader.crt h1 {
		font-size: calc(var(--display) * 1.3);
		line-height: 0.85;
	}

	.reader.crt .prose :global(h2) {
		font-size: clamp(40px, 4.6vw, 72px);
		line-height: 0.9;
	}

	.reader.crt .stamp,
	.reader.crt .signoff-label,
	.reader.crt .dir,
	.reader.crt .prose :global(.trap .trap-head) {
		font-family: var(--font-pixel);
		font-size: 1.5rem;
		letter-spacing: 0.1em;
	}

	/* ---- The hardware switch ---------------------------------------------------------- */
	.crt-switch {
		display: inline-flex;
		margin: 0 0 24px;
		align-items: stretch;
		gap: 0;
		padding: 0;
		border: 3px solid #0b0b0b;
		border-radius: 4px;
		background: #1f1f1f;
		box-shadow:
			inset 0 4px 8px rgba(0, 0, 0, 0.8),
			inset 0 -2px 0 rgba(255, 255, 255, 0.1),
			0 4px 0 #000,
			0 6px 10px rgba(0, 0, 0, 0.6);
		font-family: var(--font-pixel);
		font-size: 1.6rem;
		line-height: 1;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #cfcfcf;
		cursor: pointer;
		transition:
			transform 60ms linear,
			box-shadow 60ms linear;
	}

	/* Pressed into the bezel: it drops, and the light moves from outside to inside. */
	.crt-switch:active {
		transform: translateY(2px);
		box-shadow:
			inset 0 -4px 8px rgba(0, 0, 0, 0.8),
			inset 0 2px 0 rgba(255, 255, 255, 0.08),
			0 1px 0 #000,
			0 2px 4px rgba(0, 0, 0, 0.6);
	}

	.crt-switch .crt-label,
	.crt-switch .pos {
		padding: 0.7rem 1.1rem;
	}

	.crt-switch .crt-label {
		border-right: 2px solid #0b0b0b;
	}

	.crt-switch .pos {
		opacity: 0.55;
	}

	.crt-switch .pos.active {
		background: #f1f1f1;
		color: #0a0a0a;
		font-weight: 400;
		opacity: 1;
	}

	:global(html[data-crt='on']) .crt-switch .pos.active {
		background: #33ff00;
		box-shadow: 0 0 8px rgba(51, 255, 0, 0.6);
	}

	.crt-switch:focus-visible {
		outline: 2px solid #33ff00;
		outline-offset: 4px;
	}

	/* Controls on the machine half: phosphor on black, inverted when pressed. */
	.reader.crt .complete {
		border: 2px solid #33ff00;
		background: transparent;
		font-family: var(--font-pixel);
		font-size: 1.7rem;
		color: #33ff00;
		text-shadow:
			0 0 5px rgba(51, 255, 0, 0.9),
			0 0 15px rgba(51, 255, 0, 0.6),
			0 0 30px rgba(51, 255, 0, 0.3);
	}

	.reader.crt .complete:hover,
	.reader.crt .complete:focus-visible,
	.reader.crt .complete.on {
		background: #33ff00;
		color: #0a0a0a;
		text-shadow: none;
	}

	.reader.crt .complete.on:hover,
	.reader.crt .complete.on:focus-visible {
		background: transparent;
		color: #33ff00;
		text-shadow:
			0 0 5px rgba(51, 255, 0, 0.9),
			0 0 15px rgba(51, 255, 0, 0.6),
			0 0 30px rgba(51, 255, 0, 0.3);
	}

	.reader.crt .pager .dir {
		color: #33ff00;
		text-shadow:
			0 0 5px rgba(51, 255, 0, 0.9),
			0 0 15px rgba(51, 255, 0, 0.6),
			0 0 30px rgba(51, 255, 0, 0.3);
	}

	/* The instrument panel: no keylines. Each sub-system is a dark well sunk into the glass,
	   edged by a molded-plastic outline and divided from its neighbour by a gutter. The
	   narrative well is a grid-spanning layer behind the heading and the body. */
	.reader.crt .prose :global(.chapter.split) {
		column-gap: 2rem;
	}

	.reader.crt .prose :global(.chapter)::before {
		content: '';
		grid-area: 1 / 1 / 3 / 2;
		align-self: stretch;
		justify-self: stretch;
		z-index: 0;
		background: #030a03;
		outline: 2px solid #0a150a;
		border-radius: 8px;
		box-shadow:
			inset 0 4px 15px rgba(0, 0, 0, 0.9),
			inset 0 0 2px rgba(0, 0, 0, 1);
	}

	.reader.crt .prose :global(.chapter .pin),
	.reader.crt .prose :global(.chapter .chapter-body) {
		position: relative;
		z-index: 1;
		padding: 0 20px;
	}

	.reader.crt .prose :global(.chapter .chapter-body) {
		align-self: stretch;
		margin-bottom: 0;
		padding-bottom: 20px;
	}

	.reader.crt .prose :global(.chapter .pin-inner) {
		margin: 0 0 12px;
	}

	.reader.crt .prose :global(.chapter .console-slot) {
		box-sizing: border-box;
		margin-top: 0;
		padding: 0 20px 20px;
		overflow-y: auto;
		background: #030a03;
		outline: 2px solid #0a150a;
		border-radius: 8px;
		box-shadow:
			inset 0 4px 15px rgba(0, 0, 0, 0.9),
			inset 0 0 2px rgba(0, 0, 0, 1);
	}

	.reader.crt .prose :global(.chapter .pin)::before,
	.reader.crt .prose :global(.chapter .console-slot)::before {
		content: '> SYSTEM.LOG: NARRATIVE';
		display: block;
		margin: 0 -20px 20px;
		padding: 0.35rem 20px;
		border-radius: 8px 8px 0 0;
		background: rgba(51, 255, 0, 0.08);
		font-family: var(--font-pixel);
		font-size: 1.25rem;
		line-height: 1.2;
		letter-spacing: 0.1em;
	}

	.reader.crt .prose :global(.chapter .console-slot)::before {
		content: '> SYSTEM.LOG: EXECUTION';
		position: sticky;
		top: 0;
		z-index: 5;
		flex: 0 0 auto;
		margin-bottom: 0;
		background: #0a1f0a;
	}

	.reader.crt .prose :global(.chapter .console-slot.telemetry)::before {
		content: '> SYSTEM.LOG: TELEMETRY';
	}

	.reader.crt .prose :global(.console-slot > .exercise:only-child) {
		margin-top: 0;
	}

	.reader.crt .prose :global(.console-slot .scene-col) {
		background: #030a03;
	}

	.reader.crt .prose :global(.chapter .spine) {
		display: none;
	}

	/* The console and editor are recessed into the screen: a dark well inside, a phosphor
	   ring outside. The well is drawn on an overlay because the editor and canvas paint
	   their own backgrounds over an inset shadow on the box. */
	.reader.crt .prose :global(.editor-wrapper),
	.reader.crt .prose :global(.console-slot .sandbox-embed .frame) {
		position: relative;
		border: 0;
		background: #051a05;
		box-shadow: 0 0 0 2px #33ff00;
	}

	.reader.crt .prose :global(.editor-wrapper)::after,
	.reader.crt .prose :global(.console-slot .sandbox-embed .frame)::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 3;
		box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.9);
		pointer-events: none;
	}

	@media (max-width: 700px) {
		.lesson-content.crt {
			padding-inline: 6vw;
		}
	}

	/* The trap: a hazard label, thick amber on both palettes. */
	.prose :global(.trap) {
		max-width: 100ch;
		margin: 28px 0 16px;
		border: 4px solid #ffb000;
		border-top: 0;
		background: rgba(255, 176, 0, 0.05);
	}

	/* Black and amber hazard stripe on the top edge only; the body stays a plain tint. */
	.prose :global(.trap)::before {
		content: '';
		display: block;
		height: 6px;
		margin: 0 -4px;
		background: repeating-linear-gradient(135deg, #ffb000 0 10px, #0a0a0a 10px 20px);
	}

	/* Copy inside the box is pure white on the dark screen (WCAG AA); the amber border and
	   tint carry the warning. On the ivory print page white would vanish, so it is ink. */
	:global(html[data-crt='on']) .prose :global(.trap) {
		color: #ffffff;
	}

	.prose :global(.trap .trap-head) {
		margin: 0;
		padding: 0.6rem 1.2rem;
		border-bottom: 4px solid #ffb000;
		font-family: var(--font-mono);
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.6;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: inherit;
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
