<script lang="ts">
	import PyExercise from '#lib/components/PyExercise.svelte';
</script>

<svelte:head>
	<title>PyExercise preview — Studio Py</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<header class="intro">
		<p class="kicker"><span class="kicker-dot"></span>Studio Py / Exercises</p>
		<h1>Run the field code.</h1>
		<p class="lede">
			A live editor for the course exercises. Python runs in a worker on this machine;
			pandas streams from the official Pyodide CDN the first time it is needed.
		</p>

		<div class="meta" aria-label="Preview details">
			<span><b>03</b> exercises</span>
			<span><b>Local</b> Python runtime</span>
			<span><b>CDN</b> packages on demand</span>
		</div>
	</header>

	<div class="stack">
		<PyExercise
			id="w02-compare-disk-percent"
			initialCode="percent = 105.0&#10;print(percent >= 90)  # TODO: a disk over 100% is not a warning"
			expectedOutput="False"
		/>

		<PyExercise
			id="w06-filter-percent"
			initialCode="import pandas as pd&#10;servers = pd.DataFrame(dict(hostname=['srv-01', 'srv-03', 'srv-05'], percent=[87, 120, 101]))&#10;over = servers['percent'] >= 100  # TODO: that is a mask, not the filtered rows&#10;print(len(over))"
			expectedOutput="2"
		/>

		<PyExercise
			id="w09-hash-verify"
			initialCode="import hashlib&#10;typed = 'password123'&#10;stored_hash = hashlib.sha256(b'password123').hexdigest()&#10;match = hashlib.sha256(typed)  # TODO: hash the bytes, not the str&#10;print(match.hexdigest() == stored_hash)"
			expectedOutput="True"
		/>
	</div>

	<p class="footnote">Internal preview route · not linked from the course</p>
</main>

<style>
	main {
		max-width: 96rem;
		margin: 0 auto;
		padding: 12rem 2.8rem;
		color: var(--color-ink);
	}

	.intro {
		margin-bottom: 4.8rem;
	}

	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 0.9rem;
		margin: 0 0 2.2rem;
		font-family: var(--font-mono);
		font-size: 1.2rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.kicker-dot {
		width: 0.7rem;
		height: 0.7rem;
		background: var(--color-ink);
	}

	h1 {
		margin: 0 0 1.8rem;
		font-family: var(--font-display);
		font-size: clamp(5.6rem, 10vw, 11rem);
		font-weight: 500;
		line-height: 0.94;
		letter-spacing: -0.025em;
		text-transform: uppercase;
	}

	.lede {
		max-width: 58ch;
		margin: 0;
		font-family: var(--font-body);
		font-size: 2rem;
		line-height: 1.5;
		text-wrap: pretty;
		color: var(--color-muted);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 2.6rem;
		margin-top: 2.8rem;
		padding-top: 1.6rem;
		border-top: 1px solid var(--color-ink);
		font-family: var(--font-mono);
		font-size: 1.1rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.meta b {
		margin-right: 0.5rem;
		font-weight: 700;
		color: var(--color-ink);
	}

	.stack {
		display: grid;
		gap: 2.8rem;
	}

	.footnote {
		margin: 5.2rem 0 0;
		font-family: var(--font-mono);
		font-size: 1.1rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	@media (max-width: 640px) {
		main {
			padding: 8rem 1.6rem;
		}

		.intro {
			margin-bottom: 3rem;
		}

		.stack {
			gap: 2rem;
		}
	}
</style>
