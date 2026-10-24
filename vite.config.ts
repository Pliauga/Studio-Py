import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { lessonPreprocess } from './src/lib/content/mdx.ts';

export default defineConfig({
	plugins: [
		sveltekit({
			// Lessons are authored as MDX and imported as components; the extension
			// has to be registered with both SvelteKit (route/module scanning) and
			// vite-plugin-svelte (compilation).
			extensions: ['.svelte', '.mdx'],
			preprocess: lessonPreprocess,
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// `_headers` (the CSP) sits in the project root, not `static/` — this
			// adapter rejects it there and copies the root file into the build output.
			adapter: adapter()
		})
	]
});
