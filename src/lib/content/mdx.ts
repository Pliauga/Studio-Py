import { mdsvex } from 'mdsvex';
import { lessonChapters } from './chapters.ts';

/**
 * mdsvex compiles MDX to a Svelte component but does not know which components
 * the prose uses. This wraps it: the import block goes in after the frontmatter
 * so lessons can write `<PyExercise />` or `<PredictOutput />` without their own
 * `<script>`. `SandboxEmbed` is heavier and imported only when a lesson uses it.
 *
 * mdsvex emits `<script context="module">` for the frontmatter, which Svelte 5
 * still accepts but warns about; the second preprocessor rewrites it to the
 * modern `module` attribute so `svelte-check` stays at zero warnings.
 */
const COMPONENT_IMPORTS = [
	"import PyExercise from '#lib/components/PyExercise.svelte';",
	"import PredictOutput from '#lib/components/lesson/PredictOutput.svelte';"
];

const SANDBOX_IMPORT = "import SandboxEmbed from '#lib/components/lesson/SandboxEmbed.svelte';";

const addLessonComponents = {
	name: 'lesson-components',
	markup({ content, filename }: { content: string; filename?: string }) {
		if (!filename?.endsWith('.mdx')) return;

		const frontmatter = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
		const imports = [...COMPONENT_IMPORTS];
		if (content.includes('<SandboxEmbed')) imports.push(SANDBOX_IMPORT);
		const script = `<script>\n\t${imports.join('\n\t')}\n</script>\n\n`;

		return {
			code: frontmatter
				? content.slice(0, frontmatter[0].length) + script + content.slice(frontmatter[0].length)
				: script + content
		};
	}
};

const modernModuleScript = {
	name: 'modern-module-script',
	markup({ content, filename }: { content: string; filename?: string }) {
		if (!filename?.endsWith('.mdx')) return;

		return { code: content.replace('<script context="module">', '<script module>') };
	}
};

export const lessonPreprocess = [addLessonComponents, mdsvex({ extensions: ['.mdx'], remarkPlugins: [lessonChapters] }), modernModuleScript];
