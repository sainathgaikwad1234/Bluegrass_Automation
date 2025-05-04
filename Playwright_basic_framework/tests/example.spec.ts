import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Example Test Suite', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
    });

    test('should navigate to homepage', async () => {
        await homePage.goto();
        await homePage.verifyTitle('Welcome to the Homepage');
    });
});