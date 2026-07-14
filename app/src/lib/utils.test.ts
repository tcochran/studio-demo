import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting message with the provided name', () => {
		expect(greet('World')).toBe('Hello, World!');
		expect(greet('Alice')).toBe('Hello, Alice!');
		expect(greet('')).toBe('Hello, !');
	});
});