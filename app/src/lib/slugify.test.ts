import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('lowercases the input', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('foo bar baz')).toBe('foo-bar-baz');
	});

	it('strips punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('handles mixed case and punctuation', () => {
		expect(slugify("It's a Test")).toBe('its-a-test');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('foo--bar')).toBe('foo-bar');
	});

	it('collapses hyphens created by stripped characters', () => {
		expect(slugify('foo & bar')).toBe('foo-bar');
	});

	it('handles repeated separators from spaces and punctuation', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('handles digits', () => {
		expect(slugify('Top 10 Hits')).toBe('top-10-hits');
	});

	it('returns empty string for empty input', () => {
		expect(slugify('')).toBe('');
	});
});
