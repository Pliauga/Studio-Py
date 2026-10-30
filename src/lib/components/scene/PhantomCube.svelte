<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { onDestroy, untrack } from 'svelte';
	import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from 'three';
	import type { Group } from 'three';
	import type { Vec3 } from '#lib/pyexercise/sceneCommands.ts';

	type Props = {
		position: Vec3;
		size: number;
		/** Fires once the trace has faded out; the parent unmounts this trace. */
		ondone: () => void;
	};

	let { position, size, ondone }: Props = $props();

	const CRIMSON = '#d10f2f';
	const FALL_SPEED = 1.6;
	const FADE_SECONDS = 2.6;

	const spec = untrack(() => ({ size }));
	const body = new BoxGeometry(spec.size, spec.size, spec.size);
	const edges = new EdgesGeometry(body);
	// No depth test: the trace stays legible while it sinks through the plate.
	const line = new LineBasicMaterial({
		color: CRIMSON,
		transparent: true,
		opacity: 1,
		depthTest: false,
		depthWrite: false
	});

	let group = $state<Group>();
	let elapsed = 0;
	let done = false;

	useTask((delta) => {
		if (done) return;

		elapsed += delta;
		if (group) group.position.y -= FALL_SPEED * delta;
		line.opacity = Math.max(0, 1 - elapsed / FADE_SECONDS);

		if (elapsed >= FADE_SECONDS) {
			done = true;
			ondone();
		}
	});

	onDestroy(() => {
		body.dispose();
		edges.dispose();
		line.dispose();
	});
</script>

<T.Group bind:ref={group} {position} renderOrder={3}>
	<T.LineSegments geometry={edges} material={line} />
</T.Group>
