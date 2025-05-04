import * as fs from 'fs';
import * as path from 'path';
import { UIIssue } from '../utils/UIValidator';
import { JiraActualIntegration } from '../utils/JiraActualIntegration';

// Path to the real UI issues JSON file
const UI_ISSUES_FILE = path.join(__dirname, '..', 'reports', 'real-ui-issues.json');

async function createJiraTicketsForRealIssues() {
    try {
        console.log('Reading UI issues file...');
        
        // Check if file exists
        if (!fs.existsSync(UI_ISSUES_FILE)) {
            console.error(`Error: UI issues file not found at ${UI_ISSUES_FILE}`);
            console.log('Please run the UI tests first to generate the issues file.');
            return;
        }
        
        // Read and parse issues
        const fileContents = fs.readFileSync(UI_ISSUES_FILE, 'utf8');
        const issues: UIIssue[] = JSON.parse(fileContents);
        
        console.log(`Found ${issues.length} UI issues to create tickets for.`);
        
        if (issues.length === 0) {
            console.log('No issues to process.');
            return;
        }
        
        // Create tickets for issues
        console.log('Creating Jira tickets...');
        const ticketKeys = await JiraActualIntegration.createJiraTickets(issues);
        
        // Create a mapping of issues to tickets
        const ticketMapping = issues.map((issue, index) => ({
            issue: issue.issue,
            severity: issue.severity,
            ticket: ticketKeys[index],
            screenshot: issue.screenshot || null
        }));
        
        // Save the mapping to a file
        const outputFile = path.join(__dirname, '..', 'reports', 'jira-tickets.json');
        fs.writeFileSync(outputFile, JSON.stringify(ticketMapping, null, 2));
        
        console.log('\nCreated the following Jira tickets:');
        for (let i = 0; i < ticketKeys.length; i++) {
            console.log(`${i + 1}. ${ticketKeys[i]}: ${issues[i].issue} (${issues[i].severity})`);
        }
        
        console.log(`\nTicket mapping saved to ${outputFile}`);
    } catch (error) {
        console.error('Error creating Jira tickets:', error);
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    createJiraTicketsForRealIssues()
        .then(() => console.log('Done'))
        .catch(error => console.error('Error:', error));
}

export { createJiraTicketsForRealIssues }; 