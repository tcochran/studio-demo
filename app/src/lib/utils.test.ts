import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting for a given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('handles empty string', () => {
		expect(greet('')).toBe('Hello, !');
	});
});
