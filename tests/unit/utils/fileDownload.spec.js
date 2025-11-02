import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadFile } from '@/utils/fileDownload'

describe('fileDownload', () => {
  let createElementSpy
  let createObjectURLSpy
  let revokeObjectURLSpy
  let mockAnchor

  beforeEach(() => {
    // Mock anchor element
    mockAnchor = {
      style: {},
      click: vi.fn(),
      remove: vi.fn(),
      href: '',
      download: ''
    }

    // Spy on document.createElement
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)

    // Spy on URL methods
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url-123')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')

    // Spy on document.body methods
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('downloadFile', () => {
    it('should create a blob with correct data', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      const fileName = 'test.txt'

      downloadFile(data, fileName)

      // Verify blob was created (called in the function)
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
    })

    it('should create an anchor element and trigger download', () => {
      const data = new Uint8Array([1, 2, 3])
      const fileName = 'test.bin'

      downloadFile(data, fileName)

      // Verify anchor element was created
      expect(createElementSpy).toHaveBeenCalledWith('a')

      // Verify anchor was configured correctly
      expect(mockAnchor.style.display).toBe('none')
      expect(mockAnchor.href).toBe('blob:mock-url-123')
      expect(mockAnchor.download).toBe(fileName)

      // Verify click was triggered
      expect(mockAnchor.click).toHaveBeenCalledTimes(1)
    })

    it('should append anchor to body and remove it after download', () => {
      const data = new Uint8Array([1, 2, 3])
      const fileName = 'test.bin'

      downloadFile(data, fileName)

      // Verify anchor was appended to body
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor)

      // Verify anchor was removed after download
      expect(mockAnchor.remove).toHaveBeenCalledTimes(1)
    })

    it('should revoke object URL after download', () => {
      const data = new Uint8Array([1, 2, 3])
      const fileName = 'test.bin'

      downloadFile(data, fileName)

      // Verify URL was revoked with the correct blob URL
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url-123')
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle Blob input', () => {
      const blob = new Blob(['Hello World'], { type: 'text/plain' })
      const fileName = 'hello.txt'

      downloadFile(blob, fileName)

      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toBe(fileName)
    })

    it('should handle Uint8Array input', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111])
      const fileName = 'data.bin'

      downloadFile(data, fileName)

      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toBe(fileName)
    })

    it('should handle file names with special characters', () => {
      const data = new Uint8Array([1, 2, 3])
      const fileName = 'test file (2024-01-01) #1.txt'

      downloadFile(data, fileName)

      expect(mockAnchor.download).toBe(fileName)
    })

    it('should handle file names with extensions', () => {
      const testCases = [
        'document.pdf',
        'image.png',
        'archive.tar.gz',
        'data.json'
      ]

      testCases.forEach(fileName => {
        downloadFile(new Uint8Array([1]), fileName)
        expect(mockAnchor.download).toBe(fileName)
      })
    })

    it('should handle empty data', () => {
      const data = new Uint8Array([])
      const fileName = 'empty.bin'

      downloadFile(data, fileName)

      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toBe(fileName)
    })

    it('should handle large binary data', () => {
      const largeData = new Uint8Array(1024 * 1024) // 1MB
      const fileName = 'large-file.bin'

      downloadFile(largeData, fileName)

      expect(mockAnchor.click).toHaveBeenCalled()
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })

    it('should create blob with application/octet-stream type', () => {
      // We need to spy on Blob constructor to verify the type
      const originalBlob = global.Blob
      const BlobSpy = vi.fn(function(parts, options) {
        return new originalBlob(parts, options)
      })
      global.Blob = BlobSpy

      const data = new Uint8Array([1, 2, 3])
      downloadFile(data, 'test.bin')

      expect(BlobSpy).toHaveBeenCalledWith(
        [data],
        { type: 'application/octet-stream' }
      )

      global.Blob = originalBlob
    })

    it('should execute operations in correct order', () => {
      const data = new Uint8Array([1, 2, 3])
      const fileName = 'test.bin'

      const callOrder = []

      createElementSpy.mockImplementation(() => {
        callOrder.push('createElement')
        return mockAnchor
      })

      document.body.appendChild = vi.fn(() => {
        callOrder.push('appendChild')
      })

      createObjectURLSpy.mockImplementation(() => {
        callOrder.push('createObjectURL')
        return 'blob:test'
      })

      mockAnchor.click = vi.fn(() => {
        callOrder.push('click')
      })

      revokeObjectURLSpy.mockImplementation(() => {
        callOrder.push('revokeObjectURL')
      })

      mockAnchor.remove = vi.fn(() => {
        callOrder.push('remove')
      })

      downloadFile(data, fileName)

      expect(callOrder).toEqual([
        'createElement',
        'appendChild',
        'createObjectURL',
        'click',
        'revokeObjectURL',
        'remove'
      ])
    })
  })
})
