<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js';
	import { NoToneMapping } from 'three';
	import { BasicShadowMap } from 'three';
	import HeroScene from './HeroScene.svelte';

	type Props = {
		lines: readonly string[];
		reduceMotion: boolean;
		/** Called once the type is in the scene, so the page can retire its text fallback. */
		onready: () => void;
	};

	let { lines, reduceMotion, onready }: Props = $props();

	// Inter Black, pinned to wght 900: steel type, not typewriter.
	const FONT_URL = '/fonts/inter-black.typeface.json';

	let stage = $state<HTMLDivElement>();
	let font = $state.raw<Font>();
	let active = $state(false);
	let paper = $state('#f1f1f1');
	let ink = $state('#000000');

	function readTheme(): void {
		const style = getComputedStyle(document.documentElement);
		paper = style.getPropertyValue('--color-paper').trim() || paper;
		ink = style.getPropertyValue('--color-ink').trim() || ink;
	}

	onMount(() => {
		readTheme();
		const theme = new MutationObserver(readTheme);
		theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		// Off screen the type stops simulating and stops painting.
		const sight = new IntersectionObserver(([entry]) => (active = entry.isIntersecting), {
			threshold: 0.05
		});
		if (stage) sight.observe(stage);

		fetch(FONT_URL)
			.then((response) => {
				if (!response.ok) throw new Error(`${FONT_URL}: ${response.status}`);
				return response.json();
			})
			.then((json) => {
				font = new FontLoader().parse(json);
			})
			.catch((error: unknown) => {
				console.error('Hero type failed to load', error);
			});

		return () => {
			theme.disconnect();
			sight.disconnect();
		};
	});
</script>

<div class="stage" bind:this={stage} aria-hidden="true">
	{#if font}
		<Canvas toneMapping={NoToneMapping} shadows={BasicShadowMap} dpr={[1, 2]}>
			<HeroScene
				{font}
				{lines}
				{paper}
				{ink}
				{active}
				{reduceMotion}
				bounds={() => stage?.getBoundingClientRect()}
			/>
		</Canvas>
		{@render ready()}
	{/if}
</div>

{#snippet ready()}
	<span
		hidden
		{@attach () => {
			// Two frames: the canvas has painted its first scene before the fallback goes.
			let cancelled = false;
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					if (!cancelled) onready();
				})
			);
			return () => {
				cancelled = true;
			};
		}}
	></span>
{/snippet}

<style>
	/* Out of flow: the canvas sizes itself to this box, so it must not size the box. */
	.stage {
		position: absolute;
		inset: 0;
	}
</style>
