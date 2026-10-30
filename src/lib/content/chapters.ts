interface MdastNode {
	type: string;
	depth?: number;
	value?: string;
	children?: MdastNode[];
}

const textOf = (node: MdastNode): string =>
	node.value ?? (node.children ?? []).map(textOf).join('');

/** Display size tier by title length, so a 60-character title still fits the frame. */
export function sizeTier(length: number): 'xl' | 'l' | 'm' | 's' {
	if (length <= 14) return 'xl';
	if (length <= 28) return 'l';
	if (length <= 44) return 'm';
	return 's';
}

const html = (value: string): MdastNode => ({ type: 'html', value }) as MdastNode;

const INTERACTIVE = /^\s*(<(PyExercise|PredictOutput|SandboxEmbed)\b|<div class="scene-split-layout")/;

const isInteractive = (node: MdastNode): boolean =>
	node.type === 'html' && INTERACTIVE.test(node.value ?? '');

const telemetryKind = (title: string): 'hook' | 'debrief' | null => {
	const key = title.trim().toLowerCase();
	return key === 'the hook' ? 'hook' : key === 'the debrief' ? 'debrief' : null;
};

/** Every PyExercise in the lesson, including those nested in a scene layout block. */
const countExercises = (nodes: MdastNode[]): number =>
	nodes.reduce(
		(sum, node) =>
			sum + (node.type === 'html' ? ((node.value ?? '').match(/<PyExercise\b/g)?.length ?? 0) : 0),
		0
	);

/**
 * Splits a lesson at each `##` into a pinned title, the narrative, and (only where the
 * chapter earns one) a console slot beside it. A chapter with an exercise, prediction or
 * scene gets that block as a sticky right pane; The Hook and The Debrief get a telemetry
 * readout; every other chapter is narrative and runs the full width. Doing it on the
 * mdast keeps the markup static, so nothing has to move nodes around inside a
 * Svelte-owned tree.
 */
export function lessonChapters() {
	return (tree: MdastNode): void => {
		const out: MdastNode[] = [];
		const exercises = countExercises(tree.children ?? []);
		let heading: MdastNode | null = null;
		let narrative: MdastNode[] = [];
		let slot: MdastNode[] = [];

		const close = (): void => {
			if (!heading) return;
			const kind = telemetryKind(textOf(heading));
			const split = slot.length > 0 || kind !== null;
			out.push(
				html(
					`<section class="chapter ${split ? 'split' : 'wide'}"><div class="pin"><div class="pin-inner" data-size="${sizeTier(textOf(heading).length)}">`
				),
				heading,
				html('</div></div><div class="chapter-body">'),
				...narrative,
				html('</div>')
			);
			if (slot.length) {
				out.push(html('<aside class="console-slot">'), ...slot, html('</aside>'));
			} else if (kind) {
				out.push(
					html(
						`<aside class="console-slot telemetry"><LessonTelemetry kind="${kind}" exercises="${exercises}" /></aside>`
					)
				);
			}
			out.push(html(split ? '<span class="spine" aria-hidden="true"></span></section>' : '</section>'));
		};

		for (const node of tree.children ?? []) {
			if (node.type === 'heading' && node.depth === 2) {
				close();
				heading = node;
				narrative = [];
				slot = [];
				continue;
			}
			if (!heading) out.push(node);
			else if (isInteractive(node)) slot.push(node);
			else narrative.push(node);
		}

		close();
		tree.children = out;
	};
}
