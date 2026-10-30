<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Collider, RigidBody, World } from '@threlte/rapier';
	import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
	import { onDestroy, untrack } from 'svelte';
	import {
		BufferGeometry,
		EdgesGeometry,
		LineBasicMaterial,
		MathUtils,
		OrthographicCamera,
		Plane,
		Raycaster,
		Vector2,
		Vector3
	} from 'three';
	import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
	import type { Font } from 'three/examples/jsm/loaders/FontLoader.js';
	import { LINE_PITCH, layoutForme, type Letter } from '#lib/motion/letterpress.ts';
	import RapierMotion from './RapierMotion.svelte';

	type Props = {
		font: Font;
		lines: readonly string[];
		paper: string;
		ink: string;
		active: boolean;
		reduceMotion: boolean;
		/** The canvas element's page rect, for mapping the pointer onto the press bed. */
		bounds: () => DOMRect | undefined;
	};

	let { font, lines, paper, ink, active, reduceMotion, bounds }: Props = $props();

	/** World units per em. Rapier is happiest with bodies around a unit across. */
	const EM = 2;
	/** Type height: a steel sort is far taller than the glyph's relief. */
	const BODY = 0.5;
	/** Glyph box in em, baseline-relative: Inter Black's caps reach 0.74, descenders -0.22. */
	const BOX_BOTTOM = -0.26;
	const BOX_TOP = 0.74;
	/** The sort is a shade shallower than the line pitch, so set-solid lines never interpenetrate. */
	const SORT_FIT = 0.9;
	const MASS = 400;
	/** Pointer reach on the bed, world units. */
	const REACH = 1.7;
	/** Velocity a full-speed pass adds to a block touching the pointer, units/s. */
	const NUDGE = 0.9;
	/** Velocity a tap adds to a block touching it, units/s. */
	const TAP = 1.1;
	const DROP = 0.6;
	/** The glyphs are built once per forme, not per frame. */
	const CURVE_SEGMENTS = 16;

	const { size, camera } = useThrelte();

	// The forme belongs to the breakpoint: a new set of lines is a new forme.
	const forme = $derived(untrack(() => layoutForme(lines, font.data)));
	const widthUnits = $derived(forme.width * EM);
	const depthUnits = $derived(forme.depth * EM);

	type Sorts = { faces: Map<string, BufferGeometry>; edges: Map<string, BufferGeometry> };
	let sorts = $state.raw<Sorts>({ faces: new Map(), edges: new Map() });

	const outline = new LineBasicMaterial();

	$effect(() => {
		const current = forme;
		const faces = new Map<string, BufferGeometry>();
		const edges = new Map<string, BufferGeometry>();

		for (const letter of current.letters) {
			if (faces.has(letter.char)) continue;
			const geometry = new TextGeometry(letter.char, {
				font: untrack(() => font),
				size: EM,
				depth: BODY,
				// Crisp on purpose: a coarse tessellation reads as faceted at display size.
				curveSegments: CURVE_SEGMENTS,
				bevelEnabled: false
			});
			// Centre the sort on its own advance, then lay it face-up on the bed.
			geometry.translate(-(letter.advance * EM) / 2, -((BOX_BOTTOM + BOX_TOP) / 2) * EM, -BODY / 2);
			geometry.rotateX(-Math.PI / 2);
			geometry.computeBoundingBox();
			faces.set(letter.char, geometry);
			edges.set(letter.char, new EdgesGeometry(geometry, 35));
		}

		const previous = untrack(() => sorts);
		sorts = { faces, edges };
		for (const geometry of previous.faces.values()) geometry.dispose();
		for (const geometry of previous.edges.values()) geometry.dispose();
	});

	$effect(() => {
		outline.color.set(paper);
	});

	onDestroy(() => {
		for (const geometry of sorts.faces.values()) geometry.dispose();
		for (const geometry of sorts.edges.values()) geometry.dispose();
		outline.dispose();
	});

	// The camera never moves: a fixed oblique view onto the bed, fitted to the forme.
	/** The forme fills this share of the canvas, on whichever axis binds first. */
	const FILL = 0.94;
	$effect(() => {
		const current = camera.current;
		if (!(current instanceof OrthographicCamera)) return;
		const { width, height } = size.current;
		if (width <= 0 || height <= 0 || widthUnits <= 0) return;
		// Zoom is pixels per world unit: fit the wider of the two axes, never crop type.
		current.zoom = Math.min((width * FILL) / widthUnits, (height * FILL) / depthUnits);
		current.updateProjectionMatrix();
	});

	const bodies = new Map<string, RapierRigidBody>();
	const raycaster = new Raycaster();
	const bed = new Plane(new Vector3(0, 1, 0), 0);
	const ndc = new Vector2();
	const hit = new Vector3();
	let last: { x: number; z: number; at: number } | null = null;

	/** Projects a pointer onto the press bed; false when it misses the canvas or the bed. */
	function project(event: PointerEvent): boolean {
		const rect = bounds();
		if (!rect || rect.width === 0 || rect.height === 0) return false;

		ndc.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-(((event.clientY - rect.top) / rect.height) * 2 - 1)
		);
		raycaster.setFromCamera(ndc, camera.current);
		return raycaster.ray.intersectPlane(bed, hit) !== null;
	}

	/** Pushes every block within reach of `hit`: away from it, plus along `along` when given. */
	function push(strength: number, along: { x: number; z: number } | null): void {
		for (const letter of forme.letters) {
			const body = bodies.get(letter.id);
			if (!body) continue;
			const at = body.translation();
			const dx = at.x - hit.x;
			const dz = at.z - hit.z;
			const distance = Math.hypot(dx, dz);
			if (distance > REACH) continue;

			const falloff = 1 - distance / REACH;
			const away = distance > 1e-3 ? { x: dx / distance, z: dz / distance } : { x: 0, z: 0 };
			// Half the push follows the pointer's own motion, so a sweep drags the type along.
			const lead = along ?? away;
			const share = along ? 0.5 : 0;
			body.applyImpulse(
				{
					x: (away.x * (1 - share) + lead.x * share) * strength * falloff,
					y: 0,
					z: (away.z * (1 - share) + lead.z * share) * strength * falloff
				},
				true
			);
		}
	}

	function nudge(event: PointerEvent): void {
		if (!active || reduceMotion || !project(event)) return;

		const now = performance.now();
		const previous = last;
		last = { x: hit.x, z: hit.z, at: now };
		if (!previous) return;

		const seconds = Math.max((now - previous.at) / 1000, 1 / 120);
		const travel = Math.hypot(hit.x - previous.x, hit.z - previous.z);
		// A gentle pass is a gentle push: saturate well below a flick.
		const strength = MathUtils.clamp(travel / seconds / 14, 0, 1) * NUDGE * MASS;
		if (strength < 1) return;

		const lead = travel || 1;
		push(strength, { x: (hit.x - previous.x) / lead, z: (hit.z - previous.z) / lead });
	}

	/** A finger has no hover: a tap is one fixed shove outward from where it lands. */
	function tap(event: PointerEvent): void {
		last = null;
		if (!active || reduceMotion || !project(event)) return;
		push(TAP * MASS, null);
	}

	$effect(() => {
		window.addEventListener('pointermove', nudge, { passive: true });
		window.addEventListener('pointerdown', tap, { passive: true });
		return () => {
			window.removeEventListener('pointermove', nudge);
			window.removeEventListener('pointerdown', tap);
		};
	});

	function place(letter: Letter): [number, number, number] {
		return [letter.x * EM, BODY / 2 + 0.002 + (reduceMotion ? 0 : DROP), letter.z * EM];
	}
</script>

<T.OrthographicCamera
	makeDefault
	position={[0, 11, 8]}
	near={0.1}
	far={60}
	oncreate={(ref) => ref.lookAt(0, 0, 0)}
/>

<T.DirectionalLight
	position={[-6, 8.5, 6]}
	intensity={2.4}
	castShadow
	oncreate={(light) => {
		light.shadow.mapSize.width = 512;
		light.shadow.mapSize.height = 512;
		light.shadow.radius = 0;
		light.shadow.camera.left = -9;
		light.shadow.camera.right = 9;
		light.shadow.camera.top = 6;
		light.shadow.camera.bottom = -6;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 30;
		light.shadow.camera.updateProjectionMatrix();
		light.shadow.bias = -0.0008;
		light.shadow.normalBias = 0.02;
	}}
/>

<World autoStart={false} gravity={[0, -9.81, 0]}>
	<RapierMotion paused={!active || reduceMotion} />

	<T.Group position={[0, -0.25, 0]}>
		<RigidBody type="fixed">
			<Collider shape="cuboid" args={[32, 0.25, 32]} friction={1.6} restitution={0.05} />
			<T.Mesh receiveShadow>
				<T.BoxGeometry args={[64, 0.5, 64]} />
				<T.ShadowMaterial opacity={0.85} />
			</T.Mesh>
		</RigidBody>
	</T.Group>

	<!-- A new forme is a new set of bodies: they must be cast at their new positions. -->
	{#key forme}
		{#each forme.letters as letter (letter.id)}
			{@const face = sorts.faces.get(letter.char)}
			{@const edges = sorts.edges.get(letter.char)}
			<T.Group position={place(letter)}>
				<RigidBody
					canSleep
					ccd
					linearDamping={1.2}
					angularDamping={2.5}
					enabledRotations={[false, true, false]}
					oncreate={(body) => {
						bodies.set(letter.id, body);
						return () => bodies.delete(letter.id);
					}}
				>
					<Collider
						shape="cuboid"
						args={[
							(letter.advance * EM * 0.98) / 2,
							BODY / 2,
							(LINE_PITCH * EM * SORT_FIT) / 2
						]}
						mass={MASS}
						friction={1.4}
						restitution={0.05}
					/>
					{#if face && edges}
						<T.Mesh geometry={face} castShadow receiveShadow>
							<T.MeshStandardMaterial color={ink} roughness={0.95} metalness={0} />
						</T.Mesh>
						<T.LineSegments geometry={edges} material={outline} />
					{/if}
				</RigidBody>
			</T.Group>
		{/each}
	{/key}
</World>
