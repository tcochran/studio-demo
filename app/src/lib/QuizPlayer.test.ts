import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('QuizPlayer.svelte container background', () => {
	it('sets the container background to yellow', () => {
		const src = readFileSync(resolve('src/lib/QuizPlayer.svelte'), 'utf-8');
		expect(src).toMatch(/\.container\s*\{[^}]*background:\s*yellow/s);
	});
});
