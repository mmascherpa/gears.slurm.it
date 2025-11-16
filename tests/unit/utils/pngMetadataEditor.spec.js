import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadPngMetadata,
  getPngMetadataStats,
  editPngMetadataField,
  removePngMetadataField,
  removeAllPngMetadata,
  addCustomPngField
} from '@/utils/pngMetadataEditor.js'

// Helper to create a minimal valid PNG
function createMinimalPng() {
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk (13 bytes data)
  const ihdrData = new Uint8Array([
    0, 0, 0, 1, // Width: 1
    0, 0, 0, 1, // Height: 1
    8, // Bit depth: 8
    2, // Color type: RGB
    0, // Compression: deflate
    0, // Filter: adaptive
    0  // Interlace: none
  ])
  const ihdr = createPngChunk('IHDR', ihdrData)

  // IDAT chunk (minimal compressed data)
  const idatData = new Uint8Array([
    0x78, 0x9c, // zlib header
    0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01 // minimal deflate data
  ])
  const idat = createPngChunk('IDAT', idatData)

  // IEND chunk (0 bytes data)
  const iend = createPngChunk('IEND', new Uint8Array(0))

  // Combine all chunks
  const totalSize = signature.length + ihdr.length + idat.length + iend.length
  const png = new Uint8Array(totalSize)
  let offset = 0

  png.set(signature, offset)
  offset += signature.length

  png.set(ihdr, offset)
  offset += ihdr.length

  png.set(idat, offset)
  offset += idat.length

  png.set(iend, offset)

  return arrayBufferToBase64(png.buffer)
}

// Helper to create PNG chunk
function createPngChunk(type, data) {
  const length = data.length
  const chunk = new Uint8Array(12 + length)
  const view = new DataView(chunk.buffer)

  // Length
  view.setUint32(0, length)

  // Type
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i)
  }

  // Data
  chunk.set(data, 8)

  // CRC
  const crcData = chunk.slice(4, 8 + length)
  const crc = crc32(crcData)
  view.setUint32(8 + length, crc)

  return chunk
}

// CRC32 calculation
function crc32(data) {
  const crcTable = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    crcTable[i] = c
  }

  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Helper to add text chunk to PNG
function addTextChunkToPng(pngBase64, keyword, value) {
  const keywordBytes = new TextEncoder().encode(keyword)
  const valueBytes = new TextEncoder().encode(value)

  const data = new Uint8Array(keywordBytes.length + 1 + valueBytes.length)
  data.set(keywordBytes, 0)
  data[keywordBytes.length] = 0 // Null separator
  data.set(valueBytes, keywordBytes.length + 1)

  const textChunk = createPngChunk('tEXt', data)

  // Insert before IEND
  const pngBuffer = base64ToArrayBuffer(pngBase64)
  const pngBytes = new Uint8Array(pngBuffer)

  // Find IEND position (last 12 bytes)
  const iendPos = pngBytes.length - 12

  const newPng = new Uint8Array(pngBytes.length + textChunk.length)
  newPng.set(pngBytes.slice(0, iendPos), 0)
  newPng.set(textChunk, iendPos)
  newPng.set(pngBytes.slice(iendPos), iendPos + textChunk.length)

  return arrayBufferToBase64(newPng.buffer)
}

function base64ToArrayBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/png;base64,/, '')
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

describe('pngMetadataEditor.js', () => {
  let minimalPng
  let pngWithMetadata

  beforeEach(() => {
    minimalPng = createMinimalPng()
    pngWithMetadata = addTextChunkToPng(minimalPng, 'Title', 'Test Image')
    pngWithMetadata = addTextChunkToPng(pngWithMetadata, 'Author', 'Test Author')
  })

  describe('loadPngMetadata', () => {
    it('should load metadata from PNG with text chunks', async () => {
      const metadata = await loadPngMetadata(pngWithMetadata)

      expect(metadata).toBeDefined()
      expect(metadata.Description).toBeDefined()
      expect(metadata.Description.fields).toBeDefined()

      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField).toBeDefined()
      expect(titleField.value).toBe('Test Image')
      expect(titleField.isPopulated).toBe(true)
    })

    it('should handle PNG without metadata', async () => {
      const metadata = await loadPngMetadata(minimalPng)

      expect(metadata).toBeDefined()
      // Should still have sections with standard fields
      expect(Object.keys(metadata).length).toBeGreaterThan(0)
    })

    it('should organize metadata by sections', async () => {
      const metadata = await loadPngMetadata(pngWithMetadata)

      // Check that sections are present
      expect(metadata.Description).toBeDefined()
      expect(metadata.Author).toBeDefined()

      // Check section structure (uses "label" not "name")
      expect(metadata.Description.label).toBe('Description')
      expect(metadata.Description.icon).toBeDefined()
      expect(metadata.Description.fields).toBeInstanceOf(Array)
    })

    it('should mark populated fields correctly', async () => {
      const metadata = await loadPngMetadata(pngWithMetadata)

      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.isPopulated).toBe(true)

      // Find an unpopulated field
      const emptyField = metadata.Description.fields.find(f => !f.isPopulated)
      expect(emptyField).toBeDefined()
      expect(emptyField.value).toBe('')
    })

    it('should throw error for invalid PNG data', async () => {
      const invalidPng = 'invalid-base64-data'

      await expect(loadPngMetadata(invalidPng)).rejects.toThrow()
    })

    it('should handle data URI prefix', async () => {
      const dataUri = 'data:image/png;base64,' + pngWithMetadata
      const metadata = await loadPngMetadata(dataUri)

      expect(metadata).toBeDefined()
    })

    it('should include field metadata (icons, descriptions, editability)', async () => {
      const metadata = await loadPngMetadata(pngWithMetadata)

      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.icon).toBeDefined()
      expect(titleField.description).toBeDefined()
      expect(titleField.editable).toBe(true)
      expect(titleField.label).toBe('Title')
    })
  })

  describe('getPngMetadataStats', () => {
    it('should calculate statistics for metadata', async () => {
      const metadata = await loadPngMetadata(pngWithMetadata)
      const stats = getPngMetadataStats(metadata)

      expect(stats.totalFields).toBeGreaterThan(0)
      // exifr may extract IHDR fields (width, height, etc.) as metadata
      // So we check that populated fields includes at least our 2 text chunks
      expect(stats.populatedFields).toBeGreaterThanOrEqual(2)
      expect(stats.sections).toBeGreaterThan(0)
    })

    it('should handle empty metadata', () => {
      const stats = getPngMetadataStats(null)

      expect(stats.totalFields).toBe(0)
      expect(stats.populatedFields).toBe(0)
      expect(stats.sections).toBe(0)
    })

    it('should count sections correctly', async () => {
      const metadata = await loadPngMetadata(pngWithMetadata)
      const stats = getPngMetadataStats(metadata)

      const actualSections = Object.keys(metadata).length
      expect(stats.sections).toBe(actualSections)
    })
  })

  describe('editPngMetadataField', () => {
    it('should edit existing metadata field', async () => {
      const field = {
        key: 'Title',
        label: 'Title',
        value: 'Test Image'
      }

      const newValue = 'Updated Title'
      const updatedPng = await editPngMetadataField(pngWithMetadata, field, newValue)

      expect(updatedPng).toBeDefined()
      expect(typeof updatedPng).toBe('string')

      // Verify the change
      const metadata = await loadPngMetadata(updatedPng)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.value).toBe(newValue)
    })

    it('should add new metadata field if not present', async () => {
      const field = {
        key: 'Description',
        label: 'Description',
        value: ''
      }

      const newValue = 'This is a test image'
      const updatedPng = await editPngMetadataField(minimalPng, field, newValue)

      const metadata = await loadPngMetadata(updatedPng)
      const descField = metadata.Description.fields.find(f => f.key === 'Description')
      expect(descField.value).toBe(newValue)
      expect(descField.isPopulated).toBe(true)
    })

    it('should handle empty string as value', async () => {
      const field = {
        key: 'Title',
        label: 'Title',
        value: 'Test Image'
      }

      const updatedPng = await editPngMetadataField(pngWithMetadata, field, '')

      const metadata = await loadPngMetadata(updatedPng)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.value).toBe('')
    })

    it('should preserve other metadata fields', async () => {
      const field = {
        key: 'Title',
        label: 'Title',
        value: 'Test Image'
      }

      const updatedPng = await editPngMetadataField(pngWithMetadata, field, 'New Title')

      const metadata = await loadPngMetadata(updatedPng)
      const authorField = metadata.Author.fields.find(f => f.key === 'Author')
      expect(authorField.value).toBe('Test Author')
    })

    it('should handle special characters in values', async () => {
      const field = {
        key: 'Description',
        label: 'Description'
      }

      const specialValue = 'Test with 特殊字符 and émojis 🎨'
      const updatedPng = await editPngMetadataField(minimalPng, field, specialValue)

      const metadata = await loadPngMetadata(updatedPng)
      const descField = metadata.Description.fields.find(f => f.key === 'Description')
      expect(descField.value).toBe(specialValue)
    })
  })

  describe('removePngMetadataField', () => {
    it('should remove existing metadata field', async () => {
      const field = {
        key: 'Title',
        label: 'Title'
      }

      const updatedPng = await removePngMetadataField(pngWithMetadata, field)

      const metadata = await loadPngMetadata(updatedPng)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')

      // Field should still exist in structure but be unpopulated
      expect(titleField).toBeDefined()
      expect(titleField.isPopulated).toBe(false)
      expect(titleField.value).toBe('')
    })

    it('should preserve other metadata fields', async () => {
      const field = {
        key: 'Title',
        label: 'Title'
      }

      const updatedPng = await removePngMetadataField(pngWithMetadata, field)

      const metadata = await loadPngMetadata(updatedPng)
      const authorField = metadata.Author.fields.find(f => f.key === 'Author')
      expect(authorField.value).toBe('Test Author')
      expect(authorField.isPopulated).toBe(true)
    })

    it('should handle removing non-existent field gracefully', async () => {
      const field = {
        key: 'NonExistent',
        label: 'Non Existent'
      }

      const updatedPng = await removePngMetadataField(pngWithMetadata, field)

      expect(updatedPng).toBeDefined()

      // Original metadata should be intact
      const metadata = await loadPngMetadata(updatedPng)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.value).toBe('Test Image')
    })
  })

  describe('removeAllPngMetadata', () => {
    it('should remove all text metadata chunks', async () => {
      const cleanedPng = await removeAllPngMetadata(pngWithMetadata)

      const metadata = await loadPngMetadata(cleanedPng)

      // Verify that our text chunks (Title, Author) are gone
      const titleField = metadata.Description?.fields.find(f => f.key === 'Title')
      const authorField = metadata.Author?.fields.find(f => f.key === 'Author')

      expect(titleField?.isPopulated || false).toBe(false)
      expect(authorField?.isPopulated || false).toBe(false)
    })

    it('should preserve image data', async () => {
      const cleanedPng = await removeAllPngMetadata(pngWithMetadata)

      // Should still be a valid PNG
      const metadata = await loadPngMetadata(cleanedPng)
      expect(metadata).toBeDefined()
    })

    it('should handle PNG without metadata', async () => {
      const cleanedPng = await removeAllPngMetadata(minimalPng)

      expect(cleanedPng).toBeDefined()

      const metadata = await loadPngMetadata(cleanedPng)

      // Verify no text chunks are populated
      const allFields = Object.values(metadata).flatMap(section => section.fields)
      const textChunks = allFields.filter(f =>
        ['Title', 'Author', 'Description', 'Comment'].includes(f.key)
      )
      const populatedTextChunks = textChunks.filter(f => f.isPopulated)

      expect(populatedTextChunks.length).toBe(0)
    })
  })

  describe('addCustomPngField', () => {
    it('should add custom field to PNG', async () => {
      const keyword = 'CustomField'
      const value = 'Custom Value'

      const updatedPng = await addCustomPngField(minimalPng, keyword, value)

      const metadata = await loadPngMetadata(updatedPng)

      // Find the custom field (should be in Custom section)
      let customField = null
      Object.values(metadata).forEach(section => {
        const field = section.fields.find(f => f.key === keyword)
        if (field) customField = field
      })

      expect(customField).toBeDefined()
      expect(customField.value).toBe(value)
      expect(customField.isPopulated).toBe(true)
    })

    it('should preserve existing metadata', async () => {
      const updatedPng = await addCustomPngField(pngWithMetadata, 'Custom', 'Value')

      const metadata = await loadPngMetadata(updatedPng)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.value).toBe('Test Image')
    })

    it('should handle special characters in custom values', async () => {
      const keyword = 'SpecialTest'
      const value = 'Unicode: 日本語, Emoji: 🎨, Symbols: @#$%'

      const updatedPng = await addCustomPngField(minimalPng, keyword, value)

      const metadata = await loadPngMetadata(updatedPng)
      let customField = null
      Object.values(metadata).forEach(section => {
        const field = section.fields.find(f => f.key === keyword)
        if (field) customField = field
      })

      expect(customField.value).toBe(value)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long field values', async () => {
      const longValue = 'A'.repeat(10000)
      const field = { key: 'Description', label: 'Description' }

      const updatedPng = await editPngMetadataField(minimalPng, field, longValue)

      const metadata = await loadPngMetadata(updatedPng)
      const descField = metadata.Description.fields.find(f => f.key === 'Description')
      expect(descField.value).toBe(longValue)
    })

    it('should handle multiple edit operations in sequence', async () => {
      let png = minimalPng

      // Add Title
      png = await editPngMetadataField(png, { key: 'Title' }, 'First Title')

      // Add Author
      png = await editPngMetadataField(png, { key: 'Author' }, 'First Author')

      // Update Title
      png = await editPngMetadataField(png, { key: 'Title' }, 'Updated Title')

      // Verify
      const metadata = await loadPngMetadata(png)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      const authorField = metadata.Author.fields.find(f => f.key === 'Author')

      expect(titleField.value).toBe('Updated Title')
      expect(authorField.value).toBe('First Author')
    })

    it('should handle rapid add/remove operations', async () => {
      let png = minimalPng

      // Add field
      png = await editPngMetadataField(png, { key: 'Title' }, 'Test')

      // Remove field
      png = await removePngMetadataField(png, { key: 'Title' })

      // Add again
      png = await editPngMetadataField(png, { key: 'Title' }, 'Test Again')

      const metadata = await loadPngMetadata(png)
      const titleField = metadata.Description.fields.find(f => f.key === 'Title')
      expect(titleField.value).toBe('Test Again')
    })
  })
})
