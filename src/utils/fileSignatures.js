/**
 * File Signatures (Magic Numbers) Utility
 *
 * Provides detection of common file types based on their header bytes.
 * Magic numbers are specific byte sequences at the start of files that
 * identify their format.
 */

/**
 * Common file signatures with their magic numbers and descriptions
 * Each entry contains:
 * - bytes: Array of byte values to match at the start of the file
 * - offset: Starting offset for the match (default 0)
 * - extension: Common file extension
 * - description: Human-readable format name
 * - category: File category for grouping
 */
export const FILE_SIGNATURES = [
  // Images
  {
    bytes: [0xFF, 0xD8, 0xFF],
    extension: 'jpg',
    description: 'JPEG Image',
    category: 'image'
  },
  {
    bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    extension: 'png',
    description: 'PNG Image',
    category: 'image'
  },
  {
    bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    extension: 'gif',
    description: 'GIF Image (87a)',
    category: 'image'
  },
  {
    bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    extension: 'gif',
    description: 'GIF Image (89a)',
    category: 'image'
  },
  {
    bytes: [0x42, 0x4D], // BM
    extension: 'bmp',
    description: 'BMP Image',
    category: 'image'
  },
  {
    bytes: [0x00, 0x00, 0x01, 0x00],
    extension: 'ico',
    description: 'Windows Icon',
    category: 'image'
  },
  {
    bytes: [0x52, 0x49, 0x46, 0x46], // RIFF (need to check WEBP at offset 8)
    extension: 'webp',
    description: 'WebP Image',
    category: 'image',
    additionalCheck: (data) => {
      if (data.length < 12) return false;
      return data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50; // WEBP
    }
  },
  {
    bytes: [0x49, 0x49, 0x2A, 0x00], // Little-endian TIFF
    extension: 'tiff',
    description: 'TIFF Image (Little Endian)',
    category: 'image'
  },
  {
    bytes: [0x4D, 0x4D, 0x00, 0x2A], // Big-endian TIFF
    extension: 'tiff',
    description: 'TIFF Image (Big Endian)',
    category: 'image'
  },

  // Documents
  {
    bytes: [0x25, 0x50, 0x44, 0x46], // %PDF
    extension: 'pdf',
    description: 'PDF Document',
    category: 'document'
  },
  {
    bytes: [0x50, 0x4B, 0x03, 0x04], // PK.. (ZIP-based)
    extension: 'zip',
    description: 'ZIP Archive / Office Document',
    category: 'archive'
  },
  {
    bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
    extension: 'doc',
    description: 'Microsoft Office (Legacy)',
    category: 'document'
  },

  // Archives
  {
    bytes: [0x1F, 0x8B],
    extension: 'gz',
    description: 'GZIP Archive',
    category: 'archive'
  },
  {
    bytes: [0x42, 0x5A, 0x68], // BZh
    extension: 'bz2',
    description: 'BZIP2 Archive',
    category: 'archive'
  },
  {
    bytes: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07], // Rar!
    extension: 'rar',
    description: 'RAR Archive',
    category: 'archive'
  },
  {
    bytes: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C],
    extension: '7z',
    description: '7-Zip Archive',
    category: 'archive'
  },
  {
    bytes: [0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00],
    extension: 'xz',
    description: 'XZ Archive',
    category: 'archive'
  },

  // Audio
  {
    bytes: [0x49, 0x44, 0x33], // ID3
    extension: 'mp3',
    description: 'MP3 Audio (ID3 Tag)',
    category: 'audio'
  },
  {
    bytes: [0xFF, 0xFB], // MPEG Audio Layer 3
    extension: 'mp3',
    description: 'MP3 Audio',
    category: 'audio'
  },
  {
    bytes: [0xFF, 0xFA], // MPEG Audio Layer 3
    extension: 'mp3',
    description: 'MP3 Audio',
    category: 'audio'
  },
  {
    bytes: [0x4F, 0x67, 0x67, 0x53], // OggS
    extension: 'ogg',
    description: 'OGG Audio/Video',
    category: 'audio'
  },
  {
    bytes: [0x66, 0x4C, 0x61, 0x43], // fLaC
    extension: 'flac',
    description: 'FLAC Audio',
    category: 'audio'
  },
  {
    bytes: [0x52, 0x49, 0x46, 0x46], // RIFF (need to check WAVE at offset 8)
    extension: 'wav',
    description: 'WAV Audio',
    category: 'audio',
    additionalCheck: (data) => {
      if (data.length < 12) return false;
      return data[8] === 0x57 && data[9] === 0x41 && data[10] === 0x56 && data[11] === 0x45; // WAVE
    }
  },

  // Video
  {
    bytes: [0x00, 0x00, 0x00], // ftyp marker (need offset check)
    extension: 'mp4',
    description: 'MP4 Video',
    category: 'video',
    additionalCheck: (data) => {
      if (data.length < 8) return false;
      // Check for 'ftyp' at offset 4
      return data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70;
    }
  },
  {
    bytes: [0x1A, 0x45, 0xDF, 0xA3],
    extension: 'mkv',
    description: 'Matroska Video (MKV/WebM)',
    category: 'video'
  },
  {
    bytes: [0x52, 0x49, 0x46, 0x46], // RIFF (need to check AVI at offset 8)
    extension: 'avi',
    description: 'AVI Video',
    category: 'audio',
    additionalCheck: (data) => {
      if (data.length < 12) return false;
      return data[8] === 0x41 && data[9] === 0x56 && data[10] === 0x49 && data[11] === 0x20; // AVI
    }
  },
  {
    bytes: [0x00, 0x00, 0x01, 0xBA],
    extension: 'mpg',
    description: 'MPEG Video',
    category: 'video'
  },
  {
    bytes: [0x00, 0x00, 0x01, 0xB3],
    extension: 'mpg',
    description: 'MPEG Video',
    category: 'video'
  },

  // Executables
  {
    bytes: [0x4D, 0x5A], // MZ
    extension: 'exe',
    description: 'Windows Executable (PE)',
    category: 'executable'
  },
  {
    bytes: [0x7F, 0x45, 0x4C, 0x46], // ELF
    extension: 'elf',
    description: 'Linux Executable (ELF)',
    category: 'executable'
  },
  {
    bytes: [0xCF, 0xFA, 0xED, 0xFE], // Mach-O 64-bit
    extension: 'macho',
    description: 'macOS Executable (Mach-O 64-bit)',
    category: 'executable'
  },
  {
    bytes: [0xCE, 0xFA, 0xED, 0xFE], // Mach-O 32-bit
    extension: 'macho',
    description: 'macOS Executable (Mach-O 32-bit)',
    category: 'executable'
  },
  {
    bytes: [0xCA, 0xFE, 0xBA, 0xBE], // Universal Binary or Java Class
    extension: 'macho',
    description: 'macOS Universal Binary / Java Class',
    category: 'executable'
  },

  // Database
  {
    bytes: [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33], // SQLite format 3
    extension: 'sqlite',
    description: 'SQLite Database',
    category: 'database'
  },

  // Encrypted Files (this app's formats)
  {
    bytes: [0x41, 0x45, 0x53], // AES
    extension: 'aes',
    description: 'AES Crypt Encrypted File',
    category: 'encrypted'
  },
  {
    bytes: [0x61, 0x67, 0x65, 0x2D, 0x65, 0x6E, 0x63, 0x72, 0x79, 0x70, 0x74, 0x69, 0x6F, 0x6E], // age-encryption
    extension: 'age',
    description: 'Age Encrypted File',
    category: 'encrypted'
  },

  // Fonts
  {
    bytes: [0x00, 0x01, 0x00, 0x00],
    extension: 'ttf',
    description: 'TrueType Font',
    category: 'font'
  },
  {
    bytes: [0x4F, 0x54, 0x54, 0x4F], // OTTO
    extension: 'otf',
    description: 'OpenType Font',
    category: 'font'
  },
  {
    bytes: [0x77, 0x4F, 0x46, 0x46], // wOFF
    extension: 'woff',
    description: 'Web Open Font Format',
    category: 'font'
  },
  {
    bytes: [0x77, 0x4F, 0x46, 0x32], // wOF2
    extension: 'woff2',
    description: 'Web Open Font Format 2',
    category: 'font'
  },

  // Other
  {
    bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // <?xml
    extension: 'xml',
    description: 'XML Document',
    category: 'text'
  },
  {
    bytes: [0xEF, 0xBB, 0xBF], // UTF-8 BOM
    extension: 'txt',
    description: 'Text (UTF-8 with BOM)',
    category: 'text'
  },
  {
    bytes: [0xFF, 0xFE], // UTF-16 LE BOM
    extension: 'txt',
    description: 'Text (UTF-16 LE)',
    category: 'text'
  },
  {
    bytes: [0xFE, 0xFF], // UTF-16 BE BOM
    extension: 'txt',
    description: 'Text (UTF-16 BE)',
    category: 'text'
  }
];

/**
 * Detects file type from binary data using magic numbers
 * @param {Uint8Array} data - File data to analyze
 * @returns {Object|null} Detected file info or null if unknown
 */
export function detectFileType(data) {
  if (!data || data.length === 0) return null;

  // Sort signatures by length (longest first) for more specific matches
  const sortedSignatures = [...FILE_SIGNATURES].sort(
    (a, b) => b.bytes.length - a.bytes.length
  );

  for (const sig of sortedSignatures) {
    const offset = sig.offset || 0;

    // Check if we have enough data
    if (data.length < offset + sig.bytes.length) continue;

    // Check basic byte match
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (data[offset + i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }

    if (!match) continue;

    // If there's an additional check (for RIFF-based formats), run it
    if (sig.additionalCheck && !sig.additionalCheck(data)) {
      continue;
    }

    return {
      extension: sig.extension,
      description: sig.description,
      category: sig.category,
      signatureOffset: offset,
      signatureLength: sig.bytes.length,
      signatureBytes: sig.bytes
    };
  }

  return null;
}

/**
 * Gets a hex string representation of a file signature
 * @param {number[]} bytes - Signature bytes
 * @returns {string} Hex string (e.g., "FF D8 FF")
 */
export function signatureToHex(bytes) {
  return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

/**
 * Gets all signatures for a specific category
 * @param {string} category - Category name
 * @returns {Array} Signatures in that category
 */
export function getSignaturesByCategory(category) {
  return FILE_SIGNATURES.filter(sig => sig.category === category);
}

/**
 * Gets all unique categories
 * @returns {string[]} Array of category names
 */
export function getCategories() {
  return [...new Set(FILE_SIGNATURES.map(sig => sig.category))];
}

/**
 * Searches for a known signature anywhere in the file
 * Useful for finding embedded files or file fragments
 * @param {Uint8Array} data - File data to search
 * @param {string} [extension] - Optional: only search for specific extension
 * @returns {Array} Array of matches with offset and type info
 */
export function findSignaturesInFile(data, extension = null) {
  if (!data || data.length === 0) return [];

  const results = [];
  const signatures = extension
    ? FILE_SIGNATURES.filter(sig => sig.extension === extension)
    : FILE_SIGNATURES;

  for (const sig of signatures) {
    // Skip signatures with additional checks for deep search
    if (sig.additionalCheck) continue;

    // Search through the file
    const searchLimit = Math.min(data.length - sig.bytes.length, 1024 * 1024); // Limit to first 1MB for performance

    for (let offset = 0; offset <= searchLimit; offset++) {
      let match = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        if (data[offset + i] !== sig.bytes[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        results.push({
          offset,
          extension: sig.extension,
          description: sig.description,
          category: sig.category,
          signatureBytes: sig.bytes
        });
      }
    }
  }

  // Sort by offset
  return results.sort((a, b) => a.offset - b.offset);
}
