#!/bin/bash

echo "===================================================="
echo "   Bluegrass BSC Admin Portal UI Testing Framework"
echo "===================================================="
echo

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available."
    echo "Please ensure npm is installed with Node.js."
    exit 1
fi

show_menu() {
    echo
    echo "Please select an option:"
    echo "1. Install dependencies"
    echo "2. Run example tests (basic test on playwright.dev)"
    echo "3. Find UI issues in Bluegrass BSC Admin Portal"
    echo "4. Generate JIRA ticket commands for found issues"
    echo "5. Create JIRA tickets automatically for found issues"
    echo "6. View test report"
    echo "0. Exit"
    echo
}

while true; do
    show_menu
    read -p "Enter option number: " option
    
    case $option in
        1)
            echo
            echo "Installing dependencies..."
            npm install
            echo
            echo "Installing Playwright browsers..."
            npx playwright install
            echo
            echo "Dependency installation completed."
            ;;
        2)
            echo
            echo "Running example tests..."
            npx playwright test tests/example.spec.ts
            echo
            echo "Tests completed."
            ;;
        3)
            echo
            echo "Running UI tests to find issues in Bluegrass BSC Admin Portal..."
            npm run find-issues
            echo
            echo "UI testing completed. Check reports folder for results."
            ;;
        4)
            echo
            echo "Generating JIRA ticket commands for found issues..."
            npm run generate-jira-commands
            echo
            echo "JIRA commands generation completed."
            ;;
        5)
            echo
            echo "Creating JIRA tickets for found issues..."
            npm run create-jira-tickets
            echo
            echo "JIRA ticket creation completed."
            ;;
        6)
            echo
            echo "Opening test report..."
            npm run report
            ;;
        0)
            echo
            echo "Exiting Bluegrass BSC Admin Portal UI Testing Framework."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
done