/**
 * PNG Metadata Editor Utilities
 *
 * Provides functions to read, edit, and remove PNG metadata (tEXt/iTXt chunks)
 * using exifr for reading and manual chunk manipulation for writing
 */

import exifr from 'exifr';
import { getPngTagDefinition, PNG_SECTIONS, PNG_STANDARD_KEYWORDS } from './pngTags.js';

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  // Strip any data URI prefix (handle both image/png and other variations)
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * PNG Chunk structure helpers
 */

// PNG signature
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

/**
 * Calculate CRC32 for PNG chunks
 */
function crc32(data) {
  // CRC32 lookup table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Read PNG chunks from ArrayBuffer
 */
function readPngChunks(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const chunks = [];

  // Verify PNG signature
  let offset = 0;
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(offset + i) !== PNG_SIGNATURE[i]) {
      throw new Error('Invalid PNG signature');
    }
  }
  offset = 8;

  // Read chunks
  while (offset < arrayBuffer.byteLength) {
    const length = view.getUint32(offset);
    offset += 4;

    const type = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    offset += 4;

    const data = new Uint8Array(arrayBuffer, offset, length);
    offset += length;

    const crc = view.getUint32(offset);
    offset += 4;

    chunks.push({ type, data: new Uint8Array(data), crc });

    // Stop at IEND
    if (type === 'IEND') {
      break;
    }
  }

  return chunks;
}

/**
 * Write PNG chunks to ArrayBuffer
 */
function writePngChunks(chunks) {
  // Calculate total size
  let totalSize = 8; // PNG signature
  for (const chunk of chunks) {
    totalSize += 4 + 4 + chunk.data.length + 4; // length + type + data + crc
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Write PNG signature
  let offset = 0;
  for (let i = 0; i < 8; i++) {
    view.setUint8(offset++, PNG_SIGNATURE[i]);
  }

  // Write chunks
  for (const chunk of chunks) {
    // Length
    view.setUint32(offset, chunk.data.length);
    offset += 4;

    // Type
    const typeBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      typeBytes[i] = chunk.type.charCodeAt(i);
      view.setUint8(offset++, typeBytes[i]);
    }

    // Data
    for (let i = 0; i < chunk.data.length; i++) {
      view.setUint8(offset++, chunk.data[i]);
    }

    // Calculate and write CRC
    const crcData = new Uint8Array(4 + chunk.data.length);
    crcData.set(typeBytes, 0);
    crcData.set(chunk.data, 4);
    const crcValue = crc32(crcData);
    view.setUint32(offset, crcValue);
    offset += 4;
  }

  return buffer;
}

/**
 * Create a tEXt chunk
 */
function createTextChunk(keyword, value) {
  const keywordBytes = new TextEncoder().encode(keyword);
  const valueBytes = new TextEncoder().encode(value);

  const data = new Uint8Array(keywordBytes.length + 1 + valueBytes.length);
  data.set(keywordBytes, 0);
  data[keywordBytes.length] = 0; // Null separator
  data.set(valueBytes, keywordBytes.length + 1);

  return {
    type: 'tEXt',
    data: data
  };
}

/**
 * Extract keyword from a text chunk
 */
function extractKeywordFromChunk(chunk) {
  if (!chunk.data || chunk.data.length === 0) return null;

  // Find null terminator
  let nullIndex = -1;
  for (let i = 0; i < chunk.data.length; i++) {
    if (chunk.data[i] === 0) {
      nullIndex = i;
      break;
    }
  }

  if (nullIndex < 0) return null;

  // Decode keyword
  const keywordBytes = chunk.data.slice(0, nullIndex);
  return new TextDecoder().decode(keywordBytes);
}

/**
 * Load PNG metadata from base64 image
 *
 * @param {string} base64Data - Base64 encoded PNG image
 * @returns {Promise<Object>} Organized metadata by sections
 */
export async function loadPngMetadata(base64Data) {
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Data);

    // Use exifr to extract all metadata including PNG text chunks
    const metadata = await exifr.parse(arrayBuffer, {
      tiff: false,
      exif: false,
      gps: false,
      iptc: false,
      icc: false,
      jfif: false,
      ihdr: true,
      png: true, // Enable PNG chunk parsing
    });

    if (!metadata) {
      // No metadata found, return empty structure
      return organizeMetadata({});
    }

    return organizeMetadata(metadata);
  } catch (error) {
    console.error('PNG metadata loading error:', error);
    throw new Error(`Failed to load PNG metadata: ${error.message}`);
  }
}

/**
 * Organize metadata into sections for UI display
 *
 * @param {Object} rawMetadata - Raw metadata from exifr
 * @returns {Object} Organized metadata by sections
 */
function organizeMetadata(rawMetadata) {
  const organized = {};

  // Initialize sections
  Object.keys(PNG_SECTIONS).forEach(sectionKey => {
    organized[sectionKey] = {
      ...PNG_SECTIONS[sectionKey],
      fields: []
    };
  });

  // Process each metadata field
  for (const [keyword, value] of Object.entries(rawMetadata)) {
    // Skip PNG image header data (IHDR fields) - check both lowercase and capitalized versions
    const skipFields = [
      'width', 'height', 'bitDepth', 'colorType', 'compressionMethod', 'filterMethod', 'interlaceMethod',
      'ImageWidth', 'ImageHeight', 'BitDepth', 'ColorType', 'Compression', 'Filter', 'Interlace'
    ];
    if (skipFields.includes(keyword)) {
      continue;
    }

    const tagDef = getPngTagDefinition(keyword);
    const sectionKey = tagDef.section || 'Custom';

    const isPopulated = value !== null && value !== undefined && value !== '';

    organized[sectionKey].fields.push({
      label: tagDef.label,
      key: keyword,
      value: value || '',
      editable: tagDef.editable,
      icon: tagDef.icon,
      description: tagDef.description,
      editWarning: tagDef.editWarning || null,
      isPopulated: isPopulated,
      rawValue: value
    });
  }

  // Add standard fields that might not be present
  Object.entries(PNG_STANDARD_KEYWORDS).forEach(([keyword, tagDef]) => {
    const sectionKey = tagDef.section;
    const existingField = organized[sectionKey]?.fields.find(f => f.key === keyword);

    if (!existingField) {
      organized[sectionKey].fields.push({
        label: tagDef.label,
        key: keyword,
        value: '',
        editable: tagDef.editable,
        icon: tagDef.icon,
        description: tagDef.description,
        editWarning: tagDef.editWarning || null,
        isPopulated: false,
        rawValue: null
      });
    }
  });

  // Remove empty sections
  Object.keys(organized).forEach(sectionKey => {
    if (organized[sectionKey].fields.length === 0) {
      delete organized[sectionKey];
    }
  });

  return organized;
}

/**
 * Get metadata statistics
 *
 * @param {Object} metadata - Organized metadata
 * @returns {Object} Statistics
 */
export function getPngMetadataStats(metadata) {
  if (!metadata) {
    return {
      totalFields: 0,
      populatedFields: 0,
      sections: 0
    };
  }

  const sections = Object.keys(metadata).length;
  let totalFields = 0;
  let populatedFields = 0;

  Object.values(metadata).forEach(section => {
    totalFields += section.fields.length;
    populatedFields += section.fields.filter(f => f.isPopulated).length;
  });

  return {
    totalFields,
    populatedFields,
    sections
  };
}

/**
 * Edit PNG metadata field
 *
 * @param {string} base64Data - Base64 encoded PNG image
 * @param {Object} field - Field to edit
 * @param {string} newValue - New value for the field
 * @returns {Promise<string>} Updated base64 image (without data URI prefix)
 */
export async function editPngMetadataField(base64Data, field, newValue) {
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const chunks = readPngChunks(arrayBuffer);

    // Find existing text chunk for this keyword
    let foundIndex = -1;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.type === 'tEXt' || chunk.type === 'iTXt' || chunk.type === 'zTXt') {
        const keyword = extractKeywordFromChunk(chunk);
        if (keyword === field.key) {
          foundIndex = i;
          break;
        }
      }
    }

    // Create new text chunk
    const newChunk = createTextChunk(field.key, newValue);

    if (foundIndex >= 0) {
      // Replace existing chunk
      chunks[foundIndex] = newChunk;
    } else {
      // Add new chunk before IEND
      const iendIndex = chunks.findIndex(c => c.type === 'IEND');
      if (iendIndex >= 0) {
        chunks.splice(iendIndex, 0, newChunk);
      } else {
        chunks.push(newChunk);
      }
    }

    // Write chunks back
    const modifiedBuffer = writePngChunks(chunks);

    // Verify the written PNG is valid by trying to read it back
    try {
      readPngChunks(modifiedBuffer);
    } catch (verifyError) {
      console.error('[editPngMetadataField] Verification failed! Written PNG is invalid:', verifyError);
      throw new Error(`Written PNG is invalid: ${verifyError.message}`);
    }

    return arrayBufferToBase64(modifiedBuffer);
  } catch (error) {
    console.error('PNG metadata edit error:', error);
    throw new Error(`Failed to edit PNG metadata: ${error.message}`);
  }
}

/**
 * Remove a PNG metadata field
 *
 * @param {string} base64Data - Base64 encoded PNG image
 * @param {Object} field - Field to remove
 * @returns {Promise<string>} Updated base64 image (without data URI prefix)
 */
export async function removePngMetadataField(base64Data, field) {
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const chunks = readPngChunks(arrayBuffer);

    // Filter out the chunk with this keyword
    const filteredChunks = chunks.filter(chunk => {
      if (chunk.type === 'tEXt' || chunk.type === 'iTXt' || chunk.type === 'zTXt') {
        const keyword = extractKeywordFromChunk(chunk);
        return keyword !== field.key;
      }
      return true;
    });

    // Write chunks back
    const modifiedBuffer = writePngChunks(filteredChunks);
    return arrayBufferToBase64(modifiedBuffer);
  } catch (error) {
    console.error('PNG metadata removal error:', error);
    throw new Error(`Failed to remove PNG metadata: ${error.message}`);
  }
}

/**
 * Remove all PNG text metadata
 *
 * @param {string} base64Data - Base64 encoded PNG image
 * @returns {Promise<string>} Cleaned base64 image (without data URI prefix)
 */
export async function removeAllPngMetadata(base64Data) {
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const chunks = readPngChunks(arrayBuffer);

    // Filter out all text chunks
    const filteredChunks = chunks.filter(chunk => {
      // Remove tEXt, iTXt, zTXt chunks (text metadata)
      // Also remove tIME (timestamp) for privacy
      return !['tEXt', 'iTXt', 'zTXt', 'tIME'].includes(chunk.type);
    });

    // Write chunks back
    const modifiedBuffer = writePngChunks(filteredChunks);
    return arrayBufferToBase64(modifiedBuffer);
  } catch (error) {
    console.error('PNG metadata removal error:', error);
    throw new Error(`Failed to remove all PNG metadata: ${error.message}`);
  }
}

/**
 * Add custom PNG metadata field
 *
 * @param {string} base64Data - Base64 encoded PNG image
 * @param {string} keyword - Keyword for the custom field
 * @param {string} value - Value for the custom field
 * @returns {Promise<string>} Updated base64 image (without data URI prefix)
 */
export async function addCustomPngField(base64Data, keyword, value) {
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const chunks = readPngChunks(arrayBuffer);

    // Create new text chunk
    const newChunk = createTextChunk(keyword, value);

    // Add new chunk before IEND
    const iendIndex = chunks.findIndex(c => c.type === 'IEND');
    if (iendIndex >= 0) {
      chunks.splice(iendIndex, 0, newChunk);
    } else {
      chunks.push(newChunk);
    }

    // Write chunks back
    const modifiedBuffer = writePngChunks(chunks);
    return arrayBufferToBase64(modifiedBuffer);
  } catch (error) {
    console.error('PNG custom field addition error:', error);
    throw new Error(`Failed to add custom PNG field: ${error.message}`);
  }
}
