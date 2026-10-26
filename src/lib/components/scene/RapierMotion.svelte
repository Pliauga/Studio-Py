<script lang="ts">
	import { useRapier } from '@threlte/rapier';

	let { paused }: { paused: boolean } = $props();

	const { pause, resume } = useRapier();

	// `World` starts paused for the first paint; this keeps a later OS
	// preference change in sync without rebuilding the physics world.
	$effect(() => {
		if (paused) pause();
		else resume();
	});
</script>
