import * as fs from 'fs';
import * as path from 'path';
import { UIIssue } from './UIValidator';
import { JiraActualIntegration } from './JiraActualIntegration';

// Path to the UI issues JSON file
const UI_ISSUES_FILE = path.join(__dirname, '..', 'reports', 'ui-issues.json');

async function createJiraTicketsFromIssuesFile() {
    try {
        // Check if the file exists
        if (!fs.existsSync(UI_ISSUES_FILE)) {
            console.error(`UI issues file not found: ${UI_ISSUES_FILE}`);
            return;
        }
        
        // Read and parse the UI issues
        const issuesJson = fs.readFileSync(UI_ISSUES_FILE, 'utf8');
        const issues: UIIssue[] = JSON.parse(issuesJson);
        
        console.log(`Found ${issues.length} UI issues in file`);
        
        if (issues.length === 0) {
            console.log('No issues to create tickets for');
            return;
        }
        
        // Create tickets for each issue
        const ticketKeys = await JiraActualIntegration.createJiraTickets(issues);
        
        console.log('Created the following Jira tickets:');
        for (let i = 0; i < ticketKeys.length; i++) {
            console.log(`- ${ticketKeys[i]}: ${issues[i].issue}`);
        }
        
        // Save ticket information
        const ticketsInfo = issues.map((issue, index) => ({
            issue: issue.issue,
            ticket: ticketKeys[index]
        }));
        
        fs.writeFileSync(
            path.join(__dirname, '..', 'reports', 'jira-tickets.json'),
            JSON.stringify(ticketsInfo, null, 2)
        );
        
        console.log('Ticket creation complete');
    } catch (error) {
        console.error('Error creating Jira tickets:', error);
    }
}

// Execute if this script is run directly
if (require.main === module) {
    createJiraTicketsFromIssuesFile()
        .then(() => console.log('Done'))
        .catch(err => console.error('Error:', err));
}

export { createJiraTicketsFromIssuesFile }; 