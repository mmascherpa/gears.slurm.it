/**
 * PNG Metadata Tags Definition
 *
 * PNG stores metadata in text chunks (tEXt, iTXt, zTXt) as key-value pairs
 * Standard keywords are defined in PNG spec, but custom keywords are allowed
 *
 * Reference: http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html#C.Anc-text
 */

import { ICONS } from '@/constants/icons'

/**
 * PNG Text Chunk Keywords
 * These are standardized keywords for PNG tEXt/iTXt chunks
 */
export const PNG_STANDARD_KEYWORDS = {
  // Image Description
  'Title': {
    label: 'Title',
    section: 'Description',
    icon: ICONS.TITLE,
    description: 'Short title or caption for the image',
    editable: true
  },
  'Author': {
    label: 'Author',
    section: 'Author',
    icon: ICONS.ACCOUNT,
    description: 'Name of image creator',
    editable: true
  },
  'Description': {
    label: 'Description',
    section: 'Description',
    icon: ICONS.FILE_TEXT,
    description: 'Longer description of image',
    editable: true
  },
  'Copyright': {
    label: 'Copyright',
    section: 'Author',
    icon: ICONS.COPYRIGHT,
    description: 'Copyright notice',
    editable: true
  },

  // Creation Info
  'Creation Time': {
    label: 'Creation Time',
    section: 'Timestamps',
    icon: ICONS.CLOCK,
    description: 'Time of original image creation',
    editable: true,
    editWarning: 'Should be in RFC 1123 format (e.g., "21 Jan 2025 15:30:00 +0000")'
  },

  // Software
  'Software': {
    label: 'Software',
    section: 'Technical',
    icon: ICONS.FILE_CODE,
    description: 'Software used to create the image',
    editable: true
  },

  // Disclaimer
  'Disclaimer': {
    label: 'Disclaimer',
    section: 'Author',
    icon: ICONS.ALERT_CIRCLE,
    description: 'Legal disclaimer',
    editable: true
  },

  // Warning
  'Warning': {
    label: 'Warning',
    section: 'Technical',
    icon: ICONS.ALERT,
    description: 'Warning of nature of content',
    editable: true
  },

  // Source
  'Source': {
    label: 'Source',
    section: 'Technical',
    icon: ICONS.SOURCE,
    description: 'Device used to create the image',
    editable: true
  },

  // Comment
  'Comment': {
    label: 'Comment',
    section: 'Description',
    icon: ICONS.COMMENT,
    description: 'Miscellaneous comment',
    editable: true
  },

  // XMP Metadata
  'XML:com.adobe.xmp': {
    label: 'XMP Metadata',
    section: 'Hidden',
    icon: ICONS.FILE_TYPE,
    description: 'Adobe XMP metadata (XML format)',
    editable: false,
    editWarning: 'XMP metadata is complex XML data and should not be manually edited'
  }
};

/**
 * PNG metadata sections for organizing fields in the UI
 */
export const PNG_SECTIONS = {
  Description: {
    name: 'Description',
    icon: ICONS.FILE_TEXT,
    color: 'primary',
    description: 'Image title, description, and comments'
  },
  Author: {
    name: 'Author & Copyright',
    icon: ICONS.ACCOUNT,
    color: 'secondary',
    description: 'Author, copyright, and disclaimer information'
  },
  Timestamps: {
    name: 'Timestamps',
    icon: ICONS.CLOCK,
    color: 'info',
    description: 'Creation time and modification dates'
  },
  Technical: {
    name: 'Technical',
    icon: ICONS.SETTINGS,
    color: 'grey',
    description: 'Software, source device, and technical details'
  },
  Hidden: {
    name: 'Hidden/Advanced',
    icon: ICONS.EYE_OFF,
    color: 'warning',
    description: 'XMP metadata and advanced fields'
  },
  Custom: {
    name: 'Custom Fields',
    icon: ICONS.PLUS_CIRCLE,
    color: 'success',
    description: 'User-defined custom metadata fields'
  }
};

/**
 * Get tag definition for a PNG keyword
 */
export function getPngTagDefinition(keyword) {
  return PNG_STANDARD_KEYWORDS[keyword] || {
    label: keyword,
    section: 'Custom',
    icon: ICONS.TAG,
    description: 'Custom PNG text chunk',
    editable: true
  };
}

/**
 * Validate PNG keyword
 * Keywords must be Latin-1 characters, 1-79 characters long
 */
export function validatePngKeyword(keyword) {
  if (!keyword || keyword.length === 0) {
    return { valid: false, error: 'Keyword cannot be empty' };
  }

  if (keyword.length > 79) {
    return { valid: false, error: 'Keyword must be 79 characters or less' };
  }

  // Check for Latin-1 characters only (no null bytes)
  const latin1Regex = /^[\x20-\xFF]+$/;
  if (!latin1Regex.test(keyword)) {
    return { valid: false, error: 'Keyword must contain only Latin-1 printable characters' };
  }

  // Keywords should not have leading/trailing spaces
  if (keyword !== keyword.trim()) {
    return { valid: false, error: 'Keyword should not have leading or trailing spaces' };
  }

  return { valid: true };
}

/**
 * Validate PNG text value
 */
export function validatePngValue(value) {
  // Values can be any text, but should be valid UTF-8 for iTXt chunks
  // For tEXt chunks, only Latin-1 is allowed
  if (value === null || value === undefined) {
    return { valid: true }; // Empty values are allowed
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Value must be a string' };
  }

  return { valid: true };
}
