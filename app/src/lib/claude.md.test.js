import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('claude.md', () => {
	it('exists and contains todays date', () => {
		const filePath = resolve(__dirname, '../../../claude.md');
		const content = readFileSync(filePath, 'utf-8');
		expect(content).toContain('2026-06-06');
	});
});
