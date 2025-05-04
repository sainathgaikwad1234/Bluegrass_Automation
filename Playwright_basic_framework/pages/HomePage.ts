import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly title: Locator;

    constructor(page: Page) {
        this.page = page;
        this.title = page.locator('h1');
    }

    async goto() {
        await this.page.goto('/');
    }

    async verifyTitle(expectedTitle: string) {
        await expect(this.title).toHaveText(expectedTitle);
    }
}