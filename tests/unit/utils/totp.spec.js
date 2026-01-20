import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  decodeBase32,
  validateTotpSecret,
  generateTotp,
  getTotpTimeRemaining,
  buildTotpUri
} from '@/utils/totp';

describe('totp', () => {
  describe('decodeBase32', () => {
    it('decodes valid Base32 string', () => {
      // "JBSWY3DPEHPK3PXP" is a common test secret (16 chars = 10 bytes)
      const result = decodeBase32('JBSWY3DPEHPK3PXP');
      expect(result.length).toBe(10);
      // Verify specific bytes
      expect(result[0]).toBe(0x48); // 'H'
      expect(result[1]).toBe(0x65); // 'e'
      expect(result[2]).toBe(0x6c); // 'l'
      expect(result[3]).toBe(0x6c); // 'l'
      expect(result[4]).toBe(0x6f); // 'o'
      expect(result[5]).toBe(0x21); // '!'
    });

    it('handles lowercase input', () => {
      const upper = decodeBase32('JBSWY3DPEHPK3PXP');
      const lower = decodeBase32('jbswy3dpehpk3pxp');
      expect(Array.from(upper)).toEqual(Array.from(lower));
    });

    it('ignores spaces in input', () => {
      const withSpaces = decodeBase32('JBSW Y3DP EHPK 3PXP');
      const withoutSpaces = decodeBase32('JBSWY3DPEHPK3PXP');
      expect(Array.from(withSpaces)).toEqual(Array.from(withoutSpaces));
    });

    it('ignores dashes in input', () => {
      const withDashes = decodeBase32('JBSW-Y3DP-EHPK-3PXP');
      const withoutDashes = decodeBase32('JBSWY3DPEHPK3PXP');
      expect(Array.from(withDashes)).toEqual(Array.from(withoutDashes));
    });

    it('ignores padding characters', () => {
      const withPadding = decodeBase32('JBSWY3DPEHPK3PXP====');
      const withoutPadding = decodeBase32('JBSWY3DPEHPK3PXP');
      expect(Array.from(withPadding)).toEqual(Array.from(withoutPadding));
    });

    it('returns empty array for empty string', () => {
      const result = decodeBase32('');
      expect(result.length).toBe(0);
    });

    it('throws error for invalid characters', () => {
      expect(() => decodeBase32('INVALID!')).toThrow('Invalid Base32 character: !');
      expect(() => decodeBase32('ABC01')).toThrow('Invalid Base32 character: 0');
      expect(() => decodeBase32('ABC1DEFG')).toThrow('Invalid Base32 character: 1');
    });

    it('decodes standard test vectors', () => {
      // RFC 4648 test vectors
      // "" -> ""
      expect(decodeBase32('').length).toBe(0);

      // "f" -> "MY======"
      const f = decodeBase32('MY');
      expect(new TextDecoder().decode(f)).toBe('f');

      // "fo" -> "MZXQ===="
      const fo = decodeBase32('MZXQ');
      expect(new TextDecoder().decode(fo)).toBe('fo');

      // "foo" -> "MZXW6==="
      const foo = decodeBase32('MZXW6');
      expect(new TextDecoder().decode(foo)).toBe('foo');

      // "foob" -> "MZXW6YQ="
      const foob = decodeBase32('MZXW6YQ');
      expect(new TextDecoder().decode(foob)).toBe('foob');

      // "fooba" -> "MZXW6YTB"
      const fooba = decodeBase32('MZXW6YTB');
      expect(new TextDecoder().decode(fooba)).toBe('fooba');

      // "foobar" -> "MZXW6YTBOI======"
      const foobar = decodeBase32('MZXW6YTBOI');
      expect(new TextDecoder().decode(foobar)).toBe('foobar');
    });
  });

  describe('validateTotpSecret', () => {
    it('validates correct Base32 secret', () => {
      const result = validateTotpSecret('JBSWY3DPEHPK3PXP');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.normalized).toBe('JBSWY3DPEHPK3PXP');
    });

    it('normalizes lowercase to uppercase', () => {
      const result = validateTotpSecret('jbswy3dpehpk3pxp');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('JBSWY3DPEHPK3PXP');
    });

    it('removes spaces from input', () => {
      const result = validateTotpSecret('JBSW Y3DP EHPK 3PXP');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('JBSWY3DPEHPK3PXP');
    });

    it('removes dashes from input', () => {
      const result = validateTotpSecret('JBSW-Y3DP-EHPK-3PXP');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('JBSWY3DPEHPK3PXP');
    });

    it('removes padding characters', () => {
      const result = validateTotpSecret('JBSWY3DPEHPK3PXP====');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('JBSWY3DPEHPK3PXP');
    });

    it('rejects null input', () => {
      const result = validateTotpSecret(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Secret is required');
    });

    it('rejects undefined input', () => {
      const result = validateTotpSecret(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Secret is required');
    });

    it('rejects empty string', () => {
      const result = validateTotpSecret('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Secret is required');
    });

    it('rejects string that normalizes to empty', () => {
      const result = validateTotpSecret('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Secret is empty after normalization');
    });

    it('rejects secrets shorter than 8 characters', () => {
      const result = validateTotpSecret('ABCDEFG');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Secret is too short (minimum 8 characters)');
    });

    it('accepts secrets with exactly 8 characters', () => {
      const result = validateTotpSecret('ABCDEFGH');
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid Base32 characters', () => {
      const result = validateTotpSecret('INVALID!SECRET');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid character: !');
    });

    it('rejects number 0 (not in Base32)', () => {
      const result = validateTotpSecret('ABC0DEFGH');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid character: 0');
    });

    it('rejects number 1 (not in Base32)', () => {
      const result = validateTotpSecret('ABC1DEFGH');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid character: 1');
    });
  });

  describe('generateTotp', () => {
    it('generates 6-digit code by default', async () => {
      const code = await generateTotp('JBSWY3DPEHPK3PXP');
      expect(code).toMatch(/^\d{6}$/);
    });

    it('generates correct length code with custom digits', async () => {
      const code8 = await generateTotp('JBSWY3DPEHPK3PXP', { digits: 8 });
      expect(code8).toMatch(/^\d{8}$/);

      const code4 = await generateTotp('JBSWY3DPEHPK3PXP', { digits: 4 });
      expect(code4).toMatch(/^\d{4}$/);
    });

    it('generates zero-padded codes', async () => {
      // Use a specific timestamp that generates a code starting with 0
      // We test by checking padding is maintained even if OTP starts with zeros
      const code = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 0 });
      expect(code.length).toBe(6);
    });

    it('generates consistent code for same timestamp', async () => {
      const timestamp = 1234567890000;
      const code1 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp });
      const code2 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp });
      expect(code1).toBe(code2);
    });

    it('generates different codes for different timestamps in different periods', async () => {
      const code1 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 0 });
      const code2 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 30000 });
      expect(code1).not.toBe(code2);
    });

    it('generates same code within the same 30-second period', async () => {
      const code1 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 1000 });
      const code2 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 29000 });
      expect(code1).toBe(code2);
    });

    it('throws error for empty secret', async () => {
      await expect(generateTotp('')).rejects.toThrow();
    });

    it('throws error for invalid Base32 secret', async () => {
      await expect(generateTotp('INVALID!')).rejects.toThrow('Invalid Base32 character');
    });

    // RFC 6238 Appendix B Test Vectors (SHA-1)
    // Note: The test secret in RFC 6238 is "12345678901234567890" in ASCII
    // which is "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ" in Base32
    describe('RFC 6238 test vectors (SHA-1)', () => {
      const testSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

      it('generates correct code at time 59', async () => {
        const code = await generateTotp(testSecret, {
          timestamp: 59 * 1000,
          algorithm: 'SHA-1'
        });
        expect(code).toBe('287082');
      });

      it('generates correct code at time 1111111109', async () => {
        const code = await generateTotp(testSecret, {
          timestamp: 1111111109 * 1000,
          algorithm: 'SHA-1'
        });
        expect(code).toBe('081804');
      });

      it('generates correct code at time 1111111111', async () => {
        const code = await generateTotp(testSecret, {
          timestamp: 1111111111 * 1000,
          algorithm: 'SHA-1'
        });
        expect(code).toBe('050471');
      });

      it('generates correct code at time 1234567890', async () => {
        const code = await generateTotp(testSecret, {
          timestamp: 1234567890 * 1000,
          algorithm: 'SHA-1'
        });
        expect(code).toBe('005924');
      });

      it('generates correct code at time 2000000000', async () => {
        const code = await generateTotp(testSecret, {
          timestamp: 2000000000 * 1000,
          algorithm: 'SHA-1'
        });
        expect(code).toBe('279037');
      });
    });

    it('supports SHA-256 algorithm', async () => {
      const code = await generateTotp('JBSWY3DPEHPK3PXP', {
        timestamp: 1234567890000,
        algorithm: 'SHA-256'
      });
      expect(code).toMatch(/^\d{6}$/);
    });

    it('supports SHA-512 algorithm', async () => {
      const code = await generateTotp('JBSWY3DPEHPK3PXP', {
        timestamp: 1234567890000,
        algorithm: 'SHA-512'
      });
      expect(code).toMatch(/^\d{6}$/);
    });

    it('supports custom period', async () => {
      // With 60-second period, timestamps 0 and 30000 should give same code
      const code1 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 0, period: 60 });
      const code2 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 30000, period: 60 });
      expect(code1).toBe(code2);

      // But timestamp 60000 should be different
      const code3 = await generateTotp('JBSWY3DPEHPK3PXP', { timestamp: 60000, period: 60 });
      expect(code1).not.toBe(code3);
    });
  });

  describe('getTotpTimeRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns 30 at period boundary', () => {
      // Set time to exactly a 30-second boundary
      vi.setSystemTime(new Date(0));
      expect(getTotpTimeRemaining()).toBe(30);
    });

    it('returns correct remaining time mid-period', () => {
      // 10 seconds into a period
      vi.setSystemTime(new Date(10000));
      expect(getTotpTimeRemaining()).toBe(20);
    });

    it('returns 1 just before period boundary', () => {
      // 29 seconds into a period
      vi.setSystemTime(new Date(29000));
      expect(getTotpTimeRemaining()).toBe(1);
    });

    it('supports custom period', () => {
      vi.setSystemTime(new Date(10000));
      expect(getTotpTimeRemaining(60)).toBe(50);
    });

    it('returns period value at exact boundary', () => {
      vi.setSystemTime(new Date(30000));
      expect(getTotpTimeRemaining()).toBe(30);
    });
  });

  describe('buildTotpUri', () => {
    it('builds basic URI with secret only', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user@example.com'
      });

      expect(uri).toBe('otpauth://totp/user%40example.com?secret=JBSWY3DPEHPK3PXP');
    });

    it('includes issuer in label and parameter', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        issuer: 'GitHub',
        accountName: 'user@example.com'
      });

      expect(uri).toBe('otpauth://totp/GitHub:user%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub');
    });

    it('normalizes secret (uppercase, no spaces)', () => {
      const uri = buildTotpUri({
        secret: 'jbsw y3dp ehpk 3pxp',
        accountName: 'user'
      });

      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    });

    it('URL-encodes special characters in account name', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user+test@example.com'
      });

      expect(uri).toContain('user%2Btest%40example.com');
    });

    it('URL-encodes special characters in issuer', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        issuer: 'Company & Co.',
        accountName: 'user'
      });

      expect(uri).toContain('Company%20%26%20Co.');
      expect(uri).toContain('issuer=Company+%26+Co.');
    });

    it('includes non-default algorithm', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user',
        algorithm: 'SHA256'
      });

      expect(uri).toContain('algorithm=SHA256');
    });

    it('omits default algorithm (SHA1)', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user',
        algorithm: 'SHA1'
      });

      expect(uri).not.toContain('algorithm=');
    });

    it('includes non-default digits', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user',
        digits: 8
      });

      expect(uri).toContain('digits=8');
    });

    it('omits default digits (6)', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user',
        digits: 6
      });

      expect(uri).not.toContain('digits=');
    });

    it('includes non-default period', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user',
        period: 60
      });

      expect(uri).toContain('period=60');
    });

    it('omits default period (30)', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user',
        period: 30
      });

      expect(uri).not.toContain('period=');
    });

    it('builds complete URI with all options', () => {
      const uri = buildTotpUri({
        secret: 'JBSWY3DPEHPK3PXP',
        issuer: 'TestApp',
        accountName: 'user@test.com',
        algorithm: 'SHA512',
        digits: 8,
        period: 60
      });

      expect(uri).toBe(
        'otpauth://totp/TestApp:user%40test.com?secret=JBSWY3DPEHPK3PXP&issuer=TestApp&algorithm=SHA512&digits=8&period=60'
      );
    });
  });
});
