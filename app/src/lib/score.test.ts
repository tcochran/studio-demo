import { describe, it, expect } from 'vitest';
import { computeScore } from './score';

describe('computeScore', () => {
	it('returns all zeros for empty answers', () => {
		expect(computeScore([])).toEqual({ correct: 0, total: 0, percentage: 0 });
	});

	it('returns 100% when all answers are correct', () => {
		const answers = [{ correct: true }, { correct: true }, { correct: true }];
		expect(computeScore(answers)).toEqual({ correct: 3, total: 3, percentage: 100 });
	});

	it('returns 0% when all answers are incorrect', () => {
		const answers = [{ correct: false }, { correct: false }];
		expect(computeScore(answers)).toEqual({ correct: 0, total: 2, percentage: 0 });
	});

	it('calculates percentage rounded to nearest integer', () => {
		const answers = [{ correct: true }, { correct: true }, { correct: false }];
		expect(computeScore(answers)).toEqual({ correct: 2, total: 3, percentage: 67 });
	});

	it('handles single answer correctly', () => {
		expect(computeScore([{ correct: true }])).toEqual({ correct: 1, total: 1, percentage: 100 });
		expect(computeScore([{ correct: false }])).toEqual({ correct: 0, total: 1, percentage: 0 });
	});

	it('rounds 0.5 up to 1', () => {
		// 1/3 = 33.33... -> 33
		expect(computeScore([{ correct: true }, { correct: false }, { correct: false }])).toEqual({ correct: 1, total: 3, percentage: 33 });
	});
});
