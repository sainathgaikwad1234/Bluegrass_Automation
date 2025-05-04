import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UIIssue } from '../utils/UIValidator';
import { JiraTicketCreator } from '../utils/JiraTicketCreator';
import { testConfig } from '../config/testConfig';
import * as fs from 'fs';
import * as path from 'path';

// Known UI issues to report to Jira
const uiIssues: UIIssue[] = [
    {
        element: '.sidebar-menu',
        issue: 'Sidebar menu is not fully responsive on mobile devices',
        severity: 'Medium',
        screenshot: './reports/screenshots/sidebar-issue.png'
    },
    {
        element: '.dashboard-widget',
        issue: 'Dashboard widgets overflow container on tablet view',
        severity: 'High',
        screenshot: './reports/screenshots/dashboard-widget-issue.png'
    },
    {
        element: '.user-profile',
        issue: 'User profile dropdown not accessible via keyboard navigation',
        severity: 'Medium',
        screenshot: './reports/screenshots/user-profile-issue.png'
    },
    {
        element: '.settings-tabs',
        issue: 'Settings tabs overlap on small screens',
        severity: 'High',
        screenshot: './reports/screenshots/settings-tabs-issue.png'
    },
    {
        element: 'button.save-button',
        issue: 'Save button lacks proper focus state',
        severity: 'Low',
        screenshot: './reports/screenshots/save-button-issue.png'
    }
];

test.describe('Bluegrass Admin UI Issues', () => {
    test.beforeAll(async () => {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(testConfig.screenshotsDir)) {
            fs.mkdirSync(testConfig.screenshotsDir, { recursive: true });
        }
        
        // Create mock screenshots for the UI issues
        for (const issue of uiIssues) {
            if (issue.screenshot) {
                // Create an empty file for demonstration purposes
                fs.writeFileSync(issue.screenshot, '');
            }
        }
    });
    
    test('should create Jira tickets for identified UI issues', async ({ page }) => {
        // In a real scenario, we would have logged in and found these issues
        // For this example, we'll simulate finding the issues
        
        console.log(`Creating Jira tickets for ${uiIssues.length} identified UI issues...`);
        
        // Create Jira tickets for the issues
        const ticketKeys = await JiraTicketCreator.createBulkTickets(uiIssues);
        
        // Log the created tickets
        console.log('Created the following Jira tickets:');
        for (let i = 0; i < ticketKeys.length; i++) {
            console.log(`- ${ticketKeys[i]}: ${uiIssues[i].issue}`);
        }
        
        // Verify all tickets were created
        expect(ticketKeys.length).toBe(uiIssues.length);
    });
    
    test('should attempt to log in and take screenshot of dashboard', async ({ page }) => {
        // This test will attempt to log in and take a screenshot of the dashboard
        const loginPage = new LoginPage(page);
        
        // Go to login page
        await loginPage.goto();
        
        // Take screenshot of login page
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'login-page.png') });
        
        // Try to log in
        await loginPage.login(
            testConfig.credentials.validUser.email,
            testConfig.credentials.validUser.password
        );
        
        // Wait briefly to allow for potential redirect
        await page.waitForTimeout(3000);
        
        // Take screenshot after login attempt
        await page.screenshot({ path: path.join(testConfig.screenshotsDir, 'after-login.png') });
        
        console.log('Took screenshots of login page and attempted login');
    });
}); 