import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('handles spaces', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('converts to lowercase', () => {
		expect(slugify('HELLO World')).toBe('hello-world');
	});

	it('handles punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
		expect(slugify('What\'s up?')).toBe('what-s-up');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('Hello---World')).toBe('hello-world');
		expect(slugify('Hello   World')).toBe('hello-world');
	});

	it('handles mixed case with special characters', () => {
		expect(slugify('Mixed-Case_Text!@#')).toBe('mixed-case-text');
	});

	it('preserves digits', () => {
		expect(slugify('Year 2024')).toBe('year-2024');
	});

	it('handles edge cases', () => {
		expect(slugify('')).toBe('');
		expect(slugify('   ')).toBe('');
		expect(slugify('---')).toBe('');
	});
});