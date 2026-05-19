import { describe, it, expect } from 'vitest';
import { SHOW_FLOW_TAB } from './ideas.js';

describe('ideas feature flags', () => {
	it('flow tab is hidden for all users', () => {
		expect(SHOW_FLOW_TAB).toBe(false);
	});
});
