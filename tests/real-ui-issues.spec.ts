import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UIIssue } from '../utils/UIValidator';
import { JiraTicketCreator } from '../utils/JiraTicketCreator';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

// Collection to store identified UI issues
const uiIssues: UIIssue[] = [];

// Test viewports for responsive testing
const viewports = [
    { width: 1920, height: 1080, name: 'Desktop-Large' },
    { width: 1366, height: 768, name: 'Desktop-Small' },
    { width: 768, height: 1024, name: 'Tablet-Portrait' },
    { width: 414, height: 896, name: 'Mobile-Large' },
    { width: 375, height: 667, name: 'Mobile-Small' }
];

test.describe('Bluegrass Admin UI Issues Analysis', () => {
    test.beforeAll(async () => {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(testConfig.screenshotsDir)) {
            fs.mkdirSync(testConfig.screenshotsDir, { recursive: true });
        }
    });
    
    test.afterAll(async () => {
        console.log(`Found ${uiIssues.length} UI issues`);
        
        if (uiIssues.length > 0) {
            // Save issues to a JSON file for reference
            const issuesFilePath = path.join(testConfig.reportsDir, 'ui-issues.json');
            fs.writeFileSync(issuesFilePath, JSON.stringify(uiIssues, null, 2));
            
            console.log(`UI issues saved to ${issuesFilePath}`);
            
            // Create Jira tickets for the issues
            const ticketKeys = await JiraTicketCreator.createBulkTickets(uiIssues);
            
            console.log('Created the following Jira tickets:');
            for (let i = 0; i < ticketKeys.length; i++) {
                console.log(`- ${ticketKeys[i]}: ${uiIssues[i].issue}`);
            }
        }
    });
    
    test('login page UI validation', async ({ page }) => {
        const loginPage = new LoginPage(page);
        
        // Go to login page
        await loginPage.goto();
        
        // Take screenshot for reference
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'login-page-validation.png') });
        
        // Test login form alignment
        const isAligned = await loginPage.validateLoginFormAlignment();
        if (isAligned === false) {
            const issue: UIIssue = {
                element: 'form.login-form',
                issue: 'Login form is not properly centered on the page',
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, 'login-form-alignment-issue.png')
            };
            await page.screenshot({ path: issue.screenshot });
            uiIssues.push(issue);
        }
        
        // Test input field styles
        const inputIssues = await loginPage.validateInputFieldStyles();
        for (const issueText of inputIssues) {
            const issue: UIIssue = {
                element: 'input[type="text"], input[type="password"]',
                issue: issueText,
                severity: 'Low',
                screenshot: path.join(testConfig.screenshotsDir, `login-input-issue-${inputIssues.indexOf(issueText)}.png`)
            };
            await page.screenshot({ path: issue.screenshot });
            uiIssues.push(issue);
        }
        
        // Test button style
        const buttonIssues = await loginPage.validateButtonStyle();
        for (const issueText of buttonIssues) {
            const issue: UIIssue = {
                element: 'button:has-text("Login")',
                issue: issueText,
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, `login-button-issue-${buttonIssues.indexOf(issueText)}.png`)
            };
            await page.screenshot({ path: issue.screenshot });
            uiIssues.push(issue);
        }
        
        // Test responsive behavior at different viewport sizes
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500); // Allow time for responsive adjustments
            
            // Take screenshot at this viewport
            await page.screenshot({ 
                path: path.join(testConfig.screenshotsDir, `login-${viewport.name}.png`)
            });
            
            // Check if all important elements are visible
            const emailVisible = await loginPage.emailInput.isVisible();
            const passwordVisible = await loginPage.passwordInput.isVisible();
            const buttonVisible = await loginPage.loginButton.isVisible();
            
            if (!emailVisible || !passwordVisible || !buttonVisible) {
                const issue: UIIssue = {
                    element: 'form.login-form',
                    issue: `Login form elements not properly displayed at ${viewport.width}x${viewport.height}`,
                    severity: 'High',
                    screenshot: path.join(testConfig.screenshotsDir, `login-responsive-issue-${viewport.name}.png`)
                };
                await page.screenshot({ path: issue.screenshot });
                uiIssues.push(issue);
            }
        }
    });
    
    test('dashboard UI validation after login', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        
        // Login to the application
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.validUser.email,
            testConfig.credentials.validUser.password
        );
        
        // Wait for dashboard to load
        await dashboardPage.expectDashboardLoaded();
        
        // Take screenshot for reference
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'dashboard-validation.png') });
        
        // Validate dashboard card layout
        const cardLayoutIssues = await dashboardPage.validateCardLayout();
        for (const issueText of cardLayoutIssues) {
            const issue: UIIssue = {
                element: '.card, .dashboard-card, .widget',
                issue: issueText,
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, `dashboard-card-issue-${cardLayoutIssues.indexOf(issueText)}.png`)
            };
            await page.screenshot({ path: issue.screenshot });
            uiIssues.push(issue);
        }
        
        // Test responsive behavior at different viewport sizes
        for (const viewport of viewports) {
            // Skip mobile sizes for dashboard (or handle differently)
            if (viewport.width < 768) continue;
            
            const responsiveIssues = await dashboardPage.validateResponsiveness(viewport.width, viewport.height);
            
            // Take screenshot at this viewport
            await page.screenshot({ 
                path: path.join(testConfig.screenshotsDir, `dashboard-${viewport.name}.png`)
            });
            
            for (const issueText of responsiveIssues) {
                const issue: UIIssue = {
                    element: '.main-content, .content-wrapper',
                    issue: issueText,
                    severity: 'Medium',
                    screenshot: path.join(testConfig.screenshotsDir, `dashboard-responsive-issue-${viewport.name}-${responsiveIssues.indexOf(issueText)}.png`)
                };
                await page.screenshot({ path: issue.screenshot });
                uiIssues.push(issue);
            }
        }
        
        // Test interactive elements
        try {
            await dashboardPage.openUserDropdown();
            await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'user-dropdown.png') });
        } catch (error) {
            const issue: UIIssue = {
                element: '.user-profile, .profile-dropdown',
                issue: 'User dropdown menu does not appear when clicked',
                severity: 'High',
                screenshot: path.join(testConfig.screenshotsDir, 'user-dropdown-issue.png')
            };
            await page.screenshot({ path: issue.screenshot });
            uiIssues.push(issue);
        }
        
        // Check navigation to other pages
        try {
            // Attempt to navigate to Settings
            await dashboardPage.navigateTo('Settings');
            
            // Take screenshot of settings page
            await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'settings-page.png') });
            
            // Check if we actually navigated (this is simplified)
            const url = page.url();
            if (!url.includes('settings')) {
                const issue: UIIssue = {
                    element: '.sidebar-menu a:has-text("Settings")',
                    issue: 'Settings navigation link does not properly navigate to settings page',
                    severity: 'High',
                    screenshot: path.join(testConfig.screenshotsDir, 'settings-navigation-issue.png')
                };
                await page.screenshot({ path: issue.screenshot });
                uiIssues.push(issue);
            }
        } catch (error) {
            console.log('Error navigating to Settings:', error);
        }
    });
}); 