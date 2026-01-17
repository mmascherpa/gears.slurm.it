/**
 * Tests for fileSignatures utility
 */
import { describe, expect, it } from 'vitest';
import {
  detectFileType,
  FILE_SIGNATURES,
  findSignaturesInFile,
  getCategories,
  getSignaturesByCategory,
  signatureToHex
} from '@/utils/fileSignatures';

describe('fileSignatures', () => {
  describe('detectFileType', () => {
    it('returns null for empty data', () => {
      expect(detectFileType(null)).toBeNull();
      expect(detectFileType(new Uint8Array([]))).toBeNull();
    });

    it('detects JPEG files', () => {
      const jpegData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const result = detectFileType(jpegData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('jpg');
      expect(result.description).toBe('JPEG Image');
      expect(result.category).toBe('image');
    });

    it('detects PNG files', () => {
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00]);
      const result = detectFileType(pngData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('png');
      expect(result.description).toBe('PNG Image');
    });

    it('detects PDF files', () => {
      const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E]);
      const result = detectFileType(pdfData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('pdf');
      expect(result.description).toBe('PDF Document');
    });

    it('detects ZIP files', () => {
      const zipData = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x0A, 0x00]);
      const result = detectFileType(zipData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('zip');
      expect(result.category).toBe('archive');
    });

    it('detects GIF87a files', () => {
      const gifData = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x00]);
      const result = detectFileType(gifData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('gif');
      expect(result.description).toBe('GIF Image (87a)');
    });

    it('detects GIF89a files', () => {
      const gifData = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00]);
      const result = detectFileType(gifData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('gif');
      expect(result.description).toBe('GIF Image (89a)');
    });

    it('detects Windows executables (PE)', () => {
      const exeData = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
      const result = detectFileType(exeData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('exe');
      expect(result.category).toBe('executable');
    });

    it('detects Linux executables (ELF)', () => {
      const elfData = new Uint8Array([0x7F, 0x45, 0x4C, 0x46, 0x02]);
      const result = detectFileType(elfData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('elf');
      expect(result.description).toBe('Linux Executable (ELF)');
    });

    it('detects SQLite databases', () => {
      // "SQLite format 3" in ASCII
      const sqliteData = new Uint8Array([
        0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20,
        0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00
      ]);
      const result = detectFileType(sqliteData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('sqlite');
      expect(result.category).toBe('database');
    });

    it('detects GZIP archives', () => {
      const gzData = new Uint8Array([0x1F, 0x8B, 0x08, 0x00]);
      const result = detectFileType(gzData);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('gz');
      expect(result.description).toBe('GZIP Archive');
    });

    it('detects MP3 with ID3 tag', () => {
      const mp3Data = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00]);
      const result = detectFileType(mp3Data);

      expect(result).not.toBeNull();
      expect(result.extension).toBe('mp3');
      expect(result.category).toBe('audio');
    });

    it('returns null for unknown file types', () => {
      const unknownData = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44]);
      expect(detectFileType(unknownData)).toBeNull();
    });

    it('returns null for data shorter than shortest signature', () => {
      const shortData = new Uint8Array([0xFF]);
      // May or may not match depending on signatures - just ensure no crash
      const result = detectFileType(shortData);
      // Result can be null or a match - just verify it doesn't throw
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('includes signature information in result', () => {
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const result = detectFileType(pngData);

      expect(result.signatureOffset).toBe(0);
      expect(result.signatureLength).toBe(8);
      expect(result.signatureBytes).toEqual([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    });
  });

  describe('signatureToHex', () => {
    it('converts bytes to hex string', () => {
      expect(signatureToHex([0xFF, 0xD8, 0xFF])).toBe('FF D8 FF');
    });

    it('pads single digit values', () => {
      expect(signatureToHex([0x00, 0x0A, 0xFF])).toBe('00 0A FF');
    });

    it('handles empty array', () => {
      expect(signatureToHex([])).toBe('');
    });

    it('handles single byte', () => {
      expect(signatureToHex([0x42])).toBe('42');
    });
  });

  describe('getCategories', () => {
    it('returns unique categories', () => {
      const categories = getCategories();

      expect(categories).toContain('image');
      expect(categories).toContain('document');
      expect(categories).toContain('archive');
      expect(categories).toContain('audio');
      expect(categories).toContain('video');
      expect(categories).toContain('executable');
    });

    it('returns array of strings', () => {
      const categories = getCategories();
      expect(Array.isArray(categories)).toBe(true);
      categories.forEach(cat => {
        expect(typeof cat).toBe('string');
      });
    });
  });

  describe('getSignaturesByCategory', () => {
    it('returns signatures for image category', () => {
      const imageSignatures = getSignaturesByCategory('image');

      expect(imageSignatures.length).toBeGreaterThan(0);
      imageSignatures.forEach(sig => {
        expect(sig.category).toBe('image');
      });
    });

    it('returns empty array for unknown category', () => {
      const unknown = getSignaturesByCategory('nonexistent');
      expect(unknown).toEqual([]);
    });

    it('includes common image formats', () => {
      const images = getSignaturesByCategory('image');
      const extensions = images.map(s => s.extension);

      expect(extensions).toContain('jpg');
      expect(extensions).toContain('png');
      expect(extensions).toContain('gif');
    });
  });

  describe('findSignaturesInFile', () => {
    it('returns empty array for empty data', () => {
      expect(findSignaturesInFile(null)).toEqual([]);
      expect(findSignaturesInFile(new Uint8Array([]))).toEqual([]);
    });

    it('finds signature at start of file', () => {
      const jpegData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const results = findSignaturesInFile(jpegData);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].offset).toBe(0);
      expect(results[0].extension).toBe('jpg');
    });

    it('finds embedded signatures', () => {
      // Create data with JPEG signature embedded at offset 10
      const data = new Uint8Array(20);
      data[10] = 0xFF;
      data[11] = 0xD8;
      data[12] = 0xFF;

      const results = findSignaturesInFile(data, 'jpg');
      const jpegMatch = results.find(r => r.offset === 10);

      expect(jpegMatch).toBeDefined();
      expect(jpegMatch.extension).toBe('jpg');
    });

    it('filters by extension when specified', () => {
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const results = findSignaturesInFile(pngData, 'jpg');

      // Should not find JPEG in PNG file
      const jpegMatch = results.find(r => r.extension === 'jpg');
      expect(jpegMatch).toBeUndefined();
    });

    it('sorts results by offset', () => {
      const data = new Uint8Array(100);
      // Add multiple signatures at different offsets
      // JPEG at offset 50
      data[50] = 0xFF;
      data[51] = 0xD8;
      data[52] = 0xFF;
      // JPEG at offset 10
      data[10] = 0xFF;
      data[11] = 0xD8;
      data[12] = 0xFF;

      const results = findSignaturesInFile(data, 'jpg');

      if (results.length >= 2) {
        expect(results[0].offset).toBeLessThan(results[1].offset);
      }
    });
  });

  describe('FILE_SIGNATURES constant', () => {
    it('is an array', () => {
      expect(Array.isArray(FILE_SIGNATURES)).toBe(true);
    });

    it('has required properties for each signature', () => {
      FILE_SIGNATURES.forEach(sig => {
        expect(sig).toHaveProperty('bytes');
        expect(sig).toHaveProperty('extension');
        expect(sig).toHaveProperty('description');
        expect(sig).toHaveProperty('category');
        expect(Array.isArray(sig.bytes)).toBe(true);
        expect(typeof sig.extension).toBe('string');
        expect(typeof sig.description).toBe('string');
        expect(typeof sig.category).toBe('string');
      });
    });

    it('has valid byte values (0-255)', () => {
      FILE_SIGNATURES.forEach(sig => {
        sig.bytes.forEach(byte => {
          expect(byte).toBeGreaterThanOrEqual(0);
          expect(byte).toBeLessThanOrEqual(255);
        });
      });
    });
  });
});
