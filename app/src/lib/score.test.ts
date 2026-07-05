import { describe, it, expect } from 'vitest';
import { computeScore } from './score';

describe('computeScore', () => {
	it('returns zero for empty answers array', () => {
		const result = computeScore([]);
		expect(result).toEqual({ correct: 0, total: 0, percentage: 0 });
	});

	it('computes correct count and percentage', () => {
		const result = computeScore([
			{ correct: true },
			{ correct: true },
			{ correct: false },
			{ correct: true }
		]);
		expect(result.correct).toBe(3);
		expect(result.total).toBe(4);
		expect(result.percentage).toBe(75);
	});

	it('rounds percentage to nearest integer', () => {
		const result = computeScore([
			{ correct: true },
			{ correct: false },
			{ correct: false }
		]);
		expect(result.correct).toBe(1);
		expect(result.total).toBe(3);
		expect(result.percentage).toBe(33);
	});

	it('rounds up correctly', () => {
		const result = computeScore([
			{ correct: true },
			{ correct: true },
			{ correct: false }
		]);
		expect(result.correct).toBe(2);
		expect(result.total).toBe(3);
		expect(result.percentage).toBe(67);
	});

	it('returns 100% for all correct', () => {
		const result = computeScore([
			{ correct: true },
			{ correct: true }
		]);
		expect(result.correct).toBe(2);
		expect(result.total).toBe(2);
		expect(result.percentage).toBe(100);
	});

	it('returns 0% for all incorrect', () => {
		const result = computeScore([
			{ correct: false },
			{ correct: false }
		]);
		expect(result.correct).toBe(0);
		expect(result.total).toBe(2);
		expect(result.percentage).toBe(0);
	});
});
