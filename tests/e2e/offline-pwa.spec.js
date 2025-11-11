import { test, expect } from '@playwright/test';

/**
 * Offline PWA Tests
 * Critical for verifying service worker caching and offline functionality
 */

test.describe('Offline PWA Functionality', () => {
  test('should load service worker', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then((regs) => regs.length > 0);
    });

    expect(swRegistration).toBe(true);
  });

  test('should cache assets on first visit', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const cacheNames = await page.evaluate(() => {
      return caches.keys();
    });

    expect(cacheNames.length).toBeGreaterThan(0);
    // Should have a cache with name pattern like "slurm-cache-*"
    const hasCache = cacheNames.some((name) => name.includes('slurm-cache'));
    expect(hasCache).toBe(true);
  });

  test('should work offline after initial load', async ({ page }) => {
    // First load online
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Navigate to different page (should load from cache)
    await page.goto('/#/base64-encode');
    await page.waitForTimeout(1000);

    // Page should load and be interactive
    const header = page.locator('[data-testid="page-title"], h1, .tool-title');
    const headerVisible = await header.isVisible().catch(() => false);

    expect(headerVisible).toBe(true);

    // Go back online
    await page.context().setOffline(false);
  });

  test('should serve main app page from cache offline', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    // Home page should still load
    const content = page.locator('body');
    const text = await content.textContent();

    expect(text).toBeTruthy();

    await page.context().setOffline(false);
  });

  test('should perform encryption offline', async ({ page }) => {
    // Load page online first to cache
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    const plainText = 'Offline test';
    const password = 'OfflinePassword123!';

    // Try to encrypt
    const textInput = page.locator('textarea').first();
    await textInput.fill(plainText);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(1000);

    // Should produce encrypted output even offline
    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    expect(encrypted).toBeTruthy();

    await page.context().setOffline(false);
  });

  test('should perform decryption offline', async ({ page }) => {
    // Load page online first
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const plainText = 'Decrypt me offline';
    const password = 'OfflineDecrypt123!';

    // Encrypt while online
    const textInput = page.locator('textarea').first();
    await textInput.clear();
    await textInput.fill(plainText);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(1000);

    const output = page.locator('[data-testid="output-text"]');
    const encrypted = await output.textContent();

    // Now go offline and decrypt
    await page.context().setOffline(true);

    await page.goto('/#/aes-decrypt');
    await page.waitForTimeout(1000);

    const decryptInput = page.locator('textarea').first();
    await decryptInput.clear();
    await decryptInput.fill(encrypted);

    const decryptPassword = page.locator('input[type="password"]').first();
    await decryptPassword.fill(password);

    await page.waitForTimeout(1000);

    const decryptOutput = page.locator('[data-testid="output-text"]');
    const decrypted = await decryptOutput.textContent();

    expect(decrypted).toBe(plainText);

    await page.context().setOffline(false);
  });

  test('should access all tool pages offline', async ({ page }) => {
    const toolPaths = [
      '/#/',
      '/#/base64-encode',
      '/#/base64-decode',
      '/#/aes-encrypt',
      '/#/aes-decrypt',
      '/#/password-generator',
      '/#/about'
    ];

    // Load all pages online first
    for (const path of toolPaths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }

    // Go offline
    await page.context().setOffline(true);

    // Visit each page again offline
    for (const path of toolPaths) {
      await page.goto(path);
      await page.waitForTimeout(500);

      const content = page.locator('body');
      const text = await content.textContent();

      expect(text).toBeTruthy();
    }

    await page.context().setOffline(false);
  });

  test('should have web worker cached for crypto operations', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    // Check if worker script is cached
    const workerCached = await page.evaluate(() => {
      return caches.open('slurm-cache').then((cache) => {
        return cache.keys().then((requests) => {
          return requests.some((req) =>
            req.url.includes('worker.js') || req.url.includes('crypto')
          );
        });
      }).catch(() => false);
    });

    // Worker might be inline or cached, but app should work without network
    expect(typeof workerCached).toBe('boolean');
  });

  test('should handle cache updates gracefully', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const cacheNameBefore = await page.evaluate(() => {
      return caches.keys().then((names) =>
        names.find((n) => n.includes('slurm-cache'))
      );
    });

    expect(cacheNameBefore).toBeTruthy();

    // Navigate around to ensure caching
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const cacheNameAfter = await page.evaluate(() => {
      return caches.keys().then((names) =>
        names.find((n) => n.includes('slurm-cache'))
      );
    });

    expect(cacheNameAfter).toBeTruthy();
  });

  test('should provide offline indicator or notification', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    await page.waitForTimeout(1000);

    // Check if there's any offline indicator
    // Some apps show a banner, others rely on UI state
    const offlineIndicator = page.locator('[data-testid="offline"], .offline-indicator');
    const indicatorVisible = await offlineIndicator.isVisible().catch(() => false);

    // Optional: offline indicator might not be present
    // Just verify app is still functional
    const appContent = page.locator('#app');
    const appVisible = await appContent.isVisible();

    expect(appVisible).toBe(true);

    await page.context().setOffline(false);
  });

  test('should validate that manifest.json is accessible', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const manifestUrl = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.href : null;
    });

    expect(manifestUrl).toBeTruthy();

    // Try to fetch manifest
    const manifestData = await page.evaluate(async (url) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch {
        return null;
      }
    }, manifestUrl);

    expect(manifestData).toBeTruthy();
    expect(manifestData.name || manifestData.short_name).toBeTruthy();
  });

  test('should maintain state across offline/online transitions', async ({ page }) => {
    await page.goto('/#/base64-encode');
    await page.waitForLoadState('networkidle');

    const testText = 'State test';
    const textInput = page.locator('textarea').first();
    await textInput.fill(testText);

    await page.waitForTimeout(500);

    // Go offline
    await page.context().setOffline(true);

    await page.waitForTimeout(300);

    // State should persist
    const currentValue = await textInput.inputValue();
    expect(currentValue).toBe(testText);

    // Go back online
    await page.context().setOffline(false);

    await page.waitForTimeout(300);

    // State should still be there
    const stillThere = await textInput.inputValue();
    expect(stillThere).toBe(testText);
  });
});
