// Script to directly create JIRA tickets for UI issues using the MCP functions
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
            // Use the MCP function to create the ticket
            const response = await global.mcp_mcp_atlassian_jira_create_issue({
                project_key: JIRA_PROJECT_KEY,
                summary: `UI Issue: ${issue.issue}`,
                issue_type: 'Bug',
                description: description,
                additional_fields: JSON.stringify({
                    labels: ['ui-issue', 'automated-test', issue.severity.toLowerCase()]
                })
            });
            
            console.log(`Created JIRA ticket ${response.key} for issue: ${issue.issue}`);
            return response.key;
        } catch (error) {
            console.error('Error creating JIRA ticket via API:', error);
            throw error;
        }
    } catch (error) {
        console.error(`Failed to create JIRA ticket: ${error}`);
        throw error;
    }
}

/**
 * Main function
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
                // Check if global MCP function is available
                if (typeof global.mcp_mcp_atlassian_jira_create_issue !== 'function') {
                    console.error('MCP JIRA function not available. Please use the Claude tool directly.');
                    console.log(`
Use this command to create a ticket for issue "${issue.issue}":

mcp_mcp-atlassian_jira_create_issue({
  "project_key": "${JIRA_PROJECT_KEY}",
  "summary": "UI Issue: ${issue.issue}",
  "issue_type": "Bug",
  "description": "h3. UI Issue Details\\n\\n*Element:* ${issue.element}\\n*Severity:* ${issue.severity}\\n\\nh3. Issue Description\\n${issue.issue}\\n\\nh3. Steps to Reproduce\\n1. Navigate to the page containing the element\\n2. Observe the UI issue as described\\n3. See the attached screenshot (if available)\\n\\nh3. Additional Information\\nThis issue was automatically detected by the Playwright UI testing framework",
  "additional_fields": "{\\"labels\\": [\\"ui-issue\\", \\"automated-test\\", \\"${issue.severity.toLowerCase()}\\"]}"
})
                    `);
                    continue;
                }
                
                const ticketKey = await createJiraTicket(issue);
                
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
        
        if (ticketMapping.length > 0) {
            // Save the ticket mapping to a file
            fs.writeFileSync(TICKETS_OUTPUT_FILE, JSON.stringify(ticketMapping, null, 2));
            
            console.log('\nCreated the following JIRA tickets:');
            for (const mapping of ticketMapping) {
                console.log(`- ${mapping.ticket}: ${mapping.issue} (${mapping.severity})`);
            }
            
            console.log(`\nTicket mapping saved to ${TICKETS_OUTPUT_FILE}`);
        } else {
            console.log('No tickets were created.');
        }
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Execute the main function
main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
}); 