import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UIValidator, UIIssue } from '../utils/UIValidator';
import { JiraHelper } from '../utils/JiraHelper';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Bluegrass Admin Settings UI Tests', () => {
    let uiIssues: UIIssue[] = [];
    
    test.beforeAll(async () => {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(testConfig.screenshotsDir)) {
            fs.mkdirSync(testConfig.screenshotsDir, { recursive: true });
        }
    });
    
    test.afterAll(async () => {
        if (uiIssues.length > 0) {
            // In a real implementation, this would create Jira tickets
            const jiraHelper = new JiraHelper(testConfig.jira.projectKey);
            console.log('Found UI issues:');
            console.log(JSON.stringify(uiIssues, null, 2));
            console.log('Would create Jira tickets for these issues.');
        }
    });
    
    test('should validate settings UI elements', async ({ page }) => {
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
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'settings.png') });
        
        // Check settings tabs
        const tabsIssues = await uiValidator.validateResponsiveness('.settings-tabs');
        if (tabsIssues.length > 0) {
            for (const issue of tabsIssues) {
                const screenshotPath = path.join(testConfig.screenshotsDir, `settings-tabs-issue-${uiIssues.length}.png`);
                const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                uiIssues.push(issueWithScreenshot);
            }
        }
        
        // Check profile settings section
        const profileSettingsIssues = await uiValidator.validateAlignment('.profile-settings');
        if (profileSettingsIssues.length > 0) {
            for (const issue of profileSettingsIssues) {
                const screenshotPath = path.join(testConfig.screenshotsDir, `profile-settings-issue-${uiIssues.length}.png`);
                const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                uiIssues.push(issueWithScreenshot);
            }
        }
        
        // Check save/cancel buttons
        const buttonIssues = await uiValidator.validateInteractivity('button:has-text("Save")');
        if (buttonIssues.length > 0) {
            for (const issue of buttonIssues) {
                const screenshotPath = path.join(testConfig.screenshotsDir, `save-button-issue-${uiIssues.length}.png`);
                const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                uiIssues.push(issueWithScreenshot);
            }
        }
    });
}); 