import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHANGELOG_PATH = resolve('..', 'CHANGELOG.md');

describe('CHANGELOG.md', () => {
	it('exists at the repo root', () => {
		expect(existsSync(CHANGELOG_PATH)).toBe(true);
	});

	it('has an ## 1.0.0 section', () => {
		const content = readFileSync(CHANGELOG_PATH, 'utf-8');
		expect(content).toMatch(/^##\s+1\.0\.0\s*$/m);
	});

	it("lists 'Initial release.' as a bullet under ## 1.0.0", () => {
		const content = readFileSync(CHANGELOG_PATH, 'utf-8');
		expect(content).toMatch(/- Initial release\./);
	});
});
