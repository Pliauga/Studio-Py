// Regression guard for the grading contract: generous on formatting, strict on
// values. Run with `node --experimental-strip-types scripts/check-grading.mjs`.
import { outputsMatch } from '../src/lib/pyexercise/format.ts';

/** [actual stdout, expectedOutput, should pass] */
const CASES = [
	// Numeric formatting is not a wrong answer.
	['8.0', '8', true],
	['8', '8.0', true],
	['R-001 87 100', 'R-001 87.0 100.0', true],
	['[1.0, 2.0, 4.0, 8, 8]', '[1.0, 2.0, 4.0, 8.0, 8.0]', true],
	// Separators that only delimit values are not part of the answer.
	['True, False', 'True False', true],
	['OVER LIMIT | WARNING | OK', 'OVER LIMIT | WARNING | OK', true],
	// Structure still matters: a tuple is not an unpacked pair.
	['(-13, 87.0)', '-13 87.0', false],
	['-13 87.0', '-13 87.0', true],
	// Trailing whitespace is invisible.
	['True False  ', 'True False', true],
	['6 True True', '6 True True', true],
	// Wrong values, wrong arity, wrong text still fail.
	['6 True False', '6 True True', false],
	['False', 'True False', false],
	['7', '8', false],
	['[1, 2]', '[]', false],
	['OVER LIMIT', 'OK', false],
	['[]', '[]', true],
	['info', 'INFO', false]
];

let failures = 0;

for (const [actual, expected, shouldPass] of CASES) {
	const passed = outputsMatch(actual, expected);
	if (passed !== shouldPass) {
		failures += 1;
		console.error(
			`FAIL  actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)} ` +
				`passed=${passed} wanted=${shouldPass}`
		);
	}
}

console.log(
	failures === 0
		? `grading contract: ${CASES.length}/${CASES.length} cases pass`
		: `grading contract: ${failures} of ${CASES.length} cases failed`
);

process.exit(failures === 0 ? 0 : 1);
