<script lang="ts">
	import { T } from '@threlte/core';
	import { onDestroy, untrack } from 'svelte';
	import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from 'three';
	import type { Vec3 } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		/** Bounding dimensions of the body this outline wraps; fixed for its lifetime. */
		size: Vec3;
		/** Paper on a black body; ink on a phosphor one. */
		color: string;
	};

	let { size, color }: Props = $props();

	// The outline is derived once: a body's dimensions never change after it is built.
	const { box, edges, material } = untrack(() => {
		const geometry = new BoxGeometry(size[0], size[1], size[2]);
		return {
			box: geometry,
			edges: new EdgesGeometry(geometry),
			material: new LineBasicMaterial({ color })
		};
	});

	onDestroy(() => {
		box.dispose();
		edges.dispose();
		material.dispose();
	});
</script>

<!-- A hair outside the body so the hairline never z-fights with its own faces. -->
<T.LineSegments geometry={edges} material={material} scale={[1.004, 1.004, 1.004]} />
