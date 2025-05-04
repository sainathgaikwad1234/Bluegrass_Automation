import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testConfig } from '../config/testConfig';

test.describe('Bluegrass Admin Login Tests', () => {
    test('should log in with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.validUser.email,
            testConfig.credentials.validUser.password
        );
        
        await loginPage.expectSuccessfulLogin();
    });
    
    test('should show error with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.invalidUser.email,
            testConfig.credentials.invalidUser.password
        );
        
        await loginPage.expectFailedLogin();
    });
    
    test('should show error with empty credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        
        await loginPage.goto();
        await loginPage.login('', '');
        
        await loginPage.expectFailedLogin();
    });
}); 