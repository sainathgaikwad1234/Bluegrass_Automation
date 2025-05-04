import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
    readonly page: Page;
    readonly libraryMenu: Locator;
    readonly catalogSubMenu: Locator;
    readonly addLoincButton: Locator;
    readonly loincCodeInput: Locator;
    readonly descriptionInput: Locator;
    readonly submitButton: Locator;
    readonly successMessage: Locator;
    readonly userMenu: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.libraryMenu = page.locator('text=Library');
        this.catalogSubMenu = page.locator('text=Catalog');
        this.addLoincButton = page.locator('button:has-text("Add LOINC Code")');
        this.loincCodeInput = page.locator('input[name="loincCode"]');
        this.descriptionInput = page.locator('textarea[name="description"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.successMessage = page.locator('text=LOINC code added successfully');
        this.userMenu = page.locator('[aria-label="User menu"]');
        this.logoutButton = page.locator('text=Logout');
    }

    async navigateToCatalog() {
        await this.libraryMenu.click();
        await this.catalogSubMenu.click();
    }

    async addLoincCode(code: string, description: string) {
        await this.addLoincButton.click();
        await this.loincCodeInput.fill(code);
        await this.descriptionInput.fill(description);
        await this.submitButton.click();
        await expect(this.successMessage).toBeVisible();
    }

    async logout() {
        await this.userMenu.click();
        await this.logoutButton.click();
        // Wait for navigation back to login page
        await this.page.waitForURL('**/auth/login');
    }
}