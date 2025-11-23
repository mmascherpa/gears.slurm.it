/**
 * EXIF Tag Definitions
 * Maps piexifjs tag keys to human-readable labels with metadata
 */

/**
 * EXIF tag configuration with display metadata
 * @typedef {Object} ExifTagConfig
 * @property {string} label - Human-readable label
 * @property {string} section - Section category (Camera, Location, Timestamps, Author, Technical, Hidden)
 * @property {boolean} editable - Whether field can be edited
 * @property {string} type - Expected data type: 'string', 'number', 'rational', 'datetime', 'gps', 'array'
 * @property {boolean} [warning] - Whether field should trigger privacy warning
 * @property {boolean} [steganography] - Whether field can be used for hiding data
 * @property {string} [editWarning] - Warning message when editing this field
 */

/**
 * Comprehensive EXIF tag definitions
 * Key format: "IFD.TagName" (e.g., "0th.Make", "Exif.DateTimeOriginal", "GPS.GPSLatitude")
 */
export const EXIF_TAGS = {
  // ===== Camera Information =====
  '0th.271': { label: 'Camera Make', section: 'Camera', editable: true, type: 'string' },
  '0th.272': { label: 'Camera Model', section: 'Camera', editable: true, type: 'string' },
  'Exif.42033': { label: 'Serial Number', section: 'Camera', editable: true, type: 'string' },
  'Exif.42034': { label: 'Lens Make', section: 'Camera', editable: true, type: 'string' },
  'Exif.42035': { label: 'Lens Serial Number', section: 'Camera', editable: true, type: 'string' },
  'Exif.42036': { label: 'Lens Model', section: 'Camera', editable: true, type: 'string' },
  '0th.274': { label: 'Orientation', section: 'Camera', editable: true, type: 'number', editWarning: 'Changing orientation may not rotate the image visually. Use image editing software for rotation.' },
  '0th.282': { label: 'X Resolution', section: 'Camera', editable: true, type: 'rational', editWarning: 'Changing resolution metadata does not resize the image. Only metadata will be updated.' },
  '0th.283': { label: 'Y Resolution', section: 'Camera', editable: true, type: 'rational', editWarning: 'Changing resolution metadata does not resize the image. Only metadata will be updated.' },
  '0th.296': { label: 'Resolution Unit', section: 'Camera', editable: true, type: 'number' },

  // ===== Location (GPS) =====
  'GPS.0': { label: 'GPS Version ID', section: 'Location', editable: true, type: 'array' },
  'GPS.1': { label: 'GPS Latitude Ref', section: 'Location', editable: true, type: 'string' },
  'GPS.2': { label: 'GPS Latitude', section: 'Location', editable: true, type: 'gps' },
  'GPS.3': { label: 'GPS Longitude Ref', section: 'Location', editable: true, type: 'string' },
  'GPS.4': { label: 'GPS Longitude', section: 'Location', editable: true, type: 'gps' },
  'GPS.5': { label: 'GPS Altitude Ref', section: 'Location', editable: true, type: 'number' },
  'GPS.6': { label: 'GPS Altitude', section: 'Location', editable: true, type: 'rational' },
  'GPS.7': { label: 'GPS Timestamp', section: 'Location', editable: true, type: 'array' },
  'GPS.8': { label: 'GPS Satellites', section: 'Location', editable: true, type: 'string' },
  'GPS.9': { label: 'GPS Status', section: 'Location', editable: true, type: 'string' },
  'GPS.10': { label: 'GPS Measure Mode', section: 'Location', editable: true, type: 'string' },
  'GPS.11': { label: 'GPS DOP', section: 'Location', editable: true, type: 'rational' },
  'GPS.12': { label: 'GPS Speed Ref', section: 'Location', editable: true, type: 'string' },
  'GPS.13': { label: 'GPS Speed', section: 'Location', editable: true, type: 'rational' },
  'GPS.14': { label: 'GPS Track Ref', section: 'Location', editable: true, type: 'string' },
  'GPS.15': { label: 'GPS Track', section: 'Location', editable: true, type: 'rational' },
  'GPS.16': { label: 'GPS Image Direction Ref', section: 'Location', editable: true, type: 'string' },
  'GPS.17': { label: 'GPS Image Direction', section: 'Location', editable: true, type: 'rational' },
  'GPS.18': { label: 'GPS Map Datum', section: 'Location', editable: true, type: 'string' },
  'GPS.29': { label: 'GPS Date', section: 'Location', editable: true, type: 'string' },

  // ===== Timestamps =====
  'Exif.36867': { label: 'Date Taken (Original)', section: 'Timestamps', editable: true, type: 'datetime' },
  'Exif.36868': { label: 'Date Digitized', section: 'Timestamps', editable: true, type: 'datetime' },
  '0th.306': { label: 'Date Modified', section: 'Timestamps', editable: true, type: 'datetime' },
  'Exif.37520': { label: 'Subsec Time', section: 'Timestamps', editable: true, type: 'string' },
  'Exif.37521': { label: 'Subsec Time Original', section: 'Timestamps', editable: true, type: 'string' },
  'Exif.37522': { label: 'Subsec Time Digitized', section: 'Timestamps', editable: true, type: 'string' },

  // ===== Author & Copyright =====
  '0th.315': { label: 'Author', section: 'Author', editable: true, type: 'string' },
  '0th.33432': { label: 'Copyright', section: 'Author', editable: true, type: 'string' },

  // ===== Technical Details (camera settings recorded at capture) =====
  'Exif.34855': { label: 'ISO Speed', section: 'Technical', editable: true, type: 'number', editWarning: 'This reflects the actual ISO used when the photo was taken. Editing creates incorrect metadata.' },
  'Exif.34856': { label: 'ISO Speed Ratings', section: 'Technical', editable: true, type: 'number', editWarning: 'This reflects the actual ISO used. Editing creates incorrect metadata.' },
  'Exif.33434': { label: 'Exposure Time', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual shutter speed used. Editing creates incorrect technical metadata.' },
  'Exif.33437': { label: 'F-Number', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual aperture used. Editing creates incorrect technical metadata.' },
  'Exif.37377': { label: 'Shutter Speed', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual shutter speed used. Editing creates incorrect technical metadata.' },
  'Exif.37378': { label: 'Aperture', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual aperture used. Editing creates incorrect technical metadata.' },
  'Exif.37379': { label: 'Brightness Value', section: 'Technical', editable: true, type: 'rational' },
  'Exif.37380': { label: 'Exposure Bias', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual exposure compensation used. Editing creates incorrect metadata.' },
  'Exif.37381': { label: 'Max Aperture Value', section: 'Technical', editable: true, type: 'rational' },
  'Exif.37382': { label: 'Subject Distance', section: 'Technical', editable: true, type: 'rational' },
  'Exif.37383': { label: 'Metering Mode', section: 'Technical', editable: true, type: 'number', editWarning: 'This reflects the actual metering mode used. Editing creates incorrect technical metadata.' },
  'Exif.37384': { label: 'Light Source', section: 'Technical', editable: true, type: 'number' },
  'Exif.37385': { label: 'Flash', section: 'Technical', editable: true, type: 'number', editWarning: 'This reflects whether flash was actually used. Editing creates incorrect metadata.' },
  'Exif.37386': { label: 'Focal Length', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual focal length used. Editing creates incorrect technical metadata.' },
  'Exif.41486': { label: 'Focal Length (35mm)', section: 'Technical', editable: true, type: 'number', editWarning: 'This is the calculated 35mm equivalent. Editing creates incorrect metadata.' },
  'Exif.41989': { label: 'Focal Length in 35mm Film', section: 'Technical', editable: true, type: 'number', editWarning: 'This is the calculated 35mm equivalent. Editing creates incorrect metadata.' },
  'Exif.40962': { label: 'Image Width', section: 'Technical', editable: true, type: 'number', editWarning: 'Changing this does NOT resize the image. Incorrect values may cause display issues.' },
  'Exif.40963': { label: 'Image Height', section: 'Technical', editable: true, type: 'number', editWarning: 'Changing this does NOT resize the image. Incorrect values may cause display issues.' },
  '0th.256': { label: 'Image Width', section: 'Technical', editable: true, type: 'number', editWarning: 'Changing this does NOT resize the image. Incorrect values may cause display issues.' },
  '0th.257': { label: 'Image Height', section: 'Technical', editable: true, type: 'number', editWarning: 'Changing this does NOT resize the image. Incorrect values may cause display issues.' },
  'Exif.34850': { label: 'Exposure Program', section: 'Technical', editable: true, type: 'number' },
  'Exif.37396': { label: 'Subject Area', section: 'Technical', editable: true, type: 'array' },
  'Exif.41483': { label: 'Flash Energy', section: 'Technical', editable: true, type: 'rational' },
  'Exif.41495': { label: 'Sensing Method', section: 'Technical', editable: true, type: 'number' },
  'Exif.41728': { label: 'File Source', section: 'Technical', editable: true, type: 'number' },
  'Exif.41729': { label: 'Scene Type', section: 'Technical', editable: true, type: 'number' },
  'Exif.41985': { label: 'Custom Rendered', section: 'Technical', editable: true, type: 'number' },
  'Exif.41986': { label: 'Exposure Mode', section: 'Technical', editable: true, type: 'number' },
  'Exif.41987': { label: 'White Balance', section: 'Technical', editable: true, type: 'number', editWarning: 'This reflects the actual white balance used. Editing creates incorrect metadata.' },
  'Exif.41988': { label: 'Digital Zoom Ratio', section: 'Technical', editable: true, type: 'rational', editWarning: 'This reflects the actual digital zoom used. Editing creates incorrect metadata.' },
  'Exif.41990': { label: 'Scene Capture Type', section: 'Technical', editable: true, type: 'number' },
  'Exif.41991': { label: 'Gain Control', section: 'Technical', editable: true, type: 'number' },
  'Exif.41992': { label: 'Contrast', section: 'Technical', editable: true, type: 'number' },
  'Exif.41993': { label: 'Saturation', section: 'Technical', editable: true, type: 'number' },
  'Exif.41994': { label: 'Sharpness', section: 'Technical', editable: true, type: 'number' },
  'Exif.41996': { label: 'Subject Distance Range', section: 'Technical', editable: true, type: 'number' },
  'Exif.42240': { label: 'Gamma', section: 'Technical', editable: true, type: 'rational' },

  // ===== Software & Processing =====
  '0th.305': { label: 'Software', section: 'Technical', editable: true, type: 'string' },
  'Exif.40960': { label: 'EXIF Version', section: 'Technical', editable: true, type: 'string' },
  'Exif.40961': { label: 'Color Space', section: 'Technical', editable: true, type: 'number' },
  '0th.258': { label: 'Bits Per Sample', section: 'Technical', editable: true, type: 'array' },
  '0th.259': { label: 'Compression', section: 'Technical', editable: true, type: 'number' },
  '0th.262': { label: 'Photometric Interpretation', section: 'Technical', editable: true, type: 'number' },
  '0th.277': { label: 'Samples Per Pixel', section: 'Technical', editable: true, type: 'number' },
  '0th.284': { label: 'Planar Configuration', section: 'Technical', editable: true, type: 'number' },
  '0th.530': { label: 'YCbCr SubSampling', section: 'Technical', editable: true, type: 'array' },
  '0th.531': { label: 'YCbCr Positioning', section: 'Technical', editable: true, type: 'number' },

  // ===== Steganography Fields (for hiding data) =====
  'Exif.37510': { label: 'User Comment', section: 'Hidden', steganography: true, editable: true, type: 'string' },
  '0th.270': { label: 'Image Description', section: 'Hidden', steganography: true, editable: true, type: 'string' },
  'Exif.42016': { label: 'Image Unique ID', section: 'Hidden', editable: true, type: 'string' }
};

/**
 * Section metadata for organizing EXIF display
 */
export const EXIF_SECTIONS = {
  Camera: {
    name: 'Camera Information',
    icon: 'mdi-camera',
    color: 'primary',
    description: 'Camera make, model, and lens information'
  },
  Location: {
    name: 'Location (GPS)',
    icon: 'mdi-map-marker',
    color: 'info',
    description: 'GPS coordinates and location data'
  },
  Timestamps: {
    name: 'Timestamps',
    icon: 'mdi-clock',
    color: 'info',
    description: 'When the photo was taken and modified'
  },
  Author: {
    name: 'Copyright & Author',
    icon: 'mdi-copyright',
    color: 'secondary',
    description: 'Copyright and authorship information'
  },
  Technical: {
    name: 'Technical Details',
    icon: 'mdi-cog',
    color: 'grey',
    description: 'Camera settings and image properties'
  },
  Hidden: {
    name: 'Hidden Data',
    icon: 'mdi-incognito',
    color: 'warning',
    description: 'User comments and custom fields'
  }
};

/**
 * Get tag configuration by IFD and tag ID
 * @param {string} ifd - IFD name (e.g., "0th", "Exif", "GPS")
 * @param {number} tagId - Tag ID number
 * @returns {ExifTagConfig|null} Tag configuration or null if not found
 */
export function getTagConfig(ifd, tagId) {
  const key = `${ifd}.${tagId}`;
  return EXIF_TAGS[key] || null;
}

/**
 * Get all tags for a specific section
 * @param {string} section - Section name (e.g., "Camera", "Location")
 * @returns {Object[]} Array of tag configurations
 */
export function getTagsBySection(section) {
  return Object.entries(EXIF_TAGS)
    .filter(([_, config]) => config.section === section)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Get all privacy-sensitive tags (GPS, etc.)
 * @returns {Object[]} Array of privacy-sensitive tag configurations
 */
export function getPrivacyTags() {
  return Object.entries(EXIF_TAGS)
    .filter(([_, config]) => config.warning === true)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Get all steganography-capable tags
 * @returns {Object[]} Array of steganography tag configurations
 */
export function getSteganographyTags() {
  return Object.entries(EXIF_TAGS)
    .filter(([_, config]) => config.steganography === true)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Check if an IFD/tag combination is privacy-sensitive
 * @param {string} ifd - IFD name
 * @param {number} tagId - Tag ID
 * @returns {boolean} True if tag contains privacy-sensitive data
 */
export function isPrivacyTag(ifd, tagId) {
  const config = getTagConfig(ifd, tagId);
  return config?.warning === true;
}

/**
 * Get all available tags (populated and unpopulated)
 * @returns {Array} Array of all tag configurations
 */
export function getAllAvailableTags() {
  return Object.entries(EXIF_TAGS).map(([key, config]) => {
    const [ifd, tagId] = key.split('.');
    return {
      key,
      ifd,
      tagId: parseInt(tagId),
      ...config
    };
  });
}

/**
 * Get all available tags by section
 * @returns {Object} Object with section names as keys and arrays of tags as values
 */
export function getAllTagsBySection() {
  const sections = {};

  // Initialize sections
  Object.keys(EXIF_SECTIONS).forEach(sectionKey => {
    sections[sectionKey] = [];
  });

  // Group tags by section
  getAllAvailableTags().forEach(tag => {
    if (sections[tag.section]) {
      sections[tag.section].push(tag);
    }
  });

  return sections;
}

/**
 * Validate value type against expected EXIF tag type
 * @param {any} value - Value to validate
 * @param {string} expectedType - Expected type (string, number, rational, datetime, gps, array)
 * @returns {Object} { valid: boolean, warning: string|null }
 */
export function validateValueType(value, expectedType) {
  if (!expectedType) {
    return { valid: true, warning: null };
  }

  const stringValue = String(value).trim();

  switch (expectedType) {
    case 'string':
      return { valid: true, warning: null };

    case 'number':
      if (isNaN(Number(stringValue))) {
        return {
          valid: false,
          warning: `Expected a number, but got "${stringValue}". This may cause errors.`
        };
      }
      return { valid: true, warning: null };

    case 'rational':
      // Check for fraction format (e.g., "1/125") or decimal
      if (stringValue.includes('/')) {
        const parts = stringValue.split('/');
        if (parts.length !== 2 || isNaN(Number(parts[0])) || isNaN(Number(parts[1]))) {
          return {
            valid: false,
            warning: `Expected a fraction like "1/125" or decimal number, but got "${stringValue}".`
          };
        }
      } else if (isNaN(Number(stringValue))) {
        return {
          valid: false,
          warning: `Expected a number or fraction (e.g., "1/125"), but got "${stringValue}".`
        };
      }
      return { valid: true, warning: null };

    case 'datetime':
      // EXIF datetime format: YYYY:MM:DD HH:MM:SS
      const dateTimePattern = /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!dateTimePattern.test(stringValue)) {
        return {
          valid: false,
          warning: `Expected datetime format "YYYY:MM:DD HH:MM:SS", but got "${stringValue}".`
        };
      }
      return { valid: true, warning: null };

    case 'gps':
      // GPS coordinates can be decimal degrees or DMS format
      const decimal = parseFloat(stringValue);
      if (isNaN(decimal)) {
        return {
          valid: false,
          warning: `Expected GPS coordinate as decimal degrees (e.g., "37.7749"), but got "${stringValue}".`
        };
      }
      if (decimal < -180 || decimal > 180) {
        return {
          valid: false,
          warning: `GPS coordinate "${stringValue}" is out of range (-180 to 180).`
        };
      }
      return { valid: true, warning: null };

    case 'array':
      return {
        valid: true,
        warning: 'Array values are complex. Ensure format matches the original value structure.'
      };

    default:
      return { valid: true, warning: null };
  }
}

/**
 * Format tag value for display
 * @param {any} value - Raw EXIF tag value
 * @param {string} ifd - IFD name
 * @param {number} tagId - Tag ID
 * @returns {string} Formatted value for display
 */
export function formatTagValue(value, ifd, tagId) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // GPS coordinates (arrays of [degrees, minutes, seconds])
    if (ifd === 'GPS' && (tagId === 2 || tagId === 4)) {
      try {
        const [deg, min, sec] = value;

        // GPS coordinates are often stored as rational numbers: [[degrees, 1], [minutes, 1], [seconds, 1]]
        // Extract the actual numeric values
        const degValue = Array.isArray(deg) ? deg[0] / (deg[1] || 1) : deg;
        const minValue = Array.isArray(min) ? min[0] / (min[1] || 1) : min;
        const secValue = Array.isArray(sec) ? sec[0] / (sec[1] || 1) : sec;

        // Validate numeric values (check for NaN as well)
        if (typeof degValue !== 'number' || typeof minValue !== 'number' || typeof secValue !== 'number' ||
            isNaN(degValue) || isNaN(minValue) || isNaN(secValue)) {
          return value.join(', '); // Fallback to array display
        }

        // Calculate decimal degrees
        const decimal = degValue + minValue / 60 + secValue / 3600;
        return `${decimal.toFixed(6)}°`;
      } catch (error) {
        // Fallback if coordinate parsing fails
        return value.join(', ');
      }
    }

    // GPS altitude (array with [altitude, 1])
    if (ifd === 'GPS' && tagId === 6) {
      if (Array.isArray(value) && value.length >= 1) {
        const altitude = Array.isArray(value[0]) ? value[0][0] / (value[0][1] || 1) : value[0];
        return `${altitude} m`;
      }
      return value.join(', ');
    }

    // Exposure time (array like [1, 125] for 1/125s)
    if (ifd === 'Exif' && tagId === 33434) {
      if (Array.isArray(value) && value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
        return value[1] ? `1/${value[1]} s` : `${value[0]} s`;
      }
      return value.join(', ');
    }

    // F-Number (array like [28, 10] for f/2.8)
    if (ifd === 'Exif' && tagId === 33437) {
      if (Array.isArray(value) && value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number' && value[1] !== 0) {
        const fNumber = value[0] / value[1];
        return `f/${fNumber.toFixed(1)}`;
      }
      return value.join(', ');
    }

    // Default array formatting
    return value.join(', ');
  }

  // Handle binary data
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    try {
      return decoder.decode(value);
    } catch {
      return '[Binary Data]';
    }
  }

  // Handle strings
  if (typeof value === 'string') {
    return value.trim();
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value.toString();
  }

  // Default
  return String(value);
}
