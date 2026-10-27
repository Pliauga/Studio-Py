/**
 * Canvas engine for the splash -> index transition. Two stacked canvases share one
 * 16px cell grid (one canvas pixel = one cell, scaled up with `image-rendering: pixelated`):
 * `wake` holds the black pixel mesh the snake leaves behind, `sprite` holds the snake.
 * Every step moves exactly one cell up, down, left or right.
 */

import { readMs } from '../motion/timing.ts';

export const CELL_PX = 16;
export const SNAKE_CELLS = 3;

/** Fallbacks only: the beats are read from the motion tokens at transition time. */
const ACTIVATE_MS = 200;
const TRAVEL_MS = 320;
const DOCK_MS = 200;

type Ease = (t: number) => number;

export type WarpTiming = { activate: number; travel: number; dock: number; snap: Ease };

/** CSS cubic-bezier -> easing function, so the canvas spends the same clock as the DOM. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
	const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
	const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

	return (x: number) => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const delta = sampleX(t) - x;
			if (Math.abs(delta) < 1e-6) return sampleY(t);
			const slope = slopeX(t);
			if (Math.abs(slope) < 1e-6) break;
			t -= delta / slope;
		}
		let low = 0;
		let high = 1;
		t = x;
		while (high - low > 1e-6) {
			const sampled = sampleX(t);
			if (Math.abs(sampled - x) < 1e-6) break;
			if (sampled < x) low = t;
			else high = t;
			t = low + (high - low) / 2;
		}
		return sampleY(t);
	};
}

function readEase(style: CSSStyleDeclaration, token: string, fallback: string): Ease {
	const raw = style.getPropertyValue(token).trim() || fallback;
	const match = raw.match(/cubic-bezier\(([^)]+)\)/);
	if (!match) return (t) => t;
	const [x1, y1, x2, y2] = match[1].split(',').map((value) => Number.parseFloat(value));
	return [x1, y1, x2, y2].every((value) => Number.isFinite(value))
		? cubicBezier(x1, y1, x2, y2)
		: (t) => t;
}

/**
 * The warp is the one authored sequence on the site, so it takes its beats from
 * the same tokens as every other transition rather than from local constants.
 */
export function warpTiming(): WarpTiming {
	if (typeof window === 'undefined') {
		return { activate: ACTIVATE_MS, travel: TRAVEL_MS, dock: DOCK_MS, snap: (t) => t };
	}
	const style = getComputedStyle(document.documentElement);
	return {
		activate: readMs(style, '--duration-2', ACTIVATE_MS),
		travel: readMs(style, '--duration-3', TRAVEL_MS),
		dock: readMs(style, '--duration-2', DOCK_MS),
		snap: readEase(style, '--ease-snap', 'cubic-bezier(0.85, 0, 0.15, 1)')
	};
}

const INK = '#000000';
const EYE = '#FFFFFF';
/** The one accent, read from the stylesheet so the warp snake is the same green as the spine. */
let accent: string | null = null;
const snakeGreen = (): string => {
	if (accent) return accent;
	if (typeof document === 'undefined') return '#40f51a';
	accent = getComputedStyle(document.documentElement).getPropertyValue('--color-snake').trim() || '#40f51a';
	return accent;
};
/** Share of the path, behind the head, still showing the checker mesh before it fills in solid. */
const WAKE_LAG = 0.2;
const BODY_STEPS = 24;
const REVEAL_LAG_ROWS = 6;

export type Cell = { x: number; y: number };
export type Step = Cell & { dx: number; dy: number };
export type Layers = {
	wake: CanvasRenderingContext2D;
	sprite: CanvasRenderingContext2D;
	cols: number;
	rows: number;
};

export function createLayers(wake: HTMLCanvasElement, sprite: HTMLCanvasElement): Layers | null {
	const cols = Math.ceil(window.innerWidth / CELL_PX);
	const rows = Math.ceil(window.innerHeight / CELL_PX);
	for (const canvas of [wake, sprite]) {
		canvas.width = cols;
		canvas.height = rows;
		canvas.style.width = `${cols * CELL_PX}px`;
		canvas.style.height = `${rows * CELL_PX}px`;
	}
	const wakeCtx = wake.getContext('2d');
	const spriteCtx = sprite.getContext('2d');
	return wakeCtx && spriteCtx ? { wake: wakeCtx, sprite: spriteCtx, cols, rows } : null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function walker(start: Cell) {
	let { x, y } = start;
	const path: Step[] = [{ x, y, dx: 0, dy: 1 }];
	return {
		path,
		toX(target: number) {
			while (x !== target) {
				const dx = Math.sign(target - x);
				x += dx;
				path.push({ x, y, dx, dy: 0 });
			}
		},
		toY(target: number) {
			while (y !== target) {
				const dy = Math.sign(target - y);
				y += dy;
				path.push({ x, y, dx: 0, dy });
			}
		}
	};
}

/**
 * From the emblem down to the bottom band, then a serpentine of 3-row bands back up
 * to the top-left corner (band 0 always runs leftward, so the path ends at x = 0).
 */
function travelPath(layers: Layers, start: Cell): Step[] {
	const maxX = layers.cols - SNAKE_CELLS;
	const maxY = layers.rows - SNAKE_CELLS;
	const bands = Math.ceil(layers.rows / SNAKE_CELLS);
	const bandY = (band: number) => Math.min(band * SNAKE_CELLS, maxY);
	const leftward = (band: number) => band % 2 === 0;

	const walk = walker({ x: clamp(start.x, 0, maxX), y: clamp(start.y, 0, maxY) });
	walk.toY(bandY(bands - 1));
	walk.toX(leftward(bands - 1) ? maxX : 0);
	for (let band = bands - 1; band >= 0; band--) {
		walk.toX(leftward(band) ? 0 : maxX);
		if (band > 0) walk.toY(bandY(band - 1));
	}
	return walk.path;
}

/** From where the travel ended, down the left edge to the baseline, then along it. */
function dockPath(from: Step, target: Cell): Step[] {
	const walk = walker(from);
	walk.toY(target.y);
	walk.toX(target.x);
	return walk.path;
}

function paintBlock(ctx: CanvasRenderingContext2D, step: Cell, color: string): void {
	ctx.fillStyle = color;
	ctx.fillRect(step.x, step.y, SNAKE_CELLS, SNAKE_CELLS);
}

/** Alternate cells of the block: the half-filled mesh the dissolve starts from. */
function paintMesh(ctx: CanvasRenderingContext2D, step: Cell): void {
	ctx.fillStyle = INK;
	for (let dy = 0; dy < SNAKE_CELLS; dy++) {
		for (let dx = 0; dx < SNAKE_CELLS; dx++) {
			if ((step.x + dx + step.y + dy) % 2 === 0) ctx.fillRect(step.x + dx, step.y + dy, 1, 1);
		}
	}
}

/** Green head with two single-cell eyes on the leading edge. */
function paintHead(ctx: CanvasRenderingContext2D, step: Step, eye: string): void {
	paintBlock(ctx, step, snakeGreen());
	const far = SNAKE_CELLS - 1;
	const eyes: [number, number][] =
		step.dx > 0
			? [[far, 0], [far, far]]
			: step.dx < 0
				? [[0, 0], [0, far]]
				: step.dy > 0
					? [[0, far], [far, far]]
					: [[0, 0], [far, 0]];
	ctx.fillStyle = eye;
	for (const [ex, ey] of eyes) ctx.fillRect(step.x + ex, step.y + ey, 1, 1);
}

function frames(duration: number, draw: (progress: number) => void, ease: Ease = (t) => t): Promise<void> {
	return new Promise((resolve) => {
		const start = performance.now();
		const tick = (now: number) => {
			const progress = clamp((now - start) / duration, 0, 1);
			draw(ease(progress));
			if (progress < 1) requestAnimationFrame(tick);
			else resolve();
		};
		requestAnimationFrame(tick);
	});
}

/** Phase 1: the emblem's snake wakes up; its eyes blink neon green. */
export function activate(layers: Layers, spawn: Cell): Promise<void> {
	const head: Step = { ...spawn, dx: 0, dy: 1 };
	const { activate: duration } = warpTiming();
	return frames(duration, (progress) => {
		const elapsed = progress * duration;
		layers.sprite.clearRect(0, 0, layers.cols, layers.rows);
		paintHead(layers.sprite, head, elapsed < 60 || elapsed >= 100 ? EYE : snakeGreen());
	});
}

/** Phase 2: the snake zig-zags the whole grid, leaving a mesh that fills in behind it. */
export function travel(layers: Layers, spawn: Cell): { path: Step[]; done: Promise<void> } {
	const path = travelPath(layers, spawn);
	let meshed = 0;
	let solid = 0;
	const timing = warpTiming();
	const done = frames(timing.travel, (progress) => {
		const head = Math.max(1, Math.ceil(path.length * progress));
		for (; meshed < head; meshed++) paintMesh(layers.wake, path[meshed]);
		const settled = progress >= 1 ? path.length : Math.max(0, head - Math.floor(path.length * WAKE_LAG));
		for (; solid < settled; solid++) paintBlock(layers.wake, path[solid], INK);
		layers.sprite.clearRect(0, 0, layers.cols, layers.rows);
		if (progress < 1) paintHead(layers.sprite, path[head - 1], EYE);
		else {
			layers.wake.fillStyle = INK;
			layers.wake.fillRect(0, 0, layers.cols, layers.rows);
		}
	}, timing.snap);
	return { path, done };
}

/** Phase 3: a scanline dissolve clears the mesh while the snake runs the baseline to its dock. */
export function dock(layers: Layers, from: Step, target: Cell): Promise<void> {
	const { wake, sprite, cols, rows } = layers;
	const path = dockPath(from, target);
	let meshRows = 0;
	let clearRows = 0;
	const timing = warpTiming();
	return frames(timing.dock, (progress) => {
		const edge = Math.ceil(progress * (rows + REVEAL_LAG_ROWS));
		for (; meshRows < Math.min(rows, edge); meshRows++) {
			for (let x = meshRows % 2; x < cols; x += 2) wake.clearRect(x, meshRows, 1, 1);
		}
		const solid = progress >= 1 ? rows : Math.max(0, edge - REVEAL_LAG_ROWS);
		if (solid > clearRows) {
			wake.clearRect(0, clearRows, cols, solid - clearRows);
			clearRows = solid;
		}

		const head = Math.max(1, Math.ceil(path.length * progress));
		sprite.clearRect(0, 0, cols, rows);
		for (let i = Math.max(0, head - BODY_STEPS); i < head - 1; i++) paintBlock(sprite, path[i], INK);
		paintHead(sprite, path[head - 1], EYE);
	}, timing.snap);
}
