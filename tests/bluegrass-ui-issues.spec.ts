import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UIIssue } from '../utils/UIValidator';
import { JiraTicketCreator } from '../utils/JiraTicketCreator';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

// Collection of real UI issues found during testing
const realUiIssues: UIIssue[] = [];

// Set to track which issues we've already reported (to avoid duplicates)
const reportedIssueTexts = new Set<string>();

/**
 * Add an issue to the issues collection if it's not already reported
 */
function addUniqueIssue(issue: UIIssue) {
    if (!reportedIssueTexts.has(issue.issue)) {
        reportedIssueTexts.add(issue.issue);
        realUiIssues.push(issue);
        console.log(`Found UI issue: ${issue.issue} (${issue.severity})`);
    }
}

test.describe('Bluegrass Admin Portal UI Issues Finder', () => {
    test.beforeAll(async () => {
        // Create screenshots directory
        if (!fs.existsSync(testConfig.screenshotsDir)) {
            fs.mkdirSync(testConfig.screenshotsDir, { recursive: true });
        }
    });
    
    test.afterAll(async () => {
        if (realUiIssues.length > 0) {
            console.log(`\nFound ${realUiIssues.length} unique UI issues:`);
            
            realUiIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.issue} (${issue.severity})`);
                if (issue.screenshot) {
                    console.log(`   - Screenshot: ${issue.screenshot}`);
                }
            });
            
            // Save issues to a JSON file
            const issuesFilePath = path.join(testConfig.reportsDir, 'real-ui-issues.json');
            fs.writeFileSync(issuesFilePath, JSON.stringify(realUiIssues, null, 2));
            console.log(`\nSaved issues to ${issuesFilePath}`);
        } else {
            console.log('\nNo UI issues identified');
        }
    });
    
    test('find UI issues in login page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const screenshotBase = 'login-page';
        
        console.log('\nTesting login page UI...');
        
        // Navigate to login page
        await loginPage.goto();
        await page.waitForLoadState('networkidle');
        
        // Take reference screenshot
        await page.screenshot({ 
            path: path.join(testConfig.screenshotsDir, `${screenshotBase}-reference.png`) 
        });
        
        // Check if all expected elements are visible
        const emailVisible = await loginPage.emailInput.isVisible();
        const passwordVisible = await loginPage.passwordInput.isVisible();
        const loginButtonVisible = await loginPage.loginButton.isVisible();
        
        if (!emailVisible) {
            addUniqueIssue({
                element: 'Email input',
                issue: 'Email/username input field not visible on login page',
                severity: 'Critical',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-email.png`)
            });
            await page.screenshot({ 
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-email.png`) 
            });
        }
        
        if (!passwordVisible) {
            addUniqueIssue({
                element: 'Password input',
                issue: 'Password input field not visible on login page',
                severity: 'Critical',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-password.png`)
            });
            await page.screenshot({ 
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-password.png`) 
            });
        }
        
        if (!loginButtonVisible) {
            addUniqueIssue({
                element: 'Login button',
                issue: 'Login button not visible on login page',
                severity: 'Critical',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-button.png`)
            });
            await page.screenshot({ 
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-button.png`) 
            });
        }
        
        // Check for UI consistency issues only if basic elements exist
        if (emailVisible && passwordVisible && loginButtonVisible) {
            // Check input field alignment
            try {
                const emailBox = await loginPage.emailInput.boundingBox();
                const passwordBox = await loginPage.passwordInput.boundingBox();
                
                if (emailBox && passwordBox) {
                    // Check if inputs are misaligned horizontally
                    if (Math.abs(emailBox.x - passwordBox.x) > 5) {
                        addUniqueIssue({
                            element: 'Login form inputs',
                            issue: 'Login form input fields are not properly aligned horizontally',
                            severity: 'Medium',
                            screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-input-alignment.png`)
                        });
                        await page.screenshot({ 
                            path: path.join(testConfig.screenshotsDir, `${screenshotBase}-input-alignment.png`) 
                        });
                    }
                    
                    // Check if input widths are inconsistent
                    if (Math.abs(emailBox.width - passwordBox.width) > 5) {
                        addUniqueIssue({
                            element: 'Login form inputs',
                            issue: 'Login form input fields have inconsistent widths',
                            severity: 'Low',
                            screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-input-widths.png`)
                        });
                        await page.screenshot({ 
                            path: path.join(testConfig.screenshotsDir, `${screenshotBase}-input-widths.png`) 
                        });
                    }
                }
            } catch (error) {
                console.log('Error checking input alignment:', error);
            }
            
            // Try to detect visual issues by simulating mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(500);
            
            const mobileEmailVisible = await loginPage.emailInput.isVisible();
            const mobilePasswordVisible = await loginPage.passwordInput.isVisible();
            const mobileLoginButtonVisible = await loginPage.loginButton.isVisible();
            
            // Take mobile reference screenshot
            await page.screenshot({ 
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-mobile.png`) 
            });
            
            if (!mobileEmailVisible || !mobilePasswordVisible || !mobileLoginButtonVisible) {
                addUniqueIssue({
                    element: 'Login form',
                    issue: 'Login form elements not properly displayed on mobile viewports',
                    severity: 'High',
                    screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-mobile.png`)
                });
            }
            
            // Reset viewport to desktop size
            await page.setViewportSize({ width: 1366, height: 768 });
        }
        
        // Test empty form submission
        try {
            await loginPage.login('', '');
            await page.waitForTimeout(1000);
            
            // Check if form was submitted without validation
            const currentUrl = page.url();
            const stillOnLoginPage = await loginPage.loginButton.isVisible();
            
            if (!stillOnLoginPage || !currentUrl.includes('bluegrassbsc.com')) {
                addUniqueIssue({
                    element: 'Login form validation',
                    issue: 'Login form allows submission with empty fields',
                    severity: 'High',
                    screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-empty-submission.png`)
                });
                await page.screenshot({ 
                    path: path.join(testConfig.screenshotsDir, `${screenshotBase}-empty-submission.png`) 
                });
            }
        } catch (error) {
            console.log('Error testing empty form submission:', error);
        }
    });
    
    test('find UI issues in dashboard after login', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const screenshotBase = 'dashboard';
        
        console.log('\nLogging in to test dashboard UI...');
        
        // Login
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.validUser.email,
            testConfig.credentials.validUser.password
        );
        
        // Wait for dashboard to load with more generous timeout
        try {
            await dashboardPage.expectDashboardLoaded();
            console.log('Successfully logged in to dashboard');
        } catch (error) {
            console.log('Error loading dashboard:', error);
            
            // Take screenshot of whatever state we're in
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-login-failure.png`)
            });
            
            addUniqueIssue({
                element: 'Dashboard',
                issue: 'Dashboard fails to load after successful login',
                severity: 'Critical',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-login-failure.png`)
            });
            
            // Stop test if we couldn't even load the dashboard
            return;
        }
        
        // Take reference screenshot
        await page.screenshot({
            path: path.join(testConfig.screenshotsDir, `${screenshotBase}-reference.png`)
        });
        
        // Check for sidebar presence
        const sidebarVisible = await dashboardPage.sidebarMenu.isVisible();
        if (!sidebarVisible) {
            addUniqueIssue({
                element: 'Sidebar',
                issue: 'Navigation sidebar not visible on dashboard',
                severity: 'High',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-sidebar.png`)
            });
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-missing-sidebar.png`)
            });
        }
        
        // Check for responsive issues on desktop size
        // Get card/widget problems on desktop
        const cardIssues = await dashboardPage.validateCardLayout();
        for (const issue of cardIssues) {
            addUniqueIssue({
                element: 'Dashboard cards/widgets',
                issue,
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-card-issue.png`)
            });
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-card-issue.png`)
            });
        }
        
        // Check tablet responsiveness
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        
        await page.screenshot({
            path: path.join(testConfig.screenshotsDir, `${screenshotBase}-tablet.png`)
        });
        
        const tabletIssues = await dashboardPage.validateResponsiveness(768, 1024);
        for (const issue of tabletIssues) {
            addUniqueIssue({
                element: 'Dashboard responsive layout',
                issue,
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-tablet.png`)
            });
        }
        
        // Reset to desktop size
        await page.setViewportSize({ width: 1366, height: 768 });
        
        // Try to navigate to settings
        try {
            await dashboardPage.navigateTo('Settings');
            await page.waitForTimeout(2000);
            
            // Take screenshot of where we ended up
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, 'settings-page.png')
            });
            
            // Simple check if URL changed
            const url = page.url();
            if (url === testConfig.baseUrl) {
                addUniqueIssue({
                    element: 'Navigation',
                    issue: 'Unable to navigate to Settings page from dashboard',
                    severity: 'High',
                    screenshot: path.join(testConfig.screenshotsDir, 'settings-navigation-issue.png')
                });
                await page.screenshot({
                    path: path.join(testConfig.screenshotsDir, 'settings-navigation-issue.png')
                });
            }
        } catch (error) {
            console.log('Error navigating to Settings:', error);
            
            addUniqueIssue({
                element: 'Navigation',
                issue: 'Error when attempting to navigate to Settings page',
                severity: 'High',
                screenshot: path.join(testConfig.screenshotsDir, 'settings-navigation-error.png')
            });
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, 'settings-navigation-error.png')
            });
        }
    });
}); 