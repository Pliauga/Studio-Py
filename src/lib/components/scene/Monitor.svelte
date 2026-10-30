<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Environment } from '@threlte/extras';
	import {
		BloomEffect,
		BlendFunction,
		ChromaticAberrationEffect,
		EffectComposer,
		EffectPass,
		NoiseEffect,
		RenderPass
	} from 'postprocessing';
	import { onDestroy } from 'svelte';
	import {
		CanvasTexture,
		DirectionalLight,
		Path,
		RectAreaLight,
		RepeatWrapping,
		Shape,
		Vector2
	} from 'three';
	import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

	const { renderer, scene, camera, size, autoRender, renderStage } = useThrelte();

	const FOV = 30;
	const DISTANCE = 20;
	const DEPTH = 1.2;
	const viewHeight = 2 * DISTANCE * Math.tan((FOV * Math.PI) / 360);

	// The frame is built in CSS pixels converted to world units, so it hugs the viewport at
	// any size: the front face sits on the z = 0 plane, where one pixel is `unit` wide.
	const unit = $derived(viewHeight / size.current.height);
	const width = $derived(size.current.width * unit);
	const height = viewHeight;
	const thickness = $derived(Math.min(Math.max(size.current.width * 0.05, 24), 72) * unit);
	const innerWidth = $derived(width - thickness * 2);
	const innerHeight = $derived(height - thickness * 2);

	// One continuous slab with a rectangular screen hole. The bevel is what catches light:
	// it is scaled to the frame, since the world here is ten units tall rather than 100.
	const bevel = $derived({
		depth: DEPTH,
		bevelEnabled: true,
		bevelThickness: thickness * 0.2,
		bevelSize: thickness * 0.12,
		bevelSegments: 4
	});

	const outline = $derived.by(() => {
		const hw = width / 2;
		const hh = height / 2;
		const shape = new Shape();
		shape.moveTo(-hw, -hh);
		shape.lineTo(hw, -hh);
		shape.lineTo(hw, hh);
		shape.lineTo(-hw, hh);
		shape.lineTo(-hw, -hh);

		const hole = new Path();
		hole.moveTo(-innerWidth / 2, -innerHeight / 2);
		hole.lineTo(-innerWidth / 2, innerHeight / 2);
		hole.lineTo(innerWidth / 2, innerHeight / 2);
		hole.lineTo(innerWidth / 2, -innerHeight / 2);
		hole.lineTo(-innerWidth / 2, -innerHeight / 2);
		shape.holes.push(hole);
		return shape;
	});

	// The front cap lands on z = 0: the slab runs from -(depth + 2 * bevelThickness) to 0.
	const frontZ = $derived(-(DEPTH + bevel.bevelThickness));

	/** Seamless fractal value noise: a periodic lattice, so the tile wraps without a seam. */
	function plasticTexture(resolution: number): CanvasTexture {
		let seed = 1970;
		const random = () => {
			seed = (seed * 1664525 + 1013904223) >>> 0;
			return seed / 4294967296;
		};
		const octaves = [96, 192, 384, 512].map((period) => {
			const lattice = new Float32Array(period * period);
			for (let i = 0; i < lattice.length; i++) lattice[i] = random();
			return { period, lattice };
		});

		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = resolution;
		const context = canvas.getContext('2d');
		if (!context) throw new Error('2D canvas is unavailable for the bezel texture');
		const image = context.createImageData(resolution, resolution);

		const smooth = (t: number) => t * t * (3 - 2 * t);
		for (let y = 0; y < resolution; y++) {
			for (let x = 0; x < resolution; x++) {
				let value = 0;
				let amplitude = 0.5;
				let total = 0;
				for (const { period, lattice } of octaves) {
					const fx = (x / resolution) * period;
					const fy = (y / resolution) * period;
					const x0 = Math.floor(fx);
					const y0 = Math.floor(fy);
					const tx = smooth(fx - x0);
					const ty = smooth(fy - y0);
					const x1 = (x0 + 1) % period;
					const y1 = (y0 + 1) % period;
					const top = lattice[y0 * period + x0] * (1 - tx) + lattice[y0 * period + x1] * tx;
					const bottom = lattice[y1 * period + x0] * (1 - tx) + lattice[y1 * period + x1] * tx;
					value += (top * (1 - ty) + bottom * ty) * amplitude;
					total += amplitude;
					amplitude *= 0.85;
				}
				const grey = Math.round((value / total) * 255);
				const at = (y * resolution + x) * 4;
				image.data[at] = image.data[at + 1] = image.data[at + 2] = grey;
				image.data[at + 3] = 255;
			}
		}
		context.putImageData(image, 0, 0);

		const texture = new CanvasTexture(canvas);
		texture.wrapS = texture.wrapT = RepeatWrapping;
		texture.repeat.set(0.25, 0.25);
		return texture;
	}

	const noiseTexture = plasticTexture(1024);

	RectAreaLightUniformsLib.init();

	// The canvas stays transparent: the studio HDRI only lights and reflects off the plastic
	// (Environment defaults to isBackground = false) and nothing is ever drawn behind the frame.
	scene.background = null;
	renderer.setClearColor(0x000000, 0);
	$effect(() => {
		scene.environmentIntensity = 0.4;
		return () => {
			scene.environmentIntensity = 1;
		};
	});

	const keyShadow = (light: DirectionalLight) => {
		light.shadow.camera.left = -12;
		light.shadow.camera.right = 12;
		light.shadow.camera.top = 8;
		light.shadow.camera.bottom = -8;
		light.shadow.camera.far = 40;
		light.shadow.bias = -0.0004;
		light.shadow.normalBias = 0.02;
	};
	const aim = (target: [number, number, number]) => (light: RectAreaLight) => light.lookAt(...target);

	// Post-processing: the composer owns the frame, so Threlte's own render is switched off.
	// `alpha` keeps the screen hole transparent over the DOM behind the canvas.
	const bloom = new BloomEffect({
		luminanceThreshold: 0.8,
		luminanceSmoothing: 0.1,
		intensity: 1.5,
		mipmapBlur: true
	});
	const aberration = new ChromaticAberrationEffect({
		offset: new Vector2(0.001, 0.001),
		radialModulation: true,
		modulationOffset: 0.3
	});
	const grain = new NoiseEffect({ premultiply: true, blendFunction: BlendFunction.SCREEN });
	grain.blendMode.opacity.value = 0.05;

	const composer = new EffectComposer(renderer, { alpha: true, multisampling: 4 });
	composer.addPass(new RenderPass(scene, camera.current));
	composer.addPass(new EffectPass(camera.current, bloom, aberration, grain));

	$effect.pre(() => {
		autoRender.set(false);
		return () => autoRender.set(true);
	});

	$effect(() => {
		composer.setMainCamera(camera.current);
	});

	$effect(() => {
		const { width: w, height: h } = size.current;
		if (w > 0 && h > 0) composer.setSize(w, h, false);
	});

	useTask((delta) => composer.render(delta), { stage: renderStage, autoInvalidate: false });

	onDestroy(() => {
		composer.dispose();
		noiseTexture.dispose();
	});
</script>

<Environment url="/hdri/studio.hdr" />

<T.PerspectiveCamera makeDefault position={[0, 0, DISTANCE]} fov={FOV} near={1} far={60} />

<T.Mesh position={[0, 0, frontZ]} castShadow receiveShadow>
	<T.ExtrudeGeometry args={[outline, bevel]} />
	<T.MeshPhysicalMaterial
		color="#58534a"
		roughness={0.95}
		metalness={0.1}
		clearcoat={1.0}
		clearcoatRoughness={0.3}
		roughnessMap={noiseTexture}
		map={noiseTexture}
		bumpMap={noiseTexture}
		bumpScale={0.5}
	/>
</T.Mesh>

<!-- Lighting: barely any fill, a hard key from the top left, a ceiling strip on the top
     bevel, and the tube's own green glow thrown onto the inner lip. -->
<T.AmbientLight intensity={0.1} />
<T.DirectionalLight position={[-5, 5, 5]} intensity={1.4} castShadow shadow.mapSize={[2048, 2048]} oncreate={keyShadow} />
<T.RectAreaLight position={[0, 3, 5]} width={8} height={2} intensity={2} color="#ffffff" oncreate={aim([0, 1, 0])} />
<T.RectAreaLight
	position={[0, 0, -0.5]}
	width={innerWidth}
	height={innerHeight}
	intensity={0.6}
	color="#33ff00"
	oncreate={aim([0, 0, 5])}
/>
