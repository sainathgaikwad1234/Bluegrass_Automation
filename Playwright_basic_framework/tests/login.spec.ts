import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should login successfully', async ({ page }) => {
        // 1. Navigate to the login page
        await page.goto('https://app.qa.admin.ecarehealth.com/auth/login');
        await page.waitForLoadState('networkidle');
        
        // Wait for the form to be visible
        await page.waitForSelector('form', { state: 'visible' });
        
        // Take screenshot of initial state
        await page.screenshot({ path: './screenshots/1_initial_page.png' });

        // 2. Fill in email - trying different possible selectors
        const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]#email, input[name="email"]', { state: 'visible' });
        await emailInput.fill('superadmin@ecarehealth.com');
        
        // 3. Fill in password
        const passwordInput = await page.waitForSelector('input[type="password"]#password, input[name="password"]', { state: 'visible' });
        await passwordInput.fill('eCareHealth@2024');
        
        // Take screenshot after filling credentials
        await page.screenshot({ path: './screenshots/2_credentials_filled.png' });

        // 4. Click login button - trying different possible selectors
        const loginButton = await page.waitForSelector('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")', { state: 'visible' });
        await loginButton.click();

        // 5. Wait for navigation
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
        
        // Take screenshot after login
        await page.screenshot({ path: './screenshots/3_after_login.png' });

        // 6. Verify login success
        const currentUrl = await page.url();
        console.log('Current URL after login:', currentUrl);
        
        // 7. Verify we're not on the login page anymore
        expect(currentUrl).not.toContain('/auth/login');
    });
});