<script lang="ts">
	let { size = 'sm' }: { size?: 'sm' | 'lg' } = $props();

	// One stable id per instance keeps the rough-edge filter unique on the page.
	const uid = $props.id();
	const seed = Number(uid.replace(/\D/g, '').slice(-3)) || 7;
</script>

<span class="ink-stamp" data-size={size}>
	<svg class="frame" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<filter id={`rough-${uid}`} x="-16%" y="-34%" width="132%" height="168%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.045 0.12"
					numOctaves="2"
					seed={seed}
					result="noise"
				/>
				<feDisplacementMap
					in="SourceGraphic"
					in2="noise"
					scale="3.4"
					xChannelSelector="R"
					yChannelSelector="G"
					result="warped"
				/>
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.58"
					numOctaves="2"
					seed={seed + 3}
					result="grain"
				/>
				<feColorMatrix
					in="grain"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.9 -0.62"
					result="holes"
				/>
				<feComposite in="warped" in2="holes" operator="out" />
			</filter>
			<pattern id={`speck-${uid}`} width="7" height="7" patternUnits="userSpaceOnUse">
				<circle cx="1.2" cy="1.4" r="0.5" fill="currentColor" />
				<circle cx="4.6" cy="3.1" r="0.34" fill="currentColor" />
				<circle cx="2.6" cy="5.4" r="0.28" fill="currentColor" />
			</pattern>
		</defs>
		<g filter={`url(#rough-${uid})`} fill="none" stroke="currentColor" stroke-linejoin="miter">
			<rect x="2" y="2" width="116" height="36" stroke-width="2.3" />
			<rect x="6.5" y="6.5" width="107" height="27" stroke-width="0.7" opacity="0.62" />
		</g>
		<rect
			x="8"
			y="8"
			width="104"
			height="24"
			fill={`url(#speck-${uid})`}
			opacity="0.3"
		/>
	</svg>
	<span class="word">[ PASSED ]</span>
</span>

<style>
	.ink-stamp {
		position: relative;
		display: inline-block;
		width: 5.9rem;
		height: 2rem;
		color: inherit;
		opacity: 0.9;
		transform: rotate(-7deg);
		/* Uneven hand pressure: the impression thins toward the sheet edge. */
		-webkit-mask-image: radial-gradient(118% 150% at 38% 42%, #000 54%, rgba(0, 0, 0, 0.62) 100%);
		mask-image: radial-gradient(118% 150% at 38% 42%, #000 54%, rgba(0, 0, 0, 0.62) 100%);
		pointer-events: none;
	}

	.frame {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.word {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding-top: 0.08rem;
		font-family: var(--font-mono);
		font-size: 0.58rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.06em;
		white-space: nowrap;
		text-shadow: 0.7px 0.55px 0.25px currentColor;
	}

	.ink-stamp[data-size='lg'] {
		width: 8.4rem;
		height: 2.75rem;
	}

	.ink-stamp[data-size='lg'] .word {
		font-size: 0.78rem;
		letter-spacing: 0.08em;
	}

	@media (prefers-reduced-motion: reduce) {
		.ink-stamp {
			transform: none;
		}
	}
</style>
