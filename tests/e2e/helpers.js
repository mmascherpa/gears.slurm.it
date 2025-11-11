/**
 * E2E Test Helpers
 * Common utilities for Playwright tests
 */

export async function navigateToTool(page, toolPath) {
  await page.goto(`/tools/${toolPath}`);
  await page.waitForLoadState('networkidle');
}

export async function getSnackbarMessage(page) {
  try {
    const snackbar = page.locator('[role="status"]').first();
    await snackbar.waitFor({ state: 'visible', timeout: 2000 });
    return await snackbar.textContent();
  } catch {
    return null;
  }
}

export async function waitForSnackbarSuccess(page) {
  const snackbar = page.locator('[role="status"]').first();
  await snackbar.waitFor({ state: 'visible', timeout: 2000 });
  return await snackbar.textContent();
}

export async function copyToClipboard(page, text) {
  await page.evaluate((t) => navigator.clipboard.writeText(t), text);
}

export async function readClipboard(page) {
  return await page.evaluate(() => navigator.clipboard.readText());
}

export async function uploadFile(page, inputSelector, filePath) {
  const input = page.locator(inputSelector);
  await input.setInputFiles(filePath);
}

export async function waitForFileDownload(page, action) {
  const downloadPromise = page.waitForEvent('download');
  await action();
  const download = await downloadPromise;
  return download;
}

export async function waitForPreviewToLoad(page, timeout = 3000) {
  try {
    await page.locator('[data-testid="file-preview"]').waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}
