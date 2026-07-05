import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('converts text to lowercase', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('multiple words here')).toBe('multiple-words-here');
	});

	it('handles mixed case with spaces', () => {
		expect(slugify('Mixed Case Text')).toBe('mixed-case-text');
	});

	it('removes punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('removes special characters', () => {
		expect(slugify('Test@#$%Text')).toBe('testtext');
	});

	it('collapses consecutive hyphens into one', () => {
		expect(slugify('multiple---hyphens')).toBe('multiple-hyphens');
	});

	it('handles repeated spaces becoming repeated hyphens', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('handles punctuation followed by spaces', () => {
		expect(slugify('hello, world! how are you?')).toBe('hello-world-how-are-you');
	});

	it('handles leading/trailing spaces', () => {
		expect(slugify('  hello world  ')).toBe('hello-world');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('preserves digits', () => {
		expect(slugify('Test 123 Number')).toBe('test-123-number');
	});

	it('handles single word', () => {
		expect(slugify('hello')).toBe('hello');
	});

	it('handles only special characters', () => {
		expect(slugify('@#$%^&*()')).toBe('');
	});

	it('handles hyphens in input', () => {
		expect(slugify('hello-world-test')).toBe('hello-world-test');
	});

	it('handles mixed separators', () => {
		expect(slugify('hello, - world!')).toBe('hello-world');
	});
});
