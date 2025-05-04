// Script to directly create a JIRA ticket for the UI issue using Claude tool
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the reports directory
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const UI_ISSUES_FILE = path.join(REPORTS_DIR, 'real-ui-issues.json');

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

// Main function
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
        
        console.log(`Found ${issues.length} UI issues. Use the following command to create each ticket:`);
        console.log('-------------------------------------------------------------');
        
        // For each issue, print the command to create a JIRA ticket
        for (const issue of issues) {
            const priority = mapSeverityToPriority(issue.severity);
            
            console.log(`
To create a JIRA ticket for the following issue:
- Issue: ${issue.issue}
- Element: ${issue.element}
- Severity: ${issue.severity}
- Screenshot: ${issue.screenshot || 'N/A'}

Use this Claude command:

mcp_mcp-atlassian_jira_create_issue({
  "project_key": "BA",
  "summary": "UI Issue: ${issue.issue}",
  "issue_type": "Bug",
  "description": "h3. UI Issue Details\\n\\n*Element:* ${issue.element}\\n*Severity:* ${issue.severity}\\n\\nh3. Issue Description\\n${issue.issue}\\n\\nh3. Steps to Reproduce\\n1. Navigate to the page containing the element\\n2. Observe the UI issue as described\\n3. See the attached screenshot (if available)\\n\\nh3. Additional Information\\nThis issue was automatically detected by the Playwright UI testing framework",
  "additional_fields": "{\\"labels\\": [\\"ui-issue\\", \\"automated-test\\", \\"${issue.severity.toLowerCase()}\\"], \\"priority\\": {\\"name\\": \\"${priority}\\"}}"
})
            `);
            
            console.log('-------------------------------------------------------------');
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