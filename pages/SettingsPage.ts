import { Page, Locator, expect } from '@playwright/test';

export class SettingsPage {
    readonly page: Page;
    readonly settingsTitle: Locator;
    readonly settingsContainer: Locator;
    readonly formElements: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;
    readonly inputFields: Locator;
    readonly toggleSwitches: Locator;
    readonly tabLinks: Locator;

    constructor(page: Page) {
        this.page = page;
        this.settingsTitle = page.locator('h1:has-text("Settings"), h2:has-text("Settings"), .page-title:has-text("Settings")');
        this.settingsContainer = page.locator('.settings-container, .settings-wrapper, .settings-content, #settings');
        this.formElements = page.locator('form, .form, .settings-form');
        this.saveButton = page.locator('button:has-text("Save"), button:has-text("Apply"), button[type="submit"]');
        this.cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Reset")');
        this.inputFields = page.locator('input[type="text"], input[type="email"], input[type="number"], textarea');
        this.toggleSwitches = page.locator('.switch, .toggle, input[type="checkbox"]');
        this.tabLinks = page.locator('.tab, .nav-link, .settings-tab');
    }

    async navigateToTab(tabName: string) {
        try {
            const tabLocator = this.page.locator(`a:has-text("${tabName}"), button:has-text("${tabName}"), .tab:has-text("${tabName}")`);
            if (await tabLocator.count() > 0) {
                await tabLocator.first().click();
                await this.page.waitForTimeout(500); // Wait for tab content to load
            } else {
                console.log(`Tab "${tabName}" not found`);
            }
        } catch (error) {
            console.log(`Error navigating to tab ${tabName}:`, error);
        }
    }

    async expectSettingsLoaded() {
        await expect(this.settingsContainer).toBeVisible({ timeout: 5000 });
    }

    async captureScreenshot(name: string) {
        await this.page.screenshot({ path: `./reports/screenshots/${name}.png` });
    }

    // UI validation methods
    async validateFormAlignment(): Promise<string[]> {
        const issues: string[] = [];
        
        try {
            const formBox = await this.formElements.first().boundingBox();
            if (!formBox) {
                issues.push('Settings form not found or not visible');
                return issues;
            }
            
            // Check if form is properly aligned
            const viewportWidth = this.page.viewportSize()?.width || 0;
            if (formBox.x < 0 || formBox.x + formBox.width > viewportWidth) {
                issues.push('Settings form extends beyond viewport width');
            }
        } catch (error) {
            console.log('Error validating form alignment:', error);
        }
        
        return issues;
    }

    async validateInputFields(): Promise<string[]> {
        const issues: string[] = [];
        
        try {
            const fieldCount = await this.inputFields.count();
            
            for (let i = 0; i < fieldCount; i++) {
                const field = this.inputFields.nth(i);
                
                // Check if field has a label or placeholder
                const hasLabel = await this.hasAssociatedLabel(field);
                const hasPlaceholder = await field.evaluate(el => {
                    return el.hasAttribute('placeholder') && el.getAttribute('placeholder') !== '';
                });
                
                if (!hasLabel && !hasPlaceholder) {
                    issues.push(`Input field ${i+1} has no visible label or placeholder`);
                }
                
                // Check field visibility
                const isVisible = await field.isVisible();
                if (!isVisible) {
                    issues.push(`Input field ${i+1} is not visible`);
                }
            }
        } catch (error) {
            console.log('Error validating input fields:', error);
        }
        
        return issues;
    }
    
    async validateResponsiveness(width: number, height: number): Promise<string[]> {
        const issues: string[] = [];
        
        try {
            const originalViewport = this.page.viewportSize();
            
            // Set viewport to the specified size
            await this.page.setViewportSize({ width, height });
            await this.page.waitForTimeout(500); // Allow time for responsive layout to adjust
            
            // Check if important elements are still visible
            const formVisible = await this.formElements.isVisible();
            const saveButtonVisible = await this.saveButton.isVisible();
            
            if (!formVisible) {
                issues.push(`Settings form not visible at ${width}x${height} viewport`);
            }
            
            if (!saveButtonVisible && width >= 768) {
                issues.push(`Save button not visible at ${width}x${height} viewport`);
            }
            
            // Restore original viewport
            if (originalViewport) {
                await this.page.setViewportSize(originalViewport);
            }
        } catch (error) {
            console.log(`Error validating responsiveness at ${width}x${height}:`, error);
        }
        
        return issues;
    }
    
    private async hasAssociatedLabel(field: Locator): Promise<boolean> {
        try {
            // Get the field's ID
            const id = await field.evaluate(el => el.id);
            
            if (id) {
                // Check if there's a label with the 'for' attribute matching this ID
                const labelCount = await this.page.locator(`label[for="${id}"]`).count();
                return labelCount > 0;
            }
            
            // Check if the field is wrapped in a label
            const isWrapped = await field.evaluate(el => {
                return el.closest('label') !== null;
            });
            
            return isWrapped;
        } catch (error) {
            console.log('Error checking for associated label:', error);
            return false;
        }
    }
} 