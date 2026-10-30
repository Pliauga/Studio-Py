<script lang="ts">
	// The ghost in the machine: an operator drawn by the terminal itself, set behind the
	// lesson text at a whisper so it never competes with the reading.
	const ART = String.raw`
            _.-"""""""-._
          .'    _   _    '.
         /     (o) (o)     \
    ()  |         ^         |  ()
    ||  |      .-----.      |  ||
    ||   \     '-___-'     /   ||
    ||    '.             .'    ||
    ||   __'-._________.-'__   ||
    '|  /  |    |   |    |  \  |'
     '-/   |    |   |    |   \-'
      /    |____|   |____|    \
     /      /   |   |   \      \
    .------------------------------.
    | > LOGIN: OPERATOR_01         |
    | > BADGE VERIFIED             |
    | > WAYPOINT ROUTE LOADED      |
    | > _                          |
    '------------------------------'
      [==][==][==][==][==][==][==]
`;
</script>

<div class="ghost" aria-hidden="true">
	<pre>{ART.trim()}</pre>
</div>

<style>
	/* The wrapper spans the screen; the art sticks to the bottom-left of the viewport like
	   a diagnostic watermark while the lesson scrolls past it. */
	.ghost {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		user-select: none;
	}

	pre {
		position: sticky;
		top: calc(100svh - 28rem);
		width: max-content;
		margin: 0 0 0 clamp(8px, 1.4vw, 28px);
		font-family: var(--font-pixel);
		font-size: clamp(16px, 1.4vw, 24px);
		line-height: 0.95;
		white-space: pre;
		color: rgba(51, 255, 0, 0.2);
		text-shadow: 0 0 6px rgba(51, 255, 0, 0.4);
	}

	@media (max-width: 1100px) {
		.ghost {
			display: none;
		}
	}
</style>
