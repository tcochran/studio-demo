import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('layout background color', () => {
	it('sets body background to pink', () => {
		const layout = readFileSync(resolve('src/routes/+layout.svelte'), 'utf-8');
		expect(layout).toMatch(/background:\s*pink/);
	});
});
