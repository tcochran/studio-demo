import { describe, it, expect } from 'vitest';
import { computeScore } from './score';

describe('computeScore', () => {
	it('returns zeros for an empty answers array (no divide-by-zero)', () => {
		expect(computeScore([])).toEqual({ correct: 0, total: 0, percentage: 0 });
	});

	it('counts correct answers and totals', () => {
		const result = computeScore([
			{ correct: true },
			{ correct: false },
			{ correct: true },
			{ correct: true }
		]);
		expect(result).toEqual({ correct: 3, total: 4, percentage: 75 });
	});

	it('rounds the percentage to the nearest integer', () => {
		expect(computeScore([{ correct: true }, { correct: false }, { correct: false }])).toEqual({
			correct: 1,
			total: 3,
			percentage: 33
		});
	});

	it('reports 100% when every answer is correct', () => {
		expect(computeScore([{ correct: true }, { correct: true }])).toEqual({
			correct: 2,
			total: 2,
			percentage: 100
		});
	});
});
