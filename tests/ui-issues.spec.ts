import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UIValidator, UIIssue } from '../utils/UIValidator';
import { RealJiraIntegration } from '../utils/RealJiraIntegration';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

// Global collection of UI issues
const dashboardUIIssues: UIIssue[] = [];
const settingsUIIssues: UIIssue[] = [];

// UI elements to check on the dashboard
const dashboardElements = [
    { selector: '.sidebar-menu', name: 'Sidebar Menu' },
    { selector: '.dashboard-widget', name: 'Dashboard Widget' },
    { selector: '.user-profile', name: 'User Profile' },
    { selector: '.notification-icon', name: 'Notification Icon' },
    { selector: '.search-box', name: 'Search Box' },
    { selector: '.dashboard-header', name: 'Dashboard Header' },
    { selector: '.dashboard-stats', name: 'Dashboard Stats' },
    { selector: '.dashboard-charts', name: 'Dashboard Charts' },
    { selector: '.recent-activity', name: 'Recent Activity' },
    { selector: '.quick-actions', name: 'Quick Actions' }
];

// UI elements to check on the settings page
const settingsElements = [
    { selector: '.settings-tabs', name: 'Settings Tabs' },
    { selector: '.profile-settings', name: 'Profile Settings' },
    { selector: '.security-settings', name: 'Security Settings' },
    { selector: '.notification-settings', name: 'Notification Settings' },
    { selector: 'button:has-text("Save")', name: 'Save Button' },
    { selector: 'button:has-text("Cancel")', name: 'Cancel Button' },
    { selector: '.settings-header', name: 'Settings Header' },
    { selector: '.settings-form', name: 'Settings Form' },
    { selector: '.settings-sidebar', name: 'Settings Sidebar' },
    { selector: '.settings-content', name: 'Settings Content' }
];

test.describe('Bluegrass Admin UI Issues Finder', () => {
    test.beforeAll(async () => {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(testConfig.screenshotsDir)) {
            fs.mkdirSync(testConfig.screenshotsDir, { recursive: true });
        }
    });
    
    test.afterAll(async () => {
        // Report all issues found during the tests
        console.log(`Found ${dashboardUIIssues.length} dashboard UI issues`);
        console.log(`Found ${settingsUIIssues.length} settings UI issues`);
        
        // In a real implementation, this would create Jira tickets
        if (dashboardUIIssues.length > 0 || settingsUIIssues.length > 0) {
            console.log('Creating Jira tickets for identified UI issues...');
            
            if (dashboardUIIssues.length > 0) {
                await RealJiraIntegration.createJiraTickets(dashboardUIIssues);
            }
            
            if (settingsUIIssues.length > 0) {
                await RealJiraIntegration.createJiraTickets(settingsUIIssues);
            }
        }
    });
    
    test('should identify UI issues on dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const uiValidator = new UIValidator(page);
        
        // Login
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.validUser.email, 
            testConfig.credentials.validUser.password
        );
        
        // Wait for dashboard to load
        await dashboardPage.expectDashboardLoaded();
        
        // Take screenshot for reference
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'dashboard-reference.png') });
        
        // Check each dashboard element
        for (const element of dashboardElements) {
            console.log(`Checking element: ${element.name} (${element.selector})`);
            
            // Check for responsiveness issues
            const responsivenessIssues = await uiValidator.validateResponsiveness(element.selector);
            if (responsivenessIssues.length > 0) {
                for (const issue of responsivenessIssues) {
                    const screenshotPath = path.join(testConfig.screenshotsDir, `dashboard-${element.name.toLowerCase().replace(/\s+/g, '-')}-responsiveness.png`);
                    const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                    dashboardUIIssues.push(issueWithScreenshot);
                }
            }
            
            // Check for alignment issues
            const alignmentIssues = await uiValidator.validateAlignment(element.selector);
            if (alignmentIssues.length > 0) {
                for (const issue of alignmentIssues) {
                    const screenshotPath = path.join(testConfig.screenshotsDir, `dashboard-${element.name.toLowerCase().replace(/\s+/g, '-')}-alignment.png`);
                    const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                    dashboardUIIssues.push(issueWithScreenshot);
                }
            }
            
            // Check for interactivity issues
            const interactivityIssues = await uiValidator.validateInteractivity(element.selector);
            if (interactivityIssues.length > 0) {
                for (const issue of interactivityIssues) {
                    const screenshotPath = path.join(testConfig.screenshotsDir, `dashboard-${element.name.toLowerCase().replace(/\s+/g, '-')}-interactivity.png`);
                    const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                    dashboardUIIssues.push(issueWithScreenshot);
                }
            }
        }
    });
    
    test('should identify UI issues on settings page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const settingsPage = new SettingsPage(page);
        const uiValidator = new UIValidator(page);
        
        // Login
        await loginPage.goto();
        await loginPage.login(
            testConfig.credentials.validUser.email, 
            testConfig.credentials.validUser.password
        );
        
        // Wait for dashboard to load
        await dashboardPage.expectDashboardLoaded();
        
        // Navigate to settings
        await dashboardPage.navigateTo('Settings');
        
        // Wait for settings page to load
        await settingsPage.expectSettingsPageLoaded();
        
        // Take screenshot for reference
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'settings-reference.png') });
        
        // Check each settings element
        for (const element of settingsElements) {
            console.log(`Checking element: ${element.name} (${element.selector})`);
            
            // Check for responsiveness issues
            const responsivenessIssues = await uiValidator.validateResponsiveness(element.selector);
            if (responsivenessIssues.length > 0) {
                for (const issue of responsivenessIssues) {
                    const screenshotPath = path.join(testConfig.screenshotsDir, `settings-${element.name.toLowerCase().replace(/\s+/g, '-')}-responsiveness.png`);
                    const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                    settingsUIIssues.push(issueWithScreenshot);
                }
            }
            
            // Check for alignment issues
            const alignmentIssues = await uiValidator.validateAlignment(element.selector);
            if (alignmentIssues.length > 0) {
                for (const issue of alignmentIssues) {
                    const screenshotPath = path.join(testConfig.screenshotsDir, `settings-${element.name.toLowerCase().replace(/\s+/g, '-')}-alignment.png`);
                    const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                    settingsUIIssues.push(issueWithScreenshot);
                }
            }
            
            // Check for interactivity issues
            const interactivityIssues = await uiValidator.validateInteractivity(element.selector);
            if (interactivityIssues.length > 0) {
                for (const issue of interactivityIssues) {
                    const screenshotPath = path.join(testConfig.screenshotsDir, `settings-${element.name.toLowerCase().replace(/\s+/g, '-')}-interactivity.png`);
                    const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                    settingsUIIssues.push(issueWithScreenshot);
                }
            }
        }
    });
}); 