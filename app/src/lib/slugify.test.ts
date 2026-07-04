import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('lowercases the input', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces runs of non-alphanumeric characters with a single hyphen', () => {
		expect(slugify('Hello   World!!!')).toBe('hello-world');
	});

	it('trims leading hyphens', () => {
		expect(slugify('---hello')).toBe('hello');
	});

	it('trims trailing hyphens', () => {
		expect(slugify('hello---')).toBe('hello');
	});

	it('trims leading and trailing hyphens simultaneously', () => {
		expect(slugify('---hello---')).toBe('hello');
	});

	it('handles already-slugified input', () => {
		expect(slugify('hello-world')).toBe('hello-world');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('handles strings with only non-alphanumeric characters', () => {
		expect(slugify('!!! --- ???')).toBe('');
	});

	it('handles mixed alphanumeric input', () => {
		expect(slugify('Hello 123 World 456')).toBe('hello-123-world-456');
	});

	it('handles special characters and spaces', () => {
		expect(slugify('What is your name?')).toBe('what-is-your-name');
	});
});
