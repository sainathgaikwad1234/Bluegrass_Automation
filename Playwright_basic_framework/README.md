# Playwright Basic Framework

This is a basic test automation framework using Playwright with TypeScript.

## Directory Structure

```
├── config/             # Configuration files
├── pages/             # Page Object Models
├── tests/             # Test files
├── playwright.config.ts   # Playwright configuration
└── package.json       # Project dependencies
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

- Run all tests:
```bash
npm test
```

- Run tests in headed mode:
```bash
npm run test:headed
```

- Open Playwright UI mode:
```bash
npm run test:ui
```

- View HTML report:
```bash
npm run report
```

## Writing Tests

1. Create page objects in the `pages` directory
2. Write test files in the `tests` directory
3. Use the page object model pattern for better maintainability

## Framework Features

- TypeScript support
- Page Object Model pattern
- HTML reporting
- Cross-browser testing
- Parallel execution
- Screenshot on failure
- Trace on retry