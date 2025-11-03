import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JsAesCryptProvider } from '@/crypto/providers/JsAesCryptProvider'
import { ErrorCodes } from '@/crypto/CryptoProvider'

describe('JsAesCryptProvider', () => {
  let provider
  let mockAesCrypt

  beforeEach(() => {
    // Mock jsAesCrypt library
    mockAesCrypt = {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      info: {
        version: '0.15',
        maxPassLen: 1024,
        fileFormatVersion: 2,
        AESBlockSize: 16
      }
    }

    provider = new JsAesCryptProvider()
    provider.setLibrary(mockAesCrypt)
  })

  describe('getInfo', () => {
    it('should return provider information', () => {
      const info = provider.getInfo()

      expect(info.name).toBe('jsAesCrypt')
      expect(info.version).toBe('0.15')
      expect(info.maxPasswordLength).toBe(1024)
      expect(info.fileExtension).toBe('.aes')
      expect(info.description).toContain('AES-256')
    })

    it('should use defaults if library not loaded', () => {
      const provider = new JsAesCryptProvider()
      const info = provider.getInfo()

      expect(info.version).toBe('0.15')
      expect(info.maxPasswordLength).toBe(1024)
    })
  })

  describe('encrypt', () => {
    it('should call aesCrypt.encrypt with correct parameters', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password123'
      const encrypted = new Uint8Array([4, 5, 6])

      mockAesCrypt.encrypt.mockResolvedValue(encrypted)

      const result = await provider.encrypt(data, password)

      expect(mockAesCrypt.encrypt).toHaveBeenCalledWith(data, password)
      expect(result).toBe(encrypted)
    })

    it('should throw error if library not loaded', async () => {
      const provider = new JsAesCryptProvider()
      await expect(provider.encrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('jsAesCrypt library not loaded')
    })

    it('should validate password before encrypting', async () => {
      const longPassword = 'a'.repeat(1025)
      await expect(provider.encrypt(new Uint8Array([1, 2, 3]), longPassword))
        .rejects.toThrow('Password too long')
    })

    it('should enhance errors with context', async () => {
      mockAesCrypt.encrypt.mockRejectedValue(new Error('encryption failed'))

      await expect(provider.encrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('encrypt failed: encryption failed')
    })

    it('should handle string errors from library', async () => {
      mockAesCrypt.encrypt.mockRejectedValue('Password is too long')

      await expect(provider.encrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('encrypt failed: Password is too long')
    })
  })

  describe('decrypt', () => {
    it('should call aesCrypt.decrypt with correct parameters', async () => {
      const data = new Uint8Array([4, 5, 6])
      const password = 'password123'
      const decrypted = new Uint8Array([1, 2, 3])

      mockAesCrypt.decrypt.mockResolvedValue(decrypted)

      const result = await provider.decrypt(data, password)

      expect(mockAesCrypt.decrypt).toHaveBeenCalledWith(data, password)
      expect(result).toBe(decrypted)
    })

    it('should throw error if library not loaded', async () => {
      const provider = new JsAesCryptProvider()
      await expect(provider.decrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('jsAesCrypt library not loaded')
    })

    it('should enhance errors with context', async () => {
      mockAesCrypt.decrypt.mockRejectedValue(new Error('decryption failed'))

      await expect(provider.decrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('decrypt failed: decryption failed')
    })
  })

  describe('normalizeError', () => {
    it('should normalize wrong password error', () => {
      const error = provider.normalizeError('Wrong password')

      expect(error.code).toBe(ErrorCodes.WRONG_PASSWORD)
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize Bad HMAC error as wrong password', () => {
      const error = provider.normalizeError('Bad HMAC')

      expect(error.code).toBe(ErrorCodes.WRONG_PASSWORD)
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize password too long error', () => {
      const error = provider.normalizeError('Password is too long')

      expect(error.code).toBe(ErrorCodes.PASSWORD_TOO_LONG)
      expect(error.userMessage).toContain('Password too long')
      expect(error.userMessage).toContain('1024')
    })

    it('should normalize corrupted data error', () => {
      const error = provider.normalizeError('File corrupted')

      expect(error.code).toBe(ErrorCodes.CORRUPTED_DATA)
      expect(error.userMessage).toContain('corrupted or tampered')
    })

    it('should normalize invalid format error', () => {
      const error = provider.normalizeError('not an AES Crypt file')

      expect(error.code).toBe(ErrorCodes.INVALID_FORMAT)
      expect(error.userMessage).toContain('not a valid AES')
    })

    it('should handle Error objects', () => {
      const error = provider.normalizeError(new Error('Wrong password'))

      expect(error.code).toBe(ErrorCodes.WRONG_PASSWORD)
      expect(error.message).toBe('Wrong password')
    })

    it('should return unknown error for unrecognized errors', () => {
      const error = provider.normalizeError('Some random error')

      expect(error.code).toBe(ErrorCodes.UNKNOWN_ERROR)
      expect(error.userMessage).toContain('unexpected error')
    })

    it('should be case-insensitive', () => {
      const error1 = provider.normalizeError('WRONG PASSWORD')
      const error2 = provider.normalizeError('wrong password')

      expect(error1.code).toBe(ErrorCodes.WRONG_PASSWORD)
      expect(error2.code).toBe(ErrorCodes.WRONG_PASSWORD)
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = provider.validatePassword('validPassword123')

      expect(result.valid).toBe(true)
    })

    it('should reject password exceeding max length', () => {
      const longPassword = 'a'.repeat(1025)
      const result = provider.validatePassword(longPassword)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('1024')
    })

    it('should accept password at max length', () => {
      const maxPassword = 'a'.repeat(1024)
      const result = provider.validatePassword(maxPassword)

      expect(result.valid).toBe(true)
    })
  })
})
