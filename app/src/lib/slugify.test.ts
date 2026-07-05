import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('converts to lowercase', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world foo')).toBe('hello-world-foo');
	});

	it('handles mixed case', () => {
		expect(slugify('HeLLo WoRLD')).toBe('hello-world');
	});

	it('strips punctuation', () => {
		expect(slugify("What's up?!")).toBe('whats-up');
	});

	it('strips non-alphanumeric characters', () => {
		expect(slugify('Café & Bistro #1')).toBe('caf-bistro-1');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('handles repeated separators', () => {
		expect(slugify('foo---bar---baz')).toBe('foo-bar-baz');
	});

	it('trims leading and trailing hyphens', () => {
		expect(slugify('  hello world  ')).toBe('hello-world');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('handles strings with only special characters', () => {
		expect(slugify('@#$%^&*()')).toBe('');
	});
});
