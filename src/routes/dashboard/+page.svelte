<script lang="ts">
	import InkStamp from '#lib/components/InkStamp.svelte';
	import { MODULES } from '#lib/content/lessons.ts';
	import { progress, STATUS_LABEL } from '#lib/stores/progress.svelte.ts';
	import { openWindows } from '#lib/stores/os.svelte.ts';
	import { goto } from '$app/navigation';

	const pad = (n: number) => String(n).padStart(2, '0');

	/** Words that carry no name when a lesson becomes a file. */
	const NOISE = new Set([
		'AND', 'THE', 'OF', 'A', 'AN', 'TO', 'IN', 'ON', 'FOR', 'WITH', 'YOUR', 'YOU', 'FIRST', 'AT'
	]);

	/**
	 * The application name a module wears on the desktop: the week, then its first
	 * distinguishing word — W01_VARIABLES. The full title stays in the accessible
	 * name, so the file name is flavour without becoming the label a reader must decode.
	 * The extension is deliberately omitted: the desktop already implies it, and eight
	 * more characters are what pushed these labels onto a third line.
	 */
	const appName = (week: number, title: string) => {
		const word =
			title
				.toUpperCase()
				.replace(/[^A-Z0-9]+/g, ' ')
				.split(' ')
				.find((part) => part.length > 0 && !NOISE.has(part)) ?? 'LESSON';
		return `W${pad(week)}_${word}`;
	};

	// Selection is the desktop's own idea of a cursor: one tile at a time, and the
	// empty surface clears it. It is not progress and never leaves this page.
	let selected = $state<string | null>(null);

	/** Double-clicking a tile, or pressing Enter on it, opens the window. */
	function openLesson(slug: string): void {
		openWindows.currentLesson = slug;
		openWindows.isMinimized = false;
		void goto(`/lesson/${slug}`);
	}
</script>

<svelte:head>
	<title>Desktop — Index · Studio Py</title>
	<meta
		name="description"
		content="The module index for Studio Py, from the first variables drill to deployment, with reading time, track and local progress."
	/>
</svelte:head>

<!-- The dashboard IS the desktop: there is no page chrome of its own. The menu bar and
     the dock belong to the layout and never unmount, so this route only has to place
     the icons on the work surface. -->
<main class="desk">
	<!-- The empty surface is the deselect target. It sits under the content as a full-page
	     layer rather than a click handler on <main>, because every tile is an anchor and a
	     bubbled click would have to tell the two apart. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="surface" onclick={() => (selected = null)}></div>

	<h1 class="sr-only">Module index</h1>

	<ul class="icons">
		{#each MODULES as module, order (module.slug)}
			{@const status = progress.statusOf(module.slug)}
			{@const name = appName(module.week, module.title)}
			{@const cut = name.indexOf('_') + 1}
			<li style={`--index: ${order}`}>
				<a
					class="icon"
					class:done={status === 'completed'}
					class:active={status === 'in-progress'}
					class:selected={selected === module.slug}
					href={`/lesson/${module.slug}`}
					onclick={(event) => {
						// The layout's ink-portal listener runs in the capture phase, so a tile
						// marked `data-portal` would open before this handler could stop it.
						// Opening is deliberate here, so the tile opts out of the portal.
						event.preventDefault();
						selected = module.slug;
					}}
					onkeydown={(event) => {
						// The tile is an anchor, so Enter would follow the href straight away; the
						// desktop's rule is that opening is deliberate, so Enter opens the window
						// the same way a double click does.
						if (event.key !== 'Enter' && event.key !== ' ') return;
						event.preventDefault();
						openLesson(module.slug);
					}}
					ondblclick={() => openLesson(module.slug)}
				>
					<span class="glyph">
						<img
							src={`/icons/icons_v2/lessons/week${module.week}_icon.svg`}
							alt=""
							class="os-icon-img"
							width="80"
							height="80"
							draggable="false"
						/>
					</span>

					<!-- The name is one unbreakable token, so the only place a line may
					     break is the week separator. The `<wbr>` marks that opportunity;
					     without it every break falls mid-word (W02_CONDITIO / NALS). -->
					<span class="filename" aria-hidden="true"
						>{name.slice(0, cut)}<wbr />{name.slice(cut)}</span
					>
					<!-- The portal shutter reads the card's h2, and this is the icon's real
					     accessible name: the file name above is flavour, not the label. -->
					<h2 class="sr-only">{module.title}</h2>
					<span class="sr-only">{module.estimatedMinutes} minutes, {STATUS_LABEL[status]}</span>

					{#if status === 'completed'}
						<span class="stamp-slot"><InkStamp /></span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</main>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	/* The layout owns the blue wallpaper and grid; this route keeps its tiles clear
	   of the menu bar above and the dock below. The tile grid supplies its own padding. */
	.desk {
		position: absolute;
		inset: 0;
		box-sizing: border-box;
		padding: 0 0 calc(var(--mac-dock-gutter) - var(--mac-menubar-h));
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: none;
	}

	.desk::-webkit-scrollbar {
		display: none;
	}

	/* The deselect target. It covers the desktop below the content layer, so a click on
	   empty yellow reaches it and a click on a tile reaches the tile. */
	.surface {
		position: fixed;
		inset: 0;
		z-index: 0;
	}

	/* ---- the icon grid --------------------------------------------------------------- */

	/* A macOS desktop packs its icons in columns from the top-left, at a fixed tile
	   width, rather than stretching them to fill the surface. The track is wide enough
	   for the longest module word (`ARCHITECTURE` measures 98px at 13px) plus the tile's
	   horizontal padding, so no label has to break inside a word. */
	.icons {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
		gap: 24px;
		padding: 40px;
		align-content: start;
		justify-content: start;
		margin: 0;
		list-style: none;
	}

	/* The tiles land one after another, thirty milliseconds apart in grid order. The
	   backwards fill keeps each one clear until its own turn comes. */
	.icons li {
		min-width: 0;
		animation: icon-enter 250ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
		animation-delay: calc(var(--index) * 30ms);
	}

	@keyframes icon-enter {
		from {
			opacity: 0;
			transform: scale(0.8) translateY(8px);
		}
	}

	/* One tile: the icon above, the file name below, and a rounded selection behind
	   both. Nothing else paints — no frame, no border, no box. */
	.icon {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 6px 4px;
		border-radius: 8px;
		color: #1d1d1f;
		text-decoration: none;
		text-align: center;
		transition: background-color var(--duration-1) var(--ease-standard);
	}

	.glyph {
		position: relative;
		display: block;
		width: 80px;
		height: 80px;
		/* The Aqua plates are pixel art; the tile renders them at 80px so the 2px blocks
		   land on whole device pixels and stay square at the larger size. */
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
		transition:
			transform 120ms var(--ease-standard),
			filter 120ms var(--ease-standard);
	}

	/* A tile is a physical object: it lifts toward the pointer and presses back down
	   under it. Only the sprite moves, so the label stays crisp and the selection plate
	   stays where it was drawn. */
	@media (hover: hover) {
		.icon:hover .glyph {
			transform: scale(1.08) translateY(-2px);
			filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
		}
	}

	.icon:active .glyph {
		transform: scale(0.96) translateY(0);
		transition-duration: 60ms;
	}

	/* The SVGs carry their own four-colour palette on a transparent ground, so they
	   stay untouched while the tile behind them is selected. Any filter here would
	   recolour the icon instead of the selection. */
	.os-icon-img {
		display: block;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
		-webkit-user-drag: none;
	}

	/* The label is a fixed block under the icon, so a long name wraps in place instead
	   of widening the tile and reflowing its neighbours. Two lines, never more: the name
	   may only break at the week separator (see the `<wbr>` in the tile), so a longer
	   module word takes a second line rather than an ellipsis that would hide which file
	   it is. */
	.filename {
		width: 100%;
		font-size: 13px;
		line-height: 1.25;
		text-align: center;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: normal;
		overflow-wrap: break-word;
		font-family: var(--mac-ui);
		color: #ffffff;
		/* White labels on a blue wallpaper need a dark halo to stay legible; this is the
		   inverse of the light halo macOS uses over pale desktops. */
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	/* The selection: one macOS blue, rounded, with the label inverted to white the way
	   Finder draws a selected file. */
	.icon.selected {
		background: var(--mac-blue);
	}

	.icon.selected .filename {
		color: #ffffff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.icon:focus-visible {
		outline: 2px solid var(--mac-blue);
		outline-offset: 2px;
	}

	/* An in-progress module wears a small running dot, not a green ring: the ring read
	   as a box around the sprite. */
	.icon.active .glyph::after {
		content: '';
		position: absolute;
		bottom: 32px;
		left: 50%;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-snake);
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
		transform: translateX(-50%);
	}

	.icon.done .glyph {
		opacity: 0.8;
	}

	.stamp-slot {
		position: absolute;
		top: 0;
		right: 0;
		transform: scale(0.55);
		transform-origin: top right;
		pointer-events: none;
	}

	@media (max-width: 640px) {
		/* Three fluid columns rather than three fixed 100px ones: the widest module word
		   (`ARCHITECTURE`) needs ~97px at 13px, and a fixed track leaves it nowhere to go
		   but a mid-word break. Fluid tracks keep the grid at three columns and hand every
		   tile the width the viewport can spare. */
		.icons {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 10px;
			padding: 16px;
		}

		.glyph {
			width: 64px;
			height: 64px;
		}

		.filename {
			width: auto;
			max-width: 100%;
			font-size: 12px;
		}
	}

	/* Below 360px a third column leaves each tile ~89px, which is narrower than the
	   longest name word; three columns there means breaking inside a word. Two wider
	   columns keep every name whole, which is what the label is for. */
	@media (max-width: 359px) {
		.icons {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}


	@media (prefers-reduced-motion: reduce) {
		.icons li {
			animation: none;
		}

		.icon,
		.glyph {
			transition: none;
		}

		.icon:hover .glyph,
		.icon:active .glyph {
			transform: none;
		}
	}
</style>
