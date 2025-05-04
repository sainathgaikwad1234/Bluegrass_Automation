import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';

test.describe('LOINC Catalog Management', () => {
    let loginPage: LoginPage;
    let catalogPage: CatalogPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        catalogPage = new CatalogPage(page);
    });

    test('should add LOINC code and logout successfully', async ({ page }) => {
        // Login
        await loginPage.goto();
        await loginPage.login('superadmin@ecarehealth.com', 'eCareHealth@2024');

        // Navigate to catalog and add LOINC code
        await catalogPage.navigateToCatalog();
        await catalogPage.addLoincCode('12345-6', 'Test LOINC Code Description');

        // Logout
        await catalogPage.logout();
        
        // Verify we're back at login page
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });
});