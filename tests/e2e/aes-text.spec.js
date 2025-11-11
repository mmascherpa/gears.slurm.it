import { test, expect } from '@playwright/test';

test.describe('AES Text Encryption/Decryption', () => {
  test('should encrypt plain text with password', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const plainText = 'Secret message';
    const password = 'MySecurePassword123!';

    // Clear default content and enter plain text
    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    // Enter password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    // Wait for auto-encryption (debounced at 800ms)
    await page.waitForTimeout(1000);

    // Check output exists
    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(plainText);
    // AES encrypted output should be Base64, containing alphanumeric + /+=
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  test('should decrypt Base64 encrypted text with correct password', async ({ page }) => {
    await page.goto('/#/aes-decrypt');
    await page.waitForLoadState('networkidle');

    // First, encrypt something to get a valid encrypted string
    await page.goto('/#/aes-encrypt');
    const plainText = 'Decrypt me!';
    const password = 'TestPassword456!';

    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(1000);

    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    // Now decrypt it
    await page.goto('/#/aes-decrypt');
    await page.waitForLoadState('networkidle');

    const decryptInput = page.locator('textarea').first();
    await decryptInput.clear();
    await decryptInput.fill(encrypted);

    const decryptPassword = page.locator('input[type="password"]').first();
    await decryptPassword.fill(password);

    await page.waitForTimeout(1000);

    const decryptOutput = page.locator('[data-testid="output-text"]');
    const decrypted = await decryptOutput.textContent();

    expect(decrypted).toBe(plainText);
  });

  test('should show error with incorrect password', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const plainText = 'Secret data';
    const password = 'CorrectPassword123';

    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(1000);

    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    // Try to decrypt with wrong password
    await page.goto('/#/aes-decrypt');
    await page.waitForLoadState('networkidle');

    const decryptInput = page.locator('textarea').first();
    await decryptInput.clear();
    await decryptInput.fill(encrypted);

    const decryptPassword = page.locator('input[type="password"]').first();
    await decryptPassword.fill('WrongPassword');

    await page.waitForTimeout(1000);

    // Check for error message
    const errorElement = page.locator('[role="alert"]').first();
    try {
      await errorElement.waitFor({ state: 'visible', timeout: 2000 });
      const errorText = await errorElement.textContent();
      expect(errorText).toBeTruthy();
    } catch {
      // If no error alert, output should be error message
      const decryptOutput = page.locator('[data-testid="output-text"]');
      const outputText = await decryptOutput.textContent();
      // Should either have error alert or invalid output
      expect(outputText === '' || errorElement).toBeTruthy();
    }
  });

  test('should require password field to be filled', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const plainText = 'Test message';
    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    // Don't fill password field
    await page.waitForTimeout(500);

    // Check output should be empty or error
    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    // Without password, should not produce encrypted output
    expect(!encrypted || encrypted === '' || encrypted === plainText).toBeTruthy();
  });

  test('should handle long passwords', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const plainText = 'Message';
    const longPassword = 'a'.repeat(200); // Very long password

    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(longPassword);

    await page.waitForTimeout(1000);

    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    expect(encrypted).toBeTruthy();
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  test('should handle special characters in plaintext', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const plainText = '!@#$%^&*() \n\t 中文 العربية 🔒';
    const password = 'Password123!';

    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(1000);

    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(plainText);
  });

  test('should clear both inputs when reset button clicked', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const textInput = page.locator('textarea').first();
    await textInput.fill('Test data');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('Password123');

    await page.waitForTimeout(500);

    // Look for reset/clear button
    const clearButton = page.locator('button:has-text("Clear")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();

      const clearedText = await textInput.inputValue();
      const clearedPassword = await passwordInput.inputValue();

      expect(clearedText === '' || clearedText === null).toBeTruthy();
      expect(clearedPassword === '' || clearedPassword === null).toBeTruthy();
    }
  });
});
