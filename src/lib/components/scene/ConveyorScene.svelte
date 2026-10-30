<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { untrack } from 'svelte';
	import type { Group } from 'three';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import type {
		ConveyorCommand,
		SceneCommand,
		SequencedConveyorCommand,
		SequencedSceneCommand
	} from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		reduceMotion?: boolean;
		/** A Python error froze the machine: the belt and every parcel hold position. */
		jammed?: boolean;
		onchange?: (live: number, delivered: number) => void;
	};

	let { reduceMotion = false, jammed = false, onchange }: Props = $props();

	const FONT = '/fonts/courier-prime-700.ttf';
	const DARK = '#1b1b1b';
	const PAPER = '#f7f7f2';
	const INK = '#101010';
	const MID = '#2e2e2e';

	// Belt geometry. Items travel from START_X to END_X at a fixed speed;
	// launches are spaced by GAP_SECONDS so a burst of yields becomes a queue.
	const BELT_LEFT = -6.6;
	const BELT_RIGHT = 4.7;
	const START_X = -6.6;
	const END_X = 4.7;
	const BELT_TOP = 1.12;
	const ITEM_W = 0.82;
	const ITEM_H = 0.56;
	const ITEM_D = 0.66;
	const SPEED = 3.2;
	const GAP_SECONDS = 0.36;
	const TRAVEL_SECONDS = (END_X - START_X) / SPEED;
	const DROP_SECONDS = 0.5;
	const BIN_X = 6.0;
	const BIN_INNER_X = 5.3;
	const BIN_FLOOR = 0.08;
	const SLAT_GAP = 0.42;
	// Two columns, two rows, three layers fill the open bin; older parcels are
	// recycled so a 48-item run cannot pile a tower above the rim.
	const BIN_CAPACITY = 12;
	const SLAT_COUNT = 28;
	const BELT_LENGTH = BELT_RIGHT - BELT_LEFT;
	const SLATS = Array.from({ length: SLAT_COUNT }, (_, i) => BELT_LEFT + i * SLAT_GAP);

	type Item = {
		id: number;
		label: string;
		pale: boolean;
		launchAt: number;
		dropAt: number;
		x: number;
		y: number;
		z: number;
		opacity: number;
		resting: boolean;
		dropped: boolean;
		started: boolean;
		slot: number;
	};

	const { invalidate } = useThrelte();

	let items = $state<Item[]>([]);
	let delivered = $state(0);
	let active = $state(false);
	let appliedSeq = 0;
	let nextId = 1;
	let lastLaunchAt = -Infinity;
	let beltOffset = 0;
	let slatGroup: Group | undefined = $state();

	// Parcel positions are a function of the clock, so a jam stops the clock itself:
	// every parcel resumes exactly where it froze if the next run reuses the stage.
	let jamStartedAt: number | null = null;
	let jamHeld = 0;
	const wallSeconds = () => performance.now() / 1000;
	const nowSeconds = () => (jamStartedAt ?? wallSeconds()) - jamHeld;

	$effect(() => {
		const frozen = jammed;
		untrack(() => {
			if (frozen && jamStartedAt === null) jamStartedAt = wallSeconds();
			else if (!frozen && jamStartedAt !== null) {
				jamHeld += wallSeconds() - jamStartedAt;
				jamStartedAt = null;
			}
		});
	});

	function publish() {
		onchange?.(items.length, delivered);
		invalidate();
	}

	function binSlot(slotIndex: number): { x: number; y: number; z: number } {
		const column = slotIndex % 2;
		const row = Math.floor(slotIndex / 2) % 2;
		const layer = Math.floor(slotIndex / 4);
		return {
			x: BIN_X + (column === 0 ? -0.42 : 0.42),
			y: BIN_FLOOR + ITEM_H / 2 + layer * (ITEM_H + 0.02),
			z: row === 0 ? -0.3 : 0.3
		};
	}

	function clear() {
		items = [];
		delivered = 0;
		lastLaunchAt = -Infinity;
		publish();
	}

	function start() {
		items = [];
		delivered = 0;
		lastLaunchAt = -Infinity;
		beltOffset = 0;
		active = true;
		publish();
	}

	function stop() {
		active = false;
	}

	function trimBin(list: Item[]): { list: Item[]; removed: boolean } {
		const resting = list.filter((item) => item.resting);
		if (resting.length <= BIN_CAPACITY) return { list, removed: false };
		const recycle = new Set(resting.slice(0, resting.length - BIN_CAPACITY).map((item) => item.id));
		return { list: list.filter((item) => !recycle.has(item.id)), removed: true };
	}

	function placeResting(item: Item, slotIndex: number) {
		const slot = binSlot(slotIndex);
		item.x = slot.x;
		item.y = slot.y;
		item.z = slot.z;
		item.opacity = 1;
		item.resting = true;
		item.dropped = true;
	}

	function yieldItem(label: string) {
		if (!active) return;

		const now = nowSeconds();
		const launchAt = Math.max(now, lastLaunchAt + GAP_SECONDS);
		lastLaunchAt = launchAt;
		const item: Item = {
			id: nextId++,
			label,
			pale: nextId % 2 === 0,
			launchAt,
			dropAt: launchAt + TRAVEL_SECONDS,
			x: START_X,
			y: BELT_TOP + ITEM_H / 2,
			z: 0,
			opacity: 1,
			resting: false,
			dropped: false,
			started: false,
			slot: -1
		};

		if (reduceMotion) {
			placeResting(item, items.length);
			delivered += 1;
		}
		item.started = reduceMotion;

		items = [...items, item];
		publish();
	}

	function apply(command: ConveyorCommand | Extract<SceneCommand, { type: 'clear' }>) {
		if (command.type === 'conveyor_start') start();
		else if (command.type === 'conveyor_yield') yieldItem(command.label);
		else if (command.type === 'conveyor_stop') stop();
		else if (command.type === 'clear') clear();
	}

	$effect(() => {
		const commands = pythonRunner.sceneCommands as (
			| SequencedSceneCommand
			| SequencedConveyorCommand
		)[];
		untrack(() => {
			for (const command of commands) {
				if (command.seq <= appliedSeq) continue;
				appliedSeq = command.seq;

				if (
					command.type !== 'conveyor_start' &&
					command.type !== 'conveyor_yield' &&
					command.type !== 'conveyor_stop' &&
					command.type !== 'clear'
				) {
					continue;
				}

				apply(command);
			}
		});
	});

	// Reduced motion switched on mid-stream: snap everything already yielded
	// into the bin instead of letting it finish the ride.
	$effect(() => {
		if (!reduceMotion) return;
		let slot = items.filter((item) => item.resting).length;
		let changed = false;
		for (const item of items) {
			if (item.resting) continue;
			placeResting(item, slot % BIN_CAPACITY);
			slot += 1;
			delivered += 1;
			changed = true;
		}
		if (!changed) return;
		const trimmed = trimBin(items);
		items = trimmed.list;
		publish();
	});

	useTask((delta) => {
		if (!slatGroup) return;

		if (!reduceMotion && active && !jammed) {
			beltOffset = (beltOffset + delta * SPEED) % BELT_LENGTH;
			for (let i = 0; i < slatGroup.children.length; i += 1) {
				const base = BELT_LEFT + i * SLAT_GAP;
				const travelled = base + beltOffset;
				const wrapped = ((travelled - BELT_LEFT) % BELT_LENGTH + BELT_LENGTH) % BELT_LENGTH;
				slatGroup.children[i].position.x = BELT_LEFT + wrapped;
			}
		}

		if (reduceMotion || jammed || items.length === 0) return;

		const now = nowSeconds();
		let changed = false;
		const survivors: Item[] = [];

		for (const item of items) {
			if (item.resting) {
				survivors.push(item);
				continue;
			}

			if (now < item.launchAt) {
				survivors.push(item);
				continue;
			}

			item.started = true;

			if (now < item.dropAt) {
				item.x = START_X + SPEED * (now - item.launchAt);
				item.y = BELT_TOP + ITEM_H / 2;
				item.opacity = 1;
			} else {
				if (item.slot < 0) item.slot = delivered % BIN_CAPACITY;
				const slot = binSlot(item.slot);
				const t = Math.min(1, (now - item.dropAt) / DROP_SECONDS);
				item.x = END_X + (slot.x - END_X) * t;
				item.y = BELT_TOP + ITEM_H / 2 + (slot.y - (BELT_TOP + ITEM_H / 2)) * t;
				item.z = slot.z * t;
				item.opacity = 1;
				if (t >= 1) item.resting = true;
			}

			if (!item.dropped && now >= item.dropAt) {
				item.dropped = true;
				delivered += 1;
				changed = true;
			}

			survivors.push(item);
		}

		const trimmed = trimBin(survivors);
		if (trimmed.removed) {
			items = trimmed.list;
			publish();
		} else if (changed) {
			publish();
		}
		invalidate();
	});
</script>

<!-- Belt body, rails and legs: matte black boxes only, no texture maps. -->
<T.Group position={[0, 0, 0]}>
	<T.Mesh castShadow receiveShadow position={[(BELT_LEFT + BELT_RIGHT) / 2, 0.9, 0]}>
		<T.BoxGeometry args={[BELT_LENGTH, 0.44, 1.5]} />
		<T.MeshStandardMaterial color={DARK} roughness={0.85} metalness={0.12} />
	</T.Mesh>

	{#each [BELT_LEFT + 0.7, (BELT_LEFT + BELT_RIGHT) / 2, BELT_RIGHT - 0.7] as legX (legX)}
		<T.Mesh castShadow receiveShadow position={[legX, 0.34, 0]}>
			<T.BoxGeometry args={[0.22, 0.68, 0.22]} />
			<T.MeshStandardMaterial color={INK} roughness={0.9} metalness={0.05} />
		</T.Mesh>
	{/each}

	{#each [-0.8, 0.8] as railZ (railZ)}
		<T.Mesh castShadow receiveShadow position={[(BELT_LEFT + BELT_RIGHT) / 2, 1.22, railZ]}>
			<T.BoxGeometry args={[BELT_LENGTH, 0.16, 0.1]} />
			<T.MeshStandardMaterial color={INK} roughness={0.8} metalness={0.2} />
		</T.Mesh>
	{/each}

	<T.Group bind:ref={slatGroup}>
		{#each SLATS as slatX (slatX)}
			<T.Mesh position={[slatX, BELT_TOP - 0.005, 0]}>
				<T.BoxGeometry args={[0.16, 0.04, 1.34]} />
				<T.MeshStandardMaterial color={MID} roughness={0.95} metalness={0} />
			</T.Mesh>
		{/each}
	</T.Group>
</T.Group>

<!-- Output bin: open-top box under the belt end. -->
<T.Group position={[BIN_X, 0, 0]}>
	<T.Mesh castShadow receiveShadow position={[0, 0.04, 0]}>
		<T.BoxGeometry args={[2.2, 0.08, 1.9]} />
		<T.MeshStandardMaterial color={DARK} roughness={0.95} metalness={0} />
	</T.Mesh>
	<T.Mesh castShadow receiveShadow position={[1.04, 0.47, 0]}>
		<T.BoxGeometry args={[0.12, 0.95, 1.9]} />
		<T.MeshStandardMaterial color={DARK} roughness={0.9} metalness={0.05} />
	</T.Mesh>
	{#each [-1, 1] as side (side)}
		<T.Mesh castShadow receiveShadow position={[0, 0.47, side * 0.89]}>
			<T.BoxGeometry args={[2.2, 0.95, 0.12]} />
			<T.MeshStandardMaterial color={DARK} roughness={0.9} metalness={0.05} />
		</T.Mesh>
	{/each}
</T.Group>

{#each items.filter((item) => item.started) as item (item.id)}
	<T.Group position={[item.x, item.y, item.z]}>
		<T.Mesh castShadow receiveShadow>
			<T.BoxGeometry args={[ITEM_W, ITEM_H, ITEM_D]} />
			<T.MeshStandardMaterial
				color={item.pale ? PAPER : DARK}
				roughness={item.pale ? 0.9 : 0.82}
				metalness={item.pale ? 0 : 0.15}
				transparent
				opacity={item.opacity}
			/>
		</T.Mesh>

		<Text
			text={item.label}
			font={FONT}
			fontSize={0.17}
			color={item.pale ? INK : PAPER}
			fillOpacity={item.opacity}
			anchorX="center"
			anchorY="middle"
			textAlign="center"
			maxWidth={ITEM_W - 0.1}
			overflowWrap="break-word"
			lineHeight={1}
			depthOffset={0.01}
			position={[0, 0, ITEM_D / 2 + 0.006]}
		/>
	</T.Group>
{/each}

