import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('claude.md', () => {
	it('exists at the repo root', () => {
		const claudeMdPath = resolve(__dirname, '../../..', 'claude.md');
		const content = readFileSync(claudeMdPath, 'utf-8');
		expect(content).toBeTruthy();
	});

	it('contains todays date', () => {
		const claudeMdPath = resolve(__dirname, '../../..', 'claude.md');
		const content = readFileSync(claudeMdPath, 'utf-8');
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
		expect(content).toContain(today);
	});
});
