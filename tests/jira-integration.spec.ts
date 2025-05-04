import { test, expect } from '@playwright/test';
import { UIIssue } from '../utils/UIValidator';
import { JiraTicketCreator } from '../utils/JiraTicketCreator';
import { testConfig } from '../config/testConfig';

// Mock UI issues for testing
const mockDashboardIssues: UIIssue[] = [
    {
        element: '.sidebar-menu',
        issue: 'Sidebar menu collapses unexpectedly on medium screens',
        severity: 'Medium',
        screenshot: './reports/screenshots/dashboard-sidebar-issue.png'
    },
    {
        element: '.dashboard-widget',
        issue: 'Dashboard widgets overlap on small screens',
        severity: 'High',
        screenshot: './reports/screenshots/dashboard-widget-issue.png'
    },
    {
        element: '.notification-icon',
        issue: 'Notification icon not visible on mobile devices',
        severity: 'Low',
        screenshot: './reports/screenshots/dashboard-notification-issue.png'
    }
];

const mockSettingsIssues: UIIssue[] = [
    {
        element: '.settings-tabs',
        issue: 'Settings tabs not correctly aligned on tablet view',
        severity: 'Medium',
        screenshot: './reports/screenshots/settings-tabs-issue.png'
    },
    {
        element: 'button:has-text("Save")',
        issue: 'Save button disabled but not visually indicating disabled state',
        severity: 'High',
        screenshot: './reports/screenshots/settings-save-button-issue.png'
    }
];

test.describe('Jira Integration Tests', () => {
    test('should format and create tickets for dashboard UI issues', async () => {
        const ticketKeys = await JiraTicketCreator.createBulkTickets(mockDashboardIssues);
        
        // Log the created tickets
        console.log('Created the following tickets for dashboard issues:');
        for (let i = 0; i < ticketKeys.length; i++) {
            console.log(`- ${ticketKeys[i]}: ${mockDashboardIssues[i].issue}`);
        }
        
        // Verify tickets were created
        expect(ticketKeys.length).toBe(mockDashboardIssues.length);
    });
    
    test('should format and create tickets for settings UI issues', async () => {
        const ticketKeys = await JiraTicketCreator.createBulkTickets(mockSettingsIssues);
        
        // Log the created tickets
        console.log('Created the following tickets for settings issues:');
        for (let i = 0; i < ticketKeys.length; i++) {
            console.log(`- ${ticketKeys[i]}: ${mockSettingsIssues[i].issue}`);
        }
        
        // Verify tickets were created
        expect(ticketKeys.length).toBe(mockSettingsIssues.length);
    });
    
    test('should create a ticket for a single UI issue', async () => {
        const singleIssue: UIIssue = {
            element: '.user-profile',
            issue: 'User profile dropdown menu disappears when cursor moves slightly',
            severity: 'Critical',
            screenshot: './reports/screenshots/user-profile-issue.png'
        };
        
        const ticketKey = await JiraTicketCreator.createTicket(singleIssue);
        
        // Log the created ticket
        console.log(`Created ticket ${ticketKey} for issue: ${singleIssue.issue}`);
        
        // Verify ticket was created
        expect(ticketKey).toContain(testConfig.jira.projectKey);
    });
}); 