/**
 * Prediction accuracy per concept, persisted per browser. Counts plus the last
 * option index keep the whole history in one localStorage key while preserving
 * which distractor was chosen.
 */
export type ConceptStats = {
	attempts: number;
	correct: number;
	lastChoice: number | null;
};

const KEY = 'studio-py:telemetry:v1';

function isCount(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isChoice(value: unknown): value is number | null {
	return value === null || isCount(value);
}

function read(): Record<string, ConceptStats> {
	if (typeof localStorage === 'undefined') return {};

	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>;
		const clean: Record<string, ConceptStats> = {};

		for (const [conceptId, value] of Object.entries(raw)) {
			if (!value || typeof value !== 'object') continue;

			const { attempts, correct, lastChoice } = value as Partial<ConceptStats>;
			if (!isCount(attempts) || !isCount(correct)) continue;

			clean[conceptId] = {
				attempts,
				correct: Math.min(correct, attempts),
				lastChoice: isChoice(lastChoice) ? lastChoice : null
			};
		}

		return clean;
	} catch {
		// Corrupt or unavailable storage is not worth an error state: start fresh.
		return {};
	}
}

function persist(stats: Record<string, ConceptStats>): void {
	if (typeof localStorage === 'undefined') return;

	try {
		localStorage.setItem(KEY, JSON.stringify(stats));
	} catch {
		// Private mode can reject writes; the in-memory stats still update.
	}
}

class Telemetry {
	concepts = $state<Record<string, ConceptStats>>(read());

	statsOf(conceptId: string): ConceptStats {
		return this.concepts[conceptId] ?? { attempts: 0, correct: 0, lastChoice: null };
	}

	recordPrediction(conceptId: string, isCorrect: boolean, choiceIndex: number | null = null): void {
		const previous = this.statsOf(conceptId);

		this.concepts = {
			...this.concepts,
			[conceptId]: {
				attempts: previous.attempts + 1,
				correct: previous.correct + (isCorrect ? 1 : 0),
				lastChoice: choiceIndex
			}
		};

		persist(this.concepts);
	}
}

export const telemetry = new Telemetry();
