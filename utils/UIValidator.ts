import { Page, Locator, expect } from '@playwright/test';

export interface UIIssue {
    element: string;
    issue: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    screenshot?: string;
}

export class UIValidator {
    readonly page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }

    async validateResponsiveness(selector: string): Promise<UIIssue[]> {
        const issues: UIIssue[] = [];
        const element = this.page.locator(selector);
        
        // Check if element is visible at different viewport sizes
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 768, height: 1024 },
            { width: 375, height: 667 }
        ];
        
        for (const viewport of viewports) {
            await this.page.setViewportSize(viewport);
            
            if (!await element.isVisible()) {
                issues.push({
                    element: selector,
                    issue: `Element not visible at viewport size ${viewport.width}x${viewport.height}`,
                    severity: 'Medium'
                });
            }
        }
        
        return issues;
    }
    
    async validateAlignment(selector: string): Promise<UIIssue[]> {
        const issues: UIIssue[] = [];
        const element = this.page.locator(selector);
        
        // Get element bounding box
        const boundingBox = await element.boundingBox();
        
        if (!boundingBox) {
            issues.push({
                element: selector,
                issue: 'Element not found or not visible',
                severity: 'Medium'
            });
            return issues;
        }
        
        // Check if element is properly aligned
        if (boundingBox.x < 0) {
            issues.push({
                element: selector,
                issue: 'Element is positioned off-screen horizontally',
                severity: 'Medium'
            });
        }
        
        if (boundingBox.y < 0) {
            issues.push({
                element: selector,
                issue: 'Element is positioned off-screen vertically',
                severity: 'Medium'
            });
        }
        
        return issues;
    }
    
    async validateInteractivity(selector: string): Promise<UIIssue[]> {
        const issues: UIIssue[] = [];
        const element = this.page.locator(selector);
        
        // Check if element is enabled
        if (!await element.isEnabled()) {
            issues.push({
                element: selector,
                issue: 'Element is disabled when it should be interactive',
                severity: 'High'
            });
        }
        
        return issues;
    }
    
    async captureIssue(issue: UIIssue, screenshotPath: string): Promise<UIIssue> {
        await this.page.screenshot({ path: screenshotPath });
        return {
            ...issue,
            screenshot: screenshotPath
        };
    }
} 