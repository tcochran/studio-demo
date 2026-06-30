import { describe, it, expect } from 'vitest';
import { greet } from './utils';

describe('greet', () => {
	it("greet('World') === 'Hello, World!'", () => {
		expect(greet('World')).toBe('Hello, World!');
	});
});
