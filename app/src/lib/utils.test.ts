import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns "Hello, <name>!" for a given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('handles empty string', () => {
		expect(greet('')).toBe('Hello, !');
	});

	it('handles names with special characters', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});
});
