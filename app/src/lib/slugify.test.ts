import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('converts to lowercase', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('a b c')).toBe('a-b-c');
	});

	it('strips punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('strips special characters', () => {
		expect(slugify('Hello@World#Test')).toBe('helloworldtest');
	});

	it('collapses consecutive hyphens into one', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('handles mixed case with spaces and punctuation', () => {
		expect(slugify('The Quick Brown Fox!')).toBe('the-quick-brown-fox');
	});

	it('trims leading and trailing hyphens after processing', () => {
		expect(slugify('  hello world  ')).toBe('hello-world');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('handles numbers', () => {
		expect(slugify('Version 2.0 Release')).toBe('version-20-release');
	});

	it('handles repeated separators after stripping', () => {
		expect(slugify('hello-!-world')).toBe('hello-world');
	});
});
