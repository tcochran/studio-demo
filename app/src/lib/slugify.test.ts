import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('lowercases text', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('foo bar baz')).toBe('foo-bar-baz');
	});

	it('strips punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('handles mixed case with punctuation', () => {
		expect(slugify("It's a Test")).toBe('its-a-test');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('foo--bar')).toBe('foo-bar');
	});

	it('collapses hyphens produced by stripped characters', () => {
		expect(slugify('foo & bar')).toBe('foo-bar');
	});

	it('handles repeated separators from punctuation and spaces', () => {
		expect(slugify('one!!!  two')).toBe('one-two');
	});

	it('returns empty string for empty input', () => {
		expect(slugify('')).toBe('');
	});

	it('preserves digits', () => {
		expect(slugify('Top 10 Lists')).toBe('top-10-lists');
	});
});
