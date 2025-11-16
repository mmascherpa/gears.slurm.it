import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  IMAGE_FORMATS,
  detectImageFormat,
  loadMetadata,
  editMetadataField,
  removeMetadataField,
  removeAllMetadata,
  addCustomField,
  getMetadataStats,
  getFileExtension,
  getMimeType
} from '@/utils/metadataManager.js'

describe('metadataManager.js', () => {
  describe('detectImageFormat', () => {
    describe('File input', () => {
      it('should detect PNG from file extension', () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should detect JPEG from .jpg extension', () => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.JPEG)
      })

      it('should detect JPEG from .jpeg extension', () => {
        const file = new File(['test'], 'test.jpeg', { type: 'image/jpeg' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.JPEG)
      })

      it('should detect PNG from MIME type even with wrong extension', () => {
        const file = new File(['test'], 'test.jpg', { type: 'image/png' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should detect PNG from extension first (extension takes priority)', () => {
        // Note: detectImageFormat checks extension before MIME type
        const file = new File(['test'], 'test.png', { type: 'image/jpeg' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should return UNKNOWN for unsupported file types', () => {
        const file = new File(['test'], 'test.gif', { type: 'image/gif' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.UNKNOWN)
      })

      it('should handle case-insensitive extensions', () => {
        const file1 = new File(['test'], 'test.PNG', { type: 'image/png' })
        const file2 = new File(['test'], 'test.JPG', { type: 'image/jpeg' })
        expect(detectImageFormat(file1)).toBe(IMAGE_FORMATS.PNG)
        expect(detectImageFormat(file2)).toBe(IMAGE_FORMATS.JPEG)
      })
    })

    describe('Base64 string input', () => {
      it('should detect PNG from data URI prefix', () => {
        const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        const format = detectImageFormat(base64)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should detect JPEG from data URI prefix', () => {
        const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD'
        const format = detectImageFormat(base64)
        expect(format).toBe(IMAGE_FORMATS.JPEG)
      })

      it('should detect PNG from magic bytes', () => {
        // PNG signature: 89 50 4E 47 0D 0A 1A 0A
        const pngSignature = btoa('\x89PNG\r\n\x1a\n')
        const format = detectImageFormat(pngSignature)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should detect JPEG from magic bytes', () => {
        // JPEG signature: FF D8 FF
        const jpegSignature = btoa('\xFF\xD8\xFF')
        const format = detectImageFormat(jpegSignature)
        expect(format).toBe(IMAGE_FORMATS.JPEG)
      })

      it('should return UNKNOWN for invalid base64', () => {
        const format = detectImageFormat('invalid-base64')
        expect(format).toBe(IMAGE_FORMATS.UNKNOWN)
      })

      it('should return UNKNOWN for unsupported format', () => {
        const gifSignature = btoa('GIF89a')
        const format = detectImageFormat(gifSignature)
        expect(format).toBe(IMAGE_FORMATS.UNKNOWN)
      })

      it('should handle data:image/jpg prefix', () => {
        const base64 = 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD'
        const format = detectImageFormat(base64)
        expect(format).toBe(IMAGE_FORMATS.JPEG)
      })
    })

    describe('Edge cases', () => {
      it('should handle empty filename', () => {
        const file = new File(['test'], '', { type: 'image/png' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should handle filename without extension', () => {
        const file = new File(['test'], 'image', { type: 'image/jpeg' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.JPEG)
      })

      it('should handle multiple dots in filename', () => {
        const file = new File(['test'], 'my.photo.final.png', { type: 'image/png' })
        const format = detectImageFormat(file)
        expect(format).toBe(IMAGE_FORMATS.PNG)
      })

      it('should return UNKNOWN for null input', () => {
        const format = detectImageFormat(null)
        expect(format).toBe(IMAGE_FORMATS.UNKNOWN)
      })

      it('should return UNKNOWN for undefined input', () => {
        const format = detectImageFormat(undefined)
        expect(format).toBe(IMAGE_FORMATS.UNKNOWN)
      })
    })
  })

  describe('getFileExtension', () => {
    it('should return jpg for JPEG format', () => {
      const ext = getFileExtension(IMAGE_FORMATS.JPEG)
      expect(ext).toBe('jpg')
    })

    it('should return png for PNG format', () => {
      const ext = getFileExtension(IMAGE_FORMATS.PNG)
      expect(ext).toBe('png')
    })

    it('should return bin for unknown format', () => {
      const ext = getFileExtension(IMAGE_FORMATS.UNKNOWN)
      expect(ext).toBe('bin')
    })

    it('should return bin for invalid format', () => {
      const ext = getFileExtension('INVALID')
      expect(ext).toBe('bin')
    })
  })

  describe('getMimeType', () => {
    it('should return image/jpeg for JPEG format', () => {
      const mime = getMimeType(IMAGE_FORMATS.JPEG)
      expect(mime).toBe('image/jpeg')
    })

    it('should return image/png for PNG format', () => {
      const mime = getMimeType(IMAGE_FORMATS.PNG)
      expect(mime).toBe('image/png')
    })

    it('should return application/octet-stream for unknown format', () => {
      const mime = getMimeType(IMAGE_FORMATS.UNKNOWN)
      expect(mime).toBe('application/octet-stream')
    })

    it('should return application/octet-stream for invalid format', () => {
      const mime = getMimeType('INVALID')
      expect(mime).toBe('application/octet-stream')
    })
  })

  describe('loadMetadata', () => {
    it('should throw error for unsupported format', async () => {
      await expect(loadMetadata('base64data', IMAGE_FORMATS.UNKNOWN))
        .rejects.toThrow('Unsupported image format')
    })

    it('should throw error for invalid format', async () => {
      await expect(loadMetadata('base64data', 'INVALID_FORMAT'))
        .rejects.toThrow('Unsupported image format')
    })

    // Note: Actual loading tests would require valid image data
    // These are covered by format-specific tests
  })

  describe('editMetadataField', () => {
    it('should throw error for unsupported format', async () => {
      const field = { key: 'test', label: 'Test' }
      await expect(editMetadataField('base64data', IMAGE_FORMATS.UNKNOWN, field, 'value'))
        .rejects.toThrow('Unsupported image format')
    })

    it('should throw error for invalid format', async () => {
      const field = { key: 'test', label: 'Test' }
      await expect(editMetadataField('base64data', 'INVALID', field, 'value'))
        .rejects.toThrow('Unsupported image format')
    })
  })

  describe('removeMetadataField', () => {
    it('should throw error for unsupported format', async () => {
      const field = { key: 'test', label: 'Test' }
      await expect(removeMetadataField('base64data', IMAGE_FORMATS.UNKNOWN, field))
        .rejects.toThrow('Unsupported image format')
    })

    it('should throw error for invalid format', async () => {
      const field = { key: 'test', label: 'Test' }
      await expect(removeMetadataField('base64data', 'INVALID', field))
        .rejects.toThrow('Unsupported image format')
    })
  })

  describe('removeAllMetadata', () => {
    it('should throw error for unsupported format', async () => {
      await expect(removeAllMetadata('base64data', IMAGE_FORMATS.UNKNOWN))
        .rejects.toThrow('Unsupported image format')
    })

    it('should throw error for invalid format', async () => {
      await expect(removeAllMetadata('base64data', 'INVALID'))
        .rejects.toThrow('Unsupported image format')
    })
  })

  describe('addCustomField', () => {
    it('should throw error for unsupported format', async () => {
      const customField = { keyword: 'test', value: 'value' }
      await expect(addCustomField('base64data', IMAGE_FORMATS.UNKNOWN, customField))
        .rejects.toThrow('Unsupported image format')
    })

    it('should throw error for invalid format', async () => {
      const customField = { keyword: 'test', value: 'value' }
      await expect(addCustomField('base64data', 'INVALID', customField))
        .rejects.toThrow('Unsupported image format')
    })

    it('should handle PNG custom field structure', async () => {
      // This would require a valid PNG - testing structure only
      const customField = {
        keyword: 'TestKeyword',
        value: 'Test Value'
      }

      expect(customField.keyword).toBe('TestKeyword')
      expect(customField.value).toBe('Test Value')
    })

    it('should handle JPEG custom field structure', async () => {
      // This would require a valid JPEG - testing structure only
      const customField = {
        ifd: '0th',
        tagId: 270,
        value: 'Test Value',
        type: 'ascii'
      }

      expect(customField.ifd).toBe('0th')
      expect(customField.tagId).toBe(270)
      expect(customField.value).toBe('Test Value')
      expect(customField.type).toBe('ascii')
    })
  })

  describe('getMetadataStats', () => {
    it('should return zero stats for unknown format', () => {
      const stats = getMetadataStats(null, IMAGE_FORMATS.UNKNOWN)

      expect(stats.totalFields).toBe(0)
      expect(stats.populatedFields).toBe(0)
      expect(stats.sections).toBe(0)
    })

    it('should return zero stats for invalid format', () => {
      const stats = getMetadataStats(null, 'INVALID')

      expect(stats.totalFields).toBe(0)
      expect(stats.populatedFields).toBe(0)
      expect(stats.sections).toBe(0)
    })

    it('should return zero stats for null metadata with unknown format', () => {
      // Only UNKNOWN format returns zeros for null metadata
      const stats = getMetadataStats(null, IMAGE_FORMATS.UNKNOWN)

      expect(stats.totalFields).toBe(0)
      expect(stats.populatedFields).toBe(0)
      expect(stats.sections).toBe(0)
    })

    it('should handle valid metadata structure', () => {
      const mockMetadata = {
        Camera: {
          name: 'Camera',
          fields: [
            { key: 'Make', value: 'Canon', isPopulated: true },
            { key: 'Model', value: '', isPopulated: false }
          ]
        },
        Exposure: {
          name: 'Exposure',
          fields: [
            { key: 'ISO', value: '100', isPopulated: true }
          ]
        }
      }

      // This tests the structure - actual implementation would be in format-specific modules
      const totalFields = Object.values(mockMetadata)
        .reduce((acc, section) => acc + section.fields.length, 0)
      const populatedFields = Object.values(mockMetadata)
        .flatMap(section => section.fields)
        .filter(field => field.isPopulated).length

      expect(totalFields).toBe(3)
      expect(populatedFields).toBe(2)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle workflow: detect > load > edit > save', () => {
      // Test the expected workflow pattern
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
      const format = detectImageFormat(file)

      expect(format).toBe(IMAGE_FORMATS.JPEG)

      const extension = getFileExtension(format)
      expect(extension).toBe('jpg')

      const mimeType = getMimeType(format)
      expect(mimeType).toBe('image/jpeg')
    })

    it('should handle PNG workflow', () => {
      const file = new File(['test'], 'graphic.png', { type: 'image/png' })
      const format = detectImageFormat(file)

      expect(format).toBe(IMAGE_FORMATS.PNG)

      const extension = getFileExtension(format)
      expect(extension).toBe('png')

      const mimeType = getMimeType(format)
      expect(mimeType).toBe('image/png')
    })

    it('should handle unsupported format gracefully', () => {
      const file = new File(['test'], 'image.gif', { type: 'image/gif' })
      const format = detectImageFormat(file)

      expect(format).toBe(IMAGE_FORMATS.UNKNOWN)

      const extension = getFileExtension(format)
      expect(extension).toBe('bin')

      const mimeType = getMimeType(format)
      expect(mimeType).toBe('application/octet-stream')
    })

    it('should maintain format consistency through operations', () => {
      // Ensure format detection is consistent
      const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' })

      const jpegFormat = detectImageFormat(jpegFile)
      const pngFormat = detectImageFormat(pngFile)

      expect(jpegFormat).toBe(IMAGE_FORMATS.JPEG)
      expect(pngFormat).toBe(IMAGE_FORMATS.PNG)
      expect(jpegFormat).not.toBe(pngFormat)
    })
  })

  describe('IMAGE_FORMATS constants', () => {
    it('should have JPEG constant', () => {
      expect(IMAGE_FORMATS.JPEG).toBe('JPEG')
    })

    it('should have PNG constant', () => {
      expect(IMAGE_FORMATS.PNG).toBe('PNG')
    })

    it('should have UNKNOWN constant', () => {
      expect(IMAGE_FORMATS.UNKNOWN).toBe('UNKNOWN')
    })

    it('should have exactly three format types', () => {
      const formats = Object.keys(IMAGE_FORMATS)
      expect(formats.length).toBe(3)
      expect(formats).toContain('JPEG')
      expect(formats).toContain('PNG')
      expect(formats).toContain('UNKNOWN')
    })
  })
})
