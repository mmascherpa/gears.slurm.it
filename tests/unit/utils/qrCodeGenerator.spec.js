import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateQrCode,
  downloadQrCode,
  copyQrCodeToClipboard,
  validateQrOptions
} from '@/utils/qrCodeGenerator'

// Mock the qrcode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn()
  }
}))

import QRCode from 'qrcode'

describe('qrCodeGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock document methods
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        }
      }
      return document.createElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    // Mock clipboard API
    global.navigator = {
      clipboard: {
        write: vi.fn().mockResolvedValue(undefined)
      }
    }

    // Mock ClipboardItem as a class
    global.ClipboardItem = class ClipboardItem {
      constructor(items) {
        this.items = items
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateQrCode', () => {
    it('should generate QR code with default options', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      const result = await generateQrCode('test text')

      expect(result).toBe(mockDataUrl)
      expect(QRCode.toDataURL).toHaveBeenCalledWith('test text', {
        width: 256,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        margin: 1
      })
    })

    it('should generate QR code with custom width', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      await generateQrCode('test', { width: 512 })

      expect(QRCode.toDataURL).toHaveBeenCalledWith('test', expect.objectContaining({
        width: 512
      }))
    })

    it('should generate QR code with custom error correction level', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      await generateQrCode('test', { errorCorrectionLevel: 'H' })

      expect(QRCode.toDataURL).toHaveBeenCalledWith('test', expect.objectContaining({
        errorCorrectionLevel: 'H'
      }))
    })

    it('should generate QR code with custom colors', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      await generateQrCode('test', {
        color: '#FF0000',
        backgroundColor: '#00FF00'
      })

      expect(QRCode.toDataURL).toHaveBeenCalledWith('test', expect.objectContaining({
        color: {
          dark: '#FF0000',
          light: '#00FF00'
        }
      }))
    })

    it('should throw error for empty text', async () => {
      await expect(generateQrCode('')).rejects.toThrow('Text cannot be empty')
    })

    it('should throw error for whitespace-only text', async () => {
      await expect(generateQrCode('   ')).rejects.toThrow('Text cannot be empty')
    })

    it('should throw error for null text', async () => {
      await expect(generateQrCode(null)).rejects.toThrow('Text cannot be empty')
    })

    it('should throw error for undefined text', async () => {
      await expect(generateQrCode(undefined)).rejects.toThrow('Text cannot be empty')
    })

    it('should handle QR library errors', async () => {
      QRCode.toDataURL.mockRejectedValue(new Error('QR generation failed'))

      await expect(generateQrCode('test'))
        .rejects.toThrow('QR code generation failed: QR generation failed')
    })

    it('should handle QR library string errors', async () => {
      QRCode.toDataURL.mockRejectedValue('String error')

      await expect(generateQrCode('test'))
        .rejects.toThrow('QR code generation failed: String error')
    })

    it('should generate QR code with long text', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      const longText = 'a'.repeat(1000)
      const result = await generateQrCode(longText)

      expect(result).toBe(mockDataUrl)
      expect(QRCode.toDataURL).toHaveBeenCalledWith(longText, expect.any(Object))
    })

    it('should generate QR code with special characters', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
      const result = await generateQrCode(specialText)

      expect(result).toBe(mockDataUrl)
    })

    it('should generate QR code with unicode characters', async () => {
      const mockDataUrl = 'data:image/png;base64,abc123'
      QRCode.toDataURL.mockResolvedValue(mockDataUrl)

      const unicodeText = '日本語 中文 한국어 🎉🔐'
      const result = await generateQrCode(unicodeText)

      expect(result).toBe(mockDataUrl)
    })
  })

  describe('downloadQrCode', () => {
    it('should trigger download with correct filename', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      downloadQrCode('data:image/png;base64,abc', 'test.png')

      expect(mockLink.href).toBe('data:image/png;base64,abc')
      expect(mockLink.download).toBe('test.png')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should add .png extension if missing', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      downloadQrCode('data:image/png;base64,abc', 'test')

      expect(mockLink.download).toBe('test.png')
    })

    it('should use default filename when not provided', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      downloadQrCode('data:image/png;base64,abc')

      expect(mockLink.download).toBe('qrcode.png')
    })

    it('should throw error when no data URL provided', () => {
      expect(() => downloadQrCode(null)).toThrow('No QR code to download')
    })

    it('should throw error when data URL is empty', () => {
      expect(() => downloadQrCode('')).toThrow('No QR code to download')
    })

    it('should throw error when data URL is undefined', () => {
      expect(() => downloadQrCode(undefined)).toThrow('No QR code to download')
    })
  })

  describe('copyQrCodeToClipboard', () => {
    it('should copy QR code to clipboard', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='

      await copyQrCodeToClipboard(dataUrl)

      expect(navigator.clipboard.write).toHaveBeenCalled()
      // Verify clipboard.write was called with a ClipboardItem
      const writeArgs = navigator.clipboard.write.mock.calls[0][0]
      expect(writeArgs).toHaveLength(1)
    })

    it('should throw error when no data URL provided', async () => {
      await expect(copyQrCodeToClipboard(null))
        .rejects.toThrow('No QR code to copy')
    })

    it('should throw error when data URL is empty', async () => {
      await expect(copyQrCodeToClipboard(''))
        .rejects.toThrow('No QR code to copy')
    })

    it('should handle clipboard write failure', async () => {
      navigator.clipboard.write.mockRejectedValue(new Error('Permission denied'))

      await expect(copyQrCodeToClipboard('data:image/png;base64,abc'))
        .rejects.toThrow('Failed to copy QR code: Permission denied')
    })

    it('should handle clipboard string errors', async () => {
      navigator.clipboard.write.mockRejectedValue('Clipboard error')

      await expect(copyQrCodeToClipboard('data:image/png;base64,abc'))
        .rejects.toThrow('Failed to copy QR code: Clipboard error')
    })
  })

  describe('validateQrOptions', () => {
    it('should accept valid options', () => {
      expect(validateQrOptions({ width: 256, errorCorrectionLevel: 'M' })).toBe(true)
    })

    it('should accept empty options', () => {
      expect(validateQrOptions({})).toBe(true)
    })

    it('should accept minimum width', () => {
      expect(validateQrOptions({ width: 64 })).toBe(true)
    })

    it('should accept maximum width', () => {
      expect(validateQrOptions({ width: 2048 })).toBe(true)
    })

    it('should reject width below minimum', () => {
      expect(() => validateQrOptions({ width: 63 }))
        .toThrow('Width must be between 64 and 2048 pixels')
    })

    it('should reject width above maximum', () => {
      expect(() => validateQrOptions({ width: 2049 }))
        .toThrow('Width must be between 64 and 2048 pixels')
    })

    it('should accept all valid error correction levels', () => {
      expect(validateQrOptions({ errorCorrectionLevel: 'L' })).toBe(true)
      expect(validateQrOptions({ errorCorrectionLevel: 'M' })).toBe(true)
      expect(validateQrOptions({ errorCorrectionLevel: 'Q' })).toBe(true)
      expect(validateQrOptions({ errorCorrectionLevel: 'H' })).toBe(true)
    })

    it('should reject invalid error correction level', () => {
      expect(() => validateQrOptions({ errorCorrectionLevel: 'X' }))
        .toThrow('Error correction level must be L, M, Q, or H')
    })

    it('should reject lowercase error correction level', () => {
      expect(() => validateQrOptions({ errorCorrectionLevel: 'm' }))
        .toThrow('Error correction level must be L, M, Q, or H')
    })
  })
})
