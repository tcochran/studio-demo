import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('+layout.svelte body background', () => {
	it('sets the body background to red', () => {
		const src = readFileSync(resolve('src/routes/+layout.svelte'), 'utf-8');
		expect(src).toMatch(/background:\s*red/);
	});
});
