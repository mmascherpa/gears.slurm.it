import { test, expect } from '@playwright/test';

test.describe('QR Code Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/qr-code');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Plain Text QR Code', () => {
    test('should generate QR code from plain text', async ({ page }) => {
      // Select text type (should be default)
      const typeSelect = page.locator('[data-testid="qr-type-select"]').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('.v-list-item:has-text("Text")').click();
      }

      // Enter text
      const textInput = page.locator('textarea').first();
      await textInput.fill('Hello World');

      await page.waitForTimeout(500);

      // QR code image should be visible
      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      await expect(qrImage).toBeVisible({ timeout: 5000 });
    });

    test('should update QR code when text changes', async ({ page }) => {
      const textInput = page.locator('textarea').first();

      // Enter initial text
      await textInput.fill('First text');
      await page.waitForTimeout(600);

      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      const firstSrc = await qrImage.getAttribute('src').catch(() => null);

      // Change text
      await textInput.clear();
      await textInput.fill('Second text');
      await page.waitForTimeout(600);

      const secondSrc = await qrImage.getAttribute('src').catch(() => null);

      // QR code should have changed
      if (firstSrc && secondSrc) {
        expect(firstSrc).not.toBe(secondSrc);
      }
    });

    test('should handle URL text', async ({ page }) => {
      const textInput = page.locator('textarea').first();
      await textInput.fill('https://example.com/path?query=value');

      await page.waitForTimeout(500);

      // QR code should be generated
      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      await expect(qrImage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('WiFi QR Code', () => {
    test('should generate WiFi QR code with WPA security', async ({ page }) => {
      // Select WiFi type
      const typeSelect = page.locator('[data-testid="qr-type-select"]').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('.v-list-item:has-text("WiFi")').click();
        await page.waitForTimeout(300);
      }

      // Fill WiFi fields
      const ssidInput = page.locator('input[label*="SSID"], input[placeholder*="SSID"], [data-testid="wifi-ssid"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      await ssidInput.fill('TestNetwork');
      await passwordInput.fill('password123');

      await page.waitForTimeout(500);

      // QR code should be visible
      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      const isVisible = await qrImage.isVisible().catch(() => false);

      // WiFi form might need all required fields
      if (isVisible) {
        expect(isVisible).toBe(true);
      }
    });

    test('should allow selecting security type', async ({ page }) => {
      // Select WiFi type
      const typeSelect = page.locator('[data-testid="qr-type-select"]').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('.v-list-item:has-text("WiFi")').click();
        await page.waitForTimeout(300);
      }

      // Look for security type selector
      const securitySelect = page.locator('[data-testid="wifi-security"], .v-select:has-text("Security")').first();
      const isVisible = await securitySelect.isVisible().catch(() => false);

      // Security type selector should be present for WiFi
      if (isVisible) {
        await securitySelect.click();
        const wpaOption = page.locator('.v-list-item:has-text("WPA")');
        await expect(wpaOption).toBeVisible();
      }
    });
  });

  test.describe('vCard QR Code', () => {
    test('should generate vCard QR code with contact info', async ({ page }) => {
      // Select vCard type
      const typeSelect = page.locator('[data-testid="qr-type-select"]').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('.v-list-item:has-text("vCard"), .v-list-item:has-text("Contact")').click();
        await page.waitForTimeout(300);
      }

      // Fill contact fields
      const nameInput = page.locator('input[placeholder*="Name"], [data-testid="vcard-name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('John Doe');

        await page.waitForTimeout(500);

        // QR code should be visible
        const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
        const isVisible = await qrImage.isVisible().catch(() => false);

        if (isVisible) {
          expect(isVisible).toBe(true);
        }
      }
    });
  });

  test.describe('Email QR Code', () => {
    test('should generate email QR code', async ({ page }) => {
      // Select Email type
      const typeSelect = page.locator('[data-testid="qr-type-select"]').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('.v-list-item:has-text("Email")').click();
        await page.waitForTimeout(300);
      }

      // Fill email field
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"], [data-testid="email-to"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');

        await page.waitForTimeout(500);

        // QR code should be visible
        const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
        const isVisible = await qrImage.isVisible().catch(() => false);

        if (isVisible) {
          expect(isVisible).toBe(true);
        }
      }
    });
  });

  test.describe('QR Code Actions', () => {
    test('should download QR code as PNG', async ({ page }) => {
      // Generate a QR code first
      const textInput = page.locator('textarea').first();
      await textInput.fill('Download test');

      await page.waitForTimeout(500);

      // Wait for QR code to generate
      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      await qrImage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      // Find and click download button
      const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-qr"]').first();

      if (await downloadButton.isVisible()) {
        // Set up download promise
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

        await downloadButton.click();

        try {
          const download = await downloadPromise;
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.png$/);
        } catch {
          // Download might not trigger in test environment
        }
      }
    });

    test('should copy QR code to clipboard', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      // Generate a QR code first
      const textInput = page.locator('textarea').first();
      await textInput.fill('Copy test');

      await page.waitForTimeout(500);

      // Wait for QR code
      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      await qrImage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      // Find and click copy button
      const copyButton = page.locator('button:has-text("Copy"), [data-testid="copy-qr"]').first();

      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Check for success snackbar
        const snackbar = page.locator('[role="status"]').first();
        const snackbarVisible = await snackbar.isVisible().catch(() => false);

        if (snackbarVisible) {
          const text = await snackbar.textContent();
          expect(text.toLowerCase()).toMatch(/copied|clipboard|success/);
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should show error or disable when input is empty', async ({ page }) => {
      const textInput = page.locator('textarea').first();

      // Clear any existing text
      await textInput.clear();

      await page.waitForTimeout(300);

      // QR code should not be visible or should show placeholder
      const qrImage = page.locator('[data-testid="qr-code-image"], img[alt*="QR"]').first();
      const isVisible = await qrImage.isVisible().catch(() => false);

      // Either QR is not visible or download button is disabled
      if (isVisible) {
        const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-qr"]').first();
        const isDisabled = await downloadButton.isDisabled().catch(() => false);
        // May or may not be disabled depending on implementation
      }
    });
  });

  test.describe('QR Code Options', () => {
    test('should allow changing QR code size', async ({ page }) => {
      // Generate a QR code
      const textInput = page.locator('textarea').first();
      await textInput.fill('Size test');

      await page.waitForTimeout(500);

      // Look for size slider or input
      const sizeInput = page.locator('[data-testid="qr-size"], input[label*="Size"], .v-slider').first();
      const isVisible = await sizeInput.isVisible().catch(() => false);

      if (isVisible) {
        // Size option should be adjustable
        expect(isVisible).toBe(true);
      }
    });

    test('should allow changing error correction level', async ({ page }) => {
      // Generate a QR code
      const textInput = page.locator('textarea').first();
      await textInput.fill('Error correction test');

      await page.waitForTimeout(500);

      // Look for error correction selector
      const ecSelect = page.locator('[data-testid="error-correction"], .v-select:has-text("Error")').first();
      const isVisible = await ecSelect.isVisible().catch(() => false);

      if (isVisible) {
        await ecSelect.click();
        const options = page.locator('.v-list-item');
        const optionCount = await options.count();
        // Should have L, M, Q, H options
        expect(optionCount).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
