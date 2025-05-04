import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly dashboardTitle: Locator;
    readonly sidebarMenu: Locator;
    readonly userProfile: Locator;
    readonly notificationIcon: Locator;
    readonly searchInput: Locator;
    readonly mainContent: Locator;
    readonly headerBar: Locator;
    readonly cardElements: Locator;
    readonly tableElements: Locator;
    readonly userDropdown: Locator;
    readonly settingsLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dashboardTitle = page.locator('h1, h2, .page-title, .dashboard-title, .title');
        this.sidebarMenu = page.locator('.sidebar, .sidebar-menu, #sidebar, nav, .navigation, .side-nav');
        this.userProfile = page.locator('.user-profile, .profile-dropdown, .avatar, .profile, .user-avatar');
        this.notificationIcon = page.locator('.notification-icon, .notifications, .bell-icon, .alert-icon');
        this.searchInput = page.locator('input[type="search"], .search-input, input[placeholder*="search" i]');
        this.mainContent = page.locator('.main-content, .content-wrapper, main, .dashboard-content, .page-content, #content');
        this.headerBar = page.locator('header, .header, .navbar, .app-header, .top-bar');
        this.cardElements = page.locator('.card, .dashboard-card, .widget, .panel, .tile, .box');
        this.tableElements = page.locator('table, .data-table, .grid');
        this.userDropdown = page.locator('.user-dropdown, .profile-menu, .user-menu, .dropdown-menu');
        this.settingsLink = page.locator('a:has-text("Settings"), a:has-text("Preferences"), a[href*="settings"], a[href*="config"]');
    }

    async navigateTo(menuItem: string) {
        try {
            const menuLocator = this.sidebarMenu.locator(`text="${menuItem}"`);
            if (await menuLocator.count() > 0) {
                await menuLocator.first().click();
                return;
            }
            
            const containsLocator = this.sidebarMenu.locator(`text=${menuItem}`);
            if (await containsLocator.count() > 0) {
                await containsLocator.first().click();
                return;
            }
            
            const linkLocator = this.page.locator(`a:has-text("${menuItem}")`);
            if (await linkLocator.count() > 0) {
                await linkLocator.first().click();
                return;
            }
            
            throw new Error(`Could not find menu item: ${menuItem}`);
        } catch (error) {
            console.log(`Error navigating to ${menuItem}:`, error);
            throw error;
        }
    }

    async expectDashboardLoaded() {
        try {
            if (await this.mainContent.isVisible({ timeout: 5000 })) {
                return;
            }
            
            if (await this.headerBar.isVisible({ timeout: 2000 })) {
                return;
            }
            
            if (await this.sidebarMenu.isVisible({ timeout: 2000 })) {
                return;
            }
            
            throw new Error('Dashboard not loaded - no main UI elements detected');
        } catch (error) {
            console.log('Error checking dashboard loaded state:', error);
            throw error;
        }
    }

    async expectSidebarVisible() {
        await expect(this.sidebarMenu).toBeVisible();
    }

    async captureScreenshot(name: string) {
        await this.page.screenshot({ path: `./reports/screenshots/${name}.png` });
    }

    async openUserDropdown() {
        try {
            await this.userProfile.click();
            const isVisible = await this.userDropdown.isVisible({ timeout: 2000 });
            if (!isVisible) {
                throw new Error('User dropdown did not appear');
            }
        } catch (error) {
            console.log('Error opening user dropdown:', error);
            throw error;
        }
    }

    async search(keyword: string) {
        if (await this.searchInput.isVisible()) {
            await this.searchInput.fill(keyword);
            await this.page.keyboard.press('Enter');
        }
    }

    async validateCardLayout(): Promise<string[]> {
        const issues: string[] = [];
        
        try {
            const cardCount = await this.cardElements.count();
            if (cardCount === 0) {
                issues.push('No dashboard cards/widgets found');
                return issues;
            }
            
            for (let i = 0; i < cardCount; i++) {
                const card = this.cardElements.nth(i);
                const box = await card.boundingBox();
                
                if (!box) continue;
                
                if (box.x < 0 || box.y < 0) {
                    issues.push(`Card/widget ${i+1} is positioned off-screen`);
                }
                
                if (box.width < 100 || box.height < 80) {
                    issues.push(`Card/widget ${i+1} is too small for proper visibility`);
                }
            }
        } catch (error) {
            console.log('Error validating card layout:', error);
        }
        
        return issues;
    }

    async validateResponsiveness(width: number, height: number): Promise<string[]> {
        const issues: string[] = [];
        
        try {
            const originalViewport = this.page.viewportSize();
            
            await this.page.setViewportSize({ width, height });
            await this.page.waitForTimeout(500);
            
            const sidebarVisible = await this.sidebarMenu.isVisible();
            if (!sidebarVisible && width >= 768) {
                issues.push(`Sidebar not visible at ${width}x${height} when it should be`);
            }
            
            const contentVisible = await this.mainContent.isVisible();
            if (!contentVisible) {
                issues.push(`Main content not visible at ${width}x${height}`);
            }
            
            if (originalViewport) {
                await this.page.setViewportSize(originalViewport);
            }
        } catch (error) {
            console.log(`Error validating responsiveness at ${width}x${height}:`, error);
        }
        
        return issues;
    }
} 