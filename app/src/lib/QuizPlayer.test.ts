import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const source = readFileSync(resolve('src/lib/QuizPlayer.svelte'), 'utf-8');

describe('QuizPlayer container background', () => {
	it('sets the container background color to red', () => {
		// Matches the .container CSS rule's background property
		expect(source).toMatch(/\.container\s*\{[^}]*background:\s*red\s*;/s);
	});
});
