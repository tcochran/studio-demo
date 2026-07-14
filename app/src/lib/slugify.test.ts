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

	it('collapses consecutive hyphens', () => {
		expect(slugify('foo--bar')).toBe('foo-bar');
	});

	it('collapses hyphens that result from stripping punctuation', () => {
		expect(slugify('foo... bar')).toBe('foo-bar');
	});

	it('handles mixed case with punctuation', () => {
		expect(slugify("It's a Test!")).toBe('its-a-test');
	});

	it('handles already-slug input', () => {
		expect(slugify('already-a-slug')).toBe('already-a-slug');
	});

	it('handles digits', () => {
		expect(slugify('Version 2.0 Release')).toBe('version-20-release');
	});
});
