export const testConfig = {
    baseUrl: process.env.BASE_URL || 'https://dev.admin.bluegrassbsc.com/',
    credentials: {
        validUser: {
            email: process.env.VALID_USER_EMAIL || 'superadmin@mailinator.com',
            password: process.env.VALID_USER_PASSWORD || 'placeholder'
        },
        invalidUser: {
            email: process.env.INVALID_USER_EMAIL || 'invalid@example.com',
            password: process.env.INVALID_USER_PASSWORD || 'placeholder'
        }
    },
    timeouts: {
        globalTimeout: 30000,
        elementTimeout: 5000,
        navigationTimeout: 10000
    },
    jira: {
        url: process.env.JIRA_URL || 'https://thinkitive-team-cjy15ulp.atlassian.net',
        projectKey: process.env.JIRA_PROJECT_KEY || 'BA'
    },
    reportsDir: './reports',
    screenshotsDir: './reports/screenshots',
    videosDir: './reports/videos'
}; 