<script lang="ts">
	import { T } from '@threlte/core';
	import { onDestroy, untrack } from 'svelte';
	import { BoxGeometry, BufferGeometry, EdgesGeometry, Float32BufferAttribute, LineBasicMaterial } from 'three';
	import type { Vec3 } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		position: Vec3;
		/** Spawn footprint, one dimension per axis. */
		size: Vec3;
		ink: string;
	};

	let { position, size, ink }: Props = $props();

	/** Eight corner registration marks: three rays per corner with a gap at the vertex. */
	function cornerMarks(dims: Vec3): BufferGeometry {
		const half: Vec3 = [dims[0] / 2, dims[1] / 2, dims[2] / 2];
		const edge = Math.max(...dims);
		const gap = edge * 0.14;
		const arm = edge * 0.3;
		const points: number[] = [];

		for (const sx of [-1, 1]) {
			for (const sy of [-1, 1]) {
				for (const sz of [-1, 1]) {
					const corner = [sx * half[0], sy * half[1], sz * half[2]];
					const signs = [sx, sy, sz];

					for (let axis = 0; axis < 3; axis++) {
						const start = [...corner];
						start[axis] += signs[axis] * gap;
						const end = [...corner];
						end[axis] += signs[axis] * (gap + arm);
						points.push(...start, ...end);
					}
				}
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
		return geometry;
	}

	const spec = untrack(() => ({ size, ink }));
	const body = new BoxGeometry(spec.size[0], spec.size[1], spec.size[2]);
	const box = new EdgesGeometry(body);
	const marks = cornerMarks(spec.size);
	const line = new LineBasicMaterial({ color: spec.ink });

	onDestroy(() => {
		body.dispose();
		box.dispose();
		marks.dispose();
		line.dispose();
	});
</script>

<T.Group {position}>
	<T.LineSegments geometry={box} material={line} />
	<T.LineSegments geometry={marks} material={line} />
</T.Group>
