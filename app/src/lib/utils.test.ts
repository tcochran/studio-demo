import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting with the provided name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});

	it('works with different names', () => {
		expect(greet('Bob')).toBe('Hello, Bob!');
	});

	it('handles empty string', () => {
		expect(greet('')).toBe('Hello, !');
	});
});
