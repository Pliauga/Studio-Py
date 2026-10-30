<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { untrack } from 'svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import type { SceneCommand } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		reduceMotion?: boolean;
		onchange?: (count: number, values: number[], marked: number) => void;
	};

	let { reduceMotion = false, onchange }: Props = $props();

	const MAX_PILLARS = 12;
	const SPACING = 0.94;
	const PILLAR_W = 0.6;
	const PILLAR_D = 0.9;
	const PLATFORM_H = 0.14;
	const PLATFORM_D = 2.1;
	const MIN_H = 0.7;
	const MAX_H = 3.6;
	const HOP = 0.55;
	const SWAP_SECONDS = 0.28;
	const STEP_MS = 240;
	const FONT = '/fonts/courier-prime-700.ttf';
	const DARK = '#1b1b1b';
	const LIGHT = '#f7f7f2';
	const INK = '#101010';
	const PAPER = '#f1f1f1';

	type Pillar = {
		id: number;
		value: number;
		label: string;
		height: number;
		x: number;
		y: number;
		targetX: number;
		fromX: number;
		progress: number;
		sorted: boolean;
	};

	type SortCommand = Extract<
		SceneCommand,
		{ type: 'sort_init' } | { type: 'sort_swap' } | { type: 'sort_mark' } | { type: 'clear' }
	>;

	const { invalidate } = useThrelte();

	let pillars = $state<Pillar[]>([]);
	let appliedSeq = 0;
	let nextId = 1;
	let lastAt = 0;
	let pending: { at: number; command: SortCommand }[] = [];

	const baseY = PLATFORM_H;

	function slotX(index: number, count: number): number {
		return (index - (count - 1) / 2) * SPACING;
	}

	function labelOf(value: number): string {
		const text = Number.isInteger(value)
			? String(value)
			: value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
		return text.length > 8 ? `${text.slice(0, 7)}...` : text;
	}

	function heightOf(value: number, min: number, max: number): number {
		if (max === min) return (MIN_H + MAX_H) / 2;
		return MIN_H + ((value - min) / (max - min)) * (MAX_H - MIN_H);
	}

	function publish() {
		onchange?.(
			pillars.length,
			pillars.map((pillar) => pillar.value),
			pillars.filter((pillar) => pillar.sorted).length
		);
		invalidate();
	}

	function clear() {
		pending = [];
		lastAt = 0;
		pillars = [];
		publish();
	}

	function spawn(values: number[]) {
		const items = values.slice(0, MAX_PILLARS);
		const min = Math.min(...items);
		const max = Math.max(...items);

		pending = [];
		pillars = items.map((value, index) => {
			const height = heightOf(value, min, max);
			const x = slotX(index, items.length);
			return {
				id: nextId++,
				value,
				label: labelOf(value),
				height,
				x,
				y: baseY + height / 2,
				targetX: x,
				fromX: x,
				progress: 1,
				sorted: false
			};
		});
		publish();
	}

	function swap(i: number, j: number) {
		if (i === j || i < 0 || j < 0 || i >= pillars.length || j >= pillars.length) return;

		const next = [...pillars];
		[next[i], next[j]] = [next[j], next[i]];

		next.forEach((pillar, index) => {
			const target = slotX(index, next.length);
			if (Math.abs(target - pillar.x) > 0.001) {
				pillar.fromX = pillar.x;
				pillar.progress = 0;
			} else {
				pillar.x = target;
				pillar.progress = 1;
			}
			pillar.targetX = target;
		});

		pillars = next;
		invalidate();
	}

	function mark(index: number) {
		const pillar = pillars[index];
		if (!pillar || pillar.sorted) return;
		pillar.sorted = true;
		publish();
	}

	function apply(command: SortCommand, instant: boolean) {
		if (command.type === 'sort_init') spawn(command.values);
		else if (command.type === 'sort_swap') {
			swap(command.i, command.j);
			if (instant) snap();
		} else if (command.type === 'sort_mark') mark(command.index);
		else clear();
	}

	function snap() {
		pillars.forEach((pillar) => {
			pillar.x = pillar.targetX;
			pillar.progress = 1;
			pillar.y = baseY + pillar.height / 2;
		});
		invalidate();
	}

	$effect(() => {
		const commands = pythonRunner.sceneCommands;
		untrack(() => {
			for (const command of commands) {
				if (command.seq <= appliedSeq) continue;
				appliedSeq = command.seq;

				if (
					command.type !== 'sort_init' &&
					command.type !== 'sort_swap' &&
					command.type !== 'sort_mark' &&
					command.type !== 'clear'
				) {
					continue;
				}

				if (reduceMotion) {
					apply(command, true);
					continue;
				}

				if (command.type === 'sort_init') {
					spawn(command.values);
					lastAt = performance.now() + STEP_MS;
					continue;
				}

				if (command.type === 'clear') {
					clear();
					continue;
				}

				const now = performance.now();
				const at = Math.max(now, lastAt + STEP_MS);
				lastAt = at;
				pending.push({ at, command });
			}
		});
	});

	// A student can switch reduced motion on mid-race. Drain everything still
	// queued so the frame lands on the same final state as a fresh static run.
	$effect(() => {
		if (!reduceMotion) return;
		const queued = pending;
		pending = [];
		for (const item of queued) apply(item.command, true);
		snap();
	});

	useTask((delta) => {
		if (reduceMotion) return;

		const now = performance.now();
		while (pending.length > 0 && pending[0].at <= now) {
			apply(pending.shift()!.command, false);
		}

		let moving = false;
		for (const pillar of pillars) {
			if (pillar.progress >= 1) {
				const rest = baseY + pillar.height / 2;
				if (pillar.y !== rest) {
					pillar.y = rest;
					moving = true;
				}
				continue;
			}

			pillar.progress = Math.min(1, pillar.progress + delta / SWAP_SECONDS);
			const t = pillar.progress;
			const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
			pillar.x = pillar.fromX + (pillar.targetX - pillar.fromX) * eased;
			pillar.y = baseY + pillar.height / 2 + Math.sin(t * Math.PI) * HOP;
			moving = true;
		}

		if (moving) invalidate();
	});

	const trackWidth = $derived(Math.max(6.4, pillars.length * SPACING + 1));
</script>

<T.Group position={[0, PLATFORM_H / 2, 0]}>
	<T.Mesh castShadow receiveShadow>
		<T.BoxGeometry args={[trackWidth, PLATFORM_H, PLATFORM_D]} />
		<T.MeshStandardMaterial color={DARK} roughness={0.82} metalness={0.15} />
	</T.Mesh>
</T.Group>

{#each pillars as pillar (pillar.id)}
	<T.Group position={[pillar.x, pillar.y, 0]}>
		<T.Mesh castShadow receiveShadow>
			<T.BoxGeometry args={[PILLAR_W, pillar.height, PILLAR_D]} />
			<T.MeshStandardMaterial
				color={pillar.sorted ? LIGHT : DARK}
				roughness={0.82}
				metalness={pillar.sorted ? 0 : 0.15}
			/>
		</T.Mesh>

		<Text
			text={pillar.label}
			font={FONT}
			fontSize={0.16}
			color={pillar.sorted ? INK : PAPER}
			anchorX="center"
			anchorY="middle"
			textAlign="center"
			maxWidth={PILLAR_W - 0.1}
			overflowWrap="break-word"
			lineHeight={1.05}
			depthOffset={0.01}
			position={[0, 0, PILLAR_D / 2 + 0.006]}
		/>
	</T.Group>
{/each}

