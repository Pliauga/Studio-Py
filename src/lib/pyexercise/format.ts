const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: '\u00a0'
};

/**
 * Decode the HTML entities used inside MDX attributes.
 *
 * The lesson files encode newlines as `&#10;` so a PyExercise can stay on one
 * line in MDX. Depending on the MDX pipeline the entity may already have been
 * decoded, so this is intentionally a no-op when no `&` is present.
 */
export function decodeSource(value: string): string {
	if (!value.includes('&')) return value;

	return value
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
		.replace(/&([a-z]+);/gi, (entity, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? entity);
}

/** Compare stdout the way a learner reads it: line endings and outer whitespace ignored. */
export function normalizeOutput(value: string): string {
	return value
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map((line) => line.replace(/[ \t]+$/, ''))
		.join('\n')
		.trim();
}

/**
 * Words as a learner means them: punctuation that only separates values
 * (`True, False`, `OVER LIMIT | WARNING`) is not part of the answer, and a
 * number is compared by value. Brackets stay significant — `(-13, 87.0)` is a
 * tuple, `-13 87.0` is an unpacked pair, and the exercise is the difference.
 */
function comparableTokens(value: string): string[] {
	return normalizeOutput(value)
		.replace(/[,;|]/g, ' ')
		.replace(/([[\](){}])/g, ' $1 ')
		.split(/\s+/)
		.filter(Boolean);
}

/**
 * Judge stdout generously on formatting but strictly on values: `8` passes where
 * `8.0` is expected, `True, False` where `True False` is expected, while a wrong
 * value in the right position still fails.
 */
export function outputsMatch(actual: string, expected: string): boolean {
	if (normalizeOutput(actual) === normalizeOutput(expected)) return true;

	const printed = comparableTokens(actual);
	const wanted = comparableTokens(expected);
	if (printed.length !== wanted.length) return false;

	return printed.every((token, index) => {
		if (token === wanted[index]) return true;

		const a = Number(token);
		const b = Number(wanted[index]);
		return Number.isFinite(a) && Number.isFinite(b) && a === b;
	});
}
