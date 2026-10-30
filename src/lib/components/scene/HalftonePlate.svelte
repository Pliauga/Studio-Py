<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NoToneMapping } from 'three';
	import HalftoneScene from './HalftoneScene.svelte';

	let { reduceMotion = false }: { reduceMotion?: boolean } = $props();
</script>

<!-- Transparent canvas over the print: black dots only, multiplied into the poster. -->
<Canvas renderMode="on-demand" toneMapping={NoToneMapping}>
	<HalftoneScene {reduceMotion} />
</Canvas>
