@echo off
echo ====================================================
echo    Bluegrass BSC Admin Portal UI Testing Framework
echo ====================================================
echo.

REM Check if node is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not available.
    echo Please ensure npm is installed with Node.js.
    exit /b 1
)

:MENU
echo.
echo Please select an option:
echo 1. Install dependencies
echo 2. Run example tests (basic test on playwright.dev)
echo 3. Find UI issues in Bluegrass BSC Admin Portal
echo 4. Generate JIRA ticket commands for found issues
echo 5. Create JIRA tickets automatically for found issues
echo 6. View test report
echo 0. Exit
echo.

set /p OPTION="Enter option number: "

if "%OPTION%"=="1" goto INSTALL
if "%OPTION%"=="2" goto RUN_EXAMPLE
if "%OPTION%"=="3" goto FIND_ISSUES
if "%OPTION%"=="4" goto GENERATE_COMMANDS
if "%OPTION%"=="5" goto CREATE_TICKETS
if "%OPTION%"=="6" goto VIEW_REPORT
if "%OPTION%"=="0" goto EXIT

echo Invalid option. Please try again.
goto MENU

:INSTALL
echo.
echo Installing dependencies...
call npm install
echo.
echo Installing Playwright browsers...
call npx playwright install
echo.
echo Dependency installation completed.
goto MENU

:RUN_EXAMPLE
echo.
echo Running example tests...
call npx playwright test tests/example.spec.ts
echo.
echo Tests completed.
goto MENU

:FIND_ISSUES
echo.
echo Running UI tests to find issues in Bluegrass BSC Admin Portal...
call npm run find-issues
echo.
echo UI testing completed. Check reports folder for results.
goto MENU

:GENERATE_COMMANDS
echo.
echo Generating JIRA ticket commands for found issues...
call npm run generate-jira-commands
echo.
echo JIRA commands generation completed.
goto MENU

:CREATE_TICKETS
echo.
echo Creating JIRA tickets for found issues...
call npm run create-jira-tickets
echo.
echo JIRA ticket creation completed.
goto MENU

:VIEW_REPORT
echo.
echo Opening test report...
call npm run report
goto MENU

:EXIT
echo.
echo Exiting Bluegrass BSC Admin Portal UI Testing Framework.
exit /b 0