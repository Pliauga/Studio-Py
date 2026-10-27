// The lesson's snake: where its head sits along the article, as the reader
// clears waypoints. Each lesson heading opens a waypoint; one that holds
// exercises is cleared when they have all passed, one that holds none is
// cleared when the reader scrolls on to the next heading.

export type Section = {
	/** Heading offset from the top of the trail, px. */
	top: number;
	exercises: number;
	passed: number;
};

/**
 * The y the head rests at, in the same px space as `top`. It waits on the
 * heading of the first waypoint that is reached but not cleared, and steps on
 * to the next heading the moment that waypoint clears.
 */
export function headOffset(sections: Section[], end: number, anchor: number): number {
	let y = 0;

	for (let index = 0; index < sections.length; index++) {
		const section = sections[index];
		if (section.top > anchor) break;

		y = section.top;
		const next = sections[index + 1];
		const cleared =
			section.exercises > 0
				? section.passed >= section.exercises
				: next
					? next.top <= anchor
					: anchor >= end;
		if (!cleared) return y;

		y = next ? next.top : end;
	}

	return y;
}

const EXERCISE = '[data-testid="pyexercise"]';
/** Where on screen "reached" is read: a heading above this line has been read. */
const READ_LINE = 0.6;

/** Reports the head's position as a percentage of the trail; returns the cleanup. */
export function trackWaypoints(
	trail: HTMLElement,
	article: HTMLElement,
	report: (percent: number) => void
): () => void {
	let frame = 0;

	function measure(): void {
		frame = 0;
		const box = trail.getBoundingClientRect();
		const headings = [...article.querySelectorAll('h2')];
		const sections: Section[] = headings.map((heading) => ({
			top: heading.getBoundingClientRect().top - box.top,
			exercises: 0,
			passed: 0
		}));

		for (const exercise of article.querySelectorAll<HTMLElement>(EXERCISE)) {
			let index = -1;
			headings.forEach((heading, at) => {
				if (heading.compareDocumentPosition(exercise) & Node.DOCUMENT_POSITION_FOLLOWING) index = at;
			});
			if (index < 0) continue;

			sections[index].exercises += 1;
			if (exercise.classList.contains('is-passed')) sections[index].passed += 1;
		}

		const anchor = window.innerHeight * READ_LINE - box.top;
		const y = headOffset(sections, box.height, anchor);
		report(box.height > 0 ? Math.min(100, (y / box.height) * 100) : 0);
	}

	function schedule(): void {
		if (!frame) frame = requestAnimationFrame(measure);
	}

	const mutations = new MutationObserver(schedule);
	mutations.observe(article, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: ['class']
	});
	const resizes = new ResizeObserver(schedule);
	resizes.observe(trail);
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	schedule();

	return () => {
		if (frame) cancelAnimationFrame(frame);
		mutations.disconnect();
		resizes.disconnect();
		window.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', schedule);
	};
}
