import { describe, it, expect, beforeEach } from 'vitest'
import { WebCryptoWorkerProvider } from '@/workers/providers/WebCryptoWorkerProvider'

describe('WebCryptoWorkerProvider', () => {
  let provider

  beforeEach(() => {
    provider = new WebCryptoWorkerProvider()
  })

  describe('getInfo', () => {
    it('should return provider information', () => {
      const info = provider.getInfo()

      expect(info.name).toBe('WebCrypto')
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
      expect(encrypted.length).toBeGreaterThan(data.length)
    })

    it('should produce different output for same data (random salt/IV)', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'

      const encrypted1 = await provider.encrypt(data, password)
      const encrypted2 = await provider.encrypt(data, password)

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

      expect(decoder.decode(decrypted)).toBe(originalText)
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

      encrypted[encrypted.length - 1] = encrypted[encrypted.length - 1] ^ 0xFF

      await expect(provider.decrypt(encrypted, password))
        .rejects.toThrow()
    })

    it('should reject data that is too short', async () => {
      const tooShort = new Uint8Array([1, 2, 3])
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

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize password required error', () => {
      const error = provider.normalizeError('Password is required')

      expect(error.code).toBe('PASSWORD_REQUIRED')
      expect(error.userMessage).toContain('Password is required')
    })

    it('should normalize password too long error', () => {
      const error = provider.normalizeError('Password too long')

      expect(error.code).toBe('PASSWORD_TOO_LONG')
      expect(error.userMessage).toContain('Password too long')
    })

    it('should normalize invalid format error', () => {
      const error = provider.normalizeError('Invalid format: file too short')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('Invalid encrypted file')
    })

    it('should normalize encryption failed error', () => {
      const error = provider.normalizeError('encrypt failed: something went wrong')

      expect(error.code).toBe('ENCRYPTION_FAILED')
      expect(error.userMessage).toContain('Encryption failed')
    })

    it('should normalize decryption failed error', () => {
      const error = provider.normalizeError('decrypt failed: something went wrong')

      expect(error.code).toBe('DECRYPTION_FAILED')
      expect(error.userMessage).toContain('Decryption failed')
    })

    it('should return unknown error for unrecognized errors', () => {
      const error = provider.normalizeError('Random error')

      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.userMessage).toContain('unexpected error')
    })
  })

  describe('file format versioning', () => {
    const MAGIC = [0x53, 0x4C, 0x52, 0x4D] // "SLRM"
    const HEADER_LENGTH = 9 // magic(4) + version(1) + iterations(4)

    it('should write the v1 header with magic, version, and iteration count', async () => {
      const encrypted = await provider.encrypt(new Uint8Array([1, 2, 3]), 'password')

      expect(Array.from(encrypted.slice(0, 4))).toEqual(MAGIC)
      expect(encrypted[4]).toBe(1)

      const iterations = new DataView(encrypted.buffer).getUint32(5, false)
      expect(iterations).toBe(600000)
    })

    it('should use different salt and IV for each encryption', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password'

      const encrypted1 = await provider.encrypt(data, password)
      const encrypted2 = await provider.encrypt(data, password)

      const salt1 = encrypted1.slice(HEADER_LENGTH, HEADER_LENGTH + 16)
      const salt2 = encrypted2.slice(HEADER_LENGTH, HEADER_LENGTH + 16)
      const iv1 = encrypted1.slice(HEADER_LENGTH + 16, HEADER_LENGTH + 28)
      const iv2 = encrypted2.slice(HEADER_LENGTH + 16, HEADER_LENGTH + 28)

      expect(salt1).not.toEqual(salt2)
      expect(iv1).not.toEqual(iv2)
    })

    it('should decrypt legacy files without a header using 100000 iterations', async () => {
      // Build a legacy-format file exactly as the pre-header code did
      const originalData = new Uint8Array([10, 20, 30, 40])
      const password = 'legacyPassword'
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
      )
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      )
      const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, originalData)
      )

      const legacyFile = new Uint8Array(salt.length + iv.length + ciphertext.length)
      legacyFile.set(salt, 0)
      legacyFile.set(iv, salt.length)
      legacyFile.set(ciphertext, salt.length + iv.length)

      const decrypted = await provider.decrypt(legacyFile, password)
      expect(decrypted).toEqual(originalData)
    })

    it('should reject unsupported format versions', async () => {
      const encrypted = await provider.encrypt(new Uint8Array([1, 2, 3]), 'password')
      encrypted[4] = 99 // corrupt the version byte

      await expect(provider.decrypt(encrypted, 'password'))
        .rejects.toThrow('Unsupported file format version')
    })

    it('should reject absurd iteration counts in the header', async () => {
      const encrypted = await provider.encrypt(new Uint8Array([1, 2, 3]), 'password')
      new DataView(encrypted.buffer).setUint32(5, 0xFFFFFFFF, false)

      await expect(provider.decrypt(encrypted, 'password'))
        .rejects.toThrow('bad iteration count')
    })

    it('should honor a custom iteration count option for new files', async () => {
      const fastProvider = new WebCryptoWorkerProvider({ iterations: 1000 })
      const data = new Uint8Array([5, 6, 7])

      const encrypted = await fastProvider.encrypt(data, 'password')
      const iterations = new DataView(encrypted.buffer).getUint32(5, false)
      expect(iterations).toBe(1000)

      // Default provider can still decrypt because iterations come from the header
      const decrypted = await provider.decrypt(encrypted, 'password')
      expect(decrypted).toEqual(data)
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
      const data = new Uint8Array(1024 * 1024)
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256
      }
      const password = 'password'

      const encrypted = await provider.encrypt(data, password)
      const decrypted = await provider.decrypt(encrypted, password)

      expect(decrypted).toEqual(data)
    }, 10000)

    it('should handle different passwords for same data', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password1 = 'password1'
      const password2 = 'password2'

      const encrypted1 = await provider.encrypt(data, password1)
      const encrypted2 = await provider.encrypt(data, password2)

      expect(encrypted1).not.toEqual(encrypted2)

      expect(await provider.decrypt(encrypted1, password1)).toEqual(data)
      expect(await provider.decrypt(encrypted2, password2)).toEqual(data)

      await expect(provider.decrypt(encrypted1, password2)).rejects.toThrow()
      await expect(provider.decrypt(encrypted2, password1)).rejects.toThrow()
    })
  })
})
