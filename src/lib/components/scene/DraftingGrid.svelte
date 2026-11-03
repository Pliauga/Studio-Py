<script lang="ts">
	import { T } from '@threlte/core';
	import { Color, DoubleSide } from 'three';

	/**
	 * The floor plan, drawn as a 1-bit rule instead of a lit line.
	 *
	 * A `GridHelper` line is one device pixel wide and lands on partial coverage, so it
	 * reaches the print pass as a blend of graphite and paper. The Bayer screen then
	 * quantises that half-tone into scattered dots — the fuzzy static this replaces. A
	 * fragment here is either solid ink or absent, and solid ink always survives the
	 * screen, so every rule prints as a continuous drafting line.
	 *
	 * The colour matters as much as the geometry: the print pass derives its dither
	 * coverage from luminance between paper and ink, so a mid grey lands on ~50% and
	 * prints as a checkerboard however solid the fragment is. The rule is therefore drawn
	 * in full ink.
	 */
	type Props = {
		/** World units between rules. */
		period?: number;
		/** Width of the sheet the plan is drawn on, in world units. */
		size?: number;
		ink?: string;
	};

	let { period = 1, size = 40, ink = '#000000' }: Props = $props();

	const uniforms = $derived({
		uPeriod: { value: period },
		uInk: { value: new Color(ink) }
	});

	// `PlaneGeometry(size, size)` places its vertices in world units already, so the varying
	// is the position on the sheet and needs no further scaling.
	const vertexShader = /* glsl */ `
		varying vec2 vPlan;

		void main() {
			vPlan = position.xy;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const fragmentShader = /* glsl */ `
		uniform float uPeriod;
		uniform vec3 uInk;
		varying vec2 vPlan;

		void main() {
			// Distance to the nearest rule in world units, converted to pixels so the line
			// stays one pixel wide however far the floor recedes.
			vec2 fromRule = abs(fract(vPlan / uPeriod - 0.5) - 0.5) * uPeriod;
			vec2 pixel = max(fwidth(vPlan), vec2(1e-5));
			float nearest = min(fromRule.x / pixel.x, fromRule.y / pixel.y);

			// Hard threshold at half a pixel: the band covers a whole texel, so the fragment
			// arrives at the print pass as solid ink rather than a sub-pixel blend the
			// screen would then have to dither.
			if (nearest > 0.5) discard;
			gl_FragColor = vec4(uInk, 1.0);
		}
	`;
</script>

<T.Mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
	<T.PlaneGeometry args={[size, size]} />
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		{uniforms}
		transparent
		depthWrite={false}
		side={DoubleSide}
	/>
</T.Mesh>
