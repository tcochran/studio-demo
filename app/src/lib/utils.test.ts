import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns a greeting for the given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});
});
