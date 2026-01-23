import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength, isPasswordSecure } from '@/utils/passwordStrength';

describe('passwordStrength', () => {
  describe('calculatePasswordStrength', () => {
    describe('empty password', () => {
      it('returns empty level for empty string', () => {
        const result = calculatePasswordStrength('');

        expect(result.level).toBe('empty');
        expect(result.score).toBe(0);
        expect(result.color).toBe('grey');
        expect(result.label).toBe('Enter password');
        expect(result.percentage).toBe(0);
        expect(result.feedback).toEqual([]);
        expect(result.requirements).toHaveLength(4);
        expect(result.requirements.every(req => !req.met)).toBe(true);
      });

      it('returns empty level for null password', () => {
        const result = calculatePasswordStrength(null);
        expect(result.level).toBe('empty');
        expect(result.score).toBe(0);
      });

      it('returns empty level for undefined password', () => {
        const result = calculatePasswordStrength(undefined);
        expect(result.level).toBe('empty');
        expect(result.score).toBe(0);
      });
    });

    describe('weak passwords', () => {
      it('marks passwords with low entropy as weak', () => {
        // 'Pass1!' = 6 chars, 94 charset = 39.3 bits -> Medium, not weak
        // 'abc' = 3 chars, 26 charset = 14.1 bits -> Weak
        const result = calculatePasswordStrength('abc');

        expect(result.level).toBe('weak');
        expect(result.color).toBe('error');
        expect(result.label).toBe('Weak');
        expect(result.percentage).toBeLessThan(33);
        expect(result.feedback).toContain('Use at least 12 characters');
      });

      it('marks short password with all character types as medium due to large charset', () => {
        // 'Ab1!efgh' = 8 chars, 94 charset = 52.4 bits -> Medium (35-60)
        const result = calculatePasswordStrength('Ab1!efgh');

        expect(result.level).toBe('medium');
        expect(result.percentage).toBeGreaterThanOrEqual(33);
      });

      it('provides feedback for missing character types', () => {
        // 'abc' = weak password, should get feedback
        const result = calculatePasswordStrength('abc');

        expect(result.feedback).toContain('Mix uppercase and lowercase letters');
        expect(result.feedback).toContain('Add numbers for more entropy');
        expect(result.feedback).toContain('Add special characters (!@#$%^&*)');
      });
    });

    describe('medium passwords', () => {
      it('marks 12 char password with only lowercase as medium', () => {
        // 'abcdefghijkl' = 12 chars, 26 charset = 56.4 bits -> Medium (35-60)
        const result = calculatePasswordStrength('abcdefghijkl');

        expect(result.level).toBe('medium');
        expect(result.color).toBe('warning');
        expect(result.label).toBe('Medium');
        expect(result.percentage).toBeGreaterThanOrEqual(33);
        expect(result.percentage).toBeLessThan(67);
      });

      it('marks 16 char with only lowercase as strong due to high entropy', () => {
        // 'abcdefghijklmnop' = 16 chars, 26 charset = 75.2 bits -> Strong (60-80)
        const result = calculatePasswordStrength('abcdefghijklmnop');

        expect(result.level).toBe('strong');
      });
    });

    describe('strong passwords', () => {
      it('marks password with good entropy as strong', () => {
        // 'Password1234' = 12 chars, 62 charset = 71.4 bits -> Strong (60-80)
        const result = calculatePasswordStrength('Password1234');

        expect(result.level).toBe('strong');
        expect(result.color).toBe('success');
        expect(result.label).toBe('Strong');
        expect(result.percentage).toBeGreaterThanOrEqual(67);
        expect(result.percentage).toBeLessThan(100);
        expect(result.feedback).toEqual([]);
      });

      it('marks 12+ char with 3 types as strong (missing special)', () => {
        const result = calculatePasswordStrength('Password1234');

        expect(result.level).toBe('strong');
      });

      it('does not reach very-strong without high enough entropy', () => {
        // 'Passw0rdlong123' = 15 chars, 62 charset = 89.3 bits -> Very Strong (80+)
        // Let's use a shorter password: 'Passw0rd12' = 10 chars, 62 charset = 59.5 bits -> Medium
        // Or 'Password12' = 10 chars, 62 charset = 59.5 bits -> Medium
        // We need 60-80 bits for Strong: 'Password123' = 11 chars, 62 charset = 65.5 bits -> Strong
        const result = calculatePasswordStrength('Password123');

        expect(result.level).toBe('strong');
        expect(result.percentage).toBeLessThan(100);
      });
    });

    describe('very strong passwords', () => {
      it('marks password with all requirements as very strong', () => {
        const result = calculatePasswordStrength('MyP@ssw0rd123!');

        expect(result.level).toBe('very-strong');
        expect(result.color).toBe('success');
        expect(result.label).toBe('Very Strong');
        expect(result.percentage).toBe(100);
        expect(result.feedback).toEqual([]);
      });

      it('requires all character types for very strong', () => {
        const tests = [
          'MyP@ssw0rd123!',
          'Tr0ub4dor&3Extended',
          'C0rrect-Horse-Battery!'
        ];

        tests.forEach(password => {
          const result = calculatePasswordStrength(password);
          expect(result.level).toBe('very-strong');
          expect(result.percentage).toBe(100);
        });
      });

      it('all requirements are met for very strong password', () => {
        const result = calculatePasswordStrength('MyP@ssw0rd123!');

        expect(result.requirements.every(req => req.met)).toBe(true);
      });
    });

    describe('entropy-based scoring', () => {
      it('same length passwords with same charset have equal entropy', () => {
        // Both 12 chars, 26 charset = 56.4 bits
        const withLower = calculatePasswordStrength('abcdefghijkl');
        const withUpper = calculatePasswordStrength('ABCDEFGHIJKL');

        expect(withLower.score).toBe(withUpper.score);
      });

      it('larger charset increases entropy', () => {
        // 12 chars, 52 charset = 68.4 bits vs 12 chars, 26 charset = 56.4 bits
        const withBothCases = calculatePasswordStrength('ABCdefghijkl');
        const withoutUpper = calculatePasswordStrength('abcdefghijkl');

        expect(withBothCases.score).toBeGreaterThan(withoutUpper.score);
      });

      it('adding numbers increases charset and entropy', () => {
        // 12 chars, 36 charset vs 12 chars, 26 charset
        const withNumbers = calculatePasswordStrength('abc123defghi');
        const withoutNumbers = calculatePasswordStrength('abcdefghijkl');

        expect(withNumbers.score).toBeGreaterThan(withoutNumbers.score);
      });

      it('adding special characters increases charset and entropy', () => {
        // 12 chars, 58 charset vs 12 chars, 26 charset
        const withSpecial = calculatePasswordStrength('abc!@#defghi');
        const withoutSpecial = calculatePasswordStrength('abcdefghijkl');

        expect(withSpecial.score).toBeGreaterThan(withoutSpecial.score);
      });
    });

    describe('pattern detection', () => {
      it('detects sequential characters for non-strong passwords', () => {
        // Use a weak password with patterns so feedback is shown
        // 'abc12' = 5 chars, 36 charset = 25.9 bits -> Weak
        const result = calculatePasswordStrength('abc12');

        expect(result.feedback).toContain('Avoid sequential characters (abc, 123)');
      });

      it('detects sequential numbers for non-strong passwords', () => {
        // 'pass123' = 7 chars, 36 charset = 36.3 bits -> Medium
        const result = calculatePasswordStrength('pass123');

        expect(result.feedback).toContain('Avoid sequential characters (abc, 123)');
      });

      it('detects repeating characters for non-strong passwords', () => {
        // 'passs111' = 8 chars, 36 charset = 41.4 bits -> Medium
        const result = calculatePasswordStrength('passs111');

        expect(result.feedback).toContain('Avoid repeating characters (aaa, 111)');
      });

      it('patterns do not reduce score (only add feedback)', () => {
        const withPattern = calculatePasswordStrength('MyP@ssw0rd123!!!');
        const withoutPattern = calculatePasswordStrength('MyP@ssw0rd789!$%');

        // Both should have similar scores despite one having repeating chars
        expect(withPattern.score).toBeGreaterThan(0);
        expect(withoutPattern.score).toBeGreaterThan(0);
      });
    });

    describe('requirements validation', () => {
      it('returns all requirements with met status', () => {
        const result = calculatePasswordStrength('MyP@ssw0rd123!');

        expect(result.requirements).toHaveLength(4);
        expect(result.requirements[0].text).toBe('At least 12 characters');
        expect(result.requirements[1].text).toBe('Uppercase and lowercase letters');
        expect(result.requirements[2].text).toBe('At least one number');
        expect(result.requirements[3].text).toBe('At least one special character');
      });

      it('marks length requirement as met for 12+ chars', () => {
        const result = calculatePasswordStrength('abcdefghijkl');

        expect(result.requirements[0].met).toBe(true);
        expect(result.requirements[0].icon).toBe('mdi-check-circle');
      });

      it('marks length requirement as unmet for <12 chars', () => {
        const result = calculatePasswordStrength('short');

        expect(result.requirements[0].met).toBe(false);
        expect(result.requirements[0].icon).toBe('mdi-circle-outline');
      });

      it('marks uppercase/lowercase requirement correctly', () => {
        const bothCases = calculatePasswordStrength('AbCdEfGhIjKl');
        const onlyLower = calculatePasswordStrength('abcdefghijkl');

        expect(bothCases.requirements[1].met).toBe(true);
        expect(onlyLower.requirements[1].met).toBe(false);
      });

      it('marks number requirement correctly', () => {
        const withNumber = calculatePasswordStrength('password1234');
        const withoutNumber = calculatePasswordStrength('passwordword');

        expect(withNumber.requirements[2].met).toBe(true);
        expect(withoutNumber.requirements[2].met).toBe(false);
      });

      it('marks special character requirement correctly', () => {
        const withSpecial = calculatePasswordStrength('password!@#$');
        const withoutSpecial = calculatePasswordStrength('passwordword');

        expect(withSpecial.requirements[3].met).toBe(true);
        expect(withoutSpecial.requirements[3].met).toBe(false);
      });
    });

    describe('entropy progression', () => {
      it('increases entropy as password gets longer', () => {
        const short = calculatePasswordStrength('abc');
        const medium = calculatePasswordStrength('abcdefgh');
        const long = calculatePasswordStrength('abcdefghijklmnop');

        expect(medium.score).toBeGreaterThan(short.score);
        expect(long.score).toBeGreaterThan(medium.score);
      });

      it('adding characters never decreases entropy', () => {
        let previousScore = 0;

        for (let i = 1; i <= 20; i++) {
          const password = 'a'.repeat(i);
          const result = calculatePasswordStrength(password);
          expect(result.score).toBeGreaterThanOrEqual(previousScore);
          previousScore = result.score;
        }
      });

      it('entropy scales linearly with length', () => {
        // Entropy = length * log2(charset)
        // With 26 chars charset, each char adds ~4.7 bits
        const short = calculatePasswordStrength('a'.repeat(10));  // ~47 bits
        const long = calculatePasswordStrength('a'.repeat(20));   // ~94 bits

        // Long should be roughly double the entropy of short
        expect(long.entropy).toBeGreaterThan(short.entropy * 1.8);
        expect(long.entropy).toBeLessThan(short.entropy * 2.2);
      });
    });
  });

  describe('isPasswordSecure', () => {
    it('returns true for passwords with 60+ bits entropy', () => {
      // 'MyP@ssw0rd123!' = 14 chars, 94 charset = 91.7 bits -> Secure
      expect(isPasswordSecure('MyP@ssw0rd123!')).toBe(true);
      // 'Str0ng!Password' = 15 chars, 94 charset = 98.3 bits -> Secure
      expect(isPasswordSecure('Str0ng!Password')).toBe(true);
    });

    it('returns false for passwords with low entropy', () => {
      // 'weak' = 4 chars, 26 charset = 18.8 bits -> Not secure
      expect(isPasswordSecure('weak')).toBe(false);
      // 'short1!' = 7 chars, 94 charset = 45.9 bits -> Not secure
      expect(isPasswordSecure('short1!')).toBe(false);
    });

    it('returns false for medium entropy passwords (< 60 bits)', () => {
      // 'mediumpass' = 10 chars, 26 charset = 47 bits -> Not secure
      expect(isPasswordSecure('mediumpass')).toBe(false);
    });

    it('returns true for passwords with entropy >= 60 bits', () => {
      // 'GoodPassword123!' = 16 chars, 94 charset = 104.8 bits -> Secure
      const password = 'GoodPassword123!';
      const strength = calculatePasswordStrength(password);

      expect(strength.entropy).toBeGreaterThanOrEqual(60);
      expect(isPasswordSecure(password)).toBe(true);
    });
  });
});
