import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generatePassphrase,
  calculatePassphraseEntropy,
  getDefaultPassphraseOptions,
  SEPARATORS,
  CAPITALIZATION,
  SPECIAL_POSITION
} from '@/utils/passphraseGenerator'
import { EFF_WORDLIST, WORDLIST_SIZE, BITS_PER_WORD } from '@/data/effWordlist'

describe('passphraseGenerator', () => {
  beforeEach(() => {
    vi.spyOn(crypto, 'getRandomValues')
  })

  describe('EFF wordlist', () => {
    it('should have correct wordlist size', () => {
      expect(EFF_WORDLIST).toHaveLength(7776)
      expect(WORDLIST_SIZE).toBe(7776)
    })

    it('should have correct bits per word', () => {
      expect(BITS_PER_WORD).toBeCloseTo(12.925, 2)
    })

    it('should contain only lowercase words (may include hyphens)', () => {
      EFF_WORDLIST.forEach(word => {
        // EFF wordlist contains some hyphenated words like "drop-down"
        expect(word).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })
  })

  describe('getDefaultPassphraseOptions', () => {
    it('should return correct default options', () => {
      const defaults = getDefaultPassphraseOptions()

      expect(defaults).toEqual({
        wordCount: 5,
        separator: SEPARATORS.HYPHEN,
        capitalization: CAPITALIZATION.TITLE_CASE,
        appendNumber: true,
        numberDigits: 4,
        specialPosition: SPECIAL_POSITION.END,
        specialCount: 2
      })
    })

    it('should return a new object each time', () => {
      const defaults1 = getDefaultPassphraseOptions()
      const defaults2 = getDefaultPassphraseOptions()

      expect(defaults1).toEqual(defaults2)
      expect(defaults1).not.toBe(defaults2)
    })
  })

  describe('generatePassphrase - validation', () => {
    it('should throw error for word count less than 3', () => {
      expect(() => generatePassphrase({ wordCount: 2 })).toThrow(
        'Word count must be between 3 and 8'
      )
      expect(() => generatePassphrase({ wordCount: 0 })).toThrow()
      expect(() => generatePassphrase({ wordCount: -1 })).toThrow()
    })

    it('should throw error for word count greater than 8', () => {
      expect(() => generatePassphrase({ wordCount: 9 })).toThrow(
        'Word count must be between 3 and 8'
      )
      expect(() => generatePassphrase({ wordCount: 100 })).toThrow()
    })

    it('should accept word count between 3 and 8', () => {
      expect(() => generatePassphrase({ wordCount: 3 })).not.toThrow()
      expect(() => generatePassphrase({ wordCount: 5 })).not.toThrow()
      expect(() => generatePassphrase({ wordCount: 8 })).not.toThrow()
    })

    it('should throw error for digit count less than 1', () => {
      expect(() => generatePassphrase({ appendNumber: true, numberDigits: 0 })).toThrow(
        'Number of digits must be between 1 and 8'
      )
    })

    it('should throw error for digit count greater than 8', () => {
      expect(() => generatePassphrase({ appendNumber: true, numberDigits: 9 })).toThrow(
        'Number of digits must be between 1 and 8'
      )
    })

    it('should accept digit count between 1 and 8', () => {
      expect(() => generatePassphrase({ appendNumber: true, numberDigits: 1 })).not.toThrow()
      expect(() => generatePassphrase({ appendNumber: true, numberDigits: 8 })).not.toThrow()
    })

    it('should throw error for special char count less than 1', () => {
      expect(() => generatePassphrase({ specialPosition: SPECIAL_POSITION.END, specialCount: 0 })).toThrow(
        'Special character count must be between 1 and 8'
      )
    })

    it('should throw error for special char count greater than 8', () => {
      expect(() => generatePassphrase({ specialPosition: SPECIAL_POSITION.END, specialCount: 9 })).toThrow(
        'Special character count must be between 1 and 8'
      )
    })
  })

  describe('generatePassphrase - basic functionality', () => {
    it('should generate passphrase with correct number of words', () => {
      for (let wordCount = 3; wordCount <= 8; wordCount++) {
        const passphrase = generatePassphrase({
          wordCount,
          separator: SEPARATORS.HYPHEN,
          appendNumber: false
        })
        const words = passphrase.split('-')
        expect(words).toHaveLength(wordCount)
      }
    })

    it('should use default options when not specified', () => {
      const passphrase = generatePassphrase({})
      // Default: 4 words with hyphen separator, appendNumber defaults to false in function
      const parts = passphrase.split('-')
      expect(parts).toHaveLength(4) // 4 words (appendNumber defaults to false)
    })

    it('should use specified separator', () => {
      const hyphen = generatePassphrase({ separator: SEPARATORS.HYPHEN, appendNumber: false })
      expect(hyphen).toMatch(/-/)

      const space = generatePassphrase({ separator: SEPARATORS.SPACE, appendNumber: false })
      expect(space).toMatch(/ /)

      const period = generatePassphrase({ separator: SEPARATORS.PERIOD, appendNumber: false })
      expect(period).toMatch(/\./)

      const underscore = generatePassphrase({ separator: SEPARATORS.UNDERSCORE, appendNumber: false })
      expect(underscore).toMatch(/_/)

      const none = generatePassphrase({ separator: SEPARATORS.NONE, appendNumber: false })
      expect(none).not.toMatch(/[-\s._]/)
    })

    it('should apply title case capitalization', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        capitalization: CAPITALIZATION.TITLE_CASE,
        appendNumber: false
      })

      const words = passphrase.split('-')
      words.forEach(word => {
        // First letter uppercase, rest lowercase
        expect(word[0]).toMatch(/[A-Z]/)
        expect(word.slice(1)).toMatch(/^[a-z]*$/)
      })
    })

    it('should apply lowercase capitalization', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        capitalization: CAPITALIZATION.LOWERCASE,
        appendNumber: false
      })

      expect(passphrase).toMatch(/^[a-z-]+$/)
    })

    it('should apply uppercase capitalization', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        capitalization: CAPITALIZATION.UPPERCASE,
        appendNumber: false
      })

      expect(passphrase).toMatch(/^[A-Z-]+$/)
    })

    it('should apply random capitalization', () => {
      // Generate multiple to check we get variation
      const passphrases = []
      for (let i = 0; i < 20; i++) {
        passphrases.push(generatePassphrase({
          wordCount: 4,
          separator: SEPARATORS.HYPHEN,
          capitalization: CAPITALIZATION.RANDOM,
          appendNumber: false
        }))
      }

      // Should have some uppercase and some lowercase words
      const hasUpper = passphrases.some(p => /[A-Z]/.test(p))
      const hasLower = passphrases.some(p => /[a-z]/.test(p))
      expect(hasUpper).toBe(true)
      expect(hasLower).toBe(true)
    })

    it('should append number when enabled', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        appendNumber: true,
        numberDigits: 4
      })

      // Last part should be a 4-digit number
      const parts = passphrase.split('-')
      const lastPart = parts[parts.length - 1]
      expect(lastPart).toMatch(/^\d{4}$/)
    })

    it('should generate correct number of digits (1-8)', () => {
      for (let digits = 1; digits <= 8; digits++) {
        const passphrase = generatePassphrase({
          wordCount: 3,
          separator: SEPARATORS.HYPHEN,
          appendNumber: true,
          numberDigits: digits
        })

        const parts = passphrase.split('-')
        const number = parts[parts.length - 1]
        expect(number).toHaveLength(digits)
        expect(number).toMatch(/^\d+$/)
      }
    })

    it('should not append number when disabled', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        appendNumber: false
      })

      const parts = passphrase.split('-')
      expect(parts).toHaveLength(4)
      parts.forEach(part => {
        expect(part).not.toMatch(/^\d+$/)
      })
    })

    it('should add special characters at start', () => {
      const passphrase = generatePassphrase({
        wordCount: 3,
        separator: SEPARATORS.HYPHEN,
        appendNumber: false,
        specialPosition: SPECIAL_POSITION.START,
        specialCount: 2
      })

      const parts = passphrase.split('-')
      expect(parts).toHaveLength(4) // specials + 3 words
      expect(parts[0]).toMatch(/^[!@#$%^&*]+$/)
      expect(parts[0]).toHaveLength(2)
    })

    it('should add special characters at end', () => {
      const passphrase = generatePassphrase({
        wordCount: 3,
        separator: SEPARATORS.HYPHEN,
        appendNumber: false,
        specialPosition: SPECIAL_POSITION.END,
        specialCount: 3
      })

      const parts = passphrase.split('-')
      expect(parts).toHaveLength(4) // 3 words + specials
      expect(parts[parts.length - 1]).toMatch(/^[!@#$%^&*]+$/)
      expect(parts[parts.length - 1]).toHaveLength(3)
    })

    it('should not add special characters when position is none', () => {
      const passphrase = generatePassphrase({
        wordCount: 3,
        separator: SEPARATORS.HYPHEN,
        appendNumber: false,
        specialPosition: SPECIAL_POSITION.NONE,
        specialCount: 2
      })

      const parts = passphrase.split('-')
      expect(parts).toHaveLength(3)
      parts.forEach(part => {
        expect(part).not.toMatch(/^[!@#$%^&*]+$/)
      })
    })

    it('should generate correct number of special characters', () => {
      for (let count = 1; count <= 8; count++) {
        const passphrase = generatePassphrase({
          wordCount: 3,
          separator: SEPARATORS.HYPHEN,
          appendNumber: false,
          specialPosition: SPECIAL_POSITION.END,
          specialCount: count
        })

        const parts = passphrase.split('-')
        const specials = parts[parts.length - 1]
        expect(specials).toHaveLength(count)
        expect(specials).toMatch(/^[!@#$%^&*]+$/)
      }
    })

    it('should combine special chars, words, and number correctly', () => {
      const passphrase = generatePassphrase({
        wordCount: 3,
        separator: SEPARATORS.HYPHEN,
        capitalization: CAPITALIZATION.TITLE_CASE,
        appendNumber: true,
        numberDigits: 4,
        specialPosition: SPECIAL_POSITION.START,
        specialCount: 2
      })

      const parts = passphrase.split('-')
      // 2 specials + 3 words + 4-digit number = 5 parts
      expect(parts).toHaveLength(5)
      expect(parts[0]).toMatch(/^[!@#$%^&*]{2}$/) // specials at start
      expect(parts[4]).toMatch(/^\d{4}$/) // number at end
    })
  })

  describe('generatePassphrase - randomness', () => {
    it('should generate different passphrases on consecutive calls', () => {
      const passphrase1 = generatePassphrase({})
      const passphrase2 = generatePassphrase({})
      const passphrase3 = generatePassphrase({})

      expect(passphrase1).not.toBe(passphrase2)
      expect(passphrase2).not.toBe(passphrase3)
      expect(passphrase1).not.toBe(passphrase3)
    })

    it('should use crypto.getRandomValues for word selection', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues')

      generatePassphrase({})

      expect(spy).toHaveBeenCalled()
    })

    it('should produce varied word distribution', () => {
      const passphrases = []
      for (let i = 0; i < 50; i++) {
        passphrases.push(generatePassphrase({
          wordCount: 4,
          separator: SEPARATORS.HYPHEN,
          capitalization: CAPITALIZATION.LOWERCASE,
          appendNumber: false
        }))
      }

      // Check that we have variety in first words
      const firstWords = new Set(passphrases.map(p => p.split('-')[0]))
      expect(firstWords.size).toBeGreaterThan(20) // Should have variety
    })

    it('should use words from EFF wordlist', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        capitalization: CAPITALIZATION.LOWERCASE,
        appendNumber: false
      })

      const words = passphrase.split('-')
      words.forEach(word => {
        expect(EFF_WORDLIST).toContain(word)
      })
    })
  })

  describe('calculatePassphraseEntropy', () => {
    it('should calculate correct entropy for word count only', () => {
      // 4 words × ~12.925 bits = ~51.7 bits
      const entropy = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false
      })

      expect(entropy).toBeCloseTo(51.7, 0)
    })

    it('should scale linearly with word count', () => {
      const entropy3 = calculatePassphraseEntropy({ wordCount: 3, appendNumber: false })
      const entropy4 = calculatePassphraseEntropy({ wordCount: 4, appendNumber: false })
      const entropy5 = calculatePassphraseEntropy({ wordCount: 5, appendNumber: false })

      expect(entropy4 - entropy3).toBeCloseTo(BITS_PER_WORD, 1)
      expect(entropy5 - entropy4).toBeCloseTo(BITS_PER_WORD, 1)
    })

    it('should add correct entropy for appended number', () => {
      const withoutNumber = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false
      })

      const with4Digits = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: true,
        numberDigits: 4
      })

      // 4 digits = 4 × log2(10) ≈ 13.29 bits
      const numberEntropy = with4Digits - withoutNumber
      expect(numberEntropy).toBeCloseTo(13.29, 1)
    })

    it('should add correct entropy for each digit', () => {
      const base = calculatePassphraseEntropy({ wordCount: 4, appendNumber: false })

      for (let digits = 1; digits <= 4; digits++) {
        const withDigits = calculatePassphraseEntropy({
          wordCount: 4,
          appendNumber: true,
          numberDigits: digits
        })

        const expectedNumberEntropy = digits * Math.log2(10)
        expect(withDigits - base).toBeCloseTo(expectedNumberEntropy, 1)
      }
    })

    it('should add entropy for random capitalization', () => {
      const titleCase = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false,
        capitalization: CAPITALIZATION.TITLE_CASE
      })

      const random = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false,
        capitalization: CAPITALIZATION.RANDOM
      })

      // Random cap adds 1 bit per word
      expect(random - titleCase).toBe(4)
    })

    it('should calculate typical passphrase entropy correctly', () => {
      // 4 words + 4 digits (default config)
      const entropy = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: true,
        numberDigits: 4,
        capitalization: CAPITALIZATION.TITLE_CASE
      })

      // 4 × 12.925 + 4 × 3.32 ≈ 65 bits
      expect(entropy).toBeCloseTo(65, 0)
    })

    it('should calculate 6-word passphrase entropy correctly', () => {
      const entropy = calculatePassphraseEntropy({
        wordCount: 6,
        appendNumber: false
      })

      // 6 × 12.925 ≈ 77.5 bits (EFF recommended minimum)
      expect(entropy).toBeCloseTo(77.5, 0)
    })

    it('should add correct entropy for special characters', () => {
      const withoutSpecials = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false,
        specialPosition: SPECIAL_POSITION.NONE
      })

      const with2Specials = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false,
        specialPosition: SPECIAL_POSITION.END,
        specialCount: 2
      })

      // 2 specials from 8-char pool = 2 × log2(8) = 6 bits
      const specialEntropy = with2Specials - withoutSpecials
      expect(specialEntropy).toBeCloseTo(6, 1)
    })

    it('should add entropy for each special character', () => {
      const base = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: false,
        specialPosition: SPECIAL_POSITION.NONE
      })

      for (let count = 1; count <= 8; count++) {
        const withSpecials = calculatePassphraseEntropy({
          wordCount: 4,
          appendNumber: false,
          specialPosition: SPECIAL_POSITION.END,
          specialCount: count
        })

        // Each special char adds log2(8) = 3 bits
        const expectedEntropy = count * Math.log2(8)
        expect(withSpecials - base).toBeCloseTo(expectedEntropy, 1)
      }
    })

    it('should calculate entropy with all options combined', () => {
      const entropy = calculatePassphraseEntropy({
        wordCount: 4,
        appendNumber: true,
        numberDigits: 4,
        capitalization: CAPITALIZATION.RANDOM,
        specialPosition: SPECIAL_POSITION.END,
        specialCount: 2
      })

      // 4 × 12.925 (words) + 4 × 3.32 (digits) + 4 (random cap) + 6 (specials) ≈ 75 bits
      expect(entropy).toBeCloseTo(75, 0)
    })
  })

  describe('generatePassphrase - edge cases', () => {
    it('should handle minimum word count', () => {
      const passphrase = generatePassphrase({
        wordCount: 3,
        appendNumber: false
      })

      const parts = passphrase.split('-')
      expect(parts).toHaveLength(3)
    })

    it('should handle maximum word count', () => {
      const passphrase = generatePassphrase({
        wordCount: 8,
        appendNumber: false
      })

      const parts = passphrase.split('-')
      expect(parts).toHaveLength(8)
    })

    it('should handle empty separator with number', () => {
      const passphrase = generatePassphrase({
        wordCount: 3,
        separator: SEPARATORS.NONE,
        capitalization: CAPITALIZATION.TITLE_CASE,
        appendNumber: true,
        numberDigits: 4
      })

      // Should be concatenated words + number
      expect(passphrase).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+\d{4}$/)
    })

    it('should handle single digit number', () => {
      const passphrase = generatePassphrase({
        wordCount: 4,
        separator: SEPARATORS.HYPHEN,
        appendNumber: true,
        numberDigits: 1
      })

      const parts = passphrase.split('-')
      const number = parts[parts.length - 1]
      expect(number).toMatch(/^\d$/)
    })

    it('should pad numbers with leading zeros', () => {
      // Generate many to ensure we hit some small numbers
      let foundPadded = false
      for (let i = 0; i < 100; i++) {
        const passphrase = generatePassphrase({
          wordCount: 3,
          separator: SEPARATORS.HYPHEN,
          appendNumber: true,
          numberDigits: 4
        })

        const parts = passphrase.split('-')
        const number = parts[parts.length - 1]

        // All should be exactly 4 digits
        expect(number).toHaveLength(4)

        // Check if we found one with leading zeros (e.g., 0001, 0123)
        if (number.startsWith('0')) {
          foundPadded = true
        }
      }

      // We should eventually see a padded number (statistical)
      // This might rarely fail, but demonstrates the padding works
      expect(foundPadded).toBe(true)
    })
  })

  describe('SEPARATORS constant', () => {
    it('should have all expected separators', () => {
      expect(SEPARATORS.HYPHEN).toBe('-')
      expect(SEPARATORS.SPACE).toBe(' ')
      expect(SEPARATORS.PERIOD).toBe('.')
      expect(SEPARATORS.UNDERSCORE).toBe('_')
      expect(SEPARATORS.NONE).toBe('')
    })
  })

  describe('CAPITALIZATION constant', () => {
    it('should have all expected capitalization options', () => {
      expect(CAPITALIZATION.TITLE_CASE).toBe('title')
      expect(CAPITALIZATION.LOWERCASE).toBe('lower')
      expect(CAPITALIZATION.UPPERCASE).toBe('upper')
      expect(CAPITALIZATION.RANDOM).toBe('random')
    })
  })

  describe('SPECIAL_POSITION constant', () => {
    it('should have all expected position options', () => {
      expect(SPECIAL_POSITION.NONE).toBe('none')
      expect(SPECIAL_POSITION.START).toBe('start')
      expect(SPECIAL_POSITION.END).toBe('end')
    })
  })
})
