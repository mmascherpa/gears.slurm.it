import { describe, it, expect } from 'vitest'
import { CryptoProvider, CryptoProviderFactory, ErrorCodes } from '@/crypto/CryptoProvider'

describe('CryptoProvider', () => {
  describe('base class', () => {
    it('should throw error when encrypt is not implemented', async () => {
      const provider = new CryptoProvider()
      await expect(provider.encrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('encrypt() must be implemented by provider')
    })

    it('should throw error when decrypt is not implemented', async () => {
      const provider = new CryptoProvider()
      await expect(provider.decrypt(new Uint8Array([1, 2, 3]), 'password'))
        .rejects.toThrow('decrypt() must be implemented by provider')
    })

    it('should throw error when getInfo is not implemented', () => {
      const provider = new CryptoProvider()
      expect(() => provider.getInfo()).toThrow('getInfo() must be implemented by provider')
    })

    it('should return default normalized error', () => {
      const provider = new CryptoProvider()
      const error = provider.normalizeError(new Error('test error'))

      expect(error).toEqual({
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'test error',
        userMessage: '❌ An unexpected error occurred'
      })
    })

    it('should normalize string errors', () => {
      const provider = new CryptoProvider()
      const error = provider.normalizeError('string error')

      expect(error).toEqual({
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'string error',
        userMessage: '❌ An unexpected error occurred'
      })
    })
  })

  describe('validatePassword', () => {
    it('should reject empty password', () => {
      const provider = new TestProvider()
      const result = provider.validatePassword('')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password is required')
    })

    it('should reject non-string password', () => {
      const provider = new TestProvider()
      const result = provider.validatePassword(null)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password is required')
    })

    it('should reject password exceeding max length', () => {
      const provider = new TestProvider()
      const longPassword = 'a'.repeat(1025)
      const result = provider.validatePassword(longPassword)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Password too long')
    })

    it('should accept valid password', () => {
      const provider = new TestProvider()
      const result = provider.validatePassword('validPassword123')

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('_ensureUint8Array', () => {
    it('should return Uint8Array as-is', async () => {
      const provider = new TestProvider()
      const data = new Uint8Array([1, 2, 3])
      const result = await provider._ensureUint8Array(data)

      expect(result).toBe(data)
    })

    it('should convert Blob to Uint8Array', async () => {
      const provider = new TestProvider()
      const blob = new Blob(['test'])
      const result = await provider._ensureUint8Array(blob)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should reject invalid data type', async () => {
      const provider = new TestProvider()
      await expect(provider._ensureUint8Array('invalid'))
        .rejects.toThrow('Data must be Uint8Array or Blob')
    })
  })
})

describe('ErrorCodes', () => {
  it('should export standard error codes', () => {
    expect(ErrorCodes.WRONG_PASSWORD).toBe('WRONG_PASSWORD')
    expect(ErrorCodes.PASSWORD_TOO_LONG).toBe('PASSWORD_TOO_LONG')
    expect(ErrorCodes.CORRUPTED_DATA).toBe('CORRUPTED_DATA')
    expect(ErrorCodes.INVALID_FORMAT).toBe('INVALID_FORMAT')
    expect(ErrorCodes.ENCRYPTION_FAILED).toBe('ENCRYPTION_FAILED')
    expect(ErrorCodes.DECRYPTION_FAILED).toBe('DECRYPTION_FAILED')
    expect(ErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
  })
})

describe('CryptoProviderFactory', () => {
  beforeEach(() => {
    // Clear registered providers
    CryptoProviderFactory.providers.clear()
  })

  it('should register and create provider', () => {
    CryptoProviderFactory.register('test', TestProvider)

    const provider = CryptoProviderFactory.create('test')
    expect(provider).toBeInstanceOf(TestProvider)
  })

  it('should pass options to provider constructor', () => {
    CryptoProviderFactory.register('test', TestProvider)

    const provider = CryptoProviderFactory.create('test', { customOption: 'value' })
    expect(provider.options.customOption).toBe('value')
  })

  it('should throw error for unknown provider', () => {
    expect(() => CryptoProviderFactory.create('unknown'))
      .toThrow('Unknown provider: unknown')
  })

  it('should return list of available providers', () => {
    CryptoProviderFactory.register('provider1', TestProvider)
    CryptoProviderFactory.register('provider2', TestProvider)

    const providers = CryptoProviderFactory.getAvailableProviders()
    expect(providers).toEqual(['provider1', 'provider2'])
  })
})

// Test provider implementation for testing
class TestProvider extends CryptoProvider {
  constructor(options = {}) {
    super()
    this.options = options
  }

  async encrypt(data, password) {
    return new Uint8Array([1, 2, 3])
  }

  async decrypt(data, password) {
    return new Uint8Array([4, 5, 6])
  }

  getInfo() {
    return {
      name: 'Test',
      version: '1.0.0',
      maxPasswordLength: 1024,
      fileExtension: '.test'
    }
  }
}
