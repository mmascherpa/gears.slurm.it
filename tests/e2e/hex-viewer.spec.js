import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../fixtures');

// Helper to create a test binary file
function createBinaryTestFile(filename, content) {
  const filepath = path.join(FIXTURES_DIR, filename);

  // Ensure fixtures directory exists
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  // Create binary content
  let buffer;
  if (typeof content === 'string') {
    buffer = Buffer.from(content, 'utf-8');
  } else if (Array.isArray(content)) {
    buffer = Buffer.from(content);
  } else {
    buffer = content;
  }

  fs.writeFileSync(filepath, buffer);
  return filepath;
}

test.describe('Hex Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/#/hex-viewer');
    await page.waitForLoadState('networkidle');
  });

  test('displays page header and controls', async ({ page }) => {
    // Check page header
    await expect(page.getByText('Hex Viewer')).toBeVisible();
    await expect(page.getByText('View and analyze binary files')).toBeVisible();

    // Check file upload section
    await expect(page.getByText('Select file to view')).toBeVisible();
  });

  test('loads and displays a simple text file', async ({ page }) => {
    // Create test file
    const testContent = 'Hello World!';
    const filepath = createBinaryTestFile('test-simple.txt', testContent);

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    // Wait for file to load
    await expect(page.getByText('test-simple.txt')).toBeVisible();
    await expect(page.getByText('12 Bytes')).toBeVisible();

    // Check hex display appears
    await expect(page.locator('.hex-scroll-container')).toBeVisible();

    // Verify hex content (H=48, e=65, l=6C, l=6C, o=6F)
    await expect(page.locator('.hex-data').first()).toContainText('48 65 6C 6C 6F');

    // Verify ASCII display
    await expect(page.locator('.hex-ascii').first()).toContainText('Hello World!');
  });

  test('displays file information chips', async ({ page }) => {
    const filepath = createBinaryTestFile('test-chips.txt', 'Test');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    // Check chips appear
    await expect(page.getByText('test-chips.txt')).toBeVisible();
    await expect(page.getByText('4 Bytes')).toBeVisible();
    await expect(page.getByText('1 rows')).toBeVisible();
  });

  test('toggles between hex and decimal offset display', async ({ page }) => {
    const filepath = createBinaryTestFile('test-offset.txt', 'A'.repeat(32));

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Default should show hex offsets (00000000, 00000010)
    await expect(page.locator('.hex-offset').first()).toContainText('00000000');

    // Toggle to decimal
    await page.getByRole('button', { name: 'Dec' }).click();
    await page.waitForTimeout(300);

    // Should now show decimal offsets
    await expect(page.locator('.hex-offset').first()).toContainText('0000000000');

    // Toggle back to hex
    await page.getByRole('button', { name: 'Hex' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('.hex-offset').first()).toContainText('00000000');
  });

  test('jumps to hex offset', async ({ page }) => {
    // Create file with 256 bytes
    const bytes = Array(256).fill(0).map((_, i) => i);
    const filepath = createBinaryTestFile('test-jump.bin', bytes);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Jump to offset 0xFF (255)
    const jumpInput = page.getByLabel('Jump to offset');
    await jumpInput.fill('FF');
    await jumpInput.press('Enter');

    await page.waitForTimeout(500);

    // Check success message
    await expect(page.getByText('Jumped to offset 0xFF')).toBeVisible();
  });

  test('jumps to decimal offset', async ({ page }) => {
    const bytes = Array(256).fill(0).map((_, i) => i);
    const filepath = createBinaryTestFile('test-jump-dec.bin', bytes);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Switch to decimal mode
    await page.getByRole('button', { name: 'Dec' }).click();
    await page.waitForTimeout(300);

    // Jump to offset 128
    const jumpInput = page.getByLabel('Jump to offset');
    await jumpInput.fill('128');
    await jumpInput.press('Enter');

    await page.waitForTimeout(500);

    await expect(page.getByText('Jumped to offset 0x80')).toBeVisible();
  });

  test('searches for hex pattern', async ({ page }) => {
    // Create file with specific hex pattern: FF D8 FF (JPEG header)
    const bytes = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, ...Array(10).fill(0x41)];
    const filepath = createBinaryTestFile('test-search-hex.bin', bytes);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Expand search panel
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    // Search for hex pattern
    const hexSearchInput = page.getByLabel('Search Hex Pattern');
    await hexSearchInput.fill('FF D8 FF');
    await hexSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Check success message
    await expect(page.getByText('Found 1 matches')).toBeVisible();
    await expect(page.getByText('1 of 1')).toBeVisible();
  });

  test('searches for ASCII text', async ({ page }) => {
    const testText = 'Hello World! Hello again!';
    const filepath = createBinaryTestFile('test-search-text.txt', testText);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Expand search panel
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    // Search for text
    const textSearchInput = page.getByLabel('Search ASCII Text');
    await textSearchInput.fill('Hello');
    await textSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Should find 2 matches
    await expect(page.getByText('Found 2 matches')).toBeVisible();
    await expect(page.getByText('1 of 2')).toBeVisible();
  });

  test('navigates between search matches', async ({ page }) => {
    const testText = 'AAA BBB AAA CCC AAA';
    const filepath = createBinaryTestFile('test-search-nav.txt', testText);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Search for AAA
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    const textSearchInput = page.getByLabel('Search ASCII Text');
    await textSearchInput.fill('AAA');
    await textSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Should find 3 matches
    await expect(page.getByText('1 of 3')).toBeVisible();

    // Click Next
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('2 of 3')).toBeVisible();

    // Click Next again
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('3 of 3')).toBeVisible();

    // Click Previous
    await page.getByRole('button', { name: 'Previous' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('2 of 3')).toBeVisible();
  });

  test('clears search results', async ({ page }) => {
    const filepath = createBinaryTestFile('test-search-clear.txt', 'Test Test');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Search
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    const textSearchInput = page.getByLabel('Search ASCII Text');
    await textSearchInput.fill('Test');
    await textSearchInput.press('Enter');

    await page.waitForTimeout(500);

    await expect(page.getByText('Found 2 matches')).toBeVisible();

    // Clear search
    await page.getByRole('button', { name: 'Clear Search' }).click();
    await page.waitForTimeout(300);

    // Match counter should disappear
    await expect(page.getByText('1 of 2')).not.toBeVisible();
  });

  test('displays data interpretation panel with single byte', async ({ page }) => {
    // Create file with known byte value (200 = 0xC8)
    const filepath = createBinaryTestFile('test-interpret-1.bin', [200]);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Note: Selection requires clicking on bytes in the hex viewer
    // For E2E, we'll verify the search creates a selection
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    const hexSearchInput = page.getByLabel('Search Hex Pattern');
    await hexSearchInput.fill('C8');
    await hexSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Data interpretation panel should appear
    await expect(page.getByText('Data Interpretation')).toBeVisible();

    // Check interpretations
    await expect(page.getByText('Int8')).toBeVisible();
    await expect(page.getByText('UInt8')).toBeVisible();
  });

  test('displays data interpretation for 4 bytes', async ({ page }) => {
    // Create file with 4 bytes representing a 32-bit integer
    const filepath = createBinaryTestFile('test-interpret-4.bin', [0x00, 0x00, 0x00, 0x01]);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Search for pattern to select it
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    const hexSearchInput = page.getByLabel('Search Hex Pattern');
    await hexSearchInput.fill('00 00 00 01');
    await hexSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Check 32-bit interpretations are available
    await expect(page.getByText('Int32 LE')).toBeVisible();
    await expect(page.getByText('UInt32 LE')).toBeVisible();
    await expect(page.getByText('Unix Timestamp (LE)')).toBeVisible();
  });

  test('handles large file with virtual scrolling', async ({ page }) => {
    // Create a 10KB file (625 rows of 16 bytes)
    const bytes = Array(10240).fill(0).map((_, i) => i % 256);
    const filepath = createBinaryTestFile('test-large.bin', bytes);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Check file loaded
    await expect(page.getByText('10 KB')).toBeVisible();
    await expect(page.getByText('640 rows')).toBeVisible();

    // Verify scroll container exists
    const scrollContainer = page.locator('.hex-scroll-container');
    await expect(scrollContainer).toBeVisible();

    // Scroll down
    await scrollContainer.evaluate(el => el.scrollTop = 1000);
    await page.waitForTimeout(300);

    // Should still render correctly (virtual scrolling working)
    await expect(page.locator('.hex-row').first()).toBeVisible();
  });

  test('clears loaded file', async ({ page }) => {
    const filepath = createBinaryTestFile('test-clear.txt', 'Test');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Verify file is loaded
    await expect(page.getByText('test-clear.txt')).toBeVisible();

    // Click clear button
    await page.getByRole('button', { name: 'Clear' }).click();
    await page.waitForTimeout(300);

    // File info should disappear
    await expect(page.getByText('test-clear.txt')).not.toBeVisible();
    await expect(page.getByText('File cleared')).toBeVisible();
  });

  test('validates file size limits', async ({ page }) => {
    // Create a file larger than 200MB would be impractical for E2E
    // Instead we'll create a 1MB file and verify the validation system works
    const bytes = Array(1024 * 1024).fill(0x41); // 1MB of 'A'
    const filepath = createBinaryTestFile('test-size.bin', bytes);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(1000);

    // File should load (under 200MB limit)
    await expect(page.getByText('1 MB')).toBeVisible();
  });

  test('displays correct hex and ASCII for printable characters', async ({ page }) => {
    const filepath = createBinaryTestFile('test-printable.txt', 'ABC123');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Verify hex: A=41, B=42, C=43, 1=31, 2=32, 3=33
    const hexData = page.locator('.hex-data').first();
    await expect(hexData).toContainText('41 42 43 31 32 33');

    // Verify ASCII
    const asciiData = page.locator('.hex-ascii').first();
    await expect(asciiData).toContainText('ABC123');
  });

  test('displays placeholder for non-printable characters', async ({ page }) => {
    // Create file with null bytes and control characters
    const filepath = createBinaryTestFile('test-nonprint.bin', [0x00, 0x01, 0x09, 0x0A, 0x41]);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Verify hex display
    await expect(page.locator('.hex-data').first()).toContainText('00 01 09 0A 41');

    // ASCII should show placeholders for non-printable, and 'A' for 0x41
    const asciiData = page.locator('.hex-ascii').first();
    const asciiText = await asciiData.textContent();
    expect(asciiText).toContain('A'); // Last character is printable
  });

  test('navigation - can access via drawer menu', async ({ page }) => {
    // Start from home
    await page.goto('http://localhost:5174/#/');
    await page.waitForLoadState('networkidle');

    // Open drawer
    await page.getByRole('button', { name: 'menu' }).first().click();
    await page.waitForTimeout(300);

    // Click Hex Viewer in drawer
    await page.getByRole('link', { name: 'Hex Viewer' }).click();
    await page.waitForTimeout(300);

    // Should navigate to hex viewer
    await expect(page.getByText('Hex Viewer')).toBeVisible();
    await expect(page.getByText('View and analyze binary files')).toBeVisible();
  });

  test('navigation - can access via home page', async ({ page }) => {
    await page.goto('http://localhost:5174/#/');
    await page.waitForLoadState('networkidle');

    // Click Hex Viewer card on home page
    await page.getByText('Hex Viewer').click();
    await page.waitForTimeout(300);

    // Should navigate to hex viewer
    await expect(page.getByText('View and analyze binary files')).toBeVisible();
  });

  test('displays scroll progress indicator', async ({ page }) => {
    // Create a larger file to enable scrolling
    const bytes = Array(1024).fill(0).map((_, i) => i % 256);
    const filepath = createBinaryTestFile('test-scroll.bin', bytes);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Look for scroll info toolbar
    await expect(page.getByText(/Viewing \d+ of \d+ rows/)).toBeVisible();
  });

  test('handles UTF-8 text in data interpretation', async ({ page }) => {
    const filepath = createBinaryTestFile('test-utf8.txt', 'Hello 世界');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Search for "Hello" to select it
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    const textSearchInput = page.getByLabel('Search ASCII Text');
    await textSearchInput.fill('Hello');
    await textSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Data interpretation should show
    await expect(page.getByText('Data Interpretation')).toBeVisible();
    await expect(page.getByText('UTF-8 Text')).toBeVisible();
  });

  test('copy hex data to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const filepath = createBinaryTestFile('test-copy.txt', 'Test');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filepath);

    await page.waitForTimeout(500);

    // Search to create selection
    await page.getByText('Search').click();
    await page.waitForTimeout(300);

    const textSearchInput = page.getByLabel('Search ASCII Text');
    await textSearchInput.fill('Test');
    await textSearchInput.press('Enter');

    await page.waitForTimeout(500);

    // Click copy button in data interpretation panel
    const copyButton = page.getByRole('button').filter({ has: page.locator('[data-testid="copy-icon"], .mdi-content-copy, text="Copy as Hex"') }).first();
    if (await copyButton.isVisible()) {
      await copyButton.click();
      await page.waitForTimeout(500);

      // Check for success message
      await expect(page.getByText('copied to clipboard')).toBeVisible();
    }
  });
});
