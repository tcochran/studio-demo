import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting with the provided name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});

	it('handles different names', () => {
		expect(greet('Bob')).toBe('Hello, Bob!');
		expect(greet('Charlie')).toBe('Hello, Charlie!');
		expect(greet('')).toBe('Hello, !');
	});
});