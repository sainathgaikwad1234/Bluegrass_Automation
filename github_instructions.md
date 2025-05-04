# Pushing UI Testing Results to GitHub

After completing the manual UI testing and creating JIRA tickets, follow these steps to push your findings to the GitHub repository.

## Prerequisites

- Git installed on your machine
- GitHub access to the repository: https://github.com/sainathgaikwad1234/Bluegrass_Automation

## Steps

1. **Initialize Git Repository** (if not already done)
   ```bash
   git init
   ```

2. **Add Remote Repository**
   ```bash
   git remote add origin https://github.com/sainathgaikwad1234/Bluegrass_Automation.git
   ```

3. **Create a New Branch**
   ```bash
   git checkout -b ui-testing-findings
   ```

4. **Add Files to Staging**
   ```bash
   git add .
   ```

5. **Commit Changes**
   ```bash
   git commit -m "Add UI testing findings for dashboard and settings"
   ```

6. **Push to GitHub**
   ```bash
   git push -u origin ui-testing-findings
   ```

7. **Create Pull Request**
   - Go to https://github.com/sainathgaikwad1234/Bluegrass_Automation
   - Click on "Pull requests" tab
   - Click "New pull request"
   - Select your branch "ui-testing-findings"
   - Add a title and description detailing your findings
   - Submit the pull request

## Folder Structure to Push

Make sure your repository includes:

- `README.md` - Instructions for testing
- `reports/ui_issues/` - All UI issue documentation
  - `dashboard_issues.md` - Dashboard issues
  - `settings_issues.md` - Settings issues
  - `screenshots/` - Screenshots of issues
  - `jira_ticket_template.md` - Template for JIRA tickets
  - `example_jira_tickets.md` - Example JIRA tickets 