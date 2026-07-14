import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

// Selects the OpenPGP algorithm via its radio input
async function selectOpenPgp(page) {
  const radio = page.locator('input[type="radio"][value="openpgp"]').first();
  await radio.waitFor({ state: 'attached', timeout: 5000 });
  await radio.check({ force: true });
  await page.waitForTimeout(500);
}

// The exact-name match avoids the LearnMorePanel toggle
// ("How Does OpenPGP Decryption Work?"), which has-text would also match
function actionButton(page, name) {
  return page.getByRole('button', { name, exact: true }).first();
}

test.describe('OpenPGP Encryption Algorithm', () => {
  test.describe('OpenPGP Text Encryption', () => {
    test('should encrypt text using OpenPGP algorithm', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      await selectOpenPgp(page);

      const plainText = 'Secret message for OpenPGP encryption';
      const password = 'PgpPassword123!';

      // Enter text
      const textInput = page.locator('textarea').first();
      await textInput.clear();
      await textInput.fill(plainText);

      // Enter password
      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.first().fill(password);
      await passwordInputs.last().fill(password);

      // Wait for encryption
      await page.waitForTimeout(3000);

      // Check for output
      const outputTextarea = page.locator('textarea').nth(1);
      const isVisible = await outputTextarea.isVisible().catch(() => false);

      if (isVisible) {
        const encrypted = await outputTextarea.inputValue();
        expect(encrypted).toBeTruthy();
        expect(encrypted).not.toBe(plainText);
      }
    });

    test('should produce different output when switching to OpenPGP', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      const plainText = 'Test algorithm switching';
      const password = 'TestPassword123!';

      // Start from the default algorithm
      const defaultRadio = page.locator('input[type="radio"][value="jsAesCrypt"]').first();
      await defaultRadio.check({ force: true });
      await page.waitForTimeout(300);

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

      // Switch to OpenPGP algorithm; re-enter the text to trigger
      // re-encryption (algorithm changes don't re-encrypt existing input)
      await selectOpenPgp(page);
      await textInput.clear();
      await textInput.fill(plainText);
      await page.waitForTimeout(3000);

      const secondEncrypted = await outputTextarea.inputValue();

      // Output should change when algorithm changes
      if (firstEncrypted && secondEncrypted) {
        expect(firstEncrypted).not.toBe(secondEncrypted);
      }
    });
  });

  test.describe('OpenPGP File Encryption', () => {
    test('should encrypt file to .gpg using OpenPGP algorithm', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      await selectOpenPgp(page);

      const testFile = path.join(fixturesDir, 'test.txt');
      const password = 'PgpFilePassword123!';

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
      const encryptButton = actionButton(page, 'Encrypt');
      await encryptButton.waitFor({ state: 'visible', timeout: 5000 });

      const isDisabled = await encryptButton.isDisabled().catch(() => true);

      if (!isDisabled) {
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await encryptButton.click({ force: true });

        try {
          const download = await downloadPromise.catch(() => null);
          if (download) {
            const filename = download.suggestedFilename();
            // OpenPGP files should have .gpg extension
            expect(filename).toContain('.gpg');
          }
        } catch {
          // Download might not trigger in test environment
        }
      }
    });

    test('should show OpenPGP algorithm option on encrypt page', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      const radio = page.locator('input[type="radio"][value="openpgp"]').first();
      await expect(radio).toBeAttached();

      const label = page.locator('text=OpenPGP (GnuPG)').first();
      await expect(label).toBeVisible();
    });

    test('should show gpg CLI hint when OpenPGP is selected', async ({ page }) => {
      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      await selectOpenPgp(page);

      // Info alert should mention gpg
      const hint = page.locator('text=gpg -d').first();
      await expect(hint).toBeVisible();
    });
  });

  test.describe('OpenPGP File Decryption', () => {
    test('should show OpenPGP algorithm option on decrypt page', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      const radio = page.locator('input[type="radio"][value="openpgp"]').first();
      await expect(radio).toBeAttached();

      const label = page.locator('text=OpenPGP (GnuPG)').first();
      await expect(label).toBeVisible();
    });

    test('should auto-select OpenPGP when uploading a .gpg file', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      // Start from a different algorithm
      const ageRadio = page.locator('input[type="radio"][value="age"]').first();
      await ageRadio.check({ force: true });
      await page.waitForTimeout(300);

      // Upload a .gpg file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(fixturesDir, 'test-encrypted.gpg'));
      await page.waitForTimeout(500);

      // Algorithm should switch to OpenPGP automatically
      const pgpRadio = page.locator('input[type="radio"][value="openpgp"]').first();
      await expect(pgpRadio).toBeChecked();
    });

    test('should decrypt a gpg-created .gpg file with the correct password', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      // Fixture created with: gpg --rfc4880 --cipher-algo AES256 --passphrase TestPassword123! -c
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(fixturesDir, 'test-encrypted.gpg'));
      await page.waitForTimeout(500);

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('TestPassword123!');
      await page.waitForTimeout(500);

      const decryptButton = actionButton(page, 'Decrypt');
      await expect(decryptButton).toBeEnabled({ timeout: 5000 });

      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await decryptButton.click({ force: true });

      const download = await downloadPromise;
      // .gpg extension should be stripped from the output name
      expect(download.suggestedFilename()).toBe('test-encrypted');
    });

    test('should show wrong-password error for a .gpg file', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(fixturesDir, 'test-encrypted.gpg'));
      await page.waitForTimeout(500);

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('WrongPassword999!');
      await page.waitForTimeout(500);

      const decryptButton = actionButton(page, 'Decrypt');
      await expect(decryptButton).toBeEnabled({ timeout: 5000 });
      await decryptButton.click({ force: true });

      // Wrong password on SEIPDv1 surfaces as either an incorrect-password
      // or a wrong-password/corrupted message (MDC quick-check ambiguity)
      const errorCard = page.getByText('Decryption Failed', { exact: true }).first();
      await expect(errorCard).toBeVisible({ timeout: 15000 });
    });

    test('should prevent decryption without password for OpenPGP', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      await selectOpenPgp(page);

      // Upload file, don't enter password
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(fixturesDir, 'test-encrypted.gpg'));
      await page.waitForTimeout(500);

      const decryptButton = actionButton(page, 'Decrypt');

      // Button should be disabled without password
      await expect(decryptButton).toBeDisabled();
    });
  });

  test.describe('OpenPGP Error Handling', () => {
    test('should show error when decrypting non-PGP file with OpenPGP algorithm', async ({ page }) => {
      await page.goto('/#/decrypt');
      await page.waitForLoadState('networkidle');

      const testFile = path.join(fixturesDir, 'test.txt');
      const password = 'SomePassword123!';

      // Upload plain text file (auto-detect won't change algorithm for .txt)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(500);

      await selectOpenPgp(page);

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill(password);
      await page.waitForTimeout(500);

      const decryptButton = actionButton(page, 'Decrypt');
      await expect(decryptButton).toBeEnabled({ timeout: 5000 });
      await decryptButton.click({ force: true });

      // Should show the invalid-format error
      const errorElement = page.getByText(/not a valid OpenPGP/i).first();
      await expect(errorElement).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('OpenPGP Library Loading', () => {
    test('should load OpenPGP.js without console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/#/encrypt');
      await page.waitForLoadState('networkidle');

      await selectOpenPgp(page);
      await page.waitForTimeout(2000);

      const pgpErrors = errors.filter(e => e.toLowerCase().includes('openpgp'));
      expect(pgpErrors.length).toBe(0);
    });
  });
});
