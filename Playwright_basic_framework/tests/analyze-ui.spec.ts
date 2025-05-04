import { test, expect } from '@playwright/test';

test('analyze login and catalog flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://app.qa.admin.ecarehealth.com/auth/login');
    await page.screenshot({ path: './screenshots/1_login_page.png' });
    
    // Fill login form
    await page.fill('input[name="email"]', 'superadmin@ecarehealth.com');
    await page.fill('input[name="password"]', 'eCareHealth@2024');
    await page.screenshot({ path: './screenshots/2_filled_login.png' });
    
    // Click login
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './screenshots/3_after_login.png' });
    
    // Navigate to Library/Catalog
    await page.waitForTimeout(2000); // Wait for any animations
    await page.screenshot({ path: './screenshots/4_dashboard.png' });
    
    // Try to locate and click Library menu
    const libraryMenu = await page.getByRole('link', { name: /library/i });
    await libraryMenu.click();
    await page.screenshot({ path: './screenshots/5_library_menu.png' });
    
    // Try to locate and click Catalog submenu
    const catalogMenu = await page.getByRole('link', { name: /catalog/i });
    await catalogMenu.click();
    await page.screenshot({ path: './screenshots/6_catalog_page.png' });
    
    // Try to locate Add LOINC Code button
    await page.waitForTimeout(1000);
    await page.screenshot({ path: './screenshots/7_before_add_loinc.png' });
    
    // Log page content for analysis
    const content = await page.content();
    console.log('Page content:', content);
});