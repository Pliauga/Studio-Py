<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { AutoColliders, Collider, RigidBody } from '@threlte/rapier';
	import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
	import { untrack } from 'svelte';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import type { Vec3 } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		reduceMotion?: boolean;
		onchange?: (count: number, top: string) => void;
	};

	let { reduceMotion = false, onchange }: Props = $props();

	const BLOCK_W = 1.56;
	const BLOCK_H = 0.36;
	const BLOCK_D = 1.02;
	const BASE_H = 0.13;
	const BASE_W = 2.04;
	const BASE_D = 1.56;
	const WALL = 0.084;
	const WALL_H = 3.06;
	const LIP_H = 0.12;
	const DROP_HEIGHT = 2.2;
	const BURST_GAP = 0.42;
	const GAP = 0.015;
	const MAX_BLOCKS = 8;
	const FONT = '/fonts/courier-prime-700.ttf';
	const METAL = '#1b1b1b';
	const METAL_EDGE = '#0e0e0e';
	const BLOCK = '#f7f7f2';
	const INK = '#101010';

	type StackBlock = {
		id: number;
		value: string;
		popping: boolean;
		position: Vec3;
	};

	// Fixed geometry, positioned once. Each piece gets its own fixed body so a
	// wall can never be pushed out of alignment by a landing block.
	const container: { position: Vec3; size: Vec3; color: string }[] = [
		{ position: [0, BASE_H / 2, 0], size: [BASE_W, BASE_H, BASE_D], color: METAL },
		{
			position: [0, BASE_H + WALL_H / 2, -(BASE_D / 2 - WALL / 2)],
			size: [BASE_W, WALL_H, WALL],
			color: METAL
		},
		{
			position: [-(BASE_W / 2 - WALL / 2), BASE_H + WALL_H / 2, 0],
			size: [WALL, WALL_H, BASE_D],
			color: METAL
		},
		{
			position: [BASE_W / 2 - WALL / 2, BASE_H + WALL_H / 2, 0],
			size: [WALL, WALL_H, BASE_D],
			color: METAL
		},
		{
			position: [0, BASE_H + LIP_H / 2, BASE_D / 2 - WALL / 2],
			size: [BASE_W, LIP_H, WALL],
			color: METAL_EDGE
		}
	];

	const { invalidate } = useThrelte();

	let blocks = $state<StackBlock[]>([]);
	let appliedSeq = 0;
	let burst = 0;
	let lastPushAt = 0;

	// Rapier handles are WASM objects; keeping them out of `$state` matches the
	// cube scene and avoids proxying `applyImpulse`.
	const bodies = new Map<number, RapierRigidBody>();
	const timers = new Map<number, ReturnType<typeof setTimeout>>();

	function slotY(index: number): number {
		return BASE_H + BLOCK_H / 2 + 0.003 + index * (BLOCK_H + GAP);
	}

	function labelOf(value: string): string {
		const clean = String(value ?? '')
			.replace(/\s+/g, ' ')
			.trim();
		if (!clean) return '-';
		return clean.length > 24 ? `${clean.slice(0, 23)}...` : clean;
	}

	function live(): StackBlock[] {
		return blocks.filter((block) => !block.popping);
	}

	function publish() {
		const top = live().at(-1);
		onchange?.(live().length, top?.value ?? '');
		invalidate();
	}

	function retire(id: number) {
		const timer = timers.get(id);
		if (timer) clearTimeout(timer);
		timers.delete(id);
		bodies.delete(id);
		blocks = blocks.filter((block) => block.id !== id);
	}

	function push(value: string, id: number) {
		const remaining = live();

		if (remaining.length >= MAX_BLOCKS) {
			retire(remaining[0].id);
		}

		const now = performance.now();
		if (now - lastPushAt > 250) burst = 0;
		const lift = burst * BURST_GAP;
		burst += 1;
		lastPushAt = now;

		const slot = live().length;
		blocks.push({
			id,
			value: labelOf(value),
			popping: false,
			position: [0, reduceMotion ? slotY(slot) : slotY(slot) + DROP_HEIGHT + lift, 0]
		});
		publish();
	}

	function eject(body: RapierRigidBody) {
		body.setEnabledRotations(true, true, true, true);
		body.setLinvel({ x: 0, y: 0, z: 0 }, true);
		body.applyImpulse({ x: 0.4, y: 6.2, z: 6.4 }, true);
		body.applyTorqueImpulse({ x: 1.1, y: 0.3, z: -0.9 }, true);
	}

	function pop() {
		const settled = live();
		const top = settled[settled.length - 1];
		if (!top) return;

		if (reduceMotion) {
			blocks = blocks.filter((block) => block.id !== top.id);
			bodies.delete(top.id);
			publish();
			return;
		}

		const body = bodies.get(top.id);
		// Apply the impulse while the collider still gives the body its mass;
		// the next render drops the collider so nothing can land on it again.
		if (body) eject(body);
		top.popping = true;
		publish();

		const timer = setTimeout(() => {
			timers.delete(top.id);
			bodies.delete(top.id);
			blocks = blocks.filter((block) => block.id !== top.id);
		}, 1000);
		timers.set(top.id, timer);
	}

	function clear() {
		for (const timer of timers.values()) clearTimeout(timer);
		timers.clear();
		bodies.clear();
		blocks = [];
		publish();
	}

	$effect(() => {
		const commands = pythonRunner.sceneCommands;
		untrack(() => {
			for (const command of commands) {
				if (command.seq <= appliedSeq) continue;
				appliedSeq = command.seq;

				if (command.type === 'stack_push') push(command.value, command.seq);
				else if (command.type === 'stack_pop') pop();
				else if (command.type === 'clear') clear();
			}
		});
	});

	// With physics paused there is no fall to settle: place every live block on
	// its slot so the static frame is still a readable stack.
	$effect(() => {
		if (!reduceMotion) return;

		live().forEach((block, index) => {
			const body = bodies.get(block.id);
			if (!body) return;
			body.setTranslation({ x: 0, y: slotY(index), z: 0 }, true);
			body.setLinvel({ x: 0, y: 0, z: 0 }, true);
			body.setAngvel({ x: 0, y: 0, z: 0 }, true);
			body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
		});
	});

	$effect(() => {
		return () => {
			for (const timer of timers.values()) clearTimeout(timer);
		};
	});
</script>

{#each container as part}
	<T.Group position={part.position}>
		<RigidBody type="fixed">
			<AutoColliders shape="cuboid" friction={0.9} restitution={0.02}>
				<T.Mesh castShadow receiveShadow>
					<T.BoxGeometry args={part.size} />
					<T.MeshStandardMaterial color={part.color} roughness={0.82} metalness={0.15} />
				</T.Mesh>
			</AutoColliders>
		</RigidBody>
	</T.Group>
{/each}

<T.Group position={[0, BASE_H / 2, BASE_D / 2 + 0.008]}>
	<Text
		text="LIFO"
		font={FONT}
		fontSize={0.1}
		color="#d8d1c2"
		anchorX="center"
		anchorY="middle"
		letterSpacing={0.06}
	/>
</T.Group>

{#each blocks as block (block.id)}
	<T.Group position={block.position}>
		<RigidBody
			type="dynamic"
			ccd
			lockRotations={!block.popping}
			linearVelocity={block.popping ? [1.6, 4.4, 2.2] : [0, 0, 0]}
			angularVelocity={block.popping ? [1, 0.3, -0.8] : [0, 0, 0]}
			linearDamping={0.05}
			angularDamping={0.4}
			oncreate={(body) => {
				bodies.set(block.id, body);
				return () => bodies.delete(block.id);
			}}
		>
			{#if !block.popping}
				<Collider
					shape="cuboid"
					args={[BLOCK_W / 2, BLOCK_H / 2, BLOCK_D / 2]}
					density={0.6}
					friction={0.9}
					restitution={0.02}
				/>
			{/if}

			<T.Mesh castShadow receiveShadow>
				<T.BoxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
				<T.MeshStandardMaterial color={BLOCK} roughness={0.82} metalness={0} />
			</T.Mesh>

			<Text
				text={block.value}
				font={FONT}
				fontSize={0.15}
				color={INK}
				anchorX="center"
				anchorY="middle"
				textAlign="center"
				maxWidth={BLOCK_W - 0.2}
				overflowWrap="break-word"
				lineHeight={1.05}
				depthOffset={0.01}
				position={[0, 0, BLOCK_D / 2 + 0.008]}
			/>
		</RigidBody>
	</T.Group>
{/each}

