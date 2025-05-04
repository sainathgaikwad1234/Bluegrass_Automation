import { UIIssue } from './UIValidator';
import { testConfig } from '../config/testConfig';

// Interface for Jira API response
interface JiraResponse {
    id: string;
    key: string;
    self: string;
}

export class JiraTicketCreator {
    // Method to create a Jira ticket for a UI issue using the MCP function
    static async createTicket(issue: UIIssue): Promise<string> {
        try {
            // Format issue description for Jira
            const description = `
*Element:* ${issue.element}
*Issue:* ${issue.issue}
*Severity:* ${issue.severity}
${issue.screenshot ? `\n!${issue.screenshot}|thumbnail!` : ''}

This issue was automatically reported by the UI testing framework.
            `;

            // In a real implementation, this would call the MCP Jira function
            // Currently, simulate the ticket creation
            console.log(`Creating Jira ticket for issue: ${issue.issue}`);
            
            // Simulate Jira API response
            const mockTicketNumber = Math.floor(Math.random() * 1000);
            const ticketKey = `${testConfig.jira.projectKey}-${mockTicketNumber}`;
            
            console.log(`Created ticket ${ticketKey}`);
            return ticketKey;
        } catch (error) {
            console.error(`Failed to create Jira ticket: ${error}`);
            throw error;
        }
    }
    
    // Method to create multiple Jira tickets
    static async createBulkTickets(issues: UIIssue[]): Promise<string[]> {
        const ticketKeys: string[] = [];
        
        for (const issue of issues) {
            try {
                const ticketKey = await this.createTicket(issue);
                ticketKeys.push(ticketKey);
            } catch (error) {
                console.error(`Failed to create ticket for issue: ${issue.issue}`);
            }
        }
        
        return ticketKeys;
    }
    
    // Implementation with MCP Jira Integration
    static async createTicketWithMCP(issue: UIIssue): Promise<string> {
        // This would be implemented with actual MCP Jira integration
        // For example:
        /*
        const response = await mcp_mcp-atlassian_jira_create_issue({
            project_key: testConfig.jira.projectKey,
            summary: `UI Issue: ${issue.issue}`,
            description: `
*Element:* ${issue.element}
*Issue:* ${issue.issue}
*Severity:* ${issue.severity}
${issue.screenshot ? `\n!${issue.screenshot}|thumbnail!` : ''}

This issue was automatically reported by the UI testing framework.
            `,
            issue_type: 'Bug',
            additional_fields: JSON.stringify({
                labels: ['ui-issue', 'automated-test'],
                priority: { name: this.mapSeverityToPriority(issue.severity) }
            })
        });
        
        return response.key;
        */
        
        // For now, just simulate
        return this.createTicket(issue);
    }
    
    // Maps severity to Jira priority name
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