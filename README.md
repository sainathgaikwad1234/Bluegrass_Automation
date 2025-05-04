# Bluegrass BSC Admin Portal UI Testing

This repository contains automated tests using Playwright to identify UI issues in the Bluegrass BSC Admin Portal, specifically focusing on the Dashboard and Settings modules.

## Features

- Automated UI testing for the Bluegrass BSC Admin Portal
- Detection of UI issues in dashboard and settings pages
- Automatic JIRA ticket creation for identified issues
- Comprehensive reporting with screenshots

## Test Approach

1. **Automated UI Testing**
   - Detect layout issues, unresponsive elements, and visual inconsistencies
   - Test across multiple viewport sizes (desktop, tablet, mobile)
   - Generate screenshots for visual evidence

2. **Issue Reporting**
   - Categorize issues by severity (Low, Medium, High, Critical)
   - Create JIRA tickets with detailed descriptions
   - Link screenshots to JIRA tickets for visual reference

3. **CI/CD Integration**
   - Run tests as part of continuous integration pipelines
   - Generate reports for each test run

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/sainathgaikwad1234/Bluegrass_Automation.git
   cd Bluegrass_Automation
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Playwright browsers:
   ```
   npx playwright install
   ```

## Usage

### Find UI Issues

To run tests and find UI issues:

```
npm run find-issues
```

This will:
1. Run the UI tests for both dashboard and settings pages
2. Save any identified issues to JSON files in the `reports` directory
3. Capture screenshots of the issues

### Create JIRA Tickets

To create JIRA tickets for the identified issues:

```
npm run create-jira-tickets
```

### Generate JIRA Commands

If you prefer to create JIRA tickets manually:

```
npm run generate-jira-commands
```

## Project Structure

```
├── config/                  # Configuration files
│   └── testConfig.ts        # Test configuration including credentials
├── pages/                   # Page Object Models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── SettingsPage.ts 
├── utils/                   # Utility classes
│   ├── UIValidator.ts       # UI validation utilities
│   └── JiraActualIntegration.ts # JIRA integration
├── tests/                   # Test specifications
│   ├── bluegrass-ui-issues.spec.ts  # Tests for dashboard UI issues
│   └── settings-ui-issues.spec.ts   # Tests for settings UI issues
├── scripts/                 # Helper scripts
│   └── create-jira-tickets.js  # Script to create JIRA tickets
├── reports/                 # Test reports and screenshots
│   └── screenshots/         # Screenshots of UI issues
└── playwright.config.ts     # Playwright configuration
```

## License

This project is proprietary and confidential to Bluegrass BSC. 