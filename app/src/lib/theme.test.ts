import { describe, it, expect } from 'vitest';
import { DARK_BG_COLOR } from './theme';

describe('theme', () => {
	it('dark background is dark blue, not black', () => {
		expect(DARK_BG_COLOR).not.toBe('#000000');
		expect(DARK_BG_COLOR).not.toBe('#000');
		expect(DARK_BG_COLOR).toMatch(/^#[0-9a-f]{6}$/i);

		const hex = DARK_BG_COLOR.replace('#', '');
		const r = parseInt(hex.slice(0, 2), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		// Blue channel must exceed red to confirm it's blue-tinted, not gray/black
		expect(b).toBeGreaterThan(r);
	});
});
