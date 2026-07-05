import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
	});

	it('lowercases mixed case', () => {
		expect(slugify('Mixed CASE Text')).toBe('mixed-case-text');
	});

	it('strips punctuation and other invalid characters', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('collapses repeated separators into a single hyphen', () => {
		expect(slugify('foo   bar')).toBe('foo-bar');
		expect(slugify('foo -- bar')).toBe('foo-bar');
	});
});
