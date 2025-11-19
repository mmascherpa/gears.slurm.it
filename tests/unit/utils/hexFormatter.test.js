import { describe, it, expect } from 'vitest';
import {
  byteToHex,
  offsetToHex,
  offsetToDecimal,
  isPrintableAscii,
  byteToAscii,
  categorizeByteType,
  formatHexRow,
  formatFileSize,
  parseHexOffset,
  parseDecimalOffset
} from '@/utils/hexFormatter';

describe('hexFormatter', () => {
  describe('byteToHex', () => {
    it('converts 0 to 00', () => {
      expect(byteToHex(0)).toBe('00');
    });

    it('converts 255 to FF', () => {
      expect(byteToHex(255)).toBe('FF');
    });

    it('converts 15 to 0F', () => {
      expect(byteToHex(15)).toBe('0F');
    });

    it('converts 170 to AA', () => {
      expect(byteToHex(170)).toBe('AA');
    });
  });

  describe('offsetToHex', () => {
    it('converts 0 with default padding', () => {
      expect(offsetToHex(0)).toBe('00000000');
    });

    it('converts 255 with default padding', () => {
      expect(offsetToHex(255)).toBe('000000FF');
    });

    it('converts 4096 with default padding', () => {
      expect(offsetToHex(4096)).toBe('00001000');
    });

    it('handles custom padding', () => {
      expect(offsetToHex(255, 4)).toBe('00FF');
    });
  });

  describe('offsetToDecimal', () => {
    it('converts 0 with default padding', () => {
      expect(offsetToDecimal(0)).toBe('0000000000');
    });

    it('converts 12345 with default padding', () => {
      expect(offsetToDecimal(12345)).toBe('0000012345');
    });

    it('handles custom padding', () => {
      expect(offsetToDecimal(123, 5)).toBe('00123');
    });
  });

  describe('isPrintableAscii', () => {
    it('returns true for space (32)', () => {
      expect(isPrintableAscii(32)).toBe(true);
    });

    it('returns true for tilde (126)', () => {
      expect(isPrintableAscii(126)).toBe(true);
    });

    it('returns true for letter A (65)', () => {
      expect(isPrintableAscii(65)).toBe(true);
    });

    it('returns false for null (0)', () => {
      expect(isPrintableAscii(0)).toBe(false);
    });

    it('returns false for tab (9)', () => {
      expect(isPrintableAscii(9)).toBe(false);
    });

    it('returns false for DEL (127)', () => {
      expect(isPrintableAscii(127)).toBe(false);
    });

    it('returns false for extended ASCII (200)', () => {
      expect(isPrintableAscii(200)).toBe(false);
    });
  });

  describe('byteToAscii', () => {
    it('converts printable character', () => {
      expect(byteToAscii(65)).toBe('A');
    });

    it('converts space', () => {
      expect(byteToAscii(32)).toBe(' ');
    });

    it('uses default placeholder for null', () => {
      expect(byteToAscii(0)).toBe('.');
    });

    it('uses custom placeholder', () => {
      expect(byteToAscii(0, '·')).toBe('·');
    });

    it('uses placeholder for non-printable', () => {
      expect(byteToAscii(9)).toBe('.');
    });
  });

  describe('categorizeByteType', () => {
    it('categorizes null byte', () => {
      expect(categorizeByteType(0)).toBe('null');
    });

    it('categorizes printable ASCII', () => {
      expect(categorizeByteType(65)).toBe('printable');
    });

    it('categorizes non-printable', () => {
      expect(categorizeByteType(9)).toBe('non-printable');
    });

    it('categorizes high byte as non-printable', () => {
      expect(categorizeByteType(200)).toBe('non-printable');
    });
  });

  describe('formatHexRow', () => {
    it('formats full 16-byte row with hex offset', () => {
      const bytes = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80]);
      const row = formatHexRow(bytes, 0, 16, true);

      expect(row.offset).toBe('00000000');
      expect(row.hexPart1).toBe('41 42 43 44 45 46 47 48');
      expect(row.hexPart2).toBe('49 4A 4B 4C 4D 4E 4F 50');
      expect(row.ascii).toBe('ABCDEFGHIJKLMNOP');
      expect(row.byteOffset).toBe(0);
    });

    it('formats partial row with padding', () => {
      const bytes = new Uint8Array([65, 66, 67]);
      const row = formatHexRow(bytes, 0, 16, true);

      expect(row.hexPart1).toBe('41 42 43               ');
      expect(row.hexPart2).toBe('                       ');
      expect(row.ascii).toBe('ABC             ');
    });

    it('uses decimal offset when specified', () => {
      const bytes = new Uint8Array([65]);
      const row = formatHexRow(bytes, 256, 16, false);

      expect(row.offset).toBe('0000000256');
    });

    it('includes byte categories', () => {
      const bytes = new Uint8Array([0, 65, 9]);
      const row = formatHexRow(bytes, 0, 16, true);

      expect(row.categories[0]).toBe('null');
      expect(row.categories[1]).toBe('printable');
      expect(row.categories[2]).toBe('non-printable');
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('formats gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('parseHexOffset', () => {
    it('parses simple hex', () => {
      expect(parseHexOffset('FF')).toBe(255);
    });

    it('parses hex with 0x prefix', () => {
      expect(parseHexOffset('0xFF')).toBe(255);
    });

    it('parses hex with 0X prefix', () => {
      expect(parseHexOffset('0XFF')).toBe(255);
    });

    it('handles lowercase hex', () => {
      expect(parseHexOffset('ff')).toBe(255);
    });

    it('handles whitespace', () => {
      expect(parseHexOffset('  FF  ')).toBe(255);
    });

    it('returns null for invalid input', () => {
      expect(parseHexOffset('XYZ')).toBe(null);
    });

    it('returns null for empty string', () => {
      expect(parseHexOffset('')).toBe(null);
    });
  });

  describe('parseDecimalOffset', () => {
    it('parses simple decimal', () => {
      expect(parseDecimalOffset('255')).toBe(255);
    });

    it('parses large decimal', () => {
      expect(parseDecimalOffset('1000000')).toBe(1000000);
    });

    it('returns null for invalid input', () => {
      expect(parseDecimalOffset('ABC')).toBe(null);
    });

    it('returns null for empty string', () => {
      expect(parseDecimalOffset('')).toBe(null);
    });

    it('parses zero', () => {
      expect(parseDecimalOffset('0')).toBe(0);
    });
  });
});
