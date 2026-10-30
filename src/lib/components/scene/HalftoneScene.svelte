<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Uniform } from 'three';
	import { JAM_MS, misregistration } from '#lib/motion/misregistration.ts';
	import { plate } from '#lib/stores/plate.svelte.ts';

	let { reduceMotion }: { reduceMotion: boolean } = $props();

	const { dpr, invalidate } = useThrelte();

	/** One dot per 6px cell, radius at most 2.7px: the screen the CSS plate used. */
	const CELL_CSS_PX = 6;
	const RADIUS_CSS_PX = 2.7;
	/** Time constant of the ink easing, ms; about 480ms to settle. */
	const EASE_MS = 120;

	const vertexShader = /* glsl */ `
		void main() {
			gl_Position = vec4(position.xy, 0.0, 1.0);
		}
	`;

	const fragmentShader = /* glsl */ `
		uniform float uDensity;
		uniform float uOpacity;
		uniform float uShift;
		uniform float uDpr;

		void main() {
			float cell = ${CELL_CSS_PX.toFixed(1)} * uDpr;
			vec2 p = gl_FragCoord.xy - vec2(uShift * uDpr, 0.0);
			float d = length(mod(p, cell) - 0.5 * cell);
			float radius = uDensity * ${RADIUS_CSS_PX.toFixed(1)} * uDpr;
			float dot = 1.0 - smoothstep(radius, radius + 0.6 * uDpr, d);
			gl_FragColor = vec4(0.0, 0.0, 0.0, dot * uOpacity);
		}
	`;

	const uniforms = {
		uDensity: new Uniform(0),
		uOpacity: new Uniform(0),
		uShift: new Uniform(0),
		uDpr: new Uniform(1)
	};

	let animating = $state(false);
	let jamStart = -Infinity;
	let seenJams = plate.jams;

	$effect(() => {
		uniforms.uDpr.value = dpr.current;
		invalidate();
	});

	$effect(() => {
		// Track both so a new run wakes the loop even when the density is unchanged.
		void plate.density;
		const jams = plate.jams;
		if (jams !== seenJams) {
			seenJams = jams;
			if (!reduceMotion) jamStart = performance.now();
		}
		animating = true;
	});

	useTask(
		(delta) => {
			const target = plate.density ?? 0;
			const targetOpacity = plate.density === null ? 0 : 0.3 + target * 0.5;
			const ease = reduceMotion ? 1 : 1 - Math.exp(-(delta * 1000) / EASE_MS);

			uniforms.uDensity.value += (target - uniforms.uDensity.value) * ease;
			uniforms.uOpacity.value += (targetOpacity - uniforms.uOpacity.value) * ease;

			const sinceJam = performance.now() - jamStart;
			uniforms.uShift.value = misregistration(sinceJam);

			const settled =
				Math.abs(target - uniforms.uDensity.value) < 0.002 &&
				Math.abs(targetOpacity - uniforms.uOpacity.value) < 0.002 &&
				sinceJam >= JAM_MS;
			if (settled) {
				uniforms.uDensity.value = target;
				uniforms.uOpacity.value = targetOpacity;
				animating = false;
			}
		},
		{ running: () => animating }
	);
</script>

<T.OrthographicCamera makeDefault args={[-1, 1, 1, -1, 0, 2]} position={[0, 0, 1]} />

<T.Mesh frustumCulled={false}>
	<T.PlaneGeometry args={[2, 2]} />
	<T.ShaderMaterial {vertexShader} {fragmentShader} {uniforms} transparent depthTest={false} />
</T.Mesh>
