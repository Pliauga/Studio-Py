/**
 * Lesson progress, persisted per browser. Status is the only state the course
 * keeps, so it fits in one localStorage key and one reactive object.
 */
export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

const KEY = 'studio-py:progress:v1';

function read(): Record<string, LessonStatus> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>;
		const clean: Record<string, LessonStatus> = {};
		for (const [slug, value] of Object.entries(raw)) {
			if (value === 'in-progress' || value === 'completed' || value === 'not-started') {
				clean[slug] = value;
			}
		}
		return clean;
	} catch {
		// Corrupt or unavailable storage is not worth an error state: start fresh.
		return {};
	}
}

class Progress {
	statuses = $state<Record<string, LessonStatus>>(read());

	statusOf(slug: string): LessonStatus {
		return this.statuses[slug] ?? 'not-started';
	}

	set(slug: string, status: LessonStatus): void {
		this.statuses = { ...this.statuses, [slug]: status };
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.statuses));
		} catch {
			// Private mode can reject writes; the in-memory status still works.
		}
	}

	complete(slug: string): void {
		this.set(slug, 'completed');
	}
}

export const progress = new Progress();

export const STATUS_LABEL: Record<LessonStatus, string> = {
	'not-started': 'Not started',
	'in-progress': 'In progress',
	completed: 'Completed'
};
