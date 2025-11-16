/**
 * Metadata Manager - Abstraction Layer
 *
 * Provides a unified interface for working with metadata across different image formats
 * Currently supports: JPEG (EXIF) and PNG (tEXt/iTXt chunks)
 */

// JPEG utilities
import {
  loadExifData,
  editMetadataField as editJpegField,
  removeMetadataField as removeJpegField,
  removeAllMetadata as removeAllJpegMetadata,
  addCustomField as addCustomJpegField,
  getMetadataStats as getJpegStats
} from './metadataEditor.js';

// PNG utilities
import {
  loadPngMetadata,
  editPngMetadataField,
  removePngMetadataField,
  removeAllPngMetadata,
  addCustomPngField,
  getPngMetadataStats
} from './pngMetadataEditor.js';

/**
 * Image format types
 */
export const IMAGE_FORMATS = {
  JPEG: 'JPEG',
  PNG: 'PNG',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Detect image format from file or base64 data
 *
 * @param {File|string} input - File object or base64 string
 * @returns {string} Format constant from IMAGE_FORMATS
 */
export function detectImageFormat(input) {
  if (input instanceof File) {
    const extension = input.name.split('.').pop().toLowerCase();
    const mimeType = input.type;

    if (extension === 'png' || mimeType === 'image/png') {
      return IMAGE_FORMATS.PNG;
    } else if (extension === 'jpg' || extension === 'jpeg' || mimeType === 'image/jpeg') {
      return IMAGE_FORMATS.JPEG;
    }
  } else if (typeof input === 'string') {
    // Check data URI prefix
    if (input.startsWith('data:image/png')) {
      return IMAGE_FORMATS.PNG;
    } else if (input.startsWith('data:image/jpeg') || input.startsWith('data:image/jpg')) {
      return IMAGE_FORMATS.JPEG;
    }

    // Check magic bytes if base64
    try {
      const base64Data = input.replace(/^data:image\/[a-z]+;base64,/, '');
      const binaryString = atob(base64Data.substring(0, 20));

      // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
      if (binaryString.charCodeAt(0) === 0x89 &&
          binaryString.charCodeAt(1) === 0x50 &&
          binaryString.charCodeAt(2) === 0x4E &&
          binaryString.charCodeAt(3) === 0x47) {
        return IMAGE_FORMATS.PNG;
      }

      // JPEG magic bytes: FF D8 FF
      if (binaryString.charCodeAt(0) === 0xFF &&
          binaryString.charCodeAt(1) === 0xD8 &&
          binaryString.charCodeAt(2) === 0xFF) {
        return IMAGE_FORMATS.JPEG;
      }
    } catch (error) {
      console.error('Error detecting format from magic bytes:', error);
    }
  }

  return IMAGE_FORMATS.UNKNOWN;
}

/**
 * Load metadata from an image
 *
 * @param {string} base64Data - Base64 encoded image
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @returns {Promise<Object>} Organized metadata by sections
 */
export async function loadMetadata(base64Data, format) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return await loadExifData(base64Data);

    case IMAGE_FORMATS.PNG:
      return await loadPngMetadata(base64Data);

    default:
      throw new Error(`Unsupported image format: ${format}`);
  }
}

/**
 * Edit a metadata field
 *
 * @param {string} base64Data - Base64 encoded image
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @param {Object} field - Field to edit
 * @param {*} newValue - New value for the field
 * @returns {Promise<string>} Updated base64 image (without data URI prefix)
 */
export async function editMetadataField(base64Data, format, field, newValue) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return await editJpegField(base64Data, field, newValue);

    case IMAGE_FORMATS.PNG:
      return await editPngMetadataField(base64Data, field, newValue);

    default:
      throw new Error(`Unsupported image format: ${format}`);
  }
}

/**
 * Remove a metadata field
 *
 * @param {string} base64Data - Base64 encoded image
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @param {Object} field - Field to remove
 * @returns {Promise<string>} Updated base64 image (without data URI prefix)
 */
export async function removeMetadataField(base64Data, format, field) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return await removeJpegField(base64Data, field);

    case IMAGE_FORMATS.PNG:
      return await removePngMetadataField(base64Data, field);

    default:
      throw new Error(`Unsupported image format: ${format}`);
  }
}

/**
 * Remove all metadata from an image
 *
 * @param {string} base64Data - Base64 encoded image
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @returns {Promise<string>} Cleaned base64 image (without data URI prefix)
 */
export async function removeAllMetadata(base64Data, format) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return await removeAllJpegMetadata(base64Data);

    case IMAGE_FORMATS.PNG:
      return await removeAllPngMetadata(base64Data);

    default:
      throw new Error(`Unsupported image format: ${format}`);
  }
}

/**
 * Add a custom metadata field
 *
 * @param {string} base64Data - Base64 encoded image
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @param {Object} customField - Custom field data
 * @returns {Promise<string>} Updated base64 image (without data URI prefix)
 */
export async function addCustomField(base64Data, format, customField) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return await addCustomJpegField(
        base64Data,
        customField.ifd,
        customField.tagId,
        customField.value,
        customField.type
      );

    case IMAGE_FORMATS.PNG:
      return await addCustomPngField(
        base64Data,
        customField.keyword,
        customField.value
      );

    default:
      throw new Error(`Unsupported image format: ${format}`);
  }
}

/**
 * Get metadata statistics
 *
 * @param {Object} metadata - Organized metadata
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @returns {Object} Statistics
 */
export function getMetadataStats(metadata, format) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return getJpegStats(metadata);

    case IMAGE_FORMATS.PNG:
      return getPngMetadataStats(metadata);

    default:
      return {
        totalFields: 0,
        populatedFields: 0,
        sections: 0
      };
  }
}

/**
 * Get file extension for download
 *
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @returns {string} File extension
 */
export function getFileExtension(format) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return 'jpg';
    case IMAGE_FORMATS.PNG:
      return 'png';
    default:
      return 'bin';
  }
}

/**
 * Get MIME type for format
 *
 * @param {string} format - Image format (from IMAGE_FORMATS)
 * @returns {string} MIME type
 */
export function getMimeType(format) {
  switch (format) {
    case IMAGE_FORMATS.JPEG:
      return 'image/jpeg';
    case IMAGE_FORMATS.PNG:
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}
