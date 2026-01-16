import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AgeWorkerProvider } from '@/workers/providers/AgeWorkerProvider'

describe('AgeWorkerProvider', () => {
  let provider
  let mockRage

  beforeEach(() => {
    // Mock rage-wasm library
    mockRage = {
      encrypt_with_user_passphrase: vi.fn(),
      decrypt_with_user_passphrase: vi.fn()
    }
    provider = new AgeWorkerProvider(mockRage)
  })

  describe('constructor', () => {
    it('should create provider with rage-wasm instance', () => {
      expect(provider.rage).toBe(mockRage)
    })

    it('should create provider with null rage-wasm', () => {
      const nullProvider = new AgeWorkerProvider(null)
      expect(nullProvider.rage).toBeNull()
    })
  })

  describe('getInfo', () => {
    it('should return provider information', () => {
      const info = provider.getInfo()

      expect(info.name).toBe('Age')
      expect(info.version).toBe('1.0.0')
      expect(info.maxPasswordLength).toBeNull() // No password length limit
      expect(info.fileExtension).toBe('.age')
      expect(info.description).toContain('age encryption')
    })
  })

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const password = 'testPassword123'
      const encryptedResult = new Uint8Array([10, 20, 30, 40, 50, 60])

      mockRage.encrypt_with_user_passphrase.mockResolvedValue(encryptedResult)

      const encrypted = await provider.encrypt(data, password)

      expect(encrypted).toBe(encryptedResult)
      expect(mockRage.encrypt_with_user_passphrase).toHaveBeenCalledWith(
        password,
        data,
        false // armor=false for binary format
      )
    })

    it('should convert Blob to Uint8Array before encryption', async () => {
      const blobContent = new Uint8Array([1, 2, 3])
      const blob = new Blob([blobContent])
      const password = 'password123'
      const encryptedResult = new Uint8Array([10, 20, 30])

      mockRage.encrypt_with_user_passphrase.mockResolvedValue(encryptedResult)

      const encrypted = await provider.encrypt(blob, password)

      expect(encrypted).toBe(encryptedResult)
      // Should have been called with Uint8Array from blob
      expect(mockRage.encrypt_with_user_passphrase).toHaveBeenCalled()
      const callArgs = mockRage.encrypt_with_user_passphrase.mock.calls[0]
      expect(callArgs[1]).toBeInstanceOf(Uint8Array)
    })

    it('should throw error when rage-wasm is not loaded', async () => {
      const nullProvider = new AgeWorkerProvider(null)
      const data = new Uint8Array([1, 2, 3])

      await expect(nullProvider.encrypt(data, 'password'))
        .rejects.toThrow('rage-wasm library not loaded')
    })

    it('should reject empty password', async () => {
      const data = new Uint8Array([1, 2, 3])

      await expect(provider.encrypt(data, ''))
        .rejects.toThrow('Password')
    })

    it('should reject null password', async () => {
      const data = new Uint8Array([1, 2, 3])

      await expect(provider.encrypt(data, null))
        .rejects.toThrow('Password is required')
    })

    it('should reject undefined password', async () => {
      const data = new Uint8Array([1, 2, 3])

      await expect(provider.encrypt(data, undefined))
        .rejects.toThrow('Password is required')
    })

    it('should enhance error messages from rage-wasm', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password123'

      mockRage.encrypt_with_user_passphrase.mockRejectedValue(new Error('Internal error'))

      await expect(provider.encrypt(data, password))
        .rejects.toThrow('encrypt failed: Internal error')
    })

    it('should handle string errors from rage-wasm', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password123'

      mockRage.encrypt_with_user_passphrase.mockRejectedValue('String error')

      await expect(provider.encrypt(data, password))
        .rejects.toThrow('encrypt failed: String error')
    })
  })

  describe('decrypt', () => {
    it('should decrypt data successfully', async () => {
      const encryptedData = new Uint8Array([10, 20, 30, 40, 50])
      const password = 'testPassword123'
      const decryptedResult = new Uint8Array([1, 2, 3, 4, 5])

      mockRage.decrypt_with_user_passphrase.mockResolvedValue(decryptedResult)

      const decrypted = await provider.decrypt(encryptedData, password)

      expect(decrypted).toBe(decryptedResult)
      expect(mockRage.decrypt_with_user_passphrase).toHaveBeenCalledWith(
        password,
        encryptedData
      )
    })

    it('should convert Blob to Uint8Array before decryption', async () => {
      const blobContent = new Uint8Array([10, 20, 30])
      const blob = new Blob([blobContent])
      const password = 'password123'
      const decryptedResult = new Uint8Array([1, 2, 3])

      mockRage.decrypt_with_user_passphrase.mockResolvedValue(decryptedResult)

      const decrypted = await provider.decrypt(blob, password)

      expect(decrypted).toBe(decryptedResult)
      expect(mockRage.decrypt_with_user_passphrase).toHaveBeenCalled()
      const callArgs = mockRage.decrypt_with_user_passphrase.mock.calls[0]
      expect(callArgs[1]).toBeInstanceOf(Uint8Array)
    })

    it('should throw error when rage-wasm is not loaded', async () => {
      const nullProvider = new AgeWorkerProvider(null)
      const data = new Uint8Array([10, 20, 30])

      await expect(nullProvider.decrypt(data, 'password'))
        .rejects.toThrow('rage-wasm library not loaded')
    })

    it('should enhance error messages from rage-wasm', async () => {
      const data = new Uint8Array([10, 20, 30])
      const password = 'password123'

      mockRage.decrypt_with_user_passphrase.mockRejectedValue(new Error('Decryption error'))

      await expect(provider.decrypt(data, password))
        .rejects.toThrow('decrypt failed: Decryption error')
    })
  })

  describe('normalizeError', () => {
    it('should normalize wrong password error', () => {
      const error = provider.normalizeError('wrong password')

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize incorrect passphrase error', () => {
      const error = provider.normalizeError('incorrect passphrase')

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize decryption failed error', () => {
      const error = provider.normalizeError('decryption failed')

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize failed to decrypt error', () => {
      const error = provider.normalizeError('failed to decrypt')

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize invalid format error', () => {
      const error = provider.normalizeError('invalid file format')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('not a valid age encrypted file')
    })

    it('should normalize not an age encrypted file error', () => {
      const error = provider.normalizeError('not an age encrypted file')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('not a valid age encrypted file')
    })

    it('should normalize malformed error', () => {
      const error = provider.normalizeError('malformed header')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('not a valid age encrypted file')
    })

    it('should normalize corrupted error', () => {
      const error = provider.normalizeError('file corrupted')

      expect(error.code).toBe('CORRUPTED_DATA')
      expect(error.userMessage).toContain('corrupted or tampered')
    })

    it('should normalize tampered error', () => {
      const error = provider.normalizeError('data tampered')

      expect(error.code).toBe('CORRUPTED_DATA')
      expect(error.userMessage).toContain('corrupted or tampered')
    })

    it('should normalize password required error', () => {
      const error = provider.normalizeError('password is required')

      expect(error.code).toBe('PASSWORD_REQUIRED')
      expect(error.userMessage).toContain('Password is required')
    })

    it('should return unknown error for unrecognized errors', () => {
      const error = provider.normalizeError('some random error')

      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.userMessage).toContain('unexpected error')
    })

    it('should handle Error objects', () => {
      const error = provider.normalizeError(new Error('wrong password'))

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.message).toBe('wrong password')
    })

    it('should handle null/undefined errors', () => {
      const errorNull = provider.normalizeError(null)
      const errorUndefined = provider.normalizeError(undefined)

      expect(errorNull.code).toBe('UNKNOWN_ERROR')
      expect(errorUndefined.code).toBe('UNKNOWN_ERROR')
    })

    it('should be case-insensitive', () => {
      const error1 = provider.normalizeError('WRONG PASSWORD')
      const error2 = provider.normalizeError('Wrong Password')
      const error3 = provider.normalizeError('wrong password')

      expect(error1.code).toBe('WRONG_PASSWORD')
      expect(error2.code).toBe('WRONG_PASSWORD')
      expect(error3.code).toBe('WRONG_PASSWORD')
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = provider.validatePassword('validPassword123')

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept long passwords', () => {
      const longPassword = 'a'.repeat(10000)
      const result = provider.validatePassword(longPassword)

      expect(result.valid).toBe(true)
    })

    it('should accept passwords with special characters', () => {
      const result = provider.validatePassword('!@#$%^&*()_+-=[]{}|;:,.<>?')

      expect(result.valid).toBe(true)
    })

    it('should accept unicode passwords', () => {
      const result = provider.validatePassword('пароль密码🔐')

      expect(result.valid).toBe(true)
    })

    it('should reject empty password', () => {
      const result = provider.validatePassword('')

      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should reject null password', () => {
      const result = provider.validatePassword(null)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should reject undefined password', () => {
      const result = provider.validatePassword(undefined)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should reject non-string password', () => {
      const result = provider.validatePassword(12345)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('_ensureUint8Array', () => {
    it('should return Uint8Array unchanged', async () => {
      const data = new Uint8Array([1, 2, 3])
      const result = await provider._ensureUint8Array(data)

      expect(result).toBe(data)
    })

    it('should convert Blob to Uint8Array', async () => {
      const originalData = new Uint8Array([1, 2, 3])
      const blob = new Blob([originalData])

      const result = await provider._ensureUint8Array(blob)

      expect(result).toBeInstanceOf(Uint8Array)
      expect([...result]).toEqual([...originalData])
    })

    it('should throw error for invalid data type', async () => {
      await expect(provider._ensureUint8Array('string'))
        .rejects.toThrow('Data must be Uint8Array or Blob')
    })

    it('should throw error for null data', async () => {
      await expect(provider._ensureUint8Array(null))
        .rejects.toThrow('Data must be Uint8Array or Blob')
    })
  })

  describe('_enhanceError', () => {
    it('should enhance Error objects', () => {
      const originalError = new Error('Original message')
      const enhanced = provider._enhanceError(originalError, 'encrypt')

      expect(enhanced.message).toBe('encrypt failed: Original message')
      expect(enhanced.originalError).toBe(originalError)
      expect(enhanced.operation).toBe('encrypt')
    })

    it('should enhance string errors', () => {
      const enhanced = provider._enhanceError('String error', 'decrypt')

      expect(enhanced.message).toBe('decrypt failed: String error')
      expect(enhanced.originalError).toBe('String error')
      expect(enhanced.operation).toBe('decrypt')
    })

    it('should handle unknown errors', () => {
      const enhanced = provider._enhanceError(undefined, 'encrypt')

      expect(enhanced.message).toBe('encrypt failed: Unknown error')
      expect(enhanced.operation).toBe('encrypt')
    })
  })
})
