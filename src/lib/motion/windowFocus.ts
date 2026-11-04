import { openWindows } from '#lib/stores/os.svelte.ts';

/**
 * Keeps `openWindows.activeWindowId` honest for one window: it is active on mount,
 * becomes inactive when the pointer lands anywhere outside it, and reports the moment
 * it is clicked back to the front so the caller can play the focus bump.
 * Returns the cleanup.
 */
export function trackWindowFocus(id: string, windowEl: HTMLElement, onActivate: () => void): () => void {
	openWindows.activeWindowId = id;

	const onPointerDown = (event: PointerEvent): void => {
		const inside = event.target instanceof Node && windowEl.contains(event.target);
		if (inside && openWindows.activeWindowId !== id) {
			openWindows.activeWindowId = id;
			onActivate();
		} else if (!inside && openWindows.activeWindowId === id) {
			openWindows.activeWindowId = null;
		}
	};

	document.addEventListener('pointerdown', onPointerDown, true);
	return () => {
		document.removeEventListener('pointerdown', onPointerDown, true);
		if (openWindows.activeWindowId === id) openWindows.activeWindowId = null;
	};
}
