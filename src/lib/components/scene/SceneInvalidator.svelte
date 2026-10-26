<script lang="ts">
	import { useThrelte } from '@threlte/core';

	let { active = false }: { active?: boolean } = $props();

	const { invalidate } = useThrelte();

	// `on-demand` only paints after an invalidation; mount and the preference
	// switch both need one.
	$effect(() => {
		if (active) invalidate();
	});
</script>
