import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns "Hello, World!" when given "World"', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('returns "Hello, Alice!" when given "Alice"', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});
});
