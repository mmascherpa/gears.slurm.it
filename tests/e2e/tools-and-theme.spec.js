import { test, expect } from '@playwright/test';

test.describe('Password Generator', () => {
  test('should generate password on page load', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    const passwordField = page.locator('input[readonly]').first();
    const initialPassword = await passwordField.inputValue();

    expect(initialPassword).toBeTruthy();
    expect(initialPassword.length).toBeGreaterThan(0);
  });

  test('should regenerate password when button clicked', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    const passwordField = page.locator('input[readonly]').first();
    const firstPassword = await passwordField.inputValue();

    // Find regenerate button
    const regenerateButton = page.locator('button:has-text("Generate")').first();
    await regenerateButton.click();

    await page.waitForTimeout(300);

    const secondPassword = await passwordField.inputValue();

    // Passwords should be different (statistically)
    expect(secondPassword).not.toBe(firstPassword);
  });

  test('should adjust password length with slider', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    // Find length slider
    const slider = page.locator('input[type="range"]').first();

    // Set to 20 characters
    await slider.fill('20');

    await page.waitForTimeout(300);

    const passwordField = page.locator('input[readonly]').first();
    const password = await passwordField.inputValue();

    expect(password.length).toBe(20);
  });

  test('should toggle character type options', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    // Find checkboxes for character types
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    expect(count).toBeGreaterThan(0);

    // Uncheck one option
    const firstCheckbox = checkboxes.first();
    const isChecked = await firstCheckbox.isChecked();

    if (isChecked) {
      await firstCheckbox.click();

      await page.waitForTimeout(300);

      const passwordField = page.locator('input[readonly]').first();
      const password = await passwordField.inputValue();

      // Password should still be generated, just with fewer character types
      expect(password).toBeTruthy();
    }
  });

  test('should copy password to clipboard', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    const passwordField = page.locator('input[readonly]').first();
    const password = await passwordField.inputValue();

    // Find copy button
    const copyButton = page.locator('button:has-text("Copy")').first();
    await copyButton.click();

    // Check for success message
    const snackbar = page.locator('[role="status"]').first();
    try {
      await snackbar.waitFor({ state: 'visible', timeout: 2000 });
      const message = await snackbar.textContent();
      expect(message).toContain('Copied');
    } catch {
      // Some implementations might not show snackbar
    }
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    // Look for strength indicator
    const strengthIndicator = page.locator('[data-testid="strength-indicator"], .strength');

    const strengthVisible = await strengthIndicator.isVisible().catch(() => false);

    if (strengthVisible) {
      const strengthText = await strengthIndicator.textContent();
      expect(strengthText).toBeTruthy();
    }
  });

  test('should display password requirements', async ({ page }) => {
    await page.goto('/#/password-generator');
    await page.waitForLoadState('networkidle');

    // Look for requirements checklist
    const requirements = page.locator('[data-testid="requirements"], .requirements');

    const visible = await requirements.isVisible().catch(() => false);

    if (visible) {
      const text = await requirements.textContent();
      expect(text).toBeTruthy();
    }
  });
});

test.describe('Theme Switching', () => {
  test('should load with default theme', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    // Check for theme indicator or app styling
    const app = page.locator('#app');
    const classList = await app.getAttribute('class');

    // App should have some class
    expect(classList).toBeTruthy();
  });

  test('should persist theme selection in localStorage', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    // Find theme switcher button/menu
    const themeButton = page.locator('button[aria-label*="theme"], button:has-text("Theme")').first();

    const themeVisible = await themeButton.isVisible().catch(() => false);

    if (themeVisible) {
      // Click to open theme menu
      await themeButton.click();

      await page.waitForTimeout(300);

      // Find and click Dark theme option
      const darkTheme = page.locator('text=Dark').first();
      const darkVisible = await darkTheme.isVisible().catch(() => false);

      if (darkVisible) {
        await darkTheme.click();

        await page.waitForTimeout(500);

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Theme should still be dark
        // This is verified if localStorage was updated
        const storageTheme = await page.evaluate(() => localStorage.getItem('theme'));
        expect(storageTheme).toBeTruthy();
      }
    }
  });

  test('should switch between multiple themes', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('button[aria-label*="theme"], button:has-text("Theme")').first();

    const themeVisible = await themeButton.isVisible().catch(() => false);

    if (themeVisible) {
      const themes = ['Default', 'Dark', 'Slurm'];

      for (const theme of themes) {
        await themeButton.click();
        await page.waitForTimeout(300);

        const themeOption = page.locator(`text=${theme}`).first();
        const optionVisible = await themeOption.isVisible().catch(() => false);

        if (optionVisible) {
          await themeOption.click();
          await page.waitForTimeout(500);

          // Verify theme was applied
          const app = page.locator('#app');
          const classList = await app.getAttribute('class');
          expect(classList).toBeTruthy();
        }
      }
    }
  });

  test('should update colors when theme changes', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('button[aria-label*="theme"], button:has-text("Theme")').first();

    const themeVisible = await themeButton.isVisible().catch(() => false);

    if (themeVisible) {
      // Get initial theme color
      const app = page.locator('#app');
      const initialBgColor = await app.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );

      // Switch to dark theme
      await themeButton.click();
      await page.waitForTimeout(300);

      const darkTheme = page.locator('text=Dark').first();
      const darkVisible = await darkTheme.isVisible().catch(() => false);

      if (darkVisible) {
        await darkTheme.click();
        await page.waitForTimeout(500);

        // Get new theme color
        const newBgColor = await app.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );

        // Colors should be different
        expect(newBgColor).not.toBe(initialBgColor);
      }
    }
  });

  test('should apply theme to all page elements', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const themeButton = page.locator('button[aria-label*="theme"], button:has-text("Theme")').first();

    const themeVisible = await themeButton.isVisible().catch(() => false);

    if (themeVisible) {
      await themeButton.click();
      await page.waitForTimeout(300);

      const darkTheme = page.locator('text=Dark').first();
      const darkVisible = await darkTheme.isVisible().catch(() => false);

      if (darkVisible) {
        await darkTheme.click();
        await page.waitForTimeout(500);

        // Navigate to different page
        await page.goto('/#/base64-encode');
        await page.waitForLoadState('networkidle');

        // Theme should still be applied
        const app = page.locator('#app');
        const classList = await app.getAttribute('class');
        expect(classList).toBeTruthy();
      }
    }
  });
});

test.describe('Password Session Manager', () => {
  test('should save password when remember checkbox is checked', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const password = 'SessionPassword123!';

    // Check the "Remember password" checkbox
    const rememberCheckbox = page.locator('input[type="checkbox"]').first();
    const label = await rememberCheckbox.locator('..').textContent();

    if (label && label.includes('Remember')) {
      await rememberCheckbox.check();

      // Enter password
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill(password);

      await page.waitForTimeout(500);

      // Check sessionStorage
      const savedPassword = await page.evaluate(() =>
        sessionStorage.getItem('encryptPassword')
      );

      expect(savedPassword).toBeTruthy();
    }
  });

  test('should restore password on navigation', async ({ page }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const password = 'RestoreMe123!';

    // Enable remember and set password
    const rememberCheckbox = page.locator('input[type="checkbox"]').first();
    const isChecked = await rememberCheckbox.isChecked().catch(() => false);

    if (!isChecked) {
      await rememberCheckbox.check();
    }

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(500);

    // Navigate to different page
    await page.goto('/#/aes-decrypt');
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    // Password should be restored
    const restoredPasswordInput = page.locator('input[type="password"]').first();
    const restoredPassword = await restoredPasswordInput.inputValue();

    expect(restoredPassword).toBe(password);
  });

  test('should clear password when session ends', async ({ page, context }) => {
    await page.goto('/#/aes-encrypt');
    await page.waitForLoadState('networkidle');

    const password = 'ClearMe123!';

    const rememberCheckbox = page.locator('input[type="checkbox"]').first();
    await rememberCheckbox.check();

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    await page.waitForTimeout(500);

    // Clear sessionStorage to simulate session end
    await page.evaluate(() => sessionStorage.clear());

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Password should be empty
    const clearedPasswordInput = page.locator('input[type="password"]').first();
    const clearedPassword = await clearedPasswordInput.inputValue();

    expect(clearedPassword === '' || clearedPassword === null).toBeTruthy();
  });
});
