import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('root layout background', () => {
	it('sets a purple background on the body', () => {
		const source = readFileSync(resolve('src/routes/+layout.svelte'), 'utf-8');
		expect(source).toMatch(/background:\s*(purple|#800080)/i);
	});
});
