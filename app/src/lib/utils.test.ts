import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting with the given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('uses the provided name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});
});
