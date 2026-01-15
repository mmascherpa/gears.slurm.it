import { test, expect } from '@playwright/test';

test.describe('Metadata Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/metadata-editor');
    await page.waitForLoadState('networkidle');
  });

  test('displays page header and upload section', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Metadata Editor' })).toBeVisible();
    await expect(page.getByText('View, edit, and remove metadata from JPEG and PNG images')).toBeVisible();

    // Check upload section
    await expect(page.getByText('Edit image metadata')).toBeVisible();

    // Check file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png');
  });

  test('shows upload instructions', async ({ page }) => {
    await expect(page.getByText('Supported formats: JPEG, PNG')).toBeVisible();
  });

  test('does not show metadata sections initially', async ({ page }) => {
    const categoriesSection = page.getByText('Categories');
    const isVisible = await categoriesSection.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  // Future tests for metadata editing workflow:
  // - File upload and metadata extraction (JPEG/PNG)
  // - Metadata category display
  // - Field editing dialog
  // - Field removal
  // - Bulk metadata removal with confirmation
  // - Modified image download
  // These require full metadata library integration to test properly
});
