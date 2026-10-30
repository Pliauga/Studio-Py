<script lang="ts">
	import { useRapier } from '@threlte/rapier';
	import { onDestroy } from 'svelte';

	let { paused, jammed = false }: { paused: boolean; jammed?: boolean } = $props();

	const { pause, resume, world } = useRapier();

	/** How long the world keeps simulating after a jam, so the kick is seen before it freezes. */
	const JAM_SETTLE_MS = 450;
	/** Launch speed of the jam kick, in world units per second. */
	const JAM_KICK = 2.4;

	let settle: ReturnType<typeof setTimeout> | undefined;

	/** The failure shakes the stage: every free body takes an impulse proportional to its mass. */
	function kick(): void {
		world.bodies.forEach((body) => {
			if (!body.isDynamic()) return;
			const push = body.mass() * JAM_KICK;
			body.applyImpulse(
				{ x: (Math.random() - 0.5) * push, y: push, z: (Math.random() - 0.5) * push },
				true
			);
		});
	}

	// `World` starts paused for the first paint; this keeps a later OS
	// preference change in sync without rebuilding the physics world.
	$effect(() => {
		clearTimeout(settle);
		if (paused) {
			pause();
		} else if (jammed) {
			resume();
			kick();
			settle = setTimeout(pause, JAM_SETTLE_MS);
		} else {
			resume();
		}
	});

	onDestroy(() => clearTimeout(settle));
</script>
