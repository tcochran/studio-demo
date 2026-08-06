import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('lowercases mixed-case text', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('quiz lab packs')).toBe('quiz-lab-packs');
	});

	it('strips punctuation and other invalid characters', () => {
		expect(slugify('NYT: Easy!')).toBe('nyt-easy');
	});

	it('collapses repeated separators into a single hyphen', () => {
		expect(slugify('a   b')).toBe('a-b');
		expect(slugify('a---b')).toBe('a-b');
		expect(slugify('a _ b')).toBe('a-b');
	});
});
