import { test, expect } from '@playwright/test';

test('home page title contains Quiz', async ({ page }) => {
	await page.goto('http://localhost:4173');
	await expect(page).toHaveTitle(/Quiz/);
});
