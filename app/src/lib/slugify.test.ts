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
		expect(slugify('foo  --  bar')).toBe('foo-bar');
	});

	it('handles repeated separators from punctuation', () => {
		expect(slugify('one...two')).toBe('onetwo');
	});

	it('returns empty string for empty input', () => {
		expect(slugify('')).toBe('');
	});
});
