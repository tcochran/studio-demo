import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
	it('converts spaces to hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
	});

	it('converts to lowercase', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('converts mixed case with punctuation', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
	});

	it('removes punctuation and special characters', () => {
		expect(slugify('test@#$%^&*()string')).toBe('teststring');
	});

	it('collapses consecutive hyphens into one', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('collapses consecutive special characters that become hyphens', () => {
		expect(slugify('hello--world')).toBe('hello-world');
	});

	it('handles repeated separators mixed with spaces', () => {
		expect(slugify('hello  ---  world')).toBe('hello-world');
	});

	it('removes leading and trailing hyphens', () => {
		expect(slugify('  hello world  ')).toBe('hello-world');
	});

	it('handles all uppercase', () => {
		expect(slugify('HELLO WORLD')).toBe('hello-world');
	});

	it('preserves digits', () => {
		expect(slugify('test 123 string')).toBe('test-123-string');
	});

	it('handles single word', () => {
		expect(slugify('hello')).toBe('hello');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('handles string with only spaces', () => {
		expect(slugify('   ')).toBe('');
	});

	it('handles string with only special characters', () => {
		expect(slugify('@#$%^&*()')).toBe('');
	});
});
