/**
 * EXIF Metadata Editor Utility
 * Wrapper around piexifjs for reading, editing, and removing EXIF data
 */

import piexif from 'piexifjs';
import { getTagConfig, formatTagValue, EXIF_SECTIONS, getAllTagsBySection } from './exifTags.js';

/**
 * Load EXIF data from a Base64-encoded image
 * @param {string} base64Data - Base64-encoded image data (with or without data URL prefix)
 * @returns {Promise<Object>} Organized metadata by sections
 * @throws {Error} If EXIF data cannot be loaded
 */
export async function loadExifData(base64Data) {
  try {
    // Strip data URL prefix if present (data:image/jpeg;base64,...)
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data using piexifjs
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Organize metadata by sections
    const organized = organizeMetadata(exifObj);

    return organized;
  } catch (error) {
    // Provide user-friendly error messages
    if (error.message && error.message.includes('not a valid JPEG')) {
      throw new Error('Image does not contain EXIF data or is not a valid JPEG');
    }
    throw new Error(`Failed to load EXIF data: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Organize raw EXIF data into sections for display
 * Shows ALL available tags, marking populated ones with values
 * @param {Object} exifObj - Raw EXIF object from piexifjs
 * @param {boolean} showAllFields - If true, show all available fields (default: true)
 * @returns {Object} Organized metadata structure
 */
function organizeMetadata(exifObj, showAllFields = true) {
  const organized = {};

  // Initialize all sections
  Object.keys(EXIF_SECTIONS).forEach(sectionKey => {
    organized[sectionKey] = {
      name: EXIF_SECTIONS[sectionKey].name,
      icon: EXIF_SECTIONS[sectionKey].icon,
      color: EXIF_SECTIONS[sectionKey].color,
      description: EXIF_SECTIONS[sectionKey].description,
      warning: EXIF_SECTIONS[sectionKey].warning || false,
      fields: []
    };
  });

  if (showAllFields) {
    // Get all available tags grouped by section
    const allTagsBySection = getAllTagsBySection();

    // Add all available tags to each section
    Object.entries(allTagsBySection).forEach(([sectionKey, tags]) => {
      if (organized[sectionKey]) {
        tags.forEach(tag => {
          // Check if this tag has a value in the current image
          let value = null;
          let rawValue = null;
          let isPopulated = false;

          if (exifObj[tag.ifd] && exifObj[tag.ifd][tag.tagId] !== undefined && exifObj[tag.ifd][tag.tagId] !== null) {
            rawValue = exifObj[tag.ifd][tag.tagId];
            value = formatTagValue(rawValue, tag.ifd, tag.tagId);
            isPopulated = true;
          }

          organized[sectionKey].fields.push({
            label: tag.label,
            key: tag.key,
            ifd: tag.ifd,
            tagId: tag.tagId,
            value: value || '',
            rawValue: rawValue,
            editable: tag.editable,
            warning: tag.warning || false,
            editWarning: tag.editWarning || null,
            icon: tag.icon,
            type: tag.type,
            isPopulated: isPopulated
          });
        });
      }
    });
  } else {
    // Original behavior: only show populated fields
    for (const [ifd, tags] of Object.entries(exifObj)) {
      if (ifd === 'thumbnail' || typeof tags !== 'object' || tags === null) {
        continue;
      }

      for (const [tagId, value] of Object.entries(tags)) {
        if (value === null || value === undefined) {
          continue;
        }

        const tagConfig = getTagConfig(ifd, parseInt(tagId));

        if (tagConfig) {
          const section = organized[tagConfig.section];

          if (section) {
            section.fields.push({
              label: tagConfig.label,
              key: `${ifd}.${tagId}`,
              ifd,
              tagId: parseInt(tagId),
              value: formatTagValue(value, ifd, parseInt(tagId)),
              rawValue: value,
              editable: tagConfig.editable,
              warning: tagConfig.warning || false,
              editWarning: tagConfig.editWarning || null,
              icon: tagConfig.icon,
              type: tagConfig.type,
              isPopulated: true
            });
          }
        }
      }
    }
  }

  // Always return all sections (even if empty when showAllFields is true)
  return organized;
}

/**
 * Remove all EXIF metadata from an image
 * @param {string} base64Data - Base64-encoded image data
 * @returns {Promise<string>} Base64-encoded image without EXIF data
 * @throws {Error} If metadata cannot be removed
 */
export async function removeAllMetadata(base64Data) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Remove EXIF data
    const cleanData = piexif.remove('data:image/jpeg;base64,' + base64String);

    // Return clean Base64 string (without data URL prefix)
    return cleanData.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to remove metadata: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if image has GPS data
 * @param {Object} metadata - Organized metadata object
 * @returns {boolean} True if GPS data exists
 */
export function hasGPSData(metadata) {
  return metadata.Location && metadata.Location.fields.length > 0;
}

/**
 * Extract GPS coordinates from metadata
 * @param {Object} metadata - Organized metadata object
 * @returns {Object|null} GPS coordinates { lat, lon, altitude } or null
 */
export function extractGPSCoordinates(metadata) {
  if (!hasGPSData(metadata)) {
    return null;
  }

  const locationFields = metadata.Location.fields;

  const lat = locationFields.find(f => f.label.includes('Latitude') && !f.label.includes('Ref'))?.value;
  const lon = locationFields.find(f => f.label.includes('Longitude') && !f.label.includes('Ref'))?.value;
  const alt = locationFields.find(f => f.label.includes('Altitude') && !f.label.includes('Ref'))?.value;

  return {
    latitude: lat || 'N/A',
    longitude: lon || 'N/A',
    altitude: alt || 'N/A'
  };
}

/**
 * Remove GPS data only (preserve other metadata)
 * @param {string} base64Data - Base64-encoded image data
 * @returns {Promise<string>} Base64-encoded image without GPS data
 * @throws {Error} If GPS data cannot be removed
 */
export async function removeGPSOnly(base64Data) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Remove GPS IFD entirely
    delete exifObj.GPS;

    // Dump modified EXIF back to binary
    const exifBytes = piexif.dump(exifObj);

    // Insert modified EXIF into image
    const newImage = piexif.insert(exifBytes, 'data:image/jpeg;base64,' + base64String);

    // Return new Base64 string (without data URL prefix)
    return newImage.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to remove GPS data: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Count total metadata fields
 * @param {Object} metadata - Organized metadata object
 * @returns {number} Total number of fields
 */
export function countMetadataFields(metadata) {
  return Object.values(metadata).reduce((total, section) => total + section.fields.length, 0);
}

/**
 * Get metadata statistics
 * @param {Object} metadata - Organized metadata object
 * @returns {Object} Statistics about the metadata
 */
export function getMetadataStats(metadata) {
  const totalFields = countMetadataFields(metadata);
  const hasGPS = hasGPSData(metadata);
  const sections = Object.keys(metadata).length;

  const editableFields = Object.values(metadata).reduce(
    (total, section) => total + section.fields.filter(f => f.editable).length,
    0
  );

  const privacyFields = Object.values(metadata).reduce(
    (total, section) => total + section.fields.filter(f => f.warning).length,
    0
  );

  const populatedFields = Object.values(metadata).reduce(
    (total, section) => total + section.fields.filter(f => f.isPopulated).length,
    0
  );

  return {
    totalFields,
    populatedFields,
    sections,
    editableFields,
    privacyFields,
    hasGPS,
    hasCameraInfo: !!metadata.Camera,
    hasTimestamps: !!metadata.Timestamps,
    hasAuthorInfo: !!metadata.Author
  };
}

/**
 * Validate Base64 image data
 * @param {string} base64Data - Base64-encoded image data
 * @returns {Object} Validation result { valid, error, mimeType }
 */
export function validateImageData(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') {
    return { valid: false, error: 'Invalid image data', mimeType: null };
  }

  // Check for data URL prefix
  if (base64Data.startsWith('data:')) {
    const match = base64Data.match(/^data:([^;]+);base64,/);
    if (!match) {
      return { valid: false, error: 'Invalid data URL format', mimeType: null };
    }

    const mimeType = match[1];

    // Only JPEG is fully supported for editing
    if (!mimeType.includes('jpeg') && !mimeType.includes('jpg')) {
      return { valid: false, error: 'Only JPEG images are supported for EXIF editing', mimeType };
    }

    return { valid: true, error: null, mimeType };
  }

  // Assume valid Base64 if no prefix
  return { valid: true, error: null, mimeType: 'image/jpeg' };
}

/**
 * Convert File to Base64 data URL
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = (error) => {
      reject(new Error(`Failed to read file: ${error.message || 'Unknown error'}`));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert Base64 to Blob for download
 * @param {string} base64Data - Base64-encoded image data
 * @param {string} mimeType - MIME type (default: image/jpeg)
 * @returns {Blob} Blob object for download
 */
export function base64ToBlob(base64Data, mimeType = 'image/jpeg') {
  // Strip data URL prefix if present
  const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  // Convert to binary
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Edit a specific EXIF field
 * @param {string} base64Data - Base64-encoded image data
 * @param {Object} field - Field object with ifd, tagId, and rawValue
 * @param {string|number|Array} newValue - New value to set
 * @returns {Promise<string>} Base64-encoded image with modified EXIF data
 * @throws {Error} If field cannot be edited
 */
export async function editMetadataField(base64Data, field, newValue) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Convert the new value to the appropriate format
    const formattedValue = formatValueForTag(newValue, field.ifd, field.tagId, field.rawValue);

    // Update the field
    if (!exifObj[field.ifd]) {
      exifObj[field.ifd] = {};
    }
    exifObj[field.ifd][field.tagId] = formattedValue;

    // Dump modified EXIF back to binary
    const exifBytes = piexif.dump(exifObj);

    // Insert modified EXIF into image
    const newImage = piexif.insert(exifBytes, 'data:image/jpeg;base64,' + base64String);

    // Return new Base64 string (without data URL prefix)
    return newImage.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to edit metadata field: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Remove a specific EXIF field
 * @param {string} base64Data - Base64-encoded image data
 * @param {Object} field - Field object with ifd and tagId
 * @returns {Promise<string>} Base64-encoded image without the specified field
 * @throws {Error} If field cannot be removed
 */
export async function removeMetadataField(base64Data, field) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Remove the field
    if (exifObj[field.ifd] && exifObj[field.ifd][field.tagId]) {
      delete exifObj[field.ifd][field.tagId];
    }

    // Dump modified EXIF back to binary
    const exifBytes = piexif.dump(exifObj);

    // Insert modified EXIF into image
    const newImage = piexif.insert(exifBytes, 'data:image/jpeg;base64,' + base64String);

    // Return new Base64 string (without data URL prefix)
    return newImage.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to remove metadata field: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Format a user-provided value into the correct format for a specific EXIF tag
 * @param {string|number|Array} value - User-provided value
 * @param {string} ifd - IFD name
 * @param {number} tagId - Tag ID
 * @param {any} originalValue - Original raw value (for reference)
 * @returns {string|number|Array} Formatted value for piexifjs
 */
function formatValueForTag(value, ifd, tagId, originalValue) {
  // Handle string fields (most common)
  if (typeof originalValue === 'string') {
    return String(value);
  }

  // Handle numeric fields
  if (typeof originalValue === 'number') {
    return Number(value);
  }

  // Handle array fields (rationals, GPS coordinates, etc.)
  if (Array.isArray(originalValue)) {
    // For datetime fields in GPS
    if (ifd === 'GPS' && (tagId === 7 || tagId === 29)) {
      return value; // Keep as-is
    }

    // For exposure time, f-number (rational values)
    if (ifd === 'Exif' && (tagId === 33434 || tagId === 33437)) {
      // Try to parse fractional notation (e.g., "1/125")
      if (typeof value === 'string' && value.includes('/')) {
        const [num, den] = value.split('/').map(n => parseInt(n.trim()));
        return [num, den];
      }
      return originalValue; // Keep original format if can't parse
    }

    // GPS coordinates - complex parsing
    if (ifd === 'GPS' && (tagId === 2 || tagId === 4)) {
      // Try to parse decimal degrees (e.g., "37.7749")
      if (typeof value === 'string' || typeof value === 'number') {
        const decimal = parseFloat(value);
        if (!isNaN(decimal)) {
          const degrees = Math.floor(Math.abs(decimal));
          const minutes = Math.floor((Math.abs(decimal) - degrees) * 60);
          const seconds = ((Math.abs(decimal) - degrees - minutes / 60) * 3600);
          return [degrees, minutes, seconds];
        }
      }
      return originalValue; // Keep original if can't parse
    }

    // Default: keep original array format
    return originalValue;
  }

  // Default: convert to string
  return String(value);
}

/**
 * Apply multiple field edits at once
 * @param {string} base64Data - Base64-encoded image data
 * @param {Array} edits - Array of { field, newValue } objects
 * @returns {Promise<string>} Base64-encoded image with all modifications
 * @throws {Error} If batch edit fails
 */
export async function batchEditMetadata(base64Data, edits) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Apply all edits
    for (const { field, newValue } of edits) {
      const formattedValue = formatValueForTag(newValue, field.ifd, field.tagId, field.rawValue);

      if (!exifObj[field.ifd]) {
        exifObj[field.ifd] = {};
      }
      exifObj[field.ifd][field.tagId] = formattedValue;
    }

    // Dump modified EXIF back to binary
    const exifBytes = piexif.dump(exifObj);

    // Insert modified EXIF into image
    const newImage = piexif.insert(exifBytes, 'data:image/jpeg;base64,' + base64String);

    // Return new Base64 string (without data URL prefix)
    return newImage.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to batch edit metadata: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Remove all metadata field values (set all to empty/null)
 * This clears the metadata visually but keeps the structure
 * @param {string} base64Data - Base64-encoded image data
 * @returns {Promise<string>} Base64-encoded image with all metadata cleared
 * @throws {Error} If metadata cannot be cleared
 */
export async function clearAllMetadataValues(base64Data) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Clear all fields in each IFD
    const emptyExif = {
      '0th': {},
      'Exif': {},
      'GPS': {},
      '1st': {},
      'Interop': {}
    };

    // Dump empty EXIF
    const exifBytes = piexif.dump(emptyExif);

    // Insert empty EXIF into image
    const newImage = piexif.insert(exifBytes, 'data:image/jpeg;base64,' + base64String);

    // Return new Base64 string (without data URL prefix)
    return newImage.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to clear metadata: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Add a custom EXIF field to an image
 * @param {string} base64Data - Base64-encoded image data
 * @param {string} ifd - IFD name (e.g., "0th", "Exif", "GPS")
 * @param {number} tagId - Tag ID number
 * @param {string} value - Value to set
 * @param {string} type - Value type (string, number, rational, datetime, array)
 * @returns {Promise<string>} Base64-encoded image with custom field added
 * @throws {Error} If field cannot be added
 */
export async function addCustomField(base64Data, ifd, tagId, value, type) {
  try {
    // Strip data URL prefix if present
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Load EXIF data
    const exifObj = piexif.load('data:image/jpeg;base64,' + base64String);

    // Format value based on type
    let formattedValue;
    switch (type) {
      case 'number':
        formattedValue = parseInt(value);
        if (isNaN(formattedValue)) {
          throw new Error('Invalid number value');
        }
        break;

      case 'rational':
        if (value.includes('/')) {
          const [num, den] = value.split('/').map(n => parseInt(n.trim()));
          if (isNaN(num) || isNaN(den)) {
            throw new Error('Invalid rational value');
          }
          formattedValue = [num, den];
        } else {
          const decimal = parseFloat(value);
          if (isNaN(decimal)) {
            throw new Error('Invalid rational value');
          }
          // Convert decimal to rational (simple approximation)
          formattedValue = [Math.round(decimal * 100), 100];
        }
        break;

      case 'array':
        formattedValue = value.split(',').map(v => {
          const num = parseInt(v.trim());
          return isNaN(num) ? v.trim() : num;
        });
        break;

      case 'string':
      case 'datetime':
      default:
        formattedValue = String(value);
        break;
    }

    // Add the field
    if (!exifObj[ifd]) {
      exifObj[ifd] = {};
    }
    exifObj[ifd][tagId] = formattedValue;

    // Dump modified EXIF back to binary
    const exifBytes = piexif.dump(exifObj);

    // Insert modified EXIF into image
    const newImage = piexif.insert(exifBytes, 'data:image/jpeg;base64,' + base64String);

    // Return new Base64 string (without data URL prefix)
    return newImage.split(',')[1];
  } catch (error) {
    throw new Error(`Failed to add custom field: ${error.message || 'Unknown error'}`);
  }
}
