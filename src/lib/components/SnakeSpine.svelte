<script lang="ts">
	// The route's progress as the poster's snake: the body tiles down the sheet and
	// the head sits on the current mark. Both slices come from one 8-bit plate at a
	// whole multiple of its pixel grid (32 CSS px = 8 art px), and the body slice is
	// a seamless two-row tile, so the column stretches without resampling.
	let { percent }: { percent: number } = $props();
</script>

<div class="snake" style={`--progress:${percent}`} aria-hidden="true">
	<span class="body"></span>
	<span class="head"></span>
</div>

<style>
	.snake {
		--sprite: 32px;
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(-1 * var(--sprite));
		z-index: 2;
		display: block;
		width: var(--sprite);
		pointer-events: none;
	}

	.body,
	.head {
		position: absolute;
		left: 0;
		display: block;
		width: var(--sprite);
		/* Both fallbacks: a filtered bitmap reads as a green blur, not a snake. */
		image-rendering: -webkit-optimize-contrast;
		image-rendering: pixelated;
	}

	.body {
		top: 0;
		height: min(calc(var(--progress) * 1%), calc(100% - var(--sprite)));
		background-image: url(/snake/snake-body.png);
		background-repeat: repeat-y;
		background-size: var(--sprite) calc(var(--sprite) / 4);
		transition: height var(--duration-3) var(--ease-standard);
	}

	.head {
		top: min(calc(var(--progress) * 1%), calc(100% - var(--sprite)));
		height: var(--sprite);
		background-image: url(/snake/snake-head.png);
		background-repeat: no-repeat;
		background-size: var(--sprite) var(--sprite);
		transition: top var(--duration-3) var(--ease-standard);
	}

	@media (max-width: 620px) {
		.snake {
			--sprite: 24px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.body,
		.head {
			transition: none;
		}
	}
</style>
