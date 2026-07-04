import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const HELLO_PATH = resolve('../../HELLO-V4.md');

describe('HELLO-V4.md', () => {
	it('exists at the repo root', () => {
		expect(existsSync(HELLO_PATH)).toBe(true);
	});

	it('contains a one-line greeting', () => {
		const content = readFileSync(HELLO_PATH, 'utf-8').trim();
		expect(content).toBeTruthy();
		expect(content.split('\n').length).toBe(1);
	});
});
