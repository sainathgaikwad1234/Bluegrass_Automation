import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UIIssue } from '../utils/UIValidator';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

// Collection of real UI issues found during testing
const settingsUiIssues: UIIssue[] = [];

// Test viewports for responsive testing
const viewports = [
    { width: 1920, height: 1080, name: 'Desktop-Large' },
    { width: 1366, height: 768, name: 'Desktop-Small' },
    { width: 768, height: 1024, name: 'Tablet-Portrait' }
];

// Add a unique issue to our collection, avoiding duplicates
function addUniqueIssue(issue: UIIssue) {
    // Check if we already have this issue (based on description)
    const exists = settingsUiIssues.some(i => i.issue === issue.issue);
    if (!exists) {
        settingsUiIssues.push(issue);
        console.log(`Found UI issue: ${issue.issue} (${issue.severity})`);
    }
}

test.describe('Bluegrass Admin Settings UI Issues', () => {
    test.beforeAll(async () => {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(testConfig.screenshotsDir)) {
            fs.mkdirSync(testConfig.screenshotsDir, { recursive: true });
        }
    });
    
    test.afterAll(async () => {
        if (settingsUiIssues.length > 0) {
            console.log(`\nFound ${settingsUiIssues.length} UI issues in Settings:`);
            
            settingsUiIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.issue} (${issue.severity})`);
                if (issue.screenshot) {
                    console.log(`   - Screenshot: ${issue.screenshot}`);
                }
            });
            
            // Save issues to a JSON file
            const issuesFilePath = path.join(testConfig.reportsDir, 'settings-ui-issues.json');
            fs.writeFileSync(issuesFilePath, JSON.stringify(settingsUiIssues, null, 2));
            console.log(`\nSaved settings issues to ${issuesFilePath}`);
        } else {
            console.log('\nNo UI issues identified in Settings');
        }
    });
    
    test('find UI issues in settings page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const settingsPage = new SettingsPage(page);
        const screenshotBase = 'settings-page';
        
        console.log('\nLogging in to test settings page UI...');
        
        // Login first
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.validUser.email,
            testConfig.credentials.validUser.password
        );
        
        // Verify dashboard loaded
        try {
            await dashboardPage.expectDashboardLoaded();
            console.log('Successfully logged in to dashboard');
        } catch (error) {
            console.log('Error loading dashboard:', error);
            
            // Take screenshot of login failure state
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-login-failure.png`)
            });
            
            // If login fails, we can't continue
            test.fail(true, 'Login failed, cannot navigate to settings');
            return;
        }
        
        // Navigate to settings page
        console.log('Navigating to Settings page...');
        try {
            await dashboardPage.navigateTo('Settings');
            await page.waitForTimeout(2000); // Wait for navigation to complete
            
            // Take reference screenshot of settings page
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-reference.png`)
            });
            
            // Try to wait for settings page to load
            await settingsPage.expectSettingsLoaded();
            console.log('Settings page loaded successfully');
        } catch (error) {
            console.log('Error navigating to Settings page:', error);
            
            // Take screenshot of navigation failure
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-navigation-failure.png`)
            });
            
            // Add the issue
            addUniqueIssue({
                element: 'Settings page',
                issue: 'Failed to load Settings page from dashboard navigation',
                severity: 'Critical',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-navigation-failure.png`)
            });
            
            // We can't continue testing Settings if we can't navigate there
            return;
        }
        
        // Check form alignment
        const formIssues = await settingsPage.validateFormAlignment();
        for (const issue of formIssues) {
            addUniqueIssue({
                element: 'Settings form',
                issue,
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-form-issue.png`)
            });
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-form-issue.png`)
            });
        }
        
        // Check input fields
        const inputIssues = await settingsPage.validateInputFields();
        for (const issue of inputIssues) {
            addUniqueIssue({
                element: 'Settings input fields',
                issue,
                severity: 'Medium',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-input-issue.png`)
            });
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-input-issue.png`)
            });
        }
        
        // Test for tab navigation if tabs are present
        const tabsVisible = await settingsPage.tabLinks.isVisible();
        if (tabsVisible) {
            const tabCount = await settingsPage.tabLinks.count();
            console.log(`Found ${tabCount} settings tabs`);
            
            // Try to click each tab
            for (let i = 0; i < Math.min(tabCount, 5); i++) { // Limit to 5 tabs
                try {
                    const tab = settingsPage.tabLinks.nth(i);
                    const tabName = await tab.innerText();
                    
                    console.log(`Clicking on settings tab: ${tabName}`);
                    await tab.click();
                    await page.waitForTimeout(500);
                    
                    // Take screenshot of this tab
                    await page.screenshot({
                        path: path.join(testConfig.screenshotsDir, `${screenshotBase}-tab-${i+1}.png`)
                    });
                    
                    // Check if form is visible after tab click
                    const formVisible = await settingsPage.formElements.isVisible();
                    if (!formVisible) {
                        addUniqueIssue({
                            element: `Settings tab "${tabName}"`,
                            issue: `Settings form not visible after clicking tab "${tabName}"`,
                            severity: 'High',
                            screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-tab-${i+1}-form-missing.png`)
                        });
                    }
                } catch (error) {
                    console.log(`Error testing tab ${i+1}:`, error);
                }
            }
        } else {
            console.log('No settings tabs found');
        }
        
        // Test responsive behavior at different viewport sizes
        for (const viewport of viewports) {
            console.log(`Testing settings responsiveness at ${viewport.width}x${viewport.height}`);
            
            // Set the viewport size
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);
            
            // Take screenshot at this viewport
            await page.screenshot({
                path: path.join(testConfig.screenshotsDir, `${screenshotBase}-${viewport.name}.png`)
            });
            
            // Check for responsive issues
            const responsiveIssues = await settingsPage.validateResponsiveness(viewport.width, viewport.height);
            for (const issue of responsiveIssues) {
                addUniqueIssue({
                    element: 'Settings responsive layout',
                    issue,
                    severity: 'Medium',
                    screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-${viewport.name}.png`)
                });
            }
        }
        
        // Check save button functionality
        const saveVisible = await settingsPage.saveButton.isVisible();
        if (saveVisible) {
            console.log('Testing save button for proper feedback');
            
            try {
                // Reset viewport to desktop size
                await page.setViewportSize({ width: 1366, height: 768 });
                
                // Click save button to check for feedback
                await settingsPage.saveButton.click();
                await page.waitForTimeout(1000);
                
                // Take screenshot after save
                await page.screenshot({
                    path: path.join(testConfig.screenshotsDir, `${screenshotBase}-save-clicked.png`)
                });
                
                // Check for any visible success or error message
                const successVisible = await page.locator('.success, .alert-success, .notification-success').isVisible();
                const errorVisible = await page.locator('.error, .alert-error, .notification-error').isVisible();
                
                if (!successVisible && !errorVisible) {
                    addUniqueIssue({
                        element: 'Settings save button',
                        issue: 'No feedback shown after clicking Save button',
                        severity: 'Medium',
                        screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-save-clicked.png`)
                    });
                }
            } catch (error) {
                console.log('Error testing save button:', error);
            }
        } else {
            addUniqueIssue({
                element: 'Settings save button',
                issue: 'Save button not visible on settings page',
                severity: 'High',
                screenshot: path.join(testConfig.screenshotsDir, `${screenshotBase}-reference.png`)
            });
        }
    });
}); 