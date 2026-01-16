import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useHexViewer } from '@/composables/useHexViewer'

// Mock dependencies
vi.mock('@/utils/hexFormatter', () => ({
  formatHexRow: vi.fn((bytes, offset, bytesPerRow, useHex) => ({
    offset: useHex ? offset.toString(16).padStart(8, '0') : offset.toString().padStart(8, '0'),
    hex: Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
    ascii: Array.from(bytes).map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : '.').join('')
  }))
}))

vi.mock('@/utils/byteConverter', () => ({
  interpretBytes: vi.fn((bytes) => {
    if (!bytes) return { int8: null, uint8: null, hex: '' }
    return {
      int8: bytes[0] > 127 ? bytes[0] - 256 : bytes[0],
      uint8: bytes[0],
      hex: bytes[0].toString(16).padStart(2, '0')
    }
  })
}))

// Note: searchMatches and currentMatchIndex are internal state not exposed
// Tests for search functionality must use the exposed API: hasSearchMatches, searchMatchInfo

describe('useHexViewer', () => {
  let hexViewer

  beforeEach(() => {
    hexViewer = useHexViewer()

    // Mock document methods for exportSelection
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn()
        }
      }
      return document.createElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(hexViewer.fileData.value).toBeNull()
      expect(hexViewer.fileName.value).toBe('')
      expect(hexViewer.fileSize.value).toBe(0)
      expect(hexViewer.isLoading.value).toBe(false)
      expect(hexViewer.useHexOffset.value).toBe(true)
      expect(hexViewer.selectedByteStart.value).toBeNull()
      expect(hexViewer.selectedByteEnd.value).toBeNull()
      expect(hexViewer.searchQuery.value).toBe('')
    })

    it('should accept custom bytesPerRow', () => {
      const customViewer = useHexViewer(32)
      customViewer.fileData.value = new Uint8Array(64)

      expect(customViewer.totalRows.value).toBe(2) // 64 / 32
    })
  })

  describe('totalRows', () => {
    it('should return 0 when no file data', () => {
      expect(hexViewer.totalRows.value).toBe(0)
    })

    it('should calculate rows based on file size and bytes per row', () => {
      hexViewer.fileData.value = new Uint8Array(100)

      // Default 16 bytes per row: ceil(100/16) = 7
      expect(hexViewer.totalRows.value).toBe(7)
    })

    it('should handle exact multiples', () => {
      hexViewer.fileData.value = new Uint8Array(32)

      expect(hexViewer.totalRows.value).toBe(2)
    })
  })

  describe('hasSelection', () => {
    it('should return false when no selection', () => {
      expect(hexViewer.hasSelection.value).toBe(false)
    })

    it('should return true when bytes are selected', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100
      hexViewer.selectedByteStart.value = 0
      hexViewer.selectedByteEnd.value = 10

      expect(hexViewer.hasSelection.value).toBe(true)
    })

    it('should return false when only start is set', () => {
      hexViewer.selectedByteStart.value = 0
      hexViewer.selectedByteEnd.value = null

      expect(hexViewer.hasSelection.value).toBe(false)
    })
  })

  describe('selectedBytes', () => {
    it('should return null when no selection', () => {
      expect(hexViewer.selectedBytes.value).toBeNull()
    })

    it('should return selected byte range', () => {
      hexViewer.fileData.value = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      hexViewer.selectedByteStart.value = 2
      hexViewer.selectedByteEnd.value = 5

      const selected = hexViewer.selectedBytes.value

      expect([...selected]).toEqual([2, 3, 4, 5])
    })

    it('should handle reversed selection (end before start)', () => {
      hexViewer.fileData.value = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      hexViewer.selectedByteStart.value = 5
      hexViewer.selectedByteEnd.value = 2

      const selected = hexViewer.selectedBytes.value

      expect([...selected]).toEqual([2, 3, 4, 5])
    })

    it('should handle single byte selection', () => {
      hexViewer.fileData.value = new Uint8Array([0, 1, 2, 3, 4])
      hexViewer.selectedByteStart.value = 2
      hexViewer.selectedByteEnd.value = 2

      const selected = hexViewer.selectedBytes.value

      expect([...selected]).toEqual([2])
    })
  })

  describe('byteInterpretation', () => {
    it('should return interpretation of selected bytes', () => {
      hexViewer.fileData.value = new Uint8Array([65, 66, 67])
      hexViewer.selectedByteStart.value = 0
      hexViewer.selectedByteEnd.value = 0

      const interpretation = hexViewer.byteInterpretation.value

      expect(interpretation).toBeDefined()
      expect(interpretation.uint8).toBe(65)
    })

    it('should handle no selection', () => {
      const interpretation = hexViewer.byteInterpretation.value

      expect(interpretation.int8).toBeNull()
    })
  })

  describe('loadFile', () => {
    it('should load file data', async () => {
      const mockFile = new File(['test content'], 'test.bin', { type: 'application/octet-stream' })

      await hexViewer.loadFile(mockFile)

      expect(hexViewer.fileData.value).toBeInstanceOf(Uint8Array)
      expect(hexViewer.fileName.value).toBe('test.bin')
      expect(hexViewer.fileSize.value).toBe(12) // 'test content'.length
    })

    it('should set loading state', async () => {
      const mockFile = new File(['test'], 'test.bin')

      // Check loading state transitions
      expect(hexViewer.isLoading.value).toBe(false)

      const loadPromise = hexViewer.loadFile(mockFile)

      // Loading should be true during load
      // Note: This might be too fast to catch

      await loadPromise

      expect(hexViewer.isLoading.value).toBe(false)
    })

    it('should clear selection when loading new file', async () => {
      hexViewer.selectedByteStart.value = 10
      hexViewer.selectedByteEnd.value = 20

      const mockFile = new File(['test'], 'test.bin')
      await hexViewer.loadFile(mockFile)

      expect(hexViewer.selectedByteStart.value).toBeNull()
      expect(hexViewer.selectedByteEnd.value).toBeNull()
    })

    it('should clear search when loading new file', async () => {
      // First load a file and perform a search
      const encoder = new TextEncoder()
      const mockFile1 = new File([encoder.encode('test test test')], 'test1.bin')
      await hexViewer.loadFile(mockFile1)
      hexViewer.searchText('test')

      // Verify search found matches
      expect(hexViewer.hasSearchMatches.value).toBe(true)

      // Load a new file
      const mockFile2 = new File(['new content'], 'test2.bin')
      await hexViewer.loadFile(mockFile2)

      // Search should be cleared
      expect(hexViewer.searchQuery.value).toBe('')
      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })

    it('should handle null file', async () => {
      await hexViewer.loadFile(null)

      expect(hexViewer.fileData.value).toBeNull()
    })
  })

  describe('clearFile', () => {
    it('should clear all file data', async () => {
      const mockFile = new File(['test'], 'test.bin')
      await hexViewer.loadFile(mockFile)

      hexViewer.clearFile()

      expect(hexViewer.fileData.value).toBeNull()
      expect(hexViewer.fileName.value).toBe('')
      expect(hexViewer.fileSize.value).toBe(0)
    })

    it('should clear selection and search', () => {
      hexViewer.selectedByteStart.value = 10
      hexViewer.searchQuery.value = 'test'

      hexViewer.clearFile()

      expect(hexViewer.selectedByteStart.value).toBeNull()
      expect(hexViewer.searchQuery.value).toBe('')
    })
  })

  describe('getRow', () => {
    it('should return formatted row data', () => {
      hexViewer.fileData.value = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80])

      const row = hexViewer.getRow(0)

      expect(row).toBeDefined()
      expect(row.offset).toBeDefined()
      expect(row.hex).toBeDefined()
      expect(row.ascii).toBeDefined()
    })

    it('should return null for invalid row index', () => {
      hexViewer.fileData.value = new Uint8Array(16)

      const row = hexViewer.getRow(100)

      expect(row).toBeNull()
    })

    it('should return null when no file data', () => {
      const row = hexViewer.getRow(0)

      expect(row).toBeNull()
    })
  })

  describe('toggleOffsetFormat', () => {
    it('should toggle between hex and decimal', () => {
      expect(hexViewer.useHexOffset.value).toBe(true)

      hexViewer.toggleOffsetFormat()
      expect(hexViewer.useHexOffset.value).toBe(false)

      hexViewer.toggleOffsetFormat()
      expect(hexViewer.useHexOffset.value).toBe(true)
    })
  })

  describe('selectByte', () => {
    it('should select single byte', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100

      hexViewer.selectByte(50)

      expect(hexViewer.selectedByteStart.value).toBe(50)
      expect(hexViewer.selectedByteEnd.value).toBe(50)
    })

    it('should not select out of range byte', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100

      hexViewer.selectByte(100)

      expect(hexViewer.selectedByteStart.value).toBeNull()
    })

    it('should not select negative offset', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100

      hexViewer.selectByte(-1)

      expect(hexViewer.selectedByteStart.value).toBeNull()
    })
  })

  describe('selectByteRange', () => {
    it('should select byte range', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100

      hexViewer.selectByteRange(10, 20)

      expect(hexViewer.selectedByteStart.value).toBe(10)
      expect(hexViewer.selectedByteEnd.value).toBe(20)
    })

    it('should clamp range to file size', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100

      hexViewer.selectByteRange(-10, 200)

      expect(hexViewer.selectedByteStart.value).toBe(0)
      expect(hexViewer.selectedByteEnd.value).toBe(99)
    })

    it('should not select when no file data', () => {
      hexViewer.selectByteRange(0, 10)

      expect(hexViewer.selectedByteStart.value).toBeNull()
    })
  })

  describe('clearSelection', () => {
    it('should clear byte selection', () => {
      hexViewer.selectedByteStart.value = 10
      hexViewer.selectedByteEnd.value = 20

      hexViewer.clearSelection()

      expect(hexViewer.selectedByteStart.value).toBeNull()
      expect(hexViewer.selectedByteEnd.value).toBeNull()
    })
  })

  describe('searchHexPattern', () => {
    it('should find hex pattern in file', () => {
      hexViewer.fileData.value = new Uint8Array([0xFF, 0xD8, 0xFF, 0x00, 0xFF, 0xD8])

      hexViewer.searchHexPattern('FF D8')

      expect(hexViewer.hasSearchMatches.value).toBe(true)
      expect(hexViewer.searchQuery.value).toBe('FF D8')
      expect(hexViewer.searchMatchInfo.value.total).toBe(2)
    })

    it('should handle single byte pattern', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0xFF, 0x00, 0xFF])

      hexViewer.searchHexPattern('FF')

      expect(hexViewer.hasSearchMatches.value).toBe(true)
      expect(hexViewer.searchMatchInfo.value.total).toBe(2)
    })

    it('should handle pattern not found', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0x01, 0x02, 0x03])

      hexViewer.searchHexPattern('FF')

      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })

    it('should clear search for empty pattern', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0xFF])
      hexViewer.searchHexPattern('FF')
      expect(hexViewer.hasSearchMatches.value).toBe(true)

      hexViewer.searchHexPattern('')

      expect(hexViewer.hasSearchMatches.value).toBe(false)
      expect(hexViewer.searchQuery.value).toBe('')
    })

    it('should handle invalid hex pattern', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0xFF])

      hexViewer.searchHexPattern('ZZ')

      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })

    it('should normalize pattern spacing', () => {
      hexViewer.fileData.value = new Uint8Array([0xFF, 0xD8, 0xFF])

      hexViewer.searchHexPattern('  FF   D8  ')

      expect(hexViewer.hasSearchMatches.value).toBe(true)
      expect(hexViewer.searchMatchInfo.value.total).toBe(1)
    })
  })

  describe('searchText', () => {
    it('should find text pattern in file', () => {
      const encoder = new TextEncoder()
      hexViewer.fileData.value = encoder.encode('Hello World Hello')

      hexViewer.searchText('Hello')

      expect(hexViewer.hasSearchMatches.value).toBe(true)
      expect(hexViewer.searchMatchInfo.value.total).toBe(2)
    })

    it('should handle text not found', () => {
      const encoder = new TextEncoder()
      hexViewer.fileData.value = encoder.encode('Hello World')

      hexViewer.searchText('Goodbye')

      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })

    it('should clear search for empty text', () => {
      hexViewer.searchText('')

      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })
  })

  describe('hasSearchMatches', () => {
    it('should return true when matches exist', () => {
      hexViewer.fileData.value = new Uint8Array([0xFF, 0x00, 0xFF])
      hexViewer.searchHexPattern('FF')

      expect(hexViewer.hasSearchMatches.value).toBe(true)
    })

    it('should return false when no matches', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0x01, 0x02])
      hexViewer.searchHexPattern('FF')

      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })
  })

  describe('searchMatchInfo', () => {
    it('should return match info when matches exist', () => {
      hexViewer.fileData.value = new Uint8Array([0xFF, 0x00, 0xFF, 0x00, 0xFF])
      hexViewer.searchHexPattern('FF')

      const info = hexViewer.searchMatchInfo.value

      expect(info.current).toBe(1) // 1-indexed, starts at first match
      expect(info.total).toBe(3)
      expect(info.offset).toBe(0) // First match at offset 0
    })

    it('should return null when no matches', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0x01])
      hexViewer.searchHexPattern('FF')

      expect(hexViewer.searchMatchInfo.value).toBeNull()
    })
  })

  describe('nextMatch', () => {
    it('should navigate to next match', () => {
      hexViewer.fileData.value = new Uint8Array(100)
      hexViewer.fileSize.value = 100
      // Create data with pattern at known offsets
      hexViewer.fileData.value[5] = 0xFF
      hexViewer.fileData.value[10] = 0xFF
      hexViewer.fileData.value[15] = 0xFF
      hexViewer.searchHexPattern('FF')

      // Initially at first match (index 0)
      expect(hexViewer.searchMatchInfo.value.current).toBe(1)

      hexViewer.nextMatch()

      expect(hexViewer.searchMatchInfo.value.current).toBe(2)
      expect(hexViewer.selectedByteStart.value).toBe(10)
    })

    it('should wrap around to first match', () => {
      hexViewer.fileData.value = new Uint8Array(20)
      hexViewer.fileSize.value = 20
      hexViewer.fileData.value[5] = 0xFF
      hexViewer.fileData.value[10] = 0xFF
      hexViewer.searchHexPattern('FF')

      // Go to second match
      hexViewer.nextMatch()
      expect(hexViewer.searchMatchInfo.value.current).toBe(2)

      // Should wrap to first
      hexViewer.nextMatch()
      expect(hexViewer.searchMatchInfo.value.current).toBe(1)
    })

    it('should return offset', () => {
      hexViewer.fileData.value = new Uint8Array(20)
      hexViewer.fileSize.value = 20
      hexViewer.fileData.value[5] = 0xFF
      hexViewer.fileData.value[10] = 0xFF
      hexViewer.searchHexPattern('FF')

      const offset = hexViewer.nextMatch()

      expect(offset).toBe(10)
    })

    it('should do nothing when no matches', () => {
      hexViewer.fileData.value = new Uint8Array([0x00, 0x01])
      hexViewer.searchHexPattern('FF')

      const result = hexViewer.nextMatch()

      expect(result).toBeUndefined()
    })
  })

  describe('previousMatch', () => {
    it('should navigate to previous match', () => {
      hexViewer.fileData.value = new Uint8Array(20)
      hexViewer.fileSize.value = 20
      hexViewer.fileData.value[5] = 0xFF
      hexViewer.fileData.value[10] = 0xFF
      hexViewer.fileData.value[15] = 0xFF
      hexViewer.searchHexPattern('FF')

      // Move to last match
      hexViewer.nextMatch() // 2nd
      hexViewer.nextMatch() // 3rd
      expect(hexViewer.searchMatchInfo.value.current).toBe(3)

      hexViewer.previousMatch()

      expect(hexViewer.searchMatchInfo.value.current).toBe(2)
    })

    it('should wrap around to last match', () => {
      hexViewer.fileData.value = new Uint8Array(20)
      hexViewer.fileSize.value = 20
      hexViewer.fileData.value[5] = 0xFF
      hexViewer.fileData.value[10] = 0xFF
      hexViewer.fileData.value[15] = 0xFF
      hexViewer.searchHexPattern('FF')

      // At first match
      expect(hexViewer.searchMatchInfo.value.current).toBe(1)

      hexViewer.previousMatch()

      expect(hexViewer.searchMatchInfo.value.current).toBe(3)
    })
  })

  describe('clearSearch', () => {
    it('should clear search state', () => {
      hexViewer.fileData.value = new Uint8Array([0xFF, 0x00, 0xFF])
      hexViewer.searchHexPattern('FF')
      expect(hexViewer.hasSearchMatches.value).toBe(true)

      hexViewer.clearSearch()

      expect(hexViewer.searchQuery.value).toBe('')
      expect(hexViewer.hasSearchMatches.value).toBe(false)
    })
  })

  describe('exportSelection', () => {
    it('should export selected bytes', () => {
      hexViewer.fileData.value = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      hexViewer.selectedByteStart.value = 2
      hexViewer.selectedByteEnd.value = 5

      const blob = hexViewer.exportSelection('export.bin')

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/octet-stream')
    })

    it('should return null when no selection', () => {
      const result = hexViewer.exportSelection('export.bin')

      expect(result).toBeNull()
    })

    it('should use default filename', () => {
      hexViewer.fileData.value = new Uint8Array([0, 1, 2, 3, 4])
      hexViewer.selectedByteStart.value = 0
      hexViewer.selectedByteEnd.value = 2

      const mockLink = { href: '', download: '', click: vi.fn() }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      hexViewer.exportSelection()

      expect(mockLink.download).toBe('selection.bin')
    })
  })
})
