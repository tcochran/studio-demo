import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it('greets by name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});
});
