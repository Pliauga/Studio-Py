<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';
	import { onDestroy, untrack } from 'svelte';
	import { BrutalistEffect } from './brutalistEffect.ts';

	type Props = {
		paper: string;
		ink: string;
		/** Paper pixels render transparent so the page behind the canvas shows through. */
		transparent?: boolean;
		/** Print colours when they differ from the luminance palette (CRT phosphor, jam red). */
		outPaper?: string;
		outInk?: string;
		/** Stops rendering (not the scene) while the canvas is off screen. */
		active?: boolean;
	};

	let { paper, ink, transparent = false, active = true, outPaper, outInk }: Props = $props();

	const { renderer, scene, camera, size, dpr, autoRender, renderStage } = useThrelte();

	const look = new BrutalistEffect(untrack(() => ({ paper, ink, transparent })));
	const composer = new EffectComposer(renderer, { multisampling: 0 });
	composer.addPass(new RenderPass(scene, camera.current));
	composer.addPass(new EffectPass(camera.current, look));

	// The composer owns the frame: Threlte's own render task would paint the
	// undithered scene underneath it.
	$effect.pre(() => {
		autoRender.set(false);
		return () => autoRender.set(true);
	});

	$effect(() => {
		composer.setMainCamera(camera.current);
	});

	$effect(() => {
		const { width, height } = size.current;
		if (width > 0 && height > 0) composer.setSize(width, height, false);
		look.setCell(dpr.current);
	});

	$effect(() => {
		look.setPalette(paper, ink);
	});

	$effect(() => {
		look.setOutput(outPaper ?? paper, outInk ?? ink);
	});

	useTask((delta) => composer.render(delta), {
		stage: renderStage,
		autoInvalidate: false,
		running: () => active
	});

	onDestroy(() => composer.dispose());
</script>
