import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import * as openpgp from 'openpgp'
import { OpenPgpWorkerProvider } from '@/workers/providers/OpenPgpWorkerProvider'

describe('OpenPgpWorkerProvider', () => {
  let provider
  let mockOpenpgp

  beforeEach(() => {
    // Mock openpgp library
    mockOpenpgp = {
      config: {},
      createMessage: vi.fn(),
      readMessage: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn()
    }
    provider = new OpenPgpWorkerProvider(mockOpenpgp)
  })

  describe('constructor', () => {
    it('should create provider with openpgp instance', () => {
      expect(provider.openpgp).toBe(mockOpenpgp)
    })

    it('should pin gpg-compatible SEIPDv1 output (no AEAD)', () => {
      expect(mockOpenpgp.config.aeadProtect).toBe(false)
    })

    it('should create provider with null openpgp', () => {
      const nullProvider = new OpenPgpWorkerProvider(null)
      expect(nullProvider.openpgp).toBeNull()
    })
  })

  describe('getInfo', () => {
    it('should return provider information', () => {
      const info = provider.getInfo()

      expect(info.name).toBe('OpenPGP')
      expect(info.version).toBe('1.0.0')
      expect(info.maxPasswordLength).toBeNull() // No password length limit
      expect(info.fileExtension).toBe('.gpg')
      expect(info.description).toContain('GnuPG')
    })
  })

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const password = 'testPassword123'
      const message = { fake: 'message' }
      const encryptedResult = new Uint8Array([10, 20, 30, 40, 50, 60])

      mockOpenpgp.createMessage.mockResolvedValue(message)
      mockOpenpgp.encrypt.mockResolvedValue(encryptedResult)

      const encrypted = await provider.encrypt(data, password)

      expect(encrypted).toBe(encryptedResult)
      expect(mockOpenpgp.createMessage).toHaveBeenCalledWith({ binary: data })
      expect(mockOpenpgp.encrypt).toHaveBeenCalledWith({
        message,
        passwords: [password],
        format: 'binary'
      })
    })

    it('should convert Blob to Uint8Array before encryption', async () => {
      const blobContent = new Uint8Array([1, 2, 3])
      const blob = new Blob([blobContent])
      const password = 'password123'
      const encryptedResult = new Uint8Array([10, 20, 30])

      mockOpenpgp.createMessage.mockResolvedValue({})
      mockOpenpgp.encrypt.mockResolvedValue(encryptedResult)

      const encrypted = await provider.encrypt(blob, password)

      expect(encrypted).toBe(encryptedResult)
      expect(mockOpenpgp.createMessage).toHaveBeenCalled()
      const callArgs = mockOpenpgp.createMessage.mock.calls[0]
      expect(callArgs[0].binary).toBeInstanceOf(Uint8Array)
    })

    it('should throw error when openpgp is not loaded', async () => {
      const nullProvider = new OpenPgpWorkerProvider(null)
      const data = new Uint8Array([1, 2, 3])

      await expect(nullProvider.encrypt(data, 'password'))
        .rejects.toThrow('openpgp library not loaded')
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

    it('should enhance error messages from openpgp', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password123'

      mockOpenpgp.createMessage.mockResolvedValue({})
      mockOpenpgp.encrypt.mockRejectedValue(new Error('Internal error'))

      await expect(provider.encrypt(data, password))
        .rejects.toThrow('encrypt failed: Internal error')
    })

    it('should handle string errors from openpgp', async () => {
      const data = new Uint8Array([1, 2, 3])
      const password = 'password123'

      mockOpenpgp.createMessage.mockResolvedValue({})
      mockOpenpgp.encrypt.mockRejectedValue('String error')

      await expect(provider.encrypt(data, password))
        .rejects.toThrow('encrypt failed: String error')
    })
  })

  describe('decrypt', () => {
    it('should decrypt binary data successfully', async () => {
      const encryptedData = new Uint8Array([0xc3, 20, 30, 40, 50])
      const password = 'testPassword123'
      const message = { fake: 'message' }
      const decryptedResult = new Uint8Array([1, 2, 3, 4, 5])

      mockOpenpgp.readMessage.mockResolvedValue(message)
      mockOpenpgp.decrypt.mockResolvedValue({ data: decryptedResult })

      const decrypted = await provider.decrypt(encryptedData, password)

      expect(decrypted).toBe(decryptedResult)
      expect(mockOpenpgp.readMessage).toHaveBeenCalledWith({ binaryMessage: encryptedData })
      expect(mockOpenpgp.decrypt).toHaveBeenCalledWith({
        message,
        passwords: [password],
        format: 'binary'
      })
    })

    it('should detect ASCII-armored input and use armoredMessage', async () => {
      const armoredText = '-----BEGIN PGP MESSAGE-----\n\nwx4EBw...\n-----END PGP MESSAGE-----\n'
      const armoredData = new TextEncoder().encode(armoredText)
      const decryptedResult = new Uint8Array([1, 2, 3])

      mockOpenpgp.readMessage.mockResolvedValue({})
      mockOpenpgp.decrypt.mockResolvedValue({ data: decryptedResult })

      const decrypted = await provider.decrypt(armoredData, 'password123')

      expect(decrypted).toBe(decryptedResult)
      expect(mockOpenpgp.readMessage).toHaveBeenCalledWith({ armoredMessage: armoredText })
    })

    it('should convert Blob to Uint8Array before decryption', async () => {
      const blobContent = new Uint8Array([0xc3, 20, 30])
      const blob = new Blob([blobContent])
      const password = 'password123'
      const decryptedResult = new Uint8Array([1, 2, 3])

      mockOpenpgp.readMessage.mockResolvedValue({})
      mockOpenpgp.decrypt.mockResolvedValue({ data: decryptedResult })

      const decrypted = await provider.decrypt(blob, password)

      expect(decrypted).toBe(decryptedResult)
      expect(mockOpenpgp.readMessage).toHaveBeenCalled()
      const callArgs = mockOpenpgp.readMessage.mock.calls[0]
      expect(callArgs[0].binaryMessage).toBeInstanceOf(Uint8Array)
    })

    it('should throw error when openpgp is not loaded', async () => {
      const nullProvider = new OpenPgpWorkerProvider(null)
      const data = new Uint8Array([10, 20, 30])

      await expect(nullProvider.decrypt(data, 'password'))
        .rejects.toThrow('openpgp library not loaded')
    })

    it('should enhance error messages from openpgp', async () => {
      const data = new Uint8Array([10, 20, 30])
      const password = 'password123'

      mockOpenpgp.readMessage.mockResolvedValue({})
      mockOpenpgp.decrypt.mockRejectedValue(new Error('Decryption error'))

      await expect(provider.decrypt(data, password))
        .rejects.toThrow('decrypt failed: Decryption error')
    })
  })

  describe('normalizeError', () => {
    it('should normalize the exact error OpenPGP.js throws for a wrong password', () => {
      // OpenPGP.js v6 rejects with this message, which decrypt() enhances
      // to 'decrypt failed: ...' before normalization
      const error = provider.normalizeError(
        new Error('decrypt failed: Error decrypting message: Session key decryption failed.')
      )

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.userMessage).toContain('Incorrect password')
    })

    it('should normalize MDC failure as corrupted data', () => {
      const error = provider.normalizeError(
        new Error('decrypt failed: Error decrypting message: Modification detected.')
      )

      expect(error.code).toBe('CORRUPTED_DATA')
      expect(error.userMessage).toContain('corrupted')
    })

    it('should normalize parse errors as invalid format', () => {
      const error = provider.normalizeError(
        new Error('decrypt failed: Error during parsing. This message / key probably does not conform to a valid OpenPGP format.')
      )

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('not a valid OpenPGP')
    })

    it('should normalize packet-context errors as invalid format', () => {
      const error = provider.normalizeError('Packet not allowed in this context: secretSubkey')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('not a valid OpenPGP')
    })

    it('should normalize misformed armor errors', () => {
      const error = provider.normalizeError('Misformed armored text')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('ASCII-armored')
    })

    it('should normalize armor integrity check errors', () => {
      const error = provider.normalizeError('Ascii armor integrity check failed')

      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.userMessage).toContain('ASCII-armored')
    })

    it('should normalize unsupported packet errors as OCB guidance', () => {
      const error = provider.normalizeError('Unsupported packet type: 20')

      expect(error.code).toBe('UNSUPPORTED_AEAD')
      expect(error.userMessage).toContain('gpg --rfc4880')
    })

    it('should normalize no encrypted data errors as OCB guidance', () => {
      const error = provider.normalizeError('No encrypted data found')

      expect(error.code).toBe('UNSUPPORTED_AEAD')
      expect(error.userMessage).toContain('gpg --rfc4880')
    })

    it('should normalize password required error', () => {
      const error = provider.normalizeError('Password is required')

      expect(error.code).toBe('PASSWORD_REQUIRED')
      expect(error.userMessage).toContain('Password is required')
    })

    it('should return unknown error for unrecognized errors', () => {
      const error = provider.normalizeError('some random error')

      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.userMessage).toContain('unexpected error')
    })

    it('should handle Error objects', () => {
      const error = provider.normalizeError(new Error('Session key decryption failed.'))

      expect(error.code).toBe('WRONG_PASSWORD')
      expect(error.message).toBe('Session key decryption failed.')
    })

    it('should handle null/undefined errors', () => {
      const errorNull = provider.normalizeError(null)
      const errorUndefined = provider.normalizeError(undefined)

      expect(errorNull.code).toBe('UNKNOWN_ERROR')
      expect(errorUndefined.code).toBe('UNKNOWN_ERROR')
    })

    it('should be case-insensitive', () => {
      const error1 = provider.normalizeError('SESSION KEY DECRYPTION FAILED')
      const error2 = provider.normalizeError('Session Key Decryption Failed')

      expect(error1.code).toBe('WRONG_PASSWORD')
      expect(error2.code).toBe('WRONG_PASSWORD')
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

    it('should reject non-string password', () => {
      const result = provider.validatePassword(12345)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('_looksArmored', () => {
    it('should detect armored PGP messages', () => {
      const armored = new TextEncoder().encode('-----BEGIN PGP MESSAGE-----\n...')
      expect(provider._looksArmored(armored)).toBe(true)
    })

    it('should tolerate leading whitespace', () => {
      const armored = new TextEncoder().encode('\n  -----BEGIN PGP MESSAGE-----\n...')
      expect(provider._looksArmored(armored)).toBe(true)
    })

    it('should not flag binary PGP data', () => {
      const binary = new Uint8Array([0xc3, 0x04, 0x04, 0x09, 0x03, 0x08])
      expect(provider._looksArmored(binary)).toBe(false)
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
  })

  // Integration tests against the real OpenPGP.js library.
  // These pin the actual v6 behavior (error strings, format compatibility)
  // that the mock-based tests above assume.
  describe('integration with real openpgp', () => {
    let realProvider

    beforeEach(() => {
      realProvider = new OpenPgpWorkerProvider(openpgp)
    })

    it('should roundtrip encrypt and decrypt', async () => {
      const data = new TextEncoder().encode('roundtrip test payload 🔐')
      const password = 'correct horse battery staple'

      const encrypted = await realProvider.encrypt(data, password)

      expect(encrypted).toBeInstanceOf(Uint8Array)
      // Valid OpenPGP binary packets have the high bit set on the first byte
      expect(encrypted[0] & 0x80).toBe(0x80)

      const decrypted = await realProvider.decrypt(encrypted, password)
      expect([...decrypted]).toEqual([...data])
    })

    it('should normalize a real wrong-password failure to WRONG_PASSWORD', async () => {
      const data = new Uint8Array([1, 2, 3])
      const encrypted = await realProvider.encrypt(data, 'rightPassword')

      let caught
      try {
        await realProvider.decrypt(encrypted, 'wrongPassword')
      } catch (error) {
        caught = error
      }

      expect(caught).toBeTruthy()
      expect(realProvider.normalizeError(caught).code).toBe('WRONG_PASSWORD')
    })

    it('should decrypt ASCII-armored messages', async () => {
      const data = new TextEncoder().encode('armored payload')
      const password = 'password123'

      const message = await openpgp.createMessage({ binary: data })
      const armored = await openpgp.encrypt({ message, passwords: [password], format: 'armored' })

      const decrypted = await realProvider.decrypt(new TextEncoder().encode(armored), password)
      expect([...decrypted]).toEqual([...data])
    })

    it('should normalize garbage input to INVALID_FORMAT', async () => {
      const garbage = new TextEncoder().encode('this is definitely not a pgp message at all')

      let caught
      try {
        await realProvider.decrypt(garbage, 'password123')
      } catch (error) {
        caught = error
      }

      expect(caught).toBeTruthy()
      expect(realProvider.normalizeError(caught).code).toBe('INVALID_FORMAT')
    })

    it('should decrypt a file created by the gpg CLI (SEIPDv1, AES-256)', async () => {
      // Fixture created with: gpg --batch --rfc4880 --cipher-algo AES256 --passphrase test1234 -c
      // Path relative to the project root (vitest cwd)
      const fixture = new Uint8Array(readFileSync('tests/unit/crypto/fixtures/gpg-rfc4880.txt.gpg'))

      const decrypted = await realProvider.decrypt(fixture, 'test1234')

      expect(new TextDecoder().decode(decrypted)).toBe('gpg interop fixture: hello from gpg\n')
    })
  })
})
