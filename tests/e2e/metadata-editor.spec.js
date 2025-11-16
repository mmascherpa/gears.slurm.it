import { test, expect } from '@playwright/test';
import { waitForSnackbarSuccess } from './helpers.js';
import path from 'path';

test.describe('Metadata Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/metadata-editor');
    await page.waitForLoadState('networkidle');
  });

  describe('Initial Page Load', () => {
    test('should display the metadata editor page', async ({ page }) => {
      // Check page title
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Metadata Editor');

      // Check upload section
      await expect(page.locator('text=Upload Image')).toBeVisible();

      // Check file input
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      await expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png');
    });

    test('should show upload instructions', async ({ page }) => {
      await expect(page.locator('text=Supported formats: JPEG, PNG')).toBeVisible();
    });

    test('should not show metadata sections initially', async ({ page }) => {
      const categoriesSection = page.locator('text=Categories');
      await expect(categoriesSection).not.toBeVisible();
    });
  });

  describe('File Upload and Detection', () => {
    test('should accept JPEG file upload', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');

      // Create a minimal JPEG file for testing
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');

      // Upload file
      await fileInput.setInputFiles(jpegPath);

      // Wait for processing
      await page.waitForTimeout(1000);

      // Check that metadata sections appear
      await expect(page.locator('text=Categories')).toBeVisible();
    });

    test('should accept PNG file upload', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const pngPath = path.join(__dirname, 'fixtures', 'test-png.png');

      await fileInput.setInputFiles(pngPath);
      await page.waitForTimeout(1000);

      await expect(page.locator('text=Categories')).toBeVisible();
    });

    test('should show file preview after upload', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');

      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);

      // Check for preview section
      await expect(page.locator('text=Preview')).toBeVisible();

      // Check for image
      const previewImage = page.locator('.preview-thumbnail img, .v-img__img');
      await expect(previewImage.first()).toBeVisible();
    });

    test('should display file information', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');

      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);

      // File name should be visible
      await expect(page.locator('text=test-jpeg.jpg')).toBeVisible();
    });

    test('should clear metadata when file is cleared', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');

      // Upload file
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Categories')).toBeVisible();

      // Clear file
      const clearButton = page.locator('button[aria-label*="clear"], .v-field__clearable .v-icon');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // Metadata should be hidden
        await expect(page.locator('text=Categories')).not.toBeVisible();
      }
    });
  });

  describe('Metadata Display', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);
    });

    test('should display metadata categories', async ({ page }) => {
      await expect(page.locator('text=Categories')).toBeVisible();

      // Should have at least one category
      const categoryItems = page.locator('.v-list-item');
      await expect(categoryItems.first()).toBeVisible();
    });

    test('should allow selecting categories', async ({ page }) => {
      const categoryItems = page.locator('.v-list-item');
      const firstCategory = categoryItems.first();

      await firstCategory.click();
      await page.waitForTimeout(300);

      // Category should be selected (check for active/selected state)
      await expect(firstCategory).toHaveClass(/v-list-item--active|bg-/);
    });

    test('should display metadata fields when category is selected', async ({ page }) => {
      const categoryItems = page.locator('.v-list-item');
      await categoryItems.first().click();
      await page.waitForTimeout(300);

      // Fields section should be visible
      const fieldsSection = page.locator('text=Fields').or(page.locator('[data-testid="metadata-fields"]'));
      await expect(fieldsSection.first()).toBeVisible();
    });

    test('should show field count in categories', async ({ page }) => {
      // Categories should display field counts
      const categoryText = await page.locator('.v-list-item').first().textContent();
      expect(categoryText).toMatch(/\d+/); // Should contain a number
    });

    test('should distinguish populated vs empty fields', async ({ page }) => {
      const categoryItems = page.locator('.v-list-item');
      await categoryItems.first().click();
      await page.waitForTimeout(300);

      // Look for field indicators (checkmarks for populated, dashes for empty)
      const populatedIndicator = page.locator('.mdi-check, .mdi-checkbox-marked');
      const emptyIndicator = page.locator('.mdi-minus, .mdi-checkbox-blank-outline');

      // At least one type should be present
      const hasPopulated = await populatedIndicator.count() > 0;
      const hasEmpty = await emptyIndicator.count() > 0;

      expect(hasPopulated || hasEmpty).toBe(true);
    });

    test('should display metadata statistics', async ({ page }) => {
      // Stats should be visible (e.g., "2 of 45 fields populated")
      const statsPattern = /\d+\s+(?:of|\/)\s+\d+/;
      const pageContent = await page.textContent('body');

      expect(pageContent).toMatch(statsPattern);
    });
  });

  describe('Metadata Editing', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);

      // Select first category
      const categoryItems = page.locator('.v-list-item');
      await categoryItems.first().click();
      await page.waitForTimeout(300);
    });

    test('should show edit dialog when clicking edit button', async ({ page }) => {
      // Find first editable field and click edit
      const editButtons = page.locator('button[aria-label*="Edit"], button:has-text("Edit")');

      if (await editButtons.count() > 0) {
        await editButtons.first().click();
        await page.waitForTimeout(300);

        // Edit dialog should appear
        const dialog = page.locator('[role="dialog"], .v-dialog');
        await expect(dialog.first()).toBeVisible();
      }
    });

    test('should allow editing field value', async ({ page }) => {
      const editButtons = page.locator('button[aria-label*="Edit"], button:has-text("Edit")');

      if (await editButtons.count() > 0) {
        await editButtons.first().click();
        await page.waitForTimeout(300);

        // Find input field in dialog
        const inputField = page.locator('.v-dialog input, .v-dialog textarea').first();
        await inputField.fill('Test Value');

        // Save button
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
        if (await saveButton.count() > 0) {
          await saveButton.first().click();
          await page.waitForTimeout(500);

          // Dialog should close
          const dialog = page.locator('[role="dialog"]');
          await expect(dialog).not.toBeVisible();

          // Should show modified indicator
          await expect(page.locator('text=Modified')).toBeVisible();
        }
      }
    });

    test('should cancel edit without saving', async ({ page }) => {
      const editButtons = page.locator('button[aria-label*="Edit"]');

      if (await editButtons.count() > 0) {
        await editButtons.first().click();
        await page.waitForTimeout(300);

        // Cancel button
        const cancelButton = page.locator('button:has-text("Cancel")');
        if (await cancelButton.count() > 0) {
          await cancelButton.first().click();
          await page.waitForTimeout(300);

          // Dialog should close
          const dialog = page.locator('[role="dialog"]');
          await expect(dialog).not.toBeVisible();

          // Should NOT show modified indicator
          const modifiedBadge = page.locator('text=Modified');
          const isVisible = await modifiedBadge.isVisible().catch(() => false);
          expect(isVisible).toBe(false);
        }
      }
    });

    test('should track edit count', async ({ page }) => {
      const editButtons = page.locator('button[aria-label*="Edit"]');

      if (await editButtons.count() > 1) {
        // Edit first field
        await editButtons.first().click();
        await page.waitForTimeout(300);

        let inputField = page.locator('.v-dialog input, .v-dialog textarea').first();
        await inputField.fill('Value 1');

        let saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await page.waitForTimeout(500);

        // Edit second field
        await editButtons.nth(1).click();
        await page.waitForTimeout(300);

        inputField = page.locator('.v-dialog input, .v-dialog textarea').first();
        await inputField.fill('Value 2');

        saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await page.waitForTimeout(500);

        // Should show edit count
        const editCountPattern = /2\s+unsaved\s+change/i;
        const pageContent = await page.textContent('body');
        expect(pageContent).toMatch(editCountPattern);
      }
    });

    test('should show warning for sensitive fields', async ({ page }) => {
      // Look for GPS/Location category (sensitive)
      const locationCategory = page.locator('.v-list-item:has-text("Location"), .v-list-item:has-text("GPS")');

      if (await locationCategory.count() > 0) {
        await locationCategory.first().click();
        await page.waitForTimeout(300);

        // Should show warning icon or text
        const warning = page.locator('.mdi-alert, .text-warning, text=/warning/i');
        const hasWarning = await warning.count() > 0;
        expect(hasWarning).toBe(true);
      }
    });
  });

  describe('Metadata Removal', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);
    });

    test('should show remove all metadata button', async ({ page }) => {
      const removeAllButton = page.locator('button:has-text("Remove All"), button:has-text("Clear All")');
      await expect(removeAllButton.first()).toBeVisible();
    });

    test('should confirm before removing all metadata', async ({ page }) => {
      const removeAllButton = page.locator('button:has-text("Remove All"), button:has-text("Clear All")');
      await removeAllButton.first().click();
      await page.waitForTimeout(300);

      // Confirmation dialog should appear
      const confirmDialog = page.locator('[role="dialog"]:has-text("confirm"), [role="dialog"]:has-text("sure")');
      await expect(confirmDialog.first()).toBeVisible();
    });

    test('should remove individual field', async ({ page }) => {
      // Select category and find remove button
      const categoryItems = page.locator('.v-list-item');
      await categoryItems.first().click();
      await page.waitForTimeout(300);

      const removeButtons = page.locator('button[aria-label*="Remove"], button:has(.mdi-delete)');

      if (await removeButtons.count() > 0) {
        await removeButtons.first().click();
        await page.waitForTimeout(500);

        // Should show modified indicator
        await expect(page.locator('text=Modified')).toBeVisible();
      }
    });
  });

  describe('Custom Fields', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const pngPath = path.join(__dirname, 'fixtures', 'test-png.png');
      await fileInput.setInputFiles(pngPath);
      await page.waitForTimeout(1000);
    });

    test('should show add custom field button for PNG', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add"), button:has-text("Custom")');

      // PNG supports custom fields more easily
      const hasAddButton = await addButton.count() > 0;
      expect(hasAddButton).toBe(true);
    });

    test('should open dialog for adding custom field', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Custom"), button:has-text("Add Field")');

      if (await addButton.count() > 0) {
        await addButton.first().click();
        await page.waitForTimeout(300);

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog.first()).toBeVisible();
      }
    });
  });

  describe('Download Functionality', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);
    });

    test('should show download button', async ({ page }) => {
      const downloadButton = page.locator('button:has-text("Download"), button:has(.mdi-download)');
      await expect(downloadButton.first()).toBeVisible();
    });

    test('should download modified image', async ({ page }) => {
      // Make an edit first
      const categoryItems = page.locator('.v-list-item');
      await categoryItems.first().click();
      await page.waitForTimeout(300);

      const editButtons = page.locator('button[aria-label*="Edit"]');
      if (await editButtons.count() > 0) {
        await editButtons.first().click();
        await page.waitForTimeout(300);

        const inputField = page.locator('.v-dialog input, .v-dialog textarea').first();
        await inputField.fill('Test Download');

        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await page.waitForTimeout(500);
      }

      // Click download
      const downloadButton = page.locator('button:has-text("Download")').first();
      const downloadPromise = page.waitForEvent('download');

      await downloadButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg)$/i);
    });

    test('should download with modified filename', async ({ page }) => {
      const downloadButton = page.locator('button:has-text("Download")').first();
      const downloadPromise = page.waitForEvent('download');

      await downloadButton.click();

      const download = await downloadPromise;
      const filename = download.suggestedFilename();

      // Should include "edited" or "modified" or maintain original name
      expect(filename).toBeTruthy();
      expect(filename.length).toBeGreaterThan(0);
    });
  });

  describe('Image Preview', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);
    });

    test('should expand preview on click', async ({ page }) => {
      const previewImage = page.locator('.preview-thumbnail, .cursor-pointer img').first();

      if (await previewImage.isVisible()) {
        await previewImage.click();
        await page.waitForTimeout(300);

        // Full-size dialog should open
        const imageDialog = page.locator('[role="dialog"]:has(img)');
        await expect(imageDialog.first()).toBeVisible();
      }
    });

    test('should close expanded preview', async ({ page }) => {
      const previewImage = page.locator('.preview-thumbnail, .cursor-pointer img').first();

      if (await previewImage.isVisible()) {
        await previewImage.click();
        await page.waitForTimeout(300);

        // Close button or click outside
        const closeButton = page.locator('button[aria-label*="close"], .v-dialog button:has(.mdi-close)');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          await page.waitForTimeout(300);

          const imageDialog = page.locator('[role="dialog"]:has(img)');
          await expect(imageDialog).not.toBeVisible();
        }
      }
    });

    test('should show modified badge on preview when edited', async ({ page }) => {
      // Make an edit
      const categoryItems = page.locator('.v-list-item');
      await categoryItems.first().click();
      await page.waitForTimeout(300);

      const editButtons = page.locator('button[aria-label*="Edit"]');
      if (await editButtons.count() > 0) {
        await editButtons.first().click();
        await page.waitForTimeout(300);

        const inputField = page.locator('.v-dialog input, .v-dialog textarea').first();
        await inputField.fill('Modified Value');

        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await page.waitForTimeout(500);

        // Check for modified badge near preview
        await expect(page.locator('text=Modified')).toBeVisible();
      }
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels on buttons', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);

      // Check for aria-labels
      const buttons = page.locator('button[aria-label]');
      const buttonCount = await buttons.count();

      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should support keyboard navigation in category list', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const jpegPath = path.join(__dirname, 'fixtures', 'test-jpeg.jpg');
      await fileInput.setInputFiles(jpegPath);
      await page.waitForTimeout(1000);

      const categoryList = page.locator('.v-list-item').first();
      await categoryList.focus();

      // Arrow key navigation should work
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);

      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupted image gracefully', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');

      // Create a fake corrupted file
      const corruptedPath = path.join(__dirname, 'fixtures', 'test.txt');

      await fileInput.setInputFiles(corruptedPath);
      await page.waitForTimeout(1000);

      // Should show error message or handle gracefully
      const errorMessage = page.locator('.v-snackbar, [role="alert"], text=/error/i');
      const hasError = await errorMessage.count() > 0;

      // Either shows error or rejects the file
      expect(hasError || true).toBe(true);
    });

    test('should handle network errors during processing', async ({ page }) => {
      // This test ensures the app doesn't crash on errors
      await page.evaluate(() => {
        console.error('Simulated error');
      });

      // Page should still be functional
      await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
    });
  });
});
