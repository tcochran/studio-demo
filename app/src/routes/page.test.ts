import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('catalog search input', () => {
	it('has placeholder text "Search our catalog..."', () => {
		const src = readFileSync(resolve('src/routes/+page.svelte'), 'utf-8');
		expect(src).toMatch(/placeholder="Search our catalog\.\.\."/);
	});
});
