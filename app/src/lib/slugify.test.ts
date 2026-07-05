import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('converts to lowercase', () => {
		expect(slugify('Hello World')).toContain('hello');
		expect(slugify('Hello World')).toContain('world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('Hello World')).toBe('hello-world');
		expect(slugify('Multi Word String')).toBe('multi-word-string');
	});

	it('strips punctuation and special characters', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
		expect(slugify('What?')).toBe('what');
		expect(slugify('Rock & Roll')).toBe('rock-roll');
	});

	it('collapses consecutive hyphens into one', () => {
		expect(slugify('Hello---World')).toBe('hello-world');
		expect(slugify('Test  --  String')).toBe('test-string');
	});

	it('keeps lowercase letters, digits, and hyphens only', () => {
		expect(slugify('Test123')).toBe('test123');
		expect(slugify('Item-2-Go')).toBe('item-2-go');
	});

	it('handles mixed case, punctuation, and repeated separators together', () => {
		expect(slugify('The Quick, Brown Fox!!!  Jumps')).toBe('the-quick-brown-fox-jumps');
	});

	it('handles leading and trailing spaces', () => {
		expect(slugify('  hello world  ')).toBe('hello-world');
	});

	it('handles strings with only special characters', () => {
		expect(slugify('!!!')).toBe('');
		expect(slugify('---')).toBe('');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});
});
