import { describe, it, expect } from 'vitest';
import { computeScore } from './score';

describe('computeScore', () => {
	it('returns zeros for empty array', () => {
		expect(computeScore([])).toEqual({ correct: 0, total: 0, percentage: 0 });
	});

	it('computes correct, total, and percentage', () => {
		const answers = [
			{ correct: true },
			{ correct: false },
			{ correct: true },
			{ correct: true }
		];
		expect(computeScore(answers)).toEqual({ correct: 3, total: 4, percentage: 75 });
	});

	it('rounds percentage to nearest integer', () => {
		const answers = [{ correct: true }, { correct: false }, { correct: false }];
		expect(computeScore(answers)).toEqual({ correct: 1, total: 3, percentage: 33 });
	});

	it('handles all correct', () => {
		const answers = [{ correct: true }, { correct: true }];
		expect(computeScore(answers)).toEqual({ correct: 2, total: 2, percentage: 100 });
	});

	it('handles all incorrect', () => {
		const answers = [{ correct: false }, { correct: false }];
		expect(computeScore(answers)).toEqual({ correct: 0, total: 2, percentage: 0 });
	});
});
