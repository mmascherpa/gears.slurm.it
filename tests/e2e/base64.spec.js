import { test, expect } from '@playwright/test';
import { navigateToTool, waitForSnackbarSuccess, copyToClipboard, readClipboard } from './helpers.js';

test.describe('Base64 Encoding and Decoding', () => {
  test('should encode plain text to Base64', async ({ page }) => {
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const plainText = 'Hello, World!';
    const textInput = page.locator('textarea').first();

    await textInput.fill(plainText);
    await page.waitForTimeout(500); // Allow debounce to process

    const output = page.locator('[data-testid="output-text"]');
    const encodedText = await output.textContent();

    // Base64 encoding of "Hello, World!" is "SGVsbG8sIFdvcmxkIQ=="
    expect(encodedText).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  test('should decode Base64 to plain text', async ({ page }) => {
    await page.goto('/#/base64-decode');
    await page.waitForLoadState('networkidle');

    const base64Text = 'SGVsbG8sIFdvcmxkIQ==';
    const textInput = page.locator('textarea').first();

    await textInput.fill(base64Text);
    await page.waitForTimeout(500);

    const output = page.locator('[data-testid="output-text"]');
    const decodedText = await output.textContent();

    expect(decodedText).toBe('Hello, World!');
  });

  test('should copy encoded text to clipboard', async ({ page }) => {
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const plainText = 'Test data';
    const textInput = page.locator('textarea').first();

    await textInput.fill(plainText);
    await page.waitForTimeout(500);

    // Find and click the copy button
    const copyButton = page.locator('button:has-text("Copy")').first();
    await copyButton.click();

    // Verify snackbar appears
    const snackbar = page.locator('[role="status"]').first();
    await snackbar.waitFor({ state: 'visible', timeout: 2000 });
    const message = await snackbar.textContent();
    expect(message).toContain('Copied');
  });

  test('should handle empty input gracefully', async ({ page }) => {
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const output = page.locator('[data-testid="output-text"]');
    const outputText = await output.textContent();

    expect(outputText).toBe('');
  });

  test('should round-trip encode and decode', async ({ page }) => {
    const testString = 'The quick brown fox jumps over the lazy dog';

    // Encode
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const encodeInput = page.locator('textarea').first();
    await encodeInput.fill(testString);
    await page.waitForTimeout(500);

    const encodeOutput = page.locator('[data-testid="output-text"]');
    const encoded = await encodeOutput.textContent();

    // Decode
    await page.goto('/#/base64-decode');
    await page.waitForLoadState('networkidle');

    const decodeInput = page.locator('textarea').first();
    await decodeInput.fill(encoded);
    await page.waitForTimeout(500);

    const decodeOutput = page.locator('[data-testid="output-text"]');
    const decoded = await decodeOutput.textContent();

    expect(decoded).toBe(testString);
  });

  test('should handle special characters in Base64', async ({ page }) => {
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const specialText = '!@#$%^&*()_+-=[]{}|;\':",./<>?';
    const textInput = page.locator('textarea').first();

    await textInput.fill(specialText);
    await page.waitForTimeout(500);

    const output = page.locator('[data-testid="output-text"]');
    const encoded = await output.textContent();

    // Encoded output should exist and not be empty
    expect(encoded).toBeTruthy();
    expect(encoded).not.toBe(specialText);
  });
});
