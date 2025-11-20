import { describe, it, expect } from 'vitest';
import {
  FILE_SIZE_LIMITS,
  formatFileSize,
  validateFileSize,
  isFileSizeValid,
  shouldWarnFileSize
} from '@/utils/fileSizeValidator';

describe('fileSizeValidator', () => {
  describe('FILE_SIZE_LIMITS constants', () => {
    it('defines warning threshold at 50 MB', () => {
      expect(FILE_SIZE_LIMITS.WARNING_THRESHOLD).toBe(50 * 1024 * 1024);
    });

    it('defines max size at 200 MB', () => {
      expect(FILE_SIZE_LIMITS.MAX_SIZE).toBe(200 * 1024 * 1024);
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes (< 1 KB)', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB'); // 1 MB
      expect(formatFileSize(1572864)).toBe('1.5 MB'); // 1.5 MB
      expect(formatFileSize(52428800)).toBe('50 MB'); // 50 MB
    });

    it('formats gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB'); // 1 GB
      expect(formatFileSize(2147483648)).toBe('2 GB'); // 2 GB
    });

    it('respects decimal places parameter', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1536, 3)).toBe('1.5 KB');
    });

    it('handles negative decimal places', () => {
      expect(formatFileSize(1536, -1)).toBe('2 KB');
    });

    it('defaults to 2 decimal places', () => {
      const result = formatFileSize(1572864); // 1.5 MB
      expect(result).toBe('1.5 MB');
    });
  });

  describe('validateFileSize', () => {
    describe('null/undefined file handling', () => {
      it('returns invalid for null file', () => {
        const result = validateFileSize(null);

        expect(result.isValid).toBe(false);
        expect(result.hasWarning).toBe(false);
        expect(result.message).toBe('No file selected');
        expect(result.formattedSize).toBe('0 Bytes');
        expect(result.sizeInBytes).toBe(0);
      });

      it('returns invalid for undefined file', () => {
        const result = validateFileSize(undefined);

        expect(result.isValid).toBe(false);
      });
    });

    describe('files below warning threshold (< 50 MB)', () => {
      it('validates small file as valid without warning', () => {
        const file = new File(['x'.repeat(1024)], 'test.txt', { type: 'text/plain' });
        const result = validateFileSize(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(false);
        expect(result.message).toBe('');
        expect(result.formattedSize).toContain('KB');
      });

      it('validates 1 MB file as valid without warning', () => {
        const size = 1 * 1024 * 1024; // 1 MB
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(false);
        expect(result.message).toBe('');
      });

      it('validates file just below warning threshold', () => {
        const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD - 1;
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(false);
      });
    });

    describe('files above warning threshold (50-200 MB)', () => {
      it('validates file above warning threshold with warning', () => {
        const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD + 1;
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(true);
        expect(result.message).toContain('Large file detected');
        expect(result.message).toContain('Processing may take longer');
      });

      it('validates 100 MB file with warning', () => {
        const size = 100 * 1024 * 1024;
        const file = new File(['x'.repeat(size)], 'large.bin');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(true);
        expect(result.formattedSize).toContain('100 MB');
      });

      it('validates file just below max size with warning', () => {
        const size = FILE_SIZE_LIMITS.MAX_SIZE - 1;
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(true);
      });
    });

    describe('files exceeding max size (> 200 MB)', () => {
      it('invalidates file exceeding max size', () => {
        const size = FILE_SIZE_LIMITS.MAX_SIZE + 1;
        const file = new File(['x'.repeat(size)], 'huge.bin');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(false);
        expect(result.hasWarning).toBe(false);
        expect(result.message).toContain('File is too large');
        expect(result.message).toContain('Maximum allowed size is 200 MB');
      });

      it('invalidates 500 MB file', () => {
        const size = 500 * 1024 * 1024;
        const file = new File(['x'.repeat(size)], 'huge.bin');
        const result = validateFileSize(file);

        expect(result.isValid).toBe(false);
        expect(result.message).toContain('500 MB');
      });
    });

    describe('return value structure', () => {
      it('always returns consistent structure', () => {
        const file = new File(['test'], 'test.txt');
        const result = validateFileSize(file);

        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('hasWarning');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('formattedSize');
        expect(result).toHaveProperty('sizeInBytes');
      });

      it('includes correct sizeInBytes', () => {
        const size = 1024;
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = validateFileSize(file);

        expect(result.sizeInBytes).toBe(size);
      });

      it('includes formatted size in message for large files', () => {
        const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD + 1;
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = validateFileSize(file);

        expect(result.message).toContain(result.formattedSize);
      });
    });
  });

  describe('isFileSizeValid', () => {
    it('returns true for files within size limit', () => {
      const file = new File(['test'], 'test.txt');
      expect(isFileSizeValid(file)).toBe(true);
    });

    it('returns true for files at max size', () => {
      const size = FILE_SIZE_LIMITS.MAX_SIZE;
      const file = new File(['x'.repeat(size)], 'test.txt');
      expect(isFileSizeValid(file)).toBe(true);
    });

    it('returns false for files exceeding max size', () => {
      const size = FILE_SIZE_LIMITS.MAX_SIZE + 1;
      const file = new File(['x'.repeat(size)], 'test.txt');
      expect(isFileSizeValid(file)).toBe(false);
    });

    it('returns false for null file', () => {
      expect(isFileSizeValid(null)).toBeFalsy();
    });

    it('returns false for undefined file', () => {
      expect(isFileSizeValid(undefined)).toBeFalsy();
    });
  });

  describe('shouldWarnFileSize', () => {
    it('returns false for files below warning threshold', () => {
      const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD - 1;
      const file = new File(['x'.repeat(size)], 'test.txt');
      expect(shouldWarnFileSize(file)).toBe(false);
    });

    it('returns true for files above warning threshold', () => {
      const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD + 1;
      const file = new File(['x'.repeat(size)], 'test.txt');
      expect(shouldWarnFileSize(file)).toBe(true);
    });

    it('returns true for files between warning and max size', () => {
      const size = 100 * 1024 * 1024; // 100 MB
      const file = new File(['x'.repeat(size)], 'test.txt');
      expect(shouldWarnFileSize(file)).toBe(true);
    });

    it('returns false for files exceeding max size', () => {
      const size = FILE_SIZE_LIMITS.MAX_SIZE + 1;
      const file = new File(['x'.repeat(size)], 'test.txt');
      expect(shouldWarnFileSize(file)).toBe(false);
    });

    it('returns false for null file', () => {
      expect(shouldWarnFileSize(null)).toBeFalsy();
    });

    it('returns false for undefined file', () => {
      expect(shouldWarnFileSize(undefined)).toBeFalsy();
    });
  });

  describe('edge cases', () => {
    it('handles exact warning threshold boundary', () => {
      const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD;
      const file = new File(['x'.repeat(size)], 'test.txt');
      const result = validateFileSize(file);

      expect(result.isValid).toBe(true);
      expect(result.hasWarning).toBe(false);
    });

    it('handles exact max size boundary', () => {
      const size = FILE_SIZE_LIMITS.MAX_SIZE;
      const file = new File(['x'.repeat(size)], 'test.txt');
      const result = validateFileSize(file);

      expect(result.isValid).toBe(true);
      expect(result.hasWarning).toBe(true);
    });

    it('handles zero-byte file', () => {
      const file = new File([], 'empty.txt');
      const result = validateFileSize(file);

      expect(result.isValid).toBe(true);
      expect(result.hasWarning).toBe(false);
      expect(result.formattedSize).toBe('0 Bytes');
    });
  });
});
