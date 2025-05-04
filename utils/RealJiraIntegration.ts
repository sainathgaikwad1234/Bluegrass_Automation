import { UIIssue } from './UIValidator';
import { testConfig } from '../config/testConfig';

export class RealJiraIntegration {
    /**
     * Creates a Jira ticket for a UI issue
     * This would use MCP's Jira integration in a real implementation
     */
    static async createJiraTicket(issue: UIIssue): Promise<string> {
        try {
            // Format the issue for Jira
            const fields = {
                project: {
                    key: testConfig.jira.projectKey
                },
                summary: `UI Issue: ${issue.issue}`,
                description: `
*Element:* ${issue.element}
*Issue:* ${issue.issue}
*Severity:* ${issue.severity}
${issue.screenshot ? `\n!Screenshot|thumbnail!` : ''}

This issue was automatically reported by the UI testing framework.
                `,
                issuetype: {
                    name: 'Bug'
                },
                priority: this.mapSeverityToPriority(issue.severity),
                labels: ['ui-issue', 'automated-test']
            };

            // This is where you'd call the Jira MCP function in the real implementation
            // For example:
            // const response = await mcp_mcp-atlassian_jira_create_issue({
            //     project_key: testConfig.jira.projectKey,
            //     summary: `UI Issue: ${issue.issue}`,
            //     description: fields.description,
            //     issue_type: 'Bug',
            //     additional_fields: JSON.stringify({
            //         labels: fields.labels,
            //         priority: fields.priority
            //     })
            // });
            
            // Mock the response for now
            console.log(`Would create Jira ticket for: ${issue.issue}`);
            return `${testConfig.jira.projectKey}-${Math.floor(Math.random() * 1000)}`;
        } catch (error) {
            console.error(`Failed to create Jira ticket: ${error}`);
            throw error;
        }
    }

    /**
     * Maps the severity of a UI issue to a Jira priority
     */
    private static mapSeverityToPriority(severity: string): { name: string } {
        switch (severity) {
            case 'Critical':
                return { name: 'Highest' };
            case 'High':
                return { name: 'High' };
            case 'Medium':
                return { name: 'Medium' };
            case 'Low':
                return { name: 'Low' };
            default:
                return { name: 'Medium' };
        }
    }

    /**
     * Create multiple Jira tickets for UI issues
     */
    static async createJiraTickets(issues: UIIssue[]): Promise<string[]> {
        const ticketIds: string[] = [];
        
        for (const issue of issues) {
            try {
                const ticketId = await this.createJiraTicket(issue);
                ticketIds.push(ticketId);
            } catch (error) {
                console.error(`Failed to create ticket for issue: ${issue.issue}`);
            }
        }
        
        return ticketIds;
    }
} 