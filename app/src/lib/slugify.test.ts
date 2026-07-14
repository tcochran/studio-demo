import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
	});

	it('lowercases mixed case input', () => {
		expect(slugify('Premier League Trivia')).toBe('premier-league-trivia');
	});

	it('strips punctuation and other invalid characters', () => {
		expect(slugify('Hello, World!')).toBe('hello-world');
		expect(slugify('C++ & Rust')).toBe('c-rust');
	});

	it('collapses repeated separators into a single hyphen', () => {
		expect(slugify('foo   bar')).toBe('foo-bar');
		expect(slugify('a---b')).toBe('a-b');
	});
});
