/**
 * QR Code Generator Utility
 * Handles QR code generation using the qrcode library
 */

import QRCode from 'qrcode';

/**
 * Generates a QR code as a data URL
 * @param {string} text - Text to encode in QR code
 * @param {Object} options - QR code generation options
 * @param {number} options.width - QR code width in pixels (default: 256)
 * @param {string} options.errorCorrectionLevel - Error correction level: L, M, Q, H (default: M)
 * @param {string} options.color - Foreground color (default: #000000)
 * @param {string} options.backgroundColor - Background color (default: #FFFFFF)
 * @returns {Promise<string>} Data URL of the generated QR code
 */
export async function generateQrCode(text, options = {}) {
  const {
    width = 256,
    errorCorrectionLevel = 'M',
    color = '#000000',
    backgroundColor = '#FFFFFF',
  } = options;

  if (!text || text.trim() === '') {
    throw new Error('Text cannot be empty');
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width,
      errorCorrectionLevel,
      color: {
        dark: color,
        light: backgroundColor,
      },
      margin: 1,
    });

    return dataUrl;
  } catch (error) {
    const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
    throw new Error(`QR code generation failed: ${errorMessage}`);
  }
}

/**
 * Downloads a QR code as a PNG file
 * @param {string} dataUrl - Data URL of the QR code image
 * @param {string} filename - Name of the file to download
 */
export function downloadQrCode(dataUrl, filename = 'qrcode.png') {
  if (!dataUrl) {
    throw new Error('No QR code to download');
  }

  // Ensure filename has .png extension
  if (!filename.endsWith('.png')) {
    filename += '.png';
  }

  // Create download link
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies QR code image to clipboard
 * @param {string} dataUrl - Data URL of the QR code image
 * @returns {Promise<void>}
 */
export async function copyQrCodeToClipboard(dataUrl) {
  if (!dataUrl) {
    throw new Error('No QR code to copy');
  }

  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
  } catch (error) {
    const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
    throw new Error(`Failed to copy QR code: ${errorMessage}`);
  }
}

/**
 * Validates QR code generation options
 * @param {Object} options - Options to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateQrOptions(options) {
  const { width, errorCorrectionLevel } = options;

  if (width && (width < 64 || width > 2048)) {
    throw new Error('Width must be between 64 and 2048 pixels');
  }

  if (errorCorrectionLevel && !['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
    throw new Error('Error correction level must be L, M, Q, or H');
  }

  return true;
}
