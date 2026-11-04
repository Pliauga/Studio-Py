<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Component } from 'svelte';

	/** The window exit. Must match the 0.3s transition in the stylesheet. */
	const WINDOW_ANIM_MS = 300;

	let HalftonePlate = $state.raw<Component<{ reduceMotion: boolean }> | null>(null);
	let reduceMotion = $state(false);

	/** The boot overlay is an after-paint flourish: it never gates the poster's HTML. */
	const BOOT_KEY = 'studio-py:booted';
	/** A short mechanical start-up: the log fills the screen, the operator draws, then the
	 *  overlay lifts. The cascade itself is timed entirely in CSS (`animation-delay`, keyed
	 *  on `--i`, so main-thread jank cannot strand it part-printed); these two only place
	 *  the fade and the unmount that follows it. */
	const BOOT_HOLD_MS = 2500;
	const BOOT_FADE_MS = 400;

	/** The system log. Counts and addresses are flavour: they describe a dying machine. */
	const BOOT_LOG = [
		'INITIALIZING STUDIO-PY OS v1.0...',
		'MOUNTING /dev/py0 ................ OK',
		'LOADING KERNEL ................... OK',
		'CHECKING KERNEL INTEGRITY ........ OK',
		'LINKING CPython RUNTIME .......... OK',
		'CALIBRATING PHOSPHOR MATRIX ...... OK',
		'LOADING MODULE_W01 ................ OK',
		'LOADING MODULE_W02 ................ OK',
		'PROBING INCIDENT BUS ............. 1 FAULT',
		'WARNING: SRV-07 DISK AT 96%',
		'WARNING: UNACKNOWLEDGED PAGE AT 03:14',
		'OPERATOR BADGE REQUIRED',
		'RENDERING OPERATOR ...'
	];

	/** The operator, drawn by the terminal itself: puffer jacket, deadpan, on shift.
	 *  The same glyph set as the lesson watermark, so the mascot is one character and not
	 *  two drawings that merely resemble each other. */
	const BOOT_ART = [
		"            _.-\"\"\"\"\"\"\"-._",
		"          .'    _   _    '.",
		"         /     (o) (o)     \\",
		"    ()  |         ^         |  ()",
		"    ||  |      .-----.      |  ||",
		"    ||   \\     '-___-'     /   ||",
		"    ||    '.             .'    ||",
		"    ||   __'-._________.-'__   ||",
		"    '|  /  |    |   |    |  \\  |'",
		"     '-/   |    |   |    |   \\-'",
		"      /    |____|   |____|    \\",
		"     /      /   |   |   \\      \\",
		"   [==][==][==][==][==][==][==]"
	];

	let booting = $state(false);
	let bootLeaving = $state(false);

	/** The halftone is a whole three.js scene. Hydrating it competes with the boot for the
	 *  main thread — it cost ~3.2s of jank and starved the boot's own timers — so it waits
	 *  for idle after the overlay has lifted. The poster is painted without it. */
	const showHalftone = () => {
		const start = () =>
			void import('#lib/components/scene/HalftonePlate.svelte').then((module) => {
				HalftonePlate = module.default;
			});
		if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
		else setTimeout(start, 200);
	};

	/** Unmounts the overlay once, whether the fade ended or was never going to. */
	let bootEnded = false;
	const endBoot = () => {
		if (bootEnded) return;
		bootEnded = true;
		booting = false;
		showHalftone();
	};

	onMount(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// One boot per session, never under reduced motion, and never at the cost of a
		// poster the browser has already painted: the overlay mounts on top of it.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			showHalftone();
			return;
		}
		try {
			if (sessionStorage.getItem(BOOT_KEY)) {
				showHalftone();
				return;
			}
			sessionStorage.setItem(BOOT_KEY, '1');
		} catch {
			// Storage can be blocked; a visitor who blocks it sees the poster immediately.
			showHalftone();
			return;
		}

		booting = true;
		// The lines paint from CSS animation-delay, so the sequence survives main-thread
		// jank. The lift is an animation rather than a transition — a transition needs a
		// painted frame after the class lands, and the three.js plate can block the thread
		// past the unmount, so the overlay vanished instead of dissolving. The unmount
		// rides the animation's own end; the timer behind it is a backstop for a suppressed
		// animation (reduced motion, an interrupted run), which never fires that event. It
		// is armed when the fade starts, not at mount, or jank before the fade would spend
		// the backstop early and cut the animation off mid-dissolve.
		window.setTimeout(() => {
			bootLeaving = true;
			window.setTimeout(endBoot, BOOT_FADE_MS + 1000);
		}, BOOT_HOLD_MS);
	});

	/**
	 * The red and yellow lights both leave the desk, but they are different verbs: red
	 * shuts the document (it shrinks away), yellow hands the desk over (it drops out of
	 * sight toward the dock). Each plays its own exit and only then routes, so the
	 * animation is seen rather than cut off by the navigation.
	 */
	let exit = $state<'idle' | 'closing' | 'minimizing'>('idle');

	/** Reduced motion gets the destination, not a 300ms wait for a transition it opted out of. */
	function exitsAnimated(): boolean {
		return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function leaveDesktop(kind: 'closing' | 'minimizing'): void {
		if (exit !== 'idle') return;
		if (!exitsAnimated()) {
			void goto('/dashboard');
			return;
		}
		exit = kind;
		window.setTimeout(() => void goto('/dashboard'), WINDOW_ANIM_MS);
	}

	/** The red light: the README is a document, so it shrinks in place and fades. */
	function close(): void {
		leaveDesktop('closing');
	}

	/** The yellow light: the document drops away toward the dock. */
	function minimize(): void {
		leaveDesktop('minimizing');
	}

	/** The call to action hands the desk over exactly as the red light does: the same
	 *  mac-window exit, then the route. The anchor keeps its href so the desktop can still
	 *  be opened in a new tab; a plain left click is intercepted. */
	const LAUNCH_BOUNCE_MS = 300;
	let launching = $state(false);

	function launch(event: MouseEvent): void {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		)
			return;
		event.preventDefault();
		if (launching || exit !== 'idle') return;
		if (!exitsAnimated()) {
			leaveDesktop('closing');
			return;
		}
		// The button is pressed like an Aqua bead first; the window leaves once it settles.
		launching = true;
		window.setTimeout(() => leaveDesktop('closing'), LAUNCH_BOUNCE_MS);
	}
</script>

<svelte:head>
	<title>Studio Py — a Python curriculum, run like an incident</title>
	<meta
		name="description"
		content="Twenty-four modules of small Python programs: variables, pandas, SQL, hashing, Streamlit and deployment."
	/>
	<link
		rel="preload"
		as="image"
		type="image/webp"
		href="/logo_v2.webp"
		fetchpriority="high"
	/>
</svelte:head>

<!-- The landing is a document on the desktop: a README.md window resting on the
     work surface, with its own chrome, its own scroll box, and an action bar at its
     foot. The desktop, the menu bar and the dock belong to the layout. -->
<div class="desktop" class:settling={bootLeaving}>
	<section
		class="mac-window"
		class:closing={exit === 'closing'}
		class:minimized={exit === 'minimizing'}
		aria-labelledby="readme-title"
	>
		<div class="mac-titlebar">
			<span class="mac-lights">
				<button type="button" class="light red" aria-label="Close — go to the desktop" title="Close" onclick={close}>
					<span class="mark" aria-hidden="true">×</span>
				</button>
				<button type="button" class="light yellow" aria-label="Minimise — go to the desktop" title="Minimise" onclick={minimize}>
					<span class="mark" aria-hidden="true">−</span>
				</button>
				<button type="button" class="light green" aria-label="Enter the desktop" title="Enter the desktop" onclick={close}>
					<span class="mark" aria-hidden="true">+</span>
				</button>
			</span>
			<p class="mac-filename" id="readme-title">
				<span class="mac-doc" aria-hidden="true">📄</span>
				README.md
			</p>
		</div>

		<div class="mac-body" data-mac-scroll>
			<main class="hero">
				<figure class="plate">
					<div class="frame">
						<div class="poster-cell">
							<img
								class="poster-image"
								src="/logo_v2.webp"
								alt="Studio Py title card: a pixel-type wordmark above a figure in a blue puffer holding a pixel snake, with a printed caption line beneath the illustration"
								width="1888"
								height="2218"
								fetchpriority="high"
							/>
						</div>
						{#if HalftonePlate}
							<div class="halftone" aria-hidden="true">
								<HalftonePlate {reduceMotion} />
							</div>
						{/if}
					</div>
				</figure>

				<div class="readout">
					<h1 class="headline">Stop Learning.<br />Start Patching.</h1>
					<p class="standfirst">
						A psychological incident-response curriculum for Python. Every waypoint is a broken system.
						Read the traceback. Find the trap. Fix the file. No playgrounds. No excuses.
					</p>
					<dl class="facts">
						<div class="fact"><dt>Modules</dt><dd>24, one incident each</dd></div>
						<div class="fact"><dt>First run</dt><dd>16 minutes, in the browser</dd></div>
						<div class="fact"><dt>Setup</dt><dd>None — Python runs in the page</dd></div>
					</dl>
					<a class="aqua-btn-blue launch" class:pressed={launching} href="/dashboard" onclick={launch}>
						[ Launch Desktop → ]
					</a>
				</div>
			</main>
		</div>

	</section>
</div>

<!-- The machine boots, then hands off to the print. A full-screen overlay rather than a
     shutter inside the document: the start-up is the OS waking up, so it covers the
     desktop, the menu bar and the dock, and the README window is simply what is behind it
     when it lifts. Rendered only after mount, so the poster keeps the LCP. The lines are
     all in the DOM and revealed by CSS delay, so main-thread jank cannot strand the
     sequence part-printed. -->
{#if booting}
	<div
		class="boot"
		class:leaving={bootLeaving}
		aria-hidden="true"
		onanimationend={(event) => {
			// The log lines animate too, and `animationend` bubbles: without this guard the
			// first 1ms line reveal would unmount the whole overlay.
			if (event.target === event.currentTarget) endBoot();
		}}
	>
		<div class="boot-log">
			{#each BOOT_LOG as line, index (index)}
				<p style={`--i: ${index}`}>&gt; {line}</p>
			{/each}
			<pre class="boot-art">{#each BOOT_ART as artLine, index (index)}<span style={`--i: ${index}`}
					>{artLine}{'\n'}</span
				>{/each}</pre>
			<p style={`--i: ${BOOT_LOG.length + BOOT_ART.length}`} class="boot-handoff">
				&gt; HANDOFF TO OPERATOR.<span class="boot-caret"></span>
			</p>
		</div>
	</div>
{/if}

<style>
	/* ---- the README window ------------------------------------------------------------
	   A document viewer resting on the desktop: an Aqua title bar, a body that scrolls
	   inside the frame, and an action bar at the foot. The window sits where a macOS
	   window would — clear of the menu bar above and the dock below. */
	.desktop {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(16px, 3vh, 40px) clamp(12px, 2.4vw, 40px)
			calc(var(--mac-dock-gutter) - var(--mac-menubar-h));
		box-sizing: border-box;
	}

	/* A document window, not a takeover: 900×600 is where a README sits on a desktop
	   that still shows wallpaper around it. The vw/vh caps keep it inside the surface
	   on a small screen without ever letting it fill one. */
	.mac-window {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 900px;
		max-width: 90vw;
		height: 600px;
		max-height: 80vh;
		margin: auto;
		border-radius: 12px;
		overflow: hidden;
		background: var(--color-paper);
		box-shadow: var(--mac-window-shadow);
		transform-origin: 50% 100%;
		transition:
			transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	/* The red light. A document shrinks in place as it is put away, so the scale is
	   small and the fade carries most of the exit. */
	.mac-window.closing {
		transform: scale(0.9);
		opacity: 0;
		pointer-events: none;
	}

	/* The yellow light. macOS minimises toward the Dock, which is at the foot of the
	   screen: the window drops and shrinks at the same time. */
	.mac-window.minimized {
		transform: translateY(50vh) scale(0.2);
		opacity: 0;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.mac-window {
			transition: none;
		}
	}

	.mac-titlebar {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		height: 38px;
		padding: 0 14px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.18);
		background: var(--mac-titlebar-bg);
		color: var(--mac-aqua-ink);
		font-family: var(--mac-ui);
		user-select: none;
	}

	.mac-filename {
		position: absolute;
		left: 50%;
		max-width: calc(100% - 11rem);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-family: var(--mac-ui);
		font-size: 13px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.01em;
		transform: translateX(-50%);
	}

	.mac-doc {
		font-size: 12px;
	}

	.mac-lights {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}

	/* The Aqua lights: 12px glass beads, the glyph revealed only on hover so the chrome
	   stays quiet until it is asked to do something. The bead reads as glass because the
	   body is a radial gradient lit from upper left, the drop shadow lifts it off the
	   pinstripes, and the inset pair curves the top and bottom lips away from the eye. */
	.light {
		position: relative;
		display: grid;
		place-items: center;
		width: 12px;
		height: 12px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.35),
			0 0 0 0.5px rgba(0, 0, 0, 0.22),
			inset 0 1px 1.5px rgba(255, 255, 255, 0.95),
			inset 0 -1.5px 2px rgba(0, 0, 0, 0.3);
		cursor: pointer;
	}

	/* The specular hotspot and the rim bounce, drawn as two overlays so every colour of
	   light shares one finish. */
	.light::before {
		content: '';
		position: absolute;
		top: 1px;
		left: 2px;
		width: 6px;
		height: 4px;
		border-radius: 50%;
		background: radial-gradient(
			ellipse at center,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(255, 255, 255, 0.1) 85%
		);
		pointer-events: none;
	}

	.light.red {
		background: radial-gradient(circle at 50% 60%, #ff5f57 0%, #e0443e 100%);
	}

	.light.yellow {
		background: radial-gradient(circle at 50% 60%, #febc2e 0%, #e0a01c 100%);
	}

	.light.green {
		background: radial-gradient(circle at 50% 60%, #28c840 0%, #1e9e33 100%);
	}

	.light .mark {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--mac-ui);
		font-size: 9px;
		font-weight: 700;
		line-height: 1;
		color: rgba(0, 0, 0, 0.6);
		opacity: 0;
		pointer-events: none;
	}

	.mac-lights:hover .mark,
	.light:focus-visible .mark {
		opacity: 1;
	}

	.light:focus-visible {
		outline: 2px solid var(--mac-blue);
		outline-offset: 2px;
	}

	/* The document: the only scroll box on the page. The frame never moves. The vertical
	   padding is deliberately tight: the window is a fixed 600px, so any more than this
	   and the column outgrows the frame and grows a scrollbar the print never needed. */
	.mac-body {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 24px clamp(20px, 3vw, 40px);
		background: var(--color-paper);
	}

	/* Flat print: the paper and typography carry the composition without a lighting effect.
	   `start` is what puts the "S" of the headline on the same line as the top of the
	   print: centring the row floated the shorter text column down to the plate's middle,
	   which read as a gap under the title bar. */
	.hero {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
		align-items: start;
		gap: clamp(24px, 4.5vw, 88px);
	}

	/* The plate now stands alone: the print is the only thing in this column that paints,
	   so the figure has nothing underneath it to align to. */
	.plate {
		display: block;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		margin: 0 auto;
	}

	/* Sized by CSS, never by the file: the plate cannot move when the print lands.
	   The print takes the smaller of the column width and the height budget, then derives its
	   height from the ratio. `max-width: 100%` does not work here: on this grid item Chrome
	   computes it as 100% and still lays the box out at the height-derived width (524px in a
	   438px column), so the cap has to be inside the width itself. */
	.frame {
		/* The window body is the measure now, not the viewport: subtract the chrome
		   (menu bar, title bar, footer, dock gutter and the body's own padding) so the
		   print lands inside the document instead of overflowing it. 514px is the body's
		   own box inside the fixed 600px window — 38px of title bar and 2×24px of padding —
		   so the print is capped by the frame it is actually sitting in. */
		--frame-h: min(56vh, 514px, calc(100vh - 360px));
		position: relative;
		isolation: isolate;
		width: min(100%, calc(var(--frame-h) * 1888 / 2218));
		height: auto;
		aspect-ratio: 1888 / 2218;
		min-width: 0;
		max-width: 100%;
		line-height: 0;
	}

	/* Newsprint grain over the print only. The poster stays pale in both themes, so
	   multiply is the blend that actually darkens it; screen/overlay would be invisible. */
	.frame::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n' x='0' y='0' width='100%25' height='100%25' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0.33 0.33 0.33 0 0.3 0.33 0.33 0.33 0 0.3 0.33 0.33 0.33 0 0.3 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
		background-size: 200px 200px;
		mix-blend-mode: multiply;
		opacity: 0.1;
		pointer-events: none;
	}

	/* The halftone screen is a WebGL canvas: one dot per cell, its radius the program's
	   answer. It is printed matter that the machine half re-inks, so it multiplies into
	   the poster like ink and stays off until a run has said something. */
	.halftone {
		position: absolute;
		inset: 1px;
		mix-blend-mode: multiply;
		pointer-events: none;
		z-index: 1;
	}

	/* The print fills the cell exactly, edge to edge. The frame ratio is the asset's own
	   ratio (1888:2218), so a percentage width resolves to the frame height with no crop;
	   `height: auto` keeps it proportional if the artwork is ever replaced at another ratio
	   instead of squashing it. */
	.poster-image {
		display: block;
		width: 100%;
		max-width: 100%;
		height: auto;
		/* The print scales to the frame instead of setting the frame's height: whatever the
		   artwork's pixel height, it never pushes the body past the window's 600px. */
		max-height: 100%;
		object-fit: contain;
	}

	/* Dark mode is a print seen at night, not an inverted one: the poster keeps its
	   ink and loses luminance, so it stops glaring against the black page. */
	:global(html[data-theme='dark']) .poster-image {
		filter: brightness(0.78) contrast(1.04);
	}

	/* No border, outline, shadow or pseudo-element: the print is the only thing in
	   this column that paints. */
	.poster-cell {
		position: relative;
		width: 100%;
		height: 100%;
	}

	/* The Aqua call to action. It is a real anchor so the desktop can be opened in a new
	   tab, mid-click-modifier and all; the glass bead is the shell, the terminal voice is
	   dropped here because the button belongs to the chrome, not the document. */
	.launch {
		margin-top: 2px;
		padding: 9px 20px;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-decoration: none;
		white-space: nowrap;
	}

	/* The press: down, a small overshoot, home. The spring curve overshoots on its own. */
	.launch.pressed {
		animation: launch-bounce 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes launch-bounce {
		0% {
			transform: scale(1);
		}
		33% {
			transform: scale(0.95);
		}
		66% {
			transform: scale(1.02);
		}
		100% {
			transform: scale(1);
		}
	}

	.readout {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: clamp(18px, 2.2vw, 28px);
		max-width: 52ch;
		min-width: 0;
		margin-top: 0;
		padding-top: 0;
	}

	/* The headline is set against the readout's own column, not the viewport: the window
	   only ever gives the text column ~42% of its width, so a vw-based size ran past the
	   body's right padding and bled out of the frame. */
	.headline {
		margin: 0;
		max-width: 100%;
		/* Pixelita ships a single weight (400). Asking for 900 above made the browser
		   synthesise a bold by smearing the letterforms, which on a pixel face reads as a
		   blur rather than a heavier stroke — so the weight is stated, not inherited. */
		font-family: 'Pixelita', var(--font-display), serif;
		font-weight: 400;
		/* The window is a fixed 900px card now, so the display type cannot scale off the
		   viewport — `4.4vw` measured the screen and overflowed the 317px readout column
		   into four wrapped lines. The ceiling is set by the column, not the display. */
		font-size: clamp(2rem, 2.6vw, 2.5rem);
		line-height: 0.95;
		/* Pixel type is drawn on a grid: negative tracking collides the blocks, and the
		   face already carries its own sidebearings. */
		letter-spacing: 0;
		overflow-wrap: break-word;
		color: #000000;
	}

	/* Black ink needs paper: on the dark theme the ink token carries the same job. */
	:global(html[data-theme='dark']) .headline {
		color: var(--color-ink);
	}

	.standfirst {
		margin: 0;
		max-width: 45ch;
		font-family: var(--font-display);
		font-size: clamp(0.95rem, 1.1vw, 1.05rem);
		line-height: 1.5;
		letter-spacing: -0.005em;
		color: var(--color-ink);
	}

	/* Three facts, set as a readout table: machine half, so mono and hairline rules. */
	.facts {
		display: grid;
		gap: 0;
		width: 100%;
		margin: 0;
		border-top: 1px solid rgba(127, 127, 127, 0.35);
	}

	.fact {
		display: grid;
		grid-template-columns: 8.5em minmax(0, 1fr);
		align-items: baseline;
		gap: 12px;
		padding: 9px 0;
		border-bottom: 1px solid rgba(127, 127, 127, 0.35);
	}

	.fact dt {
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.2;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-tertiary);
	}

	.fact dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: clamp(11px, 1.05vw, 12.5px);
		line-height: 1.35;
		letter-spacing: 0.02em;
	}

	/* ---- The boot ---------------------------------------------------------------------
	   A full-screen phosphor terminal over the whole machine, not a shutter inside the
	   document. It fades out, so the reveal is the desktop being uncovered rather than
	   being drawn: one mechanical beat, then the wallpaper, the menu bar, the dock and the
	   README window all at once. It is the OS starting up, so it is allowed to cover the
	   chrome — that is what a boot screen does. */
	.boot {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(16px, 3vw, 40px);
		box-sizing: border-box;
		overflow: hidden;
		background: #000;
		color: #33ff00;
		font-family: 'Share Tech Mono', monospace;
		font-size: clamp(0.72rem, 1.5vw, 0.95rem);
		line-height: 1.5;
		letter-spacing: 0.04em;
		opacity: 1;
	}

	/* The lift. An animation, not a transition: a transition needs a painted frame after
	   the class lands, and a blocked main thread meant the overlay was unmounted before it
	   ever began to dissolve. `forwards` holds opacity at zero while the unmount timer
	   runs, so the handoff never flashes the desktop back. */
	.boot.leaving {
		animation: boot-fade 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
		/* The overlay is out of the hit-test the instant it starts fading: a visitor who
		   clicks through the reveal should hit the page, not a ghost. */
		pointer-events: none;
	}

	@keyframes boot-fade {
		to {
			opacity: 0;
		}
	}

	/* The handoff is a zoom through the screen: the console rushes past the viewer while
	   the desktop behind it settles from slightly small to full size. */
	.boot.leaving .boot-log {
		animation: boot-zoom 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes boot-zoom {
		to {
			opacity: 0;
			transform: scale(1.6);
		}
	}

	.desktop.settling {
		animation: desktop-settle 400ms cubic-bezier(0.4, 0, 0.2, 1) backwards;
	}

	@keyframes desktop-settle {
		from {
			transform: scale(0.95);
		}
	}

	/* The console column. Centred, and clipped once it outgrows the screen: the log is a
	   fixed script, so on a short viewport the tail is what should fall off, not the
	   operator's feet. */
	.boot-log {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		width: min(100%, 62rem);
		max-height: 100%;
		overflow: hidden;
	}

	.boot p,
	.boot-art span {
		margin: 0;
		white-space: pre;
		opacity: 0;
		/* Each line lands in sequence. The whole cascade is CSS, so main-thread jank
		   cannot strand the sequence part-printed. */
		animation: boot-line 1ms steps(1, end) forwards;
		animation-delay: calc(var(--i) * 110ms);
	}

	/* The mascot sprays out faster than the log types, so the art still resolves as a
	   picture rather than crawling up one letter at a time. It starts once the log has
	   finished typing, so the two sequences never overlap. */
	/* Log lines are typed in hard steps, a few glyphs at a time, never a smooth wipe. */
	.boot p {
		animation-name: boot-line, boot-type;
		animation-duration: 1ms, 100ms;
		animation-timing-function: steps(1, end), steps(24, end);
		animation-fill-mode: forwards, backwards;
	}

	@keyframes boot-type {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	.boot-art {
		margin: 0.5rem 0 0.4rem;
		font: inherit;
		font-size: 0.92em;
		line-height: 1.05;
		color: #33ff00;
		text-shadow:
			0 0 6px rgba(51, 255, 0, 0.7),
			0 0 18px rgba(51, 255, 0, 0.35);
	}

	.boot-art span {
		animation-delay: calc(1450ms + var(--i) * 45ms);
	}

	.boot-handoff {
		color: #e0ffe0;
		/* Pinned to the tail of the cascade rather than derived from the line count, so the
		   handoff always lands just before the overlay lifts. */
		animation-delay: 2150ms;
	}

	@keyframes boot-line {
		to {
			opacity: 1;
		}
	}

	.boot-caret {
		display: inline-block;
		width: 0.55em;
		height: 1em;
		margin-left: 0.35em;
		vertical-align: -0.12em;
		background: currentColor;
		animation: boot-caret 480ms steps(2, end) infinite;
	}

	@keyframes boot-caret {
		50% {
			opacity: 0;
		}
	}

	@media (max-width: 1199px) {
		.hero {
			grid-template-columns: minmax(0, 60fr) minmax(0, 40fr);
			gap: clamp(20px, 3vw, 56px);
		}

	}

	/* Poster first, then the readout — the correct read on a narrower window. */
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			align-content: start;
			gap: clamp(26px, 6vw, 34px);
		}

		.frame {
			--frame-h: min(34vh, 280px);
			margin-inline: auto;
		}

		.plate {
			gap: 20px;
		}

		.readout {
			max-width: 100%;
			gap: clamp(22px, 4vw, 26px);
		}

		.headline {
			font-size: clamp(2.4rem, 9vw, 3.6rem);
		}

		.standfirst {
			max-width: 45ch;
		}
	}

	@media (max-width: 640px) {
		.desktop {
			padding: 12px 8px calc(var(--mac-dock-gutter) - var(--mac-menubar-h));
		}

		.mac-window {
			border-radius: 10px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* The terminal's own transitions are scoped to the component. */
		* {
			scroll-behavior: auto;
		}

		/* The overlay never mounts under reduced motion; this covers a mid-session
		   preference change while it is still on screen, where a suppressed animation
		   must not leave the lines invisible. */
		.boot p {
			opacity: 1;
			animation: none;
		}

		.boot-caret {
			animation: none;
		}
	}
</style>
