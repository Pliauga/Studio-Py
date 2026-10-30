<script lang="ts">
	import { useTask } from '@threlte/core';
	import { useRigidBody } from '@threlte/rapier';

	type Point = [number, number, number];

	let {
		/** Reports the body's world position at a display-friendly cadence. */
		onsample
	}: { onsample: (position: Point) => void } = $props();

	const body = useRigidBody();
	let elapsed = 0;

	useTask((delta) => {
		elapsed += delta;
		// Ten samples a second is smooth for a coordinate readout and keeps the
		// parent from re-rendering on every frame.
		if (elapsed < 0.1) return;
		elapsed = 0;

		const rigidBody = body.current;
		if (!rigidBody) return;

		const translation = rigidBody.translation();
		onsample([translation.x, translation.y, translation.z]);
	});
</script>
