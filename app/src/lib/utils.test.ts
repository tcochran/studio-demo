import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting with the provided name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('returns a greeting with another name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});
});
