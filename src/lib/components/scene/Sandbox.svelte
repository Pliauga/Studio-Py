<script lang="ts">
	import { T, Canvas } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { World, RigidBody, AutoColliders } from '@threlte/rapier';
	import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { BasicShadowMap, LineBasicMaterial, NoToneMapping } from 'three';
	import { pythonRunner } from '#lib/stores/pythonRunner.svelte.ts';
	import RapierMotion from './RapierMotion.svelte';
	import SceneInvalidator from './SceneInvalidator.svelte';
	import BrutalistRender from './BrutalistRender.svelte';
	import InkedObject from './InkedObject.svelte';
	import LivePosition from './LivePosition.svelte';
	import PhantomCube from './PhantomCube.svelte';
	import TargetBox from './TargetBox.svelte';
	import type { SpawnShape, Vec3 } from '#lib/pyexercise/sceneCommands.ts';
	import type StackSceneComponent from './StackScene.svelte';
	import type SortSceneComponent from './SortScene.svelte';
	import type DataSceneComponent from './DataScene.svelte';
	import type ConveyorSceneComponent from './ConveyorScene.svelte';
	import type SwitchyardSceneComponent from './SwitchyardScene.svelte';

	type Props = {
		mode?: 'cube' | 'stack' | 'sort' | 'df' | 'conveyor' | 'switchyard';
	};

	let { mode = 'cube' }: Props = $props();

	const HOVER_HEIGHT = 4;
	const CUBE_CAMERA: Vec3 = [7.5, 7.8, 13];
	const CUBE_TARGET_Y = 4;
	const SORT_CAMERA: Vec3 = [0, 11, 15.5];
	const SORT_TARGET_Y = 1.3;
	const DF_CAMERA: Vec3 = [0, 5.4, 9.6];
	const DF_TARGET_Y = 2.45;
	const CONVEYOR_CAMERA: Vec3 = [0, 5.6, 12.8];
	const CONVEYOR_TARGET_Y = 1.05;
	const CONVEYOR_TARGET_X = 0;
	const SWITCHYARD_CAMERA: Vec3 = [10.5, 9.5, 14.5];
	const SWITCHYARD_TARGET_Y = 0.55;
	const SWITCHYARD_TARGET_X = 0.4;
	const PAPER = '#f1f1f1';
	const INK = '#000000';
	const PHOSPHOR = '#00FF41';
	const SPARK_ANGLES = [-160, -125, -95, -60, -25, 15, 50, 95, 130, 165];
	const CRT_GLASS = '#0a0a0a';
	const JAM_RED = '#FF3333';
	/** Oldest cubes are retired first, so a runaway `while True: spawn_cube()` cannot stall Rapier. */
	const MAX_CUBES = 64;
	/** The execution target holds the stage for this long before the block materialises. */
	const SPAWN_LEAD_MS = 100;

	type PythonCube = {
		id: number;
		position: Vec3;
		shape: SpawnShape;
		color: string;
		size: Vec3;
		type: 'dynamic' | 'kinematicPosition';
	};

	type SpawnTarget = { id: number; position: Vec3; size: Vec3 };
	type Phantom = { id: number; position: Vec3; size: number };
	type PendingSpawn = {
		position: Vec3;
		shape: SpawnShape;
		color: string;
		size: Vec3;
		drop: boolean;
		timer: ReturnType<typeof setTimeout> | null;
	};

	/** Rapier colliders closest to each authored shape. */
	const COLLIDER_SHAPE: Record<SpawnShape, 'cuboid' | 'ball' | 'convexHull'> = {
		box: 'cuboid',
		node: 'cuboid',
		sphere: 'ball',
		cylinder: 'convexHull',
		snake: 'convexHull'
	};

	let bodyType = $state<'dynamic' | 'kinematicPosition'>('kinematicPosition');
	let reduceMotion = $state(false);
	let crt = $state(false);

	// A traceback left by an earlier lesson is not this stage's failure: only a run that
	// finished after this sandbox mounted can jam it.
	const mountedAtRun = untrack(() => pythonRunner.runId);
	const jammed = $derived(
		pythonRunner.error !== null && !pythonRunner.isRunning && pythonRunner.runId > mountedAtRun
	);
	const jamReason = $derived(
		(pythonRunner.error ?? '').trim().split('\n').at(-1)?.slice(0, 72) ?? ''
	);
	const printInk = $derived(jammed ? JAM_RED : crt ? PHOSPHOR : INK);
	const printPaper = $derived(crt ? CRT_GLASS : PAPER);

	onMount(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = query.matches;

		const sync = (event: MediaQueryListEvent) => {
			reduceMotion = event.matches;
		};

		query.addEventListener('change', sync);

		const root = document.documentElement;
		const readCrt = () => {
			crt = root.dataset.crt === 'on';
		};
		readCrt();
		const crtObserver = new MutationObserver(readCrt);
		crtObserver.observe(root, { attributes: true, attributeFilter: ['data-crt'] });

		return () => {
			query.removeEventListener('change', sync);
			crtObserver.disconnect();
		};
	});
	// `$state.raw` on purpose: Rapier objects are WASM handles, and `setTranslation`
	// is patched per instance by `@threlte/rapier`.
	let rigidBody = $state.raw<RapierRigidBody>();

	let cubes = $state<PythonCube[]>([]);
	let stackCount = $state(0);
	let stackTop = $state('');
	let sortCount = $state(0);
	let sortValues = $state('');
	let sortMarked = $state(0);
	let dfTotal = $state(0);
	let dfKept = $state(0);
	let dfDropped = $state(0);
	let conveyorLive = $state(0);
	let conveyorDelivered = $state(0);
	let asyncRunning = $state(0);
	let asyncPaused = $state(0);
	let asyncFinished = $state(0);
	let asyncSnapshot = $state('');
	let appliedSeq = 0;

	/** Spawns waiting out their execution target, keyed by the command that asked for them. */
	const pendingSpawns = new Map<number, PendingSpawn>();
	let targets = $state<SpawnTarget[]>([]);
	let phantoms = $state<Phantom[]>([]);

	const newestTarget = $derived(targets.at(-1));
	const newestCube = $derived(cubes.at(-1));
	let livePosition = $state<Vec3 | null>(null);
	const readout = $derived(
		newestTarget?.position ??
			livePosition ??
			newestCube?.position ?? ([0, HOVER_HEIGHT, 0] as Vec3)
	);

	function handleLive(position: Vec3) {
		livePosition = position;
	}

	function coordinates(position: Vec3): string {
		return position.map((value) => value.toFixed(2)).join(', ');
	}

	function removePhantom(id: number) {
		phantoms = phantoms.filter((phantom) => phantom.id !== id);
	}

	function cancelPending() {
		for (const pending of pendingSpawns.values()) {
			if (pending.timer) clearTimeout(pending.timer);
		}
		pendingSpawns.clear();
		targets = [];
		phantoms = [];
		livePosition = null;
	}

	onDestroy(cancelPending);

	// Troika is sizeable, so the cube lesson never downloads it. Each mode
	// imports only the scene it needs.
	let StackScene = $state<typeof StackSceneComponent>();
	let SortScene = $state<typeof SortSceneComponent>();
	let DataScene = $state<typeof DataSceneComponent>();
	let ConveyorScene = $state<typeof ConveyorSceneComponent>();
	let SwitchyardScene = $state<typeof SwitchyardSceneComponent>();

	$effect(() => {
		if (mode !== 'stack' || StackScene) return;

		import('./StackScene.svelte')
			.then(({ default: Component }) => {
				StackScene = Component;
			})
			.catch((error) => console.error('Stack scene failed to load', error));
	});

	$effect(() => {
		if (mode !== 'sort' || SortScene) return;

		import('./SortScene.svelte')
			.then(({ default: Component }) => {
				SortScene = Component;
			})
			.catch((error) => console.error('Sort scene failed to load', error));
	});

	$effect(() => {
		if (mode !== 'df' || DataScene) return;

		import('./DataScene.svelte')
			.then(({ default: Component }) => {
				DataScene = Component;
			})
			.catch((error) => console.error('Data scene failed to load', error));
	});

	$effect(() => {
		if (mode !== 'conveyor' || ConveyorScene) return;

		import('./ConveyorScene.svelte')
			.then(({ default: Component }) => {
				ConveyorScene = Component;
			})
			.catch((error) => console.error('Conveyor scene failed to load', error));
	});

	$effect(() => {
		if (mode !== 'switchyard' || SwitchyardScene) return;

		import('./SwitchyardScene.svelte')
			.then(({ default: Component }) => {
				SwitchyardScene = Component;
			})
			.catch((error) => console.error('Switchyard scene failed to load', error));
	});

	function handleStackChange(count: number, top: string) {
		stackCount = count;
		stackTop = top;
	}

	function handleSortChange(count: number, values: number[], marked: number) {
		sortCount = count;
		sortValues = values.join(',');
		sortMarked = marked;
	}

	function handleDfChange(total: number, kept: number, dropped: number) {
		dfTotal = total;
		dfKept = kept;
		dfDropped = dropped;
	}

	function handleConveyorChange(live: number, delivered: number) {
		conveyorLive = live;
		conveyorDelivered = delivered;
	}

	function handleSwitchyardChange(running: number, paused: number, finished: number, snapshot: string) {
		asyncRunning = running;
		asyncPaused = paused;
		asyncFinished = finished;
		asyncSnapshot = snapshot;
	}

	// While Python owns the scene the built-in demo cube steps aside, parked so
	// it comes back hovering rather than mid-fall.
	$effect(() => {
		const commands = pythonRunner.sceneCommands;
		const currentMode = mode;
		untrack(() => {
			if (currentMode !== 'cube') return;

			for (const command of commands) {
				if (command.seq <= appliedSeq) continue;
				appliedSeq = command.seq;

				if (command.type === 'spawn') {
					bodyType = 'kinematicPosition';

					const pending: PendingSpawn = {
						position: command.position,
						shape: command.shape,
						color: command.color,
						size: command.size,
						drop: false,
						timer: null
					};
					pending.timer = setTimeout(() => {
						pendingSpawns.delete(command.seq);
						targets = targets.filter((target) => target.id !== command.seq);
						cubes.push({
							id: command.seq,
							position: pending.position,
							shape: pending.shape,
							color: pending.color,
							size: pending.size,
							type: pending.drop ? 'dynamic' : 'kinematicPosition'
						});
						if (cubes.length > MAX_CUBES) cubes.shift();
					}, SPAWN_LEAD_MS);

					pendingSpawns.set(command.seq, pending);
					targets.push({ id: command.seq, position: command.position, size: command.size });
					// Drop the previous body's sample so the readout cannot report it
					// for the block that is still waiting on its target.
					livePosition = null;
				} else if (command.type === 'drop') {
					// A spawn still holding its execution target drops the moment it lands.
					const pending = [...pendingSpawns.values()].at(-1);
					if (pending) {
						pending.drop = true;
					} else {
						const last = cubes.at(-1);
						if (last) last.type = 'dynamic';
						else bodyType = 'dynamic';
					}
				} else if (command.type === 'phantom') {
					// A below-the-plate spawn would sit outside the camera frustum;
					// surface the trace at the requested x/z so the failure reads.
					phantoms.push({
						id: command.seq,
						position: [
							command.position[0],
							command.size / 2 + 0.35,
							command.position[2]
						],
						size: command.size
					});
				} else if (command.type === 'clear') {
					cancelPending();
					cubes = [];
				}
			}
		});
	});

	/**
	 * Hands the newest cube to gravity. `RigidBody` reacts to the `type` prop, so
	 * the switch goes through Rapier's own `setBodyType` effect.
	 */
	export function drop() {
		if (mode !== 'cube') return;

		const pending = [...pendingSpawns.values()].at(-1);
		if (pending) {
			pending.drop = true;
			return;
		}

		const last = cubes.at(-1);
		if (last) last.type = 'dynamic';
		else bodyType = 'dynamic';
	}

	/**
	 * Parks the cube above the floor again. `setTranslation` is patched by
	 * `@threlte/rapier` to flag the interpolated transform for reset, so the
	 * mesh does not smear across the gap on the next frame.
	 */
	export function reset() {
		const hadCubes = cubes.length > 0;
		pythonRunner.clearScene();
		cancelPending();
		cubes = [];
		bodyType = 'kinematicPosition';
		stackCount = 0;
		stackTop = '';
		sortCount = 0;
		sortValues = '';
		sortMarked = 0;
		dfTotal = 0;
		dfKept = 0;
		dfDropped = 0;
		conveyorLive = 0;
		conveyorDelivered = 0;
		asyncRunning = 0;
		asyncPaused = 0;
		asyncFinished = 0;
		asyncSnapshot = '';

		// The demo body was unmounted while Python owned the stage; it remounts
		// at the group origin, so leave the stale handle alone.
		if (hadCubes || !rigidBody) return;

		rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
		rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
		rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
	}
</script>

<div
	class="sandbox"
	data-mode={mode}
	data-cube-count={mode === 'cube' ? cubes.length : 0}
	data-stack-count={stackCount}
	data-stack-top={stackTop}
	data-sort-count={sortCount}
	data-sort-values={sortValues}
	data-sort-marked={sortMarked}
	data-df-total={dfTotal}
	data-conveyor-live={conveyorLive}
	data-conveyor-delivered={conveyorDelivered}
	data-async-running={asyncRunning}
	data-async-paused={asyncPaused}
	data-async-finished={asyncFinished}
	data-async-snapshot={asyncSnapshot}
	data-df-kept={dfKept}
	data-df-dropped={dfDropped}
	data-demo-body-type={bodyType}
	data-last-cube-type={cubes.at(-1)?.type ?? 'none'}
	data-last-shape={cubes.at(-1)?.shape ?? 'none'}
	data-last-command={pythonRunner.sceneCommands.at(-1)?.type ?? 'none'}
	data-target-count={targets.length}
	data-target-position={newestTarget ? coordinates(newestTarget.position) : ''}
	data-phantom-count={phantoms.length}
	data-reduced-motion={reduceMotion}
	data-jammed={jammed}
	class:jammed
>
	{#if jammed}
		<span class="sparks" aria-hidden="true">
			{#each SPARK_ANGLES as angle (angle)}
				<i style={`--angle: ${angle}deg`}></i>
			{/each}
		</span>
		<p class="jam-light" role="alert">
			<span class="lamp" aria-hidden="true"></span>
			[ ! ] JAM · {jamReason}
		</p>
	{/if}
	{#if reduceMotion}
		<p class="motion-label" aria-live="polite">Reduced motion · static frame</p>
	{/if}
	{#if mode === 'cube'}
		<p class="readout" aria-hidden="true">
			X: {readout[0].toFixed(2)} · Y: {readout[1].toFixed(2)} · Z: {readout[2].toFixed(2)}
		</p>
	{/if}
	<Canvas
		renderMode={reduceMotion ? 'on-demand' : 'always'}
		dpr={mode === 'cube' ? [1, 2] : 2}
		shadows={BasicShadowMap}
		toneMapping={NoToneMapping}
	>
		<SceneInvalidator active={reduceMotion} />
		<BrutalistRender paper={PAPER} ink={INK} outPaper={printPaper} outInk={printInk} />
		<T.PerspectiveCamera
			makeDefault
			position={mode === 'stack'
				? [-7.0, 5.5, 9.8]
				: mode === 'sort'
					? SORT_CAMERA
					: mode === 'df'
						? DF_CAMERA
						: mode === 'conveyor'
							? CONVEYOR_CAMERA
							: mode === 'switchyard'
								? SWITCHYARD_CAMERA
								: CUBE_CAMERA}
			fov={45}
		>
			<OrbitControls
				target.x={mode === 'switchyard'
					? SWITCHYARD_TARGET_X
					: mode === 'conveyor'
						? CONVEYOR_TARGET_X
						: 0}
				target.y={mode === 'stack'
					? 1.4
					: mode === 'sort'
						? SORT_TARGET_Y
						: mode === 'df'
							? DF_TARGET_Y
							: mode === 'conveyor'
								? CONVEYOR_TARGET_Y
								: mode === 'switchyard'
									? SWITCHYARD_TARGET_Y
									: CUBE_TARGET_Y}
				enableDamping={!reduceMotion}
				enablePan={false}
				minDistance={mode === 'sort'
					? 15
					: mode === 'df'
						? 9
						: mode === 'conveyor'
							? 10
							: mode === 'switchyard'
								? 16
								: 13}
				maxDistance={mode === 'sort' || mode === 'conveyor' || mode === 'switchyard' ? 28 : 24}
				minPolarAngle={mode === 'sort'
					? 0.55
					: mode === 'df'
						? 0.6
						: mode === 'conveyor'
							? 0.5
							: mode === 'switchyard'
								? 0.45
								: 0.3}
				maxPolarAngle={mode === 'sort'
					? 1.2
					: mode === 'df'
						? 1.32
						: mode === 'conveyor' || mode === 'switchyard'
							? 1.35
							: Math.PI / 2 - 0.04}
			/>
		</T.PerspectiveCamera>

		<T.Color attach="background" args={[PAPER]} />

		<!-- The floor plan: one hairline per unit so the paper void reads as a
		     drafting sheet instead of an empty studio. The switchyard scene
		     already lays out its own grid. -->
		{#if mode !== 'switchyard'}
			<T.GridHelper
				args={[40, 40, INK, INK]}
				position={[0, 0.004, 0]}
				oncreate={(helper) => {
					const material = helper.material;
					if (!(material instanceof LineBasicMaterial)) return;
					material.color.set(INK);
					material.transparent = true;
					material.opacity = 0.24;
					material.depthWrite = false;
				}}
			/>
		{/if}

		<!-- One hard key light at 45 degrees of elevation. The shadow map is kept
		     small on purpose: jagged texels are the look. -->
		<T.DirectionalLight
			position={[8, 11.3, 8]}
			intensity={2.2}
			castShadow
			oncreate={(light) => {
				const extent =
				mode === 'sort' || mode === 'switchyard' ? 18 : mode === 'df' ? 16 : mode === 'conveyor' ? 20 : 12;
				light.shadow.mapSize.width = 512;
				light.shadow.mapSize.height = 512;
				light.shadow.radius = 0;
				light.shadow.camera.left = -extent;
				light.shadow.camera.right = extent;
				light.shadow.camera.top = extent;
				light.shadow.camera.bottom = -extent;
				light.shadow.camera.near = 0.5;
				light.shadow.camera.far = 40;
				light.shadow.camera.updateProjectionMatrix();
				light.shadow.bias = -0.0005;
				light.shadow.normalBias = 0.02;
			}}
		/>

		{#if mode === 'df' || mode === 'conveyor' || mode === 'switchyard'}
			<!-- These scenes are transform-lerped, not simulated, so they mount
			     outside Rapier and keep the same transparent shadow floor. -->
			<T.Group position={[0, -0.25, 0]}>
				<T.Mesh receiveShadow>
					<T.BoxGeometry args={[64, 0.5, 64]} />
					<!-- No depth write: dropped items keep falling past the shadow
					     plane instead of vanishing at its surface. -->
					<T.ShadowMaterial opacity={0.7} depthWrite={false} />
				</T.Mesh>
			</T.Group>

			{#if mode === 'df'}
				{#if DataScene}
					<DataScene {reduceMotion} {jammed} onchange={handleDfChange} />
				{/if}
			{:else if mode === 'conveyor'}
				{#if ConveyorScene}
					<ConveyorScene {reduceMotion} {jammed} onchange={handleConveyorChange} />
				{/if}
			{:else if SwitchyardScene}
				<SwitchyardScene {reduceMotion} {jammed} onchange={handleSwitchyardChange} />
			{/if}
		{:else}
			<World autoStart={!reduceMotion}>
				<RapierMotion paused={reduceMotion} {jammed} />
				<!-- The floor exists only as a shadow catcher: it is otherwise
				     transparent, so the cube sits in the page's paper void. -->
				<T.Group position={[0, -0.25, 0]}>
					<RigidBody type="fixed">
						<AutoColliders shape="cuboid" friction={1.6} restitution={0.05}>
							<T.Mesh receiveShadow>
								<T.BoxGeometry args={[64, 0.5, 64]} />
								<T.ShadowMaterial opacity={0.7} />
							</T.Mesh>
						</AutoColliders>
					</RigidBody>
				</T.Group>

				{#if mode === 'stack'}
					{#if StackScene}
						<StackScene {reduceMotion} onchange={handleStackChange} />
					{/if}
				{:else if mode === 'sort'}
					{#if SortScene}
						<SortScene {reduceMotion} {jammed} onchange={handleSortChange} />
					{/if}
				{:else}
					{#if cubes.length === 0 && targets.length === 0}
						<T.Group position={[0, HOVER_HEIGHT, 0]}>
							<RigidBody bind:rigidBody type={bodyType} canSleep={false} ccd>
								<AutoColliders shape="cuboid" density={40} friction={1.4} restitution={0.05}>
									<InkedObject shape="box" size={[1, 1, 1]} color={INK} ink={PAPER} />
								</AutoColliders>
							</RigidBody>
						</T.Group>
					{/if}

					{#each cubes as cube (cube.id)}
						<T.Group position={cube.position}>
							<RigidBody type={cube.type} canSleep={false} ccd>
								<AutoColliders
									shape={COLLIDER_SHAPE[cube.shape]}
									density={40}
									friction={1.4}
									restitution={0.05}
								>
									{#snippet children({ refresh })}
										<InkedObject
											shape={cube.shape}
											size={cube.size}
											color={cube.color}
											ink={PAPER}
											onready={refresh}
										/>
									{/snippet}
								</AutoColliders>
								{#if cube.id === newestCube?.id}
									<LivePosition onsample={handleLive} />
								{/if}
							</RigidBody>
						</T.Group>
					{/each}

					{#each targets as target (target.id)}
						<TargetBox position={target.position} size={target.size} ink={INK} />
					{/each}

					{#each phantoms as phantom (phantom.id)}
						<PhantomCube
							position={phantom.position}
							size={phantom.size}
							ondone={() => removePhantom(phantom.id)}
						/>
					{/each}
				{/if}
			</World>
		{/if}
	</Canvas>
</div>

<style>
	.sandbox {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		background: var(--color-paper);
		touch-action: none;
		cursor: crosshair;
	}

	.motion-label,
	.readout {
		position: absolute;
		top: 1.2rem;
		z-index: 1;
		margin: 0;
		padding: 0.5rem 0.8rem;
		border: 1px solid var(--color-ink);
		background: var(--color-paper);
		color: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 1rem;
		line-height: 1.2;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
		pointer-events: none;
	}

	.motion-label {
		left: 1.2rem;
	}

	/* The failure state: the whole stage shakes once and a red lamp stays lit until the
	   next run clears the error. */
	.sandbox.jammed {
		animation: jam-shake 480ms steps(2, end) 1;
	}

	.jam-light {
		position: absolute;
		bottom: 1.2rem;
		left: 1.2rem;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		max-width: calc(100% - 2.4rem);
		margin: 0;
		padding: 0.5rem 0.8rem;
		border: 2px solid #ff3333;
		background: #0a0a0a;
		color: #ff3333;
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		pointer-events: none;
	}

	.lamp {
		flex: none;
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 50%;
		background: #ff3333;
		animation: jam-blink 700ms steps(1, end) infinite;
	}

	/* Sparks thrown from the jammed mechanism: ten short crimson streaks, once per jam. */
	.sparks {
		position: absolute;
		top: 55%;
		left: 50%;
		z-index: 2;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.sparks i {
		position: absolute;
		width: 18px;
		height: 3px;
		background: #ff3333;
		box-shadow: 0 0 6px #ff3333;
		opacity: 0;
		transform: rotate(var(--angle)) translateX(0);
		animation: spark-fly 650ms ease-out 1 forwards;
	}

	@keyframes spark-fly {
		0% {
			opacity: 1;
			transform: rotate(var(--angle)) translateX(0);
		}
		100% {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(110px);
		}
	}

	@keyframes jam-shake {
		0% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(-7px, 3px);
		}
		50% {
			transform: translate(6px, -4px);
		}
		75% {
			transform: translate(-4px, -2px);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	@keyframes jam-blink {
		50% {
			opacity: 0.15;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sandbox.jammed,
		.lamp {
			animation: none;
		}

		.sparks {
			display: none;
		}
	}

	.readout {
		right: 1.2rem;
	}
</style>
