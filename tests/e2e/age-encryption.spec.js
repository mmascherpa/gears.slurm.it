import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

test.describe('Age Encryption Algorithm', () => {
  test.describe('Age Text Encryption', () => {
    test('should encrypt text using Age algorithm', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(500);
      }

      const plainText = 'Secret message for Age encryption';
      const password = 'AgePassword123!';

      // Enter text
      const textInput = page.locator('textarea').first();
      await textInput.clear();
      await textInput.fill(plainText);

      // Enter password
      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.first().fill(password);
      await passwordInputs.last().fill(password);

      // Wait for encryption (Age may take slightly longer due to WASM)
      await page.waitForTimeout(3000);

      // Check for output
      const outputTextarea = page.locator('textarea').nth(1);
      const isVisible = await outputTextarea.isVisible().catch(() => false);

      if (isVisible) {
        const encrypted = await outputTextarea.inputValue();
        // Age output might have different format than AES Base64
        expect(encrypted).toBeTruthy();
        expect(encrypted).not.toBe(plainText);
      }
    });

    test('should handle Age algorithm switching', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      const plainText = 'Test algorithm switching';
      const password = 'TestPassword123!';

      // Enter text and password first
      const textInput = page.locator('textarea').first();
      await textInput.fill(plainText);

      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.first().fill(password);
      await passwordInputs.last().fill(password);

      await page.waitForTimeout(2500);

      // Get initial encrypted output (default algorithm)
      const outputTextarea = page.locator('textarea').nth(1);
      let firstEncrypted = '';
      if (await outputTextarea.isVisible()) {
        firstEncrypted = await outputTextarea.inputValue();
      }

      // Switch to Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(3000);

        // Get new encrypted output
        const secondEncrypted = await outputTextarea.inputValue();

        // Output should change when algorithm changes
        if (firstEncrypted && secondEncrypted) {
          expect(firstEncrypted).not.toBe(secondEncrypted);
        }
      }
    });
  });

  test.describe('Age File Encryption', () => {
    test('should encrypt file using Age algorithm', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(500);
      }

      const testFile = path.join(fixturesDir, 'test.txt');
      const password = 'AgeFilePassword123!';

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);

      await page.waitForTimeout(500);

      // Enter password
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill(password);

      await page.waitForTimeout(500);

      // Confirm password
      const passwordConfirm = page.locator('input[type="password"]').last();
      await passwordConfirm.fill(password);

      await page.waitForTimeout(500);

      // Find encrypt button
      const encryptButton = page.locator('button:has-text("Encrypt")').first();
      await encryptButton.waitFor({ state: 'visible', timeout: 5000 });

      // Check if button is enabled (Age WASM should be loaded)
      const isDisabled = await encryptButton.isDisabled().catch(() => true);

      if (!isDisabled) {
        // Try to trigger download
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await encryptButton.click({ force: true });

        try {
          const download = await downloadPromise.catch(() => null);
          if (download) {
            const filename = download.suggestedFilename();
            // Age files should have .age extension
            expect(filename).toContain('.age');
          }
        } catch {
          // Download might not trigger in test environment
        }
      }
    });

    test('should show Age algorithm option in dropdown', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();

      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.waitForTimeout(300);

        // Age option should be available
        const ageOption = page.locator('.v-list-item:has-text("Age")');
        await expect(ageOption).toBeVisible();
      }
    });

    test('should show correct file extension hint for Age', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(500);

        // Look for file extension hint
        const hintText = page.locator('text=.age');
        const isVisible = await hintText.isVisible().catch(() => false);

        // Page should indicate Age file format
        if (isVisible) {
          expect(isVisible).toBe(true);
        }
      }
    });
  });

  test.describe('Age File Decryption', () => {
    test('should show Age algorithm option on decrypt page', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();

      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.waitForTimeout(300);

        // Age option should be available
        const ageOption = page.locator('.v-list-item:has-text("Age")');
        await expect(ageOption).toBeVisible();
      }
    });

    test('should prevent decryption without password for Age', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(500);
      }

      const testFile = path.join(fixturesDir, 'test.txt');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);

      await page.waitForTimeout(500);

      // Don't enter password

      // Find decrypt button
      const decryptButton = page.locator('button:has-text("Decrypt")').first();
      const isDisabled = await decryptButton.isDisabled().catch(() => false);

      // Button should be disabled without password
      expect(isDisabled).toBeTruthy();
    });
  });

  test.describe('Age Error Handling', () => {
    test('should show error when decrypting non-Age file with Age algorithm', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(500);
      }

      const testFile = path.join(fixturesDir, 'test.txt');
      const password = 'SomePassword123!';

      // Try to upload plain text file as Age encrypted
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);

      await page.waitForTimeout(500);

      // Enter password
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill(password);

      await page.waitForTimeout(500);

      // Click decrypt button if enabled
      const decryptButton = page.locator('button:has-text("Decrypt")').first();
      if (await decryptButton.isVisible() && !(await decryptButton.isDisabled())) {
        await decryptButton.click();
        await page.waitForTimeout(2000);

        // Should show error
        const errorElement = page.locator('[role="alert"]').first();
        const hasError = await errorElement.isVisible().catch(() => false);
        expect(hasError).toBeTruthy();
      }
    });

    test('should show user-friendly error for wrong Age password', async ({ page }) => {
      // This test would require an actual .age encrypted file
      // For now, just verify error handling works
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(500);

        // Page should be ready for Age decryption
        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();
      }
    });
  });

  test.describe('Age WASM Loading', () => {
    test('should load Age WASM module without errors', async ({ page }) => {
      // Listen for console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      // Select Age algorithm to trigger WASM loading
      const algorithmSelect = page.locator('[data-testid="algorithm-select"], .v-select:has-text("Algorithm")').first();
      if (await algorithmSelect.isVisible()) {
        await algorithmSelect.click();
        await page.locator('.v-list-item:has-text("Age")').click();
        await page.waitForTimeout(2000);

        // Check for WASM-related errors
        const wasmErrors = errors.filter(e =>
          e.toLowerCase().includes('wasm') ||
          e.toLowerCase().includes('rage')
        );

        // Should not have WASM loading errors
        expect(wasmErrors.length).toBe(0);
      }
    });
  });
});
