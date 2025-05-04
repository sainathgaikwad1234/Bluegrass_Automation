# Example JIRA Tickets for BlueGrass BSC Admin UI Issues

## Dashboard Issues

### [BA-001] Dashboard statistics cards not responsive on smaller screens

**Summary**: Dashboard statistics cards not responsive on smaller screens

**Description**:
- **Issue**: The statistics cards on the dashboard don't resize properly on screens smaller than 768px wide. Content overflows and becomes unreadable.
- **Location**: Main dashboard page, top statistics section
- **Steps to Reproduce**:
  1. Log in to https://dev.admin.bluegrassbsc.com/ as admin
  2. Navigate to the dashboard
  3. Resize browser window to less than 768px width
  4. Observe the statistics cards behavior
- **Expected Behavior**: Cards should resize and reflow to fit the screen size
- **Actual Behavior**: Cards maintain fixed width, causing overflow and horizontal scrolling
- **Severity**: Medium
- **Browser/OS**: Chrome 118 on Windows 10
- **Screenshots**: [Dashboard_responsive_issue.png]

**Component**: UI
**Labels**: ui-bug, dashboard, responsive-design

---

### [BA-002] Session timeout occurs without warning notification

**Summary**: Users are logged out due to session timeout without any prior warning

**Description**:
- **Issue**: When a session is about to expire, users are logged out automatically without receiving any warning to extend their session.
- **Location**: Occurs across the entire admin portal
- **Steps to Reproduce**:
  1. Log in to https://dev.admin.bluegrassbsc.com/ as admin
  2. Remain inactive for approximately 15-20 minutes
  3. Attempt to perform an action after this period
- **Expected Behavior**: A warning notification should appear a few minutes before session expiry, allowing users to extend their session
- **Actual Behavior**: User is logged out without warning, potentially losing unsaved work
- **Severity**: High
- **Browser/OS**: Chrome 118 on Windows 10
- **Screenshots**: N/A

**Component**: UI
**Labels**: ui-bug, dashboard, user-experience, session-management

## Settings Issues

### [BA-003] Form validation error messages disappear too quickly

**Summary**: Validation error messages in settings forms disappear too quickly for users to read

**Description**:
- **Issue**: When form validation errors occur in settings forms, the error messages only display for 2-3 seconds before disappearing, which is not enough time for users to read and understand the errors.
- **Location**: User settings forms, particularly in profile and password change sections
- **Steps to Reproduce**:
  1. Log in to https://dev.admin.bluegrassbsc.com/ as admin
  2. Navigate to Settings > User Profile
  3. Enter invalid data in a field (e.g., invalid email format)
  4. Submit the form
- **Expected Behavior**: Error messages should remain visible until the user addresses the issues or dismisses them manually
- **Actual Behavior**: Error messages appear briefly and then disappear automatically after 2-3 seconds
- **Severity**: High
- **Browser/OS**: Chrome 118 on Windows 10
- **Screenshots**: [Settings_validation_error.png]

**Component**: UI
**Labels**: ui-bug, settings, form-validation, user-experience

---

### [BA-004] User role permissions table overflows on mobile devices

**Summary**: Role permissions table in settings page overflows on mobile view

**Description**:
- **Issue**: The user role permissions table in the settings area extends beyond the viewable area on mobile devices without proper horizontal scrolling indicators.
- **Location**: Settings > User Roles and Permissions
- **Steps to Reproduce**:
  1. Log in to https://dev.admin.bluegrassbsc.com/ as admin
  2. Navigate to Settings > User Roles and Permissions
  3. View the page on a mobile device or resize browser to mobile width (less than 480px)
- **Expected Behavior**: Table should either reflow for mobile or provide clear horizontal scrolling controls
- **Actual Behavior**: Table extends beyond screen with no clear indication that horizontal scrolling is available
- **Severity**: Medium
- **Browser/OS**: Chrome 118 on Windows 10, Chrome on Android
- **Screenshots**: [Permissions_table_mobile.png]

**Component**: UI
**Labels**: ui-bug, settings, responsive-design, mobile-view 