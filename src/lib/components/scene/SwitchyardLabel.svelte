<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { CanvasTexture, DoubleSide, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';

	type Props = {
		text: string;
		position: [number, number, number];
		rotation?: [number, number, number];
		width: number;
		height: number;
		color: string;
	};

	let { text, position, rotation = [0, 0, 0], width, height, color }: Props = $props();
	const { invalidate } = useThrelte();
	let texture = $state<CanvasTexture | null>(null);

	$effect(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 1024;
		canvas.height = Math.max(128, Math.round((1024 * height) / width));
		const context = canvas.getContext('2d');
		if (!context) return;
		const lines = text.split('\n');
		const fontSize = Math.floor((canvas.height / Math.max(lines.length, 1)) * 0.64);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = color;
		context.font = `700 ${fontSize}px "Courier New", monospace`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		const lineHeight = canvas.height / Math.max(lines.length, 1);
		lines.forEach((line, index) => {
			context.fillText(line, canvas.width / 2, lineHeight * (index + 0.5), canvas.width * 0.94);
		});
		const next = new CanvasTexture(canvas);
		next.colorSpace = SRGBColorSpace;
		next.minFilter = LinearMipmapLinearFilter;
		next.anisotropy = 4;
		texture = next;
		invalidate();
		return () => next.dispose();
	});
</script>

{#if texture}
	<T.Mesh {position} {rotation} renderOrder={2}>
		<T.PlaneGeometry args={[width, height]} />
		<T.MeshBasicMaterial
			map={texture}
			transparent
			alphaTest={0.01}
			depthWrite={false}
			side={DoubleSide}
			toneMapped={false}
		/>
	</T.Mesh>
{/if}
