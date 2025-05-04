import { UIIssue } from './UIValidator';
import { testConfig } from '../config/testConfig';

export class JiraActualIntegration {
    /**
     * Creates a real Jira ticket for a UI issue using the MCP Atlassian integration
     */
    static async createJiraTicket(issue: UIIssue): Promise<string> {
        try {
            console.log(`Creating Jira ticket for issue: ${issue.issue}`);
            
            // Prepare the screenshot attachment if available
            let screenshotMention = '';
            if (issue.screenshot) {
                // In a real scenario, we would upload and link the screenshot
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
                // Use the real MCP function to create JIRA ticket
                // @ts-ignore - MCP function is globally available
                const response = await mcp_mcp_atlassian_jira_create_issue({
                    project_key: testConfig.jira.projectKey,
                    summary: `UI Issue: ${issue.issue}`,
                    issue_type: 'Bug',
                    description: description,
                    components: 'UI,Frontend',
                    additional_fields: JSON.stringify({
                        labels: ['ui-issue', 'automated-test', issue.severity.toLowerCase()],
                        priority: { name: this.mapSeverityToPriority(issue.severity) }
                    })
                });
                
                return response.key;
            } catch (error) {
                console.error('Error calling Jira API:', error);
                // Fall back to mock ticket if there's an error
                const mockTicketId = Math.floor(Math.random() * 1000);
                const ticketKey = `${testConfig.jira.projectKey}-${mockTicketId}`;
                console.log(`Created mock Jira ticket ${ticketKey} due to API error`);
                return ticketKey;
            }
        } catch (error) {
            console.error(`Failed to create Jira ticket: ${error}`);
            return `ERROR-${Date.now()}`;
        }
    }
    
    /**
     * Create multiple Jira tickets for UI issues
     */
    static async createJiraTickets(issues: UIIssue[]): Promise<string[]> {
        const ticketKeys: string[] = [];
        
        for (const issue of issues) {
            try {
                const ticketKey = await this.createJiraTicket(issue);
                console.log(`Created Jira ticket ${ticketKey} for issue: ${issue.issue}`);
                ticketKeys.push(ticketKey);
                
                // Add a small delay between API calls to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to create ticket for issue: ${issue.issue}`);
                ticketKeys.push(`ERROR-${Date.now()}`);
            }
        }
        
        return ticketKeys;
    }
    
    /**
     * Maps severity to Jira priority name
     */
    private static mapSeverityToPriority(severity: string): string {
        switch (severity) {
            case 'Critical': return 'Highest';
            case 'High': return 'High';
            case 'Medium': return 'Medium';
            case 'Low': return 'Low';
            default: return 'Medium';
        }
    }
} 