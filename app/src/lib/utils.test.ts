import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns Hello with the given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('handles an empty string', () => {
		expect(greet('')).toBe('Hello, !');
	});

	it('handles names with spaces', () => {
		expect(greet('John Doe')).toBe('Hello, John Doe!');
	});
});
