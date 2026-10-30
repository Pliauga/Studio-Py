<script lang="ts">
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { onDestroy, tick, untrack } from 'svelte';
	import {
		BoxGeometry,
		BufferGeometry,
		CylinderGeometry,
		EdgesGeometry,
		Float32BufferAttribute,
		LineBasicMaterial,
		SphereGeometry,
		type BufferGeometry as Geometry,
		type Object3D
	} from 'three';
	import type { SpawnShape, Vec3 } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		shape: SpawnShape;
		/** Bounding dimensions in world units; the geometry is authored at unit size. */
		size: Vec3;
		color: string;
		/** Outline colour; the sandbox passes paper so the body reads as ink on a sheet. */
		ink: string;
		/** Fired once an async model is in the scene graph, so the parent can rebuild its collider. */
		onready?: () => void;
	};

	let { shape, size, color, ink, onready }: Props = $props();

	// A body's dimensions are fixed for its lifetime; build the geometry once.
	const spec = untrack(() => ({ shape, size, color, ink }));

	const SNAKE_URL = '/models/8bit_snake.glb';
	/** The model is authored 2.1 x 2.8 x 0.3; its tallest axis is scaled to one unit. */
	const SNAKE_SCALE = 1 / 2.8;

	const LINK_INK = '#101010';
	const disposables: { dispose: () => void }[] = [];
	const material = new LineBasicMaterial({ color: spec.ink });
	// The node's link leaves the block and travels over bare paper, where a
	// paper-coloured hairline would vanish; it is annotated in ink instead.
	const linkMaterial = new LineBasicMaterial({ color: LINK_INK });
	disposables.push(material, linkMaterial);

	function track(geometry: Geometry): Geometry {
		disposables.push(geometry);
		return geometry;
	}

	/** A printer's circle: one closed ring of straight segments, never a shaded face. */
	function ring(radius: number, segments = 48): Geometry {
		const points: number[] = [];
		for (let i = 0; i <= segments; i++) {
			const angle = (i / segments) * Math.PI * 2;
			points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
		return track(geometry);
	}

	// Smooth bodies cannot use EdgesGeometry (it outlines every tessellation
	// seam), so they get the schematic lines a drafter would draw instead.
	const isNode = spec.shape === 'node';
	const blockScale: Vec3 = isNode ? [0.62, 0.62, 0.62] : [1, 1, 1];

	const body = track(
		spec.shape === 'sphere'
			? new SphereGeometry(0.5, 20, 14)
			: spec.shape === 'cylinder'
				? new CylinderGeometry(0.5, 0.5, 1, 24)
				: new BoxGeometry(1, 1, 1)
	);

	const blockEdges =
		spec.shape === 'box' || isNode ? track(new EdgesGeometry(body)) : null;

	const sphereRings = spec.shape === 'sphere' ? [ring(0.501), ring(0.501), ring(0.501)] : null;
	const cylinderRims =
		spec.shape === 'cylinder' ? [ring(0.501), ring(0.501)] : null;
	const linkRims = isNode ? [ring(0.221), ring(0.221)] : null;
	const linkRails = isNode
		? track(
				new BufferGeometry().setAttribute(
					'position',
					new Float32BufferAttribute(
						[0.144, 0.221, 0, 1.096, 0.221, 0, 0.144, -0.221, 0, 1.096, -0.221, 0],
						3
					)
				)
			)
		: null;

	// The snake's vertex colours already draw its outline, so it skips the
	// paper edge lines. Its geometry and unlit material are shared through the
	// loader cache, which is why they are cloned here and never disposed.
	const isSnake = spec.shape === 'snake';
	const gltf = isSnake ? useGltf(SNAKE_URL) : null;
	let snake = $state.raw<Object3D>();

	if (gltf) {
		gltf.then(async (loaded) => {
			snake = loaded.scene.clone();
			await tick();
			onready?.();
		});
	}

	onDestroy(() => {
		for (const disposable of disposables) disposable.dispose();
	});
</script>

{#if isSnake}
	<T.Group scale={spec.size}>
		{#if snake}
			<T is={snake} scale={SNAKE_SCALE} dispose={false} />
		{/if}
	</T.Group>
{:else}
<T.Group scale={spec.size} rotation={isNode ? [0, Math.PI / 6, 0] : [0, 0, 0]}>
	<T.Mesh geometry={body} scale={blockScale} castShadow receiveShadow>
		<T.MeshStandardMaterial color={spec.color} roughness={0.95} metalness={0} />
	</T.Mesh>

	{#if blockEdges}
		<T.LineSegments
			geometry={blockEdges}
			material={material}
			scale={[blockScale[0] * 1.002, blockScale[1] * 1.002, blockScale[2] * 1.002]}
		/>
	{/if}

	{#if sphereRings}
		{#each sphereRings as geometry, index}
			<T.LineLoop
				{geometry}
				{material}
				rotation={index === 0 ? [0, 0, 0] : index === 1 ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]}
			/>
		{/each}
	{/if}

	{#if cylinderRims}
		{#each cylinderRims as geometry, index}
			<T.LineLoop {geometry} {material} position={[0, index === 0 ? 0.501 : -0.501, 0]} />
		{/each}
	{/if}

	{#if linkRails}
		<T.LineSegments geometry={linkRails} material={linkMaterial} />
	{/if}

	{#if linkRims}
		{#each linkRims as geometry, index}
			<T.LineLoop
				{geometry}
				material={linkMaterial}
				position={[index === 0 ? 0.62 - 0.476 : 0.62 + 0.476, 0, 0]}
				rotation={[0, 0, Math.PI / 2]}
			/>
		{/each}
	{/if}
</T.Group>
{/if}
