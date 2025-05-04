import { UIIssue } from './UIValidator';

export class JiraHelper {
    private projectKey: string;

    constructor(projectKey: string) {
        this.projectKey = projectKey;
    }

    generateJiraTicketBody(issue: UIIssue): any {
        return {
            fields: {
                project: {
                    key: this.projectKey
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
            }
        };
    }

    private mapSeverityToPriority(severity: string): { name: string } {
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

    // Note: In a real implementation, this would use Jira REST API
    // For this example, we're creating a method signature only
    async createJiraTicket(issue: UIIssue): Promise<string> {
        console.log(`Would create Jira ticket for issue: ${issue.issue}`);
        // In real implementation, this would use fetch or axios to call Jira API
        return `${this.projectKey}-123`; // Mock ticket number
    }

    // Format bulk issues for Jira
    generateBulkJiraTickets(issues: UIIssue[]): any[] {
        return issues.map(issue => ({
            createSubTask: false,
            fields: {
                project: {
                    key: this.projectKey
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
            }
        }));
    }
} 