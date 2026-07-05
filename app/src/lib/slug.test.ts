import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
	it('converts to lowercase', () => {
		expect(slugify('HELLO')).toBe('hello');
		expect(slugify('HeLLo WoRLd')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
		expect(slugify('foo bar baz')).toBe('foo-bar-baz');
	});

	it('strips punctuation and special characters', () => {
		expect(slugify('hello, world!')).toBe('hello-world');
		expect(slugify('foo@bar#baz')).toBe('foobarbaz');
		expect(slugify('test?')).toBe('test');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('hello---world')).toBe('hello-world');
		expect(slugify('foo  bar')).toBe('foo-bar');
		expect(slugify('test--case')).toBe('test-case');
	});

	it('handles mixed cases: spaces, punctuation, mixed case', () => {
		expect(slugify('The Quick Brown Fox!')).toBe('the-quick-brown-fox');
		expect(slugify('Hello, World! How Are You?')).toBe('hello-world-how-are-you');
	});

	it('handles repeated separators correctly', () => {
		expect(slugify('foo   ---   bar')).toBe('foo-bar');
		expect(slugify('test!!  ??  case')).toBe('test-case');
	});

	it('preserves digits', () => {
		expect(slugify('Section 2: Getting Started')).toBe('section-2-getting-started');
		expect(slugify('Test123')).toBe('test123');
	});

	it('handles edge cases', () => {
		expect(slugify('')).toBe('');
		expect(slugify('   ')).toBe('');
		expect(slugify('---')).toBe('');
		expect(slugify('___')).toBe('');
	});
});
