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

/**
 * Splits a lesson at each `##` into a pinned title screen and a body: the
 * title sits in a sticky 100svh frame while its dwell passes, then unpins
 * and scrolls away ahead of the body. Doing it on the mdast keeps the markup
 * static, so nothing has to move nodes around inside a Svelte-owned tree.
 */
export function lessonChapters() {
	return (tree: MdastNode): void => {
		const out: MdastNode[] = [];
		let open = false;

		for (const node of tree.children ?? []) {
			if (node.type === 'heading' && node.depth === 2) {
				if (open) out.push(html('</div></section>'));
				out.push(
					html(
						`<section class="chapter"><div class="pin"><div class="pin-inner" data-size="${sizeTier(textOf(node).length)}">`
					),
					node,
					html('</div></div><div class="chapter-body">')
				);
				open = true;
				continue;
			}
			out.push(node);
		}

		if (open) out.push(html('</div></section>'));
		tree.children = out;
	};
}
