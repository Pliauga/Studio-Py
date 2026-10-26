<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import SwitchyardLabel from './SwitchyardLabel.svelte';
	import { onDestroy, untrack } from 'svelte';
	import { BoxGeometry } from 'three';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import type { AsyncCommand } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		reduceMotion?: boolean;
		onchange?: (running: number, paused: number, finished: number, snapshot: string) => void;
	};

	let { reduceMotion = false, onchange }: Props = $props();

	const DARK = '#111111';
	const INK = '#101010';
	const PAPER = '#f7f7f2';
	const GRID = '#ffffff';
	const START_X = -5.2;
	const END_X = 4.4;
	const PAUSE_X = -0.4;
	const EXIT_X = 6.4;
	const TASK_Y = 0.82;
	const TASK_W = 2;
	const TASK_H = 0.72;
	const TASK_D = 1.14;
	const DROP_DISTANCE = 2.4;
	const TRAVEL_SECONDS = 2.4;
	const EXIT_SECONDS = 0.75;
	const LANES = [
		{ index: 0, z: -2.4, label: 'LANE 0' },
		{ index: 1, z: 0, label: 'LANE 1' },
		{ index: 2, z: 2.4, label: 'LANE 2' }
	];
	const SLEEPERS = Array.from({ length: 16 }, (_, index) => -5.7 + index * 0.72);
	const taskShape = new BoxGeometry(TASK_W, TASK_H, TASK_D);
	onDestroy(() => taskShape.dispose());

	type TaskState = 'running' | 'paused' | 'finishing' | 'finished';
	type SwitchTask = {
		key: number;
		id: string;
		lane: number;
		state: TaskState;
		x: number;
		y: number;
		fromX: number;
		targetX: number;
		progress: number;
	};
	type SwitchyardCommand = AsyncCommand | { type: 'clear' };

	const { invalidate } = useThrelte();

	let tasks = $state<SwitchTask[]>([]);
	let appliedSeq = 0;
	let nextKey = 1;

	function laneZ(lane: number): number {
		return LANES[lane]?.z ?? 0;
	}

	function statusOf(task: SwitchTask): string {
		if (task.state === 'paused') return 'PAUSED';
		if (task.state === 'finished') return 'FINISHED';
		if (task.state === 'finishing') return 'EXITING';
		return 'RUNNING';
	}

	function publish() {
		const running = tasks.filter((task) => task.state === 'running' || task.state === 'finishing').length;
		const paused = tasks.filter((task) => task.state === 'paused').length;
		const finished = tasks.filter((task) => task.state === 'finished').length;
		const snapshot = tasks
			.map((task) => `${task.id}:${task.lane}:${task.state}:${task.x.toFixed(3)}`)
			.join('|');
		onchange?.(running, paused, finished, snapshot);
		invalidate();
	}

	function clear() {
		tasks = [];
		nextKey = 1;
		publish();
	}

	function start() {
		clear();
	}

	function launch(id: string, lane: number) {
		const x = reduceMotion ? END_X : START_X;
		const task: SwitchTask = {
			key: nextKey++,
			id,
			lane,
			state: 'running',
			x,
			y: TASK_Y,
			fromX: x,
			targetX: END_X,
			progress: reduceMotion ? 1 : 0
		};
		tasks = [...tasks.filter((item) => item.lane !== lane), task];
		publish();
	}

	function pause(id: string) {
		const task = tasks.find((item) => item.id === id);
		if (!task || task.state === 'finished' || task.state === 'finishing') return;

		task.state = 'paused';
		task.x = reduceMotion ? PAUSE_X : task.x;
		task.fromX = task.x;
		task.targetX = task.x;
		task.progress = 1;
		publish();
	}

	function finish(id: string) {
		const task = tasks.find((item) => item.id === id);
		if (!task || task.state === 'finished' || task.state === 'finishing') return;

		task.state = reduceMotion ? 'finished' : 'finishing';
		task.fromX = task.x;
		task.targetX = EXIT_X;
		task.progress = reduceMotion ? 1 : 0;
		if (reduceMotion) {
			task.x = EXIT_X;
			task.y = TASK_Y - DROP_DISTANCE;
		}
		publish();
	}

	function apply(command: SwitchyardCommand) {
		if (command.type === 'async_start') start();
		else if (command.type === 'async_launch') launch(command.id, command.lane);
		else if (command.type === 'async_pause') pause(command.id);
		else if (command.type === 'async_finish') finish(command.id);
		else clear();
	}

	function snap() {
		for (const task of tasks) {
			task.y = TASK_Y;
			if (task.state === 'running') task.x = END_X;
			else if (task.state === 'paused') task.x = PAUSE_X;
			else {
				task.state = 'finished';
				task.x = EXIT_X;
				task.y = TASK_Y - DROP_DISTANCE;
			}
			task.fromX = task.x;
			task.targetX = task.x;
			task.progress = 1;
		}
		publish();
	}

	$effect(() => {
		const commands = pythonRunner.sceneCommands;
		untrack(() => {
			for (const command of commands) {
				if (command.seq <= appliedSeq) continue;
				appliedSeq = command.seq;

				if (
					command.type !== 'async_start' &&
					command.type !== 'async_launch' &&
					command.type !== 'async_pause' &&
					command.type !== 'async_finish' &&
					command.type !== 'clear'
				) {
					continue;
				}

				apply(command);
			}
		});
	});

	$effect(() => {
		if (!reduceMotion) return;
		untrack(() => snap());
	});

	useTask((delta) => {
		if (reduceMotion) return;

		let moving = false;
		for (const task of tasks) {
			if ((task.state !== 'running' && task.state !== 'finishing') || task.progress >= 1) continue;

			const duration = task.state === 'finishing' ? EXIT_SECONDS : TRAVEL_SECONDS;
			task.progress = Math.min(1, task.progress + delta / duration);
			task.x = task.fromX + (task.targetX - task.fromX) * task.progress;
			if (task.state === 'finishing') {
				task.y = TASK_Y - DROP_DISTANCE * task.progress * task.progress;
				if (task.progress >= 1) task.state = 'finished';
			}
			moving = true;
		}

		if (moving) publish();
	});
</script>

<T.GridHelper args={[28, 56, GRID, GRID]} position={[0, 0.006, 0]} />

<SwitchyardLabel
	text="ASYNC / SWITCHYARD"
	width={5.2}
	height={0.62}
	color={INK}
	rotation={[-Math.PI / 2, 0, 0]}
	position={[-3.5, 0.018, -4.1]}
/>

{#each LANES as lane}
	<T.Group position={[0, 0, lane.z]}>
		{#each SLEEPERS as x}
			<T.Mesh position={[x, 0.07, 0]} castShadow receiveShadow>
				<T.BoxGeometry args={[0.09, 0.12, 1.36]} />
				<T.MeshStandardMaterial color={DARK} roughness={0.9} metalness={0.08} />
			</T.Mesh>
		{/each}

		{#each [-0.5, 0.5] as z}
			<T.Mesh position={[-0.45, 0.23, z]} castShadow receiveShadow>
				<T.BoxGeometry args={[11.25, 0.18, 0.14]} />
				<T.MeshStandardMaterial color={DARK} roughness={0.88} metalness={0.12} />
			</T.Mesh>
		{/each}

		<T.Mesh position={[5.35, 0.35, 0]} castShadow receiveShadow>
			<T.BoxGeometry args={[0.16, 0.7, 1.34]} />
			<T.MeshStandardMaterial color={DARK} roughness={0.9} metalness={0.08} />
		</T.Mesh>

		<SwitchyardLabel
			text={lane.label}
			width={1.9}
			height={0.46}
			color={INK}
			rotation={[-Math.PI / 2, 0, 0]}
			position={[-6.25, 0.018, 0]}
		/>
	</T.Group>
{/each}

<SwitchyardLabel
	text="COMPLETE"
	width={2.2}
	height={0.46}
	color={INK}
	rotation={[-Math.PI / 2, 0, 0]}
	position={[EXIT_X, 0.018, -3.55]}
/>

{#each tasks as task (task.key)}
	<T.Group position={[task.x, task.y, laneZ(task.lane)]}>
		<T.Mesh castShadow receiveShadow>
			<T.BoxGeometry args={[TASK_W, TASK_H, TASK_D]} />
			<T.MeshStandardMaterial color={DARK} roughness={0.92} metalness={0.04} />
		</T.Mesh>

		{#if task.state === 'paused'}
			<T.LineSegments scale={[1.005, 1.005, 1.005]}>
				<T.EdgesGeometry args={[taskShape]} />
				<T.LineBasicMaterial color={GRID} linewidth={1} />
			</T.LineSegments>
		{/if}

		<SwitchyardLabel
			text={task.id}
			width={TASK_W - 0.16}
			height={0.34}
			color={PAPER}
			position={[0, 0.16, TASK_D / 2 + 0.008]}
		/>
		<SwitchyardLabel
			text={statusOf(task)}
			width={TASK_W - 0.16}
			height={0.22}
			color={PAPER}
			position={[0, -0.17, TASK_D / 2 + 0.008]}
		/>
	</T.Group>
{/each}
