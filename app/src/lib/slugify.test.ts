import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('converts text to lowercase', () => {
		expect(slugify('HELLO')).toBe('hello');
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
		expect(slugify('one two three')).toBe('one-two-three');
	});

	it('removes punctuation and special characters', () => {
		expect(slugify('hello, world!')).toBe('hello-world');
		expect(slugify('test@email.com')).toBe('test-email-com');
		expect(slugify('question?')).toBe('question');
	});

	it('collapses consecutive hyphens into one', () => {
		expect(slugify('hello---world')).toBe('hello-world');
		expect(slugify('hello   world')).toBe('hello-world');
		expect(slugify('test--case---here')).toBe('test-case-here');
	});

	it('strips leading and trailing hyphens', () => {
		expect(slugify('-hello-')).toBe('hello');
		expect(slugify('--world--')).toBe('world');
	});

	it('handles mixed case with punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
		expect(slugify('CamelCaseText')).toBe('camelcasetext');
	});

	it('handles empty strings and whitespace', () => {
		expect(slugify('')).toBe('');
		expect(slugify('   ')).toBe('');
	});

	it('keeps digits', () => {
		expect(slugify('test123')).toBe('test123');
		expect(slugify('hello 2024 world')).toBe('hello-2024-world');
	});

	it('handles repeated separators with other characters', () => {
		expect(slugify('hello,,,world')).toBe('hello-world');
		expect(slugify('one! two? three.')).toBe('one-two-three');
	});
});
