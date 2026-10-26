import { error } from '@sveltejs/kit';
import { findModule } from '#lib/content/lessons.ts';
import { preloadLesson } from '#lib/content/lessonModules.ts';

export async function load({ params }: { params: { slug: string } }) {
	const module = findModule(params.slug);
	if (!module) error(404, `No lesson called "${params.slug}"`);
	await preloadLesson(module.slug);
	return { module };
}
