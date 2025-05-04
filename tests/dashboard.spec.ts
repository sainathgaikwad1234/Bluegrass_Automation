import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UIValidator, UIIssue } from '../utils/UIValidator';
import { JiraHelper } from '../utils/JiraHelper';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Bluegrass Admin Dashboard UI Tests', () => {
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
    
    test('should validate dashboard UI elements', async ({ page }) => {
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
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'dashboard.png') });
        
        // Check sidebar
        const sidebarIssues = await uiValidator.validateResponsiveness('.sidebar-menu');
        if (sidebarIssues.length > 0) {
            for (const issue of sidebarIssues) {
                const screenshotPath = path.join(testConfig.screenshotsDir, `sidebar-issue-${uiIssues.length}.png`);
                const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                uiIssues.push(issueWithScreenshot);
            }
        }
        
        // Check dashboard widgets
        const widgetsIssues = await uiValidator.validateAlignment('.dashboard-widget');
        if (widgetsIssues.length > 0) {
            for (const issue of widgetsIssues) {
                const screenshotPath = path.join(testConfig.screenshotsDir, `widget-issue-${uiIssues.length}.png`);
                const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                uiIssues.push(issueWithScreenshot);
            }
        }
        
        // Check user profile dropdown
        const profileIssues = await uiValidator.validateInteractivity('.user-profile');
        if (profileIssues.length > 0) {
            for (const issue of profileIssues) {
                const screenshotPath = path.join(testConfig.screenshotsDir, `profile-issue-${uiIssues.length}.png`);
                const issueWithScreenshot = await uiValidator.captureIssue(issue, screenshotPath);
                uiIssues.push(issueWithScreenshot);
            }
        }
    });
}); 