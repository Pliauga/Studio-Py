<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { untrack } from 'svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import type {
		DataFrameCommand,
		DataFrameRow,
		SceneCommand,
		SequencedDataFrameCommand,
		SequencedSceneCommand
	} from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		reduceMotion?: boolean;
		/** A Python error froze the machine: nothing advances until the next run. */
		jammed?: boolean;
		onchange?: (total: number, kept: number, dropped: number) => void;
	};

	let { reduceMotion = false, jammed = false, onchange }: Props = $props();

	const MAX_ROWS = 30;
	const MAX_COLS = 6;
	const BLOCK_W = 1.3;
	const BLOCK_H = 0.56;
	const BLOCK_D = 0.44;
	const GAP_X = 0.22;
	const GAP_Y = 0.18;
	const BASE_Y = 1.25;
	const FALL_DISTANCE = 7;
	const FALL_SECONDS = 0.55;
	const FONT = '/fonts/courier-prime-700.ttf';
	const DARK = '#1b1b1b';
	const LIGHT = '#f7f7f2';
	const INK = '#101010';
	const PAPER = '#f1f1f1';

	type Block = {
		id: number;
		index: number;
		host: string;
		status: string;
		x: number;
		/** Resting height; `y` is the animated value the mesh reads. */
		restY: number;
		y: number;
		targetY: number;
		progress: number;
		falling: boolean;
	};

	type DfCommand = DataFrameCommand | Extract<SceneCommand, { type: 'clear' }>;

	const { invalidate } = useThrelte();

	let blocks = $state<Block[]>([]);
	let totalRows = $state(0);
	let appliedSeq = 0;
	let nextId = 1;

	/** Landscape grid that balances to whole rows; 30 rows is 6 x 5. */
	function gridOf(count: number): { cols: number; rows: number } {
		const first = Math.min(MAX_COLS, Math.max(1, Math.ceil(Math.sqrt(count * 1.6))));
		const rows = Math.max(1, Math.ceil(count / first));
		return { cols: Math.max(1, Math.ceil(count / rows)), rows };
	}

	function slot(index: number, count: number): { x: number; y: number } {
		const { cols, rows } = gridOf(count);
		const row = Math.floor(index / cols);
		const column = index % cols;
		const inRow = Math.min(cols, count - row * cols);
		return {
			x: (column - (inRow - 1) / 2) * (BLOCK_W + GAP_X),
			y: BASE_Y + (rows - 1 - row) * (BLOCK_H + GAP_Y)
		};
	}

	function isAlert(status: string): boolean {
		return status.toUpperCase() !== 'OK';
	}

	function publish() {
		const kept = blocks.filter((block) => !block.falling).length;
		onchange?.(totalRows, kept, totalRows - kept);
		invalidate();
	}

	function clear() {
		blocks = [];
		totalRows = 0;
		publish();
	}

	function spawn(rows: DataFrameRow[]) {
		const items = rows.slice(0, MAX_ROWS);
		totalRows = items.length;
		blocks = items.map((row, index) => {
			const { x, y } = slot(index, items.length);
			return {
				id: nextId++,
				index,
				host: row.host,
				status: row.status,
				x,
				restY: y,
				y,
				targetY: y,
				progress: 1,
				falling: false
			};
		});
		publish();
	}

	function filter(keep: number[], instant: boolean) {
		const survivors = new Set(keep);

		if (instant) {
			blocks = blocks.filter((block) => !block.falling && survivors.has(block.index));
			publish();
			return;
		}

		let changed = false;
		for (const block of blocks) {
			if (block.falling || survivors.has(block.index)) continue;
			block.falling = true;
			block.progress = 0;
			block.targetY = block.restY - FALL_DISTANCE;
			changed = true;
		}

		if (changed) publish();
	}

	function apply(command: DfCommand) {
		if (command.type === 'df_init') spawn(command.rows);
		else if (command.type === 'df_filter') filter(command.keep, reduceMotion);
		else clear();
	}

	$effect(() => {
		const commands = pythonRunner.sceneCommands as (
			| SequencedSceneCommand
			| SequencedDataFrameCommand
		)[];
		untrack(() => {
			for (const command of commands) {
				if (command.seq <= appliedSeq) continue;
				appliedSeq = command.seq;

				if (
					command.type !== 'df_init' &&
					command.type !== 'df_filter' &&
					command.type !== 'df_clear' &&
					command.type !== 'clear'
				) {
					continue;
				}

				apply(command);
			}
		});
	});

	// Switching reduced motion on mid-filter lands on the same static frame a
	// fresh reduced-motion run produces: every falling block is already out.
	$effect(() => {
		if (!reduceMotion || !blocks.some((block) => block.falling)) return;
		blocks = blocks.filter((block) => !block.falling);
		publish();
	});

	useTask((delta) => {
		if (reduceMotion || jammed) return;

		let moving = false;
		let finished = false;

		for (const block of blocks) {
			if (!block.falling || block.progress >= 1) continue;
			block.progress = Math.min(1, block.progress + delta / FALL_SECONDS);
			const t = block.progress;
			block.y = block.restY + (block.targetY - block.restY) * (t * t);
			moving = true;
			if (t >= 1) finished = true;
		}

		if (finished) {
			blocks = blocks.filter((block) => !(block.falling && block.progress >= 1));
			publish();
		} else if (moving) {
			invalidate();
		}
	});
</script>

{#each blocks as block (block.id)}
	<T.Group position={[block.x, block.y, 0]}>
		<T.Mesh castShadow receiveShadow>
			<T.BoxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
			<T.MeshStandardMaterial
				color={isAlert(block.status) ? LIGHT : DARK}
				roughness={isAlert(block.status) ? 0.9 : 0.82}
				metalness={isAlert(block.status) ? 0 : 0.15}
			/>
		</T.Mesh>

		<Text
			text={block.host}
			font={FONT}
			fontSize={0.15}
			color={isAlert(block.status) ? INK : PAPER}
			anchorX="center"
			anchorY="middle"
			textAlign="center"
			maxWidth={BLOCK_W - 0.12}
			overflowWrap="break-word"
			lineHeight={1.05}
			depthOffset={0.01}
			position={[0, 0.1, BLOCK_D / 2 + 0.006]}
		/>

		<Text
			text={block.status}
			font={FONT}
			fontSize={0.11}
			color={isAlert(block.status) ? INK : PAPER}
			anchorX="center"
			anchorY="middle"
			textAlign="center"
			maxWidth={BLOCK_W - 0.14}
			overflowWrap="break-word"
			lineHeight={1.05}
			depthOffset={0.01}
			position={[0, -0.11, BLOCK_D / 2 + 0.006]}
		/>
	</T.Group>
{/each}

