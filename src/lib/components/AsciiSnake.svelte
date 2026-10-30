<script lang="ts">
	import { onMount } from 'svelte';

	type Cell = { x: number; y: number };
	type Heading = 'up' | 'down' | 'left' | 'right';

	let { onclose }: { onclose: () => void } = $props();

	const COLS = 24;
	const ROWS = 14;
	const START_MS = 140;
	const MIN_MS = 70;
	const STEP: Record<Heading, Cell> = {
		up: { x: 0, y: -1 },
		down: { x: 0, y: 1 },
		left: { x: -1, y: 0 },
		right: { x: 1, y: 0 }
	};
	const OPPOSITE: Record<Heading, Heading> = { up: 'down', down: 'up', left: 'right', right: 'left' };
	const KEYS: Record<string, Heading> = {
		ArrowUp: 'up',
		ArrowDown: 'down',
		ArrowLeft: 'left',
		ArrowRight: 'right',
		w: 'up',
		s: 'down',
		a: 'left',
		d: 'right'
	};

	const startBody = (): Cell[] => [
		{ x: 4, y: 7 },
		{ x: 3, y: 7 },
		{ x: 2, y: 7 }
	];

	let snake = $state<Cell[]>(startBody());
	let food = $state<Cell>({ x: 12, y: 7 });
	let score = $state(0);
	let best = $state(0);
	let over = $state(false);
	let paused = $state(false);
	let heading: Heading = 'right';
	let queued: Heading[] = [];
	let timer: ReturnType<typeof setInterval> | undefined;
	let closeButton = $state<HTMLButtonElement | null>(null);

	const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

	function place(taken: Cell[]): Cell {
		const free: Cell[] = [];
		for (let y = 0; y < ROWS; y += 1) {
			for (let x = 0; x < COLS; x += 1) {
				if (!taken.some((cell) => same(cell, { x, y }))) free.push({ x, y });
			}
		}
		return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
	}

	function reset(): void {
		snake = startBody();
		food = place(snake);
		heading = 'right';
		queued = [];
		score = 0;
		over = false;
		paused = false;
		restartClock();
	}

	function restartClock(): void {
		clearInterval(timer);
		timer = setInterval(tick, Math.max(MIN_MS, START_MS - score * 4));
	}

	function turn(next: Heading): void {
		const last = queued.at(-1) ?? heading;
		if (next === last || next === OPPOSITE[last] || queued.length >= 2) return;
		queued.push(next);
	}

	function tick(): void {
		if (over || paused) return;
		heading = queued.shift() ?? heading;
		const head = { x: snake[0].x + STEP[heading].x, y: snake[0].y + STEP[heading].y };
		const eating = same(head, food);
		const body = eating ? snake : snake.slice(0, -1);
		const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
		if (hitWall || body.some((cell) => same(cell, head))) {
			over = true;
			best = Math.max(best, score);
			clearInterval(timer);
			return;
		}
		snake = [head, ...body];
		if (eating) {
			score += 1;
			food = place(snake);
			restartClock();
		}
	}

	function onkeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
			return;
		}
		const direction = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
		if (direction) {
			event.preventDefault();
			turn(direction);
		} else if (event.key === ' ' && !over) {
			event.preventDefault();
			paused = !paused;
		} else if (event.key === 'Enter' && over) {
			event.preventDefault();
			reset();
		}
	}

	const frame = $derived.by(() => {
		const rule = `+${'-'.repeat(COLS * 2)}+`;
		const rows: string[] = [rule];
		for (let y = 0; y < ROWS; y += 1) {
			let line = '|';
			for (let x = 0; x < COLS; x += 1) {
				const cell = { x, y };
				if (same(cell, snake[0])) line += over ? 'XX' : '@@';
				else if (snake.some((part) => same(part, cell))) line += 'oo';
				else if (same(cell, food)) line += '<>';
				else line += '  ';
			}
			rows.push(`${line}|`);
		}
		rows.push(rule);
		return rows.join('\n');
	});

	onMount(() => {
		reset();
		closeButton?.focus();
		return () => clearInterval(timer);
	});
</script>

<svelte:window {onkeydown} />

<div class="snake-backdrop" role="presentation">
	<div class="snake-modal" role="dialog" aria-modal="true" aria-label="ASCII Snake">
		<header class="bar">
			<span>[ SNAKE.EXE ]</span>
			<span>SCORE {String(score).padStart(3, '0')} · BEST {String(best).padStart(3, '0')}</span>
			<button bind:this={closeButton} class="key" type="button" onclick={onclose}>[ ESC ]</button>
		</header>
		<pre class="field" aria-label="Snake playfield">{frame}</pre>
		<p class="status" aria-live="polite">
			{#if over}
				GAME OVER · ENTER TO RESTART
			{:else if paused}
				PAUSED · SPACE TO RESUME
			{:else}
				ARROWS / WASD TO STEER · SPACE TO PAUSE
			{/if}
		</p>
		<div class="pad" aria-label="Touch controls">
			<button class="key" type="button" onclick={() => turn('up')}>[ ^ ]</button>
			<button class="key" type="button" onclick={() => turn('left')}>[ &lt; ]</button>
			<button class="key" type="button" onclick={() => turn('down')}>[ v ]</button>
			<button class="key" type="button" onclick={() => turn('right')}>[ &gt; ]</button>
			{#if over}
				<button class="key" type="button" onclick={reset}>[ RETRY ]</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.snake-backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.82);
	}

	.snake-modal {
		box-sizing: border-box;
		max-width: 100%;
		padding: 16px;
		border: 2px solid #ffffff;
		background: #000000;
		color: #ffffff;
		font-family: var(--font-mono);
	}

	.bar,
	.pad {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		font-size: 1.2rem;
		letter-spacing: 0.1em;
	}

	.field {
		margin: 12px 0;
		overflow: hidden;
		font-family: var(--font-mono);
		font-size: clamp(9px, 2.4vw, 16px);
		font-weight: 700;
		line-height: 1.1;
		white-space: pre;
		user-select: none;
	}

	.status {
		margin: 0 0 12px;
		font-size: 1.1rem;
		letter-spacing: 0.1em;
	}

	.key {
		padding: 0.6rem 0.9rem;
		border: 1px solid #ffffff;
		background: transparent;
		color: #ffffff;
		font-family: var(--font-mono);
		font-size: 1.1rem;
		letter-spacing: 0.1em;
		cursor: pointer;
	}

	.key:hover,
	.key:focus-visible {
		background: #ffffff;
		color: #000000;
		outline: none;
	}
</style>
