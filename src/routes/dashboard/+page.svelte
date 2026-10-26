<script lang="ts">
	import InkStamp from '#lib/components/InkStamp.svelte';
	import RegistrationMarks from '#lib/components/RegistrationMarks.svelte';
	import SnakeSpine from '#lib/components/SnakeSpine.svelte';
	import { MODULES } from '#lib/content/lessons.ts';
	import { markStyle } from '#lib/content/marks.ts';
	import w00 from '../../../static/marks/w00.svg?raw';
	import { progress, STATUS_LABEL } from '#lib/stores/progress.svelte.ts';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';

	const pad = (n: number) => String(n).padStart(2, '0');
	/** Minutes as hours:minutes, so the route clock reads like a schedule. */
	const clock = (minutes: number) => `${Math.floor(minutes / 60)}:${pad(minutes % 60)}`;

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

	// Every module carries the cost of everything before it: the index is one
	// route, not twenty-five separate errands.
	let elapsed = 0;
	const ROUTE = MODULES.map((module) => {
		elapsed += module.estimatedMinutes;
		return { ...module, tplus: elapsed };
	});

	const TOTAL_MINUTES = elapsed;
	const [START, ...REST] = ROUTE;

	const completedCount = $derived(
		MODULES.filter((module) => progress.statusOf(module.slug) === 'completed').length
	);
	const percent = $derived(
		MODULES.length === 0 ? 0 : Math.round((completedCount / MODULES.length) * 100)
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

	const matches = (module: (typeof ROUTE)[number]) => {
		if (filter === 'all') return true;

		const status = progress.statusOf(module.slug);
		if (filter === 'started') return status !== 'not-started';
		if (filter === 'unstarted') return status === 'not-started';
		return module.track === filter;
	};

	const visible = $derived(REST.filter(matches));
	// One module earns the expanded row: the next one in line, and only in the
	// unfiltered view, where "next" still means next.
	const nextSlug = $derived(
		REST.find((module) => progress.statusOf(module.slug) !== 'completed')?.slug ?? null
	);
	const expandedSlug = $derived(filter === 'all' ? nextSlug : null);
	// The expanded card spans two columns, so the drawing ends with three empty cells.
	// They are filled by a printed end plate, never by exposed grid ink.
	const endSpan = $derived(
		filter === 'all' && (visible.length + (expandedSlug ? 1 : 0)) % 4 === 1 ? 3 : 0
	);

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
</script>

<svelte:head>
	<title>Plate 01 — Index · Studio Py</title>
	<meta
		name="description"
		content="The module index for Studio Py, from the Week 0 setup check to deployment, with reading time, track and local progress."
	/>
</svelte:head>

<main class="console">
	<div class="sheet">
		<RegistrationMarks />

		<header class="masthead">
		<div class="meta-row">
			<p class="meta">Plate 01 — Index</p>
			<p class="meta">
				{pad(completedCount)} / {pad(MODULES.length)} complete
				<span class="sep">·</span> route T+ {clock(TOTAL_MINUTES)}
			</p>
		</div>

		<div class="title-row">
			<h1>Index</h1>

			<span class="snake-idle" aria-hidden="true"><span class="crt"></span></span>

			<div class="readout">
				<p class="manifesto">
					<span>Twenty-five modules.</span>
					<span>Real programs.</span>
					<span>No abstractions.</span>
				</p>
			</div>
		</div>
	</header>

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

	<div class="bento">
		<SnakeSpine {percent} />

		<section class="band" aria-labelledby="band-title">
			<span class="band-mark" aria-hidden="true">{@html w00}</span>
			<a
				class="band-link"
				href={`/lesson/${START.slug}`}
				data-portal
				data-week={START.week}
			>
				<div class="band-line">
					<span class="week">W{pad(START.week)}</span>
					<span class="band-flag">Start here</span>
					<h2 class="band-title" id="band-title">{START.title}</h2>
					<span class="tplus">T+ {clock(START.tplus)}</span>
				</div>

				<span class="band-summary" id="band-summary">{START.summary}</span>

				<span class="handoff" id="band-handoff">
					<span>&gt; SYSTEM ALERT: srv-07 disk at 96%.</span>
					<span>&gt; handoff to operator...</span>
					<span class="handoff-enter">&gt; [ ENTER W00 ]</span>
				</span>

				<span class="band-foot" id="band-meta">
					<span class="label">{START.estimatedMinutes} min · first run</span>
					<span class="state">{STATUS_LABEL[progress.statusOf(START.slug)]}</span>
					<span class="go" aria-hidden="true">→</span>
				</span>
			</a>
		</section>

		<div class="grid-wrap">
			<ol class="ledger">
				{#each visible as module (module.slug)}
					{@const status = progress.statusOf(module.slug)}
					{@const titleId = `module-${module.slug}`}
					{@const summaryId = `summary-${module.slug}`}
					{@const statusId = `status-${module.slug}`}
					{@const expanded = module.slug === expandedSlug}
					<li class:expanded>
						<article class="card">
							<!-- One accessible name: the visible h2. The boot text stays out of
							     it, and the synopsis is only described where it is shown. -->
							<a
								class="entry"
								class:done={status === 'completed'}
								class:active={status === 'in-progress'}
								href={`/lesson/${module.slug}`}
								data-portal
								data-week={module.week}
							>
								<span
									class="plate-mark"
									style={markStyle(module.week)}
									aria-hidden="true"
								></span>
								<span class="face">
									<span class="face-top">
										<span class="week">W{pad(module.week)}</span>
										<span class="tplus">T+ {clock(module.tplus)}</span>
									</span>

									<h2 class="name" id={titleId}>{module.title}</h2>

									{#if module.week === 1}
										<span class="terminal" aria-hidden="true">
											<span class="line">$ python3 -m core</span>
											<span class="line">[OK] Booting variables...</span>
											<span class="line">&gt; READY<span class="cursor"></span></span>
										</span>
									{/if}

									{#if expanded}
										<span class="synopsis" id={summaryId}>{module.summary}</span>
									{/if}

									<span class="face-foot">
										<span class="label">{module.estimatedMinutes} min</span>
										<span class="state" id={statusId}>{STATUS_LABEL[status]}</span>
									</span>
								</span>
								{#if status === 'completed'}
									<span class="stamp-slot"><InkStamp /></span>
								{/if}
							</a>
						</article>
					</li>
				{/each}

				{#if endSpan}
					<li class="endplate" style:grid-column={`span ${endSpan}`} aria-hidden="true">
						<span class="endplate-kicker">End matter · Plate 01</span>
						<span class="endplate-figure">25</span>
						<span class="endplate-note">Twenty-five modules. One operator. No server.</span>
						<span class="endplate-foot">
							<span>Pyodide press</span>
							<span>Client-side edition</span>
						</span>
					</li>
				{/if}

				{#if visible.length === 0}
					<li class="void">
						<p>No modules in this filter yet.</p>
						<button type="button" class="void-reset" onclick={() => select('all')}>
							show all 25
						</button>
					</li>
				{/if}
			</ol>
		</div>
	</div>

		<footer class="colophon">
			<p>Python runs in the browser via Pyodide.</p>
			<p>Progress is stored locally, in this browser.</p>
		</footer>
	</div>
</main>

<style>
	/* `data-warp` is set by the splash transition (src/routes/+page.svelte): the layout's
	   page fade is off so the dashboard sits fully opaque under the black layer, the idle
	   snake stays hidden until it has docked, and the cards arrive once the dock starts. */
	:global(html[data-warp]) :global(.page) {
		animation: none;
	}

	:global(html[data-warp='cover']) .snake-idle,
	:global(html[data-warp='dock']) .snake-idle {
		visibility: hidden;
	}

	:global(html[data-warp]:not([data-warp='cover'])) .ledger li {
		animation: card-in var(--duration-2) var(--ease-standard) backwards;
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(12px);
			clip-path: inset(0 100% 0 0);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			clip-path: inset(0 0 0 0);
		}
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

	/* CRT scanlines over the glitch: hard-edged 2px bands, never a blur. */
	.crt {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.1) 2px,
			rgba(0, 0, 0, 0.1) 4px
		);
		pointer-events: none;
	}

	.snake-idle::before,
	.snake-idle::after {
		content: '';
		position: absolute;
		right: 0;
		width: 16px;
		height: 16px;
		background: #ffffff;
		animation: snake-blink 1.4s steps(1) infinite;
	}

	.snake-idle::before {
		top: 0;
	}

	.snake-idle::after {
		bottom: 0;
	}

	@keyframes snake-blink {
		0%,
		84% {
			background: #ffffff;
		}
		85%,
		100% {
		background: var(--color-snake);
		}
	}

	.console {
		--label: #6a6a6a;
		padding: clamp(88px, 11vh, 160px) clamp(24px, 5vw, 80px) clamp(32px, 4vh, 64px);
	}

	:global(html[data-theme='dark']) .console {
		--label: var(--color-tertiary);
	}

	.sheet {
		position: relative;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem 2rem;
	}

	.meta {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		line-height: 1.6;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.sep {
		padding: 0 0.35em;
	}

	.title-row {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 34rem);
		align-items: end;
		gap: clamp(24px, 6vw, 96px);
		margin-top: clamp(16px, 2.4rem, 32px);
		padding-bottom: 3.2rem;
		border-bottom: 1px solid var(--color-ink);
	}

	h1 {
		margin: 0;
		min-width: 0;
		font-family: var(--font-display);
		font-size: clamp(72px, 12vw, 180px);
		font-weight: 500;
		line-height: 0.8;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.readout {
		display: grid;
		gap: clamp(16px, 2.4rem, 32px);
		padding-bottom: 1rem;
	}

	.manifesto {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: 500;
		line-height: 0.95;
		letter-spacing: -0.035em;
		text-align: left;
		text-transform: uppercase;
	}

	.manifesto span {
		display: block;
	}

	/* One tab stop: a radiogroup the arrows walk through. */
	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.45rem clamp(10px, 1.4vw, 18px);
		padding: clamp(16px, 2.4vw, 24px) 0 clamp(12px, 1.6vw, 18px);
	}

	.filters-label {
		flex-basis: 100%;
		margin: 0 0 0.1rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--label);
	}

	.filter {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		min-height: 24px;
		transition: color var(--duration-1) var(--ease-standard);
		margin: 0;
		padding: 0 0.15em;
		border: 0;
		background: none;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
		cursor: pointer;
	}

	.filter .bracket {
		color: var(--color-muted);
	}

	.filter:hover {
		color: var(--color-ink);
	}

	.filter.on {
		color: var(--color-ink);
	}

	.filter.on .bracket {
		color: var(--color-ink);
	}

	.filter:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	.bento {
		position: relative;
		display: grid;
		gap: clamp(18px, 2.4vw, 28px);
	}


	/* ---------- the start band ---------- */

	.band {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--color-line);
	}

	.band-link {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: clamp(8px, 1.1vw, 12px);
		padding: clamp(14px, 1.8vw, 22px) clamp(16px, 2.2vw, 28px) clamp(12px, 1.5vw, 18px);
		color: inherit;
		text-decoration: none;
	}

	/* Week, badge, title and route stamp sit on one baseline. */
	.band-line {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.5rem clamp(10px, 1.5vw, 18px);
	}

	.band-line .week,
	.band-line .tplus {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.2;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.band-flag {
		align-self: flex-end;
		padding: 0.1em 0.5em;
		border: 1px solid var(--color-ink);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		line-height: 1.2;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.band-title {
		flex: 1 1 auto;
		min-width: 0;
		margin: 0 0 0 clamp(0px, 0.4vw, 6px);
		font-family: var(--font-display);
		font-size: clamp(1.7rem, 3.9vw, 3rem);
		font-weight: 600;
		line-height: 0.96;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.tplus {
		flex: none;
		margin-left: auto;
		color: var(--color-muted);
	}

	.band-summary {
		max-width: 68ch;
		font-family: var(--font-body);
		font-size: clamp(1rem, 1.4vw, 1.25rem);
		line-height: 1.4;
		text-wrap: pretty;
	}

	/* The handoff is the only prose the machine says before the first click: one
	   mono line, prompts included, no typing loop. */
	.handoff {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.4ch;
		padding-top: clamp(5px, 0.7vw, 8px);
		font-family: var(--font-mono);
		font-size: clamp(0.6875rem, 0.8vw, 0.78125rem);
		line-height: 1.5;
		letter-spacing: 0.04em;
		color: var(--color-ink);
	}

	.handoff span {
		white-space: nowrap;
	}

	.handoff-enter {
		font-weight: 700;
	}

	.band-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem 1.4rem;
		padding-top: clamp(7px, 1vw, 11px);
		border-top: 1px solid rgba(127, 127, 127, 0.45);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.2;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.go {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: clamp(1rem, 1.3vw, 1.2rem);
		line-height: 1;
	}

	.band-link:hover .band-title,
	.band-link:focus-visible .band-title {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.12em;
	}

	.band-link:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: -2px;
	}

	/* ---------- the grid ---------- */

	.grid-wrap {
		position: relative;
	}

	.ledger {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: minmax(148px, auto);
		grid-auto-flow: dense;
		gap: 1px;
		margin: 0;
		padding: 0;
		list-style: none;
		/* The grid is the drawing: one 1px rule between every cell and around the whole
		   field, so each card reads as a plate rather than as text floating on paper. */
		background: var(--color-line);
		border: 1px solid var(--color-line);
	}

	.ledger li {
		min-width: 0;
		background: var(--color-paper);
	}

	/* The next module in line gets twice the width, and with it the sentence. */
	.ledger li.expanded {
		grid-column: span 2;
	}

	/* The three cells the expanded plate leaves empty become the book's end matter,
	   so the drawing closes on a printed block instead of exposed ink. */
	.endplate {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: auto 1fr auto;
		gap: 4px clamp(16px, 2vw, 28px);
		padding: clamp(14px, 1.6rem, 20px);
		overflow: hidden;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		line-height: 1.2;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.endplate-kicker {
		color: var(--label);
	}

	.endplate-figure {
		grid-column: 2;
		grid-row: 1 / -1;
		align-self: center;
		font-family: var(--font-display);
		font-size: clamp(4rem, 7vw, 6rem);
		font-weight: 600;
		line-height: 0.78;
		letter-spacing: -0.07em;
	}

	.endplate-note {
		align-self: end;
		max-width: 38ch;
		font-family: var(--font-body);
		font-size: clamp(0.95rem, 1.2vw, 1.1rem);
		line-height: 1.35;
		letter-spacing: 0;
		text-transform: none;
		text-wrap: pretty;
	}

	.endplate-foot {
		display: flex;
		grid-column: 1 / -1;
		justify-content: space-between;
		gap: 12px;
		padding-top: 8px;
		border-top: 1px solid var(--color-line-faint);
		font-size: 0.625rem;
		color: var(--label);
	}

	.card {
		display: flex;
		height: 100%;
		min-width: 0;
	}

	/* The plate mark is printed behind the live type: one ink, low impression. */
	.plate-mark,
	.band-mark {
		position: absolute;
		z-index: 0;
		display: block;
		aspect-ratio: 1;
		pointer-events: none;
		user-select: none;
	}

	.plate-mark {
		top: -30px;
		right: -34px;
		width: clamp(118px, 13vw, 168px);
		opacity: 0.11;
		transform: rotate(4deg);
	}

	.band-mark {
		top: 50%;
		right: -34px;
		width: clamp(196px, 20vw, 276px);
		right: -18px;
		opacity: 0.12;
		transform: translateY(-50%) rotate(7deg);
	}

	.band-mark :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.stamp-slot {
		position: absolute;
		z-index: 2;
		right: clamp(10px, 1.2vw, 17px);
		bottom: clamp(10px, 1.2vw, 17px);
		color: inherit;
	}

	.entry {
		position: relative;
		display: flex;
		flex: 1;
		height: 100%;
		min-height: 148px;
		overflow: hidden;
		color: inherit;
		text-decoration: none;
	}

	/* Invert the sheet instantly; never lift it. The grid stays flat, the type flips to
	   paper ink, and a 1px paper hairline replaces the shared rule inside the card. */
	@media (hover: hover) {
		.entry:hover {
			background: var(--color-ink);
			color: var(--color-paper);
			outline: 1px solid var(--color-paper);
			outline-offset: -1px;
		}

		.entry:hover .state,
		.entry:hover .label,
		.entry:hover .tplus {
			color: inherit;
		}

		.entry:hover .plate-mark {
			opacity: 0.2;
			filter: invert(1);
		}
	}

	.face {
		position: relative;
		z-index: 1;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: clamp(8px, 1.2rem, 12px);
		min-width: 0;
		padding: clamp(12px, 1.6rem, 20px);
	}

	.face-top,
	.face-foot {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: clamp(6px, 1rem, 12px);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.2;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.week {
		font-weight: 700;
	}

	.tplus {
		color: var(--label);
		letter-spacing: 0.08em;
	}

	.label {
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		color: var(--label);
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--color-muted);
		text-align: right;
	}

	/* A registration tick, not a web checkbox: the status is printed on the plate. */
	.state::before {
		content: '';
		width: 11px;
		height: 11px;
		opacity: 0.62;
		background:
			linear-gradient(to right, currentColor 0 4px, transparent 4px 7px, currentColor 7px 11px)
				center / 11px 1px no-repeat,
			linear-gradient(to bottom, currentColor 0 4px, transparent 4px 7px, currentColor 7px 11px)
				center / 1px 11px no-repeat;
	}

	.entry.active .state::before {
		opacity: 1;
		background:
			radial-gradient(circle, currentColor 0 2px, transparent 2.4px) center / 100% 100% no-repeat,
			linear-gradient(to right, currentColor 0 4px, transparent 4px 7px, currentColor 7px 11px)
				center / 11px 1px no-repeat,
			linear-gradient(to bottom, currentColor 0 4px, transparent 4px 7px, currentColor 7px 11px)
				center / 1px 11px no-repeat;
	}

	/* The stamp carries the completed state visually; the status word stays in the
	   accessibility tree for the card's described-by relationship. */
	.entry.done .state {
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

	.name {
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2.2vw, 1.85rem);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.expanded .name {
		font-size: clamp(1.6rem, 3.2vw, 2.6rem);
	}

	/* Metadata is a caption, not a second title: small, loose, and pinned to the foot. */
	.face-foot {
		margin-top: auto;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
	}

	.synopsis {
		max-width: 74ch;
		font-family: var(--font-body);
		font-size: clamp(1rem, 1.3vw, 1.2rem);
		line-height: 1.4;
		text-wrap: pretty;
	}

	.terminal {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		box-sizing: border-box;
		/* The console is docked in the card, not framed inside it: it runs to the
		   card's own rules on both sides and is separated only by its top and bottom. */
		margin-inline: calc(-1 * clamp(12px, 1.6rem, 20px));
		width: auto;
		max-width: none;
		padding: 10px clamp(12px, 1.6rem, 20px);
		border: 0;
		border-block: 1px solid currentColor;
		background: #000000;
		color: #f1f1f1;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		line-height: 1.6;
		letter-spacing: 0.04em;
		text-transform: none;
	}

	/* On black paper the console would vanish into the plate: lift it by one step so it
	   still reads as an instrument rather than as more text. */
	:global(html[data-theme='dark']) .terminal {
		background: color-mix(in srgb, var(--color-ink) 6%, #000000);
	}

	/* Inverted ink on black paper is a lamp, not a print. Carry the plate at a
	   lower impression in dark mode so the halftone sits *in* the sheet. */
	:global(html[data-theme='dark']) .plate-mark {
		filter: invert(1);
		opacity: 0.12;
	}

	:global(html[data-theme='dark']) .band-mark {
		filter: invert(1);
		opacity: 0.14;
	}

	@media (hover: hover) {
		:global(html[data-theme='dark']) .entry:hover .plate-mark {
			filter: none;
			opacity: 0.18;
		}
	}

	.terminal .line {
		display: block;
	}

	.cursor {
		display: inline-block;
		width: 0.6em;
		height: 1em;
		margin-left: 0.4em;
		vertical-align: text-bottom;
		background: #f1f1f1;
		animation: cursor-blink 1s steps(1) infinite;
	}

	@keyframes cursor-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.void {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.8rem 1.6rem;
		padding: clamp(18px, 2.4vw, 26px);
		font-family: var(--font-mono);
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

	.entry:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: -2px;
	}

	.colophon {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem 2rem;
		padding-top: clamp(20px, 2.4rem, 32px);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.8;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	@media (max-width: 1199px) {
		.title-row {
			grid-template-columns: minmax(0, 1fr);
			align-items: start;
			gap: 3.2rem;
		}
	}

	@media (max-width: 1100px) {
		.ledger {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.endplate {
			display: none;
		}
	}

	@media (max-width: 900px) {
		.ledger {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.band-link {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'top'
				'title'
				'summary'
				'foot';
		}

		.go {
			display: none;
		}
	}

	@media (max-width: 620px) {
		.console {
			padding-top: clamp(80px, 12vh, 112px);
		}

		h1 {
			font-size: clamp(72px, 24vw, 96px);
		}

		.ledger {
			grid-template-columns: minmax(0, 1fr);
		}

		/* One column: the double width would force an implicit second track. */
		.ledger li.expanded {
			grid-column: auto;
		}

		/* Narrowest widths: week, badge and stamp share one line; the title takes the next. */
		.band-line .week,
		.band-line .tplus {
			font-size: 0.75rem;
		}

		.band-flag {
			font-size: 0.625rem;
		}

		.band-line .band-title {
			order: 1;
			flex: 1 1 100%;
			margin-top: 4px;
		}

		.face {
			padding: 12px;
		}

		/* The console bleeds by the face's padding, so the bleed shrinks with it. */
		.terminal {
			margin-inline: -12px;
			padding-inline: 12px;
		}

		.name {
			font-size: 1.15rem;
		}

		.expanded .name {
			font-size: 1.5rem;
		}

		.colophon {
			flex-direction: column;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ledger li {
			animation: none;
		}

		.cursor {
			animation: none;
		}
	}
</style>
