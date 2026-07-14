import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns hello with given name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});

	it('handles empty string', () => {
		expect(greet('')).toBe('Hello, !');
	});

	it('handles names with spaces', () => {
		expect(greet('Bob Smith')).toBe('Hello, Bob Smith!');
	});

	it('handles special characters', () => {
		expect(greet('😊')).toBe('Hello, 😊!');
	});
});
