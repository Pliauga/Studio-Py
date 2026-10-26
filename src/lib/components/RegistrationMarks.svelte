<script lang="ts">
	// Registration marks sit on the sheet's four corners, outside the live content.
	// They are printed matter: no motion, no interaction, one hairline of ink.
</script>

<div class="reg-marks" aria-hidden="true">
	<span class="reg tl"></span>
	<span class="reg tr"></span>
	<span class="reg bl"></span>
	<span class="reg br"></span>
</div>

<style>
	.reg-marks {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
	}

	.reg {
		position: absolute;
		width: 23px;
		height: 23px;
		color: var(--color-ink);
		opacity: 0.86;
	}

	/* The marks invert with the ink, but drop one stop so they read as registration
	   on black paper rather than as four glowing ticks. */
	:global(html[data-theme='dark']) .reg {
		opacity: 0.72;
	}

	.reg::before,
	.reg::after {
		content: '';
		position: absolute;
	}

	/* A pressman's crosshair is broken at the centre, never a UI plus. */
	.reg::before {
		top: 11px;
		left: 0;
		width: 23px;
		height: 1px;
		background: linear-gradient(
			to right,
			currentColor 0 9px,
			transparent 9px 14px,
			currentColor 14px 100%
		);
	}

	.reg::after {
		top: 0;
		left: 11px;
		width: 1px;
		height: 23px;
		background: linear-gradient(
			to bottom,
			currentColor 0 9px,
			transparent 9px 14px,
			currentColor 14px 100%
		);
	}

	.tl {
		top: -11px;
		left: -11px;
	}

	.tr {
		top: -11px;
		right: -11px;
	}

	.bl {
		bottom: -11px;
		left: -11px;
	}

	.br {
		right: -11px;
		bottom: -11px;
	}
</style>
