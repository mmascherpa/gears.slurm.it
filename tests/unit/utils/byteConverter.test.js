import { describe, it, expect } from 'vitest';
import {
  bytesToInt8,
  bytesToUint8,
  bytesToInt16LE,
  bytesToInt16BE,
  bytesToUint16LE,
  bytesToUint16BE,
  bytesToInt32LE,
  bytesToInt32BE,
  bytesToUint32LE,
  bytesToUint32BE,
  bytesToUtf8,
  bytesToAscii,
  bytesToUnixTimestamp,
  bytesToHexString,
  interpretBytes
} from '@/utils/byteConverter';

describe('byteConverter', () => {
  describe('bytesToInt8', () => {
    it('converts positive value', () => {
      expect(bytesToInt8(new Uint8Array([100]))).toBe(100);
    });

    it('converts negative value (> 127)', () => {
      expect(bytesToInt8(new Uint8Array([200]))).toBe(-56);
    });

    it('converts max positive (127)', () => {
      expect(bytesToInt8(new Uint8Array([127]))).toBe(127);
    });

    it('converts min negative (128 = -128)', () => {
      expect(bytesToInt8(new Uint8Array([128]))).toBe(-128);
    });

    it('returns 0 for empty array', () => {
      expect(bytesToInt8(new Uint8Array([]))).toBe(0);
    });
  });

  describe('bytesToUint8', () => {
    it('converts value', () => {
      expect(bytesToUint8(new Uint8Array([200]))).toBe(200);
    });

    it('converts 0', () => {
      expect(bytesToUint8(new Uint8Array([0]))).toBe(0);
    });

    it('converts 255', () => {
      expect(bytesToUint8(new Uint8Array([255]))).toBe(255);
    });

    it('returns 0 for empty array', () => {
      expect(bytesToUint8(new Uint8Array([]))).toBe(0);
    });
  });

  describe('bytesToInt16LE', () => {
    it('converts little-endian positive value', () => {
      // 0x0100 = 256 in LE (00 01)
      expect(bytesToInt16LE(new Uint8Array([0, 1]))).toBe(256);
    });

    it('converts little-endian negative value', () => {
      // 0xFFFF = -1 in signed 16-bit
      expect(bytesToInt16LE(new Uint8Array([255, 255]))).toBe(-1);
    });

    it('returns 0 for insufficient bytes', () => {
      expect(bytesToInt16LE(new Uint8Array([1]))).toBe(0);
    });
  });

  describe('bytesToInt16BE', () => {
    it('converts big-endian positive value', () => {
      // 0x0100 = 256 in BE (01 00)
      expect(bytesToInt16BE(new Uint8Array([1, 0]))).toBe(256);
    });

    it('converts big-endian negative value', () => {
      expect(bytesToInt16BE(new Uint8Array([255, 255]))).toBe(-1);
    });
  });

  describe('bytesToUint16LE', () => {
    it('converts little-endian value', () => {
      expect(bytesToUint16LE(new Uint8Array([0, 1]))).toBe(256);
    });

    it('converts max value (65535)', () => {
      expect(bytesToUint16LE(new Uint8Array([255, 255]))).toBe(65535);
    });
  });

  describe('bytesToUint16BE', () => {
    it('converts big-endian value', () => {
      expect(bytesToUint16BE(new Uint8Array([1, 0]))).toBe(256);
    });

    it('converts max value (65535)', () => {
      expect(bytesToUint16BE(new Uint8Array([255, 255]))).toBe(65535);
    });
  });

  describe('bytesToInt32LE', () => {
    it('converts little-endian positive value', () => {
      // 0x01000000 = 16777216 in LE (00 00 00 01)
      expect(bytesToInt32LE(new Uint8Array([0, 0, 0, 1]))).toBe(16777216);
    });

    it('converts little-endian negative value', () => {
      expect(bytesToInt32LE(new Uint8Array([255, 255, 255, 255]))).toBe(-1);
    });

    it('returns 0 for insufficient bytes', () => {
      expect(bytesToInt32LE(new Uint8Array([1, 2]))).toBe(0);
    });
  });

  describe('bytesToInt32BE', () => {
    it('converts big-endian positive value', () => {
      expect(bytesToInt32BE(new Uint8Array([1, 0, 0, 0]))).toBe(16777216);
    });

    it('converts big-endian negative value', () => {
      expect(bytesToInt32BE(new Uint8Array([255, 255, 255, 255]))).toBe(-1);
    });
  });

  describe('bytesToUint32LE', () => {
    it('converts little-endian value', () => {
      expect(bytesToUint32LE(new Uint8Array([0, 0, 0, 1]))).toBe(16777216);
    });

    it('converts max value', () => {
      expect(bytesToUint32LE(new Uint8Array([255, 255, 255, 255]))).toBe(4294967295);
    });
  });

  describe('bytesToUint32BE', () => {
    it('converts big-endian value', () => {
      expect(bytesToUint32BE(new Uint8Array([1, 0, 0, 0]))).toBe(16777216);
    });

    it('converts max value', () => {
      expect(bytesToUint32BE(new Uint8Array([255, 255, 255, 255]))).toBe(4294967295);
    });
  });

  describe('bytesToUtf8', () => {
    it('converts simple ASCII text', () => {
      const bytes = new TextEncoder().encode('Hello');
      expect(bytesToUtf8(bytes)).toBe('Hello');
    });

    it('converts UTF-8 text with emoji', () => {
      const bytes = new TextEncoder().encode('Hello 👋');
      expect(bytesToUtf8(bytes)).toBe('Hello 👋');
    });

    it('handles empty array', () => {
      expect(bytesToUtf8(new Uint8Array([]))).toBe('');
    });

    it('handles invalid UTF-8 gracefully', () => {
      // Invalid UTF-8 sequence - should not throw
      const result = bytesToUtf8(new Uint8Array([0xFF, 0xFE]));
      expect(result).toBeTruthy();
    });
  });

  describe('bytesToAscii', () => {
    it('converts ASCII text', () => {
      const bytes = new TextEncoder().encode('Hello');
      expect(bytesToAscii(bytes)).toBe('Hello');
    });

    it('handles empty array', () => {
      expect(bytesToAscii(new Uint8Array([]))).toBe('');
    });
  });

  describe('bytesToUnixTimestamp', () => {
    it('converts valid Unix timestamp (LE)', () => {
      // Unix timestamp for 2020-01-01 00:00:00 UTC = 1577836800
      // In little-endian: 0x5E0BE100 = [00 E1 0B 5E]
      const bytes = new Uint8Array([0x00, 0xE1, 0x0B, 0x5E]);
      const result = bytesToUnixTimestamp(bytes, true);
      expect(result).toContain('2020-01-01');
    });

    it('converts valid Unix timestamp (BE)', () => {
      // Same timestamp in big-endian: [5E 0B E1 00]
      const bytes = new Uint8Array([0x5E, 0x0B, 0xE1, 0x00]);
      const result = bytesToUnixTimestamp(bytes, false);
      expect(result).toContain('2020-01-01');
    });

    it('returns N/A for insufficient bytes', () => {
      expect(bytesToUnixTimestamp(new Uint8Array([1, 2]), true)).toBe('N/A');
    });

    it('returns Invalid for out-of-range timestamp', () => {
      // Very large invalid timestamp
      const bytes = new Uint8Array([255, 255, 255, 255]);
      const result = bytesToUnixTimestamp(bytes, true);
      expect(result).toContain('Invalid');
    });
  });

  describe('bytesToHexString', () => {
    it('converts bytes to hex string', () => {
      expect(bytesToHexString(new Uint8Array([255, 0, 170]))).toBe('FF 00 AA');
    });

    it('handles empty array', () => {
      expect(bytesToHexString(new Uint8Array([]))).toBe('');
    });

    it('pads single digits', () => {
      expect(bytesToHexString(new Uint8Array([1, 2, 15]))).toBe('01 02 0F');
    });
  });

  describe('interpretBytes', () => {
    it('returns N/A for all fields when null', () => {
      const result = interpretBytes(null);
      expect(result.int8).toBe('N/A');
      expect(result.uint8).toBe('N/A');
      expect(result.hexString).toBe('');
    });

    it('returns N/A for all fields when empty', () => {
      const result = interpretBytes(new Uint8Array([]));
      expect(result.int8).toBe('N/A');
      expect(result.uint8).toBe('N/A');
    });

    it('interprets single byte', () => {
      const result = interpretBytes(new Uint8Array([200]));
      expect(result.int8).toBe(-56);
      expect(result.uint8).toBe(200);
      expect(result.hexString).toBe('C8');
      expect(result.int16LE).toBe('N/A');
      expect(result.int32LE).toBe('N/A');
    });

    it('interprets 2 bytes', () => {
      const result = interpretBytes(new Uint8Array([0, 1]));
      expect(result.uint16LE).toBe(256);
      expect(result.uint16BE).toBe(1);
      expect(result.int32LE).toBe('N/A');
    });

    it('interprets 4 bytes', () => {
      const result = interpretBytes(new Uint8Array([0, 0, 0, 1]));
      expect(result.uint32LE).toBe(16777216);
      expect(result.uint32BE).toBe(1);
      expect(result.timestampLE).toBeTruthy();
      expect(result.timestampBE).toBeTruthy();
    });

    it('interprets text as UTF-8', () => {
      const bytes = new TextEncoder().encode('Test');
      const result = interpretBytes(bytes);
      expect(result.utf8).toBe('Test');
      expect(result.ascii).toBe('Test');
    });
  });
});
