import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { UIIssue } from '../utils/UIValidator';
import { JiraActualIntegration } from '../utils/JiraActualIntegration';
import { testConfig } from '../config/testConfig';

// Path to the test reports directory
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const DASHBOARD_ISSUES_FILE = path.join(REPORTS_DIR, 'real-ui-issues.json');
const SETTINGS_ISSUES_FILE = path.join(REPORTS_DIR, 'settings-ui-issues.json');
const TICKETS_OUTPUT_FILE = path.join(REPORTS_DIR, 'jira-tickets.json');

/**
 * Runs the Playwright tests using the npx command
 */
async function runTests(): Promise<boolean> {
    return new Promise((resolve) => {
        console.log('Running UI tests to find issues...');
        
        const process = spawn('npx', ['playwright', 'test', 'bluegrass-ui-issues.spec.ts', 'settings-ui-issues.spec.ts'], {
            stdio: 'inherit',
            shell: true
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log('Tests completed successfully');
                resolve(true);
            } else {
                console.log(`Tests exited with code ${code}`);
                resolve(false); // We still want to create tickets even if tests "fail" (they might fail because they found issues)
            }
        });
    });
}

/**
 * Reads UI issues from the JSON files and combines them
 */
async function collectIssues(): Promise<UIIssue[]> {
    const allIssues: UIIssue[] = [];
    
    // Read dashboard issues if the file exists
    if (fs.existsSync(DASHBOARD_ISSUES_FILE)) {
        try {
            const dashboardIssuesJson = fs.readFileSync(DASHBOARD_ISSUES_FILE, 'utf8');
            const dashboardIssues: UIIssue[] = JSON.parse(dashboardIssuesJson);
            allIssues.push(...dashboardIssues);
            console.log(`Found ${dashboardIssues.length} dashboard UI issues`);
        } catch (error) {
            console.error('Error reading dashboard issues file:', error);
        }
    } else {
        console.log('No dashboard issues file found');
    }
    
    // Read settings issues if the file exists
    if (fs.existsSync(SETTINGS_ISSUES_FILE)) {
        try {
            const settingsIssuesJson = fs.readFileSync(SETTINGS_ISSUES_FILE, 'utf8');
            const settingsIssues: UIIssue[] = JSON.parse(settingsIssuesJson);
            allIssues.push(...settingsIssues);
            console.log(`Found ${settingsIssues.length} settings UI issues`);
        } catch (error) {
            console.error('Error reading settings issues file:', error);
        }
    } else {
        console.log('No settings issues file found');
    }
    
    return allIssues;
}

/**
 * Creates JIRA tickets for the collected issues
 */
async function createTicketsForIssues(issues: UIIssue[]): Promise<void> {
    if (issues.length === 0) {
        console.log('No issues found to create tickets for');
        return;
    }
    
    console.log(`Creating JIRA tickets for ${issues.length} issues...`);
    
    try {
        const ticketKeys = await JiraActualIntegration.createJiraTickets(issues);
        
        // Create a mapping of issues to tickets
        const ticketMapping = issues.map((issue, index) => ({
            issue: issue.issue,
            severity: issue.severity,
            ticket: ticketKeys[index],
            element: issue.element,
            screenshot: issue.screenshot || null
        }));
        
        // Save the mapping to a file
        fs.writeFileSync(TICKETS_OUTPUT_FILE, JSON.stringify(ticketMapping, null, 2));
        
        console.log('\nCreated the following Jira tickets:');
        for (let i = 0; i < ticketKeys.length; i++) {
            console.log(`${i + 1}. ${ticketKeys[i]}: ${issues[i].issue} (${issues[i].severity})`);
        }
        
        console.log(`\nTicket mapping saved to ${TICKETS_OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error creating JIRA tickets:', error);
    }
}

/**
 * Main function to run tests and create tickets
 */
async function main() {
    try {
        // Ensure reports directory exists
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }
        
        // Run the tests to find UI issues
        await runTests();
        
        // Collect all the issues from the test reports
        const allIssues = await collectIssues();
        
        // Create JIRA tickets for the issues
        await createTicketsForIssues(allIssues);
        
        console.log('Process completed successfully');
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Execute the main function if this script is run directly
if (require.main === module) {
    main().catch(err => {
        console.error('Unhandled error:', err);
        process.exit(1);
    });
}

export { runTests, collectIssues, createTicketsForIssues }; 