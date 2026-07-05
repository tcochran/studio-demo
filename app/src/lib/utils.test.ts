import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns "Hello, <name>!" for the given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('works with different names', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
		expect(greet('Bob')).toBe('Hello, Bob!');
	});
});
