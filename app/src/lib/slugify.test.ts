import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('converts spaces to hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
	});

	it('lowercases mixed case', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('strips punctuation', () => {
		expect(slugify("What's up?")).toBe('whats-up');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('handles repeated separators from mixed spacing', () => {
		expect(slugify('a  b   c')).toBe('a-b-c');
	});

	it('strips characters that are not lowercase letters, digits, or hyphens', () => {
		expect(slugify('Hello! How are you?')).toBe('hello-how-are-you');
	});

	it('handles an already-slugified string', () => {
		expect(slugify('already-a-slug')).toBe('already-a-slug');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('handles string with only special characters', () => {
		expect(slugify('@#$%^&*()')).toBe('');
	});

	it('handles leading and trailing whitespace', () => {
		expect(slugify('  trim me  ')).toBe('trim-me');
	});
});
