import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('lowercases text', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces non-alphanumeric runs with a single hyphen', () => {
		expect(slugify('foo  bar--baz')).toBe('foo-bar-baz');
	});

	it('trims leading and trailing hyphens', () => {
		expect(slugify('  hello  ')).toBe('hello');
	});

	it('handles punctuation', () => {
		expect(slugify('It\'s a test!')).toBe('it-s-a-test');
	});

	it('returns empty string for all non-alphanumeric input', () => {
		expect(slugify('---')).toBe('');
	});
});
