import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
	});

	it('lowercases mixed case', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('strips punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('collapses repeated separators into a single hyphen', () => {
		expect(slugify('hello   world')).toBe('hello-world');
		expect(slugify('a -- b')).toBe('a-b');
	});
});
