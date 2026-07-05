import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns Hello, <name>!', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('works with any name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});
});
