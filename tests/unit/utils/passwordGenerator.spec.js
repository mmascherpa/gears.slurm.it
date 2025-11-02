import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePassword, getDefaultOptions } from '@/utils/passwordGenerator'

describe('passwordGenerator', () => {
  beforeEach(() => {
    // Mock crypto.getRandomValues for predictable testing
    // Note: We'll restore it for randomness tests
    vi.spyOn(crypto, 'getRandomValues')
  })

  describe('getDefaultOptions', () => {
    it('should return correct default options', () => {
      const defaults = getDefaultOptions()

      expect(defaults).toEqual({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      })
    })

    it('should return a new object each time (not reference)', () => {
      const defaults1 = getDefaultOptions()
      const defaults2 = getDefaultOptions()

      expect(defaults1).toEqual(defaults2)
      expect(defaults1).not.toBe(defaults2)
    })
  })

  describe('generatePassword - validation', () => {
    it('should throw error for length less than 8', () => {
      expect(() => generatePassword({ length: 7 })).toThrow(
        'Password length must be between 8 and 64 characters'
      )
      expect(() => generatePassword({ length: 0 })).toThrow()
      expect(() => generatePassword({ length: -1 })).toThrow()
    })

    it('should throw error for length greater than 64', () => {
      expect(() => generatePassword({ length: 65 })).toThrow(
        'Password length must be between 8 and 64 characters'
      )
      expect(() => generatePassword({ length: 100 })).toThrow()
    })

    it('should accept length between 8 and 64', () => {
      expect(() => generatePassword({ length: 8 })).not.toThrow()
      expect(() => generatePassword({ length: 16 })).not.toThrow()
      expect(() => generatePassword({ length: 64 })).not.toThrow()
    })

    it('should throw error when no character types are selected', () => {
      expect(() => generatePassword({
        length: 16,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSpecial: false
      })).toThrow('At least one character type must be selected')
    })
  })

  describe('generatePassword - basic functionality', () => {
    it('should generate password of correct length', () => {
      const lengths = [8, 12, 16, 24, 32, 64]

      lengths.forEach(length => {
        const password = generatePassword({ length })
        expect(password).toHaveLength(length)
      })
    })

    it('should use default options when not specified', () => {
      const password = generatePassword({})
      expect(password).toHaveLength(16) // Default length
    })

    it('should generate password with only uppercase letters', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSpecial: false
      })

      expect(password).toMatch(/^[A-Z]+$/)
      expect(password).toHaveLength(20)
    })

    it('should generate password with only lowercase letters', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSpecial: false
      })

      expect(password).toMatch(/^[a-z]+$/)
    })

    it('should generate password with only numbers', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSpecial: false
      })

      expect(password).toMatch(/^[0-9]+$/)
    })

    it('should generate password with only special characters', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSpecial: true
      })

      expect(password).toMatch(/^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/)
    })
  })

  describe('generatePassword - character inclusion', () => {
    it('should include uppercase when enabled', () => {
      const password = generatePassword({
        length: 50,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      })

      expect(password).toMatch(/[A-Z]/)
    })

    it('should include lowercase when enabled', () => {
      const password = generatePassword({
        length: 50,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      })

      expect(password).toMatch(/[a-z]/)
    })

    it('should include numbers when enabled', () => {
      const password = generatePassword({
        length: 50,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      })

      expect(password).toMatch(/[0-9]/)
    })

    it('should include special characters when enabled', () => {
      const password = generatePassword({
        length: 50,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      })

      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/)
    })

    it('should guarantee at least one character from each selected type', () => {
      // Run multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const password = generatePassword({
          length: 16,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSpecial: true
        })

        expect(password).toMatch(/[A-Z]/)
        expect(password).toMatch(/[a-z]/)
        expect(password).toMatch(/[0-9]/)
        expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/)
      }
    })

    it('should not include disabled character types', () => {
      const password = generatePassword({
        length: 50,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: false, // Disabled
        includeSpecial: false  // Disabled
      })

      expect(password).toMatch(/^[A-Za-z]+$/)
      expect(password).not.toMatch(/[0-9]/)
      expect(password).not.toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/)
    })
  })

  describe('generatePassword - randomness', () => {
    it('should generate different passwords on consecutive calls', () => {
      const password1 = generatePassword({ length: 16 })
      const password2 = generatePassword({ length: 16 })
      const password3 = generatePassword({ length: 16 })

      // Very unlikely to generate the same password twice
      expect(password1).not.toBe(password2)
      expect(password2).not.toBe(password3)
      expect(password1).not.toBe(password3)
    })

    it('should produce varied character distribution', () => {
      const passwords = []
      for (let i = 0; i < 100; i++) {
        passwords.push(generatePassword({ length: 16 }))
      }

      // Check that we have variety (not all passwords start with same character)
      const firstChars = new Set(passwords.map(p => p[0]))
      expect(firstChars.size).toBeGreaterThan(10) // Should have variety
    })

    it('should use crypto.getRandomValues for randomness', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues')

      generatePassword({ length: 16 })

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('generatePassword - edge cases', () => {
    it('should handle minimum length with all character types', () => {
      // Minimum length is 8, all 4 types enabled = exactly 4 guaranteed + 4 random
      const password = generatePassword({
        length: 8,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      })

      expect(password).toHaveLength(8)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/)
    })

    it('should handle maximum length', () => {
      const password = generatePassword({ length: 64 })
      expect(password).toHaveLength(64)
    })

    it('should handle single character type with minimum length', () => {
      const password = generatePassword({
        length: 8,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSpecial: false
      })

      expect(password).toHaveLength(8)
      expect(password).toMatch(/^[A-Z]+$/)
    })

    it('should handle two character types', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: false,
        includeSpecial: false
      })

      expect(password).toMatch(/^[A-Za-z]+$/)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
    })

    it('should handle three character types', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: false
      })

      expect(password).toMatch(/^[A-Za-z0-9]+$/)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
    })
  })

  describe('generatePassword - security properties', () => {
    it('should not have predictable patterns', () => {
      const passwords = []
      for (let i = 0; i < 50; i++) {
        passwords.push(generatePassword({ length: 16 }))
      }

      // Ensure passwords don't all start with the same character type
      const startsWithUpper = passwords.filter(p => /^[A-Z]/.test(p)).length
      const startsWithLower = passwords.filter(p => /^[a-z]/.test(p)).length
      const startsWithNumber = passwords.filter(p => /^[0-9]/.test(p)).length
      const startsWithSpecial = passwords.filter(p => /^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(p)).length

      // Should have decent distribution (not all in one category)
      expect(startsWithUpper).toBeGreaterThan(0)
      expect(startsWithLower).toBeGreaterThan(0)
      expect(startsWithNumber).toBeGreaterThan(0)
      expect(startsWithSpecial).toBeGreaterThan(0)
    })

    it('should properly shuffle characters (no guaranteed chars at start)', () => {
      // The guaranteed characters should be shuffled, not always at the beginning
      const passwords = []
      for (let i = 0; i < 20; i++) {
        passwords.push(generatePassword({
          length: 8,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSpecial: true
        }))
      }

      // Check if all passwords have the same first 4 characters in same order
      // (would indicate lack of shuffling)
      const allSamePattern = passwords.every(p => {
        const first4Types = []
        for (let i = 0; i < 4; i++) {
          const char = p[i]
          if (/[A-Z]/.test(char)) first4Types.push('upper')
          else if (/[a-z]/.test(char)) first4Types.push('lower')
          else if (/[0-9]/.test(char)) first4Types.push('number')
          else first4Types.push('special')
        }
        return JSON.stringify(first4Types) === JSON.stringify(['upper', 'lower', 'number', 'special'])
      })

      // Should NOT all have same pattern (shuffling should vary)
      expect(allSamePattern).toBe(false)
    })
  })
})
