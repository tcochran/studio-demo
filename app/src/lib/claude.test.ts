import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('claude.md', () => {
	it('exists and contains todays date', () => {
		const claudePath = resolve(__dirname, '../../../claude.md');
		const content = readFileSync(claudePath, 'utf-8');
		
		// Today's date is 2026-06-06
		const today = '2026-06-06';
		expect(content).toContain(today);
	});
});
