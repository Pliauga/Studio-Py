import type { Component } from 'svelte';

/**
 * Every lesson compiled ahead of time. mdsvex exports the frontmatter as a
 * `metadata` module export, so the route slug is the frontmatter `id` — never
 * the file name.
 *
 * The glob is lazy: one week is a few kB, and eagerly importing all twenty-five
 * of them put the whole curriculum in the lesson route's first payload (601 kB).
 * `preloadLesson` runs inside the route's `load`, so the article is still
 * server-rendered — only the requested week is fetched.
 */
type LessonModule = { default: Component; metadata?: { id?: string } };

const LESSONS = import.meta.glob<LessonModule>('../../content/lessons/*.mdx');

const LOADED = new Map<string, Component>();

/** Fetch and verify one week's module; the article cannot render without it. */
export async function preloadLesson(slug: string): Promise<void> {
	const week = /^week-\d{2}/.exec(slug)?.[0];
	if (!week) throw new Error(`Lesson slug "${slug}" does not start with a week number`);
	const importer = LESSONS[`../../content/lessons/${week}.mdx`];
	if (!importer) throw new Error(`No compiled lesson file for "${slug}"`);
	const module = await importer();
	const id = module.metadata?.id;
	if (id !== slug) throw new Error(`Lesson file for "${slug}" exports id "${id}"`);
	LOADED.set(slug, module.default);
}

export function lessonComponent(slug: string): Component | undefined {
	return LOADED.get(slug);
}
