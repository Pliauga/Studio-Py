/**
 * Reads a motion token as milliseconds.
 *
 * `getComputedStyle` serializes `320ms` as `.32s`, so `parseFloat` alone treats a
 * 320ms duration as 0.32ms. Both parsers here must agree with the CSS clock.
 */
export function readMs(style: CSSStyleDeclaration, token: string, fallback: number): number {
	const raw = style.getPropertyValue(token).trim();
	if (!raw) return fallback;
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return raw.endsWith('s') && !raw.endsWith('ms') ? value * 1000 : value;
}

export function readEase(style: CSSStyleDeclaration, token: string, fallback: string): string {
	return style.getPropertyValue(token).trim() || fallback;
}
