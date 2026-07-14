import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

describe('claude.md', () => {
	it('exists at the repo root', () => {
		const path = join(__dirname, '../../..', 'claude.md');
		expect(existsSync(path)).toBe(true);
	});

	it('contains today\'s date (2026-06-06)', () => {
		const path = join(__dirname, '../../..', 'claude.md');
		const content = readFileSync(path, 'utf-8');
		expect(content).toContain('2026-06-06');
	});
});
