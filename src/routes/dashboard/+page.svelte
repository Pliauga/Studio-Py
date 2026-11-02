<script lang="ts">
	import InkStamp from '#lib/components/InkStamp.svelte';
	import { MODULES } from '#lib/content/lessons.ts';
	import { progress, STATUS_LABEL } from '#lib/stores/progress.svelte.ts';
	import { openWindows } from '#lib/stores/os.svelte.ts';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const pad = (n: number) => String(n).padStart(2, '0');

	type FilterId = 'all' | 'started' | 'unstarted' | 'ops' | 'data' | 'web';

	const FILTERS: { id: FilterId; label: string }[] = [
		{ id: 'all', label: 'all' },
		{ id: 'started', label: 'started' },
		{ id: 'unstarted', label: 'unstarted' },
		{ id: 'ops', label: 'ops' },
		{ id: 'data', label: 'data' },
		{ id: 'web', label: 'web' }
	];

	const isFilter = (value: string | null): value is FilterId =>
		FILTERS.some((entry) => entry.id === value);

	/** Words that carry no name when a lesson becomes a file. */
	const NOISE = new Set([
		'AND', 'THE', 'OF', 'A', 'AN', 'TO', 'IN', 'ON', 'FOR', 'WITH', 'YOUR', 'YOU', 'FIRST', 'AT'
	]);

	/**
	 * The executable name a module wears on the desktop: the week, then its first
	 * distinguishing word — W01_VARIABLES.exe. The full title stays in the accessible
	 * name, so the file name is flavour without becoming the label a reader must decode.
	 */
	const exeName = (week: number, title: string) => {
		const word =
			title
				.toUpperCase()
				.replace(/[^A-Z0-9]+/g, ' ')
				.split(' ')
				.find((part) => part.length > 0 && !NOISE.has(part)) ?? 'LESSON';
		return `W${pad(week)}_${word}.exe`;
	};

	const completedCount = $derived(
		MODULES.filter((module) => progress.statusOf(module.slug) === 'completed').length
	);

	/**
	 * The window's file name. It must read the same in the taskbar tab and in the lesson's
	 * own title bar, so the two build it the same way: the week, then the whole title.
	 */
	const windowName = (week: number, title: string) =>
		`W${pad(week)}_${title
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, '_')
			.replace(/^_|_$/g, '')}.exe`;

	// The taskbar shows what is open, the way a real one does: only the modules the
	// reader has actually begun, newest last.
	const inFlight = $derived(
		MODULES.filter((module) => progress.statusOf(module.slug) === 'in-progress')
	);

	const readFilter = (url: { searchParams: { get(name: string): string | null } }): FilterId => {
		const value = url.searchParams.get('filter');
		return isFilter(value) ? value : 'all';
	};

	// The URL is the only place the filter is remembered, so a reload and a shared
	// link land on the same view; the back button resyncs through afterNavigate.
	let filter = $state<FilterId>(readFilter(page.url));

	afterNavigate(({ to }) => {
		if (!to) return;
		const next = readFilter(to.url);
		if (next !== filter) filter = next;
	});

	const matches = (module: (typeof MODULES)[number]) => {
		if (filter === 'all') return true;

		const status = progress.statusOf(module.slug);
		if (filter === 'started') return status !== 'not-started';
		if (filter === 'unstarted') return status === 'not-started';
		return module.track === filter;
	};

	const visible = $derived(MODULES.filter(matches));

	let radios: HTMLButtonElement[] = [];

	function select(id: FilterId) {
		if (id === filter) return;

		// shallow: the filter is client state, so there is nothing to load and no
		// reason to reset scroll or focus.
		void goto(id === 'all' ? '/dashboard' : `/dashboard?filter=${id}`, {
			replace: true,
			shallow: true
		});
	}

	// Roving tabindex: the filter row is one tab stop, arrows move within it.
	function onFilterKey(event: KeyboardEvent, index: number) {
		const last = FILTERS.length - 1;
		let target: number | null = null;

		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = index === last ? 0 : index + 1;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = index === 0 ? last : index - 1;
		else if (event.key === 'Home') target = 0;
		else if (event.key === 'End') target = last;

		if (target === null) return;

		event.preventDefault();
		const id = FILTERS[target].id;
		select(id);
		radios[target]?.focus();
	}

	// The system clock is client-only: the server cannot know the reader's time, and a
	// guessed value would flash a wrong time before hydration corrected it.
	let now = $state('');
	onMount(() => {
		const tick = () =>
			(now = new Date().toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			}));
		tick();
		const id = window.setInterval(tick, 15_000);
		return () => window.clearInterval(id);
	});

	// Selection is the desktop's own idea of a cursor: one tile at a time, and the
	// empty surface clears it. It is not progress and never leaves this page.
	let selected = $state<string | null>(null);

	function openLesson(slug: string): void {
		openWindows.currentLesson = slug;
		openWindows.isMinimized = false;
		void goto(`/lesson/${slug}`);
	}

	/** The taskbar tab: the one window the desktop believes is open, if any. */
	const openModule = $derived(
		openWindows.currentLesson
			? MODULES.find((entry) => entry.slug === openWindows.currentLesson)
			: undefined
	);
</script>

<svelte:head>
	<title>Desktop — Index · Studio Py</title>
	<meta
		name="description"
		content="The module index for Studio Py, from the Week 0 setup check to deployment, with reading time, track and local progress."
	/>
</svelte:head>

<!-- `data-warp` is set by the splash transition: the layout's page fade is off so the
     desktop sits fully opaque under the black layer, and the snake stays hidden until
     it has docked into `.snake-idle`. -->
<main class="desktop">
	<!-- The empty surface is the deselect target. It sits under the content as a full-page
	     layer rather than a click handler on <main>, because every tile is an anchor and a
	     bubbled click would have to tell the two apart. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="surface" onclick={() => (selected = null)}></div>

	<div class="filters" role="radiogroup" aria-label="Filter the index">
		<span class="filters-label" aria-hidden="true">show</span>
		{#each FILTERS as entry, index (entry.id)}
			<button
				type="button"
				role="radio"
				class="filter"
				class:on={filter === entry.id}
				aria-checked={filter === entry.id}
				tabindex={filter === entry.id ? 0 : -1}
				bind:this={radios[index]}
				onclick={() => select(entry.id)}
				onkeydown={(event) => onFilterKey(event, index)}
			>
				<span class="bracket" aria-hidden="true">[</span> {entry.label}
				<span class="bracket" aria-hidden="true">]</span>
			</button>
		{/each}
	</div>

	<h1 class="sr-only">Module index</h1>

	<!-- The warp transition on the landing page docks into this node by selector. -->
	<span class="snake-idle" aria-hidden="true"></span>

	<ul class="icons">
		{#each visible as module (module.slug)}
			{@const status = progress.statusOf(module.slug)}
			<li>
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
							src={`/icons/week${module.week}_icon.svg`}
							alt=""
							class="os-icon-img"
							width="64"
							height="64"
							draggable="false"
						/>
					</span>

					<span class="filename" aria-hidden="true">{exeName(module.week, module.title)}</span>
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

		{#if visible.length === 0}
			<li class="void">
				<p>No modules in this filter yet.</p>
				<button type="button" class="void-reset" onclick={() => select('all')}>
					show all {MODULES.length}
				</button>
			</li>
		{/if}
	</ul>

	<footer class="taskbar">
		<a class="brand" href="/dashboard">🐍 STUDIO_PY</a>

		<button type="button" class="start" onclick={() => select('all')}>
			<span class="start-mark" aria-hidden="true">
				<svg viewBox="0 0 16 16" shape-rendering="crispEdges">
					<rect x="2" y="2" width="5" height="5" />
					<rect x="9" y="2" width="5" height="5" />
					<rect x="2" y="9" width="5" height="5" />
					<rect x="9" y="9" width="5" height="5" />
				</svg>
			</span>
			START
		</button>

		<div class="tasks">
			{#if openModule}
				<!-- The open window is the desktop's running app: the tab brings it back up
				     after a minimise, and it is the only thing that can restore it. -->
				<button
					type="button"
					class="task task-window"
					class:minimized={openWindows.isMinimized}
					title="Restore {openModule.title}"
					onclick={() => openLesson(openModule.slug)}
				>
					[ {windowName(openModule.week, openModule.title)} ]
				</button>
			{/if}

			<ul class="tasks-progress" aria-label="Modules in progress">
				{#each inFlight as module (module.slug)}
					<li>
						<a class="task" href={`/lesson/${module.slug}`} data-portal data-week={module.week}>
							{exeName(module.week, module.title)}
						</a>
					</li>
				{:else}
					<li class="tasks-idle">{pad(completedCount)} / {pad(MODULES.length)} complete</li>
				{/each}
			</ul>
		</div>

		<p class="clock">
			<span class="sr-only">Current time </span>{now || '--:--'}
		</p>
	</footer>
</main>

<style>
	:global(html[data-warp]) :global(.page) {
		animation: none;
	}

	:global(html[data-warp='cover']) .snake-idle,
	:global(html[data-warp='dock']) .snake-idle {
		visibility: hidden;
	}

	:global(html[data-warp]:not([data-warp='cover'])) .icons li {
		animation: icon-in var(--duration-2) var(--ease-standard) backwards;
	}

	@keyframes icon-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

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

	/* The desktop is a surface, not a document: the icons sit directly on it. The site
	   header is fixed and a sibling of this page, so the surface starts below it. The
	   dot grid is the workspace itself — faint enough to read over, regular enough that
	   the icons look placed rather than floated. */
	.desktop {
		--task-h: 44px;
		position: relative;
		min-height: calc(100svh - var(--head-h));
		padding: var(--head-h) clamp(16px, 3vw, 40px) calc(var(--task-h) + clamp(24px, 4vh, 48px));
		font-family: var(--font-mono);
		background-image: radial-gradient(rgba(0, 0, 0, 0.14) 1px, transparent 1px);
		background-size: 20px 20px;
	}

	/* The deselect target. It covers the desktop below the content layer, so a click on
	   empty yellow reaches it and a click on a tile reaches the tile. */
	.surface {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	/* Lifted above the surface so tiles and filters keep their own clicks. */
	.filters,
	.icons {
		position: relative;
		z-index: 1;
	}

	/* The wordmark lives in the taskbar now, so it inherits that bar's type scale. */
	.brand {
		flex: none;
		color: inherit;
		text-decoration: none;
		font-family: var(--font-pixel);
		font-size: 1.15rem;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	.brand:hover,
	.brand:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.25em;
	}

	/* ---- filters, as desktop chrome -------------------------------------------------- */

	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem 1.1rem;
		padding: 1.2rem 0 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.filters-label {
		color: var(--color-muted);
	}

	.filter {
		padding: 0.15rem 0.1rem;
		border: 0;
		background: none;
		font: inherit;
		color: var(--color-muted);
		cursor: pointer;
	}

	.filter .bracket {
		opacity: 0.45;
	}

	.filter:hover {
		color: var(--color-ink);
	}

	.filter.on {
		color: var(--color-ink);
	}

	.filter.on .bracket {
		opacity: 1;
	}

	.filter:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	/* ---- the icon grid --------------------------------------------------------------- */

	.icons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: clamp(4px, 1vw, 10px);
		margin: 0;
		padding: clamp(16px, 3vh, 32px) 0;
		list-style: none;
	}

	.icons li {
		min-width: 0;
	}

	.icon {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.55rem;
		padding: 1rem 0.5rem;
		color: inherit;
		text-decoration: none;
		text-align: center;
		/* Two frames, not a fade: the desktop steps between states like a machine. */
		transition:
			background-color 0.08s steps(2, end),
			color 0.08s steps(2, end);
	}

	.glyph {
		display: block;
		width: clamp(40px, 4.4vw, 54px);
		height: clamp(40px, 4.4vw, 54px);
	}

	/* The Argon plates carry their own four-colour palette on transparency, so they
	   stay untouched while the tile behind them inverts. Any filter here would
	   recolour the icons instead of the frame. */
	.os-icon-img {
		display: block;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
		-webkit-user-drag: none;
	}

	.filename {
		font-family: var(--font-terminal);
		font-size: 0.8rem;
		line-height: 1.25;
		letter-spacing: 0.02em;
		overflow-wrap: anywhere;
	}

	/* Hovering an icon inverts the whole tile: ink ground, paper type. */
	@media (hover: hover) {
		.icon:hover {
			background: var(--color-ink);
			color: var(--color-paper);
		}
	}

	.icon:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: -2px;
	}

	/* The in-progress module wears a marker, since an icon has no room for a status line. */
	.icon.active .glyph {
		box-shadow: 0 0 0 2px var(--color-snake);
	}

	/* A selected tile is a highlighted file: inverted, with the ink frame pulled tight
	   around it so the selection is legible next to a hovered neighbour. */
	.icon.selected {
		background: var(--color-ink);
		color: var(--color-paper);
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	.icon.done .glyph {
		opacity: 0.72;
	}

	.stamp-slot {
		position: absolute;
		top: 2px;
		right: 2px;
		transform: scale(0.62);
		transform-origin: top right;
		pointer-events: none;
	}

	.void {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.8rem 1.6rem;
		padding: clamp(18px, 2.4vw, 26px) 0;
		font-size: 0.8125rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.void p {
		margin: 0;
	}

	.void-reset {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: var(--color-ink);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	/* ---- the taskbar ------------------------------------------------------------------ */

	/* Pinned to the bottom of the viewport, above the page content, so the desktop reads
	   as a running system rather than a document with a footer. */
	.taskbar {
		position: fixed;
		inset: auto 0 0 0;
		z-index: 3;
		display: flex;
		align-items: center;
		gap: clamp(8px, 1.4vw, 18px);
		height: var(--task-h);
		padding: 0 clamp(10px, 2vw, 20px);
		border-top: 2px solid var(--color-ink);
		background: var(--color-paper);
		font-family: var(--font-terminal);
		font-size: 0.8rem;
		letter-spacing: 0.04em;
	}

	.start {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		flex: none;
		padding: 0.25rem 0.7rem;
		border: 2px solid var(--color-ink);
		background: var(--color-paper);
		color: var(--color-ink);
		font: inherit;
		font-weight: bold;
		letter-spacing: 0.08em;
		cursor: pointer;
	}

	.start:hover,
	.start:focus-visible {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.start:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	.start-mark {
		display: block;
		width: 0.85rem;
		height: 0.85rem;
	}

	.start-mark svg {
		display: block;
		width: 100%;
		height: 100%;
		fill: currentColor;
	}

	/* The open-window strip. It scrolls sideways rather than wrapping, so the bar keeps a
	   fixed height however many modules the reader has started. */
	.tasks {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1;
		min-width: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tasks::-webkit-scrollbar {
		display: none;
	}

	.task {
		display: block;
		max-width: 18rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid color-mix(in srgb, var(--color-ink) 45%, transparent);
		color: inherit;
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.task:hover,
	.task:focus-visible {
		background: var(--color-ink);
		color: var(--color-paper);
	}

	.task:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	.tasks-idle {
		color: var(--color-muted);
		white-space: nowrap;
	}

	.taskbar .clock {
		flex: none;
		margin: 0;
		font-size: 1rem;
		letter-spacing: 0.08em;
		font-variant-numeric: tabular-nums;
	}

	/* The open window is a button, not a link: pressing it re-enters the window rather
	   than asking the router for a fresh page. */
	.task-window {
		flex: none;
		background: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.tasks-progress {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* A minimised window keeps its tab but reads as recessed, so the bar shows the app is
	   still running without competing with the one on screen. */
	.task-window.minimized {
		border-style: dashed;
		color: var(--color-muted);
	}

	.snake-idle {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 48px;
		height: 48px;
		background: var(--color-snake);
		pointer-events: none;
	}

	@media (max-width: 620px) {
		.brand {
			font-size: 1rem;
		}

		.icons {
			grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		}

		.tasks-idle {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.icons li {
			animation: none;
		}

		.icon,
		.icon:hover {
			transition: none;
		}
	}
</style>
