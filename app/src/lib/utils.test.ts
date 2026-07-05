import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('returns Hello, <name>!', () => {
		expect(greet('World')).toBe('Hello, World!');
	});
});
