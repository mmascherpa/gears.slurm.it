/**
 * Password Vault Import Utilities
 * Handles parsing and normalizing password data from CSV and JSON formats
 */

/**
 * Parse CSV text with proper handling of quoted fields
 * Handles commas, quotes, and newlines within quoted fields
 *
 * @param {string} text - CSV text content
 * @returns {Array<Object>} Array of parsed row objects
 */
export function parsePasswordCSV(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  // Parse character by character to handle quoted fields correctly
  // This phase only splits lines - it keeps quotes intact for the row parser
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote within quoted field - add both to preserve for row parser
        currentLine += '""';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        currentLine += char;
      }
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      // End of line (not within quotes)
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      if (char === '\r') i++; // Skip \n in \r\n
    } else if (char === '\r' && !inQuotes) {
      // Handle standalone \r
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  // Don't forget the last line
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return [];
  }

  // Parse header row
  const headers = parseCSVRow(lines[0]);

  // Parse data rows
  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const entry = {};

    headers.forEach((header, index) => {
      entry[header.toLowerCase().trim()] = values[index] || '';
    });

    entries.push(normalizeEntry(entry));
  }

  return entries;
}

/**
 * Parse a single CSV row into an array of values
 * @param {string} row - CSV row string
 * @returns {Array<string>} Array of field values
 */
function parseCSVRow(row) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (!inQuotes) {
        // Starting a quoted field
        inQuotes = true;
      } else if (nextChar === '"') {
        // Escaped quote (doubled) - add one quote to output
        current += '"';
        i++; // Skip the next quote
      } else {
        // Ending the quoted field
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Parse JSON text into password entries
 * @param {string} text - JSON text content
 * @returns {Array<Object>} Array of normalized entries
 */
export function parsePasswordJSON(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  try {
    const data = JSON.parse(text);

    // Handle array format
    if (Array.isArray(data)) {
      return data.map(item => normalizeEntry(item));
    }

    // Handle object with entries array (vault format)
    if (data.entries && Array.isArray(data.entries)) {
      return data.entries.map(item => normalizeEntry(item));
    }

    // Handle object with items array (some formats)
    if (data.items && Array.isArray(data.items)) {
      return data.items.map(item => normalizeEntry(item));
    }

    return [];
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return [];
  }
}

/**
 * Normalize an entry from various formats to our standard schema
 * @param {Object} raw - Raw entry object
 * @returns {Object} Normalized entry
 */
export function normalizeEntry(raw) {
  // Map common field name variations
  const fieldMappings = {
    name: ['name', 'title', 'site', 'service', 'label', 'website'],
    username: ['username', 'user', 'login', 'account', 'user_name', 'loginname'],
    email: ['email', 'mail', 'e-mail', 'email_address'],
    url: ['url', 'uri', 'website', 'site_url', 'login_url', 'link'],
    password: ['password', 'pass', 'pwd', 'secret'],
    totp: ['totp', 'otp', 'totp_secret', '2fa', 'mfa', 'authenticator'],
    note: ['note', 'notes', 'comment', 'comments', 'memo', 'description'],
    createdAt: ['created_at', 'createdat', 'created', 'date_created', 'creation_date'],
    updatedAt: ['updated_at', 'updatedat', 'updated', 'modified', 'date_modified', 'modification_date']
  };

  const entry = {
    name: '',
    username: '',
    email: '',
    url: '',
    password: '',
    totp: '',
    note: '',
    createdAt: '',
    updatedAt: ''
  };

  // Normalize keys to lowercase
  const normalizedRaw = {};
  Object.keys(raw).forEach(key => {
    normalizedRaw[key.toLowerCase().replace(/[_-]/g, '')] = raw[key];
  });

  // Map fields using variations
  Object.keys(fieldMappings).forEach(field => {
    const variations = fieldMappings[field];
    for (const variation of variations) {
      const normalizedVariation = variation.toLowerCase().replace(/[_-]/g, '');
      if (normalizedRaw[normalizedVariation] !== undefined) {
        entry[field] = String(normalizedRaw[normalizedVariation] || '');
        break;
      }
    }
  });

  // Also check original raw object keys
  Object.keys(raw).forEach(key => {
    const lowerKey = key.toLowerCase();
    Object.keys(fieldMappings).forEach(field => {
      if (fieldMappings[field].includes(lowerKey) && !entry[field]) {
        entry[field] = String(raw[key] || '');
      }
    });
  });

  return entry;
}

/**
 * Detect the format of a file based on filename and content
 * @param {string} filename - File name
 * @param {Uint8Array|string} content - File content
 * @returns {Object} { format: string, isEncrypted: boolean, algorithm: string|null }
 */
export function detectFileFormat(filename, content) {
  const lowerName = filename.toLowerCase();

  // Check for encrypted files
  if (lowerName.endsWith('.aes')) {
    return { format: 'unknown', isEncrypted: true, algorithm: 'jsAesCrypt' };
  }
  if (lowerName.endsWith('.enc')) {
    return { format: 'unknown', isEncrypted: true, algorithm: 'webCrypto' };
  }
  if (lowerName.endsWith('.age')) {
    return { format: 'unknown', isEncrypted: true, algorithm: 'age' };
  }

  // Get text content for format detection
  let text = content;
  if (content instanceof Uint8Array) {
    text = new TextDecoder().decode(content);
  }

  // Try to detect JSON
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return { format: 'json', isEncrypted: false, algorithm: null };
    } catch {
      // Not valid JSON
    }
  }

  // Assume CSV
  return { format: 'csv', isEncrypted: false, algorithm: null };
}

/**
 * Find duplicate entries between existing and new entries
 * @param {Array} existingEntries - Current vault entries
 * @param {Array} newEntries - Entries to import
 * @returns {Array} Array of { existing, new, key } objects for duplicates
 */
export function findDuplicates(existingEntries, newEntries) {
  const existingByKey = new Map();

  existingEntries.forEach(entry => {
    const key = `${entry.name.toLowerCase()}|${entry.username.toLowerCase()}`;
    existingByKey.set(key, entry);
  });

  const duplicates = [];

  newEntries.forEach(entry => {
    const key = `${entry.name.toLowerCase()}|${entry.username.toLowerCase()}`;
    const existing = existingByKey.get(key);

    if (existing) {
      duplicates.push({
        existing,
        new: entry,
        key
      });
    }
  });

  return duplicates;
}

/**
 * Parse file content based on detected format
 * @param {string} content - Text content (already decrypted if needed)
 * @param {string} format - 'csv' or 'json'
 * @returns {Array} Parsed entries
 */
export function parseFileContent(content, format) {
  if (format === 'json') {
    return parsePasswordJSON(content);
  }
  return parsePasswordCSV(content);
}
