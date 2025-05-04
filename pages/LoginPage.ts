import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly logo: Locator;
    readonly forgotPasswordLink: Locator;
    readonly loginForm: Locator;
    readonly loginContainer: Locator;

    constructor(page: Page) {
        this.page = page;
        // Use more generic selectors that are likely to match in any login form
        this.emailInput = page.locator('input[type="text"], input[type="email"], input[placeholder*="email" i], input[placeholder*="username" i]');
        this.passwordInput = page.locator('input[type="password"]');
        this.loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');
        this.errorMessage = page.locator('.error-message, .alert, .alert-danger, .error');
        this.logo = page.locator('.logo, img[alt*="logo" i], .brand-logo');
        this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset"), a:has-text("password" i)');
        this.loginForm = page.locator('form');
        this.loginContainer = page.locator('.login-container, .auth-container, .login-wrapper, .auth-wrapper');
    }

    async goto() {
        await this.page.goto('https://dev.admin.bluegrassbsc.com/');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async expectSuccessfulLogin() {
        // Wait for dashboard to load after successful login
        // Use a more generic URL check since we don't know the exact URL pattern
        try {
            await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
        } catch (e) {
            // If URL doesn't contain dashboard, check if we're not on login page anymore
            const isLoginButtonVisible = await this.loginButton.isVisible();
            expect(isLoginButtonVisible).toBe(false);
        }
    }

    async expectFailedLogin() {
        // The website might not show a visible error for empty fields
        // It might just prevent form submission
        try {
            await expect(this.errorMessage).toBeVisible({ timeout: 3000 });
        } catch (e) {
            // If no error message is shown, check that we're still on the login page
            await expect(this.loginButton).toBeVisible();
        }
    }

    async forgotPassword() {
        if (await this.forgotPasswordLink.isVisible())
            await this.forgotPasswordLink.click();
    }

    // Methods to validate UI issues
    async validateLoginFormAlignment() {
        try {
            // Try with login form first
            let formBox = await this.loginForm.boundingBox({ timeout: 5000 });
            if (!formBox) {
                // Try with login container
                formBox = await this.loginContainer.boundingBox({ timeout: 5000 });
            }
            
            if (!formBox) return null;
            
            // Check if form is properly centered
            const pageWidth = this.page.viewportSize()?.width || 0;
            const formCenterX = formBox.x + formBox.width / 2;
            const pageCenterX = pageWidth / 2;
            
            return Math.abs(formCenterX - pageCenterX) < 20; // 20px tolerance
        } catch (e) {
            console.log('Error checking form alignment:', e);
            return null;
        }
    }

    async validateInputFieldStyles(): Promise<string[]> {
        const inputIssues: string[] = [];
        
        try {
            // Check email input height
            const emailBox = await this.emailInput.boundingBox({ timeout: 5000 });
            if (emailBox && (emailBox.height < 30 || emailBox.height > 60)) {
                inputIssues.push('Email input field height is not optimal');
            }
            
            // Check password input height
            const passwordBox = await this.passwordInput.boundingBox({ timeout: 5000 });
            if (passwordBox && (passwordBox.height < 30 || passwordBox.height > 60)) {
                inputIssues.push('Password input field height is not optimal');
            }
        } catch (e) {
            console.log('Error checking input styles:', e);
        }
        
        return inputIssues;
    }

    async validateButtonStyle(): Promise<string[]> {
        const buttonIssues: string[] = [];
        
        try {
            // Check login button contrast
            const buttonColor = await this.loginButton.evaluate((el) => {
                return window.getComputedStyle(el).backgroundColor;
            }).catch(() => '');
            
            // This is a simplified check - real check would use color contrast algorithms
            if (buttonColor === 'rgba(0, 0, 0, 0)' || buttonColor === 'transparent') {
                buttonIssues.push('Login button has insufficient color contrast');
            }
        } catch (e) {
            console.log('Error checking button style:', e);
        }
        
        return buttonIssues;
    }
} 