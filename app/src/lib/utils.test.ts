import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns "Hello, World!" for input "World"', () => {
		expect(greet('World')).toBe('Hello, World!');
	});
});
