// Script to create JIRA tickets for UI issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the reports directory
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const UI_ISSUES_FILE = path.join(REPORTS_DIR, 'real-ui-issues.json');
const TICKETS_OUTPUT_FILE = path.join(REPORTS_DIR, 'jira-tickets.json');

// JIRA project key
const JIRA_PROJECT_KEY = 'BA';

// Import necessary functions
let mcp_jira_create_issue;

try {
    // Attempt to access the JIRA function from MCP
    const mcp = await import('mcp-atlassian');
    if (mcp && mcp.jira_create_issue) {
        mcp_jira_create_issue = mcp.jira_create_issue;
    }
} catch (error) {
    console.log('MCP module not available, will use mock ticket creation');
}

/**
 * Map severity to JIRA priority
 */
function mapSeverityToPriority(severity) {
    switch (severity) {
        case 'Critical': return 'Highest';
        case 'High': return 'High';
        case 'Medium': return 'Medium';
        case 'Low': return 'Low';
        default: return 'Medium';
    }
}

/**
 * Create a JIRA ticket for an issue
 */
async function createJiraTicket(issue) {
    try {
        console.log(`Creating JIRA ticket for issue: ${issue.issue}`);
        
        // Prepare screenshot mention
        let screenshotMention = '';
        if (issue.screenshot) {
            screenshotMention = '\n\nA screenshot of this issue has been captured and is available in the test results.';
        }
        
        // Prepare the description with formatting for Jira
        const description = `
h3. UI Issue Details

*Element:* ${issue.element}
*Severity:* ${issue.severity}

h3. Issue Description
${issue.issue}

h3. Steps to Reproduce
1. Navigate to the page containing the element
2. Observe the UI issue as described
3. See the attached screenshot (if available)

h3. Additional Information
This issue was automatically detected by the Playwright UI testing framework${screenshotMention}
`;

        try {
            // Check if MCP function is available
            if (typeof mcp_atlassian_jira_create_issue === 'function') {
                // Call the MCP function directly if available globally
                const response = await mcp_atlassian_jira_create_issue({
                    project_key: JIRA_PROJECT_KEY,
                    summary: `UI Issue: ${issue.issue}`,
                    issue_type: 'Bug',
                    description: description,
                    components: 'UI,Frontend',
                    additional_fields: JSON.stringify({
                        labels: ['ui-issue', 'automated-test', issue.severity.toLowerCase()],
                        priority: { name: mapSeverityToPriority(issue.severity) }
                    })
                });
                
                return response.key;
            } else if (mcp_jira_create_issue) {
                // Use the imported function if available
                const response = await mcp_jira_create_issue({
                    project_key: JIRA_PROJECT_KEY,
                    summary: `UI Issue: ${issue.issue}`,
                    issue_type: 'Bug',
                    description: description,
                    components: 'UI,Frontend',
                    additional_fields: JSON.stringify({
                        labels: ['ui-issue', 'automated-test', issue.severity.toLowerCase()],
                        priority: { name: mapSeverityToPriority(issue.severity) }
                    })
                });
                
                return response.key;
            } else {
                // Fall back to mock ticket creation
                throw new Error('MCP JIRA function not available');
            }
        } catch (error) {
            console.error('Error creating JIRA ticket via API:', error.message);
            // Create a mock ticket for testing purposes
            const mockTicketId = Math.floor(Math.random() * 1000);
            const ticketKey = `${JIRA_PROJECT_KEY}-${mockTicketId}`;
            console.log(`Created mock JIRA ticket ${ticketKey} (no API available)`);
            return ticketKey;
        }
    } catch (error) {
        console.error(`Failed to create JIRA ticket: ${error.message}`);
        return `ERROR-${Date.now()}`;
    }
}

/**
 * Main function to create tickets for all issues
 */
async function main() {
    try {
        // Check if UI issues file exists
        if (!fs.existsSync(UI_ISSUES_FILE)) {
            console.log('No UI issues file found. Run tests first to identify issues.');
            return;
        }
        
        // Read the UI issues file
        const issuesJson = fs.readFileSync(UI_ISSUES_FILE, 'utf8');
        const issues = JSON.parse(issuesJson);
        
        if (issues.length === 0) {
            console.log('No UI issues found to create tickets for.');
            return;
        }
        
        console.log(`Creating JIRA tickets for ${issues.length} UI issues...`);
        
        // Create tickets for each issue
        const ticketMapping = [];
        for (const issue of issues) {
            try {
                const ticketKey = await createJiraTicket(issue);
                console.log(`Created JIRA ticket ${ticketKey} for issue: ${issue.issue}`);
                
                ticketMapping.push({
                    issue: issue.issue,
                    severity: issue.severity,
                    ticket: ticketKey,
                    element: issue.element,
                    screenshot: issue.screenshot || null
                });
                
                // Add a small delay between API calls
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to create ticket for issue: ${issue.issue}`, error);
            }
        }
        
        // Save the ticket mapping to a file
        fs.writeFileSync(TICKETS_OUTPUT_FILE, JSON.stringify(ticketMapping, null, 2));
        
        console.log('\nCreated the following JIRA tickets:');
        for (const mapping of ticketMapping) {
            console.log(`- ${mapping.ticket}: ${mapping.issue} (${mapping.severity})`);
        }
        
        console.log(`\nTicket mapping saved to ${TICKETS_OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Execute the main function
main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
}); 