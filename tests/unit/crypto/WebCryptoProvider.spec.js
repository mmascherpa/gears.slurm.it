import { describe, it, expect, beforeEach } from 'vitest'
import { WebCryptoProvider } from '@/crypto/providers/WebCryptoProvider'
import { ErrorCodes } from '@/crypto/CryptoProvider'

describe('WebCryptoProvider', () => {
  let provider

  beforeEach(() => {
    provider = new WebCryptoProvider()
  })

  describe('getInfo', () => {
    it('should return provider information', () => {
      const info = provider.getInfo()

      expect(info.name).toBe('WebCrypto')
      expect(info.version).toBe('1.0.0')
      expect(info.maxPasswordLength).toBe(1024)
      expect(info.fileExtension).toBe('.enc')
      expect(info.description).toContain('AES-256-GCM')
    })
  })

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const password = 'testPassword123'

      const encrypted = await provider.encrypt(data, password)

      expect(encrypted).toBeInstanceOf(Uint8Array)
      // Encrypted data should be larger (salt + iv + encrypted data)
      expect(encrypted.length).toBeGreaterThan(data.length)
      // Should have salt (16) + iv (12) + encrypted data
      expect(encrypted.length).toBeGreaterThanOrEqual(28)
    })

    it('should produce different output for same data (random salt/IV)', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'

      const encrypted1 = await provider.encrypt(data, password)
      const encrypted2 = await provider.encrypt(data, password)

      // Results should be different due to random salt and IV
      expect(encrypted1).not.toEqual(encrypted2)
    })

    it('should encrypt Blob data', async () => {
      const blob = new Blob(['test data'])
      const password = 'password123'

      const encrypted = await provider.encrypt(blob, password)

      expect(encrypted).toBeInstanceOf(Uint8Array)
      expect(encrypted.length).toBeGreaterThan(0)
    })

    it('should validate password before encrypting', async () => {
      const data = new Uint8Array([1, 2, 3])
      const longPassword = 'a'.repeat(1025)

      await expect(provider.encrypt(data, longPassword))
        .rejects.toThrow('Password too long')
    })

    it('should reject empty password', async () => {
      const data = new Uint8Array([1, 2, 3])

      await expect(provider.encrypt(data, ''))
        .rejects.toThrow('Password is required')
    })
  })

  describe('decrypt', () => {
    it('should decrypt encrypted data successfully', async () => {
      const originalData = new Uint8Array([1, 2, 3, 4, 5])
      const password = 'testPassword123'

      const encrypted = await provider.encrypt(originalData, password)
      const decrypted = await provider.decrypt(encrypted, password)

      expect(decrypted).toEqual(originalData)
    })

    it('should handle text data encryption/decryption', async () => {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      const originalText = 'Hello, World! This is a test.'
      const originalData = encoder.encode(originalText)
      const password = 'securePassword456'

      const encrypted = await provider.encrypt(originalData, password)
      const decrypted = await provider.decrypt(encrypted, password)
      const decryptedText = decoder.decode(decrypted)

      expect(decryptedText).toBe(originalText)
    })

    it('should fail with wrong password', async () => {
      const data = new Uint8Array([1, 2, 3])
      const encrypted = await provider.encrypt(data, 'correctPassword')

      await expect(provider.decrypt(encrypted, 'wrongPassword'))
        .rejects.toThrow()
    })

    it('should fail with corrupted data', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'
      const encrypted = await provider.encrypt(data, password)

      // Corrupt the encrypted data
      encrypted[20] = encrypted[20] ^ 0xFF

      await expect(provider.decrypt(encrypted, password))
        .rejects.toThrow()
    })

    it('should reject data that is too short', async () => {
      const tooShort = new Uint8Array([1, 2, 3]) // Less than salt + IV
      const password = 'password'

      await expect(provider.decrypt(tooShort, password))
        .rejects.toThrow('Invalid file format')
    })

    it('should decrypt Blob data', async () => {
      const originalData = new Uint8Array([1, 2, 3, 4, 5])
      const password = 'password123'
      const encrypted = await provider.encrypt(originalData, password)
      const encryptedBlob = new Blob([encrypted])

      const decrypted = await provider.decrypt(encryptedBlob, password)

      expect(decrypted).toEqual(originalData)
    })
  })

  describe('normalizeError', () => {
    it('should normalize wrong password error', () => {
      const error = provider.normalizeError('Wrong password or corrupted data')

      expect(error.code).toBe(ErrorCodes.WRONG_PASSWORD)
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize password required error', () => {
      const error = provider.normalizeError('Password is required')

      expect(error.code).toBe(ErrorCodes.PASSWORD_TOO_LONG)
      expect(error.userMessage).toContain('Password is required')
    })

    it('should normalize password too long error', () => {
      const error = provider.normalizeError('Password too long')

      expect(error.code).toBe(ErrorCodes.PASSWORD_TOO_LONG)
      expect(error.userMessage).toContain('Password too long')
    })

    it('should normalize invalid format error', () => {
      const error = provider.normalizeError('Invalid format: file too short')

      expect(error.code).toBe(ErrorCodes.INVALID_FORMAT)
      expect(error.userMessage).toContain('Invalid encrypted file')
    })

    it('should normalize encryption failed error', () => {
      const error = provider.normalizeError('encrypt failed: something went wrong')

      expect(error.code).toBe(ErrorCodes.ENCRYPTION_FAILED)
      expect(error.userMessage).toContain('Encryption failed')
    })

    it('should normalize decryption failed error', () => {
      const error = provider.normalizeError('decrypt failed: something went wrong')

      expect(error.code).toBe(ErrorCodes.DECRYPTION_FAILED)
      expect(error.userMessage).toContain('Decryption failed')
    })

    it('should return unknown error for unrecognized errors', () => {
      const error = provider.normalizeError('Random error')

      expect(error.code).toBe(ErrorCodes.UNKNOWN_ERROR)
      expect(error.userMessage).toContain('unexpected error')
    })
  })

  describe('round-trip encryption', () => {
    it('should handle empty data', async () => {
      const data = new Uint8Array([])
      const password = 'password'

      const encrypted = await provider.encrypt(data, password)
      const decrypted = await provider.decrypt(encrypted, password)

      expect(decrypted).toEqual(data)
    })

    it('should handle large data', async () => {
      // Create 1MB of data
      const data = new Uint8Array(1024 * 1024)
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256
      }
      const password = 'password'

      const encrypted = await provider.encrypt(data, password)
      const decrypted = await provider.decrypt(encrypted, password)

      expect(decrypted).toEqual(data)
    }, 10000) // 10 second timeout for large data test

    it('should handle different passwords for same data', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password1 = 'password1'
      const password2 = 'password2'

      const encrypted1 = await provider.encrypt(data, password1)
      const encrypted2 = await provider.encrypt(data, password2)

      // Should produce different ciphertexts
      expect(encrypted1).not.toEqual(encrypted2)

      // Each should decrypt with its own password
      const decrypted1 = await provider.decrypt(encrypted1, password1)
      const decrypted2 = await provider.decrypt(encrypted2, password2)

      expect(decrypted1).toEqual(data)
      expect(decrypted2).toEqual(data)

      // Should fail with wrong password
      await expect(provider.decrypt(encrypted1, password2)).rejects.toThrow()
      await expect(provider.decrypt(encrypted2, password1)).rejects.toThrow()
    })
  })

  describe('file format', () => {
    it('should prepend salt and IV to encrypted data', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'

      const encrypted = await provider.encrypt(data, password)

      // Salt is 16 bytes, IV is 12 bytes
      expect(encrypted.length).toBeGreaterThanOrEqual(16 + 12)

      // Extract salt and IV
      const salt = encrypted.slice(0, 16)
      const iv = encrypted.slice(16, 28)

      // Salt and IV should not be all zeros
      expect(salt.some(byte => byte !== 0)).toBe(true)
      expect(iv.some(byte => byte !== 0)).toBe(true)
    })

    it('should use different salt for each encryption', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'

      const encrypted1 = await provider.encrypt(data, password)
      const encrypted2 = await provider.encrypt(data, password)

      const salt1 = encrypted1.slice(0, 16)
      const salt2 = encrypted2.slice(0, 16)

      // Salts should be different
      expect(salt1).not.toEqual(salt2)
    })

    it('should use different IV for each encryption', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'

      const encrypted1 = await provider.encrypt(data, password)
      const encrypted2 = await provider.encrypt(data, password)

      const iv1 = encrypted1.slice(16, 28)
      const iv2 = encrypted2.slice(16, 28)

      // IVs should be different
      expect(iv1).not.toEqual(iv2)
    })
  })
})
