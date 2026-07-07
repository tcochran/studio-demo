import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns greeting with name', () => {
		expect(greet('Alice')).toBe('Hello, Alice!');
	});

	it('works with different names', () => {
		expect(greet('Bob')).toBe('Hello, Bob!');
	});
});
